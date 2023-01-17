import React from 'react';
import type { OptionsPodInfo } from '@/services/pods';
import { useFiles } from '@/pages/Tools/Files/hooks/useFiles';
import FilesHeader from '@/pages/Tools/Files/components/FilesHeader';
import FileList from '@/pages/Tools/Files/components/FileList';
import { StyledFileCard } from '@/pages/Tools/Files/styles/index.styled';
import { useModel } from '@umijs/max';

export interface FilesContentProps {
  pod: Required<OptionsPodInfo>;
}
const FilesContent: React.FC<FilesContentProps> = ({ pod }) => {
  const { initialState } = useModel('@@initialState') || {};
  const isElectron = initialState?.isElectron ?? false;
  const {
    selectFiles,
    currentFilePath,
    fileList,
    loadingFileList,
    handleClickJumpPath,
    handleChangeSelectFiles,
    handleClickDownloadFileOrFolder,
    handleDownloadFilesAndFolders,
    handleUploadFileSuccess,
  } = useFiles({ currentPod: pod, isElectron });

  return (
    <StyledFileCard>
      <FilesHeader
        pod={pod}
        selectFiles={selectFiles}
        loadingFileList={loadingFileList}
        folderPath={currentFilePath}
        uploadFileSuccess={handleUploadFileSuccess}
        handleClickJumpPath={handleClickJumpPath}
        handleDownloadFilesAndFolders={handleDownloadFilesAndFolders}
      />
      <FileList
        pod={pod}
        fileList={fileList}
        folderPath={currentFilePath}
        loadingList={loadingFileList}
        handleClickJumpPath={handleClickJumpPath}
        handleChangeSelectFiles={handleChangeSelectFiles}
        handleClickDownloadFileOrFolder={handleClickDownloadFileOrFolder}
      />
    </StyledFileCard>
  );
};

export default FilesContent;
