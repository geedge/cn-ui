import theme from '@/assets/css/theme.scss'
import { hasButton } from '@/permission'
import { nextTick } from 'vue'
export default {
  data () {
    return {
      blockOperation: {
        save: false,
        import: false,
        delete: false,
        refresh: false,
        query: false
      },
      theme: theme // scss主题变量
    }
  },
  methods: {
    $nextTick: nextTick,
    hasButton (code) {
      return hasButton(this.$store.getters.buttonList, code)
    },
    isBuiltIn (row) {
      return (row.buildIn && row.buildIn === 1) || (row.builtIn && row.builtIn === 1)
    },
    unblockOperation () {
      this.blockOperation = {
        save: false,
        import: false,
        delete: false,
        refresh: false,
        query: false
      }
    }
  }
}
