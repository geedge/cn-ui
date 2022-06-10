<template>
  <div style="overflow-y: auto; height: 100%; color: #555; white-space: pre;padding: 6px 0px 6px 6px;">
    <el-table :data="linuxLineSymbolConvert"
              :show-header="false"
              :span-method="arraySpanMethod"
              style="width: 100%;"
              tooltip-effect="light"
              :cell-style="setCellStyle">
      <el-table-column prop="c1" class-name="domain-tooltip">
        <template v-slot="scope" >
          <el-tooltip ref='tooltip_c1'
                      popper-class="domain-recursive-resolve-popper"
                      effect="light"
                      placement="top"
                      hide-after="0"
                      show-after="50"
          >
            <template #content>{{scope.row['c1']}}</template>
            <div class="short-content">{{scope.row['c1']}}</div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="c2" show-overflow-tooltip width="80"/>
      <el-table-column prop="c3" show-overflow-tooltip width="70"/>
      <el-table-column prop="c4" show-overflow-tooltip width="80" />
      <el-table-column prop="c5" class-name="domain-tooltip">
        <template v-slot="scope" >
          <el-tooltip ref='tooltip_c5'
                  popper-class="domain-recursive-resolve-popper"
                  effect="light"
                  placement="top"
                  hide-after="0"
                  show-after="50"
          >
            <template #content>{{scope.row['c5']}}</template>
            <div class="short-content">{{scope.row['c5']}}</div>
          </el-tooltip>
        </template>
      </el-table-column>
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
  data () {
    return {
      dnsRecordType: [
        'A',
        'AAAA',
        'AFSDB',
        'ALIAS',
        'CAA',
        'CERT',
        'CNAME',
        'DHCID',
        'DNAME',
        'DNSKEY',
        'DS',
        'HINFO',
        'HTTPS',
        'LOC',
        'MX',
        'NAPTR',
        'NS',
        'NSEC',
        'NSEC3',
        'NSEC3PARAM',
        'PTR',
        'RP',
        'RRSIG',
        'SOA',
        'SRV',
        'TLSA',
        'TXT'
      ]
    }
  },
  methods: {
    setCellStyle ({ row, column, rowIndex, columnIndex }) {
      const padding = '2px'
      const border = '0px'
      const background = '#F5F7FA'
      if (columnIndex === 3) {
        return {
          color: '#598bd1',
          background: background,
          border: border,
          padding: padding
        }
      } else if (columnIndex === 4) {
        return {
          'font-weight': 'bold',
          background: background,
          border: border,
          padding: padding
        }
      } else {
        return {
          background: background,
          border: border,
          padding: padding
        }
      }
    },
    arraySpanMethod  ({ row, column, rowIndex, columnIndex }) {
      if (_.isEmpty(row.c2) && _.isEmpty(row.c3) &&
          _.isEmpty(row.c4) && _.isEmpty(row.c5)) {
        // [1,5]表示合并1行5列，[0,0]表示改行不显示
        if (columnIndex === 0) {
          // 定位到6行0列的ID，告诉该单元格合并1行2列
          return [1, 5]
        } else if (columnIndex > 0) {
          // 定位到6行1列的姓名，告诉该单元格不显示
          return [0, 0]
        }
      }
    }
    /* isDnsRecordTypes(type){
      if(_.indexOf(this.dnsRecordType, type)===-1){
        return false
      }else {
        return true
      }
    } */
  },
  mounted () {
  },
  computed: {
    linuxLineSymbolConvert () {
      const dataArray = this.chartData ? this.chartData.split('\n') : []
      const linuxArray = []
      dataArray.forEach(item => {
        const content = item.replace(/[\r\n]/g, '')
        if (_.startsWith(content, ';')) {
          const obj = {
            c1: content,
            c2: '',
            c3: '',
            c4: '',
            c5: ''
          }
          linuxArray.push(obj)
        } else if (content.length > 0) { // 忽略空白行
          const separator = /\t+|\s+/
          let rowArray = item.split(separator)
          _.remove(rowArray, function (n) {
            return _.isEmpty(n)
          })
          if (rowArray.length > 5) {
            const specialArray = item.split(separator)
            rowArray.forEach((i, index) => {
              if (index >= 5) {
                specialArray[4] = specialArray[4] + ' ' + i
              }
            })
            const dnsTypes = specialArray[4].split(separator)
            let isDnsTypeFinish = false
            dnsTypes.forEach(item => {
              if (!isDnsTypeFinish && this.dnsRecordType.indexOf(item) > -1) {
                specialArray[3] = specialArray[3] + ' ' + item
                specialArray[4] = specialArray[4].substring(specialArray[4].indexOf(item) + item.length)
              } else {
                isDnsTypeFinish = true
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
<style lang="scss">
   .domain-recursive-resolve-popper{
     max-width:550px;
   }
  .domain-tooltip {
    .short-content{
      cursor:default;
      overflow:hidden;
      white-space:nowrap;
      -ms-text-overflow: ellipsis;
      text-overflow: ellipsis;
    }
  }
</style>
