import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: () => import('@/Login')
  },
  {
    path: '/entityDetail',
    component: () => import('@/views/entityExplorer/EntityDetail')
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
        component: () => import('@/views/report/reportTest')
      },
      {
        path: '/entityExplorer',
        component: () => import('@/views/entityExplorer/EntityExplorer')
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
            name: 'I18n',
            path: '/administration/i18n',
            component: () => import('@/views/administration/I18n')
          },
          {
            name: 'OperationLog',
            path: '/administration/operationLog',
            component: () => import('@/views/administration/OperationLog')
          },
          {
            name: 'GalaxyProxy',
            path: '/administration/galaxyProxy',
            component: () => import('@/views/administration/GalaxyProxy')
          },
          {
            name: 'Chart',
            path: '/administration/chart',
            component: () => import('@/views/administration/Chart')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
