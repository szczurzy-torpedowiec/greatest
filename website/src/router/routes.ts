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
        path: 'teacher/question-sets',
        component: () => import('pages/questionSets/QuestionSets.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'teacher/question-sets/:id/edit',
        component: () => import('pages/questionSets/Editor.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'teacher/tests',
        component: () => import('pages/tests/Tests.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: 'teacher/tests/:testShortId',
        components: {
          default: () => import('pages/tests/Test.vue'),
          toolbarContent: () => import('components/test/Toolbar.vue'),
          meta: {
            requiresAuth: true,
          },
        },
        children: [
          {
            path: 'questions',
            component: () => import('pages/tests/tabs/Questions.vue'),
            meta: { testTab: 'questions' },
          },
          {
            path: 'sheets',
            component: () => import('pages/tests/tabs/Sheets.vue'),
            meta: { testTab: 'sheets' },
          },
          {
            name: 'TestScanTab',
            path: 'scans/:scanShortId?',
            component: () => import('pages/tests/tabs/Scans.vue'),
            meta: { testTab: 'scans' },
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
