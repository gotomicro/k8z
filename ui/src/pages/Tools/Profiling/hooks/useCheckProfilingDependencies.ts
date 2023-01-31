import { getErrorMsg } from '@/pages/Tools/Profiling/utils/dependencyErrorsUtil';
import { checkProfilingDependencies } from '@/services/profiling';
import { useModel } from '@@/plugin-model';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

export const useCheckProfilingDependencies = () => {
  const { initialState } = useModel('@@initialState') || {};
  const isElectron = initialState?.isElectron ?? false;
  const [isShowDependencyErrors, setIsShowDependencyErrors] = useState(false);
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | ReactNode>();

  const handleCheckProfilingDependencies = useCallback(() => {
    if (!isElectron) {
      setIsShowDependencyErrors(false);
      return;
    }
    setIsCheckLoading(true);
    checkProfilingDependencies()
      .then((res) => {
        if (!isElectron) return;
        if (res?.code === 0 && !!res?.data?.success) {
          setIsShowDependencyErrors(false);
          return;
        }
        if (res?.code !== 0) {
          setErrorMessage(`[Error]: ${res.msg}`);
        } else {
          setErrorMessage(getErrorMsg(res?.data?.dependencyErrors || []));
        }
        setIsShowDependencyErrors(true);
      })
      .catch((e) => {
        console.error(e);
        setIsShowDependencyErrors(true);
        setErrorMessage(`[Error]: ${e.toString()}`);
      })
      .finally(() => setIsCheckLoading(false));
  }, [isElectron]);

  useEffect(() => {
    handleCheckProfilingDependencies();
    return () => {
      setErrorMessage(undefined);
      setIsCheckLoading(false);
      setIsShowDependencyErrors(false);
    };
  }, [handleCheckProfilingDependencies]);

  return { errorMessage, isCheckLoading, isShowDependencyErrors, handleCheckProfilingDependencies };
};
