<script>
export default {
  name: 'Renderer',
  // abstract: true,
  props: {
    renderFun: {
      type: Function,
      require: true
    },
    renderProps: {}
  },
  render (h) {
    return this.renderFun(h, this.renderProps)
  }
}
</script>
