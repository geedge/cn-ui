import theme from '@/assets/css/theme.scss'
import { hasButton } from '@/permission'
export default {
  data () {
    return {
      dayJs: window.$dayJs,
      blockOperation: {
        save: false,
        import: false,
        delete: false,
        refresh: false,
        query: false
      },
      theme: theme, // scss主题变量
      prevent_opt: {
        save: false,
        import: false,
        duplicate: false,
        delete: false,
        refresh: false,
        query: false
      }
    }
  },
  methods: {
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
    },
    // 时间相关
    utcTimeToSysTime (str) { // utc 0 到系统设置的时区
      let date = ''
      if (isNaN(str)) {
        date = window.$dayJs(str).valueOf() + localStorage.getItem('timezone-local-offset') * 60 * 60 * 1000
      } else {
        date = str
      }
      date = window.$dayJs.tz(date).format('YYYY-MM-DD HH:mm:ss')
      return date
    },
    utcTimeToLocalhost (str) { // 系统设置的时区 到 utc 0
      return str
    }
  }
}
