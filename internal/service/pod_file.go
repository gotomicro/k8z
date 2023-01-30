package service

import (
	"context"
	"errors"
	"io"
	"os"
	"path"
	"strings"
	"time"

	"github.com/spf13/cast"

	"k8z/internal/model/dto"
	"k8z/internal/service/kube"
)

func ListPodFile(ctx context.Context, req *dto.ListPodFileReq) ([]*FileInfo, error) {
	cm, err := kube.GetClusterManager(req.ClusterName)
	if err != nil {
		return nil, err
	}
	stdOut := new(kube.Writer)
	stdErr := new(kube.Writer)
	req.Path = path.Clean(req.Path)
	if req.Path == "" {
		req.Path = "."
	}
	if !path.IsAbs(req.Path) {
		stdOut := new(kube.Writer)
		stdErr := new(kube.Writer)
		code, err := cm.PodExecuteCommand(kube.ExecCommandRequest{
			Namespace:     req.Namespace,
			PodName:       req.PodName,
			ContainerName: req.ContainerName,
			Command:       []string{"pwd"},
			StdOut:        stdOut,
			StdErr:        stdErr,
		})
		if err != nil {
			return nil, err
		}
		if code != 0 {
			return nil, errors.New(stdErr.Output)
		}
		req.Path = path.Join(strings.TrimSuffix(stdOut.Output, "\n"), req.Path)
	}
	code, err := cm.PodExecuteCommand(kube.ExecCommandRequest{
		Namespace:     req.Namespace,
		PodName:       req.PodName,
		ContainerName: req.ContainerName,
		Command:       []string{"ls", "-al", "--full-time", req.Path},
		StdOut:        stdOut,
		StdErr:        stdErr,
	})
	if err != nil {
		return nil, err
	}
	if code != 0 {
		return nil, errors.New(stdErr.Output)
	}
	fs := parseLSOutput(stdOut.Output)
	return fs, nil
}

func UploadFileToPod(ctx context.Context, req *dto.UploadFileToPod) error {
	cm, err := kube.GetClusterManager(req.ClusterName)
	if err != nil {
		return err
	}
	if req.FilePath != "" {
		f, err := os.Open(req.FilePath)
		if err != nil {
			return err
		}
		err = cm.PodUploadFileStream(kube.UploadFileStreamRequest{
			Namespace:     req.Namespace,
			PodName:       req.PodName,
			ContainerName: req.ContainerName,
			DstDir:        req.DstPath,
			Filename:      req.Filename,
			SrcFile:       f,
		})
		return err
	} else {
		err = cm.PodUploadFile(kube.UploadFileRequest{
			Namespace:     req.Namespace,
			PodName:       req.PodName,
			ContainerName: req.ContainerName,
			SrcContent:    req.SrcContent,
			DstDir:        req.DstPath,
			Filename:      req.Filename,
		})
		return err
	}
}

func DownloadFileFromPod(ctx context.Context, req *dto.DownloadFileFromPod) (io.ReadCloser, error) {
	cm, err := kube.GetClusterManager(req.ClusterName)
	if err != nil {
		return nil, err
	}
	reader, err := cm.PodDownloadFileStream(kube.DownloadFileRequest{
		Namespace:     req.Namespace,
		PodName:       req.PodName,
		ContainerName: req.ContainerName,
		SrcPaths:      req.Paths,
	})
	return reader, err
}

type FileInfo struct {
	Name       string    `json:"name"`
	IsDir      bool      `json:"isDir"`
	LinkTarget string    `json:"linkTarget"`
	IsLink     bool      `json:"isLink"`
	ModifyTime time.Time `json:"modifyTime"`
	Size       int       `json:"size"`
	User       string    `json:"user"`
	Group      string    `json:"group"`
}

func parseLSOutput(output string) []*FileInfo {
	var result []*FileInfo
	lines := strings.Split(output, "\n")
	lines = lines[1:] // ignore first line
	for _, line := range lines {
		if line == "" {
			continue
		}
		arr := strings.Split(line, " ")
		var elements []string
		var i int
		for idx, item := range arr {
			if item != "" {
				if i >= 8 {
					elements = append(elements, strings.Join(arr[idx:], " "))
					break
				}
				elements = append(elements, item)
				i++
			}
		}
		if len(elements) < 9 {
			continue
		}
		var f FileInfo
		f.IsDir = elements[0][0] == 'd'
		f.IsLink = elements[0][0] == 'l'
		f.User = elements[2]
		f.Group = elements[3]
		f.Name = elements[8]
		f.ModifyTime, _ = time.Parse("2006-01-0215:04:05-0700", elements[5]+elements[6]+elements[7])
		f.Size = cast.ToInt(elements[4])
		if f.IsLink {
			arr := strings.Split(f.Name, " -> ")
			if len(arr) == 2 {
				f.Name = arr[0]
				f.LinkTarget = arr[1]
			}
		}
		result = append(result, &f)
	}
	return result
}
