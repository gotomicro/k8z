package transport

import (
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
	"k8s.io/client-go/tools/remotecommand"
)

const (
	MsgResize = "resize"
	MsgStdin  = "stdin"
	MsgPing   = "ping"
	MsgPong   = "pong"
	MsgStdout = "stdout"
	MsgClose  = "close"
)

type WSTransport struct {
	wsConn   *websocket.Conn
	sizeChan chan remotecommand.TerminalSize
	stopChan chan struct{}
	closed   bool
}

type WsMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
	Cols uint16      `json:"cols"`
	Rows uint16      `json:"rows"`
}

type message struct {
	Type string `json:"type"`
	Data string `json:"data"`
	Cols uint16 `json:"cols"`
	Rows uint16 `json:"rows"`
}

func NewWSTransport(conn *websocket.Conn) *WSTransport {
	return &WSTransport{
		wsConn:   conn,
		sizeChan: make(chan remotecommand.TerminalSize),
		stopChan: make(chan struct{}),
		closed:   false,
	}
}

func (w *WSTransport) Read(p []byte) (n int, err error) {
	if w.closed {
		return copy(p, EndTransmission), nil
	}
	msgType, msgBytes, err := w.wsConn.ReadMessage()
	if err != nil {
		return w.exitTerminal(p, fmt.Sprintf("wsConn read failed. err=%s", err.Error()))
	}
	if msgType != websocket.TextMessage {
		return 0, nil
	}
	var msg message
	if err = json.Unmarshal(msgBytes, &msg); err != nil {
		return w.exitTerminal(p, fmt.Sprintf("wsConn read failed. err=%s", err.Error()))
	}
	switch msg.Type {
	case MsgStdin:
		return copy(p, msg.Data), nil
	case MsgResize:
		w.sizeChan <- remotecommand.TerminalSize{
			Width:  msg.Cols,
			Height: msg.Rows,
		}
		return
	case MsgPing:
		_, _ = w.Write([]byte(MsgPong))
		return copy(p, ""), nil
	default:
		return w.exitTerminal(p, fmt.Sprintf("unknow message type: %s", msg.Type))
	}
}

func (w *WSTransport) Write(p []byte) (n int, err error) {
	msg, err := json.Marshal(message{
		Type: MsgStdout,
		Data: string(p),
	})
	if err != nil {
		return 0, nil
	}
	if err = w.wsConn.WriteMessage(websocket.TextMessage, msg); err != nil {
		return 0, err
	}
	return len(p), nil
}

func (w *WSTransport) Next() *remotecommand.TerminalSize {
	select {
	case size := <-w.sizeChan:
		return &size
	case <-w.stopChan:
		return nil
	}
}

func (w *WSTransport) Close() {
	w.stopChan <- struct{}{}
}

func (w *WSTransport) exitTerminal(p []byte, msg string) (n int, err error) {
	w.closed = true
	return copy(p, EndTransmission), nil
}

func (w *WSTransport) IsClose() bool {
	return w.closed
}
