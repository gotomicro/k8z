import React from 'react';
import { Empty } from 'antd';
import { StyledCardPodEmpty } from '@/components/ToolCardEmpty/styles/index.styled';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import ContentCard from '@/components/ContentCard';

interface ToolCardEmptyProps {
  tip: string;
}
const ToolCardEmpty: React.FC<ToolCardEmptyProps> = ({ tip }) => {
  return (
    <ContentCard title={localStorageManage(k8zStorageKeys.toolsName)} height="48vh">
      <StyledCardPodEmpty>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={tip} />
      </StyledCardPodEmpty>
    </ContentCard>
  );
};
export default ToolCardEmpty;
