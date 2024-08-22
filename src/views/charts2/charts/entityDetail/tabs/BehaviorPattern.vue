<template>
  <chart-error v-if="showError" :content="errorMsg"></chart-error>
  <chart-no-data v-if="isNoData && !showError"></chart-no-data>

  <div v-if="!isNoData && !showError" class="entity-detail-event-block" style="height: 100%;width: 100%;position: relative;">
    <div class="behavior-pattern" >
      <div class="behavior-pattern-legend" >
          <div class="behavior-pattern-legend__item" v-for="(data, index) in tableData" :key="data.name">
            <div class="legend-icon" :style="`background:${chartColorForBehaviorPattern[index%10]};`"></div>
            <div class="legend-name">{{data.name}}</div>
            <div class="legend-value" >{{ valueToRangeValue(data.value, unitTypes.number).join('')}}</div>
            <div class="legend-percent">{{ valueToRangeValue(data.percent, unitTypes.percent).join('') }}</div>
          </div>
      </div>
      <div id="entityIpRoseType" class="behavior-pattern-chart"></div>
      <div class="chart-bottom-dot__right"></div>
      <div class="chart-bottom-dot__left"></div>
    </div>
  </div>
</template>

<script>
import { dateFormatByAppearance, getNowTime } from '@/utils/date-util'
import * as echarts from 'echarts'
import { pieChartOption4 } from '@/views/charts2/charts/options/echartOption'
import { shallowRef, ref } from 'vue'
import { entityDetailTabsName, chartColorForBehaviorPattern, unitTypes } from '@/utils/constants'
import { valueToRangeValue } from '@/utils/unit-convert'
import axios from 'axios'
import { api } from '@/utils/api'
import { useRoute } from 'vue-router'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import { toUpperCaseByString, reverseSortBy } from '@/utils/tools'
import ChartNoData from '@/views/charts/charts/ChartNoData'

export default {
  name: 'BehaviorPattern',
  components: { ChartError, ChartNoData },
  mixins: [chartMixin],
  data () {
    return {
      showError: false,
      errorMsg: '',
      tableData: []
    }
  },
  setup () {
    const { query } = useRoute()
    const entityType = query.entityType
    const entityName = query.entityName
    // range取 config.js 中配置的值
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.behaviorPattern
    const timeFilter = ref({ dateRangeValue })
    const { startTime, endTime } = getNowTime(dateRangeValue)
    timeFilter.value.startTime = startTime
    timeFilter.value.endTime = endTime

    return {
      entityType,
      entityName,
      myChart: shallowRef(null),
      chartColorForBehaviorPattern,
      unitTypes,
      timeFilter
    }
  },
  async mounted () {
    await this.initData()
    this.toggleLoading(true)
    const timer = setTimeout(() => {
      this.toggleLoading(false)
      clearInterval(timer)
    }, 200)
  },
  methods: {
    valueToRangeValue,
    toUpperCaseByString,
    dateFormatByAppearance,
    initEcharts () {
      this.chartOption = pieChartOption4
      this.chartOption.angleAxis.data = []
      this.chartOption.series[0].data = []
      this.tableData.forEach((item, index) => {
        this.chartOption.angleAxis.data.push(item.name)
        this.chartOption.series[0].data.push(item.value)
      })
      const len = this.tableData.length
      const endIndex = len + 1
      this.tableData.forEach((item, i) => {
        if (i !== endIndex) {
          this.chartOption.angleAxis.data.push(item.name + '2')
          this.chartOption.series[0].data.push(0)
        }
      })
      const axisLabel = this.chartOption.angleAxis.axisLabel
      this.chartOption.angleAxis.axisLabel = {
        ...axisLabel,
        formatter: function (params, index) {
          if (len > 15) {
            if (index === 7) {
              return params + '\n'
            } else if (index === 8) {
              return '\n' + params
            }
          }
          if (index === endIndex) {
            return params + '\n'
          } else {
            return params
          }
        }
      }

      const self = this
      this.$nextTick(() => {
        if (self.myChart) {
          self.myChart.dispose()
        }

        const dom = document.getElementById('entityIpRoseType')
        if (dom) {
          self.myChart = echarts.init(dom)
          self.myChart.setOption(this.chartOption)

          self.myChart.dispatchAction({
            type: 'takeGlobalCursor',
            key: 'brush',
            brushOption: {
              brushType: 'lineX',
              xAxisIndex: 'all',
              brushMode: 'single',
              throttleType: 'debounce'
            }
          })
        }
      })
    },
    async initData () {
      const params = this.getParams()
      this.toggleLoading(true)
      await axios.get(`${api.entity.behaviorPattern}`, { params: params }).then(response => {
        const res = response.data

        if (response.status === 200) {
          this.isNoData = res.data.result.length === 0

          this.showError = false
          if (!this.isNoData) {
            const data = res.data.result
            this.tableData = []
            if (data && data[0]) {
              const dataObject = data[0]
              Object.keys(dataObject).forEach(key => {
                const value = Number(dataObject[key]) ? Number(dataObject[key]) : 0
                if (value !== 0 && key !== 'total') {
                  this.tableData.push({
                    name: key,
                    value: value,
                    percent: dataObject.total ? value / dataObject.total : '-'
                  })
                }
              })
              this.tableData = this.tableData.sort(reverseSortBy('value'))
              this.$emit('checkTag', entityDetailTabsName.behaviorPattern, this.tableData.length)
              if (this.tableData.length === 0) {
                this.isNoData = true
              }
              this.initEcharts()
            }
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
      this.$emit('checkTag', entityDetailTabsName.behaviorPattern, 0)
    }
  }
}
</script>
