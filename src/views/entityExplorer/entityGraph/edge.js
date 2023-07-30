import G6 from '@antv/g6'

export default class Edge {
  constructor (sourceNode, targetNode, type) {
    this.id = sourceNode.id + '__' + targetNode.id
    this.source = sourceNode.id
    this.target = targetNode.id
    this.isTemp = type === 'temp'
    this.style = type === 'temp' ? tempStyles.style : normalStyles.style
    this.stateStyles = type === 'temp' ? tempStyles.stateStyles : normalStyles.stateStyles
  }
}

const normalStyles = {
  style: {
    stroke: '#BEBEBE',
    endArrow: {
      path: G6.Arrow.triangle(5, 5),
      fill: '#BEBEBE'
    }
  },
  stateStyles: {
    mySelected: {
      stroke: '#778391',
      endArrow: {
        path: G6.Arrow.triangle(5, 5),
        fill: '#778391'
      }
    }
  }
}

const tempStyles = {
  style: {
    endArrow: {
      path: G6.Arrow.triangle(5, 5),
      fill: '#DDD'
    },
    stroke: '#DDD',
    lineDash: [3, 2]
  },
  stateStyles: {
    mySelected: {
      stroke: '#DDD',
      endArrow: {
        path: G6.Arrow.triangle(5, 5),
        fill: '#DDD'
      },
      lineDash: [3, 2]
    }
  }
}
