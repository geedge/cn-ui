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
        path: '/panel/:typeName',
        component: () => import('@/views/charts/Panel')
      },
      {
        path: '/user',
        component: () => import('@/views/settings/User')
      },
      {
        path: '/role',
        component: () => import('@/views/settings/Roles')
      },
      {
        path: '/i18n',
        component: () => import('@/views/settings/I18n')
      },
      {
        path: '/operationLog',
        component: () => import('@/views/settings/OperationLog')
      },
      {
        path: '/entityExplorer',
        component: () => import('@/views/entityExplorer/EntityExplorer')
      },
      {
        path: '/detections',
        component: () => import('@/views/detections/Index')
      },
      {
        path: '/galaxyProxy',
        component: () => import('@/views/settings/GalaxyProxy')
      },
      {
        path: '/chart',
        component: () => import('@/views/settings/Chart')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
