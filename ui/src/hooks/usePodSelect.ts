import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Clusters } from '@/services/cluster';
import { getClusterList } from '@/services/cluster';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import { message } from 'antd';
import type { Namespace } from '@/services/namespace';
import { getNamespaceList } from '@/services/namespace';
import { SHOW_ALL_POD_PATHNAME_ARR, SHOW_CONFIGMAP_PATHNAME_ARR } from '@/components/PodSelectCard';
import type { ConfigMapInfo } from '@/services/configmap';
import { getConfigmaps } from '@/services/configmap';
import type { Pod } from '@/services/pods';
import { getPodListInNamespace } from '@/services/pods';
import { checkJsonStrUtils } from '@/utils/checkJsonUtils';
import { omit } from 'lodash';
import { useLocation } from 'umi';

interface PodSelectProps {
  cluster?: string;
  namespace?: string;
  handleUpdateCluster: (cluster: string) => void;
  handleUpdateNamespace: (namespace: string) => void;
  handleClearNamespace: () => void;
  handleClearCurrentPod: () => void;
  handleUpdateCurrentPod: (pod: Pod) => void;
  handleClearCurrentConfigmap: () => void;
  handleUpdateCurrentConfigmap: (configmap: ConfigMapInfo) => void;
}

export const usePodSelect = ({
  cluster,
  namespace,
  handleUpdateCluster,
  handleUpdateNamespace,
  handleClearNamespace,
  handleClearCurrentPod,
  handleUpdateCurrentPod,
  handleUpdateCurrentConfigmap,
  handleClearCurrentConfigmap,
}: PodSelectProps) => {
  const [clusterList, setClusterList] = useState<Clusters[]>([]);
  const [openCluster, setOpenCluster] = useState(false);
  const [loadingCluster, setLoadingCluster] = useState(false);

  const [namespaceList, setNamespaceList] = useState<Namespace[]>([]);
  const [openNamespace, setOpenNamespace] = useState(false);
  const [loadingNamespace, setLoadingNamespace] = useState(false);

  const [detail, setDetail] = useState<string>();
  const [detailList, setDetailList] = useState<Pod[] | ConfigMapInfo[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const currentLocation = useLocation();

  const isConfigMap = useMemo(
    () => SHOW_CONFIGMAP_PATHNAME_ARR.includes(currentLocation?.pathname),
    [currentLocation],
  );

  const handleClearPodOrConfigMap = useCallback(() => {
    if (isConfigMap) {
      handleClearCurrentConfigmap();
    } else {
      handleClearCurrentPod();
    }
  }, [handleClearCurrentConfigmap, handleClearCurrentPod, isConfigMap]);

  const handleUpdatePodOrConfigMap = useCallback(
    (detail: Pod | ConfigMapInfo) => {
      if (isConfigMap) {
        handleUpdateCurrentConfigmap(detail as ConfigMapInfo);
      } else {
        handleUpdateCurrentPod(detail as Pod);
      }
    },
    [handleUpdateCurrentConfigmap, handleUpdateCurrentPod, isConfigMap],
  );

  // 定位 select 下拉条
  const handlePopupContainer = useCallback(() => document.getElementById('pod')!, []);

  const getClusters = useCallback((isFocus?: boolean) => {
    setLoadingCluster(true);
    getClusterList()
      .then((res) => {
        if (res?.code !== 0) {
          message.warning({
            content: `[获取集群失败]: ${res?.msg ?? '未知错误'}`,
            key: 'cluster-warn',
          });
          return;
        }
        setClusterList(res.data);
        if (isFocus) {
          setOpenCluster(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCluster(false));
  }, []);

  const getNamespaces = useCallback((cluster, isFocus?: boolean) => {
    setLoadingNamespace(true);
    getNamespaceList({ cluster })
      .then((res) => {
        if (res?.code !== 0) {
          message.warning({
            content: `[获取 namespace 失败]: ${res?.msg ?? '未知错误'}`,
            key: 'cluster-warn',
          });
          return;
        }
        setNamespaceList(res.data);
        if (isFocus) {
          setOpenNamespace(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingNamespace(false));
  }, []);

  const getPodsOrConfigmap = useCallback(
    (cluster, namespace, isFocus?: boolean) => {
      const allowNotReady = SHOW_ALL_POD_PATHNAME_ARR.includes(currentLocation?.pathname);
      const getList = isConfigMap ? getConfigmaps : getPodListInNamespace;
      const params = isConfigMap
        ? { cluster, namespace }
        : { cluster, namespace, extra: { allowNotReady } };
      setLoadingDetail(true);
      getList(params)
        .then((res) => {
          if (res?.code !== 0) {
            message.warning({
              content: `[获取 ${isConfigMap ? 'configmap' : 'pod'} 失败]: ${
                res?.msg ?? '未知错误'
              }`,
              key: 'detail-warn',
            });
            return;
          }
          setDetailList(res.data);
          if (isFocus) {
            setOpenDetail(true);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingDetail(false));
    },
    [isConfigMap, currentLocation],
  );

  const handleChangeCluster = useCallback(() => {
    setNamespaceList([]);
    handleClearNamespace();
    setDetailList([]);
    setDetail(undefined);
    handleClearPodOrConfigMap();
  }, [handleClearPodOrConfigMap, handleClearNamespace]);

  const handleSelectCluster = useCallback(
    (value: string) => {
      handleUpdateCluster(value);
      setOpenCluster(false);
      getNamespaces(value);
    },
    [getNamespaces, handleUpdateCluster],
  );

  const handleMouseDownCluster = useCallback(() => {
    if (openCluster) {
      return;
    }
    getClusters(true);
  }, [getClusters, openCluster]);

  const handleBlurCluster = useCallback(() => setOpenCluster(false), []);

  const handleChangeNamespace = useCallback(() => {
    setDetail(undefined);
    setDetailList([]);
    handleClearPodOrConfigMap();
  }, [handleClearPodOrConfigMap]);

  const handleSelectNamespace = useCallback(
    (value: string) => {
      if (!cluster) {
        return;
      }
      handleUpdateNamespace(value);
      setOpenNamespace(false);
      getPodsOrConfigmap(cluster, value);
    },
    [cluster, getPodsOrConfigmap, handleUpdateNamespace],
  );

  const handleMouseDownNamespace = useCallback(() => {
    if (!cluster || openNamespace) {
      return;
    }
    getNamespaces(cluster, true);
  }, [cluster, getNamespaces, openNamespace]);

  const handleBlurNamespace = useCallback(() => setOpenNamespace(false), []);

  const handleSelectDetail = useCallback(
    (value: string, option: any) => {
      setDetail(value);
      setOpenDetail(false);
      handleUpdatePodOrConfigMap(omit(option, 'label') as Pod | ConfigMapInfo);
    },
    [handleUpdatePodOrConfigMap],
  );

  const handleClearDetail = useCallback(() => {
    setDetail(undefined);
    handleClearPodOrConfigMap();
  }, [handleClearPodOrConfigMap]);

  const handleMouseDownDetail = useCallback(() => {
    if (!cluster || !namespace || openDetail) {
      return;
    }
    getPodsOrConfigmap(cluster, namespace, true);
  }, [cluster, getPodsOrConfigmap, namespace, openDetail]);

  const handleBlurDetail = useCallback(() => setOpenDetail(false), []);

  const initSelect = useCallback(() => {
    const clusterName = localStorageManage(k8zStorageKeys.cluster);
    const namespaceName = localStorageManage(k8zStorageKeys.namespace);
    const podInfoStr = localStorageManage(k8zStorageKeys.podInfo);
    const configmapInfoStr = localStorageManage(k8zStorageKeys.configmapInfo);

    if (clusterName) {
      handleSelectCluster(clusterName);
    }
    if (clusterName && namespaceName) {
      handleSelectNamespace(namespaceName);
    }
    const jsonStr = isConfigMap ? configmapInfoStr : podInfoStr;
    if (
      jsonStr &&
      clusterName &&
      namespaceName &&
      checkJsonStrUtils(jsonStr, { checkEmptyStr: true })
    ) {
      const json = JSON.parse(jsonStr);
      handleSelectDetail(json.name, { ...json, label: '' });
    }
  }, [handleSelectCluster, handleSelectDetail, handleSelectNamespace, isConfigMap]);

  useEffect(() => {
    getClusters();
  }, [getClusters]);

  useEffect(() => {
    initSelect();
  }, [initSelect]);

  return {
    clusterList,
    openCluster,
    loadingCluster,
    handleChangeCluster,
    handleSelectCluster,
    handleMouseDownCluster,
    handleBlurCluster,

    namespace,
    namespaceList,
    openNamespace,
    loadingNamespace,
    handleChangeNamespace,
    handleSelectNamespace,
    handleMouseDownNamespace,
    handleBlurNamespace,

    detail,
    detailList,
    openDetail,
    loadingDetail,
    handleSelectDetail,
    handleClearDetail,
    handleMouseDownDetail,
    handleBlurDetail,

    handlePopupContainer,
  };
};
