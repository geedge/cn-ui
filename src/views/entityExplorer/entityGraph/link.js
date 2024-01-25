export default class Edge {
  constructor (sourceNode, targetNode, type = linkType.normal) {
    this.source = sourceNode.id
    this.target = targetNode.id
    this.type = type
  }
}

export const linkType = {
  normal: 'normal',
  temp: 'temp'
}
