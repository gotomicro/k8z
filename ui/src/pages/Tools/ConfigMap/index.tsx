import ContentCard from '@/components/ContentCard';
import ConfigMapEditor from '@/pages/Tools/ConfigMap/components/ConfigMapEditor';
import ConfigmapFiles from '@/pages/Tools/ConfigMap/components/ConfigmapFiles';
import CreateFileModal from '@/pages/Tools/ConfigMap/components/CreateFileModal';
import DiffContextModal from '@/pages/Tools/ConfigMap/components/DiffContextModal';
import { useConfigMap } from '@/pages/Tools/ConfigMap/hooks/useConfigMap';
import { StyledConfigMap } from '@/pages/Tools/ConfigMap/styles/index.styled';
import type { ConfigMapInfo } from '@/services/configmap';
import { AnchorScrollKey } from '@/utils/documentScrollUtil';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import type { FormInstance } from 'antd';
import React, { useEffect, useRef } from 'react';

interface FilesProps {
  configmap: ConfigMapInfo;
}

const ConfigMap: React.FC<FilesProps> = ({ configmap }) => {
  const editorRef = useRef<any>(null);
  const createFormRef = useRef<FormInstance<{ fileName: string; suffix: string }>>(null);

  const {
    loading,
    context,
    fileList,
    fileType,
    isNeedSave,
    selectFile,
    baseContext,
    openCreated,
    handleAddFile,
    openDiffModal,
    handleSaveChange,
    handleDeleteFile,
    handleChangeContext,
    handleShowDiffModal,
    handleChangeFileType,
    handleCancelDiffModal,
    handleOpenCreatedModal,
    handleChangeSelectFile,
    handleGetConfigmapFiles,
    handleCancelCreatedModal,
    handleChangeFileTypeByFileSuffix,
  } = useConfigMap({
    configmap,
  });

  useEffect(() => {
    handleGetConfigmapFiles();
  }, [handleGetConfigmapFiles]);

  return (
    <>
      <ConfigmapFiles
        files={fileList}
        isNeedSave={isNeedSave}
        selectFile={selectFile}
        handleDeleteFile={handleDeleteFile}
        handleSelectFile={handleChangeSelectFile}
        handleOpenCreatedModal={handleOpenCreatedModal}
        handleChangeFileTypeByFileSuffix={handleChangeFileTypeByFileSuffix}
      />

      <ContentCard
        title={`${localStorageManage(k8zStorageKeys.toolsName)}-Editor${
          selectFile ? ` [ ${selectFile.configMapConfiguration} ]` : ''
        }`}
        id={AnchorScrollKey.ConfigmapEditor}
        height="70vh"
      >
        <StyledConfigMap>
          <ConfigMapEditor
            loading={loading}
            context={context}
            fileType={fileType}
            editorRef={editorRef}
            isNeedSave={isNeedSave}
            handleClickSave={handleShowDiffModal}
            handleChangeFileType={handleChangeFileType}
            handleChangeContext={handleChangeContext}
          />
        </StyledConfigMap>
      </ContentCard>
      <CreateFileModal
        open={openCreated}
        formRef={createFormRef}
        onFinish={handleAddFile}
        onCancel={handleCancelCreatedModal}
      />
      <DiffContextModal
        base={baseContext}
        target={context}
        open={openDiffModal}
        fileType={fileType}
        onOk={handleSaveChange}
        onCancel={handleCancelDiffModal}
      />
    </>
  );
};

export default ConfigMap;
