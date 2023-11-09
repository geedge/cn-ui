import axios from 'axios'
import router from '@/router'
import { getWelcomeMenu, sortByOrderNum, handleRoutes } from '@/permission'
import { ElMessage } from 'element-plus' // dependent on utc plugin
import { dbDrilldownTableConfig, storageKey } from '@/utils/constants'
import { getConfigVersion } from '@/utils/tools'
import { api } from '@/utils/api'
import indexedDBUtils from '@/indexedDB'

const user = {
  state () {
    return {
      menuList: [],
      buttonList: [],
      roleList: [],
      drilldownTableConfigList: [],
      timeFilter: {}
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
    },
    setTimeFilter (state, data) {
      state.timeFilter = data
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
    },
    timeFilter (state) {
      return state.timeFilter
    }
  },
  actions: {
    loginSuccess (store, res) {
      axios.post(api.permissions, { token: res.data.token }).then(response => {
        const res2 = response.data
        const menuList = sortByOrderNum(res2.data.menus)
        store.commit('setMenuList', menuList)
        store.commit('setButtonList', res2.data.buttons)
        store.commit('setRoleList', res2.data.roles)
        const homeRoute = {
          path: '/',
          name: 'home',
          component: () => import('@/components/layout/Home'),
          children: []
        }
        handleRoutes(menuList, homeRoute.children)
        router.addRoute(homeRoute)
        if (res.loginSuccessPath) {
          let tempArr = res.loginSuccessPath.split('?')
          const path = tempArr[0]
          const query = {}
          if (tempArr[1]) {
            tempArr = tempArr[1].split('&')
            tempArr.forEach(t => {
              const firstEqualIndex = t.indexOf('=')
              const key = t.substring(0, firstEqualIndex)
              query[key] = t.substring(firstEqualIndex + 1)
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
      axios.get(api.config, { params: { ckey: 'drill_down_table_config' } }).then(async response => {
        const res = response.data
        if (response.status === 200 && res.page.list && res.page.list.length > 0) {
          // 从接口返回整体配置，再读取用户缓存，将对应条目覆盖，作为使用的配置
          const defaultConfigs = JSON.parse(res.page.list[0].cvalue)
          await indexedDBUtils.selectTable(dbDrilldownTableConfig).put({
            id: 'default',
            version: defaultConfigs.version,
            config: defaultConfigs.config
          })
          const userId = localStorage.getItem(storageKey.userId)
          const oldVersion = await getConfigVersion(userId)
          if (oldVersion !== defaultConfigs.version) {
            indexedDBUtils.selectTable(dbDrilldownTableConfig).delete(userId)
          }
        }
      })
      axios.get(api.config, { params: { ckey: 'link_info' } }).then(response => {
        const res = response.data
        if (response.status === 200 && res.page.list && res.page.list.length > 0) {
          localStorage.setItem(storageKey.linkInfo, res.page.list[0].cvalue)
        }
      })
      axios.get(api.config, { params: { ckey: 'schema_explore' } }).then(response => {
        const res = response.data
        if (response.status === 200 && res.page.list && res.page.list.length > 0) {
          localStorage.setItem(storageKey.schemaEntityExplore, res.page.list[0].cvalue)
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
