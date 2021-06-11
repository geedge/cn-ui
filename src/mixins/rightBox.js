export default {
  props: {
    object: {
      type: Object
    }
  },
  data () {
    return {
      editObject: {}
    }
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.unblockOperation()
      this.$emit('close', refresh)
    }
  },
  watch: {
    object: {
      deep: true,
      immediate: true,
      handler (n) {
        this.editObject = JSON.parse(JSON.stringify(n))
      }
    }
  }
}
