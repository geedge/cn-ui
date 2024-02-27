export const pieOption = {
  tooltip: {
    trigger: 'item'
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
