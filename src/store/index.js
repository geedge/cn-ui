import { createStore } from 'vuex'
import user from './modules/user'
import panel from './modules/panel'

const store = createStore({
  modules: {
    user,
    panel
  },
  state () {
    return {
      i18n: false,
      showEntityTypeSelector: false, // 在entity explore页面时，控制header显示实体类型选择框
      from: '', // entity type
      test: 'jest' // 用于单测的demo
    }
  },
  getters: {
    getShowEntityTypeSelector (state) {
      return state.showEntityTypeSelector
    },
    from (state) {
      return state.from
    },
    entityName (state) {
      return state.entityName
    },
    getTest (state) {
      return state.test
    }
  },
  mutations: {
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
    setTest (state, test) {
      state.test = test
    }
  }
})

export default store
