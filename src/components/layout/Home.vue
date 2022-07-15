<template>
  <div class="cn-home">
    <cn-header @refresh="refresh"></cn-header>
    <cn-container v-if="containerShow" ref="container"></cn-container>
  </div>
</template>

<script>
import Header from './Header'
import Container from './Container'
import { getEchartsFontSize } from '@/utils/tools'

export default {
  name: 'Home',
  components: {
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
  },
  created () {
    getEchartsFontSize()
  }
}
</script>
