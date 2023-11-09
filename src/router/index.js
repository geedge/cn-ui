import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: () => import('@/Login')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
