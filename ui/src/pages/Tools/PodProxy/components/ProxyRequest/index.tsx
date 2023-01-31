import { RequestProtocols } from '@/pages/Tools/PodProxy';
import ProxyRequestInfo from '@/pages/Tools/PodProxy/components/ProxyRequestInfo';
import RequestType, { RequestTypes } from '@/pages/Tools/PodProxy/components/RequestType';
import {
  StyledPodProxyFormInput,
  StyledRequestPathInput,
} from '@/pages/Tools/PodProxy/styles/request.styled';
import type { FormInstance } from 'antd';
import { Button, Form, Input, Select } from 'antd';
import React, { useMemo } from 'react';

interface ProxyRequestProps {
  podName: string;
  form: FormInstance;
  handleFinishForm: (fields: any) => void;
}

const ProxyRequest: React.FC<ProxyRequestProps> = ({ form, podName, handleFinishForm }) => {
  const RequestUrlItem = useMemo(() => {
    return (
      <Input.Group compact style={{ display: 'flex', marginRight: 8 }}>
        <Form.Item noStyle name={'method'} initialValue={'GET'}>
          <Select
            style={{ width: 85 }}
            getPopupContainer={() => document.getElementById('method')!}
          >
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name={'url'} noStyle>
          <StyledRequestPathInput
            addonBefore={`${RequestProtocols.http}${podName}`}
            placeholder={'请输入端口或请求路径'}
          />
        </Form.Item>
      </Input.Group>
    );
  }, [podName]);

  return (
    <Form form={form} onFinish={handleFinishForm}>
      <StyledPodProxyFormInput id="method">
        {RequestUrlItem}
        <Form.Item noStyle hidden name={'clusterName'}>
          <Input />
        </Form.Item>
        <Form.Item noStyle hidden name={'namespace'}>
          <Input />
        </Form.Item>
        <Form.Item noStyle hidden name={'podName'}>
          <Input />
        </Form.Item>
        <Form.Item noStyle>
          <Button type={'primary'} htmlType={'submit'}>
            发送
          </Button>
        </Form.Item>
        <Form.Item name="urlBefore" initialValue={`${RequestProtocols.http}${podName}`} hidden>
          <Input />
        </Form.Item>
      </StyledPodProxyFormInput>
      <Form.Item noStyle name={'requestType'} initialValue={RequestTypes.Body}>
        <RequestType />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, nextValues) =>
          prevValues?.requestType !== nextValues?.requestType
        }
      >
        {({ getFieldValue }) => {
          const infoType = getFieldValue(['requestType']);
          return (
            <Form.Item noStyle name={['info', infoType.toLowerCase()]}>
              <ProxyRequestInfo infoType={infoType} />
            </Form.Item>
          );
        }}
      </Form.Item>
    </Form>
  );
};
export default ProxyRequest;
