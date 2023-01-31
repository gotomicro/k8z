import {
  StyledConfigMapFileButton,
  StyledConfigMapFileNameButton,
} from '@/pages/Tools/ConfigMap/styles/files.styled';
import type { ConfigMapFileInfo } from '@/services/configmap';
import { DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, message, Modal, Tooltip } from 'antd';
import React, { useCallback, useRef, useState } from 'react';

interface ConfigMapFileItemProps {
  file: ConfigMapFileInfo;
  isSelect: boolean;
  isNeedSave: boolean;
  handleDeleteFile: (file: ConfigMapFileInfo) => Promise<void>;
  handleSelectFile: (file: ConfigMapFileInfo) => void;
  handleChangeFileTypeByFileSuffix: (configMapConfiguration: string) => void;
}

const ConfigMapFileItem: React.FC<ConfigMapFileItemProps> = ({
  file,
  isSelect,
  isNeedSave,
  handleDeleteFile,
  handleSelectFile,
  handleChangeFileTypeByFileSuffix,
}) => {
  const [openTip, setOpenTip] = useState(false);
  const fileNameRef = useRef<HTMLDivElement>(null);
  const handleClickFile = useCallback(() => {
    if (isSelect) {
      message.warning({ content: '请不要重复选择文件', key: 'select-configmap-file' });
      return;
    }
    if (isNeedSave) {
      Modal.confirm({
        title: '放弃当前修改',
        icon: <ExclamationCircleFilled />,
        content: `当前文件有改动，确定放弃当前修改吗？`,
        centered: true,
        onOk() {
          handleSelectFile(file);
          handleChangeFileTypeByFileSuffix(file.configMapConfiguration);
        },
      });
      return;
    }
    handleSelectFile(file);
    handleChangeFileTypeByFileSuffix(file.configMapConfiguration);
  }, [file, handleChangeFileTypeByFileSuffix, handleSelectFile, isNeedSave, isSelect]);

  const handleMouseEnter = useCallback(() => {
    if (!fileNameRef.current) {
      return;
    }
    if (fileNameRef.current.scrollWidth <= fileNameRef.current.offsetWidth) {
      return;
    }
    setOpenTip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!openTip) {
      return;
    }
    setOpenTip(false);
  }, [openTip]);

  const handleConfirmDelete = useCallback(() => {
    Modal.confirm({
      title: '删除文件',
      icon: <ExclamationCircleFilled />,
      content: `确定删除文件：${file.configMapConfiguration} 吗？`,
      centered: true,
      onOk() {
        return handleDeleteFile(file);
      },
    });
  }, [file, handleDeleteFile]);

  return (
    <StyledConfigMapFileButton isSelect={isSelect}>
      <StyledConfigMapFileNameButton
        type="link"
        onClick={handleClickFile}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Tooltip
          destroyTooltipOnHide={{ keepParent: false }}
          title={file.configMapConfiguration}
          open={openTip}
          overlayInnerStyle={{
            maxWidth: '200px',
            minHeight: '20px',
            padding: '4px 8px',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <span ref={fileNameRef}>{file.configMapConfiguration}</span>
        </Tooltip>
      </StyledConfigMapFileNameButton>
      <Button danger type="link" icon={<DeleteOutlined />} onClick={handleConfirmDelete} />
    </StyledConfigMapFileButton>
  );
};
export default ConfigMapFileItem;
