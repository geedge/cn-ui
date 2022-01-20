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
export const relationShip = {
  grid: {
    left: 0,
    bottom: 50,
    top: 80,
    right: 0
  },
  series: [
    {
      type: 'graph',
      layout: 'force',
      symbolSize: 40,
      roam: true,
      force: {
        repulsion: 350
      },
      draggable: true,
      label: { show: true },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: 7,
      data: [],
      links: []
    }
  ]
}
