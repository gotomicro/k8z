import type { DependencyError } from '@/services/dependency';
import { CaughtModeMapping, checkTcpdumpWireshark, TcpdumpMode } from '@/services/tcpdump';
import { useModel } from '@@/plugin-model';
import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Radio, Tooltip } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_ICON_STYLES = {
  marginLeft: '4px',
};

export const useCheckWireshark = () => {
  const { initialState } = useModel('@@initialState');
  const isElectron = initialState?.isElectron || false;
  const [isDisableWireshark, setIsDisableWireshark] = useState(true);
  const [isCheckWiresharkLoading, setIsCheckWiresharkLoading] = useState(true);
  const [wiresharkError, setWiresharkError] = useState<DependencyError>();

  const wiresharkIcon = useMemo(() => {
    if (isElectron && isCheckWiresharkLoading && isDisableWireshark) {
      return <LoadingOutlined style={DEFAULT_ICON_STYLES} />;
    }
    if (isElectron && !isCheckWiresharkLoading && isDisableWireshark && wiresharkError) {
      return (
        <Tooltip
          title={
            <span>
              依赖缺失：<strong>{wiresharkError?.dependency}</strong>，请参考
              <a onClick={() => window.electron?.openInBrowser?.(wiresharkError?.refer)}>
                &nbsp;{wiresharkError?.refer}&nbsp;
              </a>
              解决
            </span>
          }
        >
          <ExclamationCircleOutlined style={{ color: 'crimson', ...DEFAULT_ICON_STYLES }} />
        </Tooltip>
      );
    }
    return null;
  }, [isCheckWiresharkLoading, isDisableWireshark, isElectron, wiresharkError]);

  const caughtModes = useMemo(() => {
    return Object.keys(TcpdumpMode)
      .filter((key) => {
        if (TcpdumpMode.wireshark !== TcpdumpMode[key]) {
          return TcpdumpMode[key];
        }
        if (isElectron && TcpdumpMode.wireshark === TcpdumpMode[key]) {
          return TcpdumpMode.wireshark;
        }
      })
      .map((mode) => (
        <Radio
          key={mode}
          value={mode}
          disabled={isElectron && isDisableWireshark && TcpdumpMode.wireshark === mode}
        >
          {CaughtModeMapping[mode]}
          {TcpdumpMode.wireshark === mode && wiresharkIcon}
        </Radio>
      ));
  }, [isDisableWireshark, isElectron, wiresharkIcon]);

  const handleCheckTcpdumpWireshark = useCallback(() => {
    checkTcpdumpWireshark()
      .then((res) => {
        if (res?.code === 0 && !res?.data.success) {
          setWiresharkError(res.data.dependencyErrors?.[0]);
        }
        if (res?.code === 0 && !!res?.data.success) {
          setIsDisableWireshark(false);
        }
      })
      .catch(console.error)
      .finally(() => setIsCheckWiresharkLoading(false));
  }, []);

  useEffect(() => {
    handleCheckTcpdumpWireshark();
    return () => {
      setIsDisableWireshark(true);
      setIsCheckWiresharkLoading(false);
      setWiresharkError(undefined);
    };
  }, [handleCheckTcpdumpWireshark]);

  return { isElectron, caughtModes };
};
