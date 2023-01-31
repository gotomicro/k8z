import ContainerSelectCard from '@/components/ContainerSelectCard';
import ContentCard from '@/components/ContentCard';
import { useContainer } from '@/hooks/useContainer';
import Term from '@/pages/Tools/Terminal/components/Term';
import {
  StyledTerminalCardBody,
  StyledTerminalCardBodyEmpty,
} from '@/pages/Tools/Terminal/styles/body.styled';
import type { Pod } from '@/services/pods';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import { Empty } from 'antd';
import React from 'react';

interface TerminalToolProps {
  currentPod: Pod;
}

const TerminalTool: React.FC<TerminalToolProps> = ({ currentPod }) => {
  const { container, containers, podInfo, handleChangeContainer } = useContainer({
    pod: currentPod,
  });

  return (
    <>
      <ContainerSelectCard
        value={container}
        options={containers}
        onChange={handleChangeContainer}
      />
      <ContentCard title={localStorageManage(k8zStorageKeys.toolsName)} height="60vh">
        <StyledTerminalCardBody>
          {container && podInfo && currentPod.containers?.includes(container) ? (
            <Term pod={{ ...podInfo, container }} />
          ) : (
            <StyledTerminalCardBodyEmpty>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择 Container" />
            </StyledTerminalCardBodyEmpty>
          )}
        </StyledTerminalCardBody>
      </ContentCard>
    </>
  );
};

export default TerminalTool;
