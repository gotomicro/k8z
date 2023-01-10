import { request } from 'umi';
import type { WorkloadKinds } from '@/services/workload';

export interface Pod {
  cluster: string;
  namespace: string;
  workload: string;
  workloadKind: WorkloadKinds;
  name: string;
  ready: boolean;
  reason: string;
  containers?: string[];
}

export interface OptionsPodInfo {
  cluster: string;
  namespace: string;
  workload: string;
  workloadKind: WorkloadKinds;
  pod: string;
  container?: string;
}

export async function getPodListInNamespace({
  cluster,
  namespace,
  extra,
}: {
  cluster: string;
  namespace: string;
  extra?: {
    allowNotReady?: boolean;
  };
}) {
  return request<RES.Res<Pod[]>>(`/api/v1/k8s/${cluster}/${namespace}/pods`, {
    method: 'GET',
    params: { ...extra },
  });
}

export const TERMINAL_API = '/api/v1/terminal/exec';
export const DEBUG_API = '/api/v1/debug/run';
