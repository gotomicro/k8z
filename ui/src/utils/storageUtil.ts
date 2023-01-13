export enum k8zStorageKeys {
  cluster = 'k8z_cluster',
  namespace = 'k8z_namespace',
  podInfo = 'k8z_podInfo',
  configmapInfo = 'k8z_configmap_info',
  toolsName = 'k8z_toolName',
  toolsRouter = 'k8z_toolsRouter',
}

export const localStorageManage = (key: string, value?: string) => {
  const storage = localStorage.getItem(key);
  if (!storage && value) {
    localStorage.setItem(key, value);
    return value;
  }
  if (value && storage !== value) {
    localStorage.setItem(key, value);
    return value;
  }
  if (!value && storage) {
    return storage;
  }
  return '';
};

export const removeLocalStorageManage = (key: string) => {
  localStorage.removeItem(key);
};
