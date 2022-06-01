<template>
  <div style="overflow-y: auto; height: 100%; color: #555; white-space: pre;">
    <el-table :data="linuxLineSymbolConvert"
              :show-header="false"
              style="width: 100%"
              tooltip-effect="light"
              :cell-style="setCellStyle">
      <el-table-column prop="c1" show-overflow-tooltip/>
      <el-table-column prop="c2" show-overflow-tooltip width="80"/>
      <el-table-column prop="c3" show-overflow-tooltip width="70"/>
      <el-table-column prop="c4" show-overflow-tooltip width="80" />
      <el-table-column prop="c5" show-overflow-tooltip/>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ChartDomainRecursiveResolve',
  props: {
    chartInfo: Object,
    chartData: String,
    resultType: Object,
    queryParams: Object
  },
  methods: {
    setCellStyle ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 3) {
        return {
          color: '#598bd1'
        }
      }
      if (columnIndex === 4) {
        return {
          'font-weight': 'bold'
        }
      }
    }
  },
  mounted () {
  },
  computed: {
    linuxLineSymbolConvert () {
      const dataArray = this.chartData ? this.chartData.split('\n') : []
      const linuxArray = []
      dataArray.forEach(item => {
        const content = item.replace(/[\r\n]/g, '')
        if (!(content.length === 0 || _.startsWith(content, ';'))) { // 忽略空白行,   忽略以;开头的行
          let rowArray = item.split('\t')
          _.remove(rowArray, function (n) {
            return _.isEmpty(n)
          })
          if (rowArray.length < 5) {
            const allElementArray = _.split(rowArray, ' ')
            const specialArray = _.split(rowArray, ' ', 5)

            allElementArray.forEach((item, index) => {
              if (index >= 5) {
                specialArray[4] = specialArray[4] + ' ' + item
              }
            })
            rowArray = specialArray
          }
          const obj = {
            c1: rowArray[0] ? rowArray[0] : '',
            c2: rowArray[1] ? rowArray[1] : '',
            c3: rowArray[2] ? rowArray[2] : '',
            c4: rowArray[3] ? rowArray[3] : '',
            c5: rowArray[4] ? rowArray[4] : ''
          }
          linuxArray.push(obj)
        }
      })
      return linuxArray
    }
  }
}
</script>
