import { chartTableOrderOptionsMapping, storageKey } from '@/utils/constants'
import { getWidthByLanguage } from '@/utils/tools'
export default {
  props: {
    tableData: {
      type: Array
    },
    customTableTitle: {
      type: Array
    },
    height: {
      type: String,
      default: '100%'
    },
    api: {
      type: String
    },
    tableId: {
      type: String
    }
  },
  computed: {
    customTableTitles () {
      if (this.customTableTitle) {
        this.getTableWidth(this.customTableTitle)
      }

      return this.customTableTitle.filter(item => item.show)
    }
  },
  watch: {
    customTableTitle (n) {
      if (n) {
        setTimeout(() => {
          this.$refs.dataTable.doLayout()
        }, 200)
      }
    }
  },
  data () {
    return {
      operationWidth: '165', // 操作列宽
      show: true
    }
  },
  methods: {
    getTableWidth (list) {
      if (list && list.length > 0) {
        const language = localStorage.getItem(storageKey.language)
        // 文字所占宽度，一个英文字母占7px，中文16px
        let num = getWidthByLanguage(language) || 7
        if (language !== 'cn') {
          num = num + 1 // 最后一位加空格
        }

        list.forEach((item, index) => {
          if (item.label) {
            let tempLength = 0

            if (item.label.indexOf(' ') > -1) {
              let tempArr = []
              tempArr = item.label.split(' ')
              tempLength = Math.max(...tempArr.map(el => el.length))
            } else {
              tempLength = item.label.length
            }

            // 宽度 = 最小不可拆分单词文字宽度 + 22的padding边距
            const newWidth = (num * tempLength) + 22

            // 为了避免没有minWidth这种情况
            if (!item.minWidth) {
              item.minWidth = newWidth
            } else if (item.minWidth < newWidth) {
              item.minWidth = newWidth
            }

            // 排序最后一位一般是'操作'，或者是较长的字符，故不让其换行，宽度直接为字符宽度
            if (index === list.length - 1) {
              item.minWidth = (num * item.label.length) + 22
              item.width = (num * item.label.length) + 22
            }

            // 有排序的，额外添加24px的排序图标宽度
            if (item.sortable) {
              item.minWidth = item.minWidth + 30
              item.width = item.width + 30
            }
          }
        })
      }
    },
    tableOperation ([command, row]) {
      switch (command) {
        default:
          this.$emit(command, row)
          break
      }
    },
    selectionChange (objs) {
      this.$emit('selectionChange', objs)
    },
    dragend () {
      this.$nextTick(() => {
        this.$refs.dataTable.doLayout()
      })
    },
    tableDataSort (item) {
      const orderBy = (item.order === 'descending' ? '-' : '') + (item.prop ? (chartTableOrderOptionsMapping[item.prop] || item.prop) : '')
      this.$emit('orderBy', orderBy)
    }
  }
}
