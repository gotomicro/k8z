import type { FilesContentProps } from '@/pages/Tools/Files/components/FilesContent';
import FilesPathItem from '@/pages/Tools/Files/components/FilesHeader/FilesPathItem';
import styles from '@/pages/Tools/Files/styles/header.less';
import type { FileInfo } from '@/services/podContainers';
import {
  CloudDownloadOutlined,
  ForwardOutlined,
  LoadingOutlined,
  LoginOutlined,
  RollbackOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, message, Space, Spin, Upload } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

export interface FilesHeaderProps extends FilesContentProps {
  selectFiles: FileInfo[];
  folderPath: string;
  loadingFileList: boolean;
  uploadFileSuccess: () => void;
  handleDownloadFilesAndFolders: () => void;
  handleClickJumpPath: (path: string) => void;
}

const FilesHeader: React.FC<FilesHeaderProps> = ({
  pod,
  selectFiles,
  folderPath,
  loadingFileList,
  handleDownloadFilesAndFolders,
  uploadFileSuccess,
  handleClickJumpPath,
}) => {
  const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
  const isRootDirectory = useMemo(() => ['.', '/'].includes(folderPath), [folderPath]);
  const isHomePath = useMemo(() => RegExp(/(\/home)$/g).test(folderPath), [folderPath]);
  const handleUploadFile = useCallback(
    ({ file }) => {
      if (file.status !== 'done') {
        setLoadingUpload(true);
        message.loading({
          content: `文件：${file.name} 正在上传`,
          key: 'file-upload',
          duration: 0,
        });
        return;
      }
      setLoadingUpload(false);
      if (file.response && file.response?.code === 0) {
        message.success({
          content: `文件：${file.name} 上传成功`,
          key: 'file-upload',
          duration: 3,
        });
        uploadFileSuccess();
      } else {
        message.error({
          content: `【文件：${file.name} 上传失败】：${file.response?.msg ?? '未知错误'}`,
          key: 'file-upload',
          duration: 3,
        });
      }
    },
    [uploadFileSuccess],
  );

  const handleBackPreLevel = useCallback(() => {
    if (isRootDirectory) {
      message.warning({ content: '当前已在根路径下', key: 'back-root-directory-warn' });
      return;
    }
    const reg = /(\/)[^/]+$/g;
    const prePath = folderPath.replace(reg, '');
    handleClickJumpPath(!!prePath ? prePath : '/');
  }, [folderPath, handleClickJumpPath, isRootDirectory]);

  const handleBackRootDirectory = useCallback(() => {
    if (isRootDirectory) {
      return;
    }
    handleClickJumpPath('/');
  }, [handleClickJumpPath, isRootDirectory]);

  const handleGoHomePath = useCallback(() => {
    if (isHomePath) {
      message.warning({ content: '当前已在 home 路径下', key: 'go-home-path-warn' });
      return;
    }
    handleClickJumpPath('/home');
  }, [handleClickJumpPath, isHomePath]);

  const Options = useMemo(() => {
    if (pod) {
      return (
        <Space>
          <Upload
            action="/api/v1/file/upload-to-pod"
            data={{
              clusterName: pod.cluster,
              podName: pod.pod,
              namespace: pod.namespace,
              containerName: pod.container,
              dstPath: folderPath,
            }}
            method={'POST'}
            onChange={handleUploadFile}
            maxCount={1}
            showUploadList={false}
          >
            <Button size={'small'} icon={loadingUpload ? <LoadingOutlined /> : <UploadOutlined />}>
              上传文件
            </Button>
          </Upload>
          <Button
            disabled={selectFiles.length <= 0}
            size={'small'}
            type={'primary'}
            icon={<CloudDownloadOutlined />}
            onClick={handleDownloadFilesAndFolders}
          >
            下载文件
          </Button>
        </Space>
      );
    }
    return <></>;
  }, [
    folderPath,
    handleDownloadFilesAndFolders,
    handleUploadFile,
    loadingUpload,
    pod,
    selectFiles.length,
  ]);

  const FolderPath = useMemo(() => {
    if (isRootDirectory) {
      return (
        <div className={styles.folderPathContent}>
          <span>/</span>
        </div>
      );
    }
    const folderList = folderPath.split('/');
    return folderList
      .filter(Boolean)
      .map((folder) => (
        <FilesPathItem
          key={folder}
          folder={folder}
          folderPath={folderPath}
          handleClickJumpPath={handleClickJumpPath}
        />
      ));
  }, [isRootDirectory, folderPath, handleClickJumpPath]);

  return (
    <div className={styles.header}>
      <Spin size="small" spinning={loadingFileList} indicator={<LoadingOutlined />}>
        {!loadingFileList && (
          <Space>
            {!isRootDirectory && (
              <Button
                size="small"
                type="link"
                disabled={isRootDirectory}
                onClick={handleBackPreLevel}
                icon={<RollbackOutlined />}
              >
                返回上级
              </Button>
            )}
            <div className={styles.folderPath}>{FolderPath}</div>
            {!isHomePath && (
              <Button
                size="small"
                disabled={isHomePath}
                onClick={handleGoHomePath}
                icon={<LoginOutlined />}
              >
                home&nbsp;目录
              </Button>
            )}
            {!isRootDirectory && (
              <Button
                size="small"
                disabled={isRootDirectory}
                onClick={handleBackRootDirectory}
                icon={<ForwardOutlined />}
              >
                根目录
              </Button>
            )}
          </Space>
        )}
      </Spin>
      {Options}
    </div>
  );
};
export default FilesHeader;
