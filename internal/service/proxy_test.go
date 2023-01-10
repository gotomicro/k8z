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
		ClusterName: "shimo-dev",
		PodName:     "mdp-69949797f6-lww25",
		Namespace:   "default",
		Method:      "GET",
		URL:         "http://mdp-69949797f6-lww25:9003/metrics",
		Payload:     "",
		Headers:     "",
	})
	require.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)
}
