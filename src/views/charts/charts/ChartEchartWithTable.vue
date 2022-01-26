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
import * as echarts from 'echarts'
import PieTable from '@/components/charts/PieTable'
import {
  pieWithTable
} from '@/views/charts/charts/options/pie'
import { getUnitType } from '@/utils/unit-convert'
import { replaceUrlPlaceholder } from '@/utils/tools'
import { get } from '@/utils/http'

export default {
  name: 'ChartEchartWithTable',
  data () {
    return {
      myChart: null,
      chartOption: null,
      pieTableData: [],
      selectPieChartName: '',
      allSelectPieChartName: []
    }
  },
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object,
    queryParams: Object,
    orderPieTable: Object
  },
  components: {
    PieTable
  },
  mounted () {
  },
  methods: {
    handleQueryParams(queryParams) {
      return this.timeFilter = {
        startTime:Number(queryParams.startTime)*1000,
        endTime:Number(queryParams.endTime)*1000
      }
    },
    initEchartsWithTable (id) {
      const chartParams = this.chartInfo.params
      const dom = document.getElementById(id)
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = this.$_.cloneDeep(pieWithTable)

      chartParams.valueColumn = this.orderPieTable
      const unitType = getUnitType(chartParams.valueColumn)
      const tableQueryParams = this.$_.cloneDeep(this.queryParams)
      tableQueryParams[chartParams.nameColumn] = [] // 处理两个图表不一样的地方)

      const allZero = this.timeLineIsAllZero(this.chartData)
      if (allZero) {
        this.chartOption.yAxis = {
          ...this.chartOption.yAxis,
          min: 0,
          max: 5,
          interval: 1
        }
      }

      const data = this.chartData.map(d => {
        if (d[chartParams.nameColumn]) {
          this.allSelectPieChartName.push(d[chartParams.nameColumn])
        }
        return {
          data: d,
          name: d[chartParams.nameColumn],
          value: parseInt(d[chartParams.valueColumn]),
          unitType: unitType
        }
      })

      this.allSelectPieChartName = tableQueryParams[chartParams.nameColumn]
      this.chartOption.series[0].data = data
      if (this.chartOption.series[0].data && this.chartOption.series[0].data.length > 10) { // pieWithTable 图例超过10个改为滚动显示
        this.chartOption.legend.type = 'scroll'
      }
      this.loadEchartWithTable()

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
          self.loadPieTableData(params.name)
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
        console.log(echartParams)
        console.log(self.selectPieChartName)
        // 若是已选，则点击后取消选择，并查询全部数据
        if (echartParams.name === self.selectPieChartName) {
          console.log(1)
          self.selectPieChartName = ''
          self.loadPieTableData(this.allSelectPieChartName)
        } else { // 否则查询当前name数据
          self.selectPieChartName = echartParams.name
          self.loadPieTableData(echartParams.name)
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
    },

    loadEchartWithTable () {
      this.$emit('showLoading', true)
      try {
        this.myChart.setOption(this.chartOption)
      } finally {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 200)
      }
    },
    timeLineIsAllZero (data) {
      if (this.resultType === 'matrix') {
        let allZero = true
        try {
          data.forEach(d => {
            d.values.forEach(r => {
              if (r[1] && r[1] !== '0') {
                allZero = false
                throw new Error('break')
              }
            })
          })
        } catch (e) {}
        return allZero
      }
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.initEchartsWithTable(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>
