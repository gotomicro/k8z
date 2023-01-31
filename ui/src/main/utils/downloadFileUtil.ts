import type { BrowserWindow } from 'electron';
import { app, dialog, ipcMain } from 'electron';
import { pathExistsSync } from 'fs-extra';
import path from 'path';

export const openFileDialog = async (mainWindow: BrowserWindow) => {
  const defaultPath = app.getPath('downloads');
  if (!mainWindow) return defaultPath;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: '选择保存位置',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: defaultPath,
  });

  return !canceled ? filePaths[0] : undefined;
};

export async function downloadFile(mainWindow: BrowserWindow) {
  let selectPath = app.getPath('downloads');
  ipcMain.on('download', async (evt, { downloadUrl }) => {
    // 打开系统弹窗 选择文件下载位置]
    openFileDialog(mainWindow)
      .then((res) => {
        if (res) {
          selectPath = res;
          mainWindow.webContents.downloadURL(downloadUrl);
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
      savePath = path.join(selectPath, newFileName);
    }

    console.log('savePath: ', savePath);

    item.setSavePath(savePath);
    app.badgeCount = app.badgeCount + 1;
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          const progress = item.getReceivedBytes() / item.getTotalBytes();
          mainWindow.setProgressBar(progress);
          console.log(
            `Received bytes: ${item.getReceivedBytes()},Total Bytes: ${item.getTotalBytes()}`,
          );
        }
      }
    });
    item.once('done', (event, state) => {
      app.badgeCount = app.badgeCount - 1;
      mainWindow.setProgressBar(-1);
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
