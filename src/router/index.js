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
        path: '/panel/:typeName',
        component: () => import('@/views/charts/Panel')
      },
      {
        path: '/user',
        component: () => import('@/views/settings/User')
      },
      {
        path: '/roles',
        component: () => import('@/views/settings/Roles')
      },
      {
        path: '/operationLog',
        component: () => import('@/views/settings/OperationLog')
      },
      {
        path: '/entityExplorer',
        component: () => import('@/views/entities/EntityExplorer')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
