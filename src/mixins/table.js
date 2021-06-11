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
  data () {
    return {
      operationWidth: '165' // 操作列宽
    }
  },
  methods: {
    tableOperation ([command, row, param]) {
      switch (command) {
        case 'recordTab': {
          this.$emit('showBottomBox', 'recordTab', row)
          break
        }
        case 'endpointQuery': {
          this.$emit('showBottomBox', 'endpointQuery', row)
          break
        }
        case 'fastSilence': {
          this.$emit('addSilence', row, param)
          break
        }
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
      let orderBy = ''
      if (item.order === 'ascending') {
        orderBy = item.prop
      }
      if (item.order === 'descending') {
        orderBy = '-' + item.prop
      }
      this.$emit('orderBy', orderBy)
    }
  }
}
