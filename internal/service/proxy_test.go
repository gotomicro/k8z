package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"k8z/internal/model/dto"
)

func TestPODProxyHTTP(t *testing.T) {
	resp, err := PODProxyHTTP(context.Background(), &dto.PODProxyHTTPReq{
		ClusterName: "c1",
		PodName:     "pod-xxxx",
		Namespace:   "default",
		Method:      "GET",
		URL:         "http://pod-xxxx:9003/metrics",
		Payload:     "",
		Headers:     "",
	})
	require.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
}
