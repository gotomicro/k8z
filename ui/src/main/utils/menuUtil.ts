import type { BrowserWindow } from 'electron';
import { app, Menu, shell } from 'electron';
import { Platforms } from '../enums';

const ToolNames = [
  'Terminal',
  'Tcpdump',
  'Profiling（GO）',
  'POD HTTP Proxy',
  'Debug',
  'ConfigMap',
];

export function initWindowMenu(mainWindow: BrowserWindow) {
  const isMac = process.platform === Platforms.MacOS;
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { label: `关于 ${app.name}`, role: 'about' },
              { type: 'separator' },
              { label: `隐藏 ${app.name}`, role: 'hide' },
              { label: '隐藏其他', role: 'hideOthers' },
              { label: '显示全部', role: 'unhide' },
              { type: 'separator' },
              { label: `退出 ${app.name}`, role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: '编辑',
      role: 'editMenu',
    },
    {
      label: '集群',
      submenu: [
        {
          label: '集群列表',
          accelerator: 'CommandOrControl+Shift+I',
          click: () => mainWindow.webContents.send('message', 'ClusterList'),
        },
        {
          label: '新建集群',
          click: () => mainWindow.webContents.send('message', 'AddCluster'),
        },
      ],
    },
    {
      label: '工具集',
      submenu: ToolNames.map((item) => ({
        label: item,
        click: () => mainWindow.webContents.send('message', item),
      })),
    },
    {
      label: '视图',
      submenu: [
        {
          label: '返回工具集',
          accelerator: 'CommandOrControl+B',
          click: () => {
            mainWindow.webContents.send('message', 'BackHome');
          },
        },
        { label: '重新加载', role: 'reload' },
        { label: '强制重新加载', role: 'forceReload' },
        { label: '检查', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '进入全屏', role: 'togglefullscreen' },
        { label: '实际大小', role: 'resetZoom' },
        { label: '放大', role: 'zoomIn' },
        { label: '缩小', role: 'zoomOut' },
      ],
    },
    {
      label: '帮助',
      role: 'help',
      submenu: [
        {
          label: '更多帮助',
          click: async () => {
            await shell.openExternal('https://github.com/gotomicro/k8z/issues');
          },
        },
      ],
    },
  ];
  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
