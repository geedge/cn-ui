<template>
  <div class="npm-traffic-line">
    <div class="npm-traffic-line-title">{{$t('overall.traffic')}}</div>
    <div class="npm-traffic-line-body">
      <chart-no-data v-if="isNoData"></chart-no-data>
      <template v-else>
        <div class="chart-drawing" id="chart"></div>
      </template>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { trafficLineChartOption } from '@/views/charts2/charts/options/echartOption'
import unitConvert from '@/utils/unit-convert'
import { unitTypes, chartColor3 } from '@/utils/constants.js'
import { shallowRef } from 'vue'
import { trafficLineTooltipFormatter } from '@/views/charts/charts/tools'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import _ from 'lodash'
export default {
  name: 'NpmTrafficLine',
  props: {
    chart: Object,
    timeFilter: Object,
    // type: String,
    // side: String,
    // ip: String
  },
  components: {
    ChartNoData
  },
  setup () {
    return {
      myChart: shallowRef(null)
    }
  },
  data () {
    return {
      unitConvert,
      unitTypes,
      isNoData: false,
      ip: '192.68.44.54',
      side: 'client',
      type: 'ip',
      mpackets: [
        { name: 'network.total', show: true, positioning: 0, data: [], unitType: '' },
        { name: 'network.inbound', show: true, positioning: 1, data: [], unitType: '' },
        { name: 'network.outbound', show: true, positioning: 2, data: [], unitType: '' },
        { name: 'network.internal', show: true, positioning: 3, data: [], unitType: '' },
        { name: 'network.through', show: true, positioning: 4, data: [], unitType: '' },
        { name: 'network.other', show: true, positioning: 5, data: [], unitType: '' }
      ],
    }
  },
  methods: {
    init () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        q: `ip='${this.ip}' and side='${this.side}'`,
        type: 'ip'
      }
      // const condition = this.$store.getters.getQueryCondition
      // if (condition) {
      //   params.q = condition
      //   params.type = this.type
      // }
      // const result = npmTrafficLine
      // result.forEach((t, i) => {
      //   if (t.type === 'bytes') {
      //     const mpackets = _.cloneDeep(this.mpackets)
      //     mpackets[0].analysis = t.totalBitsRate.analysis
      //     mpackets[1].analysis = t.inboundBitsRate.analysis
      //     mpackets[2].analysis = t.outboundBitsRate.analysis
      //     mpackets[3].analysis = t.internalBitsRate.analysis
      //     mpackets[4].analysis = t.externalBitsRate.analysis
      //     mpackets[5].analysis = t.other.analysis
      //     mpackets[0].data = t.totalBitsRate.values ? t.totalBitsRate.values : []
      //     mpackets[1].data = t.inboundBitsRate.values ? t.inboundBitsRate.values : []
      //     mpackets[2].data = t.outboundBitsRate.values ? t.outboundBitsRate.values : []
      //     mpackets[3].data = t.internalBitsRate.values ? t.internalBitsRate.values : []
      //     mpackets[4].data = t.externalBitsRate.values ? t.externalBitsRate.values : []
      //     mpackets[5].data = t.other.values ? t.other.values : []
      //     this.mpackets = mpackets
      //     this.echartsInit(this.mpackets)
      //   } else if (t.type === 'packets') {
      //     const mpackets = _.cloneDeep(this.mpackets)
      //     mpackets[0].analysis = t.totalPacketsRate.analysis
      //     mpackets[1].analysis = t.inboundPacketsRate.analysis
      //     mpackets[2].analysis = t.outboundPacketsRate.analysis
      //     mpackets[3].analysis = t.internalPacketsRate.analysis
      //     mpackets[4].analysis = t.externalPacketsRate.analysis
      //     mpackets[5].analysis = t.other.analysis
      //     mpackets[0].data = t.totalPacketsRate.values ? t.totalPacketsRate.values : []
      //     mpackets[1].data = t.inboundPacketsRate.values ? t.inboundPacketsRate.values : []
      //     mpackets[2].data = t.outboundPacketsRate.values ? t.outboundPacketsRate.values : []
      //     mpackets[3].data = t.internalPacketsRate.values ? t.internalPacketsRate.values : []
      //     mpackets[4].data = t.externalPacketsRate.values ? t.externalPacketsRate.values : []
      //     mpackets[5].data = t.other.values ? t.other.values : []
      //     this.mpackets = mpackets
      //     this.echartsInit(this.mpackets)
      //   } else if (t.type === 'sessions') {
      //     const mpackets = _.cloneDeep(this.mpackets)
      //     mpackets[0].analysis = t.totalSessionsRate.analysis
      //     mpackets[0].data = t.totalSessionsRate.values ? t.totalSessionsRate.values : []
      //     this.mpackets = mpackets
      //     this.echartsInit(this.mpackets)
      //   }
      // })
      get(api.npm.overview.trafficGraph, params).then((res) => {
        if (res.code === 200) {
          // res.data.result.length = 0
          if (res.data.result.length === 0) {
            this.isNoData = true
            return
          }
          res.data.result.forEach((t, i) => {
            if (t.type === 'bytes') {
              const mpackets = _.cloneDeep(this.mpackets)
              mpackets[0].analysis = t.totalBitsRate.analysis
              mpackets[1].analysis = t.inboundBitsRate.analysis
              mpackets[2].analysis = t.outboundBitsRate.analysis
              mpackets[3].analysis = t.internalBitsRate.analysis
              mpackets[4].analysis = t.externalBitsRate.analysis
              mpackets[5].analysis = t.other.analysis
              mpackets[0].data = t.totalBitsRate.values ? t.totalBitsRate.values : []
              mpackets[1].data = t.inboundBitsRate.values ? t.inboundBitsRate.values : []
              mpackets[2].data = t.outboundBitsRate.values ? t.outboundBitsRate.values : []
              mpackets[3].data = t.internalBitsRate.values ? t.internalBitsRate.values : []
              mpackets[4].data = t.externalBitsRate.values ? t.externalBitsRate.values : []
              mpackets[5].data = t.other.values ? t.other.values : []
              mpackets.forEach(e => {
                e.unitType = 'bps'
                if (e.name !== 'network.total' && e.analysis.avg == 0) {
                  e.show = false
                }
              })
              this.mpackets = mpackets
              this.echartsInit(this.mpackets)
            } else if (t.type === 'packets') {
              const mpackets = _.cloneDeep(this.mpackets)
              mpackets[0].analysis = t.totalPacketsRate.analysis
              mpackets[1].analysis = t.inboundPacketsRate.analysis
              mpackets[2].analysis = t.outboundPacketsRate.analysis
              mpackets[3].analysis = t.internalPacketsRate.analysis
              mpackets[4].analysis = t.externalPacketsRate.analysis
              mpackets[5].analysis = t.other.analysis
              mpackets[0].data = t.totalPacketsRate.values ? t.totalPacketsRate.values : []
              mpackets[1].data = t.inboundPacketsRate.values ? t.inboundPacketsRate.values : []
              mpackets[2].data = t.outboundPacketsRate.values ? t.outboundPacketsRate.values : []
              mpackets[3].data = t.internalPacketsRate.values ? t.internalPacketsRate.values : []
              mpackets[4].data = t.externalPacketsRate.values ? t.externalPacketsRate.values : []
              mpackets[5].data = t.other.values ? t.other.values : []
              mpackets.forEach(e => {
                e.unitType = 'packets/s'
                if (e.name !== 'network.total' && e.analysis.avg == 0) {
                  e.show = false
                }
              })
              this.mpackets = mpackets
              this.echartsInit(this.mpackets)
            } else if (t.type === 'sessions') {
              const mpackets = _.cloneDeep(this.mpackets)
              mpackets[0].analysis = t.totalSessionsRate.analysis
              mpackets[0].data = t.totalSessionsRate.values ? t.totalSessionsRate.values : []
              mpackets.forEach((e, i) => {
                if (i !== 0) {
                  e.show = false
                }
                e.unitType = 'sessions/s'
              })
              this.mpackets = mpackets
              this.echartsInit(this.mpackets)
            }
          })
        }
      })
    },
    echartsInit (echartsData) {
      const dom = document.getElementById('chart')
      this.myChart = echarts.init(dom)
      this.chartOption = trafficLineChartOption
      const chartOption = this.chartOption.series[0]
      this.chartOption.series = echartsData.map((t, i) => {
        return {
          ...chartOption,
          name: this.$t(t.name),
          lineStyle: {
            color: chartColor3[t.positioning],
            width: 1
          },
          stack: this.$t(echartsData[0].name),
          areaStyle: {
            opacity: 0.1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: chartColor3[t.positioning]
              },
              {
                offset: 1,
                color: chartColor3[t.positioning]
              }
            ])
          },
          data: t.data.map(v => [Number(v[0]) * 1000, Number(v[1]), 'number'])
        }
      })
      this.chartOption.tooltip.formatter = (params) => {
        params.forEach(t => {
          t.seriesName = this.$t(t.seriesName)
        })
        const str = trafficLineTooltipFormatter(params)
        return str
      }
      this.myChart.on('legendselectchanged', this.handleLegendClick)
      this.myChart.setOption(this.chartOption)
    },
    // 点击前，高亮legend个数
    getSelectedNum (params) {
      let selectedNum = 0
      const legendItem = params.selected
      for (const name in legendItem) {
        if (name === params.name) {
          if (!legendItem[name]) {
            selectedNum = selectedNum + 1
          }
        } else {
          if (legendItem[name]) {
            selectedNum = selectedNum + 1
          }
        }
      }
      return selectedNum
    },

    // 自定义legend的点击事件:此方法只处理多条曲线的情况（单条曲线正常切换legend和曲线）
    handleLegendClick (params) {
      // legend点击事件
      const legendNum = Object.keys(params.selected).length
      const selectedNum = this.getSelectedNum(params)

      const legendItem = params.selected
      if (selectedNum === legendNum) { // 点击前：全部曲线高亮
        for (const name in legendItem) {
          if (name === params.name) {
            legendItem[name] = true
          } else {
            legendItem[name] = false
          }
        }
      } else if (selectedNum === 1 && !params.selected[params.name]) { // 点击前：多条曲线，且只有一条曲线高亮时
        for (const name in legendItem) {
          legendItem[name] = true
        }
      }
      this.myChart.setOption({
        legend: {
          selected: legendItem
        }
      })
    },
    resize () {
      this.myChart.resize()
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      this.init()
    }, 200)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>

