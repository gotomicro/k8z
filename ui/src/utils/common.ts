const baseUrl =
  window?.electron && window.electron.baseUrl
    ? await window.electron.baseUrl()
    : process.env.BASE_URL;

export function getWSHost() {
  if (baseUrl?.startsWith('https://')) {
    return baseUrl?.replace('https', 'wss');
  }
  return baseUrl?.replace('http', 'ws') ?? 'ws://localhost:9001';
}
