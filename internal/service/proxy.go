package service

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	jsoniter "github.com/json-iterator/go"
	"k8s.io/client-go/rest"

	"k8z/internal/model/dto"
	"k8z/internal/service/kube"
)

type transport struct {
	rt         http.RoundTripper
	respHeader *http.Header
}

func (t *transport) RoundTrip(request *http.Request) (*http.Response, error) {
	if t.rt == nil {
		t.rt = http.DefaultTransport
	}
	if t.respHeader == nil {
		t.respHeader = &http.Header{}
	}
	resp, err := t.rt.RoundTrip(request)
	if err != nil {
		return resp, err
	}
	*t.respHeader = resp.Header
	return resp, err
}

func retrieveResponseHeader(cli *http.Client, respHeader *http.Header) {
	cli.Transport = &transport{rt: cli.Transport, respHeader: respHeader}
}

func PODProxyHTTP(ctx context.Context, req *dto.PODProxyHTTPReq) (*dto.PODProxyHTTPResp, error) {
	if !strings.HasPrefix(req.URL, "http://") {
		req.URL = "http://" + req.URL
	}
	u, err := url.Parse(req.URL)
	if err != nil {
		return nil, err
	}
	kubeManager, err := kube.GetClusterManager(req.ClusterName)
	if err != nil {
		return nil, err
	}
	restClient := kubeManager.Client.CoreV1().RESTClient()
	var respHeader http.Header
	retrieveResponseHeader(restClient.(*rest.RESTClient).Client, &respHeader)
	var resourceName string
	if u.Port() != "" {
		resourceName = fmt.Sprintf("%s:%s", req.PodName, u.Port())
	} else {
		resourceName = req.PodName
	}
	request := restClient.Verb(req.Method).
		Namespace(req.Namespace).
		Resource("pods").
		Name(resourceName).
		SubResource("proxy").
		Body([]byte(req.Payload)).
		Suffix(u.Path)
	for key, vals := range u.Query() {
		request.Param(key, vals[0])
	}
	var headers map[string]string
	jsoniter.UnmarshalFromString(req.Headers, &headers)
	for key, val := range headers {
		request.SetHeader(key, val)
	}
	var statusCode int
	var start = time.Now()
	res := request.Do(ctx)
	var duration = time.Since(start)
	body, err := res.StatusCode(&statusCode).Raw()
	if err != nil {
		return nil, err
	}
	var respHeaderMap = make(map[string]string, len(respHeader))
	for key, vals := range respHeader {
		respHeaderMap[key] = vals[0]
	}
	return &dto.PODProxyHTTPResp{
		Body:          string(body),
		Headers:       respHeaderMap,
		StatusCode:    statusCode,
		Status:        http.StatusText(statusCode),
		Duration:      duration.Milliseconds(),
		ContentLength: len(body),
	}, nil
}
