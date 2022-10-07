import router from './router'
import store from './store'
import { ElMessage } from 'element-plus'
import { getPermission } from '@/utils/api'
import { loadGeoData, setHistory } from '@/utils/tools'
import axios from 'axios'
import { storageKey } from '@/utils/constants'
import { loadI18n } from '@/i18n'

const loginWhiteList = ['/login', '/'] // 免登陆白名单
const permissionWhiteList = [...loginWhiteList, '/entityDetail'] // 权限白名单

router.beforeEach(async (to, from, next) => {
  if (to.path.indexOf('/login') == -1) {
    sessionStorage.setItem(storageKey.tokenExpireCurrentPath, decodeURIComponent(to.fullPath))
  }
  // 加载iso-3166-2资源
  loadGeoData()
  // 加载baseUrl
  if (!axios.defaults.baseURL) {
    axios.defaults.baseURL = BASE_CONFIG.baseUrl
  }
  if (localStorage.getItem(storageKey.token)) {
    // 加载i18n
    if (!localStorage.getItem(storageKey.i18n)) {
      await loadI18n()
    }
    // 加载权限
    if (permissionWhiteList.indexOf(to.path) !== -1) {
      setHistory(to)
      next()
    } else {
      if (store.getters.menuList.length === 0) {
        const { menuList, buttonList, roleList } = await getPermission()
        store.commit('setMenuList', menuList)
        store.commit('setButtonList', buttonList)
        store.commit('setRoleList', roleList)
      }
      if (to.path) {
        if (hasMenu(store.getters.menuList, to.path)) {
          setHistory(to)
          next()
        } else {
          ElMessage.error('No access') // TODO 国际化
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

// menuList中是否包含route权限
export function hasMenu (menuList, route) {
  return menuList.some(menu => {
    if (menu.route === route) {
      return true
    } else {
      if (menu.children) {
        if (hasMenu(menu.children, route)) {
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
  const query = {}
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

// 用法 v-has="code" | v-has="[code...]" 任意匹配一个 | v-has:all="[code...]" 全匹配
export const hasPermission = {
  beforeMount (el, binding) {
    // 节点权限处理
    const buttonCode = binding.value
    const arg = binding.arg
    if (buttonCode) {
      if (buttonCode instanceof Array) {
        let has = true
        if (arg && arg === 'all') { // 全匹配
          buttonCode.forEach(button => {
            if (has) {
              has = hasButton(store.getters.buttonList, button)
            }
          })
        } else { // 任意匹配
          has = buttonCode.some(button => {
            return hasButton(store.getters.buttonList, button)
          })
        }
        if (!has) {
          el.parentNode.removeChild(el)
        }
      } else { // 单个匹配
        if (!hasButton(store.getters.buttonList, buttonCode)) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      }
    }
  }
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
