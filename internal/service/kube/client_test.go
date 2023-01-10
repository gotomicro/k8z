package kube

import (
	"fmt"
	"strings"
	"testing"

	"github.com/BurntSushi/toml"
	"github.com/gotomicro/ego/core/econf"
)

func TestGetAllClusters(t *testing.T) {
	econf.LoadFromReader(strings.NewReader(`
	[[cluster]]
		apiServer="127.0.0.1"
`), toml.Unmarshal)
	gotResult, err := GetAllClusters()
	fmt.Printf("err--------------->"+"%+v\n", err)
	for _, value := range gotResult {
		fmt.Printf("gotResult--------------->"+"%+v\n", value)
	}
}
