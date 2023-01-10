import styled from 'styled-components';
import { Button } from 'antd';

export const StyledTerm = styled.div<{ isFullscreen: boolean }>`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin-top: 8px;
  padding: ${({ isFullscreen }) => (isFullscreen ? '18px' : '8px')};
  background-color: rgb(250, 250, 250);
  border-radius: 8px;
  .xterm-dom-renderer-owner-2.focus .xterm-selection div {
    position: absolute;
    background-color: #e3f2fd;
  }

  .xterm-dom-renderer-owner-2 .xterm-selection div {
    position: absolute;
    background-color: #e3f2fd;
  }
`;

export const StyledTerminal = styled.div`
  width: 100%;
  height: 100%;
`;

export const StyledFullscreenButton = styled(Button)`
  position: absolute;
  top: 0;
  right: 18px;
`;
