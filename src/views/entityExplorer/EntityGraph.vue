<template>
  <div class="entity-graph">
    <div class="entity-graph__chart" id="entityGraph">
    </div>
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
import _ from 'lodash'
import G6, { Algorithm } from '@antv/g6'
import Node, { nodeType, queryRelatedEntity } from './entityGraph/node'
import Edge from './entityGraph/edge'

export default {
  name: 'EntityRelationship',
  components: {
    GraphEntityList,
    GraphEntityDetail
  },
  data () {
    return {
      debounceFunc: null,
      chartOption: {
        container: 'entityGraph',
        layout: {
          type: 'force',
          preventOverlap: true,
          linkDistance: (d) => {
            if (d.target.type === nodeType.rootNode || d.target.type === nodeType.listNode) {
              return 200
            }
            return 80
          },
          nodeStrength: (d) => {
            if (d.type === nodeType.rootNode || d.type === nodeType.listNode) {
              return -100
            } else if (d.type === nodeType.tempNode) {
              return -300
            }
            return -10
          },
          edgeStrength: (d) => {
            if (d.target.type === nodeType.rootNode || d.target.type === nodeType.listNode) {
              return 0.1
            }
            return 0.7
          }
        },
        modes: {
          default: ['drag-canvas', 'drag-nodes', 'click-select', 'zoom-canvas']
        }
      },
      /* 自己实现stack操作 */
      stackData: {
        undo: [], // 后退
        redo: [] // 前进
      },
      initialData: null // 初始化数据，用于重置
    }
  },
  methods: {
    async init () {
      this.registerElements() // 注册自定义node
      const tooltip = this.buildTooltip() // tooltip组件
      const toolbar = this.buildToolbar() // 工具栏组装件
      this.chartOption.plugins = [tooltip, toolbar] // 注册组件
      this.graph = new G6.Graph(this.chartOption)
      try {
        const initialData = await this.generateInitialData() // 备份初始数据
        this.initialData = _.cloneDeep(initialData) // 初始化数据
        this.graph.data(initialData)
        this.graph.render()
        const rootNode = this.graph.findById(this.entity.entityName)
        this.bindEvents() // 绑定事件
        this.graph.emit('node:click', { item: rootNode, target: rootNode.getKeyShape() }) // 手动触发rootNode的点击事件
      } catch (e) {
        this.$message.error(this.errorMsgHandler(e))
      } finally {
        this.rightBox.loading = false
      }
    },
    registerElements () {
      const _this = this
      G6.registerNode(
        nodeType.rootNode,
        {
          draw (cfg, group) {
            group.addShape('circle', {
              name: 'rootSelectedShadow',
              attrs: {
                r: 25, // selected时38.5
                fill: getRootNodeStyle(cfg.myData.entityType).selectedShadowColor
              }
            })
            group.addShape('circle', {
              name: 'rootShadow',
              attrs: {
                r: 31.5,
                fill: getRootNodeStyle(cfg.myData.entityType).shadowColor
              }
            })
            const node = group.addShape('circle', {
              name: 'rootInner',
              attrs: {
                r: 26,
                fx: cfg.fx,
                fy: cfg.fy,
                fill: '#FFFFFF',
                stroke: getRootNodeStyle(cfg.myData.entityType).borderColor,
                lineWidth: 1
              }
            })
            group.addShape('image', {
              attrs: {
                x: -getRootNodeStyle(cfg.myData.entityType).iconWidth / 2,
                y: -getRootNodeStyle(cfg.myData.entityType).iconHeight / 2,
                height: getRootNodeStyle(cfg.myData.entityType).iconHeight,
                width: getRootNodeStyle(cfg.myData.entityType).iconWidth,
                img: getIconUrl(cfg.myData.entityType, true, true)
              },
              name: 'rootIcon',
              draggable: true
            })
            // 为label建一个box，避免鼠标事件中断
            group.addShape('rect', {
              name: 'rootLabelBox',
              attrs: {
                width: 64,
                height: 40,
                x: -32,
                y: 10,
                fill: 'transparent'
              }
            })
            group.addShape('text', {
              attrs: {
                text: cfg.label,
                x: 0,
                y: 42,
                fontSize: 12,
                textAlign: 'center',
                textBaseline: 'middle',
                fill: '#353636'
              },
              name: 'rootLabel'
            })
            return node
          },
          setState (name, value, node) {
            const group = node.getContainer()
            const model = node.getModel()
            const selectedShadowShape = group.get('children')[0]
            const shadowShape = group.get('children')[1]
            if (name === 'hover') {
              // 鼠标悬浮时，若不处于selected状态，才继续处理
              if (!node.hasState('mySelected')) {
                // hover时，加深shadow的颜色
                if (value) {
                  shadowShape.attr('fill', getRootNodeStyle(model.myData.entityType).hoveredShadowColor)
                } else {
                  shadowShape.attr('fill', getRootNodeStyle(model.myData.entityType).shadowColor)
                }
              }
            } else if (name === 'mySelected') {
              // select事件，取消自身hover状态，取消其他node和edge的高亮状态，高亮自身和自身相关的edge
              node.setState('hover', false)
              // 变更样式
              if (value) {
                // 取消其他高亮
                const nodes = _this.graph.getNodes()
                const edges = _this.graph.getEdges()
                nodes.forEach(n => {
                  if (n.getModel().id !== node.getModel().id) {
                    n.setState('mySelected', false)
                  }
                })
                edges.forEach(n => {
                  n.setState('mySelected', false)
                })
                // 高亮自身
                shadowShape.attr('fill', getRootNodeStyle(model.myData.entityType).hoveredShadowColor)
                selectedShadowShape.attr('r', 38.5)
                // 高亮自身相关的edge
                const aboutEdges = node.getEdges()
                aboutEdges.forEach(n => {
                  n.setState('mySelected', true)
                })
              } else {
                shadowShape.attr('fill', getRootNodeStyle(model.myData.entityType).shadowColor)
                selectedShadowShape.attr('r', 25)
              }
            }
          }
        },
        'single-node'
      )
      G6.registerNode(
        nodeType.listNode,
        {
          draw (cfg, group) {
            group.addShape('circle', {
              name: 'listShadow',
              attrs: {
                r: 20, // selected时26.5
                x: 0,
                y: 0,
                fill: getListNodeStyle(cfg.myData.entityType).hoveredShadowColor
              }
            })
            const node = group.addShape('circle', {
              name: 'listInner',
              attrs: {
                r: 21,
                fx: cfg.fx,
                fy: cfg.fy,
                fill: '#FFFFFF',
                stroke: getListNodeStyle(cfg.myData.entityType).borderColor,
                lineWidth: 1
              }
            })
            group.addShape('image', {
              attrs: {
                x: -getListNodeStyle(cfg.myData.entityType).iconWidth / 2,
                y: -getListNodeStyle(cfg.myData.entityType).iconHeight / 2,
                height: getListNodeStyle(cfg.myData.entityType).iconHeight,
                width: getListNodeStyle(cfg.myData.entityType).iconWidth,
                img: getIconUrl(cfg.myData.entityType, false, false)
              },
              name: 'listIcon',
              draggable: true
            })
            // 为label建一个box，避免鼠标事件中断
            group.addShape('rect', {
              name: 'rootLabelBox',
              attrs: {
                width: 46,
                height: 30,
                x: -23,
                y: 12,
                fill: 'transparent'
              }
            })
            group.addShape('text', {
              attrs: {
                text: cfg.label,
                x: 0,
                y: 34,
                fontSize: 12,
                textAlign: 'center',
                textBaseline: 'middle',
                fill: '#353636'
              },
              name: 'listLabel'
            })
            return node
          },
          setState (name, value, node) {
            const group = node.getContainer()
            const model = node.getModel()
            const shadowShape = group.get('children')[0]
            const innerShape = group.get('children')[1]
            if (name === 'hover') {
              // 鼠标悬浮时，若不处于selected状态，才继续处理
              if (!node.hasState('mySelected')) {
                // hover时，出现shadow
                shadowShape.attr('fill', getListNodeStyle(model.myData.entityType).hoveredShadowColor)
                if (value) {
                  shadowShape.attr('r', 26.5)
                } else {
                  shadowShape.attr('r', 20)
                }
              }
            } else if (name === 'mySelected') {
              // select事件，取消自身hover状态，取消其他node和edge的高亮状态，高亮自身和自身相关的edge
              node.setState('hover', false)
              if (value) {
                // 取消其他高亮
                const nodes = _this.graph.getNodes()
                const edges = _this.graph.getEdges()
                nodes.forEach(n => {
                  if (n.getModel().id !== node.getModel().id) {
                    n.setState('mySelected', false)
                  }
                })
                edges.forEach(n => {
                  n.setState('mySelected', false)
                })
                // 高亮自身
                shadowShape.attr('fill', getListNodeStyle(model.myData.entityType).selectedShadowColor)
                shadowShape.attr('r', 26.5)
                innerShape.attr('stroke', getListNodeStyle(model.myData.entityType).selectedBorderColor)
                // 高亮自身相关的edge
                const aboutEdges = node.getEdges()
                aboutEdges.forEach(n => {
                  n.setState('mySelected', true)
                })
              } else {
                shadowShape.attr('fill', getListNodeStyle(model.myData.entityType).hoveredShadowColor)
                shadowShape.attr('r', 20)
                innerShape.attr('stroke', getListNodeStyle(model.myData.entityType).borderColor)
              }
            }
          }
        },
        'single-node'
      )
      G6.registerNode(
        nodeType.entityNode,
        {
          draw (cfg, group) {
            group.addShape('circle', {
              name: 'entityShadow',
              attrs: {
                r: 18,
                x: 0,
                y: 0,
                fill: 'transparent'
              }
            })
            return group.addShape('image', {
              attrs: {
                x: -getEntityNodeStyle(cfg.myData.entityType).iconWidth / 2,
                y: -getEntityNodeStyle(cfg.myData.entityType).iconHeight / 2,
                height: getEntityNodeStyle(cfg.myData.entityType).iconHeight,
                width: getEntityNodeStyle(cfg.myData.entityType).iconWidth,
                img: getIconUrl(cfg.myData.entityType, true, false)
              },
              name: 'entityIcon'
            })
          },
          setState (name, value, node) {
            const group = node.getContainer()
            const model = node.getModel()
            const shadowShape = group.get('children')[0]
            if (name === 'mySelected') {
              // select事件，取消自身hover状态，取消其他node和edge的高亮状态，高亮自身和自身相关的edge
              node.setState('hover', false)
              if (value) {
                // 取消其他高亮
                const nodes = _this.graph.getNodes()
                const edges = _this.graph.getEdges()
                nodes.forEach(n => {
                  if (n.getModel().id !== node.getModel().id) {
                    n.setState('mySelected', false)
                  }
                })
                edges.forEach(n => {
                  n.setState('mySelected', false)
                })
                // 高亮自身
                shadowShape.attr('fill', getEntityNodeStyle(model.myData.entityType).selectedShadowColor)
                // 高亮自身相关的edge
                const aboutEdges = node.getEdges()
                aboutEdges.forEach(n => {
                  n.setState('mySelected', true)
                })
              } else {
                shadowShape.attr('fill', 'transparent')
              }
            }
          }
        },
        'single-node'
      )
      G6.registerNode(
        nodeType.tempNode,
        {
          draw (cfg, group) {
            group.addShape('text', {
              attrs: {
                text: cfg.label,
                x: 0,
                y: 22,
                fontSize: 12,
                textAlign: 'center',
                textBaseline: 'middle',
                fill: '#353636',
                opacity: 0.7
              },
              name: 'tempLabel'
            })
            return group.addShape('image', {
              attrs: {
                x: -getListNodeStyle(cfg.myData.entityType).iconWidth / 2,
                y: -getListNodeStyle(cfg.myData.entityType).iconHeight / 2,
                height: getListNodeStyle(cfg.myData.entityType).iconHeight,
                width: getListNodeStyle(cfg.myData.entityType).iconWidth,
                img: getIconUrl(cfg.myData.entityType, false, false),
                opacity: 0.7
              },
              name: 'tempIcon'
            })
          },
          setState (name, value, node) {
            // 重写setState，避免鼠标事件导致重新加载图片
          }
        },
        'single-node'
      )
      function getRootNodeStyle (entityType) {
        switch (entityType) {
          case 'ip': {
            return {
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
          iconWidth: 26,
          iconHeight: 23,
          borderColor: 'rgba(126,159,84,1)',
          shadowColor: 'rgba(126,159,84,0.21)',
          hoveredShadowColor: 'rgba(126,159,84,0.36)',
          selectedShadowColor: 'rgba(126,159,84,0.1)'
        }
      }
      function getListNodeStyle (entityType) {
        switch (entityType) {
          case 'ip': {
            return {
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
          iconWidth: 24,
          iconHeight: 21,
          borderColor: 'rgba(119,131,145,0.6)',
          selectedBorderColor: 'rgba(126,159,84,1)',
          hoveredShadowColor: 'rgba(151,151,151,0.21)',
          selectedShadowColor: 'rgba(126,159,84,0.21)'
        }
      }
      function getEntityNodeStyle (entityType) {
        switch (entityType) {
          case 'ip': {
            return {
              iconWidth: 22,
              iconHeight: 20,
              selectedShadowColor: 'rgba(126,159,84,0.1)'
            }
          }
          case 'domain': {
            return {
              iconWidth: 22,
              iconHeight: 22,
              selectedShadowColor: 'rgba(56,172,210,0.1)'
            }
          }
          case 'app': {
            return {
              iconWidth: 21,
              iconHeight: 24,
              selectedShadowColor: 'rgba(229,162,25,0.1)'
            }
          }
        }
        return {
          iconWidth: 22,
          iconHeight: 20,
          borderColor: 'rgba(119,131,145,1)',
          selectedBorderColor: 'rgba(126,159,84,1)',
          hoveredShadowColor: 'rgba(151,151,151,0.21)',
          selectedShadowColor: 'rgba(126,159,84,0.1)'
        }
      }
      function getIconUrl (entityType, colored, isRoot) {
        let suffix
        if (entityType === 'domain' && isRoot) {
          suffix = '-colored2'
        } else {
          suffix = colored ? '-colored' : ''
        }
        return require(`@/assets/img/entity-symbol2/${entityType}${suffix}.svg`)
      }
    },
    bindEvents () {
      const _this = this
      this.graph.on('node:dragstart', (e) => {
        _this.graph.layout()
        refreshDraggedNodePosition(e)
      })
      this.graph.on('node:drag', function (e) {
        refreshDraggedNodePosition(e)
      })
      this.graph.on('node:dragend', function (e) {
        e.item.get('model').fx = null
        e.item.get('model').fy = null
      })
      this.graph.on('node:click', async function (e) {
        const node = e.item
        const nodeModel = node.get('model')
        if (nodeModel.type !== 'tempNode') {
          _this.rightBox.show = true
          node.setState('mySelected', true)
          _this.cleanTempNodesAndTempEdges()
          // 点击entityNode，查询数据，并根据数据生成tempNode
          if (nodeModel.type === nodeType.entityNode) {
            _this.rightBox.loading = true
            try {
              // 若已查过数据，不重复查询
              if (!nodeModel.myData.relatedEntity) {
                await nodeModel.queryDetailData()
              }
              let change = false
              Object.keys(nodeModel.myData.relatedEntity).forEach(k => {
                if (nodeModel.myData.relatedEntity[k].total) {
                  // 若已有同级同类型的listNode，不生成此tempNode
                  const neighbors = _this.graph.getNeighbors(nodeModel.id, 'target')
                  const hasListNode = neighbors.some(b => b.get('model').myData.entityType === k)
                  if (!hasListNode) {
                    change = true
                    const tempNode = new Node(
                      nodeType.tempNode,
                      `${nodeModel.id}__${k}__temp`,
                      {
                        entityType: k,
                        ...generateTempNodeCoordinate(nodeModel.sourceNode, e)
                      },
                      nodeModel
                    )
                    const tempEdge = new Edge(nodeModel, tempNode, 'temp')
                    _this.graph.addItem('node', tempNode)
                    _this.graph.addItem('edge', tempEdge)
                  }
                }
              })
              change && _this.graph.layout()
              _this.rightBox.node = _.cloneDeep(nodeModel)
              _this.rightBox.mode = 'detail'
            } catch (e) {
              _this.$message.error(_this.errorMsgHandler(e))
            } finally {
              _this.rightBox.loading = false
            }
          } else if (nodeModel.type === nodeType.listNode) {
            _this.rightBox.node = _.cloneDeep(nodeModel)
            _this.rightBox.mode = 'list'
          } else if (nodeModel.type === nodeType.rootNode) {
            _this.rightBox.node = _.cloneDeep(nodeModel)
            _this.rightBox.mode = 'detail'
          }
        } else {
          // 点击tempNode，根据source生成listNode和entityNode以及对应的edge。查完entityNode的接口再删除临时node和edge。
          // 若已达第六层，则只生成listNode，不再展开entityNode
          const nodes = []
          const edges = []
          const listNode = new Node(
            nodeType.listNode,
            `${nodeModel.sourceNode.id}__${nodeModel.myData.entityType}-list`,
            {
              entityType: nodeModel.myData.entityType,
              x: nodeModel.x,
              y: nodeModel.y
            },
            nodeModel.sourceNode
          )
          nodes.push(listNode)
          edges.push(new Edge(nodeModel.sourceNode, listNode))

          // 判断listNode的sourceNode层级，若大于等于10（即第6层listNode），则不继续拓展entity node，并给用户提示。否则拓展entity node
          const level = _this.getNodeLevel(listNode.sourceNode.id)
          if (level < 10) {
            _this.rightBox.loading = true
            try {
              const entities = await queryRelatedEntity(nodeModel.sourceNode, listNode.myData.entityType)
              nodeModel.sourceNode.myData.relatedEntity[listNode.myData.entityType].list.push(...entities.list)
              entities.list.forEach(entity => {
                const entityNode = new Node(nodeType.entityNode, entity.vertex, {
                  entityType: listNode.myData.entityType,
                  entityName: entity.vertex,
                  x: e.x + Math.random() * 100 - 50,
                  y: e.y + Math.random() * 100 - 50
                }, listNode)
                nodes.push(entityNode)
                edges.push(new Edge(listNode, entityNode))
              })
            } catch (e) {
              _this.$message.error(_this.errorMsgHandler(e))
            } finally {
              _this.rightBox.loading = false
            }
          } else {
            this.$message.warning(this.$t('tip.maxExpandDepth'))
          }
          _this.addItems(nodes, edges)
          _this.cleanTempNodesAndTempEdges()
          _this.graph.layout()
          // 手动高亮listNode
          const _listNode = _this.graph.findById(listNode.id)
          _this.graph.emit('node:click', { item: _listNode, target: _listNode.getKeyShape() })
        }
      })
      this.graph.on('node:mouseenter', function (e) {
        e.item.setState('hover', true)
      })
      this.graph.on('node:mouseleave', function (e) {
        e.item.setState('hover', false)
      })
      function refreshDraggedNodePosition (e) {
        const model = e.item.get('model')
        model.fx = e.x
        model.fy = e.y
      }
      function generateTempNodeCoordinate (sourceNode, event) {
        const sx = sourceNode.x
        const sy = sourceNode.y
        const cx = event.x
        const cy = event.y
        return {
          x: cx + cx - sx + Math.random() * 30 - 15,
          y: cy + cy - sy + Math.random() * 30 - 15
        }
      }
    },
    addItems (nodes = [], edges = [], stack = true) {
      // 过滤掉已经存在的node
      const _nodes = nodes.filter(n => {
        return !this.graph.findById(n.id)
      })
      _nodes.forEach(n => {
        this.graph.addItem('node', n)
      })
      edges.forEach(e => {
        this.graph.addItem('edge', e)
      })
      if (stack) {
        this.stackData.undo.push({ nodes: _nodes, edges })
      }
    },
    setItemsStata (models = [], stateName, state) {
      models.forEach(m => {
        this.graph.setItemState(this.graph.findById(m.id), stateName, state)
      })
    },
    cleanTempNodesAndTempEdges () {
      // 清除现有tempNode和tempEdge
      const tempNodes = this.graph.findAll('node', node => node.get('model').type === nodeType.tempNode)
      tempNodes.forEach(n => {
        this.graph.removeItem(n)
      })
      const tempEdges = this.graph.findAll('edge', edge => edge.get('model').isTemp)
      tempEdges.forEach(n => {
        this.graph.removeItem(n)
      })
    },
    async generateInitialData () {
      const nodes = []
      const edges = []
      // 生成rootNode，并查询相关数据
      const { offsetWidth, offsetHeight } = document.getElementById('entityGraph')
      const coordinate = {
        rootNode: {
          fx: offsetWidth * 0.4,
          fy: offsetHeight * 0.3 - 20
        }
      }
      coordinate.ipListNode = {
        fx: coordinate.rootNode.fx + 200,
        fy: coordinate.rootNode.fy
      }
      coordinate.domainListNode = {
        fx: coordinate.rootNode.fx + 100,
        fy: coordinate.rootNode.fy + 173
      }
      coordinate.appListNode = {
        fx: coordinate.rootNode.fx - 100,
        fy: coordinate.rootNode.fy + 173
      }
      const rootNode = new Node(nodeType.rootNode, this.entity.entityName, {
        entityType: this.entity.entityType,
        entityName: this.entity.entityName,
        /*x: coordinate.rootNode.fx,
        y: coordinate.rootNode.fy*/
      })
      await rootNode.queryDetailData()
      nodes.push(rootNode)

      // 生成listNode和entityNode及edge
      if (rootNode.myData.relatedEntity) {
        // listNode
        const listNodes = []
        const keys = Object.keys(rootNode.myData.relatedEntity)
        keys.forEach(k => {
          if (rootNode.myData.relatedEntity[k].total) {
            const listNode = new Node(
              nodeType.listNode,
              `${rootNode.id}__${k}-list`,
              {
                entityType: k,
                /*x: coordinate[`${k}ListNode`].fx,
                y: coordinate[`${k}ListNode`].fy*/
              },
              rootNode
            )
            listNodes.push(listNode)
            edges.push(new Edge(rootNode, listNode))
          }
        })
        // entityNode
        const entityNodes = []
        for (const node of listNodes) {
          const entities = await queryRelatedEntity(rootNode, node.myData.entityType)
          rootNode.myData.relatedEntity[node.myData.entityType].list = entities.list
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
            edges.push(new Edge(node, entityNode))
          })
        }
        nodes.push(...listNodes, ...entityNodes)
      }
      return {
        nodes: nodes,
        edges: edges
      }
    },
    getNodeLevel (id) {
      const { findShortestPath } = Algorithm
      const info = findShortestPath(this.graph.save(), this.entity.entityName, id)
      return info.length
    },
    onCloseBlock () {
      this.rightBox.mode = ''
      this.rightBox.show = false
    },
    buildTooltip () {
      const _this = this
      return new G6.Tooltip({
        offsetX: 10,
        offsetY: 20,
        itemTypes: ['node'],
        getContent (e) {
          const node = e.item.getModel()
          if (node.type === nodeType.listNode) {
            let iconClass = ''
            let title = ''
            let total = 0
            let loadedCount = 0
            switch (node.myData.entityType) {
              case 'ip': {
                iconClass = 'cn-icon cn-icon-resolve-ip'
                title = _this.$t('entities.graph.resolveIp')
                total = _.get(node.sourceNode.myData, 'relatedEntity.ip.total', 0)
                loadedCount = _.get(node.sourceNode.myData, 'relatedEntity.ip.list', []).length
                break
              }
              case 'domain': {
                iconClass = 'cn-icon cn-icon-subdomain'
                title = node.isSubdomain() ? _this.$t('entities.subdomain') : _this.$t('entity.graph.resolveDomain')
                total = _.get(node.sourceNode.myData, 'relatedEntity.domain.total', 0)
                loadedCount = _.get(node.sourceNode.myData, 'relatedEntity.domain.list', []).length
                break
              }
              case 'app': {
                iconClass = 'cn-icon cn-icon-app-name'
                title = _this.$t('entities.tab.relatedApp')
                total = _.get(node.sourceNode.myData, 'relatedEntity.app.total', 0)
                loadedCount = _.get(node.sourceNode.myData, 'relatedEntity.app.list', []).length
                break
              }
            }
            return `<div class="primary-node-tooltip">
              <div class="tooltip__header"><i class="${iconClass}"></i><span class="tooltip__title">${title}</span></div>
              <div class="tooltip__content">
                <span>${_this.$t('entity.graph.associatedCount')}:&nbsp;${total}</span>
                <span>${_this.$t('entity.graph.expandedEntityCount')}:&nbsp;${loadedCount}</span>
              </div>
            </div>`
          } else if (node.type === nodeType.entityNode || node.type === nodeType.rootNode) {
            if (node.myData && node.myData.tags && node.myData.tags.length > 0) {
              return `<div class="entity-node-tooltip">
                <div class="tooltip__header">
                  <span class="tooltip__title">${node.id}</span>
                </div>
                <div class="tooltip__content">
                  <div class="content-header">
                    <div class="header-icon"></div>
                    <span>${_this.$t('entity.graph.tags')}</span>
                  </div>
                  <div class="content-tag-list">${generateTagHTML(node.myData.tags)}</div>
                </div>
              </div>`
            } else {
              return `<div style="padding: 0 6px; font-size: 15px; line-height: 15px; color: #111;">${node.id}</div>`
            }
          } else if (node.type === nodeType.tempNode) {
            return node.label
          }
          function generateTagHTML (tags) {
            let html = ''
            if (tags) {
              tags.forEach(t => {
                html += `<div class="entity-tag entity-tag--level-two-${t.type}">
                  <span>${t.value}</span>
                </div>`
              })
            }
            return html
          }
        }
      })
    },
    buildToolbar () {
      const tc = document.createElement('div')
      tc.id = 'toolbarContainer'
      tc.className = 'graph-toolbar'
      document.body.appendChild(tc)
      const toolbar = new G6.ToolBar({
        container: tc,
        className: 'toolbar__tools',
        getContent: () => {
          return `<ul>
            <li code='zoomOut'><i class="cn-icon cn-icon-zoom-out"></i></li>
            <li code='zoomIn'><i class="cn-icon cn-icon-zoom-in"></i></li>
            <li code='autoZoom'><i class="cn-icon cn-icon-reset"></i></li>
            <li code='undo' id="preStep" class="toolbar--unactivated"><i class="cn-icon cn-icon-pre-step"></i></li>
            <li code='redo' id="nextStep" class="toolbar--unactivated"><i class="cn-icon cn-icon-next-step"></i></li>
            <li code='toDefault'><i class="cn-icon cn-icon-to-default"></i></li>
          </ul>`
        },
        handleClick: (code, graph) => {
          if (code === 'undo') {
            const data = this.stackData.undo.pop()
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
            this.cleanTempNodesAndTempEdges()
            this.graph.layout()
            this.onCloseBlock()
          } else if (code === 'redo') {
            const data = this.stackData.redo.pop()
            this.addItems(data.nodes, data.edges, false)
            this.stackData.undo.push(data)
            this.cleanTempNodesAndTempEdges()
            this.graph.layout()
            this.onCloseBlock()
          } else if (code === 'autoZoom') {
            this.graph.zoomTo(1)
            this.graph.fitCenter()
          } else if (code === 'zoomOut') {
            const { x, y } = this.graph.getViewPortCenterPoint()
            this.graph.zoomTo(this.graph.getZoom() + 0.2, { x, y })
          } else if (code === 'zoomIn') {
            const { x, y } = this.graph.getViewPortCenterPoint()
            const currentZoom = this.graph.getZoom()
            this.graph.zoomTo(currentZoom - 0.2, { x, y })
          } else {
            this.graph.clear()
            this.graph.data(this.initialData)
            this.graph.render()
            const rootNode = this.graph.findById(this.entity.entityName)
            this.graph.emit('node:click', { item: rootNode, target: rootNode.getKeyShape() }) // 手动触发rootNode的点击事件
          }
        }
      })
      return toolbar
    },
    async expandList (nodeId) {
      const node = this.graph.findById(nodeId)
      const model = node.getModel()
      const sourceNode = this.graph.findById(model.sourceNode.id)
      const sourceModel = sourceNode.getModel()
      const expandType = model.myData.entityType
      if (sourceModel.myData.relatedEntity[expandType].list.length >= sourceModel.myData.relatedEntity[expandType].total) {
        return
      }
      if (sourceModel.myData.relatedEntity[expandType].list.length < 50) {
        this.rightBox.loading = true
        try {
          const entities = await queryRelatedEntity(sourceModel, expandType)
          sourceModel.myData.relatedEntity[expandType].list.push(...entities.list)
          const entityNodeModels = []
          const edgeModels = []
          entities.list.forEach(entity => {
            const entityNodeModel = new Node(nodeType.entityNode, entity.vertex, {
              entityType: expandType,
              entityName: entity.vertex,
              x: model.x + Math.random() * 500 - 250,
              y: model.y + Math.random() * 500 - 250
            }, model)
            entityNodeModels.push(entityNodeModel)

            const edge = new Edge(model, entityNodeModel)
            edgeModels.push(edge)
          })
          this.addItems(entityNodeModels, edgeModels)
          this.setItemsStata(edgeModels, 'mySelected', true)
          this.graph.layout()
          this.rightBox.node = _.cloneDeep(model)
        } catch (e) {
          this.$message.error(this.errorMsgHandler(e))
        } finally {
          this.rightBox.loading = false
        }
      } else {
        this.$message.warning(this.$t('tip.maxExpandCount'))
      }
    },
    async expandDetailList (nodeId, expandType) {
      const node = this.graph.findById(nodeId)
      if (node) {
        const nodeModel = node.getModel()
        if (nodeModel.myData.relatedEntity[expandType].list.length >= nodeModel.myData.relatedEntity[expandType].total) {
          return
        }
        if (nodeModel.myData.relatedEntity[expandType].list.length < 50) {
          const toAddNodeModels = []
          const toAddEdgeModels = []

          this.rightBox.loading = true
          try {
            const entities = await queryRelatedEntity(nodeModel, expandType)
            nodeModel.myData.relatedEntity[expandType].list.push(...entities.list)
            const neighbors = node.getNeighbors('target')
            const listNode = neighbors.find(n => n.getModel().myData.entityType === expandType)
            let listNodeModel = listNode.getModel()
            let listEdgeModel
            // 如果listNode是tempNode，移除，并新建listNode
            if (listNodeModel.type === nodeType.tempNode) {
              // 移除tempNode和tempEdge
              const tempEdges = listNode.getInEdges()
              tempEdges.forEach(edge => {
                this.graph.removeItem(edge)
              })
              this.graph.removeItem(listNode)

              listNodeModel = new Node(nodeType.listNode, `${nodeModel.id}__${expandType}-list`, { entityType: expandType, x: listNodeModel.x, y: listNodeModel.y }, nodeModel)
              listEdgeModel = new Edge(nodeModel, listNodeModel)
              toAddNodeModels.push(listNodeModel)
              toAddEdgeModels.push(listEdgeModel)
            }
            entities.list.forEach(entity => {
              const entityNodeModel = new Node(nodeType.entityNode, entity.vertex, {
                entityType: expandType,
                entityName: entity.vertex,
                x: listNodeModel.x + Math.random() * 500 - 250,
                y: listNodeModel.y + Math.random() * 500 - 250
              }, listNodeModel)
              toAddNodeModels.push(entityNodeModel)
              toAddEdgeModels.push(new Edge(listNodeModel, entityNodeModel))
            })
            this.addItems(toAddNodeModels, toAddEdgeModels)
            if (listEdgeModel) {
              this.graph.setItemState(this.graph.findById(listEdgeModel.id), 'mySelected', true)
            }
            this.graph.layout()
            this.rightBox.node = _.cloneDeep(nodeModel)
          } catch (e) {
            this.$message.error(this.errorMsgHandler(e))
          } finally {
            this.rightBox.loading = false
          }
        } else {
          this.$message.warning(this.$t('tip.maxExpandCount'))
        }
      }
    },
    resize () {
      const container = document.getElementById('entityGraph')
      this.graph.changeSize(container.offsetWidth, container.offsetHeight)
    }
  },
  watch: {
    stackData: {
      deep: true,
      handler (n) {
        if (n) {
          if (n.undo.length > 0) {
            document.getElementById('preStep').classList.remove('toolbar--unactivated')
            console.info(n, document.getElementById('preStep').classList)
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
    }
    this.debounceFunc = this.$_.debounce(this.resize, 300)
    window.addEventListener('resize', this.debounceFunc)
  },
  unmounted () {
    window.removeEventListener('resize', this.debounceFunc)
    this.graph.destroy()
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
