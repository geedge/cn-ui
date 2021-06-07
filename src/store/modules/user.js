const user = {
  state() {
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
      const menuList = JSON.parse(`[
        {
          "id": 1,
          "name": "dashboards",
          "code": "dashboard",
          "i18n": "dashboard.title",
          "parentId": 0,
          "perms": "",
          "type": 1,
          "route": "",
          "orderNum": 1,
          "icon": "cn-icon cn-icon-menu-dashboard",
          "required": "",
          "children": [
            {
              "id": 2,
              "name": "Traffic summary",
              "code": "overview",
              "i18n": "dashboard.overview.title",
              "parentId": 1,
              "perms": "",
              "type": 1,
              "route": "/traffic",
              "orderNum": 1,
              "icon": "",
              "required": "",
              "children": []
            },
            {
              "id": 3,
              "name": "Network & Application performance",
              "code": "panel",
              "i18n": "dashboard.panel.title",
              "parentId": 1,
              "perms": "",
              "type": 1,
              "route": "/na",
              "orderNum": 2,
              "icon": "",
              "required": ""
            },
            {
              "id": 4,
              "name": "DNS service insights",
              "code": "explore",
              "i18n": "dashboard.metricPreview.title",
              "parentId": 1,
              "perms": "",
              "type": 1,
              "route": "/dns",
              "orderNum": 3,
              "icon": "",
              "required": "",
              "children": []
            }
          ]
        }
      ]`)
      return menuList
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
    },
    logoutSuccess (store, res) {
      sessionStorage.removeItem('nz-username')
      localStorage.removeItem('nz-username')
      sessionStorage.removeItem('nz-token')
    }
  }
}
export default user
