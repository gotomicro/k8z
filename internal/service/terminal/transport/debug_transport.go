package transport

import (
	"k8s.io/client-go/tools/remotecommand"
)

type DebugTransport struct {
	ResizeChan chan remotecommand.TerminalSize
	Commands   []string
}

func NewDebugTransport() (d *DebugTransport) {
	return &DebugTransport{
		ResizeChan: make(chan remotecommand.TerminalSize),
	}
}

func (d *DebugTransport) Read(p []byte) (n int, err error) {
	if len(d.Commands) <= 0 {
		return 0, nil
	}
	cmd := d.Commands[0]
	copy(p, cmd)
	cmdList := make([]string, 0)
	for i := 1; i < len(d.Commands); i++ {
		cmdList = append(cmdList, d.Commands[i])
	}
	d.Commands = cmdList
	return len(cmd), nil
}

func (d *DebugTransport) Write(p []byte) (n int, err error) {
	return len(p), nil
}

func (d *DebugTransport) Next() *remotecommand.TerminalSize {
	ret := <-d.ResizeChan
	return &ret
}

func (d DebugTransport) Close() {
	return
}
