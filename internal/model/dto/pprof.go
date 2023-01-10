package dto

type (
	// ReqRunProfile ..
	ReqRunProfile struct {
		Mode         string `form:"mode" json:"mode" binding:"required"` // Pod, Ip
		Cluster      string `form:"cluster" json:"cluster"`
		PodName      string `form:"podName" json:"podName"`
		Port         int    `form:"port" json:"port"`
		Namespace    string `form:"namespace" json:"namespace"`
		Addr         string `form:"addr" json:"addr"`
		Seconds      int    `form:"seconds" json:"seconds"`
		Type         int    `form:"type" json:"type"`
		WorkloadKind string `form:"workloadKind" json:"workloadKind"`
		Workload     string `form:"workload" json:"workload"`

		UniqueKey string `form:"-" json:"-"`
	}

	ReqPprofGraph struct {
		SvgType string `form:"svgType" binding:"required"` // flame | profile
		GoType  string `form:"goType" binding:"required"`  // block | goroutine | heap | profile
		Url     string `form:"url" binding:"required"`
	}

	ReqPprofDownload struct {
		Url string `form:"url" binding:"required"`
	}

	ReqGetPprofList struct {
		Cluster      string `form:"cluster" json:"cluster" binding:"required"`
		Namespace    string `form:"namespace" json:"namespace" binding:"required"`
		WorkloadKind string `form:"workloadKind" json:"workloadKind" binding:"required"`
		Workload     string `form:"workload" json:"workload" binding:"required"`
		Pod          string `form:"pod" json:"pod"`
	}

	RespGetPprofListItem struct {
		Url     string `json:"url"`
		PodName string `json:"podName"`
		Ctime   int64  `json:"ctime"`
	}

	ReqPProfDiffGraph struct {
		SvgType   string `form:"svgType" binding:"required"` // flame | profile
		GoType    string `form:"goType" binding:"required"`  // block | goroutine | heap | profile
		BaseUrl   string `form:"baseUrl" binding:"required"`
		TargetUrl string `form:"targetUrl" binding:"required"`
	}

	ReqPProfRunDiff struct {
		BaseUrl   string `form:"baseUrl" json:"baseUrl" binding:"required"`
		TargetUrl string `form:"targetUrl" json:"targetUrl" binding:"required"`
	}
)
