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
      <li @click="handleToolsbarClick('zoomOut')" title="${this.$t('overall.zoomOut')}"><i class="cn-icon cn-icon-zoom-out"></i></li>
      <li @click="handleToolsbarClick('zoomIn')" title="${this.$t('overall.zoomIn')}"><i class="cn-icon cn-icon-zoom-in"></i></li>
      <li @click="handleToolsbarClick('autoZoom')" title="${this.$t('overall.autoZoom')}"><i class="cn-icon cn-icon-reset"></i></li>
      <li @click="handleToolsbarClick('undo')" title="${this.$t('overall.preStep')}" id="preStep" class="toolbar--unactivated"><i class="cn-icon cn-icon-pre-step"></i></li>
      <li @click="handleToolsbarClick('redo')" title="${this.$t('overall.nextStep')}" id="nextStep" class="toolbar--unactivated"><i class="cn-icon cn-icon-next-step"></i></li>
      <li @click="handleToolsbarClick('toDefault')" title="${this.$t('overall.reset')}"><i class="cn-icon cn-icon-to-default"></i></li>
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
// import ForceGraph3D from '3d-force-graph'
import * as d3 from 'd3'
import Node, { nodeType } from './entityGraph/node'
import Link, { linkType } from './entityGraph/link'
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
      defaultChargeStrength: -20, // 之前的设置-20
      defaultLinkDistance: 40,
      defaultMargin: 2, // 图像与箭头的距离
      clickNode: null,
      rootNode: null
    }
  },
  methods: {
    async init () {
      try {
        const initialData = await this.generateInitialData()
        this.initialData = _.cloneDeep(initialData) // 初始化数据
        let hoverNode = null
        this.graph = ForceGraph()(document.getElementById('entityGraph'))
          .graphData(initialData)
          .nodeCanvasObject((node, ctx) => {
            const nodeStyle = this.getNodeStyle(node.type, node.data.entityType)
            const iconWidth = nodeStyle.iconWidth / 2
            const iconHeight = nodeStyle.iconHeight / 2
            const x = node.x - iconWidth / 2
            const y = node.y - iconHeight / 2

            if (node.type === nodeType.rootNode) {
              if (this.clickNode && this.clickNode.type === nodeType.rootNode) {
                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.strokeStyle = 'transparent'
                ctx.arc(node.x, node.y, nodeStyle.selectedShadowR / 2, 0, Math.PI * 2)
                ctx.fillStyle = nodeStyle.selectedShadowColor// 先画圆形，才能填色
                ctx.fill()
                ctx.stroke()

                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.strokeStyle = 'transparent'
                ctx.arc(node.x, node.y, nodeStyle.shadowR / 2, 0, Math.PI * 2)
                ctx.fillStyle = nodeStyle.shadowColor
                ctx.fill()
                ctx.stroke()
              } else if (hoverNode && hoverNode.id === node.id) {
                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.strokeStyle = 'transparent'
                ctx.arc(node.x, node.y, nodeStyle.shadowR / 2, 0, Math.PI * 2)
                ctx.fillStyle = nodeStyle.hoveredShadowColor
                ctx.fill()
                ctx.stroke()
              } else {
                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.strokeStyle = 'transparent'
                ctx.arc(node.x, node.y, nodeStyle.shadowR / 2, 0, Math.PI * 2)
                ctx.fillStyle = nodeStyle.shadowColor
                ctx.fill()
                ctx.stroke()
              }
            } else if (node.type === nodeType.listNode) {
              if (this.clickNode && this.clickNode.id === node.id) {
                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.strokeStyle = 'transparent'
                ctx.arc(node.x, node.y, nodeStyle.shadowR / 2, 0, Math.PI * 2)
                ctx.fillStyle = nodeStyle.selectedShadowColor
                ctx.fill()
                ctx.stroke()
              } else if (hoverNode && hoverNode.id === node.id) {
                ctx.beginPath()
                ctx.lineWidth = 1
                ctx.strokeStyle = 'transparent'
                ctx.arc(node.x, node.y, nodeStyle.shadowR / 2, 0, Math.PI * 2)
                ctx.fillStyle = nodeStyle.hoveredShadowColor
                ctx.fill()
                ctx.stroke()
              }
            }

            ctx.beginPath()
            ctx.lineWidth = 0.5
            ctx.strokeStyle = nodeStyle.borderColor// 边的颜色
            ctx.arc(node.x, node.y, nodeStyle.innerR / 2, 0, Math.PI * 2)
            ctx.fillStyle = nodeStyle.fill// 中间的填充色
            ctx.fill()
            ctx.stroke()

            ctx.drawImage(node.img, x, y, iconWidth, iconHeight)

            if (node.type === nodeType.rootNode) {
              ctx.font = nodeStyle.font
              ctx.fillStyle = nodeStyle.fillStyle
              ctx.textAlign = nodeStyle.textAlign
              ctx.textBaseline = nodeStyle.textBaseline
              ctx.fillText(node.label, node.x, node.y + nodeStyle.selectedShadowR / 2 + 5)
            } else if (node.type === nodeType.listNode || node.type === nodeType.tempNode) {
              ctx.beginPath()
              ctx.lineWidth = 1
              ctx.strokeStyle = '#FFFFFF'// 边的颜色
              ctx.rect(node.x - 19, node.y + nodeStyle.innerR / 2 + 8 - 6, 38, 12)
              ctx.fillStyle = '#FFFFFF'
              ctx.fill()
              ctx.stroke()

              ctx.font = nodeStyle.font
              ctx.fillStyle = nodeStyle.fillStyle
              ctx.textAlign = nodeStyle.textAlign
              ctx.textBaseline = nodeStyle.textBaseline
              ctx.fillText(node.label, node.x, node.y + nodeStyle.innerR / 2 + 8)
            }
          })
          .nodePointerAreaPaint((node, color, ctx) => { // 鼠标hover起作用的范围
            const nodeStyle = this.getNodeStyle(node.type, node.data.entityType)
            const size = nodeStyle.innerR
            ctx.fillStyle = color
            ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size) // draw square as pointer trap
          })
          .linkCanvasObject((link, ctx) => {
            if (link.source.x !== undefined && link.source.y !== undefined && link.target.x !== undefined && link.target.y !== undefined) {
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
            }
          })
          .autoPauseRedraw(false) // keep redrawing after engine has stopped如果您有依赖于画布的不断重绘的自定义动态对象，建议关闭此选项。
          .onNodeHover(node => {
            hoverNode = node || null
            if (node) {
              node.name = builtTooltip(node)
            }
          })
          .centerAt(0, 30)// 设置中心节点位置
          .onNodeClick(async (node, e) => {
            this.clickNode = node || null
            if (node.type !== 'tempNode') {
              this.rightBox.show = true
              this.cleanTempItems()
              // 点击entityNode，查询数据，并根据数据生成tempNode
              if (node.type === nodeType.entityNode) {
                this.rightBox.loading = true
                try {
                  // 若已查过数据，不重复查询
                  if (!node.data.relatedEntities) {
                    await node.queryDetailData()
                  }
                  const toAddNodes = []
                  const toAddLinks = []
                  Object.keys(node.data.relatedEntities).forEach(k => {
                    if (node.data.relatedEntities[k].total) {
                      // 若已有同级同类型的listNode，不生成此tempNode
                      const neighbors = node.getNeighbors(this.graph.graphData())
                      const hasListNode = neighbors.nodes.some(b => b.data.entityType === k)
                      if (!hasListNode) {
                        const tempNode = new Node(
                          nodeType.tempNode,
                              `${node.id}__${k}__temp`,
                              {
                                entityType: k,
                                ...this.generateTempNodeCoordinate(node.getSourceNode(this.graph.graphData()), e)
                              },
                              node,
                              this.defaultChargeStrength,
                              this.getIconUrl(k, false, false)
                        )
                        this.$nextTick(() => {
                          tempNode.fx = tempNode.x
                          tempNode.fy = tempNode.y
                        })

                        const tempLink = new Link(node, tempNode, 'temp', this.defaultLinkDistance, 3)
                        toAddNodes.push(tempNode)
                        toAddLinks.push(tempLink)
                      }
                    }
                  })
                  if (toAddNodes.length || toAddLinks.length) {
                    this.addItems(toAddNodes, toAddLinks)
                  }
                  this.rightBox.node = _.cloneDeep(node)
                  this.rightBox.mode = 'detail'
                } catch (e) {
                  console.error(e)
                  this.$message.error(this.errorMsgHandler(e))
                } finally {
                  this.rightBox.loading = false
                }
              } else if (node.type === nodeType.listNode) {
                this.rightBox.node = _.cloneDeep(node)
                this.rightBox.mode = 'list'
              } else if (node.type === nodeType.rootNode) {
                this.rightBox.node = _.cloneDeep(node)
                this.rightBox.mode = 'detail'
              }
            } else {
              // 点击tempNode，根据source生成listNode和entityNode以及对应的edge。查完entityNode的接口再删除临时node和edge。
              // 若已达第六层，则只生成listNode，不再展开entityNode
              const nodes = []
              const edges = []
              const sourceNode = node.getSourceNode(this.graph.graphData())
              const listNode = new Node(
                nodeType.listNode,
                    `${sourceNode.id}__${node.data.entityType}-list`,
                    {
                      entityType: node.data.entityType,
                      x: node.x,
                      y: node.y
                    },
                    sourceNode,
                    this.defaultChargeStrength,
                    this.getIconUrl(node.data.entityType, false, false)
              )
              nodes.push(listNode)
              edges.push(new Link(sourceNode, listNode, null, this.defaultLinkDistance, 2))

              // 判断listNode的sourceNode层级，若大于等于10（即第6层listNode），则不继续拓展entity node，并给用户提示。否则拓展entity node
              const level = this.getNodeLevel(listNode.sourceNode.id)
              if (level < 10) {
                // this.rightBox.loading = true
                try {
                  const entities = await sourceNode.queryRelatedEntities(listNode.data.entityType)
                  sourceNode.data.relatedEntities[listNode.data.entityType].list.push(...entities.list)
                  entities.list.forEach(entity => {
                    const entityNode = new Node(nodeType.entityNode, entity.vertex, {
                      entityType: listNode.data.entityType,
                      entityName: entity.vertex,
                      x: e.x + Math.random() * 100 - 50,
                      y: e.y + Math.random() * 100 - 50
                    }, listNode, this.defaultChargeStrength, this.getIconUrl(listNode.data.entityType, true, false))
                    nodes.push(entityNode)
                    edges.push(new Link(listNode, entityNode, null, this.defaultLinkDistance, 2))
                  })
                } catch (e) {
                  console.error(e)
                  this.$message.error(this.errorMsgHandler(e))
                } finally {
                  this.rightBox.loading = false
                }
              } else {
                this.$message.warning(this.$t('tip.maxExpandDepth'))
              }
              this.addItems(nodes, edges)
              this.cleanTempItems()
              // this.graph.layout()

              // 手动高亮listNode
              /* const _listNode = this.graph.findById(listNode.id)
                this.graph.emit('node:click', { item: _listNode, target: _listNode.getKeyShape() })
                if (this.stackData.justUndo) {
                  this.stackData.justUndo = false
                  this.stackData.redo = []
                }
                if (this.stackData.justRedo) {
                  this.stackData.justRedo = false
                  this.stackData.redo = []
                } */
            }

            // this.graph.zoom(1,0)//缩放画布

            /* if(node.type !== nodeType.listNode && node.type !== nodeType.rootNode) {
                let clickNodeData = await this.generateInitialData(node)
                node.collapsed = !node.collapsed // toggle collapse state
                let index = this.initialData.nodes.findIndex(item => item.id === node.id)
                if (index > -1) {
                  this.initialData.nodes.splice(index,1)
                }
                //clickNodeData.nodes = this.initialData.nodes.concat(clickNodeData.nodes)
                //clickNodeData.links = this.initialData.links.concat(clickNodeData.links)
                Graph.graphData(clickNodeData)
              } */
          })

          .d3Force('link', d3.forceLink().id(link => link.id)
            .distance(link => {
              return link.distance
            })
            .strength(link => {
              return link.strength
            }))// 设置线对点的力？
          .d3Force('center', d3.forceCenter().strength(0))// 设置力导图点阵中心位置, 向心力设置为0以后，d3.forceCenter(-50,-70)不起作用了
          .d3Force('charge', d3.forceManyBody().strength(node => { // 电荷力：吸引力或排斥力。forceManyBody使所有元素相互吸引或排斥。可以设置吸引或排斥的强度，.strength()其中正值导致元素相互吸引，而负值将导致元素相互排斥。
            const strength = node.type === nodeType.rootNode ? -350 : node.strength// 中心节点的排斥力要设置的比较大（-300，-200，-100），这样中心节点的子节点的子节点就会是远离中心节点的状态，进行聚集。
            return strength
          }))
          .onNodeDrag((node, translate) => {
          })
          .onNodeDragEnd((node, translate) => { // 修复拖动节点
            node.fx = node.x
            node.fy = node.y
          })
      } catch (e) {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      } finally {
        this.rightBox.loading = false
      }
    },
    handleToolsbarClick (code) {
      if (code === 'undo') {
        const data = this.stackData.undo.pop()
        this.stackData.justUndo = true
        data.nodes.forEach(n => {
          if (n.type === nodeType.listNode) {
            const listNode = this.graph.findById(n.id)
            const listNodeEdges = listNode.getEdges()
            listNodeEdges.forEach(e => {
              e.setState('mySelected', false)
            })
            listNode.setState('mySelected', false)
          }
          this.graph.removeItem(n.id)
        })
        data.edges.forEach(e => {
          this.graph.removeItem(e.id)
        })
        this.stackData.redo.push(data)
        if (this.stackData.justRedo) {
          this.stackData.justRedo = false
        }
        // this.cleanTempItems()
        this.graph.layout()
        this.onCloseBlock()
      } else if (code === 'redo') {
        const data = this.stackData.redo.pop()
        this.stackData.justRedo = true
        this.addItems(data.nodes, data.edges)
        // this.stackData.undo.push(data)
        if (this.stackData.justUndo) {
          this.stackData.justUndo = false
        }
        // this.cleanTempItems()
        this.graph.layout()
        this.onCloseBlock()
      } else if (code === 'autoZoom') {
        this.graph.zoom(2)
        this.graph.centerAt(0, 30)
      } else if (code === 'zoomOut') {
        this.graph.zoom(this.graph.zoom() + 0.2)
      } else if (code === 'zoomIn') {
        this.graph.zoom(this.graph.zoom() - 0.2)
      } else {
        this.clickNode = this.rootNode
        this.graph.graphData(this.initialData).centerAt(0, 30)
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
          return this.getTempNodeStyle(entityType)
        }
      }
    },
    getRootNodeStyle (entityType) {
      const nodeStyle = {
        innerR: 26,
        fill: '#FFFFFF',
        shadowR: 31.5,
        selectedShadowR: 38.5,
        font: '8px NotoSansSChineseRegular',
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#353636'
      }
      switch (entityType) {
        case 'ip': {
          return {
            ...nodeStyle,
            iconWidth: 26,
            iconHeight: 23,
            borderColor: 'rgba(126,159,84,1)',
            shadowColor: 'rgba(126,159,84,0.21)',
            hoveredShadowColor: 'rgba(126,159,84,0.36)',
            selectedShadowColor: 'rgba(126,159,84,0.1)'
          }
        }
        case 'domain': {
          return {
            ...nodeStyle,
            iconWidth: 28,
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
            iconWidth: 24,
            iconHeight: 26,
            borderColor: 'rgba(229,162,25,1)',
            shadowColor: 'rgba(229,162,25,0.21)',
            hoveredShadowColor: 'rgba(229,162,25,0.36)',
            selectedShadowColor: 'rgba(229,162,25,0.1)'
          }
        }
      }
      return {
        ...nodeStyle,
        iconWidth: 26,
        iconHeight: 23,
        borderColor: 'rgba(126,159,84,1)',
        shadowColor: 'rgba(126,159,84,0.21)',
        hoveredShadowColor: 'rgba(126,159,84,0.36)',
        selectedShadowColor: 'rgba(126,159,84,0.1)'
      }
    },
    getListNodeStyle (entityType) {
      const nodeStyle = {
        innerR: 21,
        shadowR: 26.5,
        fill: '#FFFFFF',
        font: '8px NotoSansSChineseRegular',
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#353636'
      }
      switch (entityType) {
        case 'ip': {
          return {
            ...nodeStyle,
            iconWidth: 24,
            iconHeight: 21,
            borderColor: 'rgba(119,131,145,0.6)',
            selectedBorderColor: 'rgba(126,159,84,1)',
            hoveredShadowColor: 'rgba(151,151,151,0.21)',
            selectedShadowColor: 'rgba(126,159,84,0.21)'
          }
        }
        case 'domain': {
          return {
            ...nodeStyle,
            iconWidth: 24,
            iconHeight: 24,
            borderColor: 'rgba(119,131,145,0.6)',
            selectedBorderColor: 'rgba(56,172,210,1)',
            hoveredShadowColor: 'rgba(151,151,151,0.21)',
            selectedShadowColor: 'rgba(56,172,210,0.21)'
          }
        }
        case 'app': {
          return {
            ...nodeStyle,
            iconWidth: 22,
            iconHeight: 24,
            borderColor: 'rgba(119,131,145,0.6)',
            selectedBorderColor: 'rgba(229,162,25,1)',
            hoveredShadowColor: 'rgba(151,151,151,0.21)',
            selectedShadowColor: 'rgba(229,162,25,0.21)'
          }
        }
      }
      return {
        ...nodeStyle,
        iconWidth: 24,
        iconHeight: 21,
        borderColor: 'rgba(119,131,145,0.6)',
        selectedBorderColor: 'rgba(126,159,84,1)',
        hoveredShadowColor: 'rgba(151,151,151,0.21)',
        selectedShadowColor: 'rgba(126,159,84,0.21)'
      }
    },
    getTempNodeStyle (entityType) {
      const nodeStyle = {
        innerR: 14,
        fill: 'transparent',
        font: '8px NotoSansSChineseRegular',
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#353636'
      }
      switch (entityType) {
        case 'ip': {
          return {
            ...nodeStyle,
            iconWidth: 24,
            iconHeight: 21,
            borderColor: '#FFFFFF',
            selectedBorderColor: 'rgba(126,159,84,1)',
            hoveredShadowColor: 'rgba(151,151,151,0.21)',
            selectedShadowColor: 'rgba(126,159,84,0.21)'
          }
        }
        case 'domain': {
          return {
            ...nodeStyle,
            iconWidth: 24,
            iconHeight: 24,
            borderColor: '#FFFFFF',
            selectedBorderColor: 'rgba(56,172,210,1)',
            hoveredShadowColor: 'rgba(151,151,151,0.21)',
            selectedShadowColor: 'rgba(56,172,210,0.21)'
          }
        }
        case 'app': {
          return {
            ...nodeStyle,
            iconWidth: 22,
            iconHeight: 24,
            borderColor: '#FFFFFF',
            selectedBorderColor: 'rgba(229,162,25,1)',
            hoveredShadowColor: 'rgba(151,151,151,0.21)',
            selectedShadowColor: 'rgba(229,162,25,0.21)'
          }
        }
      }
      return {
        ...nodeStyle,
        iconWidth: 24,
        iconHeight: 21,
        borderColor: '#FFFFFF',
        selectedBorderColor: 'rgba(126,159,84,1)',
        hoveredShadowColor: 'rgba(151,151,151,0.21)',
        selectedShadowColor: 'rgba(126,159,84,0.21)'
      }
    },
    getEntityNodeStyle (entityType) {
      const nodeStyle = {
        innerR: 12,
        fill: 'transparent'
      }
      switch (entityType) {
        case 'ip': {
          return {
            ...nodeStyle,
            iconWidth: 22,
            iconHeight: 20,
            selectedShadowColor: 'rgba(126,159,84,0.1)'
          }
        }
        case 'domain': {
          return {
            ...nodeStyle,
            iconWidth: 22,
            iconHeight: 22,
            selectedShadowColor: 'rgba(56,172,210,0.1)'
          }
        }
        case 'app': {
          return {
            ...nodeStyle,
            iconWidth: 21,
            iconHeight: 24,
            selectedShadowColor: 'rgba(229,162,25,0.1)'
          }
        }
      }
      return {
        ...nodeStyle,
        iconWidth: 22,
        iconHeight: 20,
        borderColor: 'rgba(119,131,145,1)',
        selectedBorderColor: 'rgba(126,159,84,1)',
        hoveredShadowColor: 'rgba(151,151,151,0.21)',
        selectedShadowColor: 'rgba(126,159,84,0.1)'
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
    addItems (toAddNodes, toAddLinks) {
      if (toAddNodes.length || toAddLinks.length) {
        const { nodes, links } = this.graph.graphData()
        const nodes2 = toAddNodes.filter(n => !nodes.some(n2 => n.id === n2.id))
        nodes.push(...nodes2)
        links.push(...toAddLinks)
        this.graph.graphData({ nodes, links })
      }
    },
    cleanTempItems () {
      let { nodes, links } = this.graph.graphData()
      nodes = nodes.filter(n => n.type !== nodeType.tempNode)
      links = links.filter(l => l.level !== 3)
      this.graph.graphData({ nodes, links })
    },
    async generateInitialData (clickNode) {
      const nodes = []
      const links = []

      const rootNode = clickNode || new Node(nodeType.rootNode, this.entity.entityName, this.entity, null, this.defaultChargeStrength, this.getIconUrl(this.entity.entityType, true, true))
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
              `${rootNode.id}__${k}-list`,
              {
                entityType: k
              },
              rootNode,
              this.defaultChargeStrength,
              this.getIconUrl(k, false, false)
            )
            listNodes.push(listNode)
            links.push(new Link(rootNode, listNode, null, 60, 1))
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
              this.defaultChargeStrength,
              this.getIconUrl(listNode.data.entityType, true, false)
            )
            entityNodes.push(entityNode)
            links.push(new Link(listNode, entityNode, null, this.defaultLinkDistance, 2))
          })
        }
        nodes.push(...listNodes, ...entityNodes)
      }
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
        this.rightBox.loading = true
        try {
          const entities = await sourceNode.queryRelatedEntities(expandType)
          sourceNode.data.relatedEntities[expandType].list.push(...entities.list)
          const toAddNodes = []
          const toAddLinks = []
          entities.list.forEach(entity => {
            const toAddNode = new Node(nodeType.entityNode, entity.vertex, {
              entityType: expandType,
              entityName: entity.vertex
            }, node, this.defaultChargeStrength, this.getIconUrl(node.data.entityType, true, false))
            toAddNodes.push(toAddNode)

            const toAddLink = new Link(node, toAddNode, null, this.defaultLinkDistance)
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

          this.rightBox.loading = true
          try {
            const entities = await node.queryRelatedEntities(expandType)
            node.data.relatedEntities[expandType].list.push(...entities.list)
            // 移除 tempNode 和 tempEdge
            this.cleanTempItems()

            const neighbors = node.getNeighbors(this.graph.graphData())
            let listNode = neighbors.targetNodes.find(n => n.data.entityType === expandType)
            if (!listNode) {
              listNode = new Node(nodeType.listNode, `${node.id}__${expandType}-list`, { entityType: expandType }, node, this.defaultChargeStrength, this.getIconUrl(expandType, false, false))
              const link = new Link(node, listNode, null, this.defaultLinkDistance)
              toAddNodes.push(listNode)
              toAddLinks.push(link)
            }
            entities.list.forEach(entity => {
              const entityNode = new Node(nodeType.entityNode, entity.vertex, {
                entityType: expandType,
                entityName: entity.vertex
              }, listNode, this.defaultChargeStrength, this.getIconUrl(expandType, true, false))
              toAddNodes.push(entityNode)
              toAddLinks.push(new Link(listNode, entityNode, null, this.defaultLinkDistance))
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
      show: false,
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
