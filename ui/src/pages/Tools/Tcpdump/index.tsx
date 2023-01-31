import ContentCard from '@/components/ContentCard';
import { useContainer } from '@/hooks/useContainer';
import TcpdumpCard from '@/pages/Tools/Tcpdump/components/TcpdumpCard';
import TcpdumpConfigCard from '@/pages/Tools/Tcpdump/components/TcpdumpConfigCard';
import { useCheckWireshark } from '@/pages/Tools/Tcpdump/hooks/useCheckWireshark';
import { useTcpdump } from '@/pages/Tools/Tcpdump/hooks/useTcpdump';
import type { Pod } from '@/services/pods';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import React from 'react';

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

  const { isElectron, caughtModes } = useCheckWireshark();

  return (
    <>
      <ContentCard title={`${localStorageManage(k8zStorageKeys.toolsName)}-Config`} height="250px">
        <TcpdumpConfigCard
          containers={containers}
          isStartTcpdump={isStartTcpdump}
          tcpdumpMode={tcpdumpMode}
          form={tcpdumpFormRef}
          isElectron={isElectron}
          caughtModes={caughtModes}
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
