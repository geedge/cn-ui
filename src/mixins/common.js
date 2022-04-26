import { hasButton } from '@/permission'
import { dateFormatByAppearance } from '@/utils/date-util'
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
      prevent_opt: {
        save: false,
        import: false,
        duplicate: false,
        delete: false,
        refresh: false,
        query: false
      },
      timeout: null,
      debounceFunc: null
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
    dateFormatByAppearance (date) {
      return dateFormatByAppearance(date)
    }
  }
}
