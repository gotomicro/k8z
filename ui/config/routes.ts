export default [
  {
    path: '/',
    layout: false,
    component: '@/layouts/index',
    routes: [
      {
        path: '/',
        name: '首页',
        component: '@/pages/index',
      },
      {
        path: '/:tools',
        name: '工具',
        component: '@/pages/Tools',
      },
      { path: '/manage/cluster', component: '@/pages/ClustersManage' },
    ],
  },
  { path: '/init', layout: false, component: '@/pages/AppInit' },
  {
    path: '*',
    layout: false,
    component: '@/pages/404',
  },
];
