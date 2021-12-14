<template>
  <div class="cn-container">
    <router-view :key="routerKey"/>
  </div>
</template>

<script>
export default {
  name: 'Container',
  data () {
    return {
    }
  },
  computed: {
    routerKey () {
      return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    }
  }
}
</script>
