<template>
  <div class="cn-container">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'Container',
  data () {
    return {
    }
  }
}
</script>

<style lang="scss">
.cn-container {
  height: calc(100% - 50px);
  background-color: #f6f6f6;
  width: 100%;
  &>div {
    height: 100%;
  }
}
</style>
