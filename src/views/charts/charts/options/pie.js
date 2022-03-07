import unitConvert from '@/utils/unit-convert'
import { tooLongFormatter } from '../tools'
import { chartColor } from '@/utils/constants'

export const pieWithTable = {
  tooltip: {
    appendToBody: true
  },
  color: chartColor,
  animation: false,
  legend: {
    orient: 'vertical',
    type: 'plain',
    left: '60%',
    top: 'middle',
    icon: 'circle',
    itemWidth: 10, // 设置宽度
    itemHeight: 10, // 设置高度
    itemGap: 20,
    formatter: tooLongFormatter,
    tooltip: {
      show: true
    }
  },
  series: [
    {
      type: 'pie',
      selectedMode: 'single',
      radius: ['42%', '65%'],
      center: ['30%', '50%'],
      data: [],
      label: {
        formatter: '{d}%'
      },
      tooltip: {
        formatter: function (param, index, callback) {
          return `${param.name}: ${unitConvert(param.value, param.data.unitType).join(' ')}`
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}
export const ipHostedDomain = {
  color: chartColor,
  animation: false,
  tooltip: {
    show: true
  },
  legend: {
    orient: 'vertical',
    type: 'plain',
    right: '8%',
    top: 'middle',
    icon: 'circle',
    itemWidth: 10, // 设置宽度
    itemHeight: 10, // 设置高度
    itemGap: 20,
    tooltip: {
      show: true
    }
  },
  series: [
    {
      type: 'pie',
      selectedMode: 'single',
      radius: ['42%', '65%'],
      center: ['36%', '50%'],
      data: [],
      label: {
        formatter: '{d}%'
      },
      tooltip: {
        formatter: function (param, index, callback) {
          return `${param.name}: ${unitConvert(param.value, param.data.unitType).join(' ')}`
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}
