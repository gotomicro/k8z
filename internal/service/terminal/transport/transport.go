package transport

import (
	"io"

	"k8s.io/client-go/tools/remotecommand"
)

type Transport interface {
	io.Reader
	io.Writer
	remotecommand.TerminalSizeQueue
	Close()
}

const EndTransmission = "exit\r\n"
