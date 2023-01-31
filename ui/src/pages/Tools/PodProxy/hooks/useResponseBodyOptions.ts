import { PrettyTypes } from '@/enums/pretty';
import type { WrapTypes } from '@/pages/Tools/PodProxy/components/ResponseInfo/ResponseBodyOptions';
import {
  BodyRadios,
  ContentTypes,
} from '@/pages/Tools/PodProxy/components/ResponseInfo/ResponseBodyOptions';
import type { RadioChangeEvent } from 'antd';
import { message } from 'antd';
import copy from 'copy-to-clipboard';
import { useCallback, useState } from 'react';

export interface ResponseBodyOptionProps {
  editor: any;
}

export const useResponseBodyOptions = ({ editor }: ResponseBodyOptionProps) => {
  const [bodyType, setBodyType] = useState<BodyRadios>(BodyRadios.pretty);
  const [prettyType, setPrettyType] = useState<PrettyTypes>(PrettyTypes.json);
  const [editorLanguage, setEditorLanguage] = useState<PrettyTypes>(PrettyTypes.json);
  const [wordWrap, setWordWrap] = useState<WrapTypes>('on');
  const [formatValue, setFormatValue] = useState<{
    value: string;
    prettyType: PrettyTypes;
  }>();

  const getResponsePrettyType = useCallback((contentType) => {
    if (contentType.includes(ContentTypes.json)) {
      return PrettyTypes.json;
    }
    if (contentType.includes(ContentTypes.html)) {
      return PrettyTypes.html;
    }
    if (contentType.includes([ContentTypes.xml, ContentTypes.xhtml, ContentTypes.atomXml])) {
      return PrettyTypes.xml;
    }
    return PrettyTypes.plaintext;
  }, []);

  const handleUpdateEditorOptions = useCallback(
    (languageId: PrettyTypes, extra: { lineNumbers?: 'off' | 'on'; wordWrap?: WrapTypes }) => {
      if (editor.current) {
        setEditorLanguage(languageId);
        editor.current.updateOptions(extra);
      }
    },
    [editor],
  );

  const onChangeBodyType = useCallback(
    (event: RadioChangeEvent) => {
      switch (event.target.value) {
        case BodyRadios.raw:
          handleUpdateEditorOptions(PrettyTypes.plaintext, { lineNumbers: 'off' });
          break;
        case BodyRadios.pretty: {
          handleUpdateEditorOptions(PrettyTypes[prettyType], { lineNumbers: 'on', wordWrap });
          break;
        }
      }
      setBodyType(event.target.value);
    },
    [handleUpdateEditorOptions, prettyType, wordWrap],
  );

  const onChangeWordWrapType = useCallback(
    (wrapType: WrapTypes) => {
      setWordWrap(wrapType);
      handleUpdateEditorOptions(PrettyTypes[prettyType], { lineNumbers: 'on', wordWrap: wrapType });
    },
    [handleUpdateEditorOptions, prettyType],
  );

  const onChangePrettyType = useCallback(
    (value: PrettyTypes) => {
      handleUpdateEditorOptions(value, { lineNumbers: 'on', wordWrap });
      setPrettyType(value);
    },
    [handleUpdateEditorOptions, wordWrap],
  );

  const onCopyResult = useCallback(() => {
    if (editor.current) {
      copy(editor.current.getValue());
      message.success({ content: '已复制到剪贴板', key: 'monaco-copy' });
    } else {
      message.warning({ content: '数据正在加载中...', key: 'monaco-copy' });
    }
  }, [editor]);

  const onClickSearch = useCallback(() => {
    if (editor.current) {
      editor.current.getAction('actions.find').run();
    } else {
      message.warning({ content: '数据正在加载中...', key: 'monaco-search' });
    }
  }, [editor]);

  const onFormatDocument = useCallback(
    (type?: PrettyTypes) => {
      if (!editor.current) {
        message.warning({ content: '数据正在加载中...', key: 'monaco-format' });
        return;
      }
      if ([PrettyTypes.json, PrettyTypes.html, PrettyTypes.xml].includes(type ?? prettyType)) {
        editor.current?.updateOptions({ readOnly: false });
        editor.current
          ?.getAction('editor.action.formatDocument')
          .run()
          .then(() => {
            editor.current?.updateOptions({ readOnly: true });
            setFormatValue({ value: editor.current.getValue(), prettyType: type ?? prettyType });
          });
      }
    },
    [editor, prettyType],
  );

  return {
    bodyType,
    prettyType,
    editorLanguage,
    formatValue,
    wordWrap,

    onChangeBodyType,
    onChangePrettyType,
    getResponsePrettyType,
    onCopyResult,
    onClickSearch,
    onFormatDocument,
    onChangeWordWrapType,
  };
};
