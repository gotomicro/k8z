import { Button, Divider, Modal, Space, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
interface ClusterOptionsProps {
  name: string;
  isStaticConfig: boolean;
  onUpdate: (name: string) => void;
  onDelete: (name: string) => void;
}

const ClusterOptions: React.FC<ClusterOptionsProps> = ({
  name,
  isStaticConfig,
  onUpdate,
  onDelete,
}) => {
  const handleClickEditor = useCallback(() => {
    onUpdate(name);
  }, [name, onUpdate]);

  const handleDeleteConfirm = useCallback(() => {
    Modal.confirm({
      title: `确定删除集群：${name} 吗？`,
      icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
      onOk: () => onDelete(name),
    });
  }, [name, onDelete]);
  return (
    <Space>
      <Button
        type="link"
        key="cluster-editor"
        disabled={isStaticConfig}
        icon={
          <Tooltip title="编辑">
            <EditOutlined />
          </Tooltip>
        }
        onClick={handleClickEditor}
      />
      <Divider type="vertical" />
      <Button
        danger
        type="link"
        key="cluster-delete"
        disabled={isStaticConfig}
        icon={
          <Tooltip title="删除">
            <DeleteOutlined />
          </Tooltip>
        }
        onClick={handleDeleteConfirm}
      />
    </Space>
  );
};

export default ClusterOptions;
