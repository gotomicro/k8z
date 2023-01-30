package kube

import (
	"archive/tar"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/gotomicro/ego/core/elog"
	jsoniter "github.com/json-iterator/go"
	"go.uber.org/zap"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/tools/remotecommand"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"
	clientcmdlatest "k8s.io/client-go/tools/clientcmd/api/latest"
	clientcmdapiv1 "k8s.io/client-go/tools/clientcmd/api/v1"
	utilexec "k8s.io/client-go/util/exec"

	"k8z/internal/invoker"
	"k8z/internal/model/dao"
	"k8z/internal/util"
)

const (
	// High enough QPS to fit all expected use cases.
	defaultQPS = 1e6
	// High enough Burst to fit all expected use cases.
	defaultBurst = 1e6
	// full resyc cache resource time
	defaultResyncPeriod = 30 * time.Second
)

var (
	clusterManagerSets = &sync.Map{} // dbClusterId [uint] -> *ClusterManager
	currentManagerSet  *ClusterManager
)

type ClusterManager struct {
	Cluster      *Cluster
	Client       *kubernetes.Clientset
	KubeClient   ResourceHandler
	Config       *rest.Config
	CacheFactory *CacheFactory
}

func (w *NopWriter) Write(p []byte) (n int, err error) {
	return len(p), nil
}

type NopWriter struct {
}

func (w *Writer) Write(p []byte) (n int, err error) {
	str := string(p)
	if len(str) > 0 {
		w.Output += str
	}
	return len(str), nil
}

type Writer struct {
	Output string
}

type ExecCommandRequest struct {
	Namespace     string
	PodName       string
	ContainerName string
	Command       []string
	StdIn         io.Reader
	StdOut        io.Writer
	StdErr        io.Writer
	TTY           bool
	Timeout       time.Duration
}

type UploadFileRequest struct {
	SrcContent    []byte
	Filename      string
	DstDir        string
	Namespace     string
	PodName       string
	ContainerName string
}

type UploadFileStreamRequest struct {
	SrcFile       io.ReadCloser
	Filename      string
	DstDir        string
	Namespace     string
	PodName       string
	ContainerName string
}

type DownloadFileRequest struct {
	SrcPaths      []string
	Namespace     string
	PodName       string
	ContainerName string
}

func (cm ClusterManager) PodUploadFile(req UploadFileRequest) error {
	stdOut := new(Writer)
	stdErr := new(Writer)

	var buf bytes.Buffer
	tw := tar.NewWriter(&buf)
	hdr := &tar.Header{
		Name: req.Filename,
		Mode: 0755,
		Size: int64(len(req.SrcContent)),
	}
	if err := tw.WriteHeader(hdr); err != nil {
		return err
	}
	if _, err := tw.Write(req.SrcContent); err != nil {
		return err
	}
	if err := tw.Close(); err != nil {
		return err
	}
	stdIn := bytes.NewReader(buf.Bytes())
	tarCmd := []string{"tar", "-xf", "-"}
	if len(req.DstDir) > 0 {
		tarCmd = append(tarCmd, "-C", req.DstDir)
	}
	execTarRequest := ExecCommandRequest{
		Namespace:     req.Namespace,
		PodName:       req.PodName,
		ContainerName: req.ContainerName,
		Command:       tarCmd,
		StdIn:         stdIn,
		StdOut:        stdOut,
		StdErr:        stdErr,
	}
	exitCode, err := cm.PodExecuteCommand(execTarRequest)
	if exitCode != 0 {
		err = fmt.Errorf("upload file error: %s", stdErr.Output)
	}
	return err
}

func (cm ClusterManager) PodUploadFileStream(req UploadFileStreamRequest) error {
	stdOut := new(Writer)
	stdErr := new(Writer)
	catCmd := []string{"cat", "-", ">", filepath.Join(req.DstDir, req.Filename)}
	execTarRequest := ExecCommandRequest{
		Namespace:     req.Namespace,
		PodName:       req.PodName,
		ContainerName: req.ContainerName,
		Command:       []string{"sh", "-c", strings.Join(catCmd, " ")},
		StdIn:         req.SrcFile,
		StdOut:        stdOut,
		StdErr:        stdErr,
	}
	exitCode, err := cm.PodExecuteCommand(execTarRequest)
	if exitCode != 0 {
		err = fmt.Errorf("upload file error: %s", stdErr.Output)
	}
	return err
}

func (cm ClusterManager) PodDownloadFile(req DownloadFileRequest) ([]byte, error) {
	if len(req.SrcPaths) == 0 {
		return nil, errors.New("source paths nil")
	}
	stdOut := new(Writer)
	stdErr := new(Writer)
	tarCmd := []string{"tar", "-cf", "-"}
	var (
		srcDir   string
		srcNames []string
	)
	srcDir = path.Dir(req.SrcPaths[0])
	for _, p := range req.SrcPaths {
		p = path.Clean(p)
		if path.Dir(p) != srcDir {
			return nil, errors.New("all paths should in same dir")
		}
		srcNames = append(srcNames, path.Base(p))
	}
	if len(srcDir) > 0 {
		tarCmd = append(tarCmd, "-C", srcDir)
	}
	for _, src := range srcNames {
		tarCmd = append(tarCmd, src)
	}

	execTarRequest := ExecCommandRequest{
		Namespace:     req.Namespace,
		PodName:       req.PodName,
		ContainerName: req.ContainerName,
		Command:       tarCmd,
		StdOut:        stdOut,
		StdErr:        stdErr,
	}
	exitCode, err := cm.PodExecuteCommand(execTarRequest)
	if exitCode != 0 {
		err = fmt.Errorf("download file error: %s", stdErr.Output)
	}
	return []byte(stdOut.Output), err
}

func (cm ClusterManager) PodDownloadFileStream(req DownloadFileRequest) (io.ReadCloser, error) {
	if len(req.SrcPaths) == 0 {
		return nil, errors.New("source paths nil")
	}
	pr, pw := io.Pipe()
	stdErr := new(Writer)
	tarCmd := []string{"tar", "-cf", "-"}
	var (
		srcDir   string
		srcNames []string
	)
	srcDir = path.Dir(req.SrcPaths[0])
	for _, p := range req.SrcPaths {
		p = path.Clean(p)
		if path.Dir(p) != srcDir {
			return nil, errors.New("all paths should in same dir")
		}
		srcNames = append(srcNames, path.Base(p))
	}
	if len(srcDir) > 0 {
		tarCmd = append(tarCmd, "-C", srcDir)
	}
	for _, src := range srcNames {
		tarCmd = append(tarCmd, src)
	}

	execTarRequest := ExecCommandRequest{
		Namespace:     req.Namespace,
		PodName:       req.PodName,
		ContainerName: req.ContainerName,
		Command:       tarCmd,
		StdOut:        pw,
		StdErr:        stdErr,
	}
	go func() {
		var exitCode int
		var err error
		defer func() {
			pw.CloseWithError(err)
		}()
		exitCode, err = cm.PodExecuteCommand(execTarRequest)
		if exitCode != 0 {
			err = fmt.Errorf("download file error: %s", stdErr.Output)
		}
	}()
	return pr, nil
}

func (cm ClusterManager) PodExecuteCommand(req ExecCommandRequest) (int, error) {
	execRequest := cm.Client.CoreV1().RESTClient().Post().
		Resource("pods").
		Name(req.PodName).
		Namespace(req.Namespace).
		SubResource("exec").
		Timeout(req.Timeout)
	execRequest.VersionedParams(&corev1.PodExecOptions{
		Container: req.ContainerName,
		Command:   req.Command,
		Stdin:     req.StdIn != nil,
		Stdout:    req.StdOut != nil,
		Stderr:    req.StdErr != nil,
		TTY:       req.TTY,
	}, scheme.ParameterCodec)
	exec, err := remotecommand.NewSPDYExecutor(cm.Config, "POST", execRequest.URL())
	if err != nil {
		return 0, err
	}
	err = exec.Stream(remotecommand.StreamOptions{
		Stdout: req.StdOut,
		Stderr: req.StdErr,
		Stdin:  req.StdIn,
		Tty:    req.TTY,
	})
	var exitCode = 0
	if err != nil {
		if exitErr, ok := err.(utilexec.ExitError); ok && exitErr.Exited() {
			exitCode = exitErr.ExitStatus()
			err = nil
		}
	}
	return exitCode, err
}

func InitKube() error {
	if util.IsRunModeElectron() {
		return nil
	}
	newClusters, err := GetAllClusters()
	if err != nil {
		elog.Error("get all normal(status==0) clusters error while building apiServer client.", zap.Error(err))
		return err
	}

	// build new clientManager
	for i := 0; i < len(newClusters); i++ {
		cluster := newClusters[i]
		clusterManager, err := buildClusterManager(cluster)
		if err != nil {
			continue
		}
		clusterManagerSets.Store(cluster.Name, clusterManager)
	}
	elog.Info("cluster finished! ")
	return nil
}

func buildClusterManager(cluster *Cluster) (clusterManager *ClusterManager, err error) {
	var (
		clientSet *kubernetes.Clientset
		config    *rest.Config
	)
	if cluster.LocalConfig != nil {
		cluster.LocalConfig.CurrentContext = cluster.localConfigCurCtx
		clientSet, config, err = buildClientWithLocalConfig(cluster.LocalConfig)
	} else {

		// deal with invalid cluster
		if cluster.ApiServer == "" {
			elog.Warn("cluster's apiServer is null:%s", zap.String("clusterName", cluster.Name))
			return
		}
		var buildOptions []ClientBuildOption
		if cluster.Proxy != "" {
			buildOptions = append(buildOptions, WithProxy(cluster.Proxy))
		}
		var kubeConfigData = cluster.KubeConfigData
		if kubeConfigData == "" {
			// 读取二进制内容
			rawData, err := ioutil.ReadFile(cluster.KubeConfig)
			if err != nil {
				return nil, fmt.Errorf("buildClient 读取二进制失败, %w", err)
			}
			kubeConfigData = string(rawData)
		}
		clientSet, config, err = buildClient(cluster.ApiServer, kubeConfigData, buildOptions...)
	}
	if err != nil {
		elog.Warn(fmt.Sprintf("build cluster (%s)'s client error.", cluster.Name), zap.Error(err))
		return nil, err
	}
	cacheFactory, err := buildCacheController(clientSet)
	if err != nil {
		elog.Warn(fmt.Sprintf("build cache controller for cluster (%s) error.", cluster.Name), zap.Error(err))
		return nil, err
	}

	clusterManager = &ClusterManager{
		Cluster:      cluster,
		Client:       clientSet,
		Config:       config,
		CacheFactory: cacheFactory,
		KubeClient:   NewResourceHandler(clientSet, cacheFactory),
	}
	return clusterManager, nil
}

func AddClusterManager(cluster *Cluster) error {
	clusterManager, err := buildClusterManager(cluster)
	if err != nil {
		return err
	}
	clusterManagerSets.Store(cluster.Name, clusterManager)
	return nil
}

func DeleteClusterManager(name string) error {
	managerInterface, loaded := clusterManagerSets.LoadAndDelete(name)
	if !loaded {
		return nil
	}
	manager := managerInterface.(*ClusterManager)
	manager.KubeClient.Stop()
	return nil
}

func GetClusterManager(name string) (*ClusterManager, error) {
	if util.IsRunModeElectron() {
		if currentManagerSet == nil || currentManagerSet.Cluster.Name != name {
			allClusters, err := GetAllClusters()
			if err != nil {
				return nil, err
			}
			for _, cluster := range allClusters {
				if cluster.Name == name {
					cm, err := buildClusterManager(cluster)
					if err != nil {
						return nil, err
					}
					// check cluster permission
					_, err = cm.Client.CoreV1().Namespaces().List(context.Background(), metav1.ListOptions{})
					if err != nil {
						return nil, err
					}
					if currentManagerSet != nil {
						currentManagerSet.KubeClient.Stop()
					}
					currentManagerSet = cm
					cm.CacheFactory.WaitForCacheSync(time.Second * 10)
					return cm, nil
				}
			}
			return nil, errors.New("cluster not found")
		}
		return currentManagerSet, nil
	}
	managerInterface, exist := clusterManagerSets.Load(name)
	if !exist {
		return nil, fmt.Errorf("not exist name: " + name)
	}
	manager := managerInterface.(*ClusterManager)

	return manager, nil
}

type kubeClientOption struct {
	proxyAddr string
}
type ClientBuildOption func(*kubeClientOption)

func WithProxy(proxyAddr string) func(option *kubeClientOption) {
	return func(option *kubeClientOption) {
		option.proxyAddr = proxyAddr
	}
}

func buildClient(apiServerAddr string, kubeconfig string, options ...ClientBuildOption) (*kubernetes.Clientset, *rest.Config, error) {
	o := kubeClientOption{}
	for _, opt := range options {
		opt(&o)
	}
	configV1 := clientcmdapiv1.Config{}
	err := jsoniter.UnmarshalFromString(kubeconfig, &configV1)
	if err != nil {
		elog.Error("json unmarshal kubeconfig error.", zap.Error(err))
		return nil, nil, err
	}
	configObject, err := clientcmdlatest.Scheme.ConvertToVersion(&configV1, clientcmdapi.SchemeGroupVersion)
	configInternal := configObject.(*clientcmdapi.Config)

	clientConfig, err := clientcmd.NewDefaultClientConfig(*configInternal, &clientcmd.ConfigOverrides{
		ClusterDefaults: clientcmdapi.Cluster{Server: apiServerAddr}, // InsecureSkipTLSVerify: true,

	}).ClientConfig()

	if err != nil {
		elog.Error("build client config error. ", zap.Error(err))
		return nil, nil, err
	}

	clientConfig.QPS = defaultQPS
	clientConfig.Burst = defaultBurst

	if o.proxyAddr != "" {
		clientConfig.Proxy = func(request *http.Request) (*url.URL, error) {
			return url.Parse(o.proxyAddr)
		}
	}
	clientSet, err := kubernetes.NewForConfig(clientConfig)

	if err != nil {
		elog.Error(fmt.Sprintf("apiServerAddr(%s) kubernetes.NewForConfig(%v) error.", apiServerAddr, clientConfig), zap.Error(err))
		return nil, nil, err
	}

	return clientSet, clientConfig, nil
}

func buildClientWithLocalConfig(config *clientcmdapi.Config) (*kubernetes.Clientset, *rest.Config, error) {
	clientConfig, err := clientcmd.NewDefaultClientConfig(*config, &clientcmd.ConfigOverrides{}).ClientConfig()
	if err != nil {
		elog.Error("build client config error. ", zap.Error(err))
		return nil, nil, err
	}
	clientConfig.QPS = defaultQPS
	clientConfig.Burst = defaultBurst
	clientSet, err := kubernetes.NewForConfig(clientConfig)

	if err != nil {
		return nil, nil, err
	}
	return clientSet, clientConfig, nil
}

type Cluster struct {
	Name              string `json:"name"`
	Description       string `json:"description"`
	ApiServer         string `json:"apiServer"`
	KubeConfig        string `json:"kubeConfig"`
	KubeConfigData    string `json:"KubeConfigData"`
	Proxy             string `json:"proxy"`
	LocalConfig       *clientcmdapi.Config
	localConfigCurCtx string
}

func GetAllClusters() (result []*Cluster, err error) {
	localCfg, err := clientcmd.NewDefaultClientConfigLoadingRules().Load()
	if err == nil {
		for name := range localCfg.Clusters {
			for ctxName, ctx := range localCfg.Contexts {
				if ctx.Cluster == name {
					result = append(result, &Cluster{
						Name:              ctxName,
						Description:       "",
						ApiServer:         localCfg.Clusters[ctx.Cluster].Server,
						KubeConfig:        "",
						KubeConfigData:    "",
						Proxy:             "",
						LocalConfig:       localCfg,
						localConfigCurCtx: ctxName,
					})
					break
				}
			}
		}
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})
	list, err := dao.ClusterList(invoker.DB)
	if err != nil {
		return nil, err
	}
	for _, item := range list {
		result = append(result, &Cluster{
			Name:           item.Name,
			Description:    "",
			ApiServer:      item.ApiServer,
			KubeConfigData: item.KubeConfig,
			Proxy:          "",
		})
	}
	return
}
