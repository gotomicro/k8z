export enum AnchorScrollKey {
  Profile = 'Profile',
  Response = 'Response',
  DebugContent = 'DebugContent',
  TcpdumpContent = 'TcpdumpContent',
  ConfigmapEditor = 'ConfigmapEditor',
  NodesList = 'NodesList',
}

export function documentScrollUtil(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
