package apiv1

import (
	"context"
	"fmt"
	"time"

	"github.com/gotomicro/ego/server/egin"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	utilrand "k8s.io/apimachinery/pkg/util/rand"
	"k8s.io/client-go/kubernetes/scheme"

	"k8z/internal/invoker"
	"k8z/internal/model/dto"
	"k8z/internal/service/kube"
	"k8z/internal/service/kube/api"
	"k8z/internal/service/terminal"
	"k8z/internal/service/terminal/transport"
	"k8z/pkg/component/core"
)

var nameSuffixFunc = utilrand.String

func DebugRun(c *core.Context) {
	invoker.Gin.BuildWebsocket().Upgrade(c.Writer, c.Request, c.Context, func(conn *egin.WebSocketConn, err error) {
		wsTransport := transport.NewWSTransport(conn.Conn)
		var params dto.ReqRunDebug
		err = c.Bind(&params)
		if err != nil {
			_, _ = wsTransport.Write([]byte("参数无效:" + err.Error()))
			return
		}
		cm, err := kube.GetClusterManager(params.ClusterName)
		if err != nil {
			_, _ = wsTransport.Write([]byte("cluster not found"))
			return
		}
		podObj, err := cm.KubeClient.Get(api.ResourceNamePod, params.Namespace, params.PodName)
		if err != nil {
			_, _ = wsTransport.Write([]byte("get pod error: " + err.Error()))
			return
		}
		pod := podObj.(*corev1.Pod)
		debugPod, err := generateDebugPod(pod, params.ContainerName)
		if err != nil {
			_, _ = wsTransport.Write([]byte("generate debug pod error: " + err.Error()))
			return
		}
		debugPod, err = cm.Client.CoreV1().Pods(params.Namespace).Create(c.Request.Context(), debugPod, metav1.CreateOptions{})
		if err != nil {
			_, _ = wsTransport.Write([]byte("create debug pod error: " + err.Error()))
			return
		}
		podName := debugPod.Name
		// wait ready
		tk := time.NewTicker(time.Second * 1)
		defer tk.Stop()
		ctx, cancel := context.WithTimeout(c.Request.Context(), time.Minute)
		defer cancel()
		for range tk.C {
			select {
			case <-ctx.Done():
				_, _ = wsTransport.Write([]byte("wait for debug pod ready timeout"))
				return
			default:
			}
			debugPod, err = cm.Client.CoreV1().Pods(params.Namespace).Get(c.Request.Context(), debugPod.Name, metav1.GetOptions{})
			if err != nil {
				_ = cm.Client.CoreV1().Pods(params.Namespace).Delete(context.Background(), podName, metav1.DeleteOptions{})
				_, _ = wsTransport.Write([]byte("run debug pod error: " + err.Error()))
				return
			}
			var ready = true
			for _, cond := range debugPod.Status.Conditions {
				if cond.Status == corev1.ConditionFalse {
					ready = false
					break
				}
			}
			if !ready {
				continue
			}
			break
		}
		restConfig := cm.Config
		restConfig.ContentConfig.GroupVersion = &metav1.Unversioned
		restConfig.ContentConfig.NegotiatedSerializer = scheme.Codecs

		tml, err := terminal.NewWebTerminal(cm.Config, params.Namespace, podName, params.ContainerName, wsTransport)
		if err != nil {
			_, _ = wsTransport.Write([]byte("连接终端失败，该Pod可能已经下线\n" + err.Error()))
			return
		}
		err = tml.Run()
		_ = cm.Client.CoreV1().Pods(params.Namespace).Delete(context.Background(), podName, metav1.DeleteOptions{})
		if err != nil {
			_, _ = wsTransport.Write([]byte("连接终端失败:" + err.Error()))
			return
		}
	})
}

func generateDebugPod(pod *corev1.Pod, containerName string) (*corev1.Pod, error) {
	pn := fmt.Sprintf("debugger-%s-%s", pod.Name, nameSuffixFunc(5))

	p := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: pn,
		},
		Spec: pod.Spec,
	}
	// TODO add a debugger container
	for i := range p.Spec.Containers {
		// 清除健康检查
		p.Spec.Containers[i].StartupProbe = nil
		p.Spec.Containers[i].ReadinessProbe = nil
		p.Spec.Containers[i].LivenessProbe = nil
		if p.Spec.Containers[i].Name == containerName {
			p.Spec.Containers[i].Command = []string{"sh", "-c", "sleep 36000"}
		}
	}
	return p, nil
}
