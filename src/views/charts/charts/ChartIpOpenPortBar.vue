<template>
    <div class="chart-ip-open-port-bar">
        <el-table
                ref="table"
                class="pie-table"
                :data="tableData"
                style="width: 70%;"
                tooltip-effect="light"
                empty-text=""
                border="none"
                :size="'mini'"
                :height="'100%'">
            <el-table-column
                    v-for="item in tableKey"
                    :key="item.prop"
                    :label="item.label"
                    :prop="item.prop"
                    :min-width="item.width"
            >
                <template v-slot="scope" :column="item">
                  <span v-if="item.prop === 'utime'">
                    {{ dateFormatByAppearance(scope.row[item.prop]) }}
                  </span>
                  <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
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
import { ipOpenPortBar } from '@/views/charts/charts/options/bar'
import { getChartColor } from '@/views/charts/charts/tools'
import * as echarts from 'echarts'
import chartEchartMixin from './chart-echart-mixin'
export default {
  name: 'ChartIpOpenPortBar',
  mixins: [chartEchartMixin],
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object,
    queryParams: Object
  },
  data () {
    return {
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
    initEcharts (id) {
      const dom = document.getElementById(id)
      !this.myChart && (this.myChart = echarts.init(dom))
      this.tableData = lodash.cloneDeep(this.chartData)
      this.chartOption = this.$_.cloneDeep(ipOpenPortBar)
      const protocols = []
      this.tableData.forEach((d, i) => {
        const index = protocols.findIndex(p => p.name === d.protocol.toUpperCase())
        if (index === -1) {
          protocols.push({ name: d.protocol.toUpperCase(), value: 1, itemStyle: { color: getChartColor(i) } })
        } else {
          protocols[index].value++
        }
      })
      this.chartOption.series[0].data = protocols
      this.chartOption.xAxis.data = protocols.map(p => p.name)
      this.myChart.setOption(this.chartOption)
    }
  }
}
</script>
