import { axisFormatter } from '@/views/charts/charts/tools'
import { chartColor } from '@/utils/constants'

export const entityListLineOption = {
  tooltip: {
    appendToBody: true,
    trigger: 'axis',
    textStyle: {
      width: '20px',
      overflow: 'truncate'
    },
    formatter: axisFormatter,
    show: true,
    className: 'nz-chart-tooltip',
    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);max-width: 300px !important'
  },
  xAxis: {
    type: 'time',
    show: false
  },
  yAxis: {
    type: 'value',
    show: false
  },
  animation: false,
  grid: {
    left: 0,
    bottom: 2,
    top: 5,
    right: 0
  },
  color: chartColor,
  legend: {
    show: false
  },
  series: [
    {
      type: 'line',
      legendHoverLink: false,
      itemStyle: {
        lineStyle: {
          width: 2
        }
      },
      data: [],
      showSymbol: false
    }
  ]
}
