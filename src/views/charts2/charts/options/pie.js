import { chartColor1, chartColor2, chartColor3 } from '@/utils/constants'

export const pieChartOption1 = {
  color: chartColor1,
  legend: {
    orient: 'vertical',
    top: 35,
    left: '55%',
    itemGap: 8,
    itemWidth: 15,
    itemHeight: 7
  },
  series: [
    {
      right: '40%',
      name: 'Access From',
      type: 'pie',
      radius: ['30%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ]
    }
  ]
}
export const pieChartOption2 = {
  legend: {
    orient: 'vertical',
    top: 35,
    left: '55%',
    itemGap: 8,
    itemWidth: 15,
    itemHeight: 7
  },
  color: chartColor2,
  series: [
    {
      right: '40%',
      name: 'Access From',
      type: 'pie',
      radius: ['30%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ]
    }
  ]
}
export const stackedLineChartOption = {
  color: chartColor3,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    type: 'scroll',
    top: 10,
    left: 20,
    itemGap: 57,
    itemWidth: 14,
    itemHeight: 14
  },
  grid: {
    top: '30%',
    left: '1%',
    right: '2%',
    bottom: 15,
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Total',
      type: 'line',
      stack: 'Total',
      smooth: true,
      showSymbol: false,
      symbolSize: 8,
      symbol: 'circle',
      lineStyle: {
        width: 0
      },
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: 'Inbound',
      type: 'line',
      stack: 'Total',
      smooth: true,
      showSymbol: false,
      symbolSize: 8,
      symbol: 'circle',
      lineStyle: {
        width: 0
      },
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [220, 182, 191, 234, 290, 330, 310]
    },
    {
      name: 'Outbound',
      type: 'line',
      stack: 'Total',
      smooth: true,
      showSymbol: false,
      symbolSize: 8,
      symbol: 'circle',
      lineStyle: {
        width: 0
      },
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [150, 232, 201, 154, 190, 330, 410]
    },
    {
      name: 'Internal',
      type: 'line',
      stack: 'Total',
      smooth: true,
      showSymbol: false,
      symbolSize: 8,
      symbol: 'circle',
      lineStyle: {
        width: 0
      },
      areaStyle: {
        color: '#35ADDA'
      },
      emphasis: {
        focus: 'series'
      },
      data: [320, 332, 301, 334, 390, 330, 320]
    },
    {
      name: 'Other',
      type: 'line',
      stack: 'Total',
      smooth: true,
      showSymbol: false,
      symbolSize: 8,
      symbol: 'circle',
      lineStyle: {
        width: 0
      },
      label: {
        show: true,
        position: 'top'
      },
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [820, 932, 901, 934, 1290, 1330, 1320]
    }
  ]
}
