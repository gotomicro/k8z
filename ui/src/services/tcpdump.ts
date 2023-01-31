import type { DependenciesResponse } from '@/services/dependency';
import { getWSHost } from '@/utils/common';
import { request } from 'umi';

export enum TcpdumpMode {
  stdout = 'stdout',
  file = 'file',
  wireshark = 'wireshark',
}

export const CaughtModeMapping: { [k in keyof typeof TcpdumpMode]: string } = {
  [TcpdumpMode.stdout]: '直接输出',
  [TcpdumpMode.file]: '保存到文件',
  [TcpdumpMode.wireshark]: 'wireshark实时分析',
};

export interface StartTcpdumpWsUrlParams {
  clusterName: string;
  namespace: string;
  podName: string;
  containerName: string;
  interfaceConfig?: string;
  filter?: string;
  mode: TcpdumpMode;
}

export const getStartTcpdumpWsUrl = ({
  clusterName,
  namespace,
  podName,
  containerName,
  interfaceConfig = 'any',
  filter = '',
  mode,
}: StartTcpdumpWsUrlParams) => {
  return `${getWSHost()}/api/v1/tcpdump/run?clusterName=${clusterName}&namespace=${namespace}&podName=${podName}&containerName=${containerName}&interface=${interfaceConfig}&filter=${filter}&mode=${mode}`;
};

export const DOWNLOAD_CAUGHT_PATH = '/api/v1/tcpdump/download?taskId=';

export function checkTcpdumpWireshark() {
  return request<RES.Res<DependenciesResponse>>(`/api/v1/tcpdump/check-dependencies`, {
    method: 'GET',
  });
}
