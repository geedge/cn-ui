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
        path: '/trafficSummary',
        component: () => import('@/views/dashboards/TrafficSummary')
      },
      {
        path: '/networkAppPerformance',
        component: () => import('@/views/dashboards/TrafficSummary')
      },
      {
        path: '/dnsServiceInsights',
        component: () => import('@/views/dashboards/TrafficSummary')
      },
      {
        path: '/user',
        component: () => import('@/views/settings/User')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
