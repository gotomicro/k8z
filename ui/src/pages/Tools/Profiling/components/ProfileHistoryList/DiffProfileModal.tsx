import React, { useCallback, useEffect, useRef } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import type { FormInstance } from 'antd/es/form/Form';
import type { Profile } from '@/services/profiling';
import type { DefaultOptionType } from 'rc-select/lib/Select';

interface DiffProfileModalProps {
  open: boolean;
  baseProfile?: Profile;
  options: DefaultOptionType[];
  onCancel: () => void;
  onSubmit: (params: { baseUrl: string; targetUrl: string }) => void;
}
const DiffProfileModal: React.FC<DiffProfileModalProps> = ({
  open,
  options,
  baseProfile,
  onSubmit,
  onCancel,
}) => {
  const formRef = useRef<FormInstance<any>>(null);

  const handleOk = useCallback(() => {
    if (formRef.current) {
      formRef.current?.submit();
    }
  }, []);

  useEffect(() => {
    if (open && baseProfile && formRef.current) {
      formRef.current.setFieldValue('baseUrl', baseProfile.url);
    }
    if (!open) {
      formRef.current?.resetFields();
    }
  }, [open, baseProfile]);
  return (
    <Modal title="Profile 版本比对" open={open} onCancel={onCancel} onOk={handleOk}>
      <Form ref={formRef} onFinish={onSubmit} layout="vertical">
        <Form.Item name="baseUrl" label="Base" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="targetUrl"
          label="Target"
          rules={[{ required: true, message: '请选择需要比对的版本' }]}
        >
          <Select allowClear options={options} placeholder={'请选择需要比对的版本'} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DiffProfileModal;
