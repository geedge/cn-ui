<template>
  <div class="entity-graph">
    <div class="entity-graph__chart" id="entityGraph" ></div>
    <div class="entity-graph__right-box">
      <el-drawer
          v-model="rightBox.show"
          direction="rtl"
          class="entity-graph__detail"
          :close-on-click-modal="true"
          :modal="false"
          :size="400"
          :with-header="false"
          destroy-on-close>
        <graph-entity-list
            v-if="rightBox.mode === 'list'"
            :node="rightBox.node"
            :loading="rightBox.loading"
            @expandList="expandList"
            @closeBlock="onCloseBlock"
        >
        </graph-entity-list>
        <graph-entity-detail
            v-else-if="rightBox.mode === 'detail'"
            :node="rightBox.node"
            :loading="rightBox.loading"
            @expandDetailList="expandDetailList"
            @closeBlock="onCloseBlock"
        >
        </graph-entity-detail>
      </el-drawer>
    </div>
  </div>
  <div id="toolbarContainer" class="graph-toolbar" style="height:50px;">
    <ul class="toolbar__tools">
      <li @click="handleToolsbarClick('zoomOut')" :title="$t('overall.zoomOut')"><i class="cn-icon cn-icon-zoom-out"></i></li>
      <li @click="handleToolsbarClick('zoomIn')" :title="$t('overall.zoomIn')"><i class="cn-icon cn-icon-zoom-in"></i></li>
      <li @click="handleToolsbarClick('autoZoom')" :title="$t('overall.autoZoom')"><i class="cn-icon cn-icon-reset"></i></li>
      <li @click="handleToolsbarClick('undo')" :title="$t('overall.preStep')" id="preStep" class="toolbar--unactivated"><i class="cn-icon cn-icon-pre-step"></i></li>
      <li @click="handleToolsbarClick('redo')" :title="$t('overall.nextStep')" id="nextStep" class="toolbar--unactivated"><i class="cn-icon cn-icon-next-step"></i></li>
      <li @click="handleToolsbarClick('toDefault')" :title="$t('overall.reset')"><i class="cn-icon cn-icon-to-default"></i></li>
    </ul>
  </div>
</template>

<script>
import GraphEntityList from '@/views/entityExplorer/entityGraph/GraphEntityList'
import GraphEntityDetail from '@/views/entityExplorer/entityGraph/GraphEntityDetail'
import { useRoute } from 'vue-router'
import { ref, shallowRef } from 'vue'
import ForceGraph from 'force-graph'
import { Algorithm } from '@antv/g6'
import * as d3 from 'd3'
import Node, { nodeType } from './entityGraph/node'
import Link, { linkType, linkDistance } from './entityGraph/link'
import { builtTooltip } from '@/views/entityExplorer/entityGraph/utils'
import _ from 'lodash'

export default {
  name: 'EntityRelationship',
  components: {
    GraphEntityList,
    GraphEntityDetail
  },
  data () {
    return {
      debounceFunc: null,
      center: {},
      initialData: null, // 初始化数据，用于重置
      nodes: [],
      links: [],
      graph: shallowRef(null),
      defaultChargeStrength: -50, // 之前的设置-20
      defaultLinkDistance: 80,
      defaultMargin: 2, // 图像与箭头的距离
      rootNode: null,
      isClicking: false,
      /* 自己实现stack操作 */
      stackData: {
        undo: [], // 后退
        justUndo: false, // 是否刚后退了
        redo: [], // 前进
        justRedo: false // 是否刚前进了
      }
    }
  },
  methods: {
    async init () {
      try {
        const initialData = await this.generateInitialData()
        this.initialData = _.cloneDeep(initialData) // 初始化数据
        let hoverNode = null
        let canvasHeight = document.body.clientHeight - 100
        this.graph = ForceGraph()(document.getElementById('entityGraph'))
          .height(canvasHeight)
          .graphData(initialData)
          .nodeCanvasObject((node, ctx) => {
            /*
            * 共有4种 nodeType，3种 entityType
            * */
            const nodeStyle = this.getNodeStyle(node.type, node.data.entityType)
            switch (node.type) {
              case nodeType.rootNode: {
                // 如果是鼠标点击高亮的，最外层加上第三层圆环
                if (node.id === this.clickNode.id) {
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, nodeStyle.selectedShadowR, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  ctx.fillStyle = nodeStyle.selectedShadowColor
                  ctx.fill()
                }

                // 第二层圆环
                ctx.beginPath()
                ctx.arc(node.x, node.y, nodeStyle.shadowR, 0, 2 * Math.PI, false)
                ctx.closePath()
                ctx.fillStyle = node === this.clickNode || node === hoverNode ?
                    nodeStyle.hoveredShadowColor :
                    nodeStyle.shadowColor
                ctx.fill()
                // 内部挖空
                ctx.beginPath()
                ctx.arc(node.x, node.y, nodeStyle.innerR, 0, 2 * Math.PI, false)
                ctx.closePath()
                ctx.fillStyle = nodeStyle.fillStyle
                ctx.fill()

                // 第一层圆环
                ctx.beginPath()
                ctx.arc(node.x, node.y, nodeStyle.innerR, 0, 2 * Math.PI, false)
                ctx.closePath()
                ctx.lineWidth = 1
                ctx.strokeStyle = nodeStyle.borderColor
                ctx.stroke()
                // 图片
                ctx.drawImage(node.img, node.x - nodeStyle.iconWidth / 2, node.y - nodeStyle.iconHeight / 2, nodeStyle.iconWidth, nodeStyle.iconHeight);
                // 文字
                ctx.font = nodeStyle.font
                const textWidth = ctx.measureText(node.label).width
                const bckgDimensions = [textWidth, 9].map(n => n + 9 * 0.2)
                ctx.fillStyle = nodeStyle.fontBgColor
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 + 31, ...bckgDimensions) // 文字的白底

                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = nodeStyle.fontColor
                ctx.fillText(node.label, node.x, node.y + 30)
                break
              }
              case nodeType.listNode: {
                // 如果是鼠标点击或者悬停的，有一层圆环
                if (node === this.clickNode || node === hoverNode) {
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, nodeStyle.shadowR, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  if (node === this.currentSelectedNode) {
                    ctx.fillStyle = nodeStyle.selectedShadowColor
                  } else {
                    ctx.fillStyle = nodeStyle.hoveredShadowColor
                  }
                  ctx.fill()
                }

                // 内部填白
                ctx.beginPath()
                ctx.arc(node.x, node.y, nodeStyle.innerR, 0, 2 * Math.PI, false)
                ctx.closePath()
                ctx.fillStyle = nodeStyle.fillStyle
                ctx.fill()

                // 第一层圆环
                ctx.beginPath()
                ctx.arc(node.x, node.y, nodeStyle.innerR, 0, 2 * Math.PI, false)
                ctx.closePath()
                ctx.lineWidth = 1
                ctx.strokeStyle = nodeStyle.borderColor
                ctx.stroke()
                // 图片
                ctx.drawImage(node.img, node.x - nodeStyle.iconWidth / 2, node.y - nodeStyle.iconHeight / 2, nodeStyle.iconWidth, nodeStyle.iconHeight)
                // 文字
                ctx.font = nodeStyle.font
                const textWidth = ctx.measureText(node.label).width
                const bckgDimensions = [textWidth, 8].map(n => n + 8 * 0.2)
                ctx.fillStyle = nodeStyle.fontBgColor
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 + 24, ...bckgDimensions) // 文字的白底

                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = nodeStyle.fontColor
                ctx.fillText(node.label, node.x, node.y + 24)
                break
              }
              case nodeType.entityNode: {
                // 先画个白底圆环，避免 link 穿过不好看
                ctx.beginPath()
                ctx.arc(node.x, node.y, nodeStyle.innerR, 0, 2 * Math.PI, false)
                ctx.closePath()
                ctx.fillStyle = nodeStyle.fillStyle
                ctx.fill()
                // 如果是鼠标点击或者悬停的，有一层圆环
                if (node === this.clickNode || node === hoverNode) {
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, nodeStyle.shadowR, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  if (node === this.clickNode) {
                    ctx.fillStyle = nodeStyle.selectedShadowColor
                  } else {
                    ctx.fillStyle = nodeStyle.hoveredShadowColor
                  }
                  ctx.fill()
                }
                // 图片
                ctx.drawImage(node.img, node.x - nodeStyle.iconWidth / 2, node.y - nodeStyle.iconHeight / 2, nodeStyle.iconWidth, nodeStyle.iconHeight)
                break
              }
              case nodeType.tempNode: {
                // 先画个白底圆环，避免 link 穿过不好看
                ctx.beginPath()
                ctx.arc(node.x, node.y, nodeStyle.innerR, 0, 2 * Math.PI, false)
                ctx.closePath()
                ctx.fillStyle = nodeStyle.fillStyle
                ctx.fill()
                // 画透明度0.7的图标
                ctx.globalAlpha = 0.7
                ctx.drawImage(node.img, node.x - nodeStyle.iconWidth / 2, node.y - nodeStyle.iconHeight / 2, nodeStyle.iconWidth, nodeStyle.iconHeight)
                ctx.globalAlpha = 1
                break
              }
            }
          })
          .linkCanvasObject((link, ctx) => {
            const start = link.source
            const end = link.target
            const width = 1 // 线宽
            const arrowSize = 3 // 箭头大小
            const shortenedLength = 20 // link 末端缩短长度

            // 计算箭头角度
            const dx = end.x - start.x
            const dy = end.y - start.y
            const angle = Math.atan2(dy, dx) // 计算与x轴的角度（弧度）
            const lineEndX = end.x - shortenedLength * Math.cos(angle)
            const lineEndY = end.y - shortenedLength * Math.sin(angle)
            const arrowEndX = lineEndX + arrowSize * Math.cos(angle)
            const arrowEndY = lineEndY + arrowSize * Math.sin(angle)

            // 绘制线
            let color
            ctx.beginPath()
            if (link.type === linkType.temp) {
              ctx.setLineDash([2, 2])
              color = 'rgba(119,131,145,0.2)' // 虚线颜色
            } else {
              ctx.setLineDash([])
              if (this.clickNode.id === link.source.id || this.clickNode.id === link.target.id) {
                color = 'rgba(119,131,145,0.8)' // 高亮线颜色
              } else {
                color = 'rgba(119,131,145,0.3)' // 普通线颜色
              }
            }
            ctx.moveTo(start.x, start.y)
            ctx.lineTo(lineEndX, lineEndY)
            ctx.strokeStyle = color
            ctx.lineWidth = width
            ctx.stroke()

            // 绘制箭头
            ctx.save() // 保存当前状态以便之后恢复
            ctx.translate(arrowEndX, arrowEndY) // 将坐标原点移动到箭头末端
            ctx.rotate(angle) // 根据链接方向旋转坐标系
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(-arrowSize, arrowSize) // 绘制箭头的一边
            ctx.lineTo(-arrowSize, -arrowSize) // 绘制箭头的另一边
            ctx.closePath()
            ctx.fillStyle = color
            ctx.fill()
            ctx.restore() // 恢复之前保存的状态
            /*if (link.source.x !== undefined && link.source.y !== undefined && link.target.x !== undefined && link.target.y !== undefined) {
              const nodeStyle = this.getNodeStyle(link.target.type, link.target.data.entityType)

              ctx.lineWidth = 0.5
              ctx.beginPath()
              if (this.clickNode && (this.clickNode.id === link.source.id || this.clickNode.id === link.target.id)) {
                ctx.strokeStyle = link.clickColor
              } else {
                ctx.strokeStyle = link.color
              }

              const lineDash = link.target.type === nodeType.tempNode ? [2, 2] : []
              ctx.setLineDash(lineDash)
              ctx.moveTo(link.source.x, link.source.y)
              const xy = this.findCircleLineIntersection(link.target.x, link.target.y, nodeStyle.innerR / 2, link.source.x, link.source.y)
              ctx.lineTo(xy[0].x, xy[0].y)
              this.drawArrow(ctx, link.source.x, link.source.y, xy[0].x, xy[0].y, 40, 3)

              // 圆角三角形
              if (this.clickNode && (this.clickNode.id === link.source.id || this.clickNode.id === link.target.id)) {
                ctx.fillStyle = link.clickColor
              } else {
                ctx.fillStyle = link.color
              }

              ctx.fill()
              ctx.closePath()
              ctx.stroke()
            }*/
          })
          .autoPauseRedraw(false) // keep redrawing after engine has stopped如果您有依赖于画布的不断重绘的自定义动态对象，建议关闭此选项。
          .onNodeHover(node => {
            hoverNode = node || null
            if (node) {
              node.name = builtTooltip(node)
            }
          })
          .centerAt(0, 0)// 设置中心节点位置
          .zoom(0.9999)
          .onNodeClick(async (node, e) => {
            this.isClicking = true
            this.clickNode = node || null
            if (node.type !== 'tempNode') {
              this.rightBox.show = true
              this.cleanTempItems()
              // 点击entityNode，查询数据，并根据数据生成tempNode
              if (node.type === nodeType.entityNode) {
                node.fx = node.x
                node.fy = node.y
                this.rightBox.loading = true
                try {
                  // 若已查过数据，不重复查询
                  if (!node.data.relatedEntities) {
                    await node.queryDetailData()
                  }
                  const toAddNodes = []
                  const toAddLinks = []
                  let keyCount = Object.keys(node.data.relatedEntities).length
                  Object.keys(node.data.relatedEntities).forEach((k,i) => {
                    if (node.data.relatedEntities[k].total) {
                      // 若已有同级同类型的listNode，不生成此tempNode
                      const neighbors = node.getNeighbors(this.graph.graphData())
                      const hasListNode = neighbors.nodes.some(b => b.data.entityType === k)
                      if (!hasListNode) {
                        const tempNode = new Node(
                          nodeType.tempNode,
                              `${node.realId}__${k}__temp`,
                              {
                                entityType: k,
                                ...this.generateTempNodeCoordinate(node.getSourceNode(this.graph.graphData()), e)
                              },
                              node,
                              this.getIconUrl(k, false, false)
                        )
                        //临时节点的初始固定坐标为其对应的entity节点坐标，展示直线动画
                        //tempNode.fx = node.x
                        //tempNode.fy = node.y
                        let tempNodePoint = this.pointOfRotate({x:node.sourceNode.x,y:node.sourceNode.y},{x:node.x,y:node.y},this.getTempNodeAngle(keyCount,i))//临时节点固定角度，为以entity节点为center，list节点为from，旋转到临时节点的角度
                        let finalTempNodePoint = this.pointOfLine({x:node.x,y:node.y},tempNodePoint,this.defaultLinkDistance)//start,end,lineLength
                        if(tempNodePoint.x && tempNodePoint.y) {
                          tempNode.fx = (node.x + finalTempNodePoint.x) / 2
                          tempNode.fy = (node.y + finalTempNodePoint.y) / 2
                        }

                        const tempLink = new Link(node, tempNode, linkType.temp)
                        toAddNodes.push(tempNode)
                        toAddLinks.push(tempLink)
                      }
                    }
                  })
                  if (toAddNodes.length || toAddLinks.length) {
                    this.addItems(toAddNodes, toAddLinks, false)
                  }
                  this.rightBox.node = node
                  this.rightBox.mode = 'detail'
                } catch (e) {
                  console.error(e)
                  this.$message.error(this.errorMsgHandler(e))
                } finally {
                  this.rightBox.loading = false
                }
              } else if (node.type === nodeType.listNode) {
                this.rightBox.node = node
                this.rightBox.mode = 'list'
              } else if (node.type === nodeType.rootNode) {
                this.rightBox.node = node
                this.rightBox.mode = 'detail'
              }
            } else {
              // 点击tempNode，根据source生成listNode和entityNode以及对应的edge。查完entityNode的接口再删除临时node和edge。
              // 若已达第六层，则只生成listNode，不再展开entityNode
              const nodes = []
              const links = []
              let stackNodes = []
              const stackLinks = []
              const sourceNode = node.getSourceNode(this.graph.graphData())
              const k1 = (node.x - sourceNode.x) / linkDistance.normal
              const k2 = (node.y - sourceNode.y) / linkDistance.normal
              const listNode = new Node(
                    nodeType.listNode,
                    `${sourceNode.realId}__${node.data.entityType}-list`,
                    {
                      entityType: node.data.entityType,
                      fx: sourceNode.x + k1 * linkDistance.entityToList,
                      fy: sourceNode.y + k2 * linkDistance.entityToList,
                    },
                    sourceNode,
                    this.getIconUrl(node.data.entityType, false, false)
              )
              nodes.push(listNode)
              links.push(new Link(sourceNode, listNode))
              stackNodes.push(_.cloneDeep(listNode))
              stackLinks.push(_.cloneDeep(links[0]))
              this.addItems(nodes, links, false)
              this.cleanTempItems()
              this.clickNode = listNode
              this.rightBox.mode = 'list'

              setTimeout(async () => {
                // 判断listNode的sourceNode层级，若大于等于10（即第6层listNode），则不继续拓展entity node，并给用户提示。否则拓展entity node
                const level = this.getNodeLevel(listNode.sourceNode.id)
                if (level < 10) {
                  this.rightBox.loading = true
                  nodes.splice(0, nodes.length)
                  links.splice(0, links.length)
                  try {
                    const entities = await sourceNode.queryRelatedEntities(listNode.data.entityType)
                    sourceNode.data.relatedEntities[listNode.data.entityType].list.push(...entities.list)
                    let curNodes = this.graph.graphData().nodes
                    entities.list.forEach(entity => {
                      const entityNode = new Node(nodeType.entityNode, entity.vertex, {
                        entityType: listNode.data.entityType,
                        entityName: entity.vertex,
                        x: listNode.x + Math.random() * 10 - 5,
                        y: listNode.y + Math.random() * 10 - 5
                      }, listNode, this.getIconUrl(listNode.data.entityType, false, false))
                      nodes.push(entityNode)
                      let link = new Link(listNode, entityNode)
                      links.push(link)
                      if(curNodes.findIndex(node => node.id === entityNode.id) === -1) {//过滤掉已有的节点
                        stackNodes.push(_.cloneDeep(entityNode))
                      }
                      stackLinks.push(_.cloneDeep(link))
                    })
                    this.addItems(nodes, links, false)
                    //由于点击临时节点后增加节点分为了2步，所以需要将2步的所有节点一起缓存
                    this.stackData.undo.push({nodes:stackNodes, links:stackLinks})

                    setTimeout(() => {
                      listNode.fx = null
                      listNode.fy = null
                      this.rightBox.node = _.cloneDeep(listNode)
                    }, 100)
                  } catch (e) {
                    console.error(e)
                    this.$message.error(this.errorMsgHandler(e))
                  } finally {
                    this.rightBox.loading = false
                  }
                } else {
                  this.$message.warning(this.$t('tip.maxExpandDepth'))
                }
                if (this.stackData.justUndo) {
                  this.stackData.justUndo = false
                  this.stackData.redo = []
                }
                if (this.stackData.justRedo) {
                  this.stackData.justRedo = false
                  this.stackData.redo = []
                }
              }, 200)
            }
          })

          .d3Force('link', d3.forceLink().id(link => link.id)
            .distance(link => {
              if (link.source.type === nodeType.rootNode) {
                return linkDistance.root
              } else if (link.source.type === nodeType.entityNode && link.target.type === nodeType.listNode) {
                return linkDistance.entityToList
              }
              return linkDistance.normal
            })
            .strength(link => {
              return link.strength
            }))// 设置线对点的力？
          .d3Force('center', d3.forceCenter().strength(0))// 设置力导图点阵中心位置, 向心力设置为0以后，d3.forceCenter(-50,-70)不起作用了
          .d3Force('charge', d3.forceManyBody().strength(this.defaultChargeStrength))
          .onNodeDrag((node, translate) => {
            const { nodes, links } = this.graph.graphData()
            //拖动entity节点时，如果此entity节点有临时节点，则同时移动临时节点
            if(node.type === nodeType.entityNode) {
              //查询点击entity节点对应的list节点
              let fromX = node.sourceNode.preDragX ? node.sourceNode.preDragX : node.sourceNode.x
              let fromY = node.sourceNode.preDragY ? node.sourceNode.preDragY : node.sourceNode.y
              let from = {x:fromX,y:fromY}
              let centerX = node.preDragX ? node.preDragX : node.x
              let centerY = node.preDragY ? node.preDragY : node.y
              let center = {x:centerX,y:centerY}

              const tempLinks = links.filter(link => link.source.id === node.id && link.type === linkType.temp)
              tempLinks.forEach(link => {
                const tempNodeGroup = nodes.filter(node => node.id === link.target.id)
                tempNodeGroup.forEach(tempNode => {
                  let toX = tempNode.fx ? tempNode.fx : tempNode.x
                  let toY = tempNode.fy ? tempNode.fy : tempNode.y
                  let to = {x:toX,y:toY}
                  if(!tempNode.angle) {//每次拖拽，每个临时节点计算一次角度即可，因为角度不会发生改变
                    tempNode.angle = this.angleOfRotate(from,to,center)
                  }

                  let toPoint = this.pointOfRotate({x: node.sourceNode.x, y: node.sourceNode.y}, {x:node.x + translate.x ,y:node.y + translate.y}, tempNode.angle)
                  //因为在拖拽的过长中，list节点到entity节点之间的距离是变化的，且我们要求的是，临时节点到entity节点之间的距离不发生变化，所以此处需要再次进行计算转换，得到最终的坐标
                  //已知2个点的坐标，求从起点开始指定长度线段的终点坐标
                  if(!tempNode.lineLength) {//每次拖拽，每个临时节点计算一次与实体节点的距离即可，因为距离在当前拖拽中不会发生改变
                    tempNode.lineLength = Math.sqrt(Math.pow(node.x - tempNode.fx,2) + Math.pow(node.y - tempNode.fy,2))
                  }
                  let finalTo = this.pointOfLine({x:node.x + translate.x ,y:node.y + translate.y},toPoint,tempNode.lineLength)
                  tempNode.fx = finalTo.x
                  tempNode.fy = finalTo.y
                })
              })
            }

            //拖动list节点时，如果此list节点对应的entity节点有临时节点，则同时移动临时节点
            if(node.type === nodeType.listNode) {
              //根据list节点，找到list节点连接的线
              const listLinks = links.filter(link => link.source.id === node.id)
              let fromX = node.preDragX ? node.preDragX : node.x
              let fromY = node.preDragY ? node.preDragY : node.y
              listLinks.forEach(link => {
                //找到连接临时节点的虚线
                const tempLinks = links.filter(entityLink => entityLink.source.id === link.target.id && entityLink.type === linkType.temp)
                if(tempLinks && tempLinks.length > 0) {
                  tempLinks.forEach(tempLink => {
                    //找到entity节点
                    const entityNode = nodes.find(normalNode => normalNode.id === tempLink.source.id && normalNode.type === nodeType.entityNode)
                    if(entityNode) {
                      let entityNodeX = entityNode.fx ? entityNode.fx : entityNode.x
                      let entityNodeY = entityNode.fy ? entityNode.fy : entityNode.y
                      let angle = this.angleOfRotate({x:fromX,y:fromY},{x:node.x + translate.x,y:node.y + translate.y},{x:entityNodeX,y:entityNodeY})
                      const tempNodes = nodes.filter(normalNode => normalNode.id === tempLink.target.id && normalNode.type === nodeType.tempNode)//找到临时节点
                      tempNodes.forEach(tempNode => {
                        let tempNodeX = tempNode.fx ? tempNode.fx : tempNode.x
                        let tempNodeY = tempNode.fy ? tempNode.fy : tempNode.y
                        let sourceNodeX = tempLink.source.fx ? tempLink.source.fx : tempLink.source.x
                        let sourceNodeY = tempLink.source.fy ? tempLink.source.fy : tempLink.source.y
                        //rotate为list节点旋转的角度，根据旋转角度，及临时节点的位置，及entity节点的坐标，得到临时节点旋转后的坐标
                        let to = this.pointOfRotate({x:tempNodeX, y:tempNodeY}, {x:sourceNodeX,y:sourceNodeY}, angle)
                        tempNode.fx = to.x
                        tempNode.fy = to.y
                      })
                    }
                  })
                }
              })
            }
            //记录上次拖拽时节点的坐标，否则计算时出现误差。
            node.preDragX = node.x + translate.x
            node.preDragY = node.y + translate.y
          })
          .cooldownTime(2000)//到时间后，才执行onEngineStop
          .onNodeDragEnd((node, translate) => { // 修复拖动节点
            node.fx = node.x
            node.fy = node.y
            //拖拽结束时，把所有临时节点的的angle置为null,便于拖动其它节点时的计算
            this.graph.graphData().nodes.forEach(node => {
              if(node.type === nodeType.tempNode) {
                node.angle = null
                node.lineLength = null
              }
            })
          })
          .onEngineTick(() => {
            if(this.isClicking) {
              const tempNodeGroup = this.graph.graphData().nodes.filter(node => node.type === nodeType.tempNode)
              if(tempNodeGroup.length > 0) {
                let keyCount = tempNodeGroup.length
                tempNodeGroup.forEach((tempNode,i) => {
                  let tempNodeSource = tempNode.sourceNode
                  if(tempNodeSource) {
                    let tempNodePoint = this.pointOfRotate({x:tempNodeSource.sourceNode.x,y:tempNodeSource.sourceNode.y},{x:tempNodeSource.x,y:tempNodeSource.y},this.getTempNodeAngle(keyCount,i))//临时节点固定角度，为以entity节点为center，list节点为from，旋转到临时节点的角度
                    let finalTempNodePoint = this.pointOfLine({x:tempNodeSource.x,y:tempNodeSource.y},tempNodePoint,this.defaultLinkDistance)//start,end,lineLength
                    if(tempNodePoint.x && tempNodePoint.y) {
                      tempNode.fx = finalTempNodePoint.x
                      tempNode.fy = finalTempNodePoint.y
                    }
                  }
                })
                this.isClicking = false
              }
            }
          })
      } catch (e) {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      } finally {
        this.rightBox.loading = false
      }
    },
    getTempNodeAngle(nodeCount,i) {
      switch (nodeCount) {
        case 1:
          return 180
        case 2:
          return 150 + i*60
        case 3:
          return 150 + i*30
      }
    },
    //根据3个点坐标，计算节点旋转的角度
    angleOfRotate(from, to, center) {
      let ab = {}
      let ac = {}
      ab.x = from.x - center.x
      ab.y = from.y - center.y
      ac.x = to.x - center.x
      ac.y = to.y - center.y
      let direct = (ab.x * ac.y) - (ab.y * ac.x)//求节点是顺时针还是逆时针旋转
      let lengthAb = Math.sqrt(Math.pow(center.x - from.x,2) + Math.pow(center.y - from.y,2)),
          lengthAc = Math.sqrt(Math.pow(center.x - to.x,2) + Math.pow(center.y - to.y,2)),
          lengthBc = Math.sqrt(Math.pow(from.x - to.x,2) + Math.pow(from.y - to.y,2))
      let cosA = (Math.pow(lengthAb,2) + Math.pow(lengthAc,2) - Math.pow(lengthBc,2)) / (2 * lengthAb * lengthAc)//余弦定理求出旋转角
      let angleA = Math.acos(cosA) * 180 / Math.PI
      if(direct < 0) {//负数表示逆时针旋转,正数表示顺时针旋转
        angleA = -angleA
      }
      return angleA
    },
    // from: 圆上某点(初始点);
    // center: 圆心点;
    // angle: 旋转角度°  -- [angle * M_PI / 180]:将角度换算为弧度
    // 【注意】angle 逆时针为正，顺时针为负
    pointOfRotate(from,center,angle){
      var a = center.x
      var b = center.y
      var x0 = from.x
      var y0 = from.y
      var rx = a + (x0-a) * Math.cos(angle * Math.PI / 180) - (y0-b) * Math.sin(angle * Math.PI / 180)
      var ry = b + (x0-a) * Math.sin(angle * Math.PI / 180) + (y0-b) * Math.cos(angle * Math.PI / 180)
      if(rx && ry) {
        return {x:rx,y:ry}
      } else {
        return from
      }
    },
    //已知2个点的坐标，求从起点开始指定长度线段的终点坐标
    pointOfLine(start, end, lineLength) {
      // 计算总距离
      let totalDistance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      let cosA = (end.x - start.x)/totalDistance
      let sinA = (end.y - start.y) / totalDistance
      let finalX = start.x + cosA * lineLength
      let finalY = start.y + sinA * lineLength

      return {x:finalX, y:finalY}
    },
    handleToolsbarClick (code) {
      if (code === 'undo') {//上一步
        const data = this.stackData.undo.pop()
        this.stackData.justUndo = true
        if(data) {
          const { nodes, links } = this.graph.graphData()
          data.nodes.forEach(popNode => {
            const popNodeIndex = nodes.findIndex(item => item.id === popNode.id)
            if (popNodeIndex > -1) {
              nodes.splice(popNodeIndex,1)
            }
          })
          data.links.forEach(link => {
            const linksIndex = links.findIndex(item => item.source.id === link.source && item.target.id === link.target)
            if (linksIndex > -1) {
              links.splice(linksIndex,1)
            }
          })
          this.cleanTempItems()
          this.stackData.redo.push(data)
          if (this.stackData.justRedo) {
            this.stackData.justRedo = false
          }
          this.onCloseBlock()
        }
      } else if (code === 'redo') {//下一步
        const data = this.stackData.redo.pop()
        if(data) {
          this.stackData.justRedo = true
          this.addItems(data.nodes, data.links)
          this.cleanTempItems()
          if (this.stackData.justUndo) {
            this.stackData.justUndo = false
          }
          this.onCloseBlock()
        }
      } else if (code === 'autoZoom') {
        this.graph.zoomToFit(100,100)
      } else if (code === 'zoomOut') {
        this.graph.zoom(this.graph.zoom() + 0.2)
      } else if (code === 'zoomIn') {
        this.graph.zoom(this.graph.zoom() - 0.2)
      } else {
        this.clickNode = this.rootNode
        this.stackData = {
          undo: [],
          redo: [],
          justUndo: false,
          justRedo: false
        }
        this.graph.graphData(_.cloneDeep(this.initialData)).centerAt(0, 0).zoom(0.9999)
        this.rightBox.show = true
        this.rightBox.node = this.rootNode
        this.rightBox.mode = 'detail'
      }
    },

    getNodeStyle (curNodeType, entityType) {
      switch (curNodeType) {
        case nodeType.rootNode: {
          return this.getRootNodeStyle(entityType)
        }
        case nodeType.listNode: {
          return this.getListNodeStyle(entityType)
        }
        case nodeType.entityNode: {
          return this.getEntityNodeStyle(entityType)
        }
        case nodeType.tempNode: {
          return this.getEntityNodeStyle(entityType)
        }
      }
    },
    getRootNodeStyle (entityType) {
      const nodeStyle = {
        innerR: 19,
        fillStyle: '#FFFFFF',
        shadowR: 25,
        selectedShadowR: 36,
        font: '9px NotoSansSChineseRegular',
        fontColor: '#353636',
        fontBgColor: 'rgba(255,255,255,0.8)'
      }
      switch (entityType) {
        case 'ip': {
          return {
            ...nodeStyle,
            iconWidth: 24,
            iconHeight: 21,
            borderColor: 'rgba(126,159,84,1)',
            shadowColor: 'rgba(126,159,84,0.21)',
            hoveredShadowColor: 'rgba(126,159,84,0.36)',
            selectedShadowColor: 'rgba(126,159,84,0.1)'
          }
        }
        case 'domain': {
          return {
            ...nodeStyle,
            iconWidth: 24,
            iconHeight: 24,
            borderColor: 'rgba(56,172,210,1)',
            shadowColor: 'rgba(56,172,210,0.21)',
            hoveredShadowColor: 'rgba(56,172,210,0.36)',
            selectedShadowColor: 'rgba(56,172,210,0.1)'
          }
        }
        case 'app': {
          return {
            ...nodeStyle,
            iconWidth: 21,
            iconHeight: 24,
            borderColor: 'rgba(229,162,25,1)',
            shadowColor: 'rgba(229,162,25,0.21)',
            hoveredShadowColor: 'rgba(229,162,25,0.36)',
            selectedShadowColor: 'rgba(229,162,25,0.1)'
          }
        }
      }
      return {
        ...nodeStyle,
        iconWidth: 24,
        iconHeight: 21,
        borderColor: 'rgba(126,159,84,1)',
        shadowColor: 'rgba(126,159,84,0.21)',
        hoveredShadowColor: 'rgba(126,159,84,0.36)',
        selectedShadowColor: 'rgba(126,159,84,0.1)'
      }
    },
    getListNodeStyle (entityType) {
      let iconWidth = 20
      let iconHeight = 18
      switch (entityType) {
        case 'ip': {
          iconWidth = 20
          iconHeight = 18
          break
        }
        case 'domain': {
          iconWidth = 20
          iconHeight = 20
          break
        }
        case 'app': {
          iconWidth = 18
          iconHeight = 20
          break
        }
      }
      return {
        innerR: 16,
        shadowR: 22,
        fillStyle: '#FFFFFF',
        font: '9px NotoSansSChineseRegular',
        fontColor: '#353636',
        fontBgColor: 'rgba(255,255,255,0.8)',
        iconWidth,
        iconHeight,
        borderColor: 'rgba(119,131,145,0.5)',
        selectedBorderColor: 'rgba(119,131,145,0.8)',
        hoveredShadowColor: 'rgba(151,151,151,0.21)',
        selectedShadowColor: 'rgba(151,151,151,0.4)'
      }
    },
    getEntityNodeStyle (entityType) {
      let iconWidth = 20
      let iconHeight = 18
      switch (entityType) {
        case 'ip': {
          iconWidth = 20
          iconHeight = 18
          break
        }
        case 'domain': {
          iconWidth = 20
          iconHeight = 20
          break
        }
        case 'app': {
          iconWidth = 18
          iconHeight = 20
          break
        }
      }
      return {
        shadowR: 15,
        innerR: 10,
        fillStyle: '#FFFFFF',
        iconWidth,
        iconHeight,
        hoveredShadowColor: 'rgba(151,151,151,0.12)',
        selectedShadowColor: 'rgba(151,151,151,0.24)'
      }
    },
    /**
     * 求直线与圆的交点坐标
     * 圆：x2, y2, r
     * 线段： x1, y1, x2, y2
     * */
    findCircleLineIntersection (x2, y2, r, x1, y1) {
      r = r + +this.defaultMargin
      const xx = x1 - x2
      const yy = y1 - y2
      let n = Math.sqrt(Math.pow(r, 2) / [Math.pow(yy / xx, 2) + 1])
      let m = Math.sqrt(Math.pow(r, 2) - Math.pow(n, 2))
      if (xx > 0) {
        if (yy > 0) { // 第四象限

        } else { // 第一象限
          m *= -1
        }
      } else {
        n *= -1
        if (yy > 0) { // 第三象限

        } else { // 第二象限
          m *= -1
        }
      }
      const x = x2 + n
      const y = y2 + m
      return [{ x, y }]
    },
    /**
     ctx ：Canvas绘图环境
     fromX, fromY ：起点坐标（也可以换成 p1 ，只不过它是一个数组）
     toX, toY ：终点坐标 (也可以换成 p2 ，只不过它是一个数组)
     theta ：三角斜边一直线夹角
     headlen ：三角斜边长度
     width ：箭头线宽度
     color ：箭头颜色
     */
    drawArrow (ctx, fromX, fromY, toX, toY, theta, headlen) {
      theta = typeof (theta) != 'undefined' ? theta : 30
      headlen = typeof (theta) != 'undefined' ? headlen : 10

      // 计算各角度和对应的P2,P3坐标
      const angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI
      const angle1 = (angle + theta) * Math.PI / 180
      const angle2 = (angle - theta) * Math.PI / 180
      const topX = headlen * Math.cos(angle1)
      const topY = headlen * Math.sin(angle1)
      const botX = headlen * Math.cos(angle2)
      const botY = headlen * Math.sin(angle2)

      let arrowX = fromX - topX
      let arrowY = fromY - topY

      arrowX = toX + topX
      arrowY = toY + topY
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(toX, toY)
      arrowX = toX + botX
      arrowY = toY + botY
      ctx.lineTo(arrowX, arrowY)
      ctx.lineTo(toX + topX, toY + topY)
    },
    getNodeLevel (id) {
      return 5
      const { findShortestPath } = Algorithm
      const { nodes, links } = this.graph.graphData()
      const g6FormatData = { nodes: _.cloneDeep(nodes), edges: _.cloneDeep(links) }
      g6FormatData.edges.forEach(l => {
        l.source = l.source.id
        l.target = l.target.id
      })
      const info = findShortestPath(g6FormatData, this.entity.entityName, id)
      return info.length
    },
    generateTempNodeCoordinate (sourceNode, event) {
      const sx = sourceNode.x
      const sy = sourceNode.y
      const cx = event.x
      const cy = event.y
      return {
        x: cx + cx - sx + Math.random() * 30 - 15,
        y: cy + cy - sy + Math.random() * 30 - 15
      }
    },
    addItems (toAddNodes, toAddLinks,stack = true) {
      if (toAddNodes.length || toAddLinks.length) {
        const { nodes, links } = this.graph.graphData()
        const nodes2 = toAddNodes.filter(n => !nodes.some(n2 => n.id === n2.id))
        nodes.push(...nodes2)
        links.push(...toAddLinks)
        this.graph.graphData({ nodes, links })

        if(stack) {
          this.stackData.undo.push(_.cloneDeep({nodes:nodes2, links:toAddLinks}))
        }
      }
    },
    cleanTempItems () {
      const { nodes, links } = this.graph.graphData()
      const newNodes = nodes.filter(n => n.type !== nodeType.tempNode)
      const newLinks = links.filter(l => l.type !== linkType.temp)
      if (newNodes.length !== nodes.length || newLinks.length !== links.length) {
        this.graph.graphData({ nodes: newNodes, links: newLinks })
      }
      //清理临时节点时，同时释放临时节点对应的entity节点,不再固定位置
      const tempNodes = nodes.filter(n => n.type === nodeType.tempNode)
      tempNodes.forEach(n => {
        if(n.sourceNode) {
          n.sourceNode.fx = null
          n.sourceNode.fy = null
        }
      })
      //点击节点的时候，把所有list节点的的preDragX和preDragY置为null,便于拖动其它节点时的计算
      nodes.forEach(node => {
        //if(node.type === nodeType.listNode) {
          node.preDragX = null
          node.preDragY = null
        //}
      })
    },
    async generateInitialData (clickNode) {
      const nodes = []
      const links = []

      const rootNode = clickNode || new Node(nodeType.rootNode, this.entity.entityName, this.entity, null, this.getIconUrl(this.entity.entityType, true, true))
      await rootNode.queryDetailData()
      nodes.push(rootNode)
      this.clickNode = rootNode
      this.rootNode = rootNode

      // 生成listNode和entityNode及edge
      if (rootNode.data.relatedEntities) {
        // listNode
        const listNodes = []
        const keys = Object.keys(rootNode.data.relatedEntities)
        keys.forEach(k => {
          if (rootNode.data.relatedEntities[k].total) {
            const listNode = new Node(
              nodeType.listNode,
              `${rootNode.realId}__${k}-list`,
              {
                entityType: k
              },
              rootNode,
              this.getIconUrl(k, false, false)
            )
            listNodes.push(listNode)
            links.push(new Link(rootNode, listNode))
          }
        })
        // entityNode
        const entityNodes = []
        for (const listNode of listNodes) {
          const entities = await rootNode.queryRelatedEntities(listNode.data.entityType)
          rootNode.data.relatedEntities[listNode.data.entityType].list = entities.list
          entities.list.forEach(entity => {
            const entityNode = new Node(
              nodeType.entityNode,
              entity.vertex,
              {
                entityType: listNode.data.entityType,
                entityName: entity.vertex
              },
              listNode,
              this.getIconUrl(listNode.data.entityType, false, false)
            )
            entityNodes.push(entityNode)
            links.push(new Link(listNode, entityNode))
          })
        }
        nodes.push(...listNodes, ...entityNodes)
      }
      this.rightBox.node = rootNode
      return {
        nodes,
        links
      }
    },
    async expandList (nodeId) {
      const { nodes } = this.graph.graphData()
      const node = nodes.find(n => n.id === nodeId)
      const sourceNode = nodes.find(n => n.id === node.sourceNode.id)
      const expandType = node.data.entityType
      if (sourceNode.data.relatedEntities[expandType].list.length >= sourceNode.data.relatedEntities[expandType].total) {
        return
      }
      if (sourceNode.data.relatedEntities[expandType].list.length < 50) {
        //this.rightBox.loading = true
        try {
          const entities = await sourceNode.queryRelatedEntities(expandType)
          sourceNode.data.relatedEntities[expandType].list.push(...entities.list)
          const toAddNodes = []
          const toAddLinks = []
          entities.list.forEach(entity => {
            const toAddNode = new Node(nodeType.entityNode, entity.vertex, {
              entityType: expandType,
              entityName: entity.vertex
            }, node, this.getIconUrl(node.data.entityType, false, false))
            toAddNodes.push(toAddNode)

            const toAddLink = new Link(node, toAddNode)
            toAddLinks.push(toAddLink)
          })
          this.addItems(toAddNodes, toAddLinks)
          this.rightBox.node = _.cloneDeep(node)
        } catch (e) {
          console.error(e)
          this.$message.error(this.errorMsgHandler(e))
        } finally {
          this.rightBox.loading = false
        }
      } else {
        this.$message.warning(this.$t('tip.maxExpandCount'))
      }
    },
    async expandDetailList (nodeId, expandType) {
      const { nodes } = this.graph.graphData()
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        if (node.data.relatedEntities[expandType].list.length >= node.data.relatedEntities[expandType].total) {
          return
        }
        if (node.data.relatedEntities[expandType].list.length < 50) {
          const toAddNodes = []
          const toAddLinks = []

          //this.rightBox.loading = true
          try {
            const entities = await node.queryRelatedEntities(expandType)
            node.data.relatedEntities[expandType].list.push(...entities.list)
            // 移除 tempNode 和 tempEdge
            this.cleanTempItems()

            const neighbors = node.getNeighbors(this.graph.graphData())
            let listNode = neighbors.targetNodes.find(n => n.data.entityType === expandType)
            if (!listNode) {
              listNode = new Node(nodeType.listNode, `${node.id}__${expandType}-list`, { entityType: expandType }, node, this.getIconUrl(expandType, false, false))
              const link = new Link(node, listNode)
              toAddNodes.push(listNode)
              toAddLinks.push(link)
            }
            entities.list.forEach(entity => {
              const entityNode = new Node(nodeType.entityNode, entity.vertex, {
                entityType: expandType,
                entityName: entity.vertex
              }, listNode, this.getIconUrl(expandType, false, false))
              toAddNodes.push(entityNode)
              toAddLinks.push(new Link(listNode, entityNode))
            })
            this.addItems(toAddNodes, toAddLinks)
            this.rightBox.node = _.cloneDeep(node)
          } catch (e) {
            console.error(e)
            this.$message.error(this.errorMsgHandler(e))
          } finally {
            this.rightBox.loading = false
          }
        } else {
          this.$message.warning(this.$t('tip.maxExpandCount'))
        }
      }
    },
    onCloseBlock () {
      this.rightBox.mode = ''
      this.rightBox.show = false
    },
    resize () {

    },
    getIconUrl (entityType, colored, isRoot) {
      const suffix = colored ? '-colored' : ''
      const img = new Image()
      img.src = require(`@/assets/img/entity-symbol2/${entityType}${suffix}.svg`)
      return img
    }
  },
  watch: {
    stackData: {
      deep: true,
      handler (n) {
        if (n) {
          if (n.undo.length > 0) {
            document.getElementById('preStep').classList.remove('toolbar--unactivated')
          } else {
            document.getElementById('preStep').classList.add('toolbar--unactivated')
          }
          if (n.redo.length > 0) {
            document.getElementById('nextStep').classList.remove('toolbar--unactivated')
          } else {
            document.getElementById('nextStep').classList.add('toolbar--unactivated')
          }
        }
      }
    }
  },
  async mounted () {
    if (this.entity.entityType && this.entity.entityName) {
      await this.init()
      this.debounceFunc = this.$_.debounce(this.resize, 300)
      window.addEventListener('resize', this.debounceFunc)
    }
  },
  unmounted () {
    window.removeEventListener('resize', this.debounceFunc)
  },
  setup () {
    const route = useRoute()
    const { entityType, entityName } = route.query
    const entity = {
      entityType,
      entityName
    }
    // 关系图
    const graph = shallowRef(null)

    const rightBox = ref({
      mode: 'detail', // list | detail
      show: true,
      node: null,
      loading: true
    })
    return {
      entity,
      rightBox,
      graph
    }
  }
}
</script>
