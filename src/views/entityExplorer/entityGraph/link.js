import { nodeType } from './node'

export default class Link {
  constructor (sourceNode, targetNode, type) {
    this.source = sourceNode.id
    this.target = targetNode.id
    this.type = type || linkType.normal
    this.strength = strengthHandler(sourceNode, targetNode)
  }
}

function strengthHandler (sourceNode, targetNode) {
  if (sourceNode.type === nodeType.rootNode) {
    return 0.5
  } else {
    return 1
  }
}

export const linkType = {
  normal: 'normal',
  temp: 'temp'
}

export const linkDistance = {
  root: 220,
  entityToList: 120,
  normal: 90
}
