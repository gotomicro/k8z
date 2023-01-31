import TcpdumpForm from '@/pages/Tools/Tcpdump/components/TcpdumpForm';
import { StyledConfigBody } from '@/pages/Tools/Tcpdump/styles/config.styled';
import type { StartTcpdumpWsUrlParams, TcpdumpMode } from '@/services/tcpdump';
import type { FormInstance } from 'antd';
import type { DefaultOptionType } from 'rc-select/lib/Select';
import type { ReactNode, RefObject } from 'react';
import React from 'react';

interface TcpdumpConfigCardProps {
  tcpdumpMode?: TcpdumpMode;
  containers: DefaultOptionType[];
  isStartTcpdump: boolean;
  tcpdumpDownloadKey: string;
  isElectron: boolean;
  caughtModes: ReactNode[];
  form: RefObject<
    FormInstance<
      Pick<StartTcpdumpWsUrlParams, 'interfaceConfig' | 'filter' | 'mode' | 'containerName'>
    >
  >;
  handleStopTcpdump: () => void;
  handleStartTcpdump: (
    fields: Pick<StartTcpdumpWsUrlParams, 'interfaceConfig' | 'filter' | 'mode' | 'containerName'>,
  ) => void;
}
const TcpdumpConfigCard: React.FC<TcpdumpConfigCardProps> = ({
  tcpdumpMode,
  isStartTcpdump,
  form,
  isElectron,
  tcpdumpDownloadKey,
  handleStartTcpdump,
  handleStopTcpdump,
  containers,
  caughtModes,
}) => {
  return (
    <StyledConfigBody>
      <TcpdumpForm
        form={form}
        isElectron={isElectron}
        containers={containers}
        caughtModes={caughtModes}
        tcpdumpMode={tcpdumpMode}
        isStartTcpdump={isStartTcpdump}
        tcpdumpDownloadKey={tcpdumpDownloadKey}
        handleStartTcpdump={handleStartTcpdump}
        handleStopTcpdump={handleStopTcpdump}
      />
    </StyledConfigBody>
  );
};

export default TcpdumpConfigCard;
