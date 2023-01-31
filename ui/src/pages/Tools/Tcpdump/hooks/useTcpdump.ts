import { INIT_MONACO_WAIT } from '@/configs/default';
import { useSocketTcpdump } from '@/pages/Tools/Tcpdump/hooks/useSocketTcpdump';
import type { OptionsPodInfo } from '@/services/pods';
import type { StartTcpdumpWsUrlParams } from '@/services/tcpdump';
import { TcpdumpMode } from '@/services/tcpdump';
import { AnchorScrollKey, documentScrollUtil } from '@/utils/documentScrollUtil';
import type { FormInstance } from 'antd';
import { message } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useTcpdump = ({
  currentPod,
}: {
  currentPod?: Pick<OptionsPodInfo, 'cluster' | 'namespace' | 'workload' | 'workloadKind' | 'pod'>;
}) => {
  const [isStartTcpdump, setIsStartTcpdump] = useState(false);
  const [tcpdumpMode, setTcpdumpMode] = useState<TcpdumpMode>();
  const [tcpdumpContext, setTcpdumpContext] = useState('');
  const [downloadKey, setDownloadKey] = useState('');
  const tcpdumpFormRef =
    useRef<
      FormInstance<
        Pick<StartTcpdumpWsUrlParams, 'interfaceConfig' | 'filter' | 'mode' | 'containerName'>
      >
    >(null);

  const handleWriteMessage = useCallback((data: string) => {
    setTcpdumpContext((caughtContext) => caughtContext + data);
  }, []);

  const { socket, stopSocket, clientSocket } = useSocketTcpdump({
    handleWriteMessage,
    handleWriteDownloadKey: setDownloadKey,
  });

  const handleStopTcpdump = useCallback(() => {
    setIsStartTcpdump(false);
    stopSocket();
  }, [stopSocket]);

  const handleResetForm = useCallback(() => {
    tcpdumpFormRef.current?.resetFields();
  }, []);

  const handleStartTcpdump = useCallback(
    (
      fields: Pick<
        StartTcpdumpWsUrlParams,
        'interfaceConfig' | 'filter' | 'mode' | 'containerName'
      >,
    ) => {
      if (socket || !currentPod) {
        return;
      }
      setTcpdumpContext('');
      setDownloadKey('');
      const podInfo: Pick<StartTcpdumpWsUrlParams, 'clusterName' | 'namespace' | 'podName'> = {
        clusterName: currentPod.cluster,
        namespace: currentPod.namespace,
        podName: currentPod.pod,
      };
      if (socket) {
        message.warning({ content: '正在进行抓包任务，请结束后再开启' });
      }
      if (fields.mode !== TcpdumpMode.wireshark) {
        documentScrollUtil(AnchorScrollKey.TcpdumpContent);
      }
      setTimeout(() => {
        setTcpdumpMode(fields.mode);
        setIsStartTcpdump(true);
      }, INIT_MONACO_WAIT);
      clientSocket({ ...fields, ...podInfo });
    },
    [clientSocket, currentPod, socket],
  );

  useEffect(() => {
    return () => {
      handleResetForm();
      handleStopTcpdump();
    };
  }, [handleResetForm, handleStopTcpdump]);
  return {
    tcpdumpFormRef,
    tcpdumpMode,
    tcpdumpDownloadKey: downloadKey,
    isStartTcpdump,
    tcpdumpContext,
    handleStartTcpdump,
    handleStopTcpdump,
  };
};
