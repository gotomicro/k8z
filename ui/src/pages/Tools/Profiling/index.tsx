import ContentCard from '@/components/ContentCard';
import CreateProfile from '@/pages/Tools/Profiling/components/CreateProfile';
import ProfileHistoryList from '@/pages/Tools/Profiling/components/ProfileHistoryList';
import DiffProfileModal from '@/pages/Tools/Profiling/components/ProfileHistoryList/DiffProfileModal';
import ProfileViewSvg from '@/pages/Tools/Profiling/components/ProfileViewSvg';
import { useCheckProfilingDependencies } from '@/pages/Tools/Profiling/hooks/useCheckProfilingDependencies';
import { useDiffProfile } from '@/pages/Tools/Profiling/hooks/useDiffProfile';
import { useProfile } from '@/pages/Tools/Profiling/hooks/useProfile';
import {
  StyledEmptyOrSpin,
  StyledErrorDependency,
} from '@/pages/Tools/Profiling/styles/index.styled';
import type { Pod } from '@/services/pods';
import { Empty, Spin } from 'antd';
import React, { useMemo } from 'react';

interface ProfilingProps {
  currentPod: Pod;
}
const Profiling: React.FC<ProfilingProps> = ({ currentPod }) => {
  const { errorMessage, isCheckLoading, isShowDependencyErrors } = useCheckProfilingDependencies();
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

  const pageContent = useMemo(() => {
    if (isShowDependencyErrors) {
      return (
        <ContentCard title={'Error'} height="110px">
          <StyledErrorDependency>{errorMessage}</StyledErrorDependency>
        </ContentCard>
      );
    }
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
        <ContentCard title="Profile" height="92vh" id="Profile">
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
  }, [
    ProfileViewContent,
    currentBaseUrl,
    errorMessage,
    handleClickChangeProfile,
    handleClickDiffProfile,
    handleClickJumpCreate,
    handleClickJumpHistory,
    handleCloseDiffModal,
    handleHiddenDiff,
    handleShowDiff,
    handleSubmitForm,
    isShowDependencyErrors,
    openDiffModal,
    otherProfileOptions,
    profileHistoryList,
    showHistory,
    spinningProfile,
  ]);

  return (
    <Spin spinning={isCheckLoading} tip="正在进行环境检查">
      {pageContent}
    </Spin>
  );
};
export default Profiling;
