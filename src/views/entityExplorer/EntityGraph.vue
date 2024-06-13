<template>
  <div class="entity-graph">
    <div class="entity-graph__chart" id="entityGraph"></div>
    <div class="entity-graph__right-box">
      <el-drawer
          v-model="rightBox.show"
          direction="rtl"
          custom-class="entity-graph__detail"
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
</template>

<script>
import GraphEntityList from '@/views/entityExplorer/entityGraph/GraphEntityList'
import GraphEntityDetail from '@/views/entityExplorer/entityGraph/GraphEntityDetail'
import { useRoute } from 'vue-router'
import { ref, shallowRef } from 'vue'
import ForceGraph from 'force-graph'
import * as d3 from 'd3'
import Node, {nodeType, queryRelatedEntity} from './entityGraph/node'
import testData from './testData'
import _ from 'lodash'
import Link from './entityGraph/link'
import Edge from '@/views/entityExplorer/entityGraph/edge'
import {Algorithm} from '@antv/g6'

function getRootNodeStyle (entityType) {
  switch (entityType) {
    case 'ip': {
      return {
        iconWidth: 16,
        iconHeight: 13,
        borderColor: 'rgba(126,159,84,1)',
        shadowColor: 'rgba(126,159,84,0.21)',
        hoveredShadowColor: 'rgba(126,159,84,0.36)',
        selectedShadowColor: 'rgba(126,159,84,0.1)'
      }
    }
    case 'domain': {
      return {
        iconWidth: 16,
        iconHeight: 16,
        borderColor: 'rgba(56,172,210,1)',
        shadowColor: 'rgba(56,172,210,0.21)',
        hoveredShadowColor: 'rgba(56,172,210,0.36)',
        selectedShadowColor: 'rgba(56,172,210,0.1)'
      }
    }
    case 'app': {
      return {
        iconWidth: 14,
        iconHeight: 16,
        borderColor: 'rgba(229,162,25,1)',
        shadowColor: 'rgba(229,162,25,0.21)',
        hoveredShadowColor: 'rgba(229,162,25,0.36)',
        selectedShadowColor: 'rgba(229,162,25,0.1)'
      }
    }
  }
  return {
    iconWidth: 16,
    iconHeight: 13,
    borderColor: 'rgba(126,159,84,1)',
    shadowColor: 'rgba(126,159,84,0.21)',
    hoveredShadowColor: 'rgba(126,159,84,0.36)',
    selectedShadowColor: 'rgba(126,159,84,0.1)'
  }
}
function getListNodeStyle (entityType) {
  let iconWidth = 14
  let iconHeight = 12
  switch (entityType) {
    case 'ip': {
      iconWidth = 14
      iconHeight = 12
      break
    }
    case 'domain': {
      iconWidth = 14
      iconHeight = 14
      break
    }
    case 'app': {
      iconWidth = 12
      iconHeight = 14
      break
    }
  }
  return {
    iconWidth,
    iconHeight,
    borderColor: 'rgba(119,131,145,0.5)',
    selectedBorderColor: 'rgba(119,131,145,0.8)',
    hoveredShadowColor: 'rgba(151,151,151,0.21)',
    selectedShadowColor: 'rgba(151,151,151,0.4)'
  }
}
function getEntityNodeStyle (entityType) {
  let iconWidth = 14
  let iconHeight = 12
  switch (entityType) {
    case 'ip': {
      iconWidth = 14
      iconHeight = 12
      break
    }
    case 'domain': {
      iconWidth = 14
      iconHeight = 14
      break
    }
    case 'app': {
      iconWidth = 12
      iconHeight = 14
      break
    }
  }
  return {
    iconWidth,
    iconHeight,
    hoveredShadowColor: 'rgba(151,151,151,0.12)',
    selectedShadowColor: 'rgba(151,151,151,0.24)'
  }
}
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
      initialData: null // 初始化数据，用于重置
    }
  },
  methods: {
    async init () {
      try {
        const initialData = await this.generateInitialData()
        this.initialData = _.cloneDeep(initialData) // 初始化数据
        this.graph = ForceGraph()(document.getElementById('entityGraph'))
            .graphData(this.initialData)
            .nodeRelSize(16)
            .onNodeClick(async node => {
              if (this.currentSelectedNode !== node) {
                // 控制节点的选中状态
                if (node === this.currentHoveredNode) {
                  this.currentHoveredNode = null
                }
                this.currentSelectedNode = node

                switch (node.type) {
                  /* node 是 entityNode，则查接口展开 tempNode */
                  case nodeType.entityNode: {
                    // 先清除 tempNode 和 tempLink
                    this.cleanTempItems()
                    // 若已查过数据，不重复查询
                    if (!node.myData.relatedEntities) {
                      await node.queryDetailData()
                    }
                    // 生成 tempNode 和 tempLink
                    const tempNodes = []
                    const tempLinks = []
                    const { sourceNodes, targetNodes } = this.getNeighborItems(node)
                    Object.keys(node.myData.relatedEntities).forEach(k => {
                      if (node.myData.relatedEntities[k].total) {
                        // 若已有同级同类型的 listNode，不生成此 tempNode
                        const hasListNode = targetNodes.some(b => b.myData.entityType === k)
                        if (!hasListNode) {
                          const tempNode = new Node(
                              nodeType.tempNode,
                              `${node.id}__${k}__temp`,
                              {
                                entityType: k
                              },
                              node
                          )
                          const tempLink = new Link(node, tempNode, 'temp')
                          tempNodes.push(tempNode)
                          tempLinks.push(tempLink)
                        }
                      }
                    })
                    if (tempNodes.length) {
                      node.fx = node.x
                      node.fy = node.y
                      this.addItems(tempNodes, tempLinks)
                    }
                    this.rightBox.node = node
                    this.rightBox.mode = 'detail'
                    break
                  }
                  case nodeType.listNode: {
                    this.rightBox.node = node
                    this.rightBox.mode = 'list'
                    break
                  }
                  case nodeType.rootNode: {
                    this.rightBox.node = node
                    this.rightBox.mode = 'detail'
                    break
                  }
                  /* node 是 entityNode，则查接口展开 tempNode */
                  case nodeType.tempNode: {
                    // 点击 tempNode，根据 source 生成 listNode 以及对应的 link
                    const nodes = []
                    const links = []
                    const listNode = new Node(
                        nodeType.listNode,
                        `${node.sourceNode.id}__${node.myData.entityType}-list`,
                        {
                          entityType: node.myData.entityType
                        },
                        node.sourceNode
                    )
                    nodes.push(listNode)
                    links.push(new Link(node.sourceNode, listNode))

                    // 若未达第六层，为新的 listNode 生成 entityNode 和 link
                    const level = this.getNodeLevel(listNode.sourceNode.id)
                    if (level < 10) {
                      this.rightBox.loading = true
                      try {
                        const entities = await queryRelatedEntity(node.sourceNode, listNode.myData.entityType)
                        this.pushRelatedEntities(node, entities.list)

                        entities.list.forEach(entity => {
                          const entityNode = new Node(nodeType.entityNode, entity.vertex, {
                            entityType: listNode.myData.entityType,
                            entityName: entity.vertex
                          }, listNode)
                          nodes.push(entityNode)
                          links.push(new Link(listNode, entityNode))
                        })
                      } catch (e) {
                        this.$message.error(this.errorMsgHandler(e))
                      } finally {
                        this.rightBox.loading = false
                      }
                    } else {
                      this.$message.warning(this.$t('tip.maxExpandDepth'))
                    }

                    // 查完 entityNode 的接口再删除 tempNode 和 tempEdge
                    this.addItems(nodes, links)
                    this.cleanTempItems()
                    // 手动高亮listNode

                    break
                  }
                }
              }
              // 若 node 未拖拽过，取消固定位置
              if (this.draggedNodes.indexOf(node.id) === -1) {
                node.fx = null
                node.fy = null
              }
            })
            .onNodeHover(node => {
              if (!node) {
                this.currentHoveredNode = null
              } else if (node !== this.currentSelectedNode) {
                this.currentHoveredNode = node || null
              }
            })
            .onNodeDragEnd(node => {
              this.draggedNodes.push(node.id)
            })
            .autoPauseRedraw(false)
            .nodeCanvasObject((node, ctx) => {
              /*
              * 共有4种 nodeType，3种 entityType
              * */
              switch (node.type) {
                case nodeType.rootNode: {
                  const nodeStyle = getRootNodeStyle(node.myData.entityType)
                  // 如果是鼠标点击高亮的，最外层加上第三层圆环
                  if (node === this.currentSelectedNode) {
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, 24, 0, 2 * Math.PI, false)
                    ctx.closePath()
                    ctx.fillStyle = nodeStyle.selectedShadowColor
                    ctx.fill()
                  }

                  // 第二层圆环
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  ctx.fillStyle = node === this.currentSelectedNode || node === this.currentHoveredNode ?
                      nodeStyle.hoveredShadowColor :
                      nodeStyle.shadowColor
                  ctx.fill()
                  // 内部挖空
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  ctx.fillStyle = 'white'
                  ctx.fill()

                  // 第一层圆环
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  ctx.lineWidth = 1
                  ctx.strokeStyle = nodeStyle.borderColor
                  ctx.stroke()
                  // 图片
                  ctx.drawImage(node.img, node.x - nodeStyle.iconWidth / 2, node.y - nodeStyle.iconHeight / 2, nodeStyle.iconWidth, nodeStyle.iconHeight);
                  // 文字
                  ctx.font = '8px NotoSansSChineseRegular'
                  const textWidth = ctx.measureText(node.label).width
                  const bckgDimensions = [textWidth, 8].map(n => n + 8 * 0.2)
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
                  ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 + 21, ...bckgDimensions) // 文字的白底

                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'middle'
                  ctx.fillStyle = '#353636'
                  ctx.fillText(node.label, node.x, node.y + 21)
                  break
                }
                case nodeType.listNode: {
                  const nodeStyle = getListNodeStyle(node.myData.entityType)
                  // 如果是鼠标点击或者悬停的，有一层圆环
                  if (node === this.currentSelectedNode || node === this.currentHoveredNode) {
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI, false)
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
                  ctx.arc(node.x, node.y, 11, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  ctx.fillStyle = 'white'
                  ctx.fill()

                  // 第一层圆环
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, 11, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  ctx.lineWidth = 1
                  ctx.strokeStyle = nodeStyle.borderColor
                  ctx.stroke()
                  // 图片
                  ctx.drawImage(node.img, node.x - nodeStyle.iconWidth / 2, node.y - nodeStyle.iconHeight / 2, nodeStyle.iconWidth, nodeStyle.iconHeight)
                  // 文字
                  ctx.font = '8px NotoSansSChineseRegular'
                  const textWidth = ctx.measureText(node.label).width
                  const bckgDimensions = [textWidth, 8].map(n => n + 8 * 0.2)
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
                  ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 + 18, ...bckgDimensions) // 文字的白底

                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'middle'
                  ctx.fillStyle = '#353636'
                  ctx.fillText(node.label, node.x, node.y + 18)
                  break
                }
                case nodeType.entityNode: {
                  const nodeStyle = getEntityNodeStyle(node.myData.entityType)
                  // 先画个白底圆环，避免 link 穿过不好看
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  ctx.fillStyle = '#fff'
                  ctx.fill()
                  // 如果是鼠标点击或者悬停的，有一层圆环
                  if (node === this.currentSelectedNode || node === this.currentHoveredNode) {
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false)
                    ctx.closePath()
                    if (node === this.currentSelectedNode) {
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
                  const nodeStyle = getEntityNodeStyle(node.myData.entityType)
                  // 先画个白底圆环，避免 link 穿过不好看
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false)
                  ctx.closePath()
                  ctx.fillStyle = '#fff'
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
              const shortenedLength = 14 // link 末端缩短长度

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
              if (link.isTemp) {
                ctx.setLineDash([2, 2])
                color = 'rgba(119,131,145,0.2)' // 虚线颜色
              } else {
                ctx.setLineDash([])
                if (this.currentSelectedNode === link.source || this.currentSelectedNode === link.target) {
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
            })
            .d3Force('center', null)
            .d3Force('collide', d3.forceCollide(d => d.r))
            .d3Force('link', d3.forceLink().distance(link => {
              if (link.source.type === nodeType.rootNode) {
                return 120
              }
              return 60
            }))
            .cooldownTime(1500)
        setTimeout(() => {
          const { nodes, links } = this.graph.graphData()
          const rootNode = nodes.find(n => n.type === nodeType.rootNode)
          rootNode.fx = rootNode.x
          rootNode.fy = rootNode.y
          this.graph.graphData({ nodes, links })
          this.graph.zoomToFit(200, 250)
        }, 1000)
      } catch (e) {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      } finally {
        this.rightBox.loading = false
      }
    },
    async generateInitialData () {
      const nodes = []
      const links = []
      const rootNode = new Node(nodeType.rootNode, this.entity.entityName, {
        entityType: this.entity.entityType,
        entityName: this.entity.entityName
      })
      await rootNode.queryDetailData()
      nodes.push(rootNode)

      // 生成listNode和entityNode及link
      if (rootNode.myData.relatedEntities) {
        // listNode
        const listNodes = []
        const keys = Object.keys(rootNode.myData.relatedEntities)
        keys.forEach(k => {
          if (rootNode.myData.relatedEntities[k].total) {
            const listNode = new Node(
                nodeType.listNode,
                `${rootNode.id}__${k}-list`,
                {
                  entityType: k
                },
                rootNode
            )
            listNodes.push(listNode)
            links.push(new Link(rootNode, listNode))
          }
        })
        // entityNode
        const entityNodes = []
        for (const node of listNodes) {
          const entities = await queryRelatedEntity(rootNode, node.myData.entityType)
          this.pushRelatedEntities(node, entities.list)

          entities.list.forEach(entity => {
            const entityNode = new Node(
                nodeType.entityNode,
                entity.vertex,
                {
                  entityType: node.myData.entityType,
                  entityName: entity.vertex
                },
                node
            )
            entityNodes.push(entityNode)
            links.push(new Link(node, entityNode))
          })
        }
        nodes.push(...listNodes, ...entityNodes)
      }
      return {
        nodes: nodes,
        links: links
      }
    },
    expandList () {

    },
    expandDetailList () {

    },
    onCloseBlock () {

    },
    resize () {

    },
    addItems (toAddNodes, toAddLinks) {
      if (toAddNodes.length || toAddLinks.length) {
        const { nodes, links } = this.graph.graphData()
        const nodes2 = toAddNodes.filter(n => !nodes.some(n2 => n.id === n2.id))
        nodes.push(...nodes2)
        links.push(...toAddLinks)
        this.graph.graphData({ nodes, links })
      }
    },
    removeItems (toRemoveNodes, toRemoveLinks) {
      let { nodes, links } = this.graph.graphData()
      nodes = nodes.filter(n => toRemoveNodes.some(n2 => n.id === n2.id))
      links = links.filter(l => toRemoveLinks.some(l2 => l2.id === l.id))
      this.graph.graphData({ nodes, links })
    },
    cleanTempItems () {
      let { nodes, links } = this.graph.graphData()
      nodes = nodes.filter(n => n.type !== nodeType.tempNode)
      links = links.filter(l => !l.isTemp)
      this.graph.graphData({ nodes, links })
    },
    getNeighborItems (node) {
      const { links } = this.graph.graphData()
      const neighboringNodes = []
      const neighboringTargetNodes = []
      const neighboringSourceNodes = []
      const neighboringTargetLinks = []
      const neighboringSourceLinks = []
      const neighboringLinks = links.filter(l => {
        if (l.target === node || l.source === node) {
          neighboringNodes.push(l.target === node ? l.source : l.target)
          if (l.target === node) {
            neighboringSourceNodes.push(l.source)
            neighboringSourceLinks.push(l)
          } else {
            neighboringTargetNodes.push(l.target)
            neighboringTargetLinks.push(l)
          }
          return true
        }
        return false
      })
      return {
        nodes: neighboringNodes,
        targetNodes: neighboringTargetNodes,
        sourceNodes: neighboringSourceNodes,
        links: neighboringLinks,
        targetLinks: neighboringTargetLinks,
        sourceLinks: neighboringSourceLinks
      }
    },
    getNodeLevel (id) {
      const { findShortestPath } = Algorithm
      const { nodes, links } = this.graph.graphData()
      const g6FormatData = { nodes: _.cloneDeep(nodes), edges: _.cloneDeep(links) }
      g6FormatData.edges.forEach(l => {
        l.source = l.source.id
        l.target = l.target.id
      })
      console.info(g6FormatData)
      const info = findShortestPath(g6FormatData, this.entity.entityName, id)
      return info.length
    },
    pushRelatedEntities (node, entities) {
      if (!this.relatedEntitiesList[node.id]) {
        this.relatedEntitiesList[node.id] = { ip: [], domain: [], app: [] }
      }
      this.relatedEntitiesList[node.id][node.myData.entityType] = entities
    }
  },
  watch: {
  },
  async mounted () {
    if (this.entity.entityType && this.entity.entityName) {
      await this.init()
    }
    this.debounceFunc = this.$_.debounce(this.resize, 300)
    window.addEventListener('resize', this.debounceFunc)
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
    // 右侧关联实体列表
    const relatedEntitiesList = ref({})
    // 记录鼠标交互的node
    const currentHoveredNode = shallowRef(null)
    const currentSelectedNode = shallowRef(null)
    const draggedNodes = shallowRef([]) // 记录拖拽过的node

    return {
      entity,
      rightBox,
      graph,
      relatedEntitiesList,
      currentHoveredNode,
      currentSelectedNode,
      draggedNodes,
      centerCoordinate: [100, 100]
    }
  }
}
</script>
