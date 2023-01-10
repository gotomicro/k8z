import { request } from 'umi';

export interface Namespace {
  name: string;
}
export async function getNamespaceList({ cluster, query }: { cluster: string; query?: string }) {
  return request<RES.Res<Namespace[]>>(`/api/v1/k8s/${cluster}/namespaces`, {
    method: 'GET',
    params: { query },
  });
}
