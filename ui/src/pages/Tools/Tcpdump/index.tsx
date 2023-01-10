import React from 'react';
import type { Pod } from '@/services/pods';
import TcpdumpCard from '@/pages/Tools/Tcpdump/components/TcpdumpCard';
import TcpdumpConfigCard from '@/pages/Tools/Tcpdump/components/TcpdumpConfigCard';
import { useTcpdump } from '@/pages/Tools/Tcpdump/hooks/useTcpdump';
import { useContainer } from '@/hooks/useContainer';
import ContentCard from '@/components/ContentCard';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';

interface TcpdumpProps {
  currentPod: Pod;
}

const Tcpdump: React.FC<TcpdumpProps> = ({ currentPod }) => {
  const { containers, podInfo } = useContainer({
    pod: currentPod,
  });
  const {
    tcpdumpContext,
    isStartTcpdump,
    tcpdumpMode,
    tcpdumpFormRef,
    tcpdumpDownloadKey,
    handleStartTcpdump,
    handleStopTcpdump,
  } = useTcpdump({ currentPod: podInfo });
  return (
    <>
      <ContentCard title={`${localStorageManage(k8zStorageKeys.toolsName)}-Config`} height="250px">
        <TcpdumpConfigCard
          containers={containers}
          isStartTcpdump={isStartTcpdump}
          tcpdumpMode={tcpdumpMode}
          form={tcpdumpFormRef}
          tcpdumpDownloadKey={tcpdumpDownloadKey}
          handleStartTcpdump={handleStartTcpdump}
          handleStopTcpdump={handleStopTcpdump}
        />
      </ContentCard>
      <ContentCard
        title={`${localStorageManage(k8zStorageKeys.toolsName)}-Content`}
        height="63vh"
        id="tcpdump_content"
      >
        <TcpdumpCard
          isStartTcpdump={isStartTcpdump}
          tcpdumpMode={tcpdumpMode}
          tcpdumpContext={tcpdumpContext}
        />
      </ContentCard>
    </>
  );
};
export default Tcpdump;
