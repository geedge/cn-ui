<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
import { storageKey } from '@/utils/constants'
import router from '@/router'
import { post } from '@/utils/http'
import { api } from '@/utils/api'
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const advancedFormat = require('dayjs/plugin/advancedFormat')
const weekday = require('dayjs/plugin/weekday')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
window.$dayJs = dayjs

export default {
  name: 'App',
  setup () {
    // 处理刷新后  $dayJs的时区变为默认的问题
    const timezone = localStorage.getItem(storageKey.sysTimezone) || ''
    if (timezone) {
      window.$dayJs.tz.setDefault(timezone)
    } else {
      window.$dayJs.tz.setDefault()
    }
  },
  mounted () {
    this.loginAlready()
  },
  methods: {
    /**
     * 已经登录判断
     * 如果已经登录，新打开页面按url打开，否则进入首页
     */
    loginAlready () {
      // 登录判断在router/index.js下操作更合适，但该文件内引入post等方法会导致路由报错，
      // 目前不知道其原因，后续解决该问题后，将登录操作移入router
      const url = window.location.href
      const currentPath = url.match(/#(\S*)/)[1]

      if (currentPath === '/' || currentPath === '/login') {
        if (localStorage.getItem(storageKey.token) !== null) {
          // 刚进入会请求失败，故采用延时，请求成功清除延时器，避免内存泄漏
          const timer = setTimeout(() => {
            post(api.permissions, { token: localStorage.getItem(storageKey.token) }).then(res => {
              if (res.code === 200) {
                router.push({
                  path: '/panel/networkOverview'
                })
                clearTimeout(timer)
              }
            })
          }, 10)
        }
      }
    }
  }
}
</script>
