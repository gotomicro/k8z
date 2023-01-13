package kube

import (
	"fmt"
	"strings"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"

	"k8z/internal/model/dto"
	"k8z/internal/service/kube/api"
)

func (cm ClusterManager) ClusterResources() *dto.KubeCluster {
	var getWorkloadFromPod = func(cm *ClusterManager, pod *corev1.Pod) (kind string, name string) {
		for _, ref := range pod.OwnerReferences {
			var found bool
			switch ref.Kind {
			case "ReplicaSet":
				found = true
				kind = "deployment"
				replicasetObj, err := cm.KubeClient.Get(api.ResourceNameReplicaSet, pod.Namespace, ref.Name)
				if err != nil {
					return "", ""
				}
				replicaset := replicasetObj.(*appsv1.ReplicaSet)
				for _, ref := range replicaset.OwnerReferences {
					if ref.Kind == "Deployment" {
						return kind, ref.Name
					}
				}
			case "CronJob", "Job", "StatefulSet", "DaemonSet":
				found = true
				kind = strings.ToLower(ref.Kind)
				name = ref.Name
			}
			if found {
				break
			}
		}
		return
	}
	var getPodReady = func(pod *corev1.Pod) (bool, string) {
		if pod.Status.Phase == corev1.PodSucceeded {
			return false, "Succeeded"
		}
		if pod.Status.Phase == corev1.PodPending {
			return false, "Pending"
		}
		if pod.Status.Phase == corev1.PodFailed {
			return false, pod.Status.Reason
		}
		var ready = true
		var reason = ""
		for _, cond := range pod.Status.Conditions {
			if cond.Status != corev1.ConditionTrue {
				ready = false
				reason = cond.Reason
				break
			}
		}
		if ready {
			return true, ""
		}
		for _, cs := range pod.Status.ContainerStatuses {
			if cs.Ready {
				continue
			}
			if cs.State.Waiting != nil {
				return false, cs.State.Waiting.Reason
			}
			if cs.State.Terminated != nil {
				return false, cs.State.Terminated.Reason
			}
		}
		return false, reason
	}
	var namespaceMap = make(map[string]*dto.KubeNamespace)
	var workloadMap = make(map[string]*dto.KubeWorkload)
	var ok bool
	allPodsObj, err := cm.KubeClient.List(api.ResourceNamePod, "", "")
	if err != nil {
		return nil
	}
	for _, podObj := range allPodsObj {
		pod := podObj.(*corev1.Pod)
		workloadKind, workloadName := getWorkloadFromPod(&cm, pod)
		if workloadName == "" {
			workloadKind = "-"
			workloadName = "-"
		}
		var workload *dto.KubeWorkload
		workload, ok = workloadMap[fmt.Sprintf("%s/%s/%s", pod.Namespace, workloadKind, workloadName)]
		if !ok {
			workload = &dto.KubeWorkload{
				Cluster:   cm.Cluster.Name,
				Namespace: pod.Namespace,
				Kind:      workloadKind,
				Name:      workloadName,
				Pods:      nil,
			}
			workloadMap[fmt.Sprintf("%s/%s/%s", pod.Namespace, workloadKind, workloadName)] = workload
		}
		var containers []string
		for _, c := range pod.Spec.Containers {
			containers = append(containers, c.Name)
		}
		ready, reason := getPodReady(pod)
		workload.Pods = append(workload.Pods, &dto.KubePod{
			Cluster:      cm.Cluster.Name,
			Namespace:    pod.Namespace,
			Workload:     workloadName,
			WorkloadKind: workloadKind,
			Name:         pod.Name,
			Containers:   containers,
			Ready:        ready,
			Reason:       reason,
		})
	}
	for _, dtoWorkload := range workloadMap {
		var namespace *dto.KubeNamespace
		namespace, ok = namespaceMap[dtoWorkload.Namespace]
		if !ok {
			namespace = &dto.KubeNamespace{
				Cluster:   cm.Cluster.Name,
				Name:      dtoWorkload.Namespace,
				Workloads: nil,
			}
			namespaceMap[dtoWorkload.Namespace] = namespace
		}
		namespace.Workloads = append(namespace.Workloads, dtoWorkload)
	}
	var namespaces []*dto.KubeNamespace
	for _, dtoNamespace := range namespaceMap {
		namespaces = append(namespaces, dtoNamespace)
	}
	return &dto.KubeCluster{
		Name:       cm.Cluster.Name,
		Namespaces: namespaces,
	}
}
