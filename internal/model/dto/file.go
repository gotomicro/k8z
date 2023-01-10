package dto

type ListPodFileReq struct {
	ClusterName   string `form:"clusterName" json:"clusterName"`
	PodName       string `form:"podName" json:"podName"`
	Namespace     string `form:"namespace" json:"namespace"`
	Path          string `form:"path" json:"path"`
	Name          string `form:"name" json:"name"`
	ContainerName string `form:"containerName" json:"containerName"`
}

type DownloadFileFromPod struct {
	ClusterName   string   `form:"clusterName" json:"clusterName"`
	PodName       string   `form:"podName" json:"podName"`
	Namespace     string   `form:"namespace" json:"namespace"`
	ContainerName string   `form:"containerName" json:"containerName"`
	Paths         []string `form:"paths" json:"paths"`
}

type UploadFileToPod struct {
	ClusterName   string `form:"clusterName" json:"clusterName"`
	PodName       string `form:"podName" json:"podName"`
	Namespace     string `form:"namespace" json:"namespace"`
	ContainerName string `form:"containerName" json:"containerName"`
	DstPath       string `form:"dstPath" json:"dstPath"`

	SrcContent []byte `json:"-" form:"-"`
	Filename   string `json:"-" form:"-"`
}
