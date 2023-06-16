<template>
  <div class="cn-container" :style="entityDetectionStyle" :class="{'cn-container-entity': entityDetectionStyle}" id="cnContainer">
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
        // 新版实体列表改版，后续记得解开
        const style = route.path === listScrollPath[0] ? 'overflow:auto;background-color: #EFF2F5;' : 'overflow:auto;'
        // const style = 'overflow:auto;'
        return style
      } else {
        return ''
      }
    }
  }
}
</script>
