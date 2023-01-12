package router

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gotomicro/ego/core/econf"
	"github.com/gotomicro/ego/server/egin"

	"k8z/internal/apiv1"
	"k8z/internal/invoker"
	"k8z/pkg/component/core"
)

const (
	prefixAPI   = "api"
	prefixAPIV1 = prefixAPI + "/" + "v1"
)

func Server() *egin.Component {
	r := invoker.Gin
	r.NoRoute(core.Handle(func(c *core.Context) {
		prefix := "/api/"
		if strings.HasPrefix(c.Request.URL.Path, prefix) {
			c.JSONE(http.StatusNotFound, "", nil)
			return
		}
		maxAge := econf.GetInt("server.http.maxAge")
		if maxAge == 0 {
			maxAge = 86400
		}
		c.Header("Cache-Control", fmt.Sprintf("public, max-age=%d", maxAge))
		var rewrite = func(path string) string {
			f, err := invoker.Gin.HTTPEmbedFs().Open(path)
			if err != nil {
				return "/"
			}
			f.Close()
			return path
		}
		path := rewrite(c.Request.URL.Path)
		c.FileFromFS(path, invoker.Gin.HTTPEmbedFs())
		return
	}))
	routeKube(r)
	routePProf(r)
	routeProxy(r)
	routeFile(r)
	routeTCPDump(r)
	routeTerminal(r)
	routeDebug(r)
	routeConfigMap(r)
	return r
}

func routePProf(r gin.IRouter) {
	v1 := r.Group(prefixAPIV1).Group("/pprof")
	v1.GET("/check-dependencies", core.Handle(apiv1.PProfCheckDependencies))
	v1.POST("/run", core.Handle(apiv1.PProfRun))
	v1.GET("/profile-list", core.Handle(apiv1.PprofList))
	v1.GET("/graph", core.Handle(apiv1.PProfGraph))
	v1.GET("/download", core.Handle(apiv1.PProfDownload))
	v1.GET("/diff-graph", core.Handle(apiv1.PProfDiffGraph))
	v1.POST("/run-diff", core.Handle(apiv1.PProfRunDiff))
}

func routeKube(r gin.IRouter) {
	v1 := r.Group(prefixAPIV1).Group("/k8s")
	v1.GET("/clusters", core.Handle(apiv1.KubeClusters))
	v1.GET("/:cluster/namespaces", core.Handle(apiv1.KubeNamespaces))
	v1.GET("/:cluster/:namespace/workloads", core.Handle(apiv1.KubeWorkloads))
	v1.GET("/:cluster/:namespace/pods", core.Handle(apiv1.KubePods))
	v1.POST("/cluster-configs", core.Handle(apiv1.KubeClusterAdd))
	v1.GET("/cluster-configs/:name", core.Handle(apiv1.KubeClusterGetByName))
	v1.DELETE("/cluster-configs/:name", core.Handle(apiv1.KubeClusterDelete))
	v1.PUT("/cluster-configs", core.Handle(apiv1.KubeClusterUpdate))
	v1.GET("/:cluster/:namespace/config-maps", core.Handle(apiv1.KubeConfigmaps))
}

func routeProxy(r gin.IRouter) {
	v1 := r.Group(prefixAPIV1).Group("/proxy")
	v1.POST("/pod/http", core.Handle(apiv1.PODProxyHTTP))
}

func routeFile(r gin.IRouter) {
	v1 := r.Group(prefixAPIV1).Group("/file")
	v1.GET("/list-file", core.Handle(apiv1.ListPodFile))
	v1.GET("/download-from-pod", core.Handle(apiv1.DownloadFileFromPod))
	v1.POST("/upload-to-pod", core.Handle(apiv1.UploadFileToPod))
}

func routeTCPDump(r gin.IRouter) {
	v1 := r.Group(prefixAPIV1).Group("/tcpdump")
	v1.GET("/check-dependencies", core.Handle(apiv1.TCPDumpCheckDependencies))
	v1.POST("/run", core.Handle(apiv1.TCPDumpRun))
	v1.GET("/run", core.Handle(apiv1.TCPDumpRunWS))
	v1.GET("/run/", core.Handle(apiv1.TCPDumpRunWS))
	v1.GET("/tasks", core.Handle(apiv1.TCPDumpList))
	v1.GET("/download", core.Handle(apiv1.TCPDumpDownload))
	v1.POST("/stop", core.Handle(apiv1.TCPDumpStop))
	v1.GET("/ws", core.Handle(apiv1.TCPDumpWS))
	v1.GET("/ws/", core.Handle(apiv1.TCPDumpWS))
}

func routeTerminal(r gin.IRouter) {
	v1 := r.Group(prefixAPIV1).Group("/terminal")
	v1.GET("/exec", core.Handle(apiv1.Terminal))
	v1.GET("/exec/", core.Handle(apiv1.Terminal))
}

func routeDebug(r gin.IRouter) {
	v1 := r.Group(prefixAPIV1).Group("/debug")
	v1.GET("/run", core.Handle(apiv1.DebugRun))
}

func routeConfigMap(r gin.IRouter) {
	v1 := r.Group(prefixAPIV1).Group("/config-map")
	v1.GET("/configurations", core.Handle(apiv1.ListConfigMapConfiguration))
	v1.GET("/configuration-data", core.Handle(apiv1.GetConfigMapConfigurationData))
	v1.POST("/save-configuration", core.Handle(apiv1.SaveConfigMapConfiguration))
	v1.DELETE("/configuration", core.Handle(apiv1.DeleteConfigMapConfiguration))
}
