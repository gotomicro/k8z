import { DEFAULT_CONFIGMAP_TYPE, PrettyConfigmapTypes } from '@/enums/pretty';
import type { FormInstance } from 'antd';
import { Form, Input, Modal, Select } from 'antd';
import type { MutableRefObject } from 'react';
import React from 'react';

interface CreateFileModalProps {
  open: boolean;
  formRef: MutableRefObject<FormInstance<{ fileName: string; suffix: string }> | null>;
  onCancel: () => void;
  onFinish: (fields: { fileName: string; suffix: string }) => void;
}

const CreateFileModal: React.FC<CreateFileModalProps> = ({ open, formRef, onFinish, onCancel }) => {
  return (
    <Modal
      centered
      destroyOnClose
      title="创建文件"
      open={open}
      onCancel={onCancel}
      onOk={() => formRef.current?.submit()}
    >
      <Form ref={formRef} onFinish={onFinish}>
        <Form.Item name="fileName" label="文件名" required>
          <Input
            placeholder="请输入文件名"
            addonAfter={
              <Form.Item name="suffix" noStyle initialValue={DEFAULT_CONFIGMAP_TYPE}>
                <Select style={{ width: 80 }}>
                  {PrettyConfigmapTypes.map((item) => (
                    <Select.Option key={item.text} value={item.text}>
                      {`.${item.suffix[0] ?? 'txt'}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CreateFileModal;
