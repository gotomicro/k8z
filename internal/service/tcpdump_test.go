package service

import (
	"bytes"
	"context"
	"testing"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/stretchr/testify/require"

	"k8z/internal/model/dto"
)

func Test_tcpDump_Run(t1 *testing.T) {
	key, err := TCPDump.Run(context.Background(), &dto.ReqRunTCPDump{
		ClusterName:   "c1",
		PodName:       "pod-xxxx",
		Namespace:     "default",
		ContainerName: "",
		Interface:     "any",
		Filter:        "",
	})
	require.NoError(t1, err)
	time.Sleep(time.Second * 10)
	TCPDump.Stop(context.Background(), key)
	time.Sleep(time.Second * 3)
}

func Test_tcpDump_Run1(t1 *testing.T) {
	buf := bytes.NewBuffer(nil)
	var data = make([]byte, 10)
	buf.WriteByte(0x03)
	n, err := buf.Read(data)
	spew.Dump(n, err)

}

func Test_tcpDump_List(t1 *testing.T) {
	list, err := TCPDump.List(context.Background(), &dto.ReqTCPDumpList{
		ClusterName:   "c1",
		PodName:       "pod-xxxx",
		Namespace:     "default",
		ContainerName: "",
	})
	require.NoError(t1, err)
	spew.Dump(list)
}
