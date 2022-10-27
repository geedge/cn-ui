<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
import { storageKey } from '@/utils/constants'
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
  }

}
</script>
