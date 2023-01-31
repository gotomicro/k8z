import ClusterForm from '@/pages/ClustersManage/components/ClusterForm';
import type { ClusterInfo, ClusterMethod } from '@/services/cluster';
import type { FormInstance } from 'antd';
import { message, Modal, Spin } from 'antd';
import React, { useCallback, useEffect, useRef } from 'react';

export interface CreateClusterModalProps {
  open: boolean;
  loading: boolean;
  handleSubmit: (field: ClusterInfo, method: ClusterMethod) => void;
  onCancel: () => void;
}

const CreateClusterModal: React.FC<CreateClusterModalProps> = ({
  open,
  loading,
  onCancel,
  handleSubmit,
}) => {
  const form = useRef<FormInstance<ClusterInfo>>(null);

  const handleOk = useCallback(() => {
    if (!form.current) {
      message.error({ content: '表单出现异常，请关闭后重试', key: 'create-cluster-form-error' });
      return;
    }
    form.current?.submit();
  }, []);

  const onSubmit = useCallback(
    (field: ClusterInfo) => {
      handleSubmit(field, 'POST');
    },
    [handleSubmit],
  );

  useEffect(() => {
    if (!open && form.current) {
      form.current.resetFields();
    }
  }, [open]);
  return (
    <Modal
      title="新建集群"
      width="80vw"
      maskClosable={false}
      open={open}
      onCancel={onCancel}
      confirmLoading={loading}
      bodyStyle={{ paddingBottom: 0 }}
      onOk={handleOk}
    >
      <Spin spinning={loading} tip="正在创建新集群...">
        <ClusterForm form={form} onSubmit={onSubmit} />
      </Spin>
    </Modal>
  );
};

export default CreateClusterModal;
