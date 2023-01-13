import { contextBridge, ipcRenderer } from 'electron';

const apiKey = 'electron';

const api: any = {
  versions: process.versions,
  baseUrl: () => {
    return ipcRenderer.invoke('getBaseUrl');
  },
  downloading: async (downloadUrl: string) => {
    ipcRenderer.send('download', {
      downloadUrl,
    });
  },
  getMessage: (callback: (event: any, message: any) => void) => {
    ipcRenderer.on('message', callback);
  },
};

contextBridge.exposeInMainWorld(apiKey, api);
