import type { ToolNames } from '@/pages/ToolsMap/configs/configs';
import { k8zStorageKeys, localStorageManage, removeLocalStorageManage } from '@/utils/storageUtil';
import { useCallback } from 'react';

export const useTools = () => {
  const handleClickTool = useCallback((name: ToolNames, router: string) => {
    localStorageManage(k8zStorageKeys.toolsName, name);
    localStorageManage(k8zStorageKeys.toolsRouter, router);
    location.hash = router;
  }, []);

  const handleResetToolName = useCallback(() => {
    removeLocalStorageManage(k8zStorageKeys.toolsRouter);
    removeLocalStorageManage(k8zStorageKeys.toolsName);
  }, []);

  return { handleClickTool, handleResetToolName };
};
