import { request } from 'umi';

export interface Clusters {
  name: string;
  isStaticConfig: boolean;
  namespaces: {
    cluster: string;
    name: string;
    workloads: {
      cluster: string;
      name: string;
      kind: string;
      namespace: string;
      pods: {
        cluster: string;
        name: string;
        namespace: string;
        workload: string;
        workloadKind: string;
        containers: string[];
      }[];
    }[];
  }[];
}

export interface ClusterInfo {
  name: string;
  apiServer: string;
  kubeConfig: string;
}

export type ClusterMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type ChildrenKeys = 'namespaces' | 'workloads' | 'pods' | 'end';

export type ContainersChildrenKeys = 'containers' | ChildrenKeys;

export const ContainersChildrenKeyMapping: Record<ContainersChildrenKeys, ContainersChildrenKeys> =
  {
    ['namespaces']: 'workloads',
    ['workloads']: 'pods',
    ['pods']: 'containers',
    ['containers']: 'end',
    ['end']: 'end',
  };

export const ClusterChildrenKeyMapping: Record<ChildrenKeys, ChildrenKeys> = {
  ['namespaces']: 'workloads',
  ['workloads']: 'pods',
  ['pods']: 'end',
  ['end']: 'end',
};

export const ClusterParentKeyMapping: Record<ChildrenKeys, string> = {
  ['namespaces']: 'cluster',
  ['workloads']: 'namespace',
  ['pods']: 'workload',
  ['end']: 'pod',
};

export async function getClusterList() {
  return request<RES.Res<Clusters[]>>(`/api/v1/k8s/clusters`, {
    method: 'GET',
  });
}

export async function createOrUpdateCluster(data: ClusterInfo, method: ClusterMethod) {
  return request(`/api/v1/k8s/cluster-configs`, {
    data,
    method,
  });
}

export async function getOrDeleteCluster(name: string, method: ClusterMethod) {
  return request(`/api/v1/k8s/cluster-configs/${name}`, {
    method,
  });
}
