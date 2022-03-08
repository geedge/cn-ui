<template>
  <div
    class="cn-chart__single-value chart-header-position"
    :class="singleValueClass(type)"
    :style="{ backgroundColor: color }"
  >
    <div class="single-value-icon__box" v-if="type !== 54">
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
    <div class="single-value__content" v-if="type === 51">
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
    <div
      class="single-value__content single-value__content--with-chart"
      v-if="type === 52"
    >
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
    <div class="single-value__content" v-if="type === 53">
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
    <div class="single-value__content" v-if="type === 54">
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

    <div class="single-value__content" v-if="type === 55">
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
            占比<span>{{ $_.get(chartData, 'percent', '-') }}%</span>
          </div>
        </div>
      </div>

      </div>
    </div>
  </div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import { get } from '@/utils/http'
import { replaceUrlPlaceholder } from '@/utils/tools'
import * as echarts from 'echarts'
import { getOption, getChartColor } from '@/views/charts/charts/tools'
import _ from 'lodash'

export default {
  name: 'chartSingleValue',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object,
  },
  data() {
    return {
      icon: '',
      color: '',
      type: 0,
      chartOption: null,
      timer: null,
    }
  },
  watch: {
    chartInfo: {
      deep: true,
      immediate: true,
      handler(n) {
        this.icon = n.params.icon
        this.color = n.params.color
        this.type = n.type
      },
    },
  },
  computed: {
    handleSingleValue() {
      const value =
        this.$_.isEmpty(this.chartData) || this.$_.get(this, 'chartData')
          ? this.chartData
          : ''
      console.log(value)
      const unitType = this.chartInfo.params.unitType
      console.log(unitType)

      const result = unitConvert(value, unitType)
      console.log(result)

      switch (unitType) {
        case unitTypes.percent: {
          result[0] = result[0] < 0.01 ? '< 0.01' : result[0]
          break
        }
        case unitTypes.time: {
          result[0] = result[0] < 1 ? '< 1' : result[0]
          break
        }
        default:
          break
      }
      console.log(result)
      return result
    },
    singleValueClass() {
      return function (type) {
        let c
        switch (type) {
          case 51: {
            c = 'cn-chart__single-value--icon-left'
            break
          }
          case 55: {
            c = 'cn-chart__single-value--icon-doh'
            break
          }
          case 52: {
            c = 'cn-chart__single-value--chart'
            break
          }
          case 53: {
            c = 'cn-chart__single-value--icon-right'
            break
          }
          case 54: {
            c = 'cn-chart__single-value--icon-right--color'
            break
          }
          default:
            break
        }
        return c
      }
    },
  },
  methods: {
    chartSingleValueTotal() {
      const chartParams = this.$_.get(this.chartInfo, 'params') || {}
      if (this.type === 52) {
        const dom = document.getElementById(`chart${this.chartInfo.id}`)
        const myChart = echarts.init(dom)
        this.chartOption = this.$_.cloneDeep(getOption(this.type))
        get(replaceUrlPlaceholder(chartParams.urlChart, this.queryParams)).then(
          (response) => {
            const seriesTemplate = this.chartOption.series[0]
            const result = response.data.result
            this.chartOption.series = result.map((r, i) => {
              return {
                ...seriesTemplate,
                name: r.legend,
                data: r.values.map((v) => [
                  Number(v[0]) * 1000,
                  Number(v[1]),
                  chartParams.unitType,
                ]),
                lineStyle: {
                  color: getChartColor[i],
                },
              }
            })
            myChart.setOption(this.chartOption)
          },
        )
      }
    },
  },
  mounted() {
    this.$nextTick(
      () =>
        (this.timer = setTimeout(() => {
          this.chartSingleValueTotal()
        }, 200)),
    )
  },
  deactivated() {
    clearTimeout(this.timer)
  },
}
</script>
