import { hasButton } from '@/permission'
import { dateFormatByAppearance } from '@/utils/date-util'
import { commonErrorTip } from '@/utils/constants'
export default {
  data () {
    return {
      dayJs: window.$dayJs,
      blockOperation: {
        save: false,
        import: false,
        duplicate: false,
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
      debounceFunc: null,
      // 是否正在单元测试
      isUnitTesting: false
    }
  },
  methods: {
    hasButton (code) {
      return hasButton(this.$store.getters.buttonList, code)
    },
    errorMsgHandler (axiosError) {
      if (axiosError.response) {
        if (axiosError.response.data) {
          return axiosError.response.data.message || commonErrorTip
        }
      } else if (axiosError.message) {
        return axiosError.message
      }
      return commonErrorTip
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
