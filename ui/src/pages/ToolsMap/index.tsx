import { useTools } from '@/hooks/useTools';
import ToolItem from '@/pages/ToolsMap/components/ToolItem/ToolItem';
import { ToolsMapArr } from '@/pages/ToolsMap/configs/configs';
import { useResizeWindow } from '@/pages/ToolsMap/hooks/useResizeWindow';
import { StyledToolsMap, StyledToolsMapSpace } from '@/pages/ToolsMap/styles/index.styled';
import { k8zStorageKeys, localStorageManage } from '@/utils/storageUtil';
import { useEffect } from 'react';

const ToolsMap = () => {
  const { spaceWidth } = useResizeWindow();
  const { handleClickTool, handleResetToolName } = useTools();

  // 暂时没想到更好的方案了，但是可以做到每次回到首页都清掉一次上次所选的工具
  useEffect(() => {
    if (localStorageManage(k8zStorageKeys.toolsName)) {
      handleResetToolName();
    }
  }, [handleResetToolName]);

  return (
    <StyledToolsMap>
      <StyledToolsMapSpace wrap size={[16, 34]} width={spaceWidth}>
        {ToolsMapArr.map((tool) => (
          <ToolItem key={tool.name} tool={tool} onClick={handleClickTool} />
        ))}
      </StyledToolsMapSpace>
    </StyledToolsMap>
  );
};
export default ToolsMap;
