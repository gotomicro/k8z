import { useModel } from '@@/plugin-model';
import PodSelectCard, {
  HIDE_POD_OR_CONFIGMAP_SELECT_ARR,
  SHOW_CONFIGMAP_PATHNAME_ARR,
} from '@/components/PodSelectCard';
import React, { useEffect, useMemo } from 'react';
import { ToolNames, ToolsMapArr } from '@/pages/ToolsMap/configs/configs';
import TerminalTool from '@/pages/Tools/Terminal';
import Tcpdump from '@/pages/Tools/Tcpdump';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import { useTools } from '@/hooks/useTools';
import ToolCardEmpty from '@/components/ToolCardEmpty';
import PodProxy from '@/pages/Tools/PodProxy';
import Profiling from '@/pages/Tools/Profiling';
import Files from '@/pages/Tools/Files';
import Debug from '@/pages/Tools/Debug';
import ConfigMap from '@/pages/Tools/ConfigMap';
import { useLocation } from 'umi';
import Nodes from '@/pages/Tools/Nodes';

const Tools: React.FC = () => {
  const currentLocation = useLocation();
  const { cluster, namespace, currentPod, configmap } = useModel('pod', (model) => ({
    cluster: model.cluster,
    namespace: model.namespace,
    currentPod: model.currentPod,
    configmap: model.currentConfigmap,
  }));
  const { handleClickTool } = useTools();
  const isConfigMap = useMemo(
    () => SHOW_CONFIGMAP_PATHNAME_ARR.includes(currentLocation?.pathname),
    [currentLocation],
  );

  const isHidePodOrConfigmap = useMemo(
    () => HIDE_POD_OR_CONFIGMAP_SELECT_ARR.includes(currentLocation?.pathname),
    [currentLocation],
  );

  const ToolCard = useMemo(() => {
    const tool = ToolsMapArr.find((item) => currentLocation.pathname === item.pathname);
    if (!tool?.name) {
      return null;
    }

    let emptyTip: string;
    if (isHidePodOrConfigmap) {
      emptyTip = '请选择 cluster 和 namespace';
    } else if (isConfigMap) {
      emptyTip = '请选择 ConfigMap';
    } else {
      emptyTip = '请选择 Pod';
    }

    // 进入只选 cluster 和 namespace分支
    if (isHidePodOrConfigmap && cluster && namespace) {
      switch (tool?.name) {
        case ToolNames.Nodes:
          return <Nodes cluster={cluster} namespace={namespace} />;
        default:
          break;
      }
    }
    // 如果是 configmap 则进入 configmap 分支
    if (!isHidePodOrConfigmap && isConfigMap && configmap) {
      switch (tool?.name) {
        case ToolNames.ConfigMap:
          return <ConfigMap configmap={configmap} />;
        default:
          break;
      }
    }

    // 进入 pod 分支
    if (!isHidePodOrConfigmap && !isConfigMap && currentPod) {
      switch (tool?.name) {
        case ToolNames.Terminal:
          return <TerminalTool currentPod={currentPod} />;
        case ToolNames.Tcpdump:
          return <Tcpdump currentPod={currentPod} />;
        case ToolNames.Profiling:
          return <Profiling currentPod={currentPod} />;
        case ToolNames.PodProxy:
          return <PodProxy currentPod={currentPod} />;
        case ToolNames.Files:
          return <Files currentPod={currentPod} />;
        case ToolNames.PodDebug:
          return <Debug currentPod={currentPod} />;
        default:
          break;
      }
    }

    return <ToolCardEmpty tip={emptyTip} />;
  }, [
    isHidePodOrConfigmap,
    isConfigMap,
    cluster,
    namespace,
    configmap,
    currentPod,
    currentLocation.pathname,
  ]);

  useEffect(() => {
    const tool = ToolsMapArr.find((item) => currentLocation.pathname === item.pathname);
    if (!tool) {
      location.hash = '';
      return;
    }
    if (tool && tool.router !== localStorageManage(k8zStorageKeys.toolsRouter)) {
      handleClickTool(tool.name, tool.router);
    }
  }, [handleClickTool, currentLocation]);

  return (
    <>
      <PodSelectCard />
      {ToolCard}
    </>
  );
};
export default Tools;
