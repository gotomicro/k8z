import type { Pod } from '@/services/pods';
import { useState, useMemo, useEffect } from 'react';
import lodash from 'lodash';

export const MIN_CONTAINERS_LEN = 1;
export const FIST_CONTAINER_INDEX = 0;

export const useContainer = ({ pod }: { pod?: Pod }) => {
  const [container, setContainer] = useState<string>();
  const containers = useMemo(
    () => pod?.containers?.map((item) => ({ label: item, value: item })) ?? [],
    [pod],
  );

  const podInfo = pod
    ? {
        ...lodash.pick(pod, ['cluster', 'namespace', 'workload', 'workloadKind']),
        pod: pod?.name,
      }
    : undefined;

  useEffect(() => {
    // 默认设置第一个 container
    if (containers.length >= MIN_CONTAINERS_LEN) {
      setContainer(containers[FIST_CONTAINER_INDEX].value);
    }
  }, [containers]);

  return { container, containers, podInfo, handleChangeContainer: setContainer };
};
