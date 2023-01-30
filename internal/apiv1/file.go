package apiv1

import (
	"io"
	"io/ioutil"
	"net/http"
	"path"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/gotomicro/ego/core/elog"
	"go.uber.org/zap"

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
	//c.Header("Content-Length", fmt.Sprintf("%d", len(data)))
	_, err = io.Copy(c.Writer, data)
	if err != nil {
		elog.Error("download file from pod error", zap.Error(err))
		return
	}
}

func UploadFileToPod(c *core.Context) {
	var params dto.UploadFileToPod
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	if params.FilePath != "" {
		params.Filename = filepath.Base(params.FilePath)
	} else {
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
	}
	err = service.UploadFileToPod(c.Request.Context(), &params)
	if err != nil {
		c.JSONE(core.CodeErr, "error: "+err.Error(), nil)
		return
	}
	c.JSONOK()
}
