import type { Pod } from '@/services/pods';
import React, { useMemo } from 'react';
import CreateProfile from '@/pages/Tools/Profiling/components/CreateProfile';
import ContentCard from '@/components/ContentCard';
import { useProfile } from '@/pages/Tools/Profiling/hooks/useProfile';
import { Empty, Spin } from 'antd';
import ProfileViewSvg from '@/pages/Tools/Profiling/components/ProfileViewSvg';
import { StyledEmptyOrSpin } from '@/pages/Tools/Profiling/styles/index.styled';
import ProfileHistoryList from '@/pages/Tools/Profiling/components/ProfileHistoryList';
import DiffProfileModal from '@/pages/Tools/Profiling/components/ProfileHistoryList/DiffProfileModal';
import { useDiffProfile } from '@/pages/Tools/Profiling/hooks/useDiffProfile';

interface ProfilingProps {
  currentPod: Pod;
}
const Profiling: React.FC<ProfilingProps> = ({ currentPod }) => {
  const {
    profile,
    spinningProfile,
    handleSubmitForm,
    profileHistoryList,
    showHistory,
    handleClickJumpHistory,
    handleClickJumpCreate,
    handleClickChangeProfile,
  } = useProfile({ currentPod });

  const {
    baseUrl,
    targetUrl,
    showDiff,
    currentBaseUrl,
    openDiffModal,
    otherProfileOptions,
    handleShowDiff,
    handleClickDiffProfile,
    handleHiddenDiff,
    handleCloseDiffModal,
  } = useDiffProfile({ showHistory, profileHistoryList });

  const ProfileViewContent = useMemo(() => {
    if (showDiff && baseUrl && targetUrl) {
      return <ProfileViewSvg baseUrl={baseUrl} targetUrl={targetUrl} style={{ paddingTop: 8 }} />;
    }
    if (!profile) {
      return (
        <StyledEmptyOrSpin>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'请创建 Profile'} />
        </StyledEmptyOrSpin>
      );
    }
    return <ProfileViewSvg url={profile.url} style={{ paddingTop: 8 }} />;
  }, [baseUrl, showDiff, profile, targetUrl]);

  return (
    <>
      {showHistory ? (
        <ContentCard title="历史 Profile" height="400px">
          <ProfileHistoryList
            dataList={profileHistoryList}
            handleClickJumpCreate={handleClickJumpCreate}
            handleClickChangeProfile={handleClickChangeProfile}
            handleClickDiffProfile={handleClickDiffProfile}
            handleHiddenDiff={handleHiddenDiff}
          />
          <DiffProfileModal
            open={openDiffModal}
            options={otherProfileOptions}
            baseProfile={currentBaseUrl}
            onSubmit={handleShowDiff}
            onCancel={handleCloseDiffModal}
          />
        </ContentCard>
      ) : (
        <ContentCard title="新建 Profile" height="188px">
          <CreateProfile
            spinning={spinningProfile}
            handleCreated={handleSubmitForm}
            handleClickJumpHistory={handleClickJumpHistory}
          />
        </ContentCard>
      )}
      <ContentCard title="Profile" height="92vh" id="profile">
        {spinningProfile ? (
          <StyledEmptyOrSpin>
            <Spin spinning={spinningProfile} tip={'正在生成 Profile...'} />
          </StyledEmptyOrSpin>
        ) : (
          ProfileViewContent
        )}
      </ContentCard>
    </>
  );
};
export default Profiling;
