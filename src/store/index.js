import { createStore } from 'vuex'
import user from './modules/user'

const store = createStore({
  modules: {
    user
  },
  state () {
    return {
      isShrink: localStorage.getItem('cn-left-menu-shrink') === 'true',
      i18n: false,

      showEntityTypeSelector: false, // 在entity explore页面时，控制header显示实体类型选择框
      from: '', // entity type
      entityName: '' // entity名称，用于header顶部面包屑展示
    }
  },
  getters: {
    getIsShrink (state) {
      return state.isShrink
    },
    getShowEntityTypeSelector (state) {
      return state.showEntityTypeSelector
    },
    from (state) {
      return state.from
    },
    entityName (state) {
      return state.entityName
    }
  },
  mutations: {
    isShrink (state) {
      state.isShrink = !state.isShrink
      localStorage.setItem('cn-left-menu-shrink', state.isShrink)
    },
    loadI18n (state) {
      state.i18n = true
    },
    entityTypeChange (state, from) {
      if (from) {
        state.from = from
      }
    },
    showEntityTypeSelector (state, show) {
      state.showEntityTypeSelector = show
    },
    setEntityName (state, entityName) {
      state.entityName = entityName
    }
  }
})

export default store
