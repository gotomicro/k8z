import { app, BrowserWindow, dialog, ipcMain, protocol } from 'electron';
import * as path from 'path';
import createProtocol from './createProtocol';
import runServer, { port, serverProcess } from './server';
import { fixPathUtil } from './utils/fixPathUtil';
import { initLog } from './utils/loggerUtil';
import { pathExistsSync } from 'fs-extra';
import { initWindowMenu } from './utils/menuUtil';

initLog();
fixPathUtil();
let loading: BrowserWindow;
let mainWindow: BrowserWindow;
const isDevelopment = process.env.NODE_ENV === 'development';

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

const showLoading = (cb: () => Promise<void>) => {
  loading = new BrowserWindow({
    show: false,
    frame: false, // 无边框（窗口、工具栏等），只包含网页内容
    width: 320,
    height: 360,
    resizable: false,
    transparent: true, // 窗口是否支持透明，如果想做高级效果最好为true
  });
  loading.once('show', cb);
  if (isDevelopment) {
    loading.loadURL('http://localhost:8000/#/init');
  } else {
    createProtocol('app');
    loading.loadURL('app://./index.html/#/init');
  }
  loading.show();
};

const openFileDialog = async () => {
  const defaultPath = app.getPath('downloads');
  if (!mainWindow) return defaultPath;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: '选择保存位置',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: defaultPath,
  });

  return !canceled ? filePaths[0] : undefined;
};

async function downloadFile() {
  let selectPath = '';
  ipcMain.on('download', async (evt, args) => {
    // 打开系统弹窗 选择文件下载位置]
    openFileDialog()
      .then((res) => {
        if (res) {
          selectPath = res;
          mainWindow.webContents.downloadURL(args.downloadUrl);
        }
      })
      .catch(console.error);
  });
  mainWindow.webContents.session.on('will-download', async (event, item) => {
    // Set the save path, making Electron not to prompt a save dialog.
    const fileName = item.getFilename();
    // 文件名自增逻辑
    let fileNum = 0;
    let savePath = `${selectPath}/${fileName}`;
    const ext = path.extname(fileName);
    const name = path.basename(fileName, ext);
    while (pathExistsSync(savePath)) {
      fileNum += 1;
      const newFileName = path.format({
        ext,
        name: `${name}(${fileNum})`,
      });
      savePath = `${selectPath}/${newFileName}`;
    }

    item.setSavePath(savePath);
    app.badgeCount = 1;
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });
    item.once('done', (event, state) => {
      app.badgeCount = 0;
      if (state === 'completed') {
        console.log('Download successfully');
        dialog.showMessageBox(mainWindow, {
          message: 'Download successfully',
          normalizeAccessKeys: false,
          icon: '',
          type: 'info',
        });
      } else {
        console.log(`Download failed: ${state}`);
        if (state !== 'cancelled')
          dialog.showMessageBox(mainWindow, {
            message: `Download failed: ${state}`,
            normalizeAccessKeys: false,
            type: 'error',
          });
      }
    });
  });
}

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
    loading.hide();
    loading.close();
    mainWindow.show();
  });
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:8000');
  } else {
    createProtocol('app');
    mainWindow.loadURL('app://./index.html/');
  }
  downloadFile().catch(console.error);
}

app.on('ready', async () => {
  showLoading(async () => {
    await runServer();
    ipcMain.handle('getBaseUrl', async () => {
      return `http://localhost:${port}`;
    });
    createWindow();
  });
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
