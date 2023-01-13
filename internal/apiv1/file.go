package apiv1

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"path"

	"github.com/gin-gonic/gin"

	"k8z/internal/model/dto"
	"k8z/internal/service"
	"k8z/pkg/component/core"
)

func ListPodFile(c *core.Context) {
	var params dto.ListPodFileReq
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	data, err := service.ListPodFile(c.Request.Context(), &params)
	if err != nil {
		c.JSONE(core.CodeErr, "error: "+err.Error(), nil)
		return
	}
	c.JSONOK(gin.H{"current": params.Path, "files": data})
}

func DownloadFileFromPod(c *core.Context) {
	var params dto.DownloadFileFromPod
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	data, err := service.DownloadFileFromPod(c.Request.Context(), &params)
	if err != nil {
		c.JSONE(core.CodeErr, "error: "+err.Error(), nil)
		return
	}
	c.Writer.WriteHeader(http.StatusOK)
	var outputName string
	if len(params.Paths) > 1 {
		outputName = path.Base(path.Clean(params.Paths[0])) + "+"
	} else {
		outputName = path.Base(path.Clean(params.Paths[0]))
	}
	c.Header("Content-Disposition", "attachment; filename="+outputName+".tar")
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", fmt.Sprintf("%d", len(data)))
	c.Writer.Write(data)
}

func UploadFileToPod(c *core.Context) {
	var params dto.UploadFileToPod
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	fh, err := c.FormFile("file")
	if err != nil {
		c.JSONE(core.CodeErr, "获取文件错误: "+err.Error(), nil)
		return
	}
	params.Filename = fh.Filename
	f, err := fh.Open()
	if err != nil {
		c.JSONE(core.CodeErr, "open文件错误: "+err.Error(), nil)
		return
	}
	params.SrcContent, _ = ioutil.ReadAll(f)
	err = service.UploadFileToPod(c.Request.Context(), &params)
	if err != nil {
		c.JSONE(core.CodeErr, "error: "+err.Error(), nil)
		return
	}
	c.JSONOK()
}
