import React, { useCallback } from 'react';
import { Button, Divider, Space, Tooltip } from 'antd';
import { CloudDownloadOutlined, DiffOutlined, FileSearchOutlined } from '@ant-design/icons';
import type { Profile } from '@/services/profiling';
import lodash from 'lodash';
import { AnchorScrollKey, documentScrollUtil } from '@/utils/documentScrollUtil';
import { getDownloadProfilePath } from '@/pages/Tools/Profiling/utils/downloadProfileUtile';
import { useModel } from '@@/plugin-model';

interface ProfileHistoryOptionProps {
  profile: Profile;
  dataList: Profile[];
  handleHiddenDiff: () => void;
  handleClickDiffProfile: (baseUrl: Profile) => void;
  handleClickChangeProfile: (params?: { url: string }) => void;
}
const ProfileHistoryOption: React.FC<ProfileHistoryOptionProps> = ({
  profile,
  dataList,
  handleHiddenDiff,
  handleClickDiffProfile,
  handleClickChangeProfile,
}) => {
  const { initialState } = useModel('@@initialState') || {};
  const isElectron = initialState?.isElectron ?? false;
  const handleClickDetail = useCallback(() => {
    handleClickChangeProfile(lodash.pick(profile, ['url']));
    handleHiddenDiff();
    documentScrollUtil(AnchorScrollKey.Profile);
  }, [profile, handleHiddenDiff, handleClickChangeProfile]);

  const handleClickDiff = useCallback(
    () => handleClickDiffProfile(profile),
    [profile, handleClickDiffProfile],
  );

  const handleClickDownload = useCallback(() => {
    const downloadPath = getDownloadProfilePath(profile.url);
    if (isElectron) {
      window.electron?.downloading?.(downloadPath);
      return;
    }
    window.open(downloadPath, '_self');
  }, [isElectron, profile.url]);

  return (
    <Space>
      <Button
        type={'link'}
        icon={
          <Tooltip title={'查看详情'} placement={'left'}>
            <FileSearchOutlined />
          </Tooltip>
        }
        onClick={handleClickDetail}
      />
      <Divider type="vertical" />
      <Button
        type={'link'}
        onClick={handleClickDownload}
        icon={
          <Tooltip title={'下载'} placement={'left'}>
            <CloudDownloadOutlined />
          </Tooltip>
        }
      />
      <Divider type="vertical" />
      <Button
        type={'link'}
        disabled={dataList.length <= 1}
        icon={
          <Tooltip title={'版本比对'} placement={'left'}>
            <DiffOutlined />
          </Tooltip>
        }
        onClick={handleClickDiff}
      />
    </Space>
  );
};
export default ProfileHistoryOption;
