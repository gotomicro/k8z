import log from 'electron-log';
import { Platforms } from '../enums';

export const initLog = () => {
  /**
   * 日志文件地址：
   * on Linux: ~/.config/k8z/logs/k8z-init-log.log
   * on macOS: ~/Library/Logs/k8z/k8z-init-log.log
   * on Windows: %USERPROFILE%\AppData\Roaming\k8z\logs\k8z-init-log.log
   */
  log.transports.file.fileName = 'k8z-init-log.log';
  log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
  Object.assign(console, log.functions);
  log.transports.file.getFile().clear();
};

export const getLogPath = () => {
  const userInfo = require('os').userInfo();
  console.log('userInfo: ', userInfo);
  switch (process.platform) {
    case Platforms.Win:
      return `${userInfo.homedir}\\AppData\\Roaming\\k8z\\logs\\k8z-init-log.log`;
    case Platforms.Linux:
      return `${userInfo.homedir}/.config/k8z/logs/k8z-init-log.log`;
    case Platforms.MacOS:
    default:
      return `${userInfo.homedir}/Library/Logs/k8z/k8z-init-log.log`;
  }
};
