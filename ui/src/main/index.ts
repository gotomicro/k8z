import { app, BrowserWindow, protocol } from 'electron';
import * as path from 'path';
import createProtocol from './createProtocol';
import { serverProcess } from './server';
import { fixPathUtil } from './utils/fixPathUtil';
import { initLog } from './utils/loggerUtil';
import { initWindowMenu } from './utils/menuUtil';
import { downloadFile } from './utils/downloadFileUtil';
import { initWindow } from './init/init';

initLog();
fixPathUtil();
let initWindowLoading: BrowserWindow;
let mainWindow: BrowserWindow;
const isDevelopment = process.env.NODE_ENV === 'development';

protocol.registerSchemesAsPrivileged([
  { scheme: 'k8z', privileges: { secure: true, standard: true } },
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      webSecurity: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  initWindowMenu(mainWindow);
  mainWindow.once('ready-to-show', () => {
    console.log('ready-to-show');
    initWindowLoading.hide();
    initWindowLoading.close();
    mainWindow.show();
  });
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:8000').catch(console.error);
  } else {
    createProtocol('k8z');
    mainWindow.loadURL('k8z://./index.html/').catch(console.error);
  }
  downloadFile(mainWindow).catch(console.error);
}

app.on('ready', () => {
  initWindowLoading = initWindow(isDevelopment, createWindow);
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
