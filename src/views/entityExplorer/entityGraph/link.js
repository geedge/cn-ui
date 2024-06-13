export default class Link {
  constructor (sourceNode, targetNode, type) {
    this.id = sourceNode.id + '__' + targetNode.id
    this.source = sourceNode.id
    this.target = targetNode.id
    this.isTemp = type === 'temp'
  }
}
