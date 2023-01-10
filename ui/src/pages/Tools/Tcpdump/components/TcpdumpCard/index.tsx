import React, { useMemo } from 'react';
import { TcpdumpMode } from '@/services/tcpdump';
import { Empty } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import {
  StyledTcpdumpContentEmpty,
  StyledTcpdumpTerminal,
} from '@/pages/Tools/Tcpdump/styles/index.styled';
import Loading from '@/components/Loading';

interface TcpdumpCardProps {
  tcpdumpMode?: TcpdumpMode;
  isStartTcpdump: boolean;
  tcpdumpContext: string;
}
const TcpdumpCard: React.FC<TcpdumpCardProps> = ({
  tcpdumpMode,
  isStartTcpdump,
  tcpdumpContext,
}) => {
  const content = useMemo(() => {
    if (!isStartTcpdump && (!tcpdumpMode || tcpdumpMode !== TcpdumpMode.stdout)) {
      return (
        <StyledTcpdumpContentEmpty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂未开始抓包任务"
        />
      );
    }

    switch (tcpdumpMode) {
      case TcpdumpMode.stdout: {
        return (
          <StyledTcpdumpTerminal>
            <MonacoEditor
              height={'100%'}
              width={'100%'}
              value={tcpdumpContext}
              language={'plaintext'}
              options={{
                theme: 'vs',
                wordWrap: 'on',
                tabSize: 2,
                readOnly: true,
                scrollBeyondLastLine: false,
                selectOnLineNumbers: true,
                automaticLayout: true,
                cursorStyle: 'line',
                foldingStrategy: 'indentation',
                find: {
                  addExtraSpaceOnTop: false,
                },
              }}
            />
          </StyledTcpdumpTerminal>
        );
      }
      case TcpdumpMode.file:
      case TcpdumpMode.wireshark:
        return (
          <Loading
            loading={isStartTcpdump}
            size="large"
            tip={`正在进行抓包中...${
              tcpdumpMode === TcpdumpMode.file ? ' 点击停止即可下载抓包内容' : ''
            }`}
          />
        );
      default:
        return null;
    }
  }, [tcpdumpContext, tcpdumpMode, isStartTcpdump]);
  return <>{content}</>;
};
export default TcpdumpCard;
