import {
  StyledPageHeader,
  StyledPageHeaderBack,
  StyledPageHeaderBackContent,
  StyledPageHeaderTitle,
  StyledPageHeaderTitleContext,
} from '@/components/PageHeader/styles/index.styled';
import { useTools } from '@/hooks/useTools';
import { ToolsMapArr } from '@/pages/ToolsMap/configs/configs';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import { useLocation } from '@@/exports';
import { RollbackOutlined } from '@ant-design/icons';
import React, { useCallback, useMemo } from 'react';

export interface PageHeaderProps {
  showBackHome?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ showBackHome = true }) => {
  const { handleResetToolName } = useTools();
  const currentLocation = useLocation();
  const handleGoBackHomePage = useCallback(() => {
    location.hash = '';
    handleResetToolName();
  }, [handleResetToolName]);

  const isTools = useMemo(() => {
    if (!localStorageManage(k8zStorageKeys.toolsName)) return false;
    return (
      currentLocation.pathname ===
      ToolsMapArr.find((item) => localStorageManage(k8zStorageKeys.toolsName) === item.name)
        ?.pathname
    );
  }, [currentLocation.pathname]);

  return (
    <StyledPageHeader>
      <StyledPageHeaderTitle>
        <StyledPageHeaderTitleContext onClick={handleGoBackHomePage}>
          K8Z&nbsp;-&nbsp;{isTools ? localStorageManage(k8zStorageKeys.toolsName) : '工具合集'}
        </StyledPageHeaderTitleContext>
      </StyledPageHeaderTitle>
      <StyledPageHeaderBack>
        {showBackHome && (
          <StyledPageHeaderBackContent
            type="link"
            icon={<RollbackOutlined />}
            onClick={handleGoBackHomePage}
          >
            返回首页
          </StyledPageHeaderBackContent>
        )}
      </StyledPageHeaderBack>
    </StyledPageHeader>
  );
};

export default PageHeader;
