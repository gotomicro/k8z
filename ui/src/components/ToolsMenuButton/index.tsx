import React, { useMemo } from 'react';
import { FloatButton } from 'antd';
import { ToolsMapArr } from '@/pages/ToolsMap/configs/configs';
import { StyledToolsMenuButton } from '@/components/ToolsMenuButton/styles/index.styled';
import { useLocation } from 'umi';
import IconFont from '@/components/IconFont';
import { useTools } from '@/hooks/useTools';

const ToolsMenuButton: React.FC = () => {
  const locationPathname = useLocation().pathname;
  const { handleClickTool } = useTools();
  const currentTool = useMemo(
    () => ToolsMapArr.find((item) => item.pathname === locationPathname),
    [locationPathname],
  );
  if (!currentTool) {
    return null;
  }
  return (
    <StyledToolsMenuButton
      icon={<IconFont type={currentTool.iconType} />}
      trigger="hover"
      type="primary"
    >
      {ToolsMapArr.filter((item) => item.pathname !== locationPathname).map((tool) => (
        <FloatButton
          key={tool.name}
          icon={<IconFont type={tool.iconType} />}
          onClick={() => handleClickTool(tool.name, tool.router)}
          tooltip={tool.name}
        />
      ))}
    </StyledToolsMenuButton>
  );
};
export default ToolsMenuButton;
