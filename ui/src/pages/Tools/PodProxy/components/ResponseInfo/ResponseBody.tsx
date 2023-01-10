import React, { useCallback, useMemo, useRef } from 'react';
import styles from '@/pages/Tools/PodProxy/styles/response.less';
import MonacoEditor from '@monaco-editor/react';
import ResponseBodyOptions, {
  BodyRadios,
} from '@/pages/Tools/PodProxy/components/ResponseInfo/ResponseBodyOptions';
import { useResponseBodyOptions } from '@/pages/Tools/PodProxy/hooks/useResponseBodyOptions';
import type { DefaultResponseInfoProps } from '@/pages/Tools/PodProxy/components/ResponseInfo/index';

export type ResponseBodyProps = DefaultResponseInfoProps;

const ResponseBody: React.FC<ResponseBodyProps> = ({ value }) => {
  const editorRef = useRef<HTMLDivElement | any>(null);

  const {
    bodyType,
    prettyType,
    editorLanguage,
    formatValue,
    wordWrap,
    onChangeBodyType,
    onChangePrettyType,
    onCopyResult,
    onClickSearch,
    onFormatDocument,
    onChangeWordWrapType,
    getResponsePrettyType,
  } = useResponseBodyOptions({ editor: editorRef });

  const handleMonacoMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      if (value?.headers?.['Content-Type']) {
        const prettyType = getResponsePrettyType(value?.headers?.['Content-Type']);
        onFormatDocument(prettyType);
        onChangePrettyType(prettyType);
      }
    },
    [getResponsePrettyType, onChangePrettyType, onFormatDocument, value?.headers],
  );

  const InfoContent = useMemo(() => {
    const allowFormat = prettyType === formatValue?.prettyType && bodyType === BodyRadios.pretty;
    const editorValue =
      !!formatValue?.value && allowFormat ? formatValue?.value : value?.body ?? '';
    const wordWrapType = bodyType === BodyRadios.pretty ? wordWrap : 'on';
    switch (bodyType) {
      case BodyRadios.pretty:
      case BodyRadios.raw:
        return (
          <MonacoEditor
            value={editorValue}
            height={'100%'}
            onMount={handleMonacoMount}
            defaultLanguage={'json'}
            language={editorLanguage}
            options={{
              theme: 'vs',
              readOnly: true,
              wordWrap: wordWrapType,
              tabSize: 2,
              find: {
                addExtraSpaceOnTop: false,
              },
              selectOnLineNumbers: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              cursorStyle: 'line',
              foldingStrategy: 'indentation',
            }}
          />
        );
      default:
        return <div />;
    }
  }, [
    prettyType,
    formatValue?.prettyType,
    formatValue?.value,
    bodyType,
    value?.body,
    wordWrap,
    handleMonacoMount,
    editorLanguage,
  ]);

  return (
    <>
      <div className={styles.options}>
        <ResponseBodyOptions
          bodyType={bodyType}
          wordWrap={wordWrap}
          prettyType={prettyType}
          onChangeBodyType={onChangeBodyType}
          onChangePrettyType={onChangePrettyType}
          onClickSearch={onClickSearch}
          onCopyResult={onCopyResult}
          onFormatDocument={onFormatDocument}
          onChangeWordWrapType={onChangeWordWrapType}
        />
      </div>
      <div className={styles.content}>{InfoContent}</div>
    </>
  );
};
export default ResponseBody;
