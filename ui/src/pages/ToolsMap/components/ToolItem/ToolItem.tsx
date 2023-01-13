import React from 'react';
import type { Tool } from '@/pages/ToolsMap/configs/configs';
import {
  StyledToolItem,
  StyledToolItemImg,
  StyledToolItemTitle,
  StyledToolItemTitleContext,
} from '@/pages/ToolsMap/styles/item.styled';
import { useCallback } from 'react';
import type { ToolNames } from '@/pages/ToolsMap/configs/configs';

export interface ToolItemProps {
  tool: Tool;
  onClick: (name: ToolNames, router: string) => void;
}

const ToolItem: React.FC<ToolItemProps> = ({ tool, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(tool.name, tool.router);
  }, [onClick, tool.name, tool.router]);
  return (
    <StyledToolItem onClick={handleClick}>
      <StyledToolItemTitle>
        <StyledToolItemTitleContext>{tool.name}</StyledToolItemTitleContext>
      </StyledToolItemTitle>
      <StyledToolItemImg url={tool.img} />
    </StyledToolItem>
  );
};
export default ToolItem;
