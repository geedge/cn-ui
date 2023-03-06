import { chartTableOrderOptionsMapping } from '@/utils/constants'
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
      /*let orderBy = ''
      if (item.order === 'ascending') {
        if (item.prop === 'lastTime') {
          orderBy = chartTableOrderOptionsMapping[item.prop]
        } else {
          orderBy = item.prop
        }
        orderBy = chartTableOrderOptionsMapping[item.prop] || item.prop
      }
      if (item.order === 'descending') {
        if (item.prop === 'lastTime') {
          orderBy = '-' + chartTableOrderOptionsMapping[item.prop]
        } else {
          orderBy = '-' + item.prop
        }
      }*/
      const orderBy = (item.order === 'descending' ? '-' : '') + (chartTableOrderOptionsMapping[item.prop] || item.prop)
      this.$emit('orderBy', orderBy)
    }
  }
}
