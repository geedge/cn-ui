<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
import { storageKey } from '@/utils/constants'
export default {
  name: 'App',
  mounted () {
    // 浏览器控制按钮前进后退触发函数
    window.addEventListener('popstate', this.popstate, false)
  },
  unmounted () {
    window.removeEventListener('popstate', this.popstate, false)
  },
  methods: {
    popstate () {
      const historyJSON = sessionStorage.getItem(storageKey.history)
      if (history) {
        const history = JSON.parse(historyJSON)
        if (history.index > -1) {
          history.index--
        } else {
          history.index = history.history.length - 3
        }
        sessionStorage.setItem(storageKey.history, JSON.stringify(history))
        this.$router.push({
          path: history.history[history.index].path,
          query: history.history[history.index].query
        })
      }
    }
  },
  setup () {
    // 处理刷新后  $dayJs的时区变为默认的问题
    const timezone = localStorage.getItem(storageKey.sysTimezone) || ''
    if (timezone) {
      window.$dayJs.tz.setDefault(timezone)
    } else {
      window.$dayJs.tz.setDefault()
    }
  }

}
</script>
