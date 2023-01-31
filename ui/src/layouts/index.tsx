import BackToTopButton from '@/components/BackToTopButton';
import ClusterSettingButton from '@/components/ClusterSettingButton';
import PageHeader from '@/components/PageHeader';
import ToolsMenuButton from '@/components/ToolsMenuButton';
import { StyledBody, StyledMain } from '@/layouts/styles/index.styled';
import { ToolsMapArr } from '@/pages/ToolsMap/configs/configs';
import { ConfigProvider } from 'antd';
import React from 'react';
import { Outlet, useLocation } from 'umi';

const BasicLayout: React.FC = () => {
  const location = useLocation();
  const showBackHome =
    !!ToolsMapArr.find((item) => item.pathname === location.pathname) ||
    location.pathname === '/manage/cluster';
  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: '#2196f3', colorInfo: '#2196f3', colorLink: '#249ffd' } }}
    >
      <StyledBody>
        <StyledMain id="main">
          <PageHeader showBackHome={showBackHome} />
          <Outlet />
        </StyledMain>
        <BackToTopButton />
        <ClusterSettingButton />
        <ToolsMenuButton />
      </StyledBody>
    </ConfigProvider>
  );
};

export default BasicLayout;
