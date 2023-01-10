package service

import (
	"context"
	"os/exec"
	"testing"

	"k8z/internal/model/dto"
)

func TestListPodContainerFile(t *testing.T) {
	//ListPodFile(context.Background())
}

func TestUploadFileToPod(t *testing.T) {
	//UploadFileToPod(context.Background())
}

func TestDownloadFileFromPod(t *testing.T) {
	DownloadFileFromPod(context.Background(), &dto.DownloadFileFromPod{
		ClusterName:   "shimo-dev",
		PodName:       "mdp-69949797f6-lww25",
		Namespace:     "default",
		ContainerName: "",
		Paths:         []string{"/data/config", "/data/1.txt"},
	})
}

func Test_parseLSOutput(t *testing.T) {
	out, _ := exec.Command("ls", "-al", "/").Output()
	parseLSOutput(string(out))
}
