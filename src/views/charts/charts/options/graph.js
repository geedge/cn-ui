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
