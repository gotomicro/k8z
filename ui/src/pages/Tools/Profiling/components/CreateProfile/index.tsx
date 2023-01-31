import { StyledProfileCreatedMode } from '@/pages/Tools/Profiling/styles/index.styled';
import type { CreateProfileParams } from '@/services/profiling';
import { ModeMapping, Modes } from '@/services/profiling';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Radio, Row, Space } from 'antd';
import React, { useMemo } from 'react';

interface CreateProfileProps {
  spinning: boolean;
  handleClickJumpHistory: () => void;
  handleCreated: (fields: Pick<CreateProfileParams, 'mode' | 'port' | 'seconds' | 'addr'>) => void;
}
const CreateProfile: React.FC<CreateProfileProps> = ({
  spinning,
  handleCreated,
  handleClickJumpHistory,
}) => {
  const [form] = Form.useForm();
  const modeOptions = useMemo(() => {
    return Object.keys(ModeMapping).map((item) => ({ label: ModeMapping[item], value: item }));
  }, []);

  const FormButtons = useMemo(() => {
    return (
      <Space>
        <Button type={'link'} onClick={handleClickJumpHistory}>
          历史 Profile
        </Button>

        <Button icon={<PlusOutlined />} type={'primary'} htmlType={'submit'} loading={spinning}>
          生成 Profile
        </Button>
      </Space>
    );
  }, [spinning, handleClickJumpHistory]);
  return (
    <Form form={form} onFinish={handleCreated}>
      <StyledProfileCreatedMode>
        <Form.Item
          name={'mode'}
          label={'mode'}
          initialValue={Modes.pod}
          rules={[{ required: true }]}
        >
          <Radio.Group options={modeOptions} />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, nextValues) => prevValues.mode !== nextValues.mode}
        >
          {({ getFieldValue }) => {
            const mode = getFieldValue('mode');
            if (mode === Modes.ip) {
              return (
                <Form.Item
                  label={'地址'}
                  name={'addr'}
                  style={{ flex: 1 }}
                  rules={[{ required: true }]}
                >
                  <Input allowClear />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>
      </StyledProfileCreatedMode>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name={'port'} label={'Port'} rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item name={'seconds'} label={'时长'} rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="秒（s）" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6} offset={18} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Form.Item noStyle>{FormButtons}</Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default CreateProfile;
