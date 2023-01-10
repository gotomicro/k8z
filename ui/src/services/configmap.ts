import { request } from 'umi';

export interface ConfigMapInfo {
  cluster: string;
  namespace: string;
  name: string;
  configMap?: string;
  ready?: boolean;
  reason?: string;
}

export interface ConfigMapFileInfo {
  cluster: string;
  configMap: string;
  configMapConfiguration: string;
  namespace: string;
}

export interface ConfigMapFileContext extends ConfigMapFileInfo {
  data: string;
}

export interface SaveConfigMapFileParams extends ConfigMapFileInfo {
  configMapConfigurationData: string;
}

interface ConfigmapsRequestParams {
  cluster: string;
  namespace: string;
}

export async function getConfigmaps({ cluster, namespace }: ConfigmapsRequestParams) {
  return request<RES.Res<ConfigMapInfo[]>>(`/api/v1/k8s/${cluster}/${namespace}/config-maps`, {
    method: 'GET',
  });
}

export async function getConfigmapFiles(
  params: Pick<ConfigMapInfo, 'cluster' | 'namespace' | 'configMap'>,
) {
  return request<RES.Res<ConfigMapFileInfo[]>>(`/api/v1/config-map/configurations`, {
    method: 'GET',
    params,
  });
}

export async function getFileContext(params: ConfigMapFileInfo) {
  return request<RES.Res<ConfigMapFileContext>>(`/api/v1/config-map/configuration-data`, {
    method: 'GET',
    params,
  });
}

export async function saveFileContext(data: SaveConfigMapFileParams) {
  return request<RES.Res<ConfigMapFileInfo[]>>(`/api/v1/config-map/save-configuration`, {
    method: 'POST',
    data,
  });
}

export async function deleteFile(params: ConfigMapFileInfo) {
  return request<RES.Res<ConfigMapFileInfo[]>>(`/api/v1/config-map/configuration`, {
    method: 'DELETE',
    params,
  });
}
