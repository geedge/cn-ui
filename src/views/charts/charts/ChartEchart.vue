<template>
  <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import * as echarts from 'echarts'
import { lineToSpace, reverseSortBy, humpToSpace } from '@/utils/tools'
import { unitTypes } from '@/utils/constants'
import chartEchartMixin from './chart-echart-mixin'
import { isEchartsLine, isEchartsPie } from './tools'
import { legendMapping } from '@/views/charts/charts/chart-table-title'

export default {
  name: 'ChartEchart',
  mixins: [chartEchartMixin],
  data() {
    return {}
  },
  props: {
    resultType: Object,
    chartInfo: Object,
  },
  setup(props) {
    return {
      isEchartsPie: isEchartsPie(props.chartInfo.type),
      isEchartsLine: isEchartsLine(props.chartInfo.type),
    }
  },
  methods: {
    initEcharts(id) {
      this.initDom(id)
      const chartParams = this.chartInfo.params
      if (chartParams.showLegend === false) {
        this.chartOption.legend.show = false
      }
      this.handleYaxis()

      if (this.isEchartsPie) {
        if (chartParams.size && chartParams.size === 'small') {
          this.chartOption.series[0] = {
            ...this.chartOption.series[0],
            radius: ['30%', '45%'],
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
          }
          this.chartOption.legend = {
            ...this.chartOption.legend,
            left: '60%',
            itemGap: 5,
            itemWidth: 8,
            itemHeight: 8,
            formatter: function (name) {
              return name.length > 9 ? name.substr(0, 9) + '...' : name
              // return echarts.format.truncateText(name, 6, '…');
            },
            tooltip: {
              show: true,
            },
            textStyle: {
              // 图例文字的样式
              color: '#666666',
              fontSize: 12,
              fontWeight: 400,
            },
          }
          let chartDataTmp = []
          let otherData = []
          this.chartData.sort(reverseSortBy('num'))

          if (this.chartData.length > 5) {
            chartDataTmp = this.chartData.slice(0, 5)
            chartDataTmp.forEach((data) => {
              if (data.name === '') {
                data.name = ' '
              }
            })
            let otherSum = 0
            otherData = this.chartData.slice(5)
            otherData.forEach((data) => {
              otherSum = otherSum + data.num
            })
            chartDataTmp.push({ num: otherSum, name: 'other' })
          } else if (this.chartData.length <= 5) {
            chartDataTmp = this.chartData.slice(0, this.chartData.length)
            chartDataTmp.forEach((data) => {
              if (data.name === '') {
                data.name = ' '
              }
            })
          }

          this.chartOption.series[0].data = chartDataTmp.map((d) => {
            return {
              name: lineToSpace(d.name),
              data: d,
              value: parseInt(d.num),
              unitType: chartParams.unitType ? chartParams.unitType : 'number',
            }
          })
        } else {
          this.chartOption.series[0].data = this.chartData.map((d) => {
            return {
              name: lineToSpace(d.name),
              data: d,
              value: parseInt(d.num),
              unitType: chartParams.unitType ? chartParams.unitType : 'number',
            }
          })
        }
      } else {
        const seriesTemplate = this.chartOption.series[0]
        this.chartOption.series = this.chartData.map((r) => {
          const serie = {
            ...seriesTemplate,
            name: legendMapping[
              `${this.entity && this.entity.ip ? 'ip_' : ''}${r.legend}`
            ]
              ? legendMapping[
                  `${this.entity && this.entity.ip ? 'ip_' : ''}${r.legend}`
                ]
              : humpToSpace(r.legend),
            data: r.values.map((v) => [
              Number(v[0]) * 1000,
              Number(v[1]),
              chartParams.unitType,
            ]),
          }
          if (this.isEchartsLine) {
            serie.data = serie.data.slice(1, serie.data.length - 2)
            if (this.chartData.length === 1) {//只有一条曲线
              serie.markLine = {
                silent: true,
                symbol: 'none',
                label: {
                  distance: [-50, 0],
                  formatter(params) {
                    const arr = unitConvert(
                      params.value,
                      chartParams.unitType,
                    ).join(' ')
                    let desc = ''
                    switch (params.dataIndex) {
                      case 0: {
                        desc = 'P50'
                        break
                      }
                      case 1: {
                        desc = 'P90'
                        break
                      }
                      default:
                        break
                    }
                    return `${arr} (${desc})`
                  },
                },
                data: [
                  {
                    name: 'P50',
                    yAxis: this.chartData[0].aggregation.p50
                      ? this.chartData[0].aggregation.p50
                      : 50,
                  },
                  {
                    name: 'P90',
                    yAxis: this.chartData[0].aggregation.p90
                      ? this.chartData[0].aggregation.p90
                      : 90,
                  },
                ],
              }
            } else if(this.chartData.length > 1){//有多条曲线
              this.handleLegendClick()//自定义legend的点击事件
            }
          }
          return serie
        })
      }

      const rows = (this.chartData.length - 1) / 4 + 1 // 根据legend个数动态预留legend空间
      const gridTop = 10 + 27 * rows

      const gridTemplate = this.chartOption.grid
      if (chartParams.unitType === unitTypes.byte) {
        this.chartOption.yAxis.axisLabel.formatter = function (
          value,
          index,
          a,
          b,
        ) {
          return unitConvert(value, unitTypes.byte).join(' ')
        }
        this.chartOption.grid = {
          ...gridTemplate,
          top: gridTop,
          left: 75,
        }
      } else {
        this.chartOption.grid = {
          ...gridTemplate,
          top: gridTop,
        }
      }

      this.loadEchart()
    },

    //点击前，高亮legend个数
    getSelectedNum(params){
      let selectedNum = 0
      let legendItem = params.selected
      for(let name in legendItem){
        if(name === params.name){
          if(!legendItem[name]){
            selectedNum = selectedNum + 1
          }
        }else {
          if(legendItem[name]){
            selectedNum = selectedNum + 1
          }
        }
      }
      return selectedNum
    },
    //点击后：高亮legend个数
    getAfterSelectedNum(params){
      let selectedNum = 0
      let legendItem = params.selected
      for(let name in legendItem){
          if(legendItem[name]){
            selectedNum = selectedNum + 1
          }
      }
      return selectedNum
    },

    //自定义legend的点击事件:此方法只处理多条曲线的情况（单条曲线正常切换legend和曲线）
    handleLegendClick(){
      const self = this
      // legend点击事件
      this.myChart.off('legendselectchanged')
      this.myChart.on('legendselectchanged', function (params) {
        let legendNum = Object.keys(params.selected).length
        let selectedNum = self.getSelectedNum(params)

        let legendItem = params.selected
        if(selectedNum === legendNum){//点击前：全部曲线高亮
          for(let name in legendItem){
            if (name === params.name) {
              legendItem[name] = true
            }else {
              legendItem[name] = false
            }
          }
        }else if(selectedNum === 1 && !params.selected[params.name]){//点击前：多条曲线，且只有一条曲线高亮时
          for(let name in legendItem){
            legendItem[name] = true
          }
        }
        self.myChart.setOption({
          legend: {
            selected: legendItem
          }
        })

        if(self.getAfterSelectedNum(params) === 1){//点击后只有一条曲线高亮
          const chartParams = self.chartInfo.params
          //多条曲线，且只有一条曲线高亮时，显示P50 P90 分位值，不止一个时隐藏标线
          let selectedName = ''
          for(let name in legendItem){
            if(legendItem[name]){
              selectedName = name
            }
          }
          let markLine = {
            silent: true,
            symbol: 'none',
            label: {
              distance: [-50, 0],
              formatter(params) {
                const arr = unitConvert(
                    params.value,
                    chartParams.unitType,
                ).join(' ')
                let desc = ''
                switch (params.dataIndex) {
                  case 0: {
                    desc = 'P50'
                    break
                  }
                  case 1: {
                    desc = 'P90'
                    break
                  }
                  default:
                    break
                }
                return `${arr} (${desc})`
              },
            },
            data: [
              {
                name: 'P50',
                yAxis: self.chartData[0].aggregation.p50
                    ? self.chartData[0].aggregation.p50
                    : 50,
              },
              {
                name: 'P90',
                yAxis: self.chartData[0].aggregation.p90
                    ? self.chartData[0].aggregation.p90
                    : 90,
              },
            ],
          }
          let serieArray = []
          self.chartOption.series.forEach((item,i) =>{
            if(item.name === selectedName){
              item.markLine = markLine
            }
            serieArray.push(item)
          })
          self.myChart.setOption({
            series:serieArray
          })
        } else {//不止一条线高亮时隐藏标线
          let serieArray = []
          self.chartOption.series.forEach((item,i) =>{
            item.markLine = []
            serieArray.push(item)
          })
          self.myChart.setOption({
            series:serieArray
          })
        }
      })
    }

  },
}
</script>
