<template>
  <div class="cn-container" :style="entityDetectionStyle" id="cnContainer">
    <router-view :key="routerKey"/>
  </div>
</template>

<script>
import { listScrollPath } from '@/utils/constants'

export default {
  name: 'Container',
  data () {
    return {
    }
  },
  computed: {
    routerKey () {
      return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    },
    entityDetectionStyle () {
      const route = this.$route.name !== undefined ? this.$route.name : this.$route
      if (listScrollPath.indexOf(route.path) > -1) {
        return 'overflow:auto;background-color: #EFF2F5;'
      } else {
        return ''
      }
    }
  }
}
</script>
