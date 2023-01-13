package dto

type (
	// ReqRunTCPDump ..
	ReqRunTCPDump struct {
		ClusterName   string `form:"clusterName" json:"clusterName"`
		PodName       string `form:"podName" json:"podName"`
		Namespace     string `form:"namespace" json:"namespace"`
		ContainerName string `form:"containerName" json:"containerName"`
		Interface     string `form:"interface" json:"interface"`
		Filter        string `form:"filter" json:"filter"`
		Mode          string `form:"mode" json:"mode"`

		CreatedAt int64 `form:"-" json:"createdAt"`
	}
	ReqTCPDumpStop struct {
		TaskId string `form:"taskId" json:"taskId"`
	}
	ReqTCPDumpDownload struct {
		TaskId string `form:"taskId" json:"taskId"`
	}
	// ReqTCPDumpList ..
	ReqTCPDumpList struct {
		ClusterName   string `form:"clusterName" json:"clusterName"`
		PodName       string `form:"podName" json:"podName"`
		Namespace     string `form:"namespace" json:"namespace"`
		ContainerName string `form:"containerName" json:"containerName"`
	}
	// RespTCPDumpListItem ..
	RespTCPDumpListItem struct {
		ClusterName   string `json:"clusterName"`
		PodName       string `json:"podName"`
		Namespace     string `json:"namespace"`
		ContainerName string `json:"containerName"`
		Interface     string `json:"interface"`
		Filter        string ` json:"filter"`
		CreatedAt     int64  `json:"createdAt"`
		Status        int    `json:"status"`
		Key           string `json:"key"`
	}
)
