package terminal

import (
	v1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/remotecommand"

	"k8z/internal/service/terminal/transport"
)

type WebTerminal struct {
	executor      remotecommand.Executor
	transport     transport.Transport
	restConfig    *rest.Config
	namespace     string
	podName       string
	containerName string
}

func NewWebTerminal(config *rest.Config, namespace, podName, containerName string, transport transport.Transport) (webTerminal *WebTerminal, err error) {
	restClient, err := kubernetes.NewForConfig(config)
	if err != nil {
		return
	}
	execReq := restClient.CoreV1().RESTClient().Post().
		Resource("pods").
		Name(podName).
		Namespace(namespace).
		SubResource("exec").
		VersionedParams(&v1.PodExecOptions{
			Stdin:     true,
			Stdout:    true,
			Stderr:    true,
			TTY:       true,
			Container: containerName,
			Command:   []string{"/bin/sh", "-c", "TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c \"/bin/bash\" /dev/null || exec /bin/bash) || exec /bin/sh"},
		}, scheme.ParameterCodec)
	executor, err := remotecommand.NewSPDYExecutor(config, "POST", execReq.URL())
	if err != nil {
		return
	}
	webTerminal = &WebTerminal{
		executor:      executor,
		transport:     transport,
		restConfig:    config,
		namespace:     namespace,
		podName:       podName,
		containerName: containerName,
	}
	return
}

func (w *WebTerminal) Run() (err error) {
	return w.executor.Stream(remotecommand.StreamOptions{
		Stdin:             w.transport,
		Stdout:            w.transport,
		Stderr:            w.transport,
		TerminalSizeQueue: w.transport,
		Tty:               true,
	})
}
