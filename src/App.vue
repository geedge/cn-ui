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
  }
}
</script>
