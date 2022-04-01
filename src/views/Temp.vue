<template>
  <div style="overflow: auto;height: 100%;">
    <div style="height: 8000px; overflow: auto; width: 100%; display: flex; flex-direction: column; align-content: center; background-color: white;">
<!--      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">session/s</div>
      <div id="lineCanvas1" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">bytes</div>
      <div id="lineCanvas2" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">rate</div>
      <div id="lineCanvas3" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">行程卡流量数据 rate</div>
      <div id="lineCanvas6" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>-->
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">流量变化曲线</div>
      <div id="lineCanvas" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <!--  <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">协议占比</div>
      <div id="pieCanvas0" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">APP占比</div>
      <div id="pieCanvas1" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">域名占比</div>
      <div id="pieCanvas2" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">IP占比</div>
      <div id="pieCanvas3" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">出占比</div>
      <div id="pieCanvas4" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">入占比</div>
      <div id="pieCanvas5" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>-->
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">入</div>
      <div id="sunCanvas1" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
      <div style="padding-left: 30px; font-size: 18px; font-weight: bold; color: #666;">出</div>
      <div id="sunCanvas2" style="margin-bottom: 100px; height: 500px; width: 100%;"></div>
    </div>
  </div>
</template>

<script>
import { lineData, lineOption, sunData1, sunData2, sunOption } from './testData'
import * as echarts from 'echarts'
import { getMillisecond } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
export default {
  name: 'Temp',
  methods: {
    /* initLine (lineData, index) {
      const data = lineData.map(d => {
        return [getMillisecond(new Date(d[0]).getTime()), d[index]]
      })
      const option = this.$_.cloneDeep(lineOption2)
      option.series.data = data
      if (index === 1) {
        option.yAxis.axisLabel.formatter = function (params) {
          return unitConvert(params, unitTypes.number).join(' ')
        }
      } else if (index === 2) {
        option.yAxis.axisLabel.formatter = function (params) {
          return unitConvert(params, unitTypes.byte).join(' ')
        }
      } else if (index === 3) {
        option.yAxis.axisLabel.formatter = function (params) {
          const arr = unitConvert(params, unitTypes.byte).join(' ')
          return arr.replace(/B/g, 'bps')
        }
      } else if (index === 6) {
        option.yAxis.axisLabel.formatter = function (params) {
          const arr = unitConvert(params, unitTypes.byte).join(' ')
          return arr.replace(/B/g, 'Mbps')
        }
      }
      const dom = document.getElementById(`lineCanvas${index}`)
      const lineChart = echarts.init(dom)
      this.$nextTick(() => {
        lineChart.setOption(option)
      })
    }, */
    initLineChart () {
      // 数据转为需要的格式：[[timestamp, value]]
      const data = lineData.map(d => {
        return [getMillisecond(new Date(d[2]).getTime()), d[1]]
      })
      console.info(JSON.stringify(data))
      const option = this.$_.cloneDeep(lineOption)
      option.series.data = data
      const dom = document.getElementById('lineCanvas')
      const lineChart = echarts.init(dom)
      this.$nextTick(() => {
        lineChart.setOption(option)
      })
    },
    initSunChart (index) {
      const option = this.$_.cloneDeep(sunOption)
      const data = index === 1 ? sunData1 : sunData2
      option.series.data = data
      const dom = document.getElementById('sunCanvas' + index)
      const lineChart = echarts.init(dom)
      this.$nextTick(() => {
        lineChart.setOption(option)
      })
    }
    /* initPie (index) {
      const data = pieData[index].map(p => {
        return {
          value: parseFloat(p[1].replace('%', '')).toFixed(2),
          name: p[0]
        }
      })
      const option = this.$_.cloneDeep(pieOption)
      option.series[0].data = data
      const dom = document.getElementById(`pieCanvas${index}`)
      const pieChart = echarts.init(dom)
      this.$nextTick(() => {
        pieChart.setOption(option)
      })
    } */
  },
  mounted () {
    /* this.initLine(lineData2, 1)
    this.initLine(lineData2, 2)
    this.initLine(lineData2, 3)
    this.initLine(lineData3, 6) */
    this.initLineChart()
    this.initSunChart(1)
    this.initSunChart(2)
    /* this.initPie(0)
    this.initPie(1)
    this.initPie(2)
    this.initPie(3)
    this.initPie(4)
    this.initPie(5) */
  }
}
</script>
