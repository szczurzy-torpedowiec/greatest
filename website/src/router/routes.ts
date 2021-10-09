import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Index.vue'),
      },
      {
        path: '/folders/:folderId',
        component: () => import('pages/Folder.vue'),
      },
      {
        path: '/folders/:folderId/images/:imageId',
        name: 'folderImage',
        component: () => import('pages/Folder.vue'),
      },
      {
        path: '/api-tokens',
        component: () => import('pages/ApiTokens.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
