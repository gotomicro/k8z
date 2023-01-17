import type { ChildProcess } from 'child_process';
import { exec } from 'child_process';
import portfinder from 'portfinder';
import { app, dialog } from 'electron';
import * as net from 'net';
import path from 'path';
import { getLogPath } from './utils/loggerUtil';
import fs from 'fs-extra';
import { Platforms } from './enums';

export let serverProcess: ChildProcess;
export let port: number;

let result = false;
let checkTimes = 1;

async function runServer() {
  port = await portfinder.getPortPromise({
    port: 12283, // minimum port
    stopPort: 13283, // maximum port
  });
  const cmd =
    process.platform === Platforms.Win ? `k8z.exe --port ${port}` : `./k8z --port ${port}`;
  const serverPath = getServerPath();
  console.log('serverPath------->', serverPath);
  console.log('env------->', process.env);
  serverProcess = exec(cmd, { cwd: serverPath, env: { ...process.env, GODEBUG: 'x509sha1=1' } });

  // 打印正常的后台可执行程序输出
  serverProcess.stdout?.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  // 打印错误的后台可执行程序输出
  serverProcess.stderr?.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  // 退出之后的输出
  serverProcess.on('close', function (code) {
    console.log('out code：' + code);
    const logPath = getLogPath();
    if (code !== 0) {
      dialog
        .showMessageBox({
          message: '后端进程异常，详细请查看日志。',
          detail: `日志地址：${logPath}`,
          normalizeAccessKeys: false,
          type: 'error',
          textWidth: 420,
          buttons: ['退出 K8Z', '退出 K8Z 并查看日志'],
          defaultId: 0,
        })
        .then(async (res) => {
          if (res.response === 1 && (await fs.pathExists(logPath))) {
            const { shell } = require('electron');
            shell.showItemInFolder(logPath);
          }
          app.quit();
        })
        .catch(console.error);
    } else {
      app.quit();
    }
  });

  await waitUntilServerReady(port);
}

async function waitUntilServerReady(port: number) {
  while (true) {
    await new Promise((r) => setTimeout(r, 500));
    checkTimes++;
    result = await checkPortReady(port);
    if (result) {
      return;
    }
    if (checkTimes >= 30) {
      app.quit();
      return;
    }
  }
}

function checkPortReady(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createConnection({ port });
    server.on('connect', () => {
      server.end();
      console.log(`[Port Ready]: Port ${port} is ready!`);
      resolve(true);
    });
    server.on('error', (err) => {
      console.log(`[Port Error]: Port ${port} is not ready! ${err}`);
      resolve(false);
    });
  });
}

function getServerPath(): string {
  if (!app.isPackaged) {
    return 'server';
  }
  switch (process.platform) {
    case Platforms.Win:
      return path.join(path.dirname(app.getPath('exe')), 'resources', 'server');
    case Platforms.MacOS:
      return path.join(path.dirname(app.getPath('exe')), '..', 'resources', 'server');
    case Platforms.Linux:
    default:
      return path.join(path.dirname(app.getPath('exe')), '..', 'resources', 'server');
  }
}

export default runServer;
