import { Settings as LayoutSettings } from '@ant-design/pro-components';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  layout: 'top',
  contentWidth: 'Fixed',
  fixedHeader: true,
  fixSiderbar: true,
  footerRender: false,
  headerRender: false,
  menuRender: false,
  menuHeaderRender: false,
  menu: {
    locale: false,
  },
  pwa: false,
  logo: '/logo.svg',
  splitMenus: false,
  title: 'k8z',
};

export default Settings;
