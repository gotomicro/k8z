package apiv1

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"k8z/internal/model/dto"
	"k8z/internal/service"
	"k8z/internal/util"
	"k8z/pkg/component/core"
)

func PProfCheckDependencies(c *core.Context) {
	err := service.Pprof.CheckDependencies()
	var resp dto.CheckDependenciesResponse
	des, ok := err.(util.DepErrors)
	resp.DependencyErrors, resp.Success = des, !ok
	c.JSONOK(resp)
}

func PProfRun(c *core.Context) {
	var params dto.ReqRunProfile
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	if err := service.Pprof.CheckDependencies(); err != nil {
		c.JSONE(core.CodeErr, "当前环境缺少依赖：\n"+err.Error(), nil)
		return
	}
	url, err := service.Pprof.GeneratePprof(params)
	if err != nil {
		c.JSONE(core.CodeErr, "生成pprof: "+err.Error(), nil)
		return
	}
	c.JSONOK(gin.H{"url": url})
}

func PprofList(c *core.Context) {
	var params dto.ReqGetPprofList
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(1, "参数无效: "+err.Error(), nil)
		return
	}
	data, err := service.Pprof.GetPprofList(params)
	if err != nil {
		c.JSONE(1, "PprofList: "+err.Error(), nil)
		return
	}
	c.JSONOK(data)
}

func PProfGraph(c *core.Context) {
	var params dto.ReqPprofGraph
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(1, "参数无效: "+err.Error(), nil)
		return
	}

	data, err := service.Pprof.FindGraphData(params)
	if err != nil {
		c.JSONE(1, "FindGraphData: "+err.Error(), nil)
		return
	}
	c.Data(http.StatusOK, "image/svg+xml", data)
}

func PProfDiffGraph(c *core.Context) {
	var params dto.ReqPProfDiffGraph
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(1, "参数无效: "+err.Error(), nil)
		return
	}

	data, err := service.Pprof.PprofDiffGraph(params)
	if err != nil {
		c.JSONE(1, "PprofDiffGraph: "+err.Error(), nil)
		return
	}
	c.Data(http.StatusOK, "image/svg+xml", data)
}

func PProfRunDiff(c *core.Context) {
	var params dto.ReqPProfRunDiff
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(1, "参数无效: "+err.Error(), nil)
		return
	}

	err = service.Pprof.GenerateDiff(params.BaseUrl, params.TargetUrl)
	if err != nil {
		c.JSONE(1, "PProfRunDiff: "+err.Error(), nil)
		return
	}
	c.JSONOK()
}

func PProfDownload(c *core.Context) {
	var params dto.ReqPprofDownload
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(1, "参数无效: "+err.Error(), nil)
		return
	}
	data, err := service.Pprof.DownloadPProfBinData(params)
	if err != nil {
		c.JSONE(1, "FindGraphData: "+err.Error(), nil)
		return
	}
	downloadName := fmt.Sprintf("%s.zip", params.Url[strings.LastIndex(params.Url, "/")+1:])
	c.Header("Content-Disposition", "attachment;filename="+downloadName)
	c.Data(http.StatusOK, "application/zip", data)
}
