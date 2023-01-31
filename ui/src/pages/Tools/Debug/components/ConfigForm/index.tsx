import { FIST_CONTAINER_INDEX, MIN_CONTAINERS_LEN } from '@/hooks/useContainer';
import {
  StyledConfigForm,
  StyledConfigFormButtonSpace,
} from '@/pages/Tools/Debug/styles/config.styled';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Button, Form, Select } from 'antd';
import type { DefaultOptionType } from 'rc-select/lib/Select';
import React, { useCallback, useEffect } from 'react';

export interface FormParams {
  container: string;
}

interface ConfigFormProps {
  isStart: boolean;
  form: FormInstance<FormParams>;
  containers: DefaultOptionType[];
  handleFinish: (values: FormParams) => void;
  handleStopClient: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  form,
  isStart,
  containers,
  handleFinish,
  handleStopClient,
}) => {
  const handleGetPopupContainer = useCallback(
    () => document.getElementById('ContainerForm') || document.body,
    [],
  );

  useEffect(() => {
    // 默认设置第一个 container
    if (form && containers.length >= MIN_CONTAINERS_LEN) {
      form.setFieldValue('container', containers[FIST_CONTAINER_INDEX].value);
    }
  }, [containers, form]);

  return (
    <StyledConfigForm>
      <Form form={form} onFinish={handleFinish} id={'ContainerForm'}>
        <Form.Item
          name="container"
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
        <Form.Item noStyle>
          <StyledConfigFormButtonSpace>
            {isStart ? (
              <Button
                danger
                type="primary"
                key="stop"
                icon={<StopOutlined />}
                onClick={handleStopClient}
              >
                Stop
              </Button>
            ) : (
              <Button type="primary" key="start" icon={<PlayCircleOutlined />} htmlType="submit">
                Debug
              </Button>
            )}
          </StyledConfigFormButtonSpace>
        </Form.Item>
      </Form>
    </StyledConfigForm>
  );
};
export default ConfigForm;
