import React from 'react';
import type { ConfigMapFileInfo } from '@/services/configmap';
import {
  StyledConfigMapFileAddButton,
  StyledConfigMapFiles,
  StyledConfigMapFilesList,
  StyledConfigMapFilesScroll,
} from '@/pages/Tools/ConfigMap/styles/files.styled';
import { FileAddOutlined } from '@ant-design/icons';
import lodash from 'lodash';
import ConfigMapFileItem from '@/pages/Tools/ConfigMap/components/ConfigmapFiles/ConfigMapFileItem';
import ContentCard from '@/components/ContentCard';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';

interface ConfigmapFilesProps {
  files: ConfigMapFileInfo[];
  isNeedSave: boolean;
  selectFile?: ConfigMapFileInfo;
  handleDeleteFile: (file: ConfigMapFileInfo) => Promise<void>;
  handleSelectFile: (file: ConfigMapFileInfo) => void;
  handleOpenCreatedModal: () => void;
  handleChangeFileTypeByFileSuffix: (configMapConfiguration: string) => void;
}
const ConfigmapFiles: React.FC<ConfigmapFilesProps> = ({
  files,
  selectFile,
  isNeedSave,
  handleDeleteFile,
  handleSelectFile,
  handleOpenCreatedModal,
  handleChangeFileTypeByFileSuffix,
}) => {
  return (
    <ContentCard title={`${localStorageManage(k8zStorageKeys.toolsName)}-Files`} height="auto">
      <StyledConfigMapFiles>
        <StyledConfigMapFilesScroll>
          <StyledConfigMapFilesList>
            <StyledConfigMapFileAddButton
              type="link"
              icon={<FileAddOutlined />}
              onClick={handleOpenCreatedModal}
            >
              新建&nbsp;ConfigMap
            </StyledConfigMapFileAddButton>
            {files?.map((file) => (
              <ConfigMapFileItem
                key={file.configMapConfiguration}
                file={file}
                isNeedSave={isNeedSave}
                isSelect={lodash.isEqual(selectFile, file)}
                handleDeleteFile={handleDeleteFile}
                handleSelectFile={handleSelectFile}
                handleChangeFileTypeByFileSuffix={handleChangeFileTypeByFileSuffix}
              />
            ))}
          </StyledConfigMapFilesList>
        </StyledConfigMapFilesScroll>
      </StyledConfigMapFiles>
    </ContentCard>
  );
};
export default ConfigmapFiles;
