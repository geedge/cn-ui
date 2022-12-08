<template>
  <div class="cn-chart__echarts" >
    <div class="cn-chart__body pie-with-table" >
      <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </div>
    <div class="cn-chart__footer pie-with-table" >
      <pie-table :tableData="pieTableData" ref="pieTable" :chartInfo="chartInfo" :time-filter="handleQueryParams(queryParams)" :order="orderPieTable"/>
    </div>
  </div>
</template>

<script>
import PieTable from '@/views/charts/charts/PieTable'
import { getUnitType } from '@/utils/unit-convert'
import { replaceUrlPlaceholder } from '@/utils/tools'
import { get } from '@/utils/http'
import chartEchartMixin from './chart-echart-mixin'
import { riskLevelMapping } from '@/utils/constants'

export default {
  name: 'ChartEchartWithTable',
  mixins: [chartEchartMixin],
  data () {
    return {
      pieTableData: [],
      selectPieChartName: '',
      allSelectPieChartName: []
    }
  },
  props: {
    resultType: Object,
    queryParams: Object,
    orderPieTable: String
  },
  components: {
    PieTable
  },
  computed: {
    appRisk () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value == level
        })
        return (m && m.name) || level
      }
    }
  },
  methods: {
    handleQueryParams (queryParams) {
      this.timeFilter = {
        startTime: Number(queryParams.startTime) * 1000,
        endTime: Number(queryParams.endTime) * 1000
      }
    },
    initEcharts (id) {
      this.initDom(id)
      const chartParams = this.chartInfo.params
      chartParams.valueColumn = this.orderPieTable
      const unitType = getUnitType(chartParams.valueColumn)
      const tableQueryParams = this.$_.cloneDeep(this.queryParams)
      tableQueryParams[chartParams.nameColumn] = [] // 处理两个图表不一样的地方)
      this.handleYaxis()
      const data = this.chartData.map(d => {
        if (d[chartParams.nameColumn]) {
          this.allSelectPieChartName.push(d[chartParams.nameColumn])
        }
        return {
          data: d,
          name: this.appRisk(d[chartParams.nameColumn]),
          value: parseInt(d[chartParams.valueColumn]),
          unitType: unitType
        }
      })

      this.allSelectPieChartName = tableQueryParams[chartParams.nameColumn]
      this.chartOption.series[0].data = data
      if (this.chartOption.series[0].data && this.chartOption.series[0].data.length > 10) { // pieWithTable 图例超过10个改为滚动显示
        this.chartOption.legend.type = 'scroll'
      }
      this.loadEchart()

      if (!this.$_.isEmpty(data)) {
        get(replaceUrlPlaceholder(chartParams.urlTable, tableQueryParams)).then(response => {
          if (response.code === 200) {
            this.pieTableData = response.data.result
          } else {
            // this.isError = true
            this.noData = true
            // this.errorInfo = response.msg || response.message || 'Unknown'
          }
        })
      }

      const self = this
      // legend点击事件
      this.myChart.off('legendselectchanged')
      this.myChart.on('legendselectchanged', function (params) {
        self.myChart.setOption({
          legend: { selected: { [params.name]: true } }
        })
        const index = self.chartOption.series[0].data.findIndex(d => d.name === params.name)
        if (self.selectPieChartName !== params.name) {
          self.myChart.dispatchAction({
            type: 'select',
            seriesIndex: 0,
            dataIndex: index
          })
          self.selectPieChartName = params.name
          if (self.chartInfo.params.riskMapping) {
            self.loadPieTableData(riskLevelMapping.find(m => params.name === m.name).value)
          } else {
            self.loadPieTableData(params.name)
          }
        } else {
          self.myChart.dispatchAction({
            type: 'unselect',
            seriesIndex: 0,
            dataIndex: index
          })
          self.selectPieChartName = ''
          self.loadPieTableData(this.allSelectPieChartName)
        }
      })
      // 饼图色块点击事件
      this.myChart.off('click')
      this.myChart.on('click', function (echartParams) {
        // 若是已选，则点击后取消选择，并查询全部数据
        if (echartParams.name === self.selectPieChartName) {
          self.selectPieChartName = ''
          self.loadPieTableData(this.allSelectPieChartName)
        } else { // 否则查询当前name数据
          self.selectPieChartName = echartParams.name
          self.loadPieTableData(echartParams.data.data.appRisk || echartParams.name)
        }
      })
    },

    loadPieTableData (name = '') {
      const childrenParams = this.$_.cloneDeep(this.queryParams)
      childrenParams[this.chartInfo.params.nameColumn] = name
      get(replaceUrlPlaceholder(this.chartInfo.params.urlTable, childrenParams)).then(response => {
        if (response.code === 200) {
          this.pieTableData = response.data.result
        }
      })
    }
  }
}
</script>
