import styled from 'styled-components';

export const StyledDebug = styled.div`
  padding-top: 8px;
  width: 100%;
  height: 100%;
`;

export const StyledDebugTermEmpty = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const StyledDebugTerm = styled.div<{ isShow?: boolean }>`
  width: 100%;
  height: 100%;
  padding: 8px;
  border-radius: 8px;
  background-color: rgb(250, 250, 250);
  .xterm-dom-renderer-owner-1.focus .xterm-selection div {
    position: absolute;
    background-color: #e3f2fd;
  }

  .xterm-dom-renderer-owner-1 .xterm-selection div {
    position: absolute;
    background-color: #e3f2fd;
  }
`;
