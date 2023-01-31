import Loading from '@/components/Loading';
import { DEFAULT_CONFIGMAP_TYPE, PrettyConfigmapTypes } from '@/enums/pretty';
import {
  StyledConfigMapContent,
  StyledConfigMapEditor,
  StyledConfigMapEditorEmpty,
  StyledConfigMapEditorOptions,
} from '@/pages/Tools/ConfigMap/styles/editor.styled';
import { FullscreenExitOutlined, FullscreenOutlined, SaveOutlined } from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import { Button, Empty, Select, Space } from 'antd';
import lodash from 'lodash';
import type { MutableRefObject } from 'react';
import React, { useRef } from 'react';

interface ConfigMapEditorProps {
  loading: boolean;
  context?: string;
  fileType?: string;
  isNeedSave: boolean;
  editorRef: MutableRefObject<any>;
  handleClickSave: () => void;
  handleChangeContext: (value: any) => void;
  handleChangeFileType: (value?: string) => void;
}

const ConfigMapEditor: React.FC<ConfigMapEditorProps> = ({
  loading,
  context,
  fileType,
  editorRef,
  isNeedSave,
  handleClickSave,
  handleChangeContext,
  handleChangeFileType,
}) => {
  const editorFullscreenRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] = useFullscreen(editorFullscreenRef);
  if (loading) {
    return <Loading loading={loading} />;
  }

  // 是否为 undefined
  if (!lodash.isString(context)) {
    return (
      <StyledConfigMapEditorEmpty>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </StyledConfigMapEditorEmpty>
    );
  }

  return (
    <StyledConfigMapContent ref={editorFullscreenRef}>
      <StyledConfigMapEditorOptions>
        <Space>
          <Select
            value={fileType ?? DEFAULT_CONFIGMAP_TYPE}
            disabled={isFullscreen}
            size="small"
            options={PrettyConfigmapTypes}
            onChange={handleChangeFileType}
            fieldNames={{ label: 'text', value: 'text' }}
            style={{ width: 70 }}
          />
          <Button
            disabled={isFullscreen || !isNeedSave}
            type="text"
            onClick={handleClickSave}
            icon={<SaveOutlined />}
          />
          <Button
            type="link"
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          />
        </Space>
      </StyledConfigMapEditorOptions>
      <StyledConfigMapEditor
        language={PrettyConfigmapTypes.find((item) => item.text === fileType)?.grammar}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        value={context ?? ''}
        onChange={handleChangeContext}
        options={{
          theme: 'vs',
          wordWrap: 'on',
          tabSize: 2,
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
    </StyledConfigMapContent>
  );
};
export default ConfigMapEditor;
