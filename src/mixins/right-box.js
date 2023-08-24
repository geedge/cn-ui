import axios from 'axios'

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
    },
    save () {
      if (this.blockOperation.save) { return }
      this.blockOperation.save = true

      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.editObject.id) {
            axios.put(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.status === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.data.msg || res.data.message)
              }
            })
          } else {
            axios.post(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.status === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.data.msg || res.data.message)
              }
            })
          }
        } else {
          this.blockOperation.save = false
          return false
        }
      })
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
