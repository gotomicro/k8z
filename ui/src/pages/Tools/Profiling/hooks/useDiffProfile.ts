import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Profile } from '@/services/profiling';
import { unixTimeFormat } from '@/utils/timeUtils';
import { AnchorScrollKey, documentScrollUtil } from '@/utils/documentScrollUtil';

export const useDiffProfile = ({
  showHistory,
  profileHistoryList,
}: {
  showHistory: boolean;
  profileHistoryList: Profile[];
}) => {
  const [baseUrl, setBaseUrl] = useState<string>();
  const [currentBaseUrl, setCurrentBaseUrl] = useState<Profile>();
  const [targetUrl, setTargetUrl] = useState<string>();
  const [openDiffModal, setOpenDiffModal] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const handleClickDiffProfile = useCallback((baseProfile: Profile) => {
    setShowDiff(true);
    setOpenDiffModal(true);
    setCurrentBaseUrl(baseProfile);
  }, []);

  const handleCloseDiffModal = useCallback(() => {
    setOpenDiffModal(false);
    setCurrentBaseUrl(undefined);
  }, []);

  const handleHiddenDiff = useCallback(() => {
    setBaseUrl(undefined);
    setTargetUrl(undefined);
    setCurrentBaseUrl(undefined);
    setShowDiff(false);
  }, []);

  const handleShowDiff = useCallback(
    ({ baseUrl, targetUrl }: { baseUrl: string; targetUrl: string }) => {
      setTargetUrl(targetUrl);
      setBaseUrl(baseUrl);
      setOpenDiffModal(false);
      documentScrollUtil(AnchorScrollKey.Profile);
    },
    [],
  );

  const otherProfileOptions = useMemo(() => {
    return profileHistoryList
      .filter((item) => item.ctime !== currentBaseUrl?.ctime)
      .map((item) => ({
        label: `${unixTimeFormat(item.ctime)} ${item.podName}`,
        value: item.url,
      }));
  }, [currentBaseUrl?.ctime, profileHistoryList]);

  useEffect(() => {
    setOpenDiffModal(false);
    setBaseUrl(undefined);
    setTargetUrl(undefined);
    setCurrentBaseUrl(undefined);
  }, [showHistory]);

  return {
    baseUrl,
    showDiff,
    targetUrl,
    openDiffModal,
    otherProfileOptions,
    handleShowDiff,
    currentBaseUrl,
    handleClickDiffProfile,
    handleHiddenDiff,
    handleCloseDiffModal,
  };
};
