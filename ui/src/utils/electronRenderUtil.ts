import { ToolsMapArr } from '@/pages/ToolsMap/configs/configs';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';

export const RequestBaseUrl =
  window?.electron && window?.electron?.baseUrl
    ? await window.electron?.baseUrl?.()
    : process.env.BASE_URL;

enum ElectronMessages {
  BackHome = 'BackHome',
  ClusterList = 'ClusterList',
  AddCluster = 'AddCluster',
  Terminal = 'Terminal',
  Tcpdump = 'Tcpdump',
  Files = 'Files',
  Profiling = 'Profiling（GO）',
  PodProxy = 'POD HTTP Proxy',
  PodDebug = 'Debug',
  ConfigMap = 'ConfigMap',
}

const CLUSTER_LIST_HASH = '#/manage/cluster';

export function handleElectronMessage(event: any, message: any) {
  switch (message) {
    case ElectronMessages.BackHome:
      location.hash = '';
      break;
    case ElectronMessages.ClusterList:
      location.hash = CLUSTER_LIST_HASH;
      break;
    case ElectronMessages.AddCluster:
      location.hash = `${CLUSTER_LIST_HASH}?quickCreated=true`;
      break;
    case ElectronMessages.Profiling:
    case ElectronMessages.Terminal:
    case ElectronMessages.Files:
    case ElectronMessages.PodProxy:
    case ElectronMessages.PodDebug:
    case ElectronMessages.Tcpdump:
    case ElectronMessages.ConfigMap:
      const tool = ToolsMapArr.find((item) => item.name === message);
      localStorageManage(k8zStorageKeys.toolsName, tool?.name);
      localStorageManage(k8zStorageKeys.toolsRouter, tool?.router);
      location.hash = tool?.router || '';
      break;
    default:
      console.log('hello world!');
      break;
  }
}
