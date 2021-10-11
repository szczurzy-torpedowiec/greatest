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
        path: 'question-sets',
        component: () => import('pages/questionSets/QuestionSets.vue'),
      },
      {
        path: 'question-sets/:id/edit',
        component: () => import('pages/questionSets/Editor.vue'),
      },
      {
        path: 'tests',
        component: () => import('pages/tests/Tests.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
