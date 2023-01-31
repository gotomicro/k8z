import type { ClusterInfo } from '@/services/cluster';
import { checkJsonStrUtils } from '@/utils/checkJsonUtils';
import MonacoEditor from '@monaco-editor/react';
import type { FormInstance } from 'antd';
import { Form, Input } from 'antd';
import type { RefObject } from 'react';
import React, { useEffect, useRef } from 'react';
import '../../styles/form.less';

export interface ClusterFormProps {
  form: RefObject<FormInstance<ClusterInfo>>;
  onSubmit: (field: ClusterInfo) => void;
}

const ClusterForm: React.FC<ClusterFormProps> = ({ form, onSubmit }) => {
  const editorRef = useRef<HTMLDivElement | any>(null);
  useEffect(() => {
    editorRef.current?.getAction('editor.action.formatDocument').run();
  }, []);
  return (
    <Form ref={form} onFinish={onSubmit} className="form">
      <Form.Item
        name="name"
        label="集群名称"
        rules={[{ required: true, message: '请输入集群名称' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="apiServer"
        label="api server"
        rules={[{ required: true, message: '请输入 api server' }]}
      >
        <Input allowClear />
      </Form.Item>
      <Form.Item
        name="kubeConfig"
        label="kube config"
        rules={[
          { required: true, message: '请输入 kube config' },
          {
            validator: async (_, value) => {
              if (!!value && !checkJsonStrUtils(value)) {
                return Promise.reject();
              }
              return;
            },
            message: '请输入 Json 格式内容',
          },
        ]}
      >
        <MonacoEditor
          height={'50vh'}
          width={'100%'}
          language={'json'}
          onMount={(editor) => (editorRef.current = editor)}
          options={{
            theme: 'vs',
            wordWrap: 'off',
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
      </Form.Item>
    </Form>
  );
};

export default ClusterForm;
