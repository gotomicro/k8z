package apiv1

import (
	"github.com/gotomicro/ego/server/egin"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/scheme"

	"k8z/internal/invoker"
	"k8z/internal/model/dto"
	"k8z/internal/service/kube"
	"k8z/internal/service/terminal"
	"k8z/internal/service/terminal/transport"
	"k8z/pkg/component/core"
)

func Terminal(c *core.Context) {
	var params dto.ReqTerminal
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	cm, err := kube.GetClusterManager(params.ClusterName)
	if err != nil {
		c.JSONE(core.CodeErr, "cluster not found", nil)
		return
	}
	invoker.Gin.BuildWebsocket().Upgrade(c.Writer, c.Request, c.Context, func(conn *egin.WebSocketConn, err error) {
		wsTransport := transport.NewWSTransport(conn.Conn)
		restConfig := cm.Config
		restConfig.ContentConfig.GroupVersion = &v1.Unversioned
		restConfig.ContentConfig.NegotiatedSerializer = scheme.Codecs

		tml, err := terminal.NewWebTerminal(cm.Config, params.Namespace, params.PodName, params.ContainerName, wsTransport)
		if err != nil {
			_, _ = wsTransport.Write([]byte("连接终端失败，该Pod可能已经下线\n" + err.Error()))
			return
		}
		err = tml.Run()
		if err != nil {
			_, _ = wsTransport.Write([]byte("连接终端失败:" + err.Error()))
			return
		}
	})
}
