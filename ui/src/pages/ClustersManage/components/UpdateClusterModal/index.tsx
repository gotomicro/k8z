import ClusterForm from '@/pages/ClustersManage/components/ClusterForm';
import type { ClusterInfo, ClusterMethod } from '@/services/cluster';
import type { FormInstance } from 'antd';
import { message, Modal, Spin } from 'antd';
import React, { useCallback, useEffect, useRef } from 'react';

export interface UpdateClusterModalProps {
  open: boolean;
  loading: boolean;
  cluster?: ClusterInfo;
  onCancel: () => void;
  handleSubmit: (field: ClusterInfo, method: ClusterMethod) => void;
}

const UpdateClusterModal: React.FC<UpdateClusterModalProps> = ({
  open,
  cluster,
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
      handleSubmit(field, 'PUT');
    },
    [handleSubmit],
  );

  useEffect(() => {
    if (open && cluster && form.current) {
      console.log('cluster: ', cluster);
      form.current.setFieldsValue(cluster);
    }
  }, [open, cluster]);

  useEffect(() => {
    if (!open && form.current) {
      form.current.resetFields();
    }
  }, [open]);

  return (
    <Modal
      title={`编辑集群${cluster?.name}`}
      width="80vw"
      maskClosable={false}
      open={open}
      onCancel={onCancel}
      confirmLoading={loading}
      bodyStyle={{ paddingBottom: 0 }}
      onOk={handleOk}
    >
      <Spin spinning={loading} tip={`正在更新集群${cluster?.name}`}>
        <ClusterForm form={form} onSubmit={onSubmit} />
      </Spin>
    </Modal>
  );
};

export default UpdateClusterModal;
