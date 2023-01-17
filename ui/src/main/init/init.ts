import { BrowserWindow, ipcMain } from 'electron';
import createProtocol from '../createProtocol';
import runServer, { port } from '../server';

const showInitWindow = (isDevelopment: boolean, showCallback: () => Promise<void>) => {
  const initLoadingWindow = new BrowserWindow({
    show: false,
    frame: false, // 无边框（窗口、工具栏等），只包含网页内容
    width: 320,
    height: 360,
    resizable: false,
    transparent: true, // 窗口是否支持透明，如果想做高级效果最好为true
  });
  if (isDevelopment) {
    initLoadingWindow.loadURL('http://localhost:8000/#/init');
  } else {
    createProtocol('k8z');
    initLoadingWindow.loadFile('../server/init/init.html').catch(console.error);
  }
  initLoadingWindow.once('show', showCallback);
  initLoadingWindow.show();
  return initLoadingWindow;
};

export const initWindow = (isDevelopment: boolean, createMainWindow: () => void) => {
  return showInitWindow(isDevelopment, async () => {
    await runServer();
    ipcMain.handle('getBaseUrl', async () => {
      return `http://localhost:${port}`;
    });
    createMainWindow();
  });
};
