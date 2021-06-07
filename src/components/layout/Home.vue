<template>
  <div class="cn-home">
    <left-menu @refresh="refresh"></left-menu>
    <div ref="body" class="cn-body">
      <cn-header></cn-header>
      <cn-container v-if="containerShow" ref="container"></cn-container>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import LeftMenu from './LeftMenu'
import Container from './Container'
export default {
  name: 'Home',
  components: {
    LeftMenu,
    'cn-header': Header,
    'cn-container': Container
  },
  data () {
    return {
      containerShow: true
    }
  },
  methods: {
    refresh () {
      this.containerShow = false
      this.$nextTick(() => { this.containerShow = true })
    }
  }
}
</script>

<style lang="scss">
.cn-home {
  display: flex;
  height: 100%;
  transition: all .2s;
  .cn-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: calc(100% - 240px);
    transition: all .2s;
  }
}
</style>
