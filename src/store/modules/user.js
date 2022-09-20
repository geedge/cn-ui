import { get, post } from '@/utils/http'
import router from '@/router'
import { sortByOrderNum, getWelcomeMenu } from '@/permission'
import { ElMessage } from 'element-plus' // dependent on utc plugin
import { storageKey } from '@/utils/constants'
import { api } from '@/utils/api'

const user = {
  state () {
    return {
      menuList: [],
      buttonList: [],
      roleList: []
    }
  },
  mutations: {
    setMenuList (state, menuList) {
      state.menuList = [...menuList]
    },
    setButtonList (state, buttonList) {
      state.buttonList = [...buttonList]
    },
    setRoleList (state, roleList) {
      state.roleList = [...roleList]
    },
    clean (state) {
      state.menuList = []
      state.buttonList = []
      state.roleList = []
    }
  },
  getters: {
    menuList (state) {
      return state.menuList
    },
    buttonList (state) {
      return state.buttonList
    },
    roleList (state) {
      return state.roleList
    }
  },
  actions: {
    loginSuccess (store, res) {
      post(api.permissions, { token: res.data.token }).then(res2 => {
        const menuList = sortByOrderNum(res2.data.menus)
        store.commit('setMenuList', menuList)
        store.commit('setButtonList', res2.data.buttons)
        store.commit('setRoleList', res2.data.roles)

        if (res.loginSuccessPath) {
          let tempArr = res.loginSuccessPath.split('?')
          const path = tempArr[0]
          const query = {}
          if (tempArr[1]) {
            tempArr = tempArr[1].split('&')
            tempArr.forEach(t => {
              const kv = t.split('=')
              query[kv[0]] = kv[1]
            })
          }
          router.push({
            path: path,
            query: query
          })
        } else {
          const welcomeMenu = getWelcomeMenu(menuList)
          if (welcomeMenu) {
            router.push({
              path: welcomeMenu.route,
              query: {
                t: +new Date()
              }
            })
          } else {
            ElMessage.error('No menu')
          }
        }
      })
      get(api.config, { ckey: 'drill_down_table_config' }).then(res => {
        if (res.code === 200 && res.page.list && res.page.list.length > 0) {
          localStorage.setItem(storageKey.drillDownTableConfig, res.page.list[0].cvalue)
        }
      })
    },
    logoutSuccess (store, res) {
      localStorage.removeItem(storageKey.username)
      localStorage.removeItem(storageKey.token)
    }
  }
}
export default user
