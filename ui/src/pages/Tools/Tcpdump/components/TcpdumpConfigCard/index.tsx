import type { RefObject } from 'react';
import React from 'react';
import { StyledConfigBody } from '@/pages/Tools/Tcpdump/styles/config.styled';
import TcpdumpForm from '@/pages/Tools/Tcpdump/components/TcpdumpForm';
import type { StartTcpdumpWsUrlParams, TcpdumpMode } from '@/services/tcpdump';
import type { FormInstance } from 'antd';
import type { DefaultOptionType } from 'rc-select/lib/Select';

interface TcpdumpConfigCardProps {
  tcpdumpMode?: TcpdumpMode;
  containers: DefaultOptionType[];
  isStartTcpdump: boolean;
  tcpdumpDownloadKey: string;
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
  tcpdumpDownloadKey,
  handleStartTcpdump,
  handleStopTcpdump,
  containers,
}) => {
  return (
    <StyledConfigBody>
      <TcpdumpForm
        containers={containers}
        isStartTcpdump={isStartTcpdump}
        tcpdumpMode={tcpdumpMode}
        form={form}
        tcpdumpDownloadKey={tcpdumpDownloadKey}
        handleStartTcpdump={handleStartTcpdump}
        handleStopTcpdump={handleStopTcpdump}
      />
    </StyledConfigBody>
  );
};

export default TcpdumpConfigCard;
