import router from './router'
import store from './store'
import { getPermission } from '@/utils/api'
import { loadGeoData } from '@/utils/tools'
import axios from 'axios'
import { storageKey } from '@/utils/constants'
import { loadI18n } from '@/i18n'

const loginWhiteList = ['/login', '/'] // 免登陆白名单
const permissionWhiteList = [...loginWhiteList] // 权限白名单

router.beforeEach(async (to, from, next) => {
  if (to.path.indexOf('/login') === -1) {
    sessionStorage.setItem(storageKey.tokenExpireCurrentPath, decodeURIComponent(to.fullPath))
  }
  // 加载iso-3166-2资源
  loadGeoData()
  // 加载baseUrl
  if (!axios.defaults.baseURL) {
    // eslint-disable-next-line no-undef
    axios.defaults.baseURL = BASE_CONFIG.baseUrl
  }
  if (localStorage.getItem(storageKey.token)) {
    // 加载i18n
    await loadI18n()
    // 加载权限
    if (permissionWhiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      if (store.getters.menuList.length === 0) {
        const { menuList, buttonList, roleList } = await getPermission()
        store.commit('setMenuList', menuList)
        store.commit('setButtonList', buttonList)
        store.commit('setRoleList', roleList)
        const homeRoute = {
          path: '/',
          name: 'home',
          component: () => import('@/components/layout/Home'),
          children: []
        }
        handleRoutes(menuList, homeRoute.children)
        router.addRoute(homeRoute)
        next({ ...to, replace: true })
      } else {
        if (to.path) {
          next()
        }
      }
    }
  } else {
    if (loginWhiteList.indexOf(to.path) !== -1) {
      const tokenExpireCurrentPath = sessionStorage.getItem(storageKey.tokenExpireCurrentPath)
      if (to.path === '/login' && tokenExpireCurrentPath) {
        if (hasParam(to.fullPath, 'redirect')) {
          next()
        } else {
          next({ path: '/login', query: { redirect: decodeURIComponent(tokenExpireCurrentPath) } })
        }
      } else {
        next()
      }
    } else {
      next({ path: '/login', query: { redirect: decodeURIComponent(to.fullPath) } })
    }
  }
})

// menuList中是否包含code
export function hasMenu (menuList, code) {
  return menuList.some(menu => {
    if (menu.code === code) {
      return true
    } else {
      if (menu.children) {
        if (hasMenu(menu.children, code)) {
          return true
        }
      }
    }
    return false
  })
}

export function hasParam (url, param) {
  let hasParam = false
  let tempArr = url.split('?')
  // const query = {}
  if (tempArr[1]) {
    tempArr = tempArr[1].split('&')
    tempArr.forEach(t => {
      const kv = t.split('=')
      if (kv[0] === param) {
        hasParam = true
      }
    })
  }
  return hasParam
}

export function hasButton (buttonList, code) {
  return buttonList.some(button => button === code)
}

// 根据code从menuList和buttonList中判断是否有权限
export function hasPermission (code) {
  return hasButton(store.getters.buttonList, code) || hasMenu(store.getters.menuList, code)
}

// 根据orderNum排序
export function sortByOrderNum (menuList) {
  const r = menuList.sort((a, b) => {
    return a.orderNum - b.orderNum
  })
  r.forEach(menu => {
    if (menu.children && getChildMenu(menu).length > 0) {
      menu.children = menu.children.sort((a, b) => {
        return a.orderNum - b.orderNum
      })
    }
  })
  return r
}

function getChildMenu (menu) {
  return menu.children.filter(m => m.type === 1)
}

/* 获取第一个菜单 */
export function getWelcomeMenu (menu) {
  for (let i = 0; i < menu.length; i++) {
    const m = menu[i]
    if (m.type === 1) {
      if (m.children && getChildMenu(m).length > 0) {
        return getWelcomeMenu(m.children)
      } else {
        return m
      }
    }
  }
}

export function handleComponent (code) {
  switch (code) {
    case 'networkOverview':
    case 'networkAppPerformance':
    case 'dnsServiceInsights':
    case 'linkMonitor':
      return () => import('@/views/charts2/Panel')
    case 'entity':
      return () => import('@/views/entityExplorer/EntityExplorer')
    case 'entityDetail':
      return () => import('@/views/entityExplorer/EntityDetail')
    case 'entityGraph':
      return () => import('@/views/entityExplorer/EntityGraph')
    case 'securityEvents':
    case 'performanceEvents':
      return () => import('@/views/detections/Index')
    case 'detectionPolicy':
      return () => import('@/views/detections/detectionPolicies/Index')
    case 'createDetectionPolicy':
    case 'editDetectionPolicy':
      return () => import('@/views/detections/detectionPolicies/PolicyForm')
    case 'report':
      return () => import('@/views/report/Report')
    case 'knowledgeBase':
      return () => import('@/views/setting/KnowledgeBase')
    case 'userDefinedLibrary':
      return () => import('@/views/setting/KnowledgeBaseUserDefinedList')
    case 'createUserDefinedLibrary':
    case 'editUserDefinedLibrary':
      return () => import('@/views/setting/KnowledgeBaseForm')
    case 'administration':
      return () => import('@/views/administration/Index')
    case 'user':
      return () => import('@/views/administration/User')
    case 'role':
      return () => import('@/views/administration/Roles')
    case 'operationLog':
      return () => import('@/views/administration/OperationLog')
    case 'appearance':
      return () => import('@/views/administration/Appearance')
    case 'license':
      return () => import('@/views/administration/License')
    case 'I18N':
      return () => import('@/views/administration/I18n')
    case 'system':
      return () => import('@/views/system/Index')
    case 'plugin':
      return () => import('@/views/system/Plugin')
    case 'locationMap':
    case 'traceTracking':
      return () => import('@/views/location/Index')
    default:
      return null
  }
}

export function handleRoutes (menus, routes) {
  menus.forEach(menu => {
    if (menu.route === '' && (!menu.children || menu.children.length < 0)) {
      return false
    }
    // administration的路由使用了嵌套，其他的是平铺
    if (menu.pid === 0 && (menu.code === 'administration' || menu.code === 'system')) {
      const path = menu.route.replace('redirect:', '')
      if (menu.children && menu.children.length > 0) {
        const route = {
          name: menu.name,
          path,
          redirect: menu.children[0].route,
          component: handleComponent(menu.code),
          children: []
        }
        menu.children.forEach(c => {
          route.children.push({
            name: c.name,
            path: c.route,
            component: handleComponent(c.code)
          })
        })
        routes.push(route)
      }
    } else {
      if (menu.route && menu.route.startsWith('redirect:')) {
        const path = menu.route.replace('redirect:', '')
        if (menu.children && menu.children.length > 0) {
          routes.push({
            name: menu.name,
            path,
            redirect: menu.children[0].route
          })
          handleRoutes(menu.children, routes)
        }
      } else {
        routes.push({
          name: menu.code,
          path: menu.route,
          component: handleComponent(menu.code)
        })
      }
      if (menu.children && menu.children.length > 0) {
        handleRoutes(menu.children, routes)
      }
    }
  })
}
