export default class Link {
  constructor (sourceNode, targetNode, type = linkType.normal, distance, level = 1) {
    this.source = sourceNode.id
    this.target = targetNode.id
    this.type = type
    this.distance = distance || 20// 连接中心节点的线的distance为60，其他节点为20
    this.strength = level === 1 ? 0.5 : (level === 2 ? 1 : 1)// level2：设置为0.5-1
    this.color = '#c8c8cc'// 未点击线所连接的节点时线的颜色
    this.clickColor = '#7b7b99'// 点击此线所连接的节点后，线的颜色
    // this.width = 1//未点击线所连接的节点时线的宽度
    // this.arrowColor = '#c8c8cc'
    // this.clickArrowColor = '#7b7b99'
    // this.clickWidth = 1//点击节点后，此节点所连接的线的宽度
    this.level = level// 1:source为中心节点的线，是直线; 2:source为listNode节点的线，是直线; 3:target为临时节点的线，是虚线
  }
}

export const linkType = {
  normal: 'normal',
  temp: 'temp'
}
