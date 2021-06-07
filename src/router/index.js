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
        path: '/traffic',
        component: () => import('@/views/dashboards/TrafficSummary')
      },
      {
        path: '/na',
        component: () => import('@/views/dashboards/TrafficSummary')
      },
      {
        path: '/dns',
        component: () => import('@/views/dashboards/TrafficSummary')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
