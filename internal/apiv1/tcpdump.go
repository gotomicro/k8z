package apiv1

import (
	"fmt"
	"net/http"
	"path"

	"github.com/gin-gonic/gin"
	"github.com/gotomicro/ego/server/egin"

	"k8z/internal/invoker"
	"k8z/internal/model/dto"
	"k8z/internal/service"
	"k8z/internal/util"
	"k8z/pkg/component/core"
)

func TCPDumpCheckDependencies(c *core.Context) {
	err := service.TCPDump.CheckDependencies()
	var resp dto.CheckDependenciesResponse
	des, ok := err.(util.DepErrors)
	resp.DependencyErrors, resp.Success = des, !ok
	c.JSONOK(resp)
}

func TCPDumpRun(c *core.Context) {
	var params dto.ReqRunTCPDump
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	taskId, err := service.TCPDump.Run(c.Request.Context(), &params)
	if err != nil {
		c.JSONE(core.CodeErr, "tcpdump 运行错误: "+err.Error(), nil)
		return
	}
	c.JSONOK(gin.H{"taskId": taskId})
}

func TCPDumpRunWS(c *core.Context) {
	var params dto.ReqRunTCPDump
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	invoker.Gin.BuildWebsocket().Upgrade(c.Writer, c.Request, c.Context, func(conn *egin.WebSocketConn, err error) {
		service.TCPDump.RunWS(c.Request.Context(), &params, conn.Conn)
	})
}

func TCPDumpList(c *core.Context) {
	var params dto.ReqTCPDumpList
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(1, "参数无效: "+err.Error(), nil)
		return
	}
	data, err := service.TCPDump.List(c.Request.Context(), &params)
	if err != nil {
		c.JSONE(1, "tcpdump list: "+err.Error(), nil)
		return
	}
	c.JSONOK(data)
}

func TCPDumpStop(c *core.Context) {
	var params dto.ReqTCPDumpStop
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(1, "参数无效: "+err.Error(), nil)
		return
	}
	err = service.TCPDump.Stop(c.Request.Context(), params.TaskId)
	if err != nil {
		c.JSONE(1, "tcpdump stop: "+err.Error(), nil)
		return
	}
	c.JSONOK()
}

func TCPDumpDownload(c *core.Context) {
	var params dto.ReqTCPDumpDownload
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(1, "参数无效: "+err.Error(), nil)
		return
	}
	data, err := service.TCPDump.DownloadPackets(c.Request.Context(), params.TaskId)
	if err != nil {
		c.JSONE(1, "tcpdump download: "+err.Error(), nil)
		return
	}
	c.Writer.WriteHeader(http.StatusOK)
	c.Header("Content-Disposition", "attachment; filename="+path.Base(params.TaskId))
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", fmt.Sprintf("%d", len(data)))
	c.Writer.Write(data)
}

func TCPDumpWS(c *core.Context) {
	invoker.Gin.BuildWebsocket().Upgrade(c.Writer, c.Request, c.Context, func(conn *egin.WebSocketConn, err error) {
		for {
			//读取ws中的数据
			mt, message, err := conn.ReadMessage()
			if err != nil {
				break
			}
			if string(message) == "ping" {
				message = []byte("pong")
			}
			//写入ws数据
			err = conn.WriteMessage(mt, message)
			if err != nil {
				break
			}
		}
	})
}
