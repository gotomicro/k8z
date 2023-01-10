import type { Profile } from '@/services/profiling';
import React, { useMemo } from 'react';
import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { unixTimeFormat } from '@/utils/timeUtils';
import { StyledOptions } from '@/pages/Tools/Profiling/styles/history.styled';
import ProfileHistoryOption from '@/pages/Tools/Profiling/components/ProfileHistoryList/ProfileHistoryOption';

interface ProfileHistoryListProps {
  dataList: Profile[];
  handleClickJumpCreate: () => void;
  handleClickDiffProfile: (baseUrl: Profile) => void;
  handleHiddenDiff: () => void;
  handleClickChangeProfile: (params?: { url: string }) => void;
}
const ProfileHistoryList: React.FC<ProfileHistoryListProps> = ({
  dataList,
  handleHiddenDiff,
  handleClickJumpCreate,
  handleClickDiffProfile,
  handleClickChangeProfile,
}) => {
  const columns: ColumnsType<Profile> = useMemo(
    () => [
      { title: 'podName', dataIndex: 'podName', align: 'center' },
      {
        title: '生成时间',
        dataIndex: 'ctime',
        align: 'center',
        render: (time: number) => unixTimeFormat(time),
      },
      {
        title: '操作',
        key: 'options',
        fixed: 'right',
        width: 200,
        render: (_, profile: Profile) => (
          <ProfileHistoryOption
            profile={profile}
            dataList={dataList}
            handleHiddenDiff={handleHiddenDiff}
            handleClickDiffProfile={handleClickDiffProfile}
            handleClickChangeProfile={handleClickChangeProfile}
          />
        ),
      },
    ],
    [dataList, handleClickChangeProfile, handleClickDiffProfile, handleHiddenDiff],
  );

  return (
    <>
      <StyledOptions>
        <Button icon={<PlusOutlined />} type="link" onClick={handleClickJumpCreate}>
          新建 Profile
        </Button>
      </StyledOptions>
      <Table
        rowKey={(record) => `${record.podName}-${record.ctime}`}
        columns={columns}
        scroll={{ y: '285px' }}
        size={'small'}
        dataSource={dataList}
        pagination={false}
      />
    </>
  );
};
export default ProfileHistoryList;
