import router from './router'
import store from './store'
import { get, post } from './utils/http'
import { ElMessage } from 'element-plus'

const loginWhiteList = ['/login'] // 免登陆白名单
const permissionWhiteList = [...loginWhiteList] // 权限白名单

router.beforeEach((to, from, next) => {
  if (sessionStorage.getItem('cn-token')) {
    if (permissionWhiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      new Promise(resolve => {
        if (store.getters.menuList.length === 0) {
          get(`${process.env.BASE_URL}config.json?Timestamp=${new Date().getTime()}`).then(config => {
            post(config.baseUrl + 'sys/user/permissions', { token: sessionStorage.getItem('cn-token') }).then(res => {
              store.commit('setMenuList', sortByOrderNum(res.data.menus))
              store.commit('setButtonList', res.data.buttons)
              store.commit('setRoleList', res.data.roles)
              resolve()
            })
          })
        } else {
          resolve()
        }
      }).then(res => {
        if (to.path) {
          if (hasMenu(store.getters.menuList, to.path)) {
            next()
          } else {
            ElMessage.error('No access') // TODO 国际化
          }
        }
      })
    }
  } else {
    if (loginWhiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next({ path: '/login' })
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
