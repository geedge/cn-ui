import { get, post } from '@/utils/http'
import router from '@/router'
import { sortByOrderNum, getWelcomeMenu } from '@/permission'
import { ElMessage } from 'element-plus' // dependent on utc plugin
import { storageKey, dbDrilldownTableConfig } from '@/utils/constants'
import { readDrilldownTableConfigByUser } from '@/utils/tools'
import { api } from '@/utils/api'
import { db } from '@/indexedDB'

const user = {
  state () {
    return {
      menuList: [],
      buttonList: [],
      roleList: [],
      drilldownTableConfigList: []
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
    setDrilldownTableList (state, drilldownTableConfigList) {
      state.drilldownTableConfigList = [...drilldownTableConfigList]
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
    },
    drilldownTableConfigList (state) {
      return state.drilldownTableConfigList
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
              let firstEqualIndex = t.indexOf('=')
              let key = t.substring(0, firstEqualIndex)
              let value = t.substring(firstEqualIndex + 1)
              query[key] = value
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
      get(api.config, { ckey: 'drill_down_table_config' }).then(async res => {
        if (res.code === 200 && res.page.list && res.page.list.length > 0) {
          // 从接口返回整体配置，再读取用户缓存，将对应条目覆盖，作为使用的配置
          const defaultConfigs = JSON.parse(res.page.list[0].cvalue)
          await db[dbDrilldownTableConfig].put({
            id: 'default',
            config: defaultConfigs
          })
        }
      })
      get(api.config, { ckey: 'link_info' }).then(res => {
        if (res.code === 200 && res.page.list && res.page.list.length > 0) {
          localStorage.setItem(storageKey.linkInfo, res.page.list[0].cvalue)
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
