package transport

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/gotomicro/ego/core/elog"
)

type SimplifyTransport struct {
	conn     *websocket.Conn
	stopChan chan struct{}
	closed   bool
	l        sync.RWMutex
}

func NewSimplifyTransport(conn *websocket.Conn) *SimplifyTransport {
	return &SimplifyTransport{
		conn:     conn,
		stopChan: make(chan struct{}),
		closed:   false,
		l:        sync.RWMutex{},
	}
}

func (w *SimplifyTransport) Read() (err error) {
	if w.closed {
		return
	}
	if w.conn == nil {
		w.closed = true
		return
	}
	msgType, msgBytes, err := w.conn.ReadMessage()
	if err != nil {
		return
	}
	elog.Info("websocket", elog.String("msgBytes", string(msgBytes)))
	if msgType != websocket.TextMessage {
		return
	}
	var msg message
	if err = json.Unmarshal(msgBytes, &msg); err != nil {
		w.l.Lock()
		_ = w.conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("conn read failed. err=%s", err.Error())))
		w.l.Unlock()
		return
	}
	elog.Info("websocket", elog.Any("msg", msg))
	switch msg.Type {
	case MsgClose:
		_ = w.conn.Close()
		return
	case MsgStdin:
		return
	case MsgResize:
		return
	case MsgPing:
		w.l.Lock()
		_ = w.conn.WriteMessage(websocket.TextMessage, []byte(MsgPong))
		w.l.Unlock()
		return
	default:
	}
	return nil
}

func (w *SimplifyTransport) WriteStdoutData(data interface{}) (n int, err error) {
	msg, err := json.Marshal(WsMessage{
		Type: MsgStdout,
		Data: data,
	})
	if err != nil {
		return 0, nil
	}
	w.l.Lock()
	err = w.conn.WriteMessage(websocket.TextMessage, msg)
	w.l.Unlock()
	if err != nil {
		return 0, err
	}
	return len(msg), nil
}

func (w *SimplifyTransport) Write(p []byte) (n int, err error) {
	msg, err := json.Marshal(message{
		Type: MsgStdout,
		Data: string(p),
	})
	if err != nil {
		return 0, nil
	}
	w.l.Lock()
	err = w.conn.WriteMessage(websocket.TextMessage, msg)
	w.l.Unlock()
	if err != nil {
		return 0, err
	}
	return len(p), nil
}

func (w *SimplifyTransport) Close() {
	w.stopChan <- struct{}{}
}

func (w *SimplifyTransport) IsClose() bool {
	return w.closed
}
