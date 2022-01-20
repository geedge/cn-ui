import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import {
  categoryVerticalFormatter,
  chartColor,
  getCharBartColor,
  timeVerticalFormatter, tooLongFormatter
} from '@/views/charts/charts/tools'

export const ipOpenPortBar = {
  xAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: { show: false }
  },
  grid: {
    top: 30,
    left: 60,
    right: 50,
    bottom: 50
  },
  yAxis: {
    type: 'value',
    show: false
  },
  series: [{
    barWidth: 38,
    data: [],
    type: 'bar',
    label: { show: true, position: 'top' },
    barCategoryGap: '10%'
  }]
}
export const categoryBar = {
  tooltip: {
    appendToBody: true,
    trigger: 'item',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: categoryVerticalFormatter,
    show: true,
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important'
  },
  xAxis: {
    type: 'category',
    axisTick: { show: false },
    axisLine: { show: false }
  },
  grid: {
    top: 20,
    left: 10,
    right: 25,
    bottom: 20,
    containLabel: true
  },
  yAxis: {
    type: 'value',
    axisTick: { show: false },
    axisLine: { show: false }
  },
  color: chartColor,
  series: [{
    barWidth: 15,
    data: [],
    type: 'bar',
    label: { show: false },
    barCategoryGap: '10%',
    itemStyle: {
      color: function (params) {
        return getCharBartColor([params.dataIndex])
      }
    }
  }]
}
export const timeBar = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: timeVerticalFormatter,
    show: true,
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important'
  },
  xAxis: {
    type: 'time',
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      interval: 0,
      // rotate: -40, //设置日期显示样式（倾斜度）
      formatter: function (value) { // 在这里写你需要的时间格式
        const tDate = new Date(value)
        return [tDate.getMonth() + 1, tDate.getDate()].join('/') + ' ' + [tDate.getHours(), tDate.getMinutes()].join(':')
      }
    }
  },
  grid: {
    top: 20,
    left: 25,
    right: 25,
    bottom: 20,
    containLabel: true
  },
  yAxis: {
    type: 'value',
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      formatter: function (value, index, a, b) {
        return unitConvert(value, unitTypes.number).join(' ')
      }
    },
    minInterval: 1
  },
  color: chartColor,
  series: [{
    data: [],
    type: 'bar',
    label: { show: false },
    barCategoryGap: '10%',
    itemStyle: {
      color: function (params) {
        return getCharBartColor([params.dataIndex])
      }
    }
  }]
}
