package apiv1

import (
	"k8z/internal/model/dto"
	"k8z/internal/service"
	"k8z/pkg/component/core"
)

func PODProxyHTTP(c *core.Context) {
	var params dto.PODProxyHTTPReq
	err := c.Bind(&params)
	if err != nil {
		c.JSONE(core.CodeErr, "参数无效: "+err.Error(), nil)
		return
	}
	data, err := service.PODProxyHTTP(c.Request.Context(), &params)
	if err != nil {
		c.JSONE(core.CodeErr, "代理请求出错: "+err.Error(), nil)
		return
	}
	c.JSONOK(data)
}
