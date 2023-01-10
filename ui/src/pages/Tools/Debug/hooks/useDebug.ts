import type { OptionsPodInfo } from '@/services/pods';
import type { FormParams } from '@/pages/Tools/Debug/components/ConfigForm';
import { useCallback, useEffect, useState } from 'react';
import { AnchorScrollKey, documentScrollUtil } from '@/utils/documentScrollUtil';
import { useTerminal } from '@/hooks/useTerminal';
import { DEBUG_API } from '@/services/pods';
import { INIT_MONACO_WAIT } from '@/configs/default';

interface DebugProps {
  podInfo?: OptionsPodInfo;
}
export const useDebug = ({ podInfo }: DebugProps) => {
  const [loading, setLoading] = useState(false);
  const [startDebug, setStartDebug] = useState(false);
  const handleStopLoading = useCallback(() => setLoading(false), []);
  const { terminalRef, initTerminal, handleCloseClient } = useTerminal({
    api: DEBUG_API,
    handleStopLoading,
  });
  const handleSubmit = useCallback(
    (values: FormParams) => {
      if (!podInfo) {
        return;
      }
      setLoading(true);
      setStartDebug(true);
      documentScrollUtil(AnchorScrollKey.DebugContent);
      setTimeout(() => {
        initTerminal({ ...podInfo, container: values.container });
      }, INIT_MONACO_WAIT);
    },
    [initTerminal, podInfo],
  );
  const handleStopClient = useCallback(() => {
    setStartDebug(false);
    handleCloseClient();
  }, [handleCloseClient]);

  useEffect(() => {
    return () => {
      handleCloseClient();
    };
  }, [handleCloseClient]);

  return { loading, startDebug, terminalRef, handleSubmit, handleStopClient };
};
