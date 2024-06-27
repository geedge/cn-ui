export const pieOption = {
  tooltip: {
    trigger: 'item',
    appendToBody: true// 解决提示框被遮挡的问题
  },
  legend: {
    show: false,
    right: 'right',
    top: 'middle',
    orient: 'vertical',
    itemHeight: 6,
    itemWidth: 16,
    itemGap: 4,
    left: 140,
    formatter: function (name) {
      return ''
    }
  },
  series: [
    {
      name: 'Pie chart',
      type: 'pie',
      center: [75, '50%'],
      label: { show: false },
      radius: [27, 42],
      data: []
    }
  ]
}
