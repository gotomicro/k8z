import { request } from '@@/plugin-request';

export interface FilesPods {
  clusterName: string;
  namespace: string;
  podName: string;
  containerName: string;
}

export interface ContainersFilesParams extends FilesPods {
  path: string;
}

export interface FileInfo {
  name: string;
  isDir: boolean;
  linkTarget: string;
  isLink: boolean;
  modifyTime: string;
  size: string;
  user: string;
  group: string;
}

export interface ContainerFilesResponse {
  current: string;
  files: FileInfo[];
}

export async function getContainerList(params: ContainersFilesParams) {
  return request<RES.Res<ContainerFilesResponse>>(`/api/v1/file/list-file`, {
    method: 'GET',
    params,
  });
}

export async function uploadFile(data: FormData) {
  return request<any>(`/api/v1/file/upload-to-pod`, {
    method: 'POST',
    data,
  });
}

export const DOWNLOAD_FILE_OR_FOLDER_PATH = '/api/v1/file/download-from-pod';
