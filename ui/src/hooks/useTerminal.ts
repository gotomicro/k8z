import { useCallback, useRef } from 'react';
import lodash from 'lodash';
import type { OptionsPodInfo } from '@/services/pods';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
// @ts-ignore
// AdventureTime,Dracula
import { OneHalfLight } from 'xterm-theme';
import { getWSHost } from '@/utils/common';
import { DEFAULT_WAIT } from '@/configs/default';

interface TerminalProps {
  api: string;
  handleStopLoading?: () => void;
}

export const useTerminal = ({ api, handleStopLoading }: TerminalProps) => {
  const termRef = useRef<any>(null);
  const terminalRef = useRef<any>(null);
  const termFitAddonRef = useRef<any>(null);
  const colsRef = useRef<number>(0);
  const rowsRef = useRef<number>(0);
  const socketRef = useRef<any>(null);
  const timepieceRef = useRef<any>(null);

  const handleTermResize = useCallback(({ cols, rows }: { cols: number; rows: number }) => {
    if (socketRef.current) {
      termRef.current?.resize(cols, rows);
      socketRef.current.send(
        JSON.stringify({
          type: 'resize',
          rows: rows,
          cols: cols,
        }),
      );
    }
  }, []);

  const handleResize = useCallback(() => {
    const cols = Math.ceil(terminalRef.current?.clientWidth / 9 || 0);
    const rows = Math.ceil(terminalRef.current?.clientHeight / 26 || 0);
    if (cols !== colsRef.current || rows !== rowsRef.current) {
      colsRef.current = cols;
      rowsRef.current = rows;
      handleTermResize({ cols, rows });
      termFitAddonRef.current.fit();
    }
  }, [handleTermResize]);

  const handleClientSocket = useCallback(() => {
    const outTime = 7000;
    clearTimeout(timepieceRef.current);
    timepieceRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: 'ping',
          }),
        );
      }
    }, outTime);
  }, []);

  const handleSocketOpen = useCallback(() => {
    handleStopLoading?.();
    handleClientSocket();
    handleResize();
  }, [handleStopLoading, handleClientSocket, handleResize]);

  const handleSocketClose = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.readyState === 1) {
        socketRef.current?.send(
          JSON.stringify({
            type: 'close',
          }),
        );
      }
      socketRef.current?.close();
      handleStopLoading?.();
      socketRef.current = null;
    }
  }, [handleStopLoading]);

  const handleSocketMessage = useCallback(
    (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'stdout' && data?.data !== 'pong' && termRef.current) {
          termRef.current.write(data.data);
        }
        if (data.type === 'stdout' && data?.data === 'pong') {
          handleClientSocket();
          handleResize();
        }
      } catch (e) {
        console.log(e);
      }
    },
    [handleClientSocket, handleResize],
  );

  const handleSocketError = useCallback(
    (e) => {
      console.log('socket-error: ', e);
      termRef.current.write('error: 连接终端失败');
      handleStopLoading?.();
    },
    [handleStopLoading],
  );

  const handleStartWebsocket = useCallback(
    (currentPod: Required<OptionsPodInfo>) => {
      if (socketRef.current || !api) {
        return;
      }
      const { cluster, namespace, pod, container } = lodash.pick(currentPod, [
        'cluster',
        'namespace',
        'pod',
        'container',
      ]);
      const url = `${getWSHost()}${api}?clusterName=${cluster}&namespace=${namespace}&podName=${pod}&containerName=${container}`;
      const socket = new WebSocket(url);
      socket.onmessage = handleSocketMessage;
      socket.onerror = handleSocketError;
      socket.onopen = handleSocketOpen;
      socket.onclose = handleSocketClose;
      socketRef.current = socket;
    },
    [api, handleSocketMessage, handleSocketError, handleSocketOpen, handleSocketClose],
  );

  const handleTermData = useCallback((data: string) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: 'stdin', data: data }));
    }
  }, []);

  const disposeTerminal = useCallback(() => {
    termRef.current?.dispose(terminalRef.current);
  }, []);

  const initTerminal = useCallback(
    (currentPod: Required<OptionsPodInfo>) => {
      if (!terminalRef.current || !!socketRef.current) {
        return;
      }
      termRef.current = new Terminal({
        theme: OneHalfLight,
        windowsMode: true, // 根据窗口换行
        convertEol: true,
        cursorStyle: 'underline', //光标样式
        cursorBlink: true, //光标闪烁
      });
      termRef.current.onData(handleTermData);
      termRef.current.onResize(handleTermResize);
      termFitAddonRef.current = new FitAddon();
      termRef.current.loadAddon(termFitAddonRef.current);
      if (terminalRef.current) {
        termRef.current.open(terminalRef.current);
      }
      termRef.current.writeln('\x1b[1;1;32mwellcom to web terminal!\x1b[0m');
      setTimeout(() => {
        handleStartWebsocket(currentPod);
      }, DEFAULT_WAIT);
    },
    [handleStartWebsocket, handleTermData, handleTermResize],
  );

  const handleCloseClient = useCallback(() => {
    handleSocketClose();
    disposeTerminal();
    handleStopLoading?.();
  }, [disposeTerminal, handleStopLoading, handleSocketClose]);

  return {
    terminalRef,
    initTerminal,
    handleCloseClient,
  };
};
