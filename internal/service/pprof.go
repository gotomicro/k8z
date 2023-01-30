package service

import (
	"archive/zip"
	"bytes"
	"context"
	"crypto/md5"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gotomicro/ego/core/econf"
	"github.com/gotomicro/ego/core/elog"
	"github.com/pkg/errors"
	"github.com/spf13/cast"
	torchPprof "github.com/uber-archive/go-torch/pprof"
	"github.com/uber-archive/go-torch/renderer"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"k8z/internal/model/dto"
	"k8z/internal/service/kube"
	"k8z/internal/util"
	"k8z/pkg/storage"
	"k8z/pkg/storage/filesystem"
)

var profileTypes = []string{"block", "goroutine", "heap", "profile"}

const (
	ProfileRunTypePod  = "pod"
	ProfileRunTypeAddr = "ip"
)

var Pprof *pprof

func initPProf() error {
	// check path
	basePath := econf.GetString("storage.filesystem.basePath")
	err := os.MkdirAll(basePath, 0755)
	if err != nil {
		return fmt.Errorf("init pprof check dir failed: %w", err)
	}
	Pprof = &pprof{
		storage: filesystem.NewFilesystemClient(basePath),
	}
	return nil
}

type pprof struct {
	storage storage.Client
}

type PprofInfo struct {
	Type string `json:"type"`
	Url  string `json:"url"`
}

func (p *pprof) PprofDiffGraph(diffReq dto.ReqPProfDiffGraph) (data []byte, err error) {
	ctx := context.TODO()
	baseHash := fmt.Sprintf("%x", md5.Sum([]byte(diffReq.BaseUrl)))
	targetHash := fmt.Sprintf("%x", md5.Sum([]byte(diffReq.TargetUrl)))
	diffPath := fmt.Sprintf("profile-diff/%s_%s", baseHash, targetHash)
	return p.storage.GetBytes(ctx, fmt.Sprintf("%s/%s_%s.svg", diffPath, diffReq.GoType, diffReq.SvgType))
}

func (p *pprof) GenerateDiff(base, target string) (err error) {
	ctx := context.TODO()
	baseHash := fmt.Sprintf("%x", md5.Sum([]byte(base)))
	targetHash := fmt.Sprintf("%x", md5.Sum([]byte(target)))
	diffPath := fmt.Sprintf("profile-diff/%s_%s", baseHash, targetHash)
	svgs, _ := p.storage.List(ctx, diffPath)
	if len(svgs) == 8 {
		return nil
	}
	var eg errgroup.Group
	tmpPath := filepath.Join(os.TempDir(), "pprofdiff", fmt.Sprintf("%s_%s_%d", baseHash, targetHash, time.Now().UnixNano()))
	err = os.MkdirAll(tmpPath, 0777)
	if err != nil {
		return err
	}
	defer os.RemoveAll(tmpPath)
	for _, profileType := range profileTypes {
		profileType := profileType
		eg.Go(func() error {
			baseBin, err := p.storage.GetBytes(ctx, filepath.Join(base, profileType+".bin"))
			if err != nil {
				return err
			}
			targetBin, err := p.storage.GetBytes(ctx, filepath.Join(target, profileType+".bin"))
			if err != nil {
				return err
			}
			tmpBasePath := filepath.Join(tmpPath, profileType+"base.bin")
			err = ioutil.WriteFile(tmpBasePath, baseBin, fs.ModePerm)
			if err != nil {
				return err
			}
			tmpTargetPath := filepath.Join(tmpPath, profileType+"target.bin")
			err = ioutil.WriteFile(tmpTargetPath, targetBin, fs.ModePerm)
			if err != nil {
				return err
			}
			var eg errgroup.Group
			eg.Go(func() error {
				svgData, err := p.generateDiffFlameSvg(tmpBasePath, tmpTargetPath)
				if err != nil {
					return err
				}
				return p.storage.PutBytes(ctx, fmt.Sprintf("%s/%s_%s.svg", diffPath, profileType, "flame"), svgData)
			})
			eg.Go(func() error {
				tmpSvgPath := fmt.Sprintf("%s_%s.svg", profileType, "flame")
				os.Mkdir(filepath.Join(tmpPath, tmpSvgPath), os.ModePerm)
				svgData, err := p.generateDiffProfileSvgData(tmpBasePath, tmpTargetPath, tmpSvgPath)
				if err != nil {
					return err
				}
				return p.storage.PutBytes(ctx, fmt.Sprintf("%s/%s_%s.svg", diffPath, profileType, "profile"), svgData)
			})
			return eg.Wait()
		})
	}
	return eg.Wait()
}

// GeneratePprof 生成PProf图
func (p *pprof) GeneratePprof(reqRunProfile dto.ReqRunProfile) (url string, err error) {
	switch reqRunProfile.Mode {
	case ProfileRunTypePod:
		if reqRunProfile.PodName == "" || reqRunProfile.Cluster == "" {
			err = fmt.Errorf("pod_name or cluster_id cannot be empty")
			return
		}
		var targetClusterManager *kube.ClusterManager
		targetClusterManager, err = kube.GetClusterManager(reqRunProfile.Cluster)
		if err != nil {
			elog.Error("Get clusterManager failed while gen pprof.",
				zap.String("requestClusterId", reqRunProfile.Cluster), zap.Error(err))
			err = fmt.Errorf("target cluster may not exist, please retry")
			return
		}
		reqRunProfile.UniqueKey = fmt.Sprintf("%s/%s/%s_%s/%s_%d",
			reqRunProfile.Cluster, reqRunProfile.Namespace, reqRunProfile.WorkloadKind, reqRunProfile.Workload, reqRunProfile.PodName, time.Now().UnixMilli())
		if reqRunProfile.Port == 0 {
			err = fmt.Errorf("治理端口未设置，请设置治理端口")
			return
		}
		eg := errgroup.Group{}
		for _, _profileType := range profileTypes {
			profileType := _profileType
			eg.Go(func() error {
				params := make(map[string]string)
				if profileType == "profile" {
					params["seconds"] = strconv.Itoa(reqRunProfile.Seconds)
				}

				err = p.generateGraphByK8S(reqRunProfile, targetClusterManager, profileType, params)
				if err != nil {
					return err
				}
				return nil
			})
		}
		err = eg.Wait()
		if err != nil {
			return
		}
		url = reqRunProfile.UniqueKey
		return
	case ProfileRunTypeAddr:
		if reqRunProfile.Addr == "" {
			err = errors.New("addr cannot be empty")
			return
		}
		reqRunProfile.UniqueKey = fmt.Sprintf("custom/%s_%d", reqRunProfile.Addr, time.Now().UnixMilli())
		eg := errgroup.Group{}
		for _, _profileType := range profileTypes {
			profileType := _profileType
			eg.Go(func() error {
				params := make(map[string]string)
				if profileType == "profile" {
					params["seconds"] = strconv.Itoa(reqRunProfile.Seconds)
				}
				elog.Info("pprof", elog.String("profileType", profileType), elog.Any("reqRunProfile", reqRunProfile))
				err = p.generateGraphByAddr(reqRunProfile, profileType, params)
				if err != nil {
					return err
				}
				return nil
			})
		}

		err = eg.Wait()
		if err != nil {
			return
		}
		url = reqRunProfile.UniqueKey
		return
	default:
		err = fmt.Errorf("ProfileRunType (%s) isn't supported currently", reqRunProfile.Mode)
		return
	}

}

func (p *pprof) FindGraphData(req dto.ReqPprofGraph) (data []byte, err error) {
	svgPath := filepath.Join(req.Url, req.GoType+"_"+req.SvgType+".svg")
	// SVG
	switch req.SvgType {
	case "profile":
		fallthrough
	case "flame":
		data, err = p.storage.GetBytes(context.TODO(), svgPath)
	default:
		return nil, fmt.Errorf("no exist svg type: " + req.SvgType)
	}
	return
}

func (p *pprof) DownloadPProfBinData(req dto.ReqPprofDownload) (data []byte, err error) {
	ctx := context.TODO()
	dataPath := req.Url
	list, err := p.storage.List(ctx, dataPath)
	buf := bytes.NewBufferString("")
	zipw := zip.NewWriter(buf)
	for _, item := range list {
		if strings.HasSuffix(item, ".bin") {
			data, err := p.storage.GetBytes(ctx, filepath.Join(dataPath, item))
			if err != nil {
				return nil, err
			}
			err = appendFiles(item, data, zipw)
			if err != nil {
				return nil, err
			}
		}
	}
	if err = zipw.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func appendFiles(filename string, data []byte, zipw *zip.Writer) error {
	wr, err := zipw.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create entry for %s in zip file: %s", filename, err)
	}

	if _, err := io.Copy(wr, bytes.NewReader(data)); err != nil {
		return fmt.Errorf("failed to write %s to zip: %s", filename, err)
	}

	return nil
}

func (p *pprof) GetPprofList(req dto.ReqGetPprofList) (list []dto.RespGetPprofListItem, err error) {
	key := fmt.Sprintf("%s/%s/%s_%s", req.Cluster, req.Namespace, req.WorkloadKind, req.Workload)
	nameList, err := p.storage.List(context.TODO(), key)
	if err != nil {
		return nil, err
	}
	var filterPod = req.Pod != ""
	for _, item := range nameList {
		if filterPod && !strings.HasPrefix(item, req.Pod) {
			continue
		}
		n := strings.LastIndex(item, "_")
		list = append(list, dto.RespGetPprofListItem{
			Url:     fmt.Sprintf("%s/%s", key, item),
			PodName: item[:n],
			Ctime:   cast.ToInt64(item[n+1:]) / 1e3,
		})
	}
	return
}

func (p *pprof) CheckDependencies() (err error) {
	var des util.DepErrors
	// 1 check go version
	if _, err = exec.Command("go", "version").Output(); err != nil {
		des = append(des, util.DepError{
			Dependency: "go",
			Refer:      "https://go.dev/dl/",
		})
	}
	// 2 check dot -v, graphiz
	if _, err = exec.Command("dot", "-v").Output(); err != nil {
		des = append(des, util.DepError{
			Dependency: "graphviz",
			Refer:      "https://graphviz.org/download/",
		})
	}
	if len(des) > 0 {
		return des
	}
	return nil
}

func (p *pprof) generateGraphByAddr(reqRunProfile dto.ReqRunProfile, pprofResName string, params map[string]string) (err error) {
	targetUrl := fmt.Sprintf("%s/debug/pprof/%s", reqRunProfile.Addr, pprofResName)
	if pprofResName == "fgprof" {
		targetUrl = fmt.Sprintf("%s/debug/%s", reqRunProfile.Addr, pprofResName)
	}
	if !strings.HasPrefix(targetUrl, "http://") || !strings.HasPrefix(targetUrl, "https://") ||
		!strings.HasPrefix(targetUrl, "/") || !strings.HasPrefix(targetUrl, "//") {
		targetUrl = "http://" + targetUrl
	}
	timeout := 5 * time.Second
	if _, exist := params["seconds"]; exist {
		if secs, err := strconv.Atoi(params["seconds"]); err == nil && secs > 0 {
			timeout = time.Duration(secs+5) * time.Second
		}
	}
	c := &http.Client{Timeout: timeout} // default timeout 5s
	elog.Info("pprof", elog.String("targetUrl", targetUrl), elog.String("pprofResName", pprofResName), zap.Duration("timeout", timeout))

	req, err := http.NewRequest("GET", targetUrl, nil)
	if err != nil {
		return err
	}
	q := req.URL.Query()
	for key, val := range params {
		q.Set(key, val)
	}
	req.URL.RawQuery = q.Encode()
	res, err := c.Do(req)
	if err != nil {
		err = errors.Wrapf(err, "请求地址(%s)获取 %s profile 数据失败. err=%s", targetUrl, pprofResName, err.Error())
		return
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		err = errors.Errorf("请求地址(%s)获取 %s profile 数据失败: statusCode is %d", targetUrl, pprofResName, res.StatusCode)
		return
	}

	rawProfileData, err := ioutil.ReadAll(res.Body)
	if err != nil {
		err = errors.Wrapf(err, "请求地址(%s)获取 %s profile response数据失败. err=%s", targetUrl, pprofResName, err.Error())
		return
	}

	err = p.genSvg(rawProfileData, reqRunProfile.UniqueKey, pprofResName)
	if err != nil {
		err = fmt.Errorf("generateGraphByAddr err: %w", err)
		return
	}
	return
}

func (p *pprof) generateGraphByK8S(reqRunProfile dto.ReqRunProfile, clusterManager *kube.ClusterManager,
	pprofResName string, params map[string]string) (err error) {

	resourceName := fmt.Sprintf("%s:%d", reqRunProfile.PodName, reqRunProfile.Port)
	suffix := "debug/pprof/" + pprofResName
	if pprofResName == "fgprof" {
		suffix = "debug/" + pprofResName
	}
	elog.Info("pprof", elog.String("suffix", suffix))
	req := clusterManager.Client.CoreV1().RESTClient().
		Get().
		Namespace(reqRunProfile.Namespace).
		Resource("pods").
		Name(resourceName).
		SubResource("proxy").
		Suffix(suffix)

	for key, val := range params {
		req = req.Param(key, val)
	}

	res := req.Do(context.Background())
	err = res.Error()
	if err != nil {
		err = errors.Wrapf(err, "请求治理端口获取 %s profile 数据失败. err=%s", pprofResName, err.Error())
		return
	}
	rawProfileData, _ := res.Raw()
	err = p.genSvg(rawProfileData, reqRunProfile.UniqueKey, pprofResName)
	if err != nil {
		err = fmt.Errorf("generateGraphByK8S err: %w", err)
		return
	}
	return
}

func (p *pprof) genSvg(rawProfileData []byte, uniqueKey string, pprofType string) (err error) {
	tmpFileDir := filepath.Join(os.TempDir(), uniqueKey)
	err = os.MkdirAll(tmpFileDir, os.ModePerm)
	if err != nil {
		err = errors.Wrap(err, "创建临时目录失败")
		return
	}

	rawStorePath := path.Join(tmpFileDir, pprofType+".bin")
	err = ioutil.WriteFile(rawStorePath, rawProfileData, os.ModePerm)
	if err != nil {
		err = errors.Wrap(err, "临时文件写入失败")
		return
	}
	// 保存 bin 文件
	err = p.storage.PutBytes(context.TODO(), filepath.Join(uniqueKey, pprofType+".bin"), rawProfileData)
	if err != nil {
		err = errors.Wrap(err, "临时文件保存失败")
		return
	}

	var (
		flameSvgByte   []byte
		profileSvgByte []byte
	)

	// 生成火焰图 SVG
	flameSvgByte, err = p.generateFlameSvg(rawStorePath)
	if err != nil {
		err = fmt.Errorf("生成火焰图失败, %w", err)
		return
	}

	err = p.storage.PutBytes(context.TODO(), filepath.Join(uniqueKey, pprofType+"_flame.svg"), flameSvgByte)
	if err != nil {
		err = fmt.Errorf("保存火焰图失败: %w", err)
		return
	}

	// 生成Profile SVG
	profileSvgPath := path.Join(tmpFileDir, pprofType+"_profile.svg")
	profileSvgByte, err = p.generateProfileSvg(rawStorePath, profileSvgPath)
	if err != nil {
		err = fmt.Errorf("生成Profile图失败, %w", err)
		return
	}

	err = p.storage.PutBytes(context.TODO(), filepath.Join(uniqueKey, pprofType+"_profile.svg"), profileSvgByte)
	if err != nil {
		err = fmt.Errorf("保存 Profile 图失败: %w", err)
	}
	return nil
}

// 生成火焰图SVG
func (p *pprof) generateFlameSvg(rawFilePath string) (data []byte, err error) {
	out, err := exec.Command("bash", "-c", "go tool pprof -raw "+rawFilePath).Output()
	if err != nil {
		return nil, fmt.Errorf("go tool pprof -raw err: %v", err)
	}

	profile, err := torchPprof.ParseRaw(out)
	if err != nil {
		return nil, fmt.Errorf("could not parse raw pprof output: %v", err)
	}

	sampleIndex := torchPprof.SelectSample([]string{}, profile.SampleNames)
	flameInput, err := renderer.ToFlameInput(profile, sampleIndex)
	if err != nil {
		return nil, fmt.Errorf("could not convert stacks to flamegraph input: %v", err)
	}
	if len(flameInput) == 0 {
		return []byte{}, nil
	}

	data, err = renderer.GenerateFlameGraph(flameInput)
	if err != nil {
		elog.Error("flame graph err", zap.Error(err), zap.Any("flameInput", flameInput))
		return nil, fmt.Errorf("could not generate flame graph: %v", err)
	}

	return
}

// 生成火焰图SVG
func (p *pprof) generateDiffFlameSvg(baseRawPath, targetRawPath string) (data []byte, err error) {
	out, err := exec.Command("bash", "-c", fmt.Sprintf("go tool pprof --base %s -raw %s", baseRawPath, targetRawPath)).Output()
	if err != nil {
		return nil, fmt.Errorf("go tool pprof -raw err: %v", err)
	}
	profile, err := torchPprof.ParseRaw(out)
	if err != nil {
		return nil, fmt.Errorf("could not parse raw pprof output: %v", err)
	}
	sampleIndex := torchPprof.SelectSample([]string{}, profile.SampleNames)
	flameInput, err := renderer.ToFlameInput(profile, sampleIndex)
	if err != nil {
		return nil, fmt.Errorf("could not convert stacks to flamegraph input: %v", err)
	}
	if len(flameInput) == 0 {
		return []byte{}, nil
	}
	data, err = renderer.GenerateFlameGraph(flameInput)
	if err != nil {
		elog.Error("flame graph err", zap.Error(err), zap.Any("flameInput", flameInput))
		return nil, fmt.Errorf("could not generate flame graph: %v", err)
	}
	return
}

func (p *pprof) generateProfileSvg(rawFilePath, svgFilePath string) (data []byte, err error) {
	_, err = exec.Command("bash", "-c", fmt.Sprintf("go tool pprof -svg %s > %s", rawFilePath, svgFilePath)).Output()
	if err != nil {
		return nil, fmt.Errorf("profile svg 生成失败: %v", err)
	}

	data, err = ioutil.ReadFile(svgFilePath)
	if err != nil {
		return nil, errors.Wrap(err, "读取Profile SVG文件失败")
	}

	return
}

func (p *pprof) generateDiffProfileSvgData(baseRawFilePath, targetRawFilePath string, tmpSvgPath string) (data []byte, err error) {
	_, err = exec.Command("bash", "-c", fmt.Sprintf("go tool pprof --base %s -svg %s > %s", baseRawFilePath, targetRawFilePath, tmpSvgPath)).Output()
	if err != nil {
		return nil, fmt.Errorf("profile svg 生成失败: %v", err)
	}
	data, err = ioutil.ReadFile(tmpSvgPath)
	if err != nil {
		return nil, errors.Wrap(err, "读取Profile SVG文件失败")
	}
	return
}

func getPprofUrl(profileType, UniqueKey, svgType string) string {
	return fmt.Sprintf(econf.GetString("app.rootURL")+"/graph?goType=%s&url=%s&svgType=%s", profileType, UniqueKey, svgType)
}
