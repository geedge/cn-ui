<template>
  <div
    class="cn-chart__single-value chart-header-position"
    :class="singleValueClass(type)"
    :style="{ backgroundColor: color }"
  >
    <div class="single-value-icon__box" v-if="!isCommon3SingleValue(type) && !isDetectionsProtocol(type) ">
      <div
        class="single-value__icon"
        :style="`background-color: ${
          chartInfo.params.iconBackgroundColor || ''
        }`"
      >
        <i
          :class="icon"
          :style="`color: ${chartInfo.params.iconColor || ''}`"
        ></i>
      </div>
    </div>
    <div class="single-value__content" style="width: 200px;" v-if="isCommonSingleValue(type)">
      <div class="content__data">
        <span>{{
          handleSingleValue[0] || handleSingleValue[0] === 0
            ? handleSingleValue[0]
            : '-'
        }}</span>
        <span class="single-value__unit">{{ handleSingleValue[1] }}</span>
      </div>
      <div class="content__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{
          chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name
        }}</span>
      </div>
    </div>
    <div class="single-value__content" v-if="isSingleValueWithPercentileRight(type)">
      <div class="data__title-in-one">
        <div class="content__data">
          <span style="white-space: nowrap;">{{
            handleSingleValue[0] || handleSingleValue[0] === 0
              ? handleSingleValue[0]
              : '-'
          }}</span><span class="single-value__unit">{{handleSingleValue[1] }}</span>
        </div>
        <div class="content__title title-background-color">
            <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{
                chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name
              }}</span>
        </div>
      </div>
      <div class="content__percentile">
        <div class="circle__content">
          <div class="circle circle-p50"></div>
          <div><span class="percentile__title-color">P50: </span><span>
            {{(handleSingleValue[2] || handleSingleValue[2] === 0)
            ?handleSingleValue[2]
            :'-'}}
          </span></div>
        </div>
        <div class="circle__content">
          <div class="circle circle-p90"></div>
          <div><span class="percentile__title-color">P90: </span><span>
            {{(handleSingleValue[3]|| handleSingleValue[3] === 0)
            ?handleSingleValue[3]
            :'-'}}
          </span></div>
        </div>
      </div>
    </div>
    <div class="single-value__content" v-if="isSingleValueWithPercentileLeft(type)">
      <div class="content__title">
            <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{
                chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name
              }}</span>
      </div>
      <div class="content__data">
        <span>{{
          handleSingleValue[0] || handleSingleValue[0] === 0
            ? handleSingleValue[0]
            : '-'
        }}</span>
        <span class="single-value__unit">{{ handleSingleValue[1] }}</span>
      </div>
      <div class="content__percentile">
        <div class="circle__content">
          <div class="circle circle-p50"></div>
          <div><span class="percentile__title-color">P50: </span><span>
            {{(handleSingleValue[2]|| handleSingleValue[2] === 0)
            ?handleSingleValue[2]
            :'-'}}
          </span></div>
        </div>
        <div class="circle__content">
          <div class="circle circle-p90"></div>
          <div><span class="percentile__title-color">P90: </span><span>
            {{(handleSingleValue[3]|| handleSingleValue[3] === 0)
            ?handleSingleValue[3]
            :'-'}}
          </span></div>
        </div>
      </div>
    </div>
    <div class="single-value__content single-value__content--with-chart" v-if="isSingleValueWithEcharts(type)">
      <div class="content__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{
          chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name
        }}</span>
        <span
          v-if="chartInfo.params && chartInfo.params.as"
          class="ip-detail-as"
        >
          as&nbsp;<span style="text-transform: capitalize">{{
            chartInfo.params.as
          }}</span>
        </span>
      </div>
      <div class="content__data">
        <span>{{
          handleSingleValue[0] || handleSingleValue[0] === 0
            ? handleSingleValue[0]
            : '-'
        }}</span>
        <span class="single-value__unit">{{ handleSingleValue[1] }}</span>
      </div>
      <div class="content__chart">
        <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
      </div>
    </div>
    <div class="single-value__content" v-if="isCommon2SingleValue(type)">
      <div class="content__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{
          chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name
        }}</span>
      </div>
      <div class="content__data">
        <span>{{
          handleSingleValue[0] || handleSingleValue[0] === 0
            ? handleSingleValue[0]
            : '-'
        }}</span>
        <span class="single-value__unit">{{ handleSingleValue[1] }}</span>
      </div>
    </div>
    <div class="single-value__content" v-if="isCommon3SingleValue(type)">
      <div class="single-value-icon__box">
        <div class="single-value__icon">
          <!-- 使用图标-->
          <svg class="cn-icon-svg" aria-hidden="true">
            <use :xlink:href="icon"></use>
          </svg>
        </div>
      </div>
      <div class="single-value__data">
        <div class="content__title">
          <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{
            chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name
          }}</span>
        </div>
        <div class="content__data">
          <span>{{
            handleSingleValue[0] || handleSingleValue[0] === 0
              ? handleSingleValue[0]
              : '-'
          }}</span>
          <span class="single-value__unit">{{ handleSingleValue[1] }}</span>
        </div>
      </div>
    </div>

    <div class="single-value__content" v-if="isSingleValueWithPercent(type)">
      <div>
      <div class="content__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{
          chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name
        }}</span>
      </div>
      <div class="content__data">
        <div class="content__data__doh">
          <div class="content__data__doh__count">
            {{ $_.get(chartData, 'count', '-') }}
          </div>
          <div class="content__data__doh__percent">
            {{$t('protocol.proportion')}}<span>{{ $_.get(chartData, 'percent', '-') }}%</span>
          </div>
        </div>
      </div>

      </div>
    </div>
    <div class="single-value__content" v-if="isDetectionsProtocol(type)">
      <div class="single-value__data">
        <div class="content__title">
          <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">
            {{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name }}
          </span>
        </div>
      </div>
      <div class="content__data">
        <div class="content__data-protocol">
          <div class="content__data-protocol-all">
            <div class="content__data-protocol-icon" :style="{backgroundColor: chartInfo.params.iconBackgroundColor[0]}">
              <i :class="chartInfo.params.icon[0]" :style="{color: chartInfo.params.iconColor[0]}"></i>
            </div>
          </div>
          <div class="content__data-protocol-value">
            <div class="content__data-protocol-value-title">{{$t('protocol.totalFlow')}}</div>
            <div class="content__data-protocol-value-num">{{unitConvert($_.get(chartData, 'count'), chartInfo.params.unitType).join('')}}</div>
          </div>
          <div class="content__data-protocol-percent"><span>{{$t('protocol.proportion')}}</span>&nbsp;<span>{{unitConvert($_.get(chartData, 'countPercent'), unitTypes.percent).join('')}}</span></div>
        </div>
        <div class="content__data-protocol">
          <div class="content__data-protocol-all">
            <div class="content__data-protocol-icon" :style="{backgroundColor: chartInfo.params.iconBackgroundColor[1]}">
              <i :class="chartInfo.params.icon[1]" :style="{color: chartInfo.params.iconColor[1]}"></i>
            </div>
          </div>
          <div class="content__data-protocol-value">
            <div class="content__data-protocol-value-title">{{$t('protocol.requestVolume')}}</div>
            <div class="content__data-protocol-value-num">{{unitConvert($_.get(chartData, 'bytes'), unitTypes.byte).join('')}}</div>
          </div>
          <div class="content__data-protocol-percent"><span>{{$t('protocol.proportion')}}</span>&nbsp;<span>{{unitConvert($_.get(chartData, 'bytesPercent'), unitTypes.percent).join('')}}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { get } from '@/utils/http'
import { unitTypes } from '@/utils/constants'
import { replaceUrlPlaceholder } from '@/utils/tools'
import * as echarts from 'echarts'
import {
  getOption,
  getChartColor,
  isCommonSingleValue,
  isSingleValueWithEcharts,
  isSingleValueWithPercentileLeft,
  isSingleValueWithPercentileRight,
  isCommon2SingleValue,
  isSingleValueWithPercent,
  isCommon3SingleValue,
  isDetectionsProtocol
} from '@/views/charts/charts/tools'
import { legendMapping } from '@/views/charts/charts/chart-table-title'

export default {
  name: 'chartSingleValue',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object
  },
  data () {
    return {
      unitConvert,
      unitTypes,
      icon: '',
      color: '',
      type: 0,
      chartOption: null,
      timer: null,
      myChart: ''
    }
  },
  watch: {
    chartInfo: {
      deep: true,
      immediate: true,
      handler (n) {
        this.icon = n.params.icon
        this.color = n.params.color
        this.type = n.type
      }
    }
  },
  computed: {
    handleSingleValue () {
      let value = null
      if (this.isSingleValueWithPercentileLeft(this.chartInfo.type) || this.isSingleValueWithPercentileRight(this.chartInfo.type)) {
        value = (this.chartData && (this.chartData.value || this.chartData.value === 0)) ? this.chartData.value : ''
      } else {
        value = (this.chartData || this.chartData === 0)
          ? this.chartData
          : ''
      }

      const unitType = this.chartInfo.params.unitType
      const result = unitConvert(value, unitType)

      let p50 = ''
      let p90 = ''
      if (this.isSingleValueWithPercentileLeft(this.chartInfo.type) || this.isSingleValueWithPercentileRight(this.chartInfo.type)) {
        p50 = this.chartData ? unitConvert(this.chartData.p50, unitType) : ''
        p90 = this.chartData ? unitConvert(this.chartData.p90, unitType) : ''
      }

      switch (unitType) {
        case unitTypes.percent: {
          result[0] = result[0] < 0.01 ? '< 0.01' : result[0]
          result[2] = (p50 && (p50[0] || Number(p50[0]) === 0)) ? p50[0] + p50[1] : ''
          result[3] = (p90 && (p90[0] || Number(p90[0]) === 0)) ? p90[0] + p90[1] : ''
          break
        }
        case unitTypes.time: {
          result[0] = result[0] < 1 ? '< 1' : result[0]
          result[2] = (p50 && (p50[0] || Number(p50[0]) === 0)) ? p50[0] + p50[1] : ''
          result[3] = (p90 && (p90[0] || Number(p90[0]) === 0)) ? p90[0] + p90[1] : ''
          break
        }
        default:
          break
      }
      return result
    },
    singleValueClass () {
      return function (type) {
        let c
        if (this.isCommonSingleValue(type)) {
          c = 'cn-chart__single-value--icon-left'
        } else if (this.isSingleValueWithEcharts(type)) {
          c = 'cn-chart__single-value--chart'
        } else if (this.isSingleValueWithPercentileLeft(type)) {
          c = 'cn-chart__single-value--percentile-left'
        } else if (this.isSingleValueWithPercentileRight(type)) {
          c = 'cn-chart__single-value--percentile-right'
        } else if (this.isCommon2SingleValue(type)) {
          c = 'cn-chart__single-value--icon-right'
        } else if (this.isCommon3SingleValue(type)) {
          c = 'cn-chart__single-value--icon-right--color'
        } else if (this.isSingleValueWithPercent(type)) {
          c = 'cn-chart__single-value--icon-doh'
        } else if (this.isDetectionsProtocol(type)) {
          c = 'cn-chart__single-value--protocol'
        }
        return c
      }
    }
  },
  methods: {
    isCommonSingleValue,
    isSingleValueWithEcharts,
    isSingleValueWithPercentileLeft,
    isSingleValueWithPercentileRight,
    isCommon2SingleValue,
    isCommon3SingleValue,
    isSingleValueWithPercent,
    isDetectionsProtocol,
    chartSingleValueTotal () {
      const chartParams = this.$_.get(this.chartInfo, 'params') || {}
      if (isSingleValueWithEcharts(this.type)) {
        const dom = document.getElementById(`chart${this.chartInfo.id}`)
        const myChart = echarts.init(dom)
        this.chartOption = this.$_.cloneDeep(getOption(this.type))
        get(replaceUrlPlaceholder(chartParams.urlChart, this.queryParams)).then(
          (response) => {
            const seriesTemplate = this.chartOption.series[0]
            const result = response.data.result
            this.chartOption.series = result.map((r, i) => {
              if (r.legend && legendMapping[r.legend]) {
                r.legend = this.$t(legendMapping[r.legend])
              }
              return {
                ...seriesTemplate,
                name: r.legend,
                data: r.values.map((v) => [
                  Number(v[0]) * 1000,
                  Number(v[1]),
                  chartParams.unitType
                ]),
                lineStyle: {
                  color: getChartColor[i]
                }
              }
            })
            this.myChart = myChart
            myChart.setOption(this.chartOption)
          }
        )
      }
    },
    resize () {
      if (this.myChart) this.myChart.resize()
    }
  },
  mounted () {
    this.debounceFunc = this.$_.debounce(this.resize, 500)
    window.addEventListener('resize', this.debounceFunc)
    this.$nextTick(
      () =>
        (this.timer = setTimeout(() => {
          this.chartSingleValueTotal()
        }, 200))
    )
  },
  beforeUnmount () {
    window.addEventListener('resize', this.debounceFunc)
  },
  deactivated () {
    clearTimeout(this.timer)
  }
}
</script>
