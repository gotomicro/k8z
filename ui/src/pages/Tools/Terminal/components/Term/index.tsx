import React, { useEffect, useRef } from 'react';
import {
  StyledFullscreenButton,
  StyledTerm,
  StyledTerminal,
} from '@/pages/Tools/Terminal/styles/term.styled';
import 'xterm/css/xterm.css';
import type { OptionsPodInfo } from '@/services/pods';
import { TERMINAL_API } from '@/services/pods';
import { useTerminal } from '@/hooks/useTerminal';
import { useFullscreen } from 'ahooks';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';

export interface TermProps {
  pod: Required<OptionsPodInfo>;
}

const Term: React.FC<TermProps> = ({ pod }) => {
  const termRef = useRef<HTMLDivElement>(null);
  const { terminalRef, initTerminal, handleCloseClient } = useTerminal({
    api: TERMINAL_API,
  });
  const [isFullscreen, { enterFullscreen, exitFullscreen }] = useFullscreen(termRef);

  useEffect(() => {
    initTerminal(pod);
    return () => {
      handleCloseClient();
    };
  }, [handleCloseClient, initTerminal, pod]);
  return (
    <StyledTerm ref={termRef} isFullscreen={isFullscreen}>
      <StyledTerminal ref={terminalRef} />
      <StyledFullscreenButton
        type="link"
        onClick={isFullscreen ? exitFullscreen : enterFullscreen}
        icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
      />
    </StyledTerm>
  );
};

export default Term;
