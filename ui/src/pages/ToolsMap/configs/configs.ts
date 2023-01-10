import TerminalImg from '@/assets/toolsIcon/terminal.png';
import TcpdumpImg from '@/assets/toolsIcon/tcpdump.png';
import FilesImg from '@/assets/toolsIcon/files.png';
import ProfilingImg from '@/assets/toolsIcon/profiling.png';
import PodProxyImg from '@/assets/toolsIcon/pod-proxy.png';
import DebugImg from '@/assets/toolsIcon/debug.png';
import ConfigMapImg from '@/assets/toolsIcon/config.png';

export enum ToolNames {
  Terminal = 'Terminal',
  Tcpdump = 'Tcpdump',
  Files = 'Files',
  Profiling = 'Profiling（GO）',
  PodProxy = 'POD HTTP Proxy',
  PodDebug = 'Debug',
  ConfigMap = 'ConfigMap',
  Nodes = 'Nodes',
}

export interface Tool {
  name: ToolNames;
  img: string;
  iconType: string;
  router: string;
  pathname: string;
}

export const ToolsMapArr: Tool[] = [
  {
    name: ToolNames.Terminal,
    img: TerminalImg,
    router: '#/terminal',
    pathname: '/terminal',
    iconType: 'icon-terminal',
  },
  {
    name: ToolNames.Tcpdump,
    img: TcpdumpImg,
    router: '#/tcpdump',
    pathname: '/tcpdump',
    iconType: 'icon-tcpdump',
  },
  {
    name: ToolNames.Files,
    img: FilesImg,
    router: '#/files',
    pathname: '/files',
    iconType: 'icon-files',
  },
  {
    name: ToolNames.Profiling,
    img: ProfilingImg,
    router: '#/profiling-go',
    pathname: '/profiling-go',
    iconType: 'icon-profilling',
  },
  {
    name: ToolNames.PodProxy,
    img: PodProxyImg,
    router: '#/pod-http-proxy',
    pathname: '/pod-http-proxy',
    iconType: 'icon-pod-http-proxy',
  },
  {
    name: ToolNames.PodDebug,
    img: DebugImg,
    router: '#/debug',
    pathname: '/debug',
    iconType: 'icon-debug',
  },
  {
    name: ToolNames.ConfigMap,
    img: ConfigMapImg,
    router: '#/config-map',
    pathname: '/config-map',
    iconType: 'icon-configmap',
  },
  {
    name: ToolNames.Nodes,
    img: ConfigMapImg,
    router: '#/nodes',
    pathname: '/nodes',
    iconType: 'icon-configmap',
  },
];
