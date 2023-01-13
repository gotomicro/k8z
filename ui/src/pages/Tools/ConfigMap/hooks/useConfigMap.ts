import { useCallback, useRef, useState } from 'react';
import type { ConfigMapFileInfo, ConfigMapInfo } from '@/services/configmap';
import {
  deleteFile,
  getConfigmapFiles,
  getFileContext,
  saveFileContext,
} from '@/services/configmap';
import { message } from 'antd';
import lodash from 'lodash';
import { ALL_SUFFIX_ARR, DEFAULT_CONFIGMAP_TYPE, PrettyConfigmapTypes } from '@/enums/pretty';
import { INIT_MONACO_WAIT } from '@/configs/default';
import { AnchorScrollKey, documentScrollUtil } from '@/utils/documentScrollUtil';

interface ConfigMapProps {
  configmap: ConfigMapInfo;
}

export const useConfigMap = ({ configmap }: ConfigMapProps) => {
  const [selectFile, setSelectFile] = useState<ConfigMapFileInfo>();
  const [newFile, setNewFile] = useState<ConfigMapFileInfo>();
  const [fileList, setFileList] = useState<ConfigMapFileInfo[]>([]);
  const [isNeedSave, setIsNeedSave] = useState(false);
  const [fileType, setFileType] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<string>();
  const [baseContext, setBaseContext] = useState<string>();
  const [openDiffModal, setOpenDiffModal] = useState(false);
  const [openCreated, setOpenCreated] = useState(false);
  const selectFileRef = useRef<ConfigMapFileInfo>();

  const handleGetConfigmapFiles = useCallback(() => {
    if (!configmap) {
      message.warning({ content: '请线选择 Configmap', key: 'configmap-file-list-warn' });
      return;
    }
    selectFileRef.current = undefined;
    setSelectFile(undefined);
    setIsNeedSave(false);
    setContext(undefined);
    setBaseContext(undefined);
    getConfigmapFiles({
      ...lodash.pick(configmap, ['cluster', 'namespace']),
      configMap: configmap.name,
    })
      .then((res) => {
        if (res?.code !== 0) {
          message.error({
            content: `[文列表错误]: ${res?.msg ?? '未知错误'}`,
            key: 'configmap-file-list-error',
          });

          return;
        }
        setFileList(res.data);
      })
      .catch(console.error);
  }, [configmap]);

  const handleChangeFileTypeByFileSuffix = useCallback((configMapConfiguration: string) => {
    const reg = new RegExp('\\.\\w+$');
    const fileType = configMapConfiguration?.match(reg)?.[0]?.replace('.', '');
    setFileType(
      () =>
        PrettyConfigmapTypes.find((item) => {
          if (!fileType || !ALL_SUFFIX_ARR.includes(fileType)) {
            return item.text === DEFAULT_CONFIGMAP_TYPE;
          }
          return item.suffix.includes(fileType);
        })?.text ?? DEFAULT_CONFIGMAP_TYPE,
    );
  }, []);

  const handleChangeSelectFile = useCallback(
    (file: ConfigMapFileInfo) => {
      selectFileRef.current = file;
      setSelectFile(file);
      if (file) {
        setIsNeedSave(false);
        setLoading(true);
        setContext(undefined);
        if (newFile) {
          setFileList((list) =>
            list.filter((item) => item.configMapConfiguration !== newFile.configMapConfiguration),
          );
          documentScrollUtil(AnchorScrollKey.ConfigmapEditor);
          setNewFile(undefined);
        }
        getFileContext(file)
          .then((res) => {
            if (res?.code !== 0) {
              message.error({
                content: `[获取文件信息失败]: ${res?.msg ?? '未知错误'}`,
                key: 'file-context',
              });
              return;
            }
            if (selectFileRef.current?.configMapConfiguration === res.data.configMapConfiguration) {
              setContext(res.data?.data);
              setBaseContext(res.data?.data);
              documentScrollUtil(AnchorScrollKey.ConfigmapEditor);
            }
          })
          .catch(console.error)
          .finally(() => {
            setTimeout(() => setLoading(false), INIT_MONACO_WAIT);
          });
      }
    },
    [newFile],
  );

  const handleShowDiffModal = useCallback(() => {
    setOpenDiffModal(true);
  }, []);

  const handleCancelDiffModal = useCallback(() => {
    setOpenDiffModal(false);
  }, []);

  const handleSaveChange = useCallback(() => {
    if (selectFile && lodash.isString(context)) {
      saveFileContext({ ...selectFile, configMapConfigurationData: context })
        .then((res) => {
          if (res?.code !== 0) {
            return;
          }
          if (lodash.isEqual(selectFile, newFile)) {
            setNewFile(undefined);
          }
          setIsNeedSave(false);
          setOpenDiffModal(false);
          setFileList(res.data);
        })
        .catch(console.error);
    }
  }, [context, newFile, selectFile]);

  const handleDeleteFile = useCallback(
    (file: ConfigMapFileInfo) => {
      return deleteFile(file)
        .then((res) => {
          if (res?.code === 0) {
            if (file === selectFile) {
              setSelectFile(undefined);
              setIsNeedSave(false);
              setContext(undefined);
              setBaseContext(undefined);
            }
            setFileList(res.data);
          }
          return;
        })
        .catch(console.error);
    },
    [selectFile],
  );

  const handleChangeContext = useCallback(
    (value: string) => {
      setContext(value);
      if (value === baseContext) {
        setIsNeedSave(false);
      } else {
        setIsNeedSave(true);
      }
    },
    [baseContext],
  );

  const handleOpenCreatedModal = useCallback(() => {
    setOpenCreated(true);
  }, []);

  const handleCancelCreatedModal = useCallback(() => {
    setOpenCreated(false);
  }, []);

  const handleAddFile = useCallback(
    ({ fileName, suffix }: { fileName: string; suffix: string }) => {
      if (!fileName) {
        message.warning({ content: '请输入文件', key: 'create-file-warn' });
        return;
      }
      if (!configmap) {
        return;
      }
      const configMapConfiguration = `${fileName}.${
        suffix === DEFAULT_CONFIGMAP_TYPE ? 'txt' : suffix
      }`;
      if (!!fileList.find((item) => item.configMapConfiguration === configMapConfiguration)) {
        message.warning({ content: '改文件名已经存在，请更换文件名', key: 'create-file-warn' });
        return;
      }
      const fileInfo = {
        ...lodash.pick(configmap, ['cluster', 'namespace', 'configMap']),
        configMap: configmap.name,
        configMapConfiguration,
      };
      setNewFile(fileInfo);
      setFileList((list) => [...list, fileInfo]);
      setSelectFile(fileInfo);
      handleChangeFileTypeByFileSuffix(configMapConfiguration);
      setIsNeedSave(true);
      setContext('');
      setBaseContext('');
      setOpenCreated(false);
    },
    [configmap, fileList, handleChangeFileTypeByFileSuffix],
  );

  return {
    loading,
    context,
    fileType,
    fileList,
    isNeedSave,
    selectFile,
    openCreated,
    baseContext,
    openDiffModal,
    handleAddFile,
    handleSaveChange,
    handleDeleteFile,
    handleShowDiffModal,
    handleChangeContext,
    handleCancelDiffModal,
    handleOpenCreatedModal,
    handleChangeSelectFile,
    handleGetConfigmapFiles,
    handleCancelCreatedModal,
    handleChangeFileTypeByFileSuffix,
    handleChangeFileType: setFileType,
  };
};
