<template>
    <div class="chart-ip-open-port-bar">
        <el-table
                ref="table"
                class="pie-table"
                :data="tableData"
                style="width: 70%;border-left: none;"
                tooltip-effect="light"
                border="none"
                :size="'mini'"
                :height="'100%'">
            <el-table-column
                    v-for="(item,index) in tableKey"
                    :key="index"
                    :label="item.label"
                    :prop="item.prop"
                    :min-width="item.width"
            >
                <template v-slot="scope" :column="item">
                    <span v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
                    <template v-else>-</template>
                </template>
            </el-table-column>
        </el-table>
        <div class="chart-box">
            <div class="title">
                Protocols statistics
            </div>
            <div class="chart-drawing" :id="`chart${chartInfo.id}`">

            </div>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
export default {
  name: 'ChartIpOpenPortBar',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object,
    queryParams: Object
  },
  data () {
    return {
      myChart: null,
      chartOption: null,
      tableData: [],
      tableKey: [
        {
          label: 'Port',
          prop: 'port',
          width: '15%'
        }, {
          label: 'Protocol',
          prop: 'protocol',
          width: '20%'
        }, {
          label: 'Banner',
          prop: 'banner',
          width: '40%'
        }, {
          label: 'Updated at',
          prop: 'utime',
          width: '25%'
        }
      ]
    }
  },
  methods: {
    init (id) {
      this.tableData = lodash.cloneDeep(this.chartData)
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        console.log(n)
        this.init(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>

<style scoped>

</style>
