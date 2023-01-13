import type { ChildProcess } from 'child_process';
import { exec } from 'child_process';
import portfinder from 'portfinder';
import { app } from 'electron';
import * as net from 'net';
import path from 'path';

export let serverProcess: ChildProcess;
export let port: number;

let result = false;
let checkTimes = 1;

async function runServer() {
  port = await portfinder.getPortPromise({
    port: 9001, // minimum port
    stopPort: 9999, // maximum port
  });
  const cmd = `./k8z --port ${port}`;
  const serverPath = app.isPackaged
    ? path.join(path.dirname(app.getPath('exe')), '..', 'resources', 'server')
    : 'server';
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
    app.quit();
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

export default runServer;
