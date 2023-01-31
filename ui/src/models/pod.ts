import type { ConfigMapInfo } from '@/services/configmap';
import type { Pod } from '@/services/pods';
import { k8zStorageKeys, localStorageManage, removeLocalStorageManage } from '@/utils/storageUtil';
import { useCallback, useState } from 'react';

export default () => {
  const [cluster, setCluster] = useState<string>();
  const [namespace, setNamespace] = useState<string>();
  const [currentPod, setCurrentPod] = useState<Pod>();
  const [currentConfigmap, setCurrentConfigmap] = useState<ConfigMapInfo>();

  const handleUpdateCluster = useCallback((cluster: string) => {
    setCluster(cluster);
    localStorageManage(k8zStorageKeys.cluster, cluster);
  }, []);

  const handleClearCluster = useCallback(() => {
    setCluster(undefined);
    removeLocalStorageManage(k8zStorageKeys.cluster);
  }, []);

  const handleUpdateNamespace = useCallback((namespace: string) => {
    setNamespace(namespace);
    localStorageManage(k8zStorageKeys.namespace, namespace);
  }, []);

  const handleClearNamespace = useCallback(() => {
    setNamespace(undefined);
    removeLocalStorageManage(k8zStorageKeys.namespace);
  }, []);

  const handleUpdateCurrentPod = useCallback((pod: Pod) => {
    localStorageManage(k8zStorageKeys.podInfo, JSON.stringify(pod));
    setCurrentPod(pod);
  }, []);

  const handleClearCurrentPod = useCallback(() => {
    removeLocalStorageManage(k8zStorageKeys.podInfo);
    setCurrentPod(undefined);
  }, []);

  const handleUpdateCurrentConfigmap = useCallback((configMap: ConfigMapInfo) => {
    localStorageManage(k8zStorageKeys.configmapInfo, JSON.stringify(configMap));
    setCurrentConfigmap(configMap);
  }, []);

  const handleClearCurrentConfigmap = useCallback(() => {
    removeLocalStorageManage(k8zStorageKeys.configmapInfo);
    setCurrentConfigmap(undefined);
  }, []);

  return {
    cluster,
    namespace,
    currentPod,
    currentConfigmap,
    handleUpdateCluster,
    handleClearCluster,
    handleUpdateNamespace,
    handleClearNamespace,
    handleUpdateCurrentPod,
    handleClearCurrentPod,
    handleUpdateCurrentConfigmap,
    handleClearCurrentConfigmap,
  };
};
