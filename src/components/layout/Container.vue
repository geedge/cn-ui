<template>
  <div class="cn-container">
    <router-view :key="routerKey"/>
    <!-- 临时文本dom，用来计算文本长度 -->
    <span class="temp-dom temp-dom--12"></span>
    <span class="temp-dom temp-dom--14"></span>
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

  .temp-dom {
    visibility: hidden;
    font-size: 14px;
    position: fixed;
  }
  .temp-dom--12 {
    font-size: 12px;
  }
  .temp-dom--14 {
    font-size: 14px;
  }
}
</style>
