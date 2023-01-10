import React from 'react';
import { Modal } from 'antd';
import { DiffEditor } from '@monaco-editor/react';
import { DEFAULT_CONFIGMAP_TYPE } from '@/enums/pretty';

interface DiffContextModalProps {
  open: boolean;
  base?: string;
  target?: string;
  fileType?: string;
  onOk: () => void;
  onCancel: () => void;
}
const DiffContextModal: React.FC<DiffContextModalProps> = ({
  open,
  base,
  target,
  fileType,
  onOk,
  onCancel,
}) => {
  return (
    <Modal title="保存" centered open={open} width="80%" onCancel={onCancel} onOk={onOk}>
      <DiffEditor
        language={fileType ?? DEFAULT_CONFIGMAP_TYPE}
        original={base ?? ''}
        modified={target ?? ''}
        height="70vh"
        options={{
          readOnly: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          selectOnLineNumbers: true,
          automaticLayout: true,
          cursorStyle: 'line',
          foldingStrategy: 'indentation',
          find: {
            addExtraSpaceOnTop: false,
          },
        }}
      />
    </Modal>
  );
};
export default DiffContextModal;
