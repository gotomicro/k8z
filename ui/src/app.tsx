import Footer from '@/components/Footer';
import { handleElectronMessage, RequestBaseUrl } from '@/utils/electronRenderUtil';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { loader } from '@monaco-editor/react';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { notification } from 'antd';
import type { RequestConfig } from 'umi';
import defaultSettings from '../config/defaultSettings';

// 初始化 monaco
loader
  .init()
  .then(() => {
    console.log('monaco init success');
  })
  .catch((e) => {
    console.error('error: ', e);
    notification.error({
      message: '依赖加载错误',
      description: 'Monaco-editor 依赖加载错误，请检查网络后重启项目，否则将影响编辑器的使用。',
      duration: null,
      key: 'error-init-monaco-editor',
    });
  });

const loginPath = '/user/login';

// 处理 electron 传递过来的消息
window.electron?.getMessage?.(handleElectronMessage);

/**
 * @see https://v3.umijs.org/zh-CN/plugins/plugin-request
 */
export const request: RequestConfig = {
  // @ts-ignore
  baseURL: RequestBaseUrl,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  loading?: boolean;
  // 判断运行环境是否是在 Electron
  isElectron?: boolean;
}> {
  const userAgent = navigator.userAgent.toLowerCase();
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    return {
      settings: defaultSettings,
      isElectron: userAgent.indexOf(' electron/') > -1,
    };
  }
  return {
    settings: defaultSettings,
    isElectron: userAgent.indexOf(' electron/') > -1,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    disableContentMargin: false,
    footerRender: () => <Footer />,
    onPageChange: () => {
      // const { location } = history;
      // console.log(history);
      // 如果没有登录，重定向到 login
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    ...initialState?.settings,
  };
};
