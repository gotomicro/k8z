import type { ContainersFilesParams, FileInfo } from '@/services/podContainers';
import { DOWNLOAD_FILE_OR_FOLDER_PATH, getContainerList } from '@/services/podContainers';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import type { OptionsPodInfo } from '@/services/pods';
import lodash from 'lodash';
import { RequestBaseUrl } from '@/utils/electronRenderUtil';

export const useFiles = ({
  currentPod,
  isElectron,
}: {
  currentPod: Required<OptionsPodInfo>;
  isElectron: boolean;
}) => {
  const [selectFiles, setSelectFiles] = useState<FileInfo[]>([]);
  const [currentFilePath, setCurrentFilePath] = useState<string>('.');
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [loadingFileList, setLoadingFileList] = useState<boolean>(false);
  const selectPodRef =
    useRef<
      Pick<ContainersFilesParams, 'clusterName' | 'namespace' | 'podName' | 'containerName'>
    >();
  const searchFolderPath = useRef<string>();

  const handleGetFileList = useCallback(
    ({
      path = '.',
      ...params
    }: { path?: string } & Pick<
      ContainersFilesParams,
      'clusterName' | 'namespace' | 'podName' | 'containerName'
    >) => {
      setCurrentFilePath('.');
      setFileList([]);
      setLoadingFileList(true);
      selectPodRef.current = params;
      getContainerList({ ...params, path })
        .then((res) => {
          if (res?.code === 0 && lodash.isEqual(params, selectPodRef.current)) {
            setCurrentFilePath(res.data.current);
            setFileList(res.data.files);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingFileList(false));
    },
    [],
  );

  const handleChangeSelectFiles = useCallback(
    (selectedRowKeys: React.Key[], selectedRows: FileInfo[]) => {
      setSelectFiles(selectedRows);
    },
    [],
  );

  const handleClickJumpPath = useCallback(
    (path: string) => {
      searchFolderPath.current = path;
      const params = lodash.pick(currentPod, ['cluster', 'namespace', 'pod', 'container']);
      setLoadingFileList(true);
      if (!params.cluster || !params.namespace || !params.pod || !params.container) {
        message.warning({ content: '请选择正确的 Pod', key: 'file-list' });
        return;
      }
      getContainerList({
        namespace: params.namespace,
        clusterName: params.cluster,
        podName: params.pod,
        containerName: params.container,
        path,
      })
        .then((res) => {
          if (res?.code === 0 && searchFolderPath.current === res?.data?.current) {
            setCurrentFilePath(res.data.current);
            setFileList(res.data.files);
          } else {
            message.error({ content: res?.msg || '未知错误', key: 'file-list' });
          }
        })
        .catch(console.error)
        .finally(() => setLoadingFileList(false));
    },
    [currentPod],
  );

  const handleClickDownloadFileOrFolder = useCallback(
    (path: string) => {
      const params = lodash.pick(currentPod, ['cluster', 'namespace', 'pod']);
      if (!params.cluster || !params.namespace || !params.pod) {
        message.warning({ content: '请选择正确的 Pod', key: 'file-download' });
        return;
      }
      const downloadPath = `${RequestBaseUrl}${DOWNLOAD_FILE_OR_FOLDER_PATH}?paths=${path}&clusterName=${params.cluster}&namespace=${params.namespace}&podName=${params.pod}`;
      if (isElectron) {
        window.electron?.downloading?.(downloadPath);
        return;
      }
      window.open(downloadPath, '_blank');
    },
    [currentPod, isElectron],
  );

  const handleDownloadFilesAndFolders = useCallback(() => {
    const { cluster, namespace, pod } = lodash.pick(currentPod, ['cluster', 'namespace', 'pod']);
    if (!cluster || !namespace || !pod) {
      message.warning({ content: '请选择正确的 Pod', key: 'files-download' });
      return;
    }
    if (selectFiles?.length <= 0) {
      message.warning({ content: '请选择需要下载的文件', key: 'files-download' });
      return;
    }
    let downloadPath = `${RequestBaseUrl}${DOWNLOAD_FILE_OR_FOLDER_PATH}?clusterName=${cluster}&namespace=${namespace}&podName=${pod}`;
    for (const file of selectFiles) {
      const path =
        currentFilePath === '/'
          ? `${currentFilePath}${file.name}`
          : `${currentFilePath}/${file.name}`;
      downloadPath += `&paths=${path}`;
    }
    if (isElectron) {
      window.electron?.downloading?.(downloadPath);
      return;
    }
    window.open(downloadPath, '_blank');
  }, [currentFilePath, currentPod, isElectron, selectFiles]);

  const handleUploadFileSuccess = useCallback(() => {
    if (
      !currentPod?.cluster ||
      !currentPod?.namespace ||
      !currentPod?.pod ||
      !currentPod?.container ||
      !currentFilePath
    ) {
      message.error({ content: '文件列表获取失败', key: 'success-upload' });
      return;
    }
    handleGetFileList({
      clusterName: currentPod.cluster,
      namespace: currentPod.namespace,
      podName: currentPod.pod,
      containerName: currentPod.container,
      path: currentFilePath,
    });
  }, [
    currentFilePath,
    currentPod.cluster,
    currentPod.container,
    currentPod.namespace,
    currentPod.pod,
    handleGetFileList,
  ]);

  useEffect(() => {
    handleGetFileList({
      clusterName: currentPod.cluster,
      namespace: currentPod.namespace,
      podName: currentPod.pod,
      containerName: currentPod.container,
    });
  }, [
    currentPod.cluster,
    currentPod.container,
    currentPod.namespace,
    currentPod.pod,
    handleGetFileList,
  ]);

  return {
    selectFiles,
    currentFilePath,
    fileList,
    loadingFileList,
    handleClickJumpPath,
    handleUploadFileSuccess,
    handleChangeSelectFiles,
    handleClickDownloadFileOrFolder,
    handleDownloadFilesAndFolders,
  };
};
