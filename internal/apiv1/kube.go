package apiv1

import (
	"github.com/spf13/cast"
	corev1 "k8s.io/api/core/v1"

	"k8z/internal/invoker"
	"k8z/internal/model/dao"
	"k8z/internal/model/dto"
	"k8z/internal/service/kube"
	"k8z/internal/service/kube/api"
	"k8z/pkg/component/core"
)

func KubeClusterAdd(c *core.Context) {
	var req dto.ReqKubeClusterAdd
	err := c.ShouldBind(&req)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	err = kube.AddClusterManager(&kube.Cluster{
		Name:           req.Name,
		Description:    "",
		ApiServer:      req.ApiServer,
		KubeConfig:     "",
		KubeConfigData: req.KubeConfig,
		Proxy:          "",
	})
	if err != nil {
		c.JSONE(core.CodeErr, "新增集群失败: "+err.Error(), nil)
		return
	}
	err = dao.CreateCluster(invoker.DB, &dao.KubeCluster{
		Name:       req.Name,
		ApiServer:  req.ApiServer,
		KubeConfig: req.KubeConfig,
	})
	if err != nil {
		kube.DeleteClusterManager(req.Name)
		c.JSONE(core.CodeErr, "新增集群失败: "+err.Error(), nil)
		return
	}
	c.JSONOK(nil)
}

func KubeClusterUpdate(c *core.Context) {
	var req dto.ReqKubeClusterAdd
	err := c.ShouldBind(&req)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	_, err = dao.GetClusterByName(invoker.DB, req.Name)
	if err != nil {
		c.JSONE(core.CodeErr, "修改集群失败: "+err.Error(), nil)
		return
	}
	kube.DeleteClusterManager(req.Name)
	err = kube.AddClusterManager(&kube.Cluster{
		Name:           req.Name,
		Description:    "",
		ApiServer:      req.ApiServer,
		KubeConfig:     "",
		KubeConfigData: req.KubeConfig,
		Proxy:          "",
	})
	if err != nil {
		c.JSONE(core.CodeErr, "修改集群失败: "+err.Error(), nil)
		return
	}
	err = dao.UpdateCluster(invoker.DB, &dao.KubeCluster{
		Name:       req.Name,
		ApiServer:  req.ApiServer,
		KubeConfig: req.KubeConfig,
	})
	if err != nil {
		kube.DeleteClusterManager(req.Name)
		c.JSONE(core.CodeErr, "修改集群失败: "+err.Error(), nil)
		return
	}
	c.JSONOK(nil)
}

func KubeClusterGetByName(c *core.Context) {
	name := c.Param("name")
	cluster, err := dao.GetClusterByName(invoker.DB, name)
	if err != nil {
		c.JSONE(core.CodeErr, "查找集群失败: "+err.Error(), nil)
		return
	}
	c.JSONOK(cluster)
}

func KubeClusterDelete(c *core.Context) {
	name := c.Param("name")
	err := dao.DeleteCluster(invoker.DB, name)
	if err != nil {
		c.JSONE(core.CodeErr, "删除集群失败: "+err.Error(), nil)
		return
	}
	kube.DeleteClusterManager(name)
	c.JSONOK(nil)
}

func KubeClusters(c *core.Context) {
	clusters, err := kube.GetAllClusters()
	if err != nil {
		c.JSONE(core.CodeErr, "获取集群列表失败: "+err.Error(), nil)
		return
	}
	var ret = make([]dto.KubeCluster, 0)
	for _, cluster := range clusters {
		ret = append(ret, dto.KubeCluster{
			Name:           cluster.Name,
			IsStaticConfig: cluster.LocalConfig != nil,
		})
	}
	c.JSONOK(ret)
}

func KubeNamespaces(c *core.Context) {
	cm, err := kube.GetClusterManager(c.Param("cluster"))
	if err != nil {
		c.JSONE(core.CodeErr, "获取集群 namespace 失败: "+err.Error(), nil)
		return
	}
	cluster := cm.ClusterResources()
	var ret = make([]interface{}, 0)
	for _, ns := range cluster.Namespaces {
		ret = append(ret, ns)
	}
	c.JSONOK(ret)
}

func KubeWorkloads(c *core.Context) {
	cm, err := kube.GetClusterManager(c.Param("cluster"))
	if err != nil {
		c.JSONE(core.CodeErr, "获取集群 namespace 失败: "+err.Error(), nil)
		return
	}
	cluster := cm.ClusterResources()
	var ret = make([]interface{}, 0)
	namespace := c.Param("namespace")
	var resNamespace *dto.KubeNamespace
	for _, item := range cluster.Namespaces {
		if item.Name == namespace {
			resNamespace = item
		}
	}
	if resNamespace == nil {
		c.JSONOK(ret)
		return
	}
	for _, workload := range resNamespace.Workloads {
		ret = append(ret, workload)
	}
	c.JSONOK(ret)
}

func KubePods(c *core.Context) {
	cm, err := kube.GetClusterManager(c.Param("cluster"))
	if err != nil {
		c.JSONE(core.CodeErr, "获取集群 namespace 失败: "+err.Error(), nil)
		return
	}
	cluster := cm.ClusterResources()
	var ret = make([]interface{}, 0)
	allowNotReady := cast.ToBool(c.Query("allowNotReady"))
	namespace := c.Param("namespace")
	var resNamespace *dto.KubeNamespace
	for _, item := range cluster.Namespaces {
		if item.Name == namespace {
			resNamespace = item
			break
		}
	}
	if resNamespace == nil {
		c.JSONOK(ret)
		return
	}
	for _, item := range resNamespace.Workloads {
		for _, pod := range item.Pods {
			if !pod.Ready && !allowNotReady {
				continue
			}
			ret = append(ret, pod)
		}
	}
	c.JSONOK(ret)
}

// KubeConfigmaps
// @tags kube
// @summary 集群configmap 列表
// @router /api/v1/kube/:cluster/:namespace/config-maps [get]
// @produce json
// @param cluster param string true "集群"
// @param namespace param string true "ns"
// @success 200 {object} []dto.KubeConfigMap
func KubeConfigmaps(c *core.Context) {
	cm, err := kube.GetClusterManager(c.Param("cluster"))
	if err != nil {
		c.JSONE(core.CodeErr, "集群获取失败: "+err.Error(), nil)
		return
	}
	configMapObj, err := cm.KubeClient.List(api.ResourceNameConfigMap, c.Param("namespace"), "")
	if err != nil {
		c.JSONE(core.CodeErr, "get config map list error: "+err.Error(), nil)
		return
	}
	ret := make([]dto.KubeConfigMap, 0)
	for _, item := range configMapObj {
		configMap := item.(*corev1.ConfigMap)
		ret = append(ret, dto.KubeConfigMap{
			Name:      configMap.Name,
			Cluster:   c.Param("cluster"),
			Namespace: configMap.Namespace,
		})
	}
	c.JSONOK(ret)
}
