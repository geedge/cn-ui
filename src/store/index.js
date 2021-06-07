import { createStore } from 'vuex'
import user from './modules/user'

const store = createStore({
  modules: {
    user
  },
  state () {
    return {
      isShrink: localStorage.getItem('cn-left-menu-shrink') === 'true'
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
      localStorage.setItem('nz-left-menu-shrink', state.isShrink)
    }
  }
})

export default store
