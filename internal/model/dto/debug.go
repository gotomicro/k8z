package dto

type ReqRunDebug struct {
	ClusterName   string `form:"clusterName" json:"clusterName"`
	PodName       string `form:"podName" json:"podName"`
	Namespace     string `form:"namespace" json:"namespace"`
	ContainerName string `form:"containerName" json:"containerName"`
}
