package apiv1

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8z/internal/model/dto"
	"k8z/internal/service/kube"
	"k8z/internal/service/kube/api"
	"k8z/pkg/component/core"
)

func getConfigMapFromCluster(c *core.Context, cluster, namespace, configmap string) (*corev1.ConfigMap, error) {
	cm, err := kube.GetClusterManager(cluster)
	if err != nil {
		c.JSONE(core.CodeErr, "集群获取失败: "+err.Error(), nil)
		return nil, err
	}
	configMapObj, err := cm.KubeClient.Get(api.ResourceNameConfigMap, namespace, configmap)
	if err != nil {
		c.JSONE(core.CodeErr, "get config map error: "+err.Error(), nil)
		return nil, err
	}
	configMap := configMapObj.(*corev1.ConfigMap)
	return configMap, nil
}

// ListConfigMapConfiguration
// @tags configMap
// @summary configMap data 列表
// @router /api/v1/config-map/configurations [get]
// @produce json
// @param cluster query string true "集群"
// @param namespace query string true "ns"
// @param configMap query string true "configMap 名称"
// @success 200 {object} []dto.ConfigMapConfiguration
func ListConfigMapConfiguration(c *core.Context) {
	configMap, err := getConfigMapFromCluster(c, c.Query("cluster"), c.Query("namespace"), c.Query("configMap"))
	if err != nil {
		return
	}
	ret := make([]dto.ConfigMapConfiguration, 0)
	for key := range configMap.Data {
		ret = append(ret, dto.ConfigMapConfiguration{
			ConfigMapConfiguration: key,
			Cluster:                c.Query("cluster"),
			Namespace:              c.Query("namespace"),
			ConfigMap:              c.Query("configMap"),
		})
	}
	c.JSONOK(ret)
}

// GetConfigMapConfigurationData
// @tags configMap
// @summary configMap data 内容
// @router /api/v1/config-map/configuration-data [get]
// @produce json
// @param cluster query string true "集群"
// @param namespace query string true "ns"
// @param configMap query string true "configMap 名称"
// @param configMapConfiguration query string true "配置项名称"
// @success 200 {object} dto.ConfigMapConfigurationData
func GetConfigMapConfigurationData(c *core.Context) {
	configMap, err := getConfigMapFromCluster(c, c.Query("cluster"), c.Query("namespace"), c.Query("configMap"))
	if err != nil {
		return
	}
	if data, ok := configMap.Data[c.Query("configMapConfiguration")]; ok {
		c.JSONOK(dto.ConfigMapConfigurationData{
			Data:                   data,
			ConfigMapConfiguration: c.Query("configMapConfiguration"),
			Cluster:                c.Query("cluster"),
			Namespace:              c.Query("namespace"),
			ConfigMap:              c.Query("configMap"),
		})
		return
	}
	c.JSONE(core.CodeErr, "configuration not exists", nil)
}

// SaveConfigMapConfiguration
// @tags configMap
// @summary 保存（新增修改）配置项
// @router /api/v1/config-map/save-configuration [post]
// @accept json
// @produce json
// @param payload body dto.SaveConfigMapConfigurationReq true "request body"
// @success 200 {object} []dto.ConfigMapConfiguration
func SaveConfigMapConfiguration(c *core.Context) {
	var params dto.SaveConfigMapConfigurationReq
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数错误: "+err.Error(), nil)
		return
	}
	configMap, err := getConfigMapFromCluster(c, params.Cluster, params.Namespace, params.ConfigMap)
	if err != nil {
		return
	}
	configMap.Data[params.ConfigMapConfiguration] = params.ConfigMapConfigurationData
	cm, err := kube.GetClusterManager(params.Cluster)
	if err != nil {
		c.JSONE(core.CodeErr, "集群获取失败: "+err.Error(), nil)
		return
	}
	configMap, err = cm.Client.CoreV1().ConfigMaps(params.Namespace).Update(c.Request.Context(), configMap, metav1.UpdateOptions{})
	if err != nil {
		c.JSONE(core.CodeErr, "save configMap错误: "+err.Error(), nil)
		return
	}
	ret := make([]dto.ConfigMapConfiguration, 0)
	for key := range configMap.Data {
		ret = append(ret, dto.ConfigMapConfiguration{
			ConfigMapConfiguration: key,
			Cluster:                params.Cluster,
			Namespace:              params.Namespace,
			ConfigMap:              params.ConfigMap,
		})
	}
	c.JSONOK(ret)
}

// DeleteConfigMapConfiguration
// @tags configMap
// @summary 删除配置文件
// @router /api/v1/config-map/configuration [delete]
// @produce json
// @param cluster query string true "集群"
// @param namespace query string true "ns"
// @param configMap query string true "configMap 名称"
// @param configMapConfiguration query string true "配置项名称"
// @success 200 {object} []dto.ConfigMapConfiguration
func DeleteConfigMapConfiguration(c *core.Context) {
	configMap, err := getConfigMapFromCluster(c, c.Query("cluster"), c.Query("namespace"), c.Query("configMap"))
	if err != nil {
		return
	}
	delete(configMap.Data, c.Query("configMapConfiguration"))
	cm, err := kube.GetClusterManager(c.Query("cluster"))
	if err != nil {
		c.JSONE(core.CodeErr, "集群获取失败: "+err.Error(), nil)
		return
	}
	configMap, err = cm.Client.CoreV1().ConfigMaps(c.Query("namespace")).Update(c.Request.Context(), configMap, metav1.UpdateOptions{})
	if err != nil {
		c.JSONE(core.CodeErr, "delete configMap错误: "+err.Error(), nil)
		return
	}
	ret := make([]dto.ConfigMapConfiguration, 0)
	for key := range configMap.Data {
		ret = append(ret, dto.ConfigMapConfiguration{
			ConfigMapConfiguration: key,
			Cluster:                c.Query("cluster"),
			Namespace:              c.Query("namespace"),
			ConfigMap:              c.Query("configMap"),
		})
	}
	c.JSONOK(ret)
}
