<template>
  <div class="cn-home">
    <left-menu @refresh="refresh"></left-menu>
    <main ref="body" class="cn-body">
      <cn-header></cn-header>
      <cn-container v-if="containerShow" ref="container"></cn-container>
    </main>
    <!-- 临时文本dom，用来计算文本长度 -->
    <span class="temp-dom"></span>
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
