import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: () => import('@/Login')
  },
  {
    path: '/',
    component: () => import('@/components/layout/Home'),
    children: [
      {
        name: 'panel',
        path: '/panel/:typeName',
        component: () => import('@/views/charts2/Panel')
      },
      {
        path: '/report/builtIn',
        component: () => import('@/views/report/Report')
      },
      {
        path: '/entityExplorer',
        component: () => import('@/views/entityExplorer/EntityExplorer')
      },
      {
        path: '/entityDetail',
        component: () => import('@/views/entityExplorer/EntityDetail')
      },
      {
        path: '/entityGraph',
        component: () => import('@/views/entityExplorer/EntityGraph2')
      },
      {
        path: '/detection',
        redirect: '/detection/securityEvent'
      },
      {
        path: '/detection/:typeName',
        component: () => import('@/views/detections/Index')
      },
      {
        path: '/businessLog/viewer',
        component: () => import('@/views/businessLog/Viewer')
      },
      {
        path: '/knowledgeBase',
        component: () => import('@/views/setting/KnowledgeBase')
      },
      {
        path: '/knowledgeBase/create',
        component: () => import('@/views/setting/KnowledgeBaseForm')
      },
      {
        path: '/knowledgeBase/edit',
        component: () => import('@/views/setting/KnowledgeBaseForm')
      },
      {
        name: 'Administration',
        path: '/administration',
        redirect: '/administration/user',
        component: () => import('@/views/administration/Index'),
        children: [
          {
            name: 'User',
            path: '/administration/user',
            component: () => import('@/views/administration/User')
          },
          {
            name: 'Role',
            path: '/administration/role',
            component: () => import('@/views/administration/Roles')
          },
          {
            name: 'OperationLog',
            path: '/administration/operationLog',
            component: () => import('@/views/administration/OperationLog')
          },
          {
            name: 'Appearance',
            path: '/administration/appearance',
            component: () => import('@/views/administration/Appearance')
          }
        ]
      },
      {
        name: 'I18n',
        path: '/i18n',
        component: () => import('@/views/administration/I18n')
      },
      {
        name: 'Chart',
        path: '/chart',
        component: () => import('@/views/administration/Chart')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
