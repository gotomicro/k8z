package service

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/gotomicro/ego/core/econf"
	jsoniter "github.com/json-iterator/go"
	"github.com/spf13/cast"

	"k8z/internal/model/dto"
	"k8z/internal/service/kube"
	"k8z/internal/util"
	"k8z/pkg/storage"
	"k8z/pkg/storage/filesystem"
)

var (
	TCPDump *tcpDump
)

func initTCPDump() error {
	// check path
	basePath := econf.GetString("storage.filesystem.tcpdumpPath")
	err := os.MkdirAll(basePath, 0755)
	if err != nil {
		return fmt.Errorf("init tcpdump check dir failed: %w", err)
	}
	TCPDump = &tcpDump{
		storage: filesystem.NewFilesystemClient(basePath),
	}
	return nil
}

func (t tcpDump) CheckDependencies() error {
	var des util.DepErrors
	if _, err := exec.Command("wireshark", "-v").Output(); err != nil {
		des = append(des, util.DepError{
			Dependency: "wireshark",
			Refer:      "https://www.wireshark.org/#download",
		})
	}
	if len(des) > 0 {
		return des
	}
	return nil
}

type tcpDump struct {
	storage storage.Client
}

type wsMessage struct {
	Type string `json:"type"`
	Data string `json:"data"`
}

type wsWriter struct {
	conn *websocket.Conn
}

func (w wsWriter) Write(p []byte) (n int, err error) {
	msg := wsMessage{
		Type: "stdout",
		Data: string(p),
	}
	msgBytes, _ := jsoniter.Marshal(msg)
	w.conn.WriteMessage(websocket.TextMessage, msgBytes)
	return len(p), nil
}

func (t tcpDump) RunWS(ctx context.Context, req *dto.ReqRunTCPDump, conn *websocket.Conn) {
	var (
		cm       *kube.ClusterManager
		exitCode int
		stopped  bool
		err      error
	)
	cm, err = kube.GetClusterManager(req.ClusterName)
	if err != nil {
		return
	}
	// upload to remote container
	staticTcpdump, err := ioutil.ReadFile("static-tcpdump")
	if err != nil {
		return
	}
	err = cm.PodUploadFile(kube.UploadFileRequest{
		SrcContent:    staticTcpdump,
		Filename:      "static-tcpdump",
		DstDir:        "/tmp",
		Namespace:     req.Namespace,
		PodName:       req.PodName,
		ContainerName: req.ContainerName,
	})
	if err != nil {
		return
	}
	pr, pw := io.Pipe()
	stdErr := new(kube.Writer)
	if err != nil {
		return
	}
	if req.Interface == "" {
		req.Interface = "any"
	}
	var command []string
	switch req.Mode {
	case "file":
		key := fmt.Sprintf("%s/%s/%s_%s", req.ClusterName, req.Namespace, req.PodName, uuid.New().String())
		tmpDir := filepath.Join(os.TempDir(), "tcpdump", key)
		err = os.MkdirAll(tmpDir, os.ModePerm)
		if err != nil {
			return
		}
		var outputFilePath = filepath.Join(tmpDir, "packets")
		var fileWriter *os.File
		fileWriter, err = os.Create(outputFilePath)
		if err != nil {
			return
		}
		err = t.storage.PutBytes(ctx, filepath.Join(key, "status"), []byte("1"))
		if err != nil {
			return
		}
		req.CreatedAt = time.Now().Unix()
		metaByte, _ := jsoniter.Marshal(req)
		err = t.storage.PutBytes(ctx, filepath.Join(key, "meta"), metaByte)
		go func() {
			io.Copy(fileWriter, pr)
			t.storage.PutBytes(ctx, filepath.Join(key, "status"), []byte("2"))
			// 转储
			fileWriter.Close()
			data, err := ioutil.ReadFile(outputFilePath)
			if err != nil {
				return
			}
			t.storage.PutBytes(ctx, filepath.Join(key, "packets"), data)
			os.RemoveAll(tmpDir)
			conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`{"type":"%s", "key":"%s"}`, "done", key)))
			conn.Close()
		}()
		command = []string{"/tmp/static-tcpdump", "-i", req.Interface, "-U", "-w", "-", req.Filter}
	case "stdout":
		go func() {
			io.Copy(wsWriter{conn: conn}, pr)
			conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`{"type":"%s"}`, "done")))
			conn.Close()
		}()
		command = []string{"/tmp/static-tcpdump", "-i", req.Interface, "-U", req.Filter}
	case "wireshark":
		title := fmt.Sprintf("gui.window_title:%s/%s/%s", req.Namespace, req.PodName, req.ContainerName)
		wireshark := exec.Command("wireshark", "-k", "-i", "-", "-o", title)

		stdinWriter, err := wireshark.StdinPipe()
		if err != nil {
			return
		}
		go func() {
			_, _ = io.Copy(stdinWriter, pr)
			if wireshark.Process != nil {
				wireshark.Process.Kill()
			}
			conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`{"type":"%s"}`, "done")))
			conn.Close()
			return
		}()
		err = wireshark.Start()
		if err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`{"type":"%s","error":"%s"}`, "done", err.Error())))
			conn.Close()
			return
		}
		go func() {
			wireshark.Wait()
		}()
		command = []string{"/tmp/static-tcpdump", "-i", req.Interface, "-U", "-w", "-", req.Filter}
	default:
		conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`{"type":"%s"}`, "done")))
		conn.Close()
	}
	go func() {
		exitCode, err = cm.PodExecuteCommand(kube.ExecCommandRequest{
			Namespace:     req.Namespace,
			PodName:       req.PodName,
			ContainerName: req.ContainerName,
			Command:       command,
			StdOut:        pw,
			StdErr:        stdErr,
		})
		pw.Close()
		if exitCode != 0 {
			err = fmt.Errorf("exec failed: %s", stdErr.Output)
		}
	}()
	var killRemoteTcpdump = func() {
		// TODO 寻找更好的方法结束远端进程
		cm.PodExecuteCommand(kube.ExecCommandRequest{
			Namespace:     req.Namespace,
			PodName:       req.PodName,
			ContainerName: req.ContainerName,
			StdErr:        new(kube.NopWriter),
			Command:       []string{"sh", "-c", "ps -o pid,comm,args -e | grep '/tmp/static-tcpdump' | grep -v grep | awk '{print $1}' | xargs kill"},
		})
	}
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			killRemoteTcpdump()
			return
		}
		var msgObj wsMessage
		err = jsoniter.UnmarshalFromString(string(msg), &msgObj)
		if err != nil {
			killRemoteTcpdump()
			return
		}
		switch msgObj.Type {
		case "stop":
			if stopped {
				continue
			}
			stopped = true
			killRemoteTcpdump()
		case "ping":
			conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`{"type":"%s"}`, "pong")))
		}
	}
}

func (t tcpDump) Run(ctx context.Context, req *dto.ReqRunTCPDump) (key string, err error) {
	var cm *kube.ClusterManager
	cm, err = kube.GetClusterManager(req.ClusterName)
	if err != nil {
		return
	}
	key = fmt.Sprintf("%s/%s/%s_%s", req.ClusterName, req.Namespace, req.PodName, uuid.New().String())
	tmpDir := filepath.Join(os.TempDir(), "tcpdump", key)
	err = os.MkdirAll(tmpDir, os.ModePerm)
	if err != nil {
		return
	}
	var outputFilePath = filepath.Join(tmpDir, "packets")
	var fileWriter *os.File
	fileWriter, err = os.Create(outputFilePath)
	if err != nil {
		return
	}
	if req.Interface == "" {
		req.Interface = "any"
	}
	command := []string{"tcpdump", "-i", req.Interface, "-U", "-w", "-", req.Filter}
	var (
		exitCode int
		stdErr   = new(kube.Writer)
	)
	err = t.storage.PutBytes(ctx, filepath.Join(key, "status"), []byte("1"))
	if err != nil {
		return
	}
	req.CreatedAt = time.Now().Unix()
	metaByte, _ := jsoniter.Marshal(req)
	err = t.storage.PutBytes(ctx, filepath.Join(key, "meta"), metaByte)
	if err != nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute*30)
	go func() {
		exitCode, err = cm.PodExecuteCommand(kube.ExecCommandRequest{
			Namespace:     req.Namespace,
			PodName:       req.PodName,
			ContainerName: req.ContainerName,
			Command:       command,
			StdOut:        fileWriter,
			StdErr:        stdErr,
			Timeout:       time.Minute * 30,
		})
		if exitCode != 0 {
			err = fmt.Errorf("exec failed: %s", stdErr.Output)
		}
		if err != nil {
			return
		}
	}()
	go func() {
		for {
			select {
			case <-ctx.Done():
				fileWriter.Close()
				data, err := ioutil.ReadFile(outputFilePath)
				if err != nil {
					return
				}
				t.storage.PutBytes(ctx, filepath.Join(key, "packets"), data)
				os.RemoveAll(tmpDir)
				return
			default:
			}
			status, err := t.storage.GetBytes(ctx, filepath.Join(key, "status"))
			if err != nil {
				continue
			}
			if string(status) == "2" {
				cancel()
			}
			time.Sleep(time.Second)
		}
	}()
	return
}

func (t tcpDump) Stop(ctx context.Context, key string) (err error) {
	status, err := t.storage.GetBytes(ctx, filepath.Join(key, "status"))
	if err != nil {
		return err
	}
	if string(status) == "1" {
		t.storage.PutBytes(ctx, filepath.Join(key, "status"), []byte("2"))
		time.Sleep(time.Second)
	}
	return
}

func (t tcpDump) List(ctx context.Context, req *dto.ReqTCPDumpList) (list []dto.RespTCPDumpListItem, err error) {
	key := fmt.Sprintf("%s/%s", req.ClusterName, req.Namespace)
	names, err := t.storage.List(ctx, key)
	if err != nil {
		return nil, err
	}
	for _, name := range names {
		if strings.HasPrefix(name, req.PodName) {
			metaBytes, err := t.storage.GetBytes(ctx, filepath.Join(key, name, "meta"))
			if err != nil {
				continue
			}
			var meta dto.ReqRunTCPDump
			err = jsoniter.Unmarshal(metaBytes, &meta)
			if err != nil {
				return nil, err
			}
			if req.ContainerName != "" && meta.ContainerName != req.ContainerName {
				continue
			}
			status, err := t.storage.GetBytes(ctx, filepath.Join(key, name, "status"))
			if err != nil {
				continue
			}
			list = append(list, dto.RespTCPDumpListItem{
				ClusterName:   req.ClusterName,
				PodName:       req.PodName,
				Namespace:     req.Namespace,
				ContainerName: req.ContainerName,
				Interface:     meta.Interface,
				Filter:        meta.Filter,
				CreatedAt:     meta.CreatedAt,
				Status:        cast.ToInt(string(status)),
				Key:           filepath.Join(key, name),
			})
		}
	}
	return list, nil
}

func (t tcpDump) DownloadPackets(ctx context.Context, key string) (data []byte, err error) {
	data, err = t.storage.GetBytes(ctx, filepath.Join(key, "packets"))
	return
}
