import { createStore } from 'vuex'
import user from './modules/user'

const store = createStore({
  modules: {
    user
  },
  state () {
    return {
      isShrink: localStorage.getItem('cn-left-menu-shrink') === 'true',
      i18n: false
    }
  },
  getters: {
    getIsShrink (state) {
      return state.isShrink
    }
  },
  mutations: {
    isShrink (state) {
      state.isShrink = !state.isShrink
      localStorage.setItem('cn-left-menu-shrink', state.isShrink)
    },
    loadI18n (state) {
      state.i18n = true
    }
  }
})

export default store
