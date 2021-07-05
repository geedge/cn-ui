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

<style lang="scss">
.cn-container {
  height: calc(100% - 50px);
  background-color: $--content-right-background-color;
  width: 100%;
  &>div {
    height: 100%;
  }
}
</style>
