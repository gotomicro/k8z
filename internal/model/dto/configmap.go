package dto

type ConfigMapConfiguration struct {
	// 配置项名称 可能含有后缀 .json|.toml|.yml 等
	ConfigMapConfiguration string `json:"configMapConfiguration"`
	Cluster                string `json:"cluster"`
	Namespace              string `json:"namespace"`
	ConfigMap              string `json:"configMap"`
}

type ConfigMapConfigurationData struct {
	Data                   string `json:"data"`
	ConfigMapConfiguration string `json:"configMapConfiguration"`
	Cluster                string `json:"cluster"`
	Namespace              string `json:"namespace"`
	ConfigMap              string `json:"configMap"`
}

type SaveConfigMapConfigurationReq struct {
	Cluster                    string `json:"cluster"`
	Namespace                  string `json:"namespace"`
	ConfigMap                  string `json:"configMap"`
	ConfigMapConfiguration     string `json:"configMapConfiguration"`
	ConfigMapConfigurationData string `json:"configMapConfigurationData"`
}
