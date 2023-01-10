import React, { useEffect } from 'react';
import { Button, Form, Select } from 'antd';
import type { FormInstance } from 'antd';
import {
  StyledConfigForm,
  StyledConfigFormButtonSpace,
} from '@/pages/Tools/Debug/styles/config.styled';
import { FIST_CONTAINER_INDEX, MIN_CONTAINERS_LEN } from '@/hooks/useContainer';
import { StopOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { DefaultOptionType } from 'rc-select/lib/Select';

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
  useEffect(() => {
    // 默认设置第一个 container
    if (form && containers.length >= MIN_CONTAINERS_LEN) {
      form.setFieldValue('container', containers[FIST_CONTAINER_INDEX].value);
    }
  }, [containers, form]);

  return (
    <StyledConfigForm>
      <Form form={form} onFinish={handleFinish}>
        <Form.Item
          name="container"
          label={'Container'}
          rules={[{ required: true, message: '请选择 Container' }]}
        >
          <Select allowClear showSearch options={containers} placeholder="请选择 Container" />
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
