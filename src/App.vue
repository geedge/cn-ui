<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
import { get } from '@/utils/http'
import axios from 'axios'

export default {
  name: 'App',
  setup () {
    get(`${process.env.BASE_URL}config.json?Timestamp=${new Date().getTime()}`).then(config => {
      axios.defaults.baseURL = config.baseUrl
    })
    // 处理刷新后  $dayJs的时区变为默认的问题
    const timezone = localStorage.getItem('cn-sys-timezone') || ''
    if (timezone) {
      window.$dayJs.tz.setDefault(timezone)
    } else {
      window.$dayJs.tz.setDefault()
    }
  }

}
</script>
