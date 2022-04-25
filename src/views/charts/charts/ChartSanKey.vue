<template>
    <div class="sankey-box">
        <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
        <div class="sankey__label" style="left: 5%;">{{$t('entities.inboundLinkId')}}</div>
        <div class="sankey__label" style="left: 50%;">{{entity.ip || entity.domain || entity.app}}</div>
        <div class="sankey__label" style="right: 5%; transform: translateX(50%)">{{$t('entities.outboundLinkId')}}</div>
    </div>
</template>

<script>
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import * as echarts from 'echarts'
import { sankey } from './options/sankey'
export default {
  name: 'ChartSanKey',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object,
    queryParams: Object,
    entity: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    init (id) {
      const vm = this
      const chartParams = this.chartInfo.params
      const entityName = this.entity.ip || this.entity.domain || this.entity.app || this.entity.appName
      const dom = document.getElementById(id)
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = this.$_.cloneDeep(sankey)
      this.chartOption.tooltip.formatter = function (param) {
        if (!param.data.latency || !param.data.convert || !param.data.lossPercent || !param.data.retransPercent) {
          return false
        }
        return `
            <div class="sankey__tooltip">
              <div class="sankey__tooltip-row">
                <div class="sankey__row-label">Via:</div>
                <div class="sankey__row-value">${param.data.name}</div>
              </div>
              <div class="sankey__tooltip-row">
                <div style="margin: 6px 0; height: 1px; width: 100%; background-color: #E7EAED;"></div>
              </div>
              <div class="sankey__tooltip-row">
                <div class="sankey__row-label">Traffic:</div>
                <div class="sankey__row-value">${param.data.convert[0]}${param.data.convert[1]}&nbsp;(${param.data.percent[0]}%)</div>
              </div>
              <div class="sankey__tooltip-row">
                <div class="sankey__row-label">Performance:</div>
              </div>
              <div class="sankey__tooltip-table">
                <div class="sankey__table-row">
                  <div class="sankey__table-cell">${vm.$t('networkAppPerformance.tripTime')}:</div>
                  <div class="sankey__table-cell">${param.data.latency[0]}&nbsp;${param.data.latency[1]}</div>
                </div>
                <div class="sankey__table-row">
                  <div class="sankey__table-cell">${vm.$t('overall.packetLoss')}:</div>
                  <div class="sankey__table-cell">${param.data.lossPercent[0]}&nbsp;%</div>
                </div>
                <div class="sankey__table-row">
                  <div class="sankey__table-cell">${vm.$t('overall.packetRetrans')}:</div>
                  <div class="sankey__table-cell">${param.data.retransPercent[0]}&nbsp;%</div>
                </div>
              </div>
            </div>
          `
      }
      let inTotalValue = 0
      let outTotalValue = 0
      this.chartData.forEach(item => {
        if (item.direction === 'in') {
          inTotalValue += parseInt(item.bytes)
        } else if (item.direction === 'out') {
          outTotalValue += parseInt(item.bytes)
        }
      })
      const data = this.chartData.map(item => {
        return {
          ...item,
          name: item.linkID,
          percent: valueToRangeValue(parseInt(item.bytes) / (item.direction === 'in' ? inTotalValue : outTotalValue) * 100, unitTypes.percent),
          convert: unitConvert(item.bytes, unitTypes.byte),
          latency: valueToRangeValue(item.latency, unitTypes.time),
          lossPercent: valueToRangeValue(item.lossPercent, unitTypes.percent),
          retransPercent: valueToRangeValue(item.retransPercent, unitTypes.percent),
          bytes: parseFloat(item.bytes)
        }
      })
      data.push({ name: entityName })

      const link = data.map(item => {
        const source = item.direction === 'in' ? item.linkID : entityName
        const target = item.direction === 'in' ? entityName : item.linkID
        return {
          ...item,
          source,
          target,
          value: item.bytes
        }
      })
      this.chartOption.series[0].data = data
      this.chartOption.series[0].links = link
      this.myChart.setOption(this.chartOption)
    },
    resize () {
      this.myChart.resize()
    }
  },
  mounted () {
    window.addEventListener('resize', this.$_.debounce(this.resize))
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.resize)
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.init(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>

<style scoped>

</style>
