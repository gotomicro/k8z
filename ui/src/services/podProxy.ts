import { request } from 'umi';

export interface PodProxyParams {
  clusterName: string;
  namespace: string;
  podName: string;
  method: string;
  url: string;
  payload: string;
  headers: string;
}

export enum ProxyRequestStatus {
  OK = 'OK',
  ERROR = 'ERROR',
}

export interface ProxyResultParams {
  body: string;
  headers: any;
  status: ProxyRequestStatus;
  statusCode: number;
  duration: number;
  contentLength: number;
}

export async function sendPodProxy(data: PodProxyParams) {
  return request<RES.Res<ProxyResultParams>>(`/api/v1/proxy/pod/http`, { method: 'POST', data });
}
