package dto

type ReqKubeClusterAdd struct {
	Name       string `json:"name" form:"name" binding:"required"`
	ApiServer  string `json:"apiServer" form:"apiServer" binding:"required"`
	KubeConfig string `json:"kubeConfig" form:"kubeConfig" binding:"required"`
}

type KubePod struct {
	Cluster      string   `json:"cluster"`
	Namespace    string   `json:"namespace"`
	Workload     string   `json:"workload"`
	WorkloadKind string   `json:"workloadKind"`
	Name         string   `json:"name"`
	Ready        bool     `json:"ready"`
	Reason       string   `json:"reason"`
	Containers   []string `json:"containers"`
}

type KubeWorkload struct {
	Cluster   string     `json:"cluster"`
	Namespace string     `json:"namespace"`
	Kind      string     `json:"kind"`
	Name      string     `json:"name"`
	Pods      []*KubePod `json:"pods"`
}

type KubeNamespace struct {
	Cluster   string          `json:"cluster"`
	Name      string          `json:"name"`
	Workloads []*KubeWorkload `json:"workloads"`
}

type KubeCluster struct {
	Name           string           `json:"name"`
	IsStaticConfig bool             `json:"isStaticConfig"`
	Namespaces     []*KubeNamespace `json:"namespaces"`
}

type KubeConfigMap struct {
	Name      string `json:"name"`
	Cluster   string `json:"cluster"`
	Namespace string `json:"namespace"`
}
