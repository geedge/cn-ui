<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>

export default {
  name: 'App',
  setup () {
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
