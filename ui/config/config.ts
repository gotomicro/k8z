// https://umijs.org/config/
import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV } = process.env;
const BASE_URL_MAPPING = {
  local: undefined,
  dev: 'https://k8z-dev.shimo.run',
  prod: 'https://k8z-dev.shimo.run',
};

export default defineConfig({
  history: { type: 'hash' },
  hash: true,
  antd: {},
  request: {},
  initialState: {},
  model: {},
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: false,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  targets: {},
  // umi routes: https://umijs.org/docs/routing
  routes,
  access: {},
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // umi: https://umijs.org/docs/api/config#cssminifieroptions
  // help: https://esbuild.github.io/api/#minify
  cssMinifier: 'esbuild',
  cssMinifierOptions: {
    minifyWhitespace: true,
    minifySyntax: true,
  },
  clientLoader: {},
  // Fast Refresh 热更新
  fastRefresh: true,
  presets: ['umi-presets-pro'],
  npmClient: 'yarn',
  // help: https://feumijs.org/docs/api/config#codesplitting
  codeSplitting: {
    jsStrategy: 'granularChunks',
  },
  // 不识别 components 和 models 目录下的文件为路由
  // help: https://feumijs.org/docs/api/config#conventionRoutes
  conventionRoutes: {
    exclude: [/\/components\//, /\/models\//],
  },
  // electron 相关配置
  plugins: [require.resolve('umi-plugin-electron-builder')],
  define: {
    'process.env.BASE_URL': BASE_URL_MAPPING[process.env.UMI_ENV ?? 'local'],
  },
  electronBuilder: {
    buildType: 'vite',
    builderOptions: {
      extraResources: [
        {
          from: '../bin',
          to: 'server',
        },
        {
          from: '../config',
          to: 'server/config',
        },
        {
          from: '../static-tcpdump',
          to: 'server/static-tcpdump',
        },
      ],
      win: { icon: './public/icons' },
      mac: { icon: './public/icons' },
      linux: { icon: './public/icons' },
      directories: {
        output: 'build',
      },
    },
  },
});
