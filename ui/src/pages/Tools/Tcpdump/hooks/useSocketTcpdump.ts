import type { StartTcpdumpWsUrlParams } from '@/services/tcpdump';
import { getStartTcpdumpWsUrl } from '@/services/tcpdump';
import { message } from 'antd';
import { useCallback, useRef } from 'react';

export enum socketMessages {
  done = 'done',
  out = 'stdout',
  stop = 'stop',
  ping = 'ping',
  pong = 'pong',
}

export interface CaughtSocketProps {
  handleWriteMessage: (data: string) => void;
  handleWriteDownloadKey: (key: string) => void;
}

export const useSocketTcpdump = ({
  handleWriteMessage,
  handleWriteDownloadKey,
}: CaughtSocketProps) => {
  const socketRef = useRef<any>(null);
  const timepieceRef = useRef<any>(null);

  const handleClientSocket = useCallback(() => {
    const outTime = 10000;
    if (timepieceRef.current) {
      clearTimeout(timepieceRef.current);
    }
    timepieceRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: socketMessages.ping,
          }),
        );
      }
    }, outTime);
  }, []);

  const handleSocketMessage = useCallback(
    (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === socketMessages.out) {
          handleWriteMessage(data.data);
        }
        if (data.type === socketMessages.pong) {
          handleClientSocket();
        }
        if (data.type === socketMessages.done) {
          if (data?.key) {
            handleWriteDownloadKey(data.key);
          }
          if (data?.error) {
            message.error({ content: data.error, key: 'socket-error' });
          }
          socketRef.current.close();
          socketRef.current = null;
        }
      } catch (e) {
        console.log(e);
      }
    },
    [handleWriteDownloadKey, handleClientSocket, handleWriteMessage],
  );

  const handleSocketError = useCallback((e) => {
    console.log('socket-error: ', e);
    // termRef.current.write('error: 连接终端失败');
    message.error({ content: 'err: 连接终端失败', key: 'socket-error' });
  }, []);

  const handleSocketClose = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.readyState === 1) {
        socketRef.current?.send(
          JSON.stringify({
            type: socketMessages.stop,
          }),
        );
        socketRef.current.close();
      }
      socketRef.current = null;
    }
  }, []);

  const stopSocket = useCallback(() => {
    if (!socketRef.current) {
      return;
    }
    socketRef.current.send(JSON.stringify({ type: socketMessages.stop }));
    socketRef.current = null;
  }, []);

  const clientSocket = useCallback(
    (params: StartTcpdumpWsUrlParams) => {
      const socket = new WebSocket(getStartTcpdumpWsUrl(params));
      socket.onmessage = handleSocketMessage;
      socket.onerror = handleSocketError;
      socket.onopen = handleClientSocket;
      socket.onclose = handleSocketClose;
      socketRef.current = socket;
    },
    [handleSocketClose, handleClientSocket, handleSocketError, handleSocketMessage],
  );

  return {
    socket: socketRef.current,
    stopSocket,
    clientSocket,
  };
};
