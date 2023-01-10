package dto

type PODProxyHTTPReq struct {
	ClusterName string `form:"clusterName" json:"clusterName"`
	PodName     string `form:"podName" json:"podName"`
	Namespace   string `form:"namespace" json:"namespace"`
	Method      string `form:"method" json:"method"`
	URL         string `form:"url" json:"url"`
	Payload     string `form:"payload" json:"payload"`
	Headers     string `form:"headers" json:"headers"`
}

type PODProxyHTTPResp struct {
	Body          string            `json:"body"`
	Headers       map[string]string `json:"headers"`
	Status        string            `json:"status"`
	StatusCode    int               `json:"statusCode"`
	Duration      int64             `json:"duration"`
	ContentLength int               `json:"contentLength"`
}
