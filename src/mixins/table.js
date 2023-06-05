import { chartTableOrderOptionsMapping, storageKey } from '@/utils/constants'
import { getWidthByLanguage } from '@/utils/tools'
import { put, patch } from '@/utils/http'
import { api } from '@/utils/api'
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
        // 设置列宽，避免分辨率过小时，文本显示省略号
        this.getTableWidth(this.customTableTitle)
      }

      return this.customTableTitle.filter(item => item.show)
    }
  },
  watch: {
    customTableTitle (n) {
      if (n) {
        setTimeout(() => {
          if (this.$refs.dataTable) {
            this.$refs.dataTable.doLayout()
          }
        }, 200)
      }
    },
    tableData: {
      handler (n) {
        if (this.tableData && this.tableData.length > 0) {
          this.isInit = false
        }
      }
    }
  },
  data () {
    return {
      operationWidth: '165', // 操作列宽
      show: true,
      isInit: true
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
          if (item.label && item.label !== 'IP') {
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
            }

            // 排序最后一位一般是'操作'，或者是较长的字符，故不让其换行，宽度直接为字符宽度
            if (index === list.length - 1) {
              item.minWidth = (num * item.label.length) + 22
            }

            // 有排序的，额外添加24px的排序图标宽度
            if (item.sortable) {
              if (!item.initFlag) {
                item.minWidth = item.minWidth + 32
              }
              // 避免customize多次点击save生成表格，导致width越来越大，保证初始化一次就确定宽度
              item.initFlag = true
            }

            if (item.minWidth < newWidth) {
              item.minWidth = newWidth
            } else if (item.width < item.minWidth) {
              item.width = item.minWidth
            }
          }
        })
      }
    },
    changeStatus (status, id) {
      if (!this.isInit) {
        patch(api.knowledgeBaseEnable, { list: [{ knowledgeId: id, status: status }] }).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
          } else {
            console.error(response)
            if (response.message) {
              this.$message.error(response.message)
            } else {
              this.$message.error('Something went wrong...')
            }
          }
          this.$emit('reload')
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
    checkboxStatusChange (isCheck, data) {
      this.$emit('checkboxStatusChange', isCheck, data)
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
