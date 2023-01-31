import type { Pod } from '@/services/pods';
import { request } from 'umi';

export interface Workload {
  name: string;
  kind: WorkloadKinds;
  cluster: string;
  namespace: string;
  pods: Pod[];
}

export enum WorkloadKinds {
  deployment = 'deployment',
  cronjob = 'cronjob',
  daemonset = 'daemonset',
  job = 'job',
  statefulset = 'statefulset',
}

export async function getWorkloadList({
  cluster,
  namespace,
}: {
  cluster: string;
  namespace: string;
}) {
  return request<RES.Res<Workload[]>>(`/api/v1/k8s/${cluster}/${namespace}/workloads`, {
    method: 'GET',
  });
}
