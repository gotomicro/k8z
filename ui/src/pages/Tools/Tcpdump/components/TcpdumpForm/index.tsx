import { FIST_CONTAINER_INDEX, MIN_CONTAINERS_LEN } from '@/hooks/useContainer';
import {
  StyledCaughtFormLabel,
  StyledCaughtFromOptions,
  StyledCaughtMode,
} from '@/pages/Tools/Tcpdump/styles/config.styled';
import type { StartTcpdumpWsUrlParams } from '@/services/tcpdump';
import { DOWNLOAD_CAUGHT_PATH, TcpdumpMode } from '@/services/tcpdump';
import { RequestBaseUrl } from '@/utils/electronRenderUtil';
import { CloudDownloadOutlined, PauseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Button, Form, Input, Radio, Select, Space } from 'antd';
import type { DefaultOptionType } from 'rc-select/lib/Select';
import type { ReactNode, RefObject } from 'react';
import React, { useCallback, useEffect } from 'react';

interface TcpdumpFormProps {
  containers: DefaultOptionType[];
  isStartTcpdump: boolean;
  tcpdumpMode?: TcpdumpMode;
  tcpdumpDownloadKey: string;
  isElectron: boolean;
  caughtModes: ReactNode[];
  form: RefObject<
    FormInstance<
      Pick<StartTcpdumpWsUrlParams, 'interfaceConfig' | 'filter' | 'mode' | 'containerName'>
    >
  >;
  handleStopTcpdump: () => void;
  handleStartTcpdump: (
    fields: Pick<StartTcpdumpWsUrlParams, 'interfaceConfig' | 'filter' | 'mode' | 'containerName'>,
  ) => void;
}

const TcpdumpForm: React.FC<TcpdumpFormProps> = ({
  form,
  isStartTcpdump,
  tcpdumpMode,
  isElectron,
  tcpdumpDownloadKey,
  handleStopTcpdump,
  handleStartTcpdump,
  caughtModes,
  containers,
}) => {
  const handleClickDownload = useCallback(() => {
    const downloadPath = `${RequestBaseUrl}${DOWNLOAD_CAUGHT_PATH}${tcpdumpDownloadKey}`;
    if (isElectron) {
      window.electron?.downloading?.(downloadPath);
      return;
    }
    window.open(downloadPath, '_blank');
  }, [isElectron, tcpdumpDownloadKey]);

  const handleGetPopupContainer = useCallback(
    () => document.getElementById('tcpdumpForm') || document.body,
    [],
  );

  useEffect(() => {
    // 默认设置第一个 container
    if (form.current && containers.length >= MIN_CONTAINERS_LEN) {
      form.current.setFieldValue('containerName', containers[FIST_CONTAINER_INDEX].value);
    }
  }, [containers, form]);

  return (
    <div>
      <Form ref={form} onFinish={handleStartTcpdump} id="tcpdumpForm">
        <Form.Item
          name="containerName"
          label={'Container'}
          rules={[{ required: true, message: '请选择 Container' }]}
        >
          <Select
            allowClear
            showSearch
            options={containers}
            placeholder="请选择 Container"
            getPopupContainer={handleGetPopupContainer}
          />
        </Form.Item>
        <Form.Item
          name="interfaceConfig"
          label={<StyledCaughtFormLabel>抓包网卡</StyledCaughtFormLabel>}
        >
          <Input allowClear placeholder="请输入要抓包的网卡，默认全部" />
        </Form.Item>
        <Form.Item name="filter" label={<StyledCaughtFormLabel>过滤条件</StyledCaughtFormLabel>}>
          <Input allowClear placeholder="tcpdump 过滤条件，示例：port 9001" />
        </Form.Item>
        <StyledCaughtFromOptions>
          <StyledCaughtMode
            name="mode"
            label="抓包模式"
            rules={[{ required: true, message: '请选择需要的抓包模式' }]}
          >
            <Radio.Group>{caughtModes}</Radio.Group>
          </StyledCaughtMode>
          <Form.Item noStyle>
            <Space align="start">
              {!isStartTcpdump && tcpdumpDownloadKey && tcpdumpMode === TcpdumpMode.file && (
                <Button
                  type="link"
                  key="caught-download"
                  disabled={!tcpdumpDownloadKey}
                  icon={<CloudDownloadOutlined />}
                  onClick={handleClickDownload}
                >
                  下载
                </Button>
              )}
              {isStartTcpdump ? (
                <Button
                  danger
                  type="primary"
                  key="caught-stop"
                  icon={<PauseOutlined />}
                  onClick={handleStopTcpdump}
                >
                  停止
                </Button>
              ) : (
                <Button
                  type="primary"
                  key="caught-start"
                  htmlType="submit"
                  icon={<PlayCircleOutlined />}
                >
                  开始
                </Button>
              )}
            </Space>
          </Form.Item>
        </StyledCaughtFromOptions>
      </Form>
    </div>
  );
};

export default TcpdumpForm;
