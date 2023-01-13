import React from 'react';
import { StyledClusterSettingButton } from '@/components/ClusterSettingButton/styles/index.styled';
import { SettingOutlined } from '@ant-design/icons';

const CLUSTER_SETTING_HASH = '#/manage/cluster';
const ClusterSettingButton: React.FC = () => {
  if (location.hash === CLUSTER_SETTING_HASH) {
    return null;
  }
  return (
    <StyledClusterSettingButton
      icon={<SettingOutlined />}
      type="primary"
      tooltip="集群设置"
      href={CLUSTER_SETTING_HASH}
    />
  );
};
export default ClusterSettingButton;
