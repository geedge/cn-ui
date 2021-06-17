import { post } from '@/utils/http'
import router from '@/router'
import { sortByOrderNum, getWelcomeMenu } from '@/permission'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { ElMessage } from 'element-plus' // dependent on utc plugin
dayjs.extend(utc)

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
      // res.data.timezone = 'America/New_York'
      window.$dayJs.tz.setDefault(res.data.timezone)
      sessionStorage.setItem('cn-token', res.data.token)
      localStorage.setItem('cn-sys-name', res.data.systemName)
      if (res.systemLogo) {
        localStorage.setItem('cn-sys-logo', res.data.systemLogo)
      }
      localStorage.setItem('cn-sys-timezone', res.data.timezone)
      localStorage.setItem('timezone-offset', dayjs.tz().utcOffset() / 60)
      localStorage.setItem('timezone-local-offset', dayjs().utcOffset() / 60)
      post('/sys/user/permissions', { token: res.data.token }).then(res => {
        const menuList = sortByOrderNum(res.data.menus)
        store.commit('setMenuList', menuList)
        store.commit('setButtonList', res.data.buttons)
        store.commit('setRoleList', res.data.roles)

        const welcomeMenu = getWelcomeMenu(menuList)
        if (welcomeMenu) {
          router.push({
            path: welcomeMenu.route,
            query: {
              t: +new Date()
            }
          })
        } else {
          ElMessage.error('No menu') // TODO 国际化
        }
      })
    },
    logoutSuccess (store, res) {
      sessionStorage.removeItem('cn-username')
      localStorage.removeItem('cn-username')
      sessionStorage.removeItem('cn-token')
    }
  }
}
export default user
