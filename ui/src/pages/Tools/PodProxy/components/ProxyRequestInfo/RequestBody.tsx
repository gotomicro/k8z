import type { DefaultInfoProps } from '@/pages/Tools/PodProxy/components/ProxyRequestInfo/index';
import MonacoEditor from '@monaco-editor/react';
import React from 'react';

const RequestBody: React.FC<DefaultInfoProps> = ({ value, onChange }) => {
  return (
    <MonacoEditor
      height={'100%'}
      width={'100%'}
      onChange={onChange}
      value={value}
      language={'json'}
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
  );
};
export default RequestBody;
