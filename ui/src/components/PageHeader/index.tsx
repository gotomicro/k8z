import {
  StyledPageHeader,
  StyledPageHeaderBack,
  StyledPageHeaderBackContent,
  StyledPageHeaderTitle,
  StyledPageHeaderTitleContext,
} from '@/components/PageHeader/styles/index.styled';
import React, { useCallback } from 'react';
import { RollbackOutlined } from '@ant-design/icons';
import { useTools } from '@/hooks/useTools';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';

export interface PageHeaderProps {
  showBackHome?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ showBackHome = true }) => {
  const { handleResetToolName } = useTools();
  const handleGoBackHomePage = useCallback(() => {
    location.hash = '';
    handleResetToolName();
  }, [handleResetToolName]);

  return (
    <StyledPageHeader>
      <StyledPageHeaderTitle>
        <StyledPageHeaderTitleContext onClick={handleGoBackHomePage}>
          K8Z&nbsp;-&nbsp;{localStorageManage(k8zStorageKeys.toolsName) || '工具合集'}
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
