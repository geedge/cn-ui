export const sankey = {
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: [
    {
      type: 'sankey',
      data: [],
      links: [],
      right: '5%',
      top: 50,
      bottom: 100,
      levels: [
        {
          depth: 0,
          itemStyle: {
            color: '#47D49C'
          },
          lineStyle: {
            color: '#999'
          }
        }, {
          depth: 1,
          itemStyle: {
            color: '#A69BF5'
          },
          lineStyle: {
            color: '#999'
          }
        }, {
          depth: 2,
          itemStyle: {
            color: '#73A0FA'
          },
          lineStyle: {
            color: '#999'
          }
        }
      ]
    }
  ]
}
