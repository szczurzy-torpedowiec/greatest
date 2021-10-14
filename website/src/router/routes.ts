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
        path: 'tests/:testShortId',
        components: {
          default: () => import('pages/tests/Test.vue'),
          toolbarContent: () => import('pages/tests/Toolbar.vue'),
        },
        children: [
          {
            name: 'test-tab-questions',
            path: 'questions',
            component: () => import('pages/tests/tabs/Questions.vue'),
          },
          {
            name: 'test-tab-sheets',
            path: 'sheets',
            component: () => import('pages/tests/tabs/Sheets.vue'),
          },
          {
            name: 'test-tab-scans',
            path: 'scans',
            component: () => import('pages/tests/tabs/Scans.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
