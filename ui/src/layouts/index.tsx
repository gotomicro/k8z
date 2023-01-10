import React from 'react';
import { StyledBody, StyledMain } from '@/layouts/styles/index.styled';
import PageHeader from '@/components/PageHeader';
import BackToTopButton from '@/components/BackToTopButton';
import ClusterSettingButton from '@/components/ClusterSettingButton';
import { ConfigProvider } from 'antd';
import ToolsMenuButton from '@/components/ToolsMenuButton';
import { ToolsMapArr } from '@/pages/ToolsMap/configs/configs';
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
