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
        <ip-list
            v-if="rightBox.mode === 'ipList'"
            :entity="entity"
            @expandList="expandList"
            @closeBlock="onCloseBlock"
            @mouseenter="onMouseenter"
            @expandDetail="onExpandDetail">
        </ip-list>
        <domain-list
            v-else-if="rightBox.mode === 'domainList'"
            :entity="entity"
            @expandList="expandList"
            @mouseenter="onMouseenter"
            @closeBlock="onCloseBlock">
        </domain-list>
        <app-list
            v-else-if="rightBox.mode === 'appList'"
            :entity="entity"
            @expandList="expandList"
            @mouseenter="onMouseenter"
            @closeBlock="onCloseBlock">
        </app-list>
        <graph-detail
            v-else-if="rightBox.mode === 'appDetail' || rightBox.mode === 'ipDetail' || rightBox.mode === 'domainDetail'"
            :entity="entity"
            @expandDetailList="expandDetailList"
            @closeBlock="onCloseBlock">
        </graph-detail>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import IpList from '@/views/entityExplorer/entityGraphDetail/IpList'
import GraphDetail from '@/views/entityExplorer/entityGraphDetail/GraphDetail'
import DomainList from '@/views/entityExplorer/entityGraphDetail/DomainList'
import AppList from '@/views/entityExplorer/entityGraphDetail/AppList'
import { useRoute } from 'vue-router'
import { ref, shallowRef } from 'vue'
import _ from 'lodash'
import { api } from '@/utils/api'
import axios from 'axios'
import G6, { Algorithm } from '@antv/g6'
import { entityDetailTags } from '@/utils/constants'
import { ElMessage } from 'element-plus'

export default {
  name: 'EntityRelationship',
  components: {
    IpList,
    GraphDetail,
    DomainList,
    AppList
  },
  data () {
    return {
      chartOption: {
        container: 'entityGraph',
        layout: {
          type: 'force',
          preventOverlap: true,
          linkDistance: (d) => {
            if (d.target.nodeType && d.target.nodeType === 'primary') {
              return 200
            }
            return 80
          },
          nodeStrength: (d) => {
            if (d.nodeType && d.nodeType === 'primary') {
              return -100
            }
            return -10
          },
          edgeStrength: (d) => {
            if (d.target.nodeType && d.target.nodeType === 'primary') {
              return 0.1
            }
            return 0.7
          }
        },
        modes: {
          default: ['drag-canvas', 'drag-nodes', 'click-select', 'zoom-canvas']
        }
      }
    }
  },
  methods: {
    async init () {
      const _this = this
      const tooltip = this.buildTooltip() // tooltip组件
      // const toolbar = this.buildToolbar() // 工具栏组装件
      this.chartOption.plugins = [tooltip]
      this.graph = new G6.Graph(this.chartOption)
      const rootNode = await this.generateRootNode()
      const secondLevelNodes = await this.generateSecondLevelNodes(rootNode)
      const secondHalfLevelNodes = await this.generateHalfLevelNodes(secondLevelNodes)
      this.updateRelatedCount(rootNode, rootNode.data.childNodes)
      this.graphData.nodes = [rootNode, ...secondLevelNodes, ...secondHalfLevelNodes]
      const rootEdges = this.generateEdges(rootNode)
      const secondEdges = this.generateEdges(secondLevelNodes)
      this.graphData.edges = [...rootEdges, ...secondEdges]
      // console.info(this.graphData)
      this.graph.data(this.graphData)
      this.graph.render()
      this.graph.on('node:dragstart', function (e) {
        _this.graph.layout()
        refreshDragedNodePosition(e)
      })
      this.graph.on('node:drag', function (e) {
        refreshDragedNodePosition(e)
      })
      this.graph.on('node:dragend', function (e) {
        e.item.get('model').fx = null
        e.item.get('model').fy = null
      })
      this.graph.on('node:click', async function (e) {
        const node = e.item.get('model')
        // 点击后，若不是临时节点，且右侧没弹框，就弹出弹框。若是临时节点，在另一处逻辑中处理
        if (!node.data.isTemp) {
          if (node.nodeType && (node.nodeType === 'root' || node.nodeType === 'entity')) {
            _this.rightBox.mode = `${node.data.type || _this.entity.entityType}Detail`
          } else if (node.nodeType && node.nodeType === 'primary') {
            _this.rightBox.mode = `${node.data.type}List`
          }
          if (!_this.rightBox.show) {
            _this.rightBox.show = true
          }
        }
        // 先清除所有temp node和temp edge
        // 若是primary node，在弹框中显示相关list数据，且高亮node和target=node的edge
        // 若是entity node，查数量，生成temp edge关联的、除已有的primary node外的temp node。并在弹框中显示detail，且高亮node和target=node的edge
        /* 若是temp node，增加primary node，并高亮此node.
        *  然后判断primary node的level，若小于5，查询其关联的entity node并渲染，并高亮target=node和source=node的edge。
        * 若等于5，不渲染下级node并提示用户。
        * */
        let change = false // 图数据是否有变更，需要刷新
        // 清除temp node和temp edge
        const toDeleteTempNodeIds = []
        const toDeleteTempEdgeIds = []
        _this.graphData.nodes = _this.graphData.nodes.filter(n => {
          if (n.data && !n.data.isTemp) {
            return true
          }
          toDeleteTempNodeIds.push(n.id)
          // change = true
          return false
        })
        _this.graphData.edges = _this.graphData.edges.filter(e => {
          if (e.data && !e.data.isTemp) {
            return true
          }
          toDeleteTempEdgeIds.push(e.id)
          // change = true
          return false
        })
        toDeleteTempNodeIds.forEach(n => {
          _this.graph.removeItem(n)
        })
        toDeleteTempEdgeIds.forEach(n => {
          _this.graph.removeItem(n)
        })

        if (node.nodeType === 'root') { // 点击了root
          _this.entity = {
            entityName: node.id,
            entityType: _this.entity.entityType,
            name: node.id,
            tags: node.data.tags,
            type: node.data.type,
            detailData: node.data.data,
            relatedEntityCount: node.data.relatedEntityCount,
            isSubdomain: node.data.isSubdomain || false,
            loading: false
          }
          /* const relatedEntityCount = await _this.queryRelatedEntityCount(_this.entity.entityType, node.id)
          _this.entity = {
            ..._this.entity,
            relatedEntityCount: _this.handleRelatedEntityCount(node, relatedEntityCount),
            loading: false
          }
          // 更新childNodes的label的数值
          if (node.data.childNodes) {
            node.data.childNodes.forEach(n => {
              switch (n.data.type) {
                case 'ip': {
                  n.data.count = relatedEntityCount.ipCount
                  n.label = _this.$t('entities.graph.resolveIp') + `(${n.data.count})`
                  break
                }
                case 'domain': {
                  if (n.data.isSubdomain) {
                    n.data.count = relatedEntityCount.subDomainCount
                    n.label = _this.$t('entities.subdomain') + `(${n.data.count})`
                  } else {
                    n.data.count = relatedEntityCount.domainCount
                    n.label = _this.$t('entity.graph.resolvedDomain') + `(${n.data.count})`
                  }
                  break
                }
                case 'app': {
                  n.data.count = relatedEntityCount.appCount
                  n.label = _this.$t('entities.tab.relatedApp') + `(${n.data.count})`
                  break
                }
              }
              _this.graph.refreshItem(n.id)
            })
          } */
        } else if (node.nodeType === 'primary') { // 点击了primary
          _this.entity = {
            entityType: _this.entity.entityType,
            entityName: _this.entity.entityName,
            listData: node.data.loaded,
            count: node.data.count,
            isSubdomain: node.data.isSubdomain || false,
            sourceType: node.data.sourceType,
            sourceName: node.data.sourceName,
            type: node.data.type,
            nodeId: node.id,
            loading: false
          }
          /* _this.entity.loading = true
          const queryRelatedEntityCount = await _this.queryRelatedEntityCount(node.data.sourceType, node.data.sourceName)
          const sourceNode = _this.graphData.nodes.find(n => n.id === node.data.sourceName)
          _this.handleRelatedEntityCount(sourceNode, queryRelatedEntityCount)
          _this.entity = {
            entityType: _this.entity.entityType,
            entityName: _this.entity.entityName,
            listData: node.data.loaded,
            count: node.data.count,
            isSubdomain: node.data.isSubdomain || false,
            sourceType: node.data.sourceType,
            sourceName: node.data.sourceName,
            type: node.data.type,
            nodeId: node.id,
            loading: false
          }
          switch (node.data.type) {
            case 'ip': {
              node.data.count = queryRelatedEntityCount.ipCount
              node.label = _this.$t('entities.graph.resolveIp') + `(${node.data.count})`
              break
            }
            case 'domain': {
              if (node.data.isSubdomain) {
                node.data.count = queryRelatedEntityCount.subDomainCount
                node.label = _this.$t('entities.subdomain') + `(${node.data.count})`
              } else {
                node.data.count = queryRelatedEntityCount.domainCount
                node.label = _this.$t('entity.graph.resolvedDomain') + `(${node.data.count})`
              }
              break
            }
            case 'app': {
              node.data.count = queryRelatedEntityCount.appCount
              node.label = _this.$t('entities.tab.relatedApp') + `(${node.data.count})`
              break
            }
          }
          _this.graph.refreshItem(node.id) */
          // TODO 高亮
        } else if (node.nodeType === 'entity') {
          // 点击节点时，看是否已查询过related count，已查过则不再查
          if (!node.data.childNodes) {
            _this.entity.loading = true
            const relatedEntityCount = await _this.queryRelatedEntityCount(node.data.type, node.id)
            node.data.relatedEntityCount = _this.handleRelatedEntityCount(node, relatedEntityCount)
          }
          _this.entity = {
            entityType: _this.entity.entityType,
            entityName: _this.entity.entityName,
            relatedEntityCount: node.data.relatedEntityCount,
            detailData: node.data.data,
            type: node.data.type,
            isSubdomain: false,
            name: node.id,
            loading: false
          }
          /* _this.entity.loading = true
          const relatedEntityCount = await _this.queryRelatedEntityCount(node.data.type, node.id)
          // 赋值总数和已拓展数。entity node可从其childNodes取到已拓展数
          _this.entity = {
            entityType: _this.entity.entityType,
            entityName: _this.entity.entityName,
            relatedEntityCount: _this.handleRelatedEntityCount(node, relatedEntityCount),
            detailData: node.data.data,
            type: node.data.type,
            isSubdomain: false,
            name: node.id,
            loading: false
          }
          // 更新childNodes的label的数值
          if (node.data.childNodes) {
            node.data.childNodes.forEach(n => {
              switch (n.data.type) {
                case 'ip': {
                  n.data.count = relatedEntityCount.ipCount
                  n.label = _this.$t('entities.graph.resolveIp') + `(${n.data.count})`
                  break
                }
                case 'domain': {
                  if (n.data.isSubdomain) {
                    n.data.count = relatedEntityCount.subDomainCount
                    n.label = _this.$t('entities.subdomain') + `(${n.data.count})`
                  } else {
                    n.data.count = relatedEntityCount.domainCount
                    n.label = _this.$t('entity.graph.resolvedDomain') + `(${n.data.count})`
                  }
                  break
                }
                case 'app': {
                  n.data.count = relatedEntityCount.appCount
                  n.label = _this.$t('entities.tab.relatedApp') + `(${n.data.count})`
                  break
                }
              }
              _this.graph.refreshItem(n.id)
            })
          } */
          const { tempNodes, tempEdges } = _this.generateTempNodesAndEdges(node, node.data.relatedEntityCount)
          if (tempNodes.length > 0) {
            change = true
            _this.addNodes(tempNodes)
          }
          if (tempEdges.length > 0) {
            change = true
            _this.addEdges(tempEdges)
          }
          // TODO 高亮
        } else if (node.nodeType === 'temp') {
          change = true
          // 根据temp node生成primary node
          const primaryNode = _this.generatePrimaryNode({
            id: `${node.data.type}-${node.data.sourceName}`,
            label: node.label + `(${node.data.count})`,
            data: {
              sourceName: node.data.sourceName,
              sourceType: node.data.sourceType,
              type: node.data.type,
              isSubdomain: node.data.isSubdomain || false,
              count: node.data.count
            }
          })
          const sourceNode = _this.graphData.nodes.find(n => n.id === node.data.sourceName)
          // 新node放入source node的childNodes中
          if (!sourceNode.data.childNodes) {
            sourceNode.data.childNodes = []
          }
          sourceNode.data.childNodes.push(primaryNode)
          _this.addNodes([primaryNode])

          const edge = _this.generateEdges(sourceNode, primaryNode)
          _this.addEdges(edge)
          // 判断primary层级，若大于等于5，则不继续拓展entity node，并给用户提示。否则拓展entity node
          const level = _this.getNodeLevel(primaryNode.id)
          const entityNodes = []
          const edges = []
          if (level < 9) {
            _this.entity.loading = true
            const queryEntityNodes = await _this.generateHalfLevelNodes(primaryNode)
            _this.entity.loading = false
            _this.updateRelatedCount(sourceNode, [primaryNode])
            entityNodes.push(...queryEntityNodes)
            edges.push(..._this.generateEdges(primaryNode))

            // TODO 高亮
          } else {
            this.$message.error(this.$t('entities.graph.expandedLevelMaxLimit'))
          }
          _this.addNodes(entityNodes)
          _this.addEdges(edges)
        }
        if (change) {
          _this.graph.changeData(_this.graphData)
        }
      })
      function refreshDragedNodePosition (e) {
        const model = e.item.get('model')
        model.fx = e.x
        model.fy = e.y
      }
    },
    generateIconUrl (entityType, colored, isRoot) {
      let subfix = ''
      if (entityType === 'domain' && isRoot) {
        subfix = '-colored2'
      } else {
        subfix = colored ? '-colored' : ''
      }
      return require(`@/assets/img/entity-symbol2/${entityType}${subfix}.svg`)
    },
    async generateRootNode () {
      const basicInfo = await this.queryEntityBasicInfo(this.entity.entityType, this.entity.entityName)
      const tags = await this.queryTags(this.entity.entityType, this.entity.entityName)
      let _tags = []
      Object.keys(tags).forEach(k => {
        if (k !== 'userDefinedTags' && tags[k]) {
          Object.keys(tags[k]).forEach(k2 => {
            const find = entityDetailTags[this.entity.entityType].find(t => t.name === k2)
            if (find) {
              _tags.push({ key: k2, value: this.tagValueHandler(k, k2, tags[k][k2]), type: find.type })
            }
          })
        }
      })
      if (_.isArray(tags.userDefinedTags)) {
        _tags = _.concat(_tags, tags.userDefinedTags.map(tag => ({ value: tag.tagValue, type: 'normal' })))
      }
      this.entity = {
        ...this.entity,
        detailData: {
          vertex: this.entity.entityName,
          detail: basicInfo
        },
        tags: _tags,
        type: this.entity.entityType,
        name: this.entity.entityName
      }

      let borderColor = ''
      let shadowColor = ''
      let width = 0
      let height = 0
      switch (this.entity.entityType) {
        case 'ip': {
          borderColor = '#CBD9BB'
          shadowColor = 'rgba(126,159,84,0.14)'
          width = 30
          height = 27
          break
        }
        case 'domain': {
          borderColor = '#AFDEED'
          shadowColor = 'rgba(56,172,210,0.14)'
          width = 30
          height = 25
          break
        }
        case 'app': {
          borderColor = '#F5DAA3'
          shadowColor = 'rgba(229,162,25,0.14)'
          width = 25
          height = 30
          break
        }
      }
      return {
        isRoot: true,
        type: 'circle',
        id: this.entity.entityName,
        label: this.entity.entityName,
        nodeType: 'root',
        size: 52,
        x: 0,
        y: 0,
        icon: {
          show: true,
          img: this.generateIconUrl(this.entity.entityType, true, true),
          width,
          height
        },
        style: {
          fill: 'white',
          stroke: borderColor,
          lineWidth: 5
        },
        labelCfg: {
          position: 'bottom',
          offset: 10,
          style: {
            fill: '#353636',
            fontSize: 12
          }
        },
        data: {
          type: this.entity.entityType,
          name: this.entity.entityName,
          data: {
            vertex: this.entity.entityName,
            detail: basicInfo
          },
          tags: _tags
        }
      }
    },
    generatePrimaryNode (props) {
      let width = 0
      let height = 0
      switch (props.data.type) {
        case 'ip': {
          width = 22
          height = 20
          break
        }
        case 'domain': {
          width = 24
          height = 24
          break
        }
        case 'app': {
          width = 20
          height = 24
          break
        }
      }
      return {
        ...props,
        type: 'circle',
        size: 42,
        nodeType: 'primary',
        icon: {
          show: true,
          img: this.generateIconUrl(props.data.type, false),
          width,
          height
        },
        style: {
          fill: 'white',
          stroke: '#A7B0B9',
          lineWidth: 1
        },
        labelCfg: {
          position: 'bottom',
          offset: 10,
          style: {
            fill: '#353636',
            fontSize: 12
          }
        }
      }
    },
    async generateEntityNode (nodeData, data) {
      const tags = await this.queryTags(nodeData.type, data.vertex)
      let _tags = []
      Object.keys(tags).forEach(k => {
        if (k !== 'userDefinedTags' && tags[k]) {
          Object.keys(tags[k]).forEach(k2 => {
            const find = entityDetailTags[this.entity.entityType].find(t => t.name === k2)
            if (find) {
              _tags.push({ key: k2, value: this.tagValueHandler(k, k2, tags[k][k2]), type: find.type })
            }
          })
        }
      })
      if (_.isArray(tags.userDefinedTags)) {
        _tags = _.concat(_tags, tags.userDefinedTags.map(tag => ({ value: tag.tagValue, type: 'normal' })))
      }
      let width = 0
      let height = 0
      switch (nodeData.type) {
        case 'ip': {
          width = 20
          height = 18
          break
        }
        case 'domain': {
          width = 20
          height = 20
          break
        }
        case 'app': {
          width = 17
          height = 20
          break
        }
      }
      return {
        id: data.vertex,
        type: 'circle',
        size: 28,
        nodeType: 'entity',
        icon: {
          show: true,
          img: this.generateIconUrl(nodeData.type, true),
          width,
          height
        },
        style: {
          fill: 'transparent',
          stroke: 'transparent',
          lineWidth: 0
        },
        data: {
          type: nodeData.type,
          isSubdomain: nodeData.isSubdomain || false,
          name: data.vertex,
          data,
          tags: _tags
        }
      }
    },
    generateTempNode (entityType, node, isSubdomain) {
      let width = 0
      let height = 0
      let label = ''
      switch (entityType) {
        case 'ip': {
          width = 24
          height = 22
          if (node.data.type === 'app') {
            label = this.$t('entities.tab.relatedIp')
          } else if (node.data.type === 'ip') {
            label = this.$t('entities.graph.resolveIp')
          }
          break
        }
        case 'subdomain': {
          width = 24
          height = 24
          label = this.$t('entities.subdomain')
          break
        }
        case 'domain': {
          width = 24
          height = 24
          if (node.data.type === 'app') {
            label = this.$t('entities.relatedDomain')
          } else if (node.data.type === 'ip') {
            label = this.$t('entities.graph.resolvedDomain')
          }
          break
        }
        case 'app': {
          width = 20
          height = 24
          label = this.$t('entities.tab.relatedApp')
          break
        }
      }
      return {
        id: `${node.id}-${entityType}-temp`,
        parentId: node.id,
        label,
        type: 'circle',
        size: 28,
        nodeType: 'temp',
        icon: {
          show: true,
          img: this.generateIconUrl(entityType, false),
          width,
          height
        },
        style: {
          fill: 'transparent',
          stroke: 'transparent',
          lineWidth: 0
        },
        labelCfg: {
          position: 'bottom',
          offset: 10,
          style: {
            fill: '#353636',
            fontSize: 12
          }
        },
        data: {
          type: entityType,
          isSubdomain: isSubdomain || false,
          isTemp: true,
          sourceType: node.data.type,
          sourceName: node.id
        }
      }
    },
    hasChildNodeByType (node, type) {
      if (node.data && node.data.childNodes) {
        return node.data.childNodes.some(n => n.data.type === type)
      }
      return false
    },
    async generateSecondLevelNodes (rootNode) {
      /*
      * 2级及以上的整数层节点，先查数量，大于0的才展示
      * TODO 优化：与generatePrimaryNode合并
      * */
      const relatedEntityCount = await this.queryRelatedEntityCount(this.entity.entityType, this.entity.entityName)
      const nodes = []
      if (relatedEntityCount) {
        this.entity.relatedEntityCount = this.handleRelatedEntityCount(rootNode, relatedEntityCount)
        rootNode.data.relatedEntityCount = this.entity.relatedEntityCount
        const ipNode = this.generatePrimaryNode({
          id: 'ip-1',
          parentId: rootNode.id,
          label: this.$t('entities.graph.resolveIp'),
          x: 0,
          y: 300,
          data: {
            sourceName: this.entity.entityName,
            sourceType: this.entity.entityType,
            type: 'ip'
          }
        })
        const domainNode = this.generatePrimaryNode({
          id: 'domain-1',
          parentId: rootNode.id,
          label: this.$t('entity.graph.resolvedDomain'),
          x: 260,
          y: -150,
          data: {
            sourceName: this.entity.entityName,
            sourceType: this.entity.entityType,
            type: 'domain'
          }
        })
        const subdomainNode = this.generatePrimaryNode({
          id: 'domain-1',
          parentId: rootNode.id,
          label: this.$t('entities.subdomain'),
          x: 260,
          y: -150,
          data: {
            sourceName: this.entity.entityName,
            sourceType: this.entity.entityType,
            type: 'domain',
            isSubdomain: true
          }
        })
        const appNode = this.generatePrimaryNode({
          id: 'app-1',
          parentId: rootNode.id,
          label: this.$t('entities.tab.relatedApp'),
          x: -260,
          y: -150,
          data: {
            sourceName: this.entity.entityName,
            sourceType: this.entity.entityType,
            type: 'app'
          }
        })
        switch (this.entity.entityType) {
          case 'ip': {
            if (relatedEntityCount.domainCount) {
              domainNode.data.count = relatedEntityCount.domainCount
              domainNode.label += `(${relatedEntityCount.domainCount})`
              nodes.push(domainNode)
            }
            if (relatedEntityCount.appCount) {
              appNode.data.count = relatedEntityCount.appCount
              appNode.label += `(${relatedEntityCount.appCount})`
              nodes.push(appNode)
            }
            break
          }
          case 'domain': {
            if (relatedEntityCount.ipCount) {
              ipNode.data.count = relatedEntityCount.ipCount
              ipNode.label += `(${relatedEntityCount.ipCount})`
              nodes.push(ipNode)
            }
            if (relatedEntityCount.subDomainCount) {
              subdomainNode.data.count = relatedEntityCount.subDomainCount
              subdomainNode.label += `(${relatedEntityCount.subDomainCount})`
              nodes.push(subdomainNode)
            }
            if (relatedEntityCount.appCount) {
              appNode.data.count = relatedEntityCount.appCount
              appNode.label += `(${relatedEntityCount.appCount})`
              nodes.push(appNode)
            }
            break
          }
          case 'app': {
            if (relatedEntityCount.ipCount) {
              ipNode.data.count = relatedEntityCount.ipCount
              ipNode.label += `(${relatedEntityCount.ipCount})`
              nodes.push(ipNode)
            }
            if (relatedEntityCount.domainCount) {
              domainNode.data.count = relatedEntityCount.domainCount
              domainNode.label += `(${relatedEntityCount.domainCount})`
              nodes.push(domainNode)
            }
            break
          }
        }
        rootNode.data.childNodes = nodes
      }
      return nodes
    },
    // nodes: primary nodes
    async generateHalfLevelNodes (nodes) {
      const nodeArr = []
      if (_.isArray(nodes)) {
        nodeArr.push(...nodes)
      } else {
        nodeArr.push(nodes)
      }
      const newNodes = []

      for (const node of nodeArr) {
        const newNodes2 = []
        const pageNo = node.data.loaded ? node.data.loaded.length / 10 + 1 : 1
        const data = await this.queryRelatedEntity(node.data.sourceType, node.data.sourceName, node.data.type, pageNo)
        if (data) {
          // 生成节点
          for (const d of data.list) {
            newNodes2.push(await this.generateEntityNode(node.data, d))
          }
          // 更新源节点的已拓展数和列表
          this.handleLoaded(node, data, newNodes2)
          newNodes.push(...newNodes2)
        }
      }
      return newNodes
    },
    async queryEntityBasicInfo (entityType, entityName) {
      const response = await axios.get(`${api.entity.entityGraph.basicInfo}/${entityType}?resource=${entityName}`).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      })
      if (response.data && response.data.code === 200) {
        return response.data.data
      } else {
        console.error(response)
        this.entity.loading = false
        this.showError = true
        this.errorMsg = this.errorMsgHandler(response)
        return {}
      }
    },
    async queryTags (entityType, entityName) {
      const response = await axios.get(`${api.entity.entityGraph.tags}/${entityType}?resource=${entityName}`).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      })
      if (response.data && response.data.code === 200) {
        return response.data.data
      } else {
        console.error(response)
        this.entity.loading = false
        this.showError = true
        this.errorMsg = this.errorMsgHandler(response)
        return []
      }
    },
    async queryRelatedEntityCount (entityType, entityName) {
      const response = await axios.get(`${api.entity.entityGraph.relatedEntityCount}/${entityType}?resource=${entityName}`).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      })
      if (response.data && response.data.code === 200) {
        return response.data.data
      } else {
        console.error(response)
        this.entity.loading = false
        this.showError = true
        this.errorMsg = this.errorMsgHandler(response)
        return null
      }
    },
    async queryRelatedEntity (sourceType, sourceName, type, pageNo) {
      if (sourceType === type) {
        // 若源type和关联type都是domain，说明关联type是subdomain
        type = 'subdomain'
      }
      let url = `${api.entity.entityGraph[`${sourceType}Related${_.upperFirst(type)}`]}?resource=${sourceName}&pageSize=10`
      if (pageNo) {
        url += `&pageNo=${pageNo}`
      }
      const response = await axios.get(url).catch(e => {
        console.error(e)
        this.entity.loading = false
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      })
      if (response.data && response.data.code === 200) {
        return response.data.data
      } else {
        console.error(response)
        this.showError = true
        this.entity.loading = false
        this.errorMsg = this.errorMsgHandler(response)
        return null
      }
    },
    /*
    * 若只有一个参数，则取参数的childNodes集合作为line终点；
    * 若有两个参数，则以第一个参数作为line起点，第二个参数作为终点
    * */
    generateEdges (source, target) {
      const edges = []

      const sourceArr = []
      if (!source.length) {
        sourceArr.push(source)
      } else {
        sourceArr.push(...source)
      }
      sourceArr.forEach(s => {
        if (!target) {
          if (s.data && s.data.childNodes) {
            const edges2 = []
            s.data.childNodes.forEach(c => {
              edges2.push({
                id: `${s.id}-${c.id}`,
                source: s.id,
                target: c.id,
                style: {
                  stroke: '#BEBEBE',
                  endArrow: {
                    path: G6.Arrow.triangle(5, 5)
                  }
                },
                data: {}
              })
            })
            s.edges = edges2
            edges.push(...edges2)
          }
        } else {
          const edges2 = []
          const targetArr = []
          if (!target.length) {
            targetArr.push(target)
          } else {
            targetArr.push(...target)
          }
          targetArr.forEach(c => {
            edges2.push({
              id: `${s.id}-${c.id}`,
              source: s.id,
              target: c.id,
              style: {
                stroke: '#BEBEBE',
                endArrow: {
                  path: G6.Arrow.triangle(5, 5)
                }
              },
              data: {}
            })
          })
          s.edges = edges2
          edges.push(...edges2)
        }
      })
      return edges
    },
    generateTempNodesAndEdges (node, relatedEntityCount) {
      // 根据parent node和其childNodes，生成temp node和temp edge
      const tempNodes = []
      const tempEdges = []
      switch (node.data.type) {
        case 'ip': {
          if (relatedEntityCount.domain.total && !this.hasChildNodeByType(node, 'domain')) {
            const tempNode = this.generateTempNode('domain', node)
            tempNode.data.count = relatedEntityCount.domain.total
            const tempEdge = this.generateTempEdge(node, tempNode)
            tempNodes.push(tempNode)
            tempEdges.push(tempEdge)
          }
          if (relatedEntityCount.app.total && !this.hasChildNodeByType(node, 'app')) {
            const tempNode = this.generateTempNode('app', node)
            tempNode.data.count = relatedEntityCount.app.total
            const tempEdge = this.generateTempEdge(node, tempNode)
            tempNodes.push(tempNode)
            tempEdges.push(tempEdge)
          }
          break
        }
        case 'domain': {
          if (relatedEntityCount.ip.total && !this.hasChildNodeByType(node, 'ip')) {
            const tempNode = this.generateTempNode('ip', node)
            tempNode.data.count = relatedEntityCount.ip.total
            const tempEdge = this.generateTempEdge(node, tempNode)
            tempNodes.push(tempNode)
            tempEdges.push(tempEdge)
          }
          if (relatedEntityCount.subDomain.total && !this.hasChildNodeByType(node, 'domain')) {
            const tempNode = this.generateTempNode('domain', node, true)
            tempNode.data.count = relatedEntityCount.subDomain.total
            const tempEdge = this.generateTempEdge(node, tempNode)
            tempNodes.push(tempNode)
            tempEdges.push(tempEdge)
          }
          if (relatedEntityCount.app.total && !this.hasChildNodeByType(node, 'app')) {
            const tempNode = this.generateTempNode('app', node)
            tempNode.data.count = relatedEntityCount.app.total
            const tempEdge = this.generateTempEdge(node, tempNode)
            tempNodes.push(tempNode)
            tempEdges.push(tempEdge)
          }
          break
        }
        case 'app': {
          if (relatedEntityCount.ip.total && !this.hasChildNodeByType(node, 'ip')) {
            const tempNode = this.generateTempNode('ip', node)
            tempNode.data.count = relatedEntityCount.ip.total
            const tempEdge = this.generateTempEdge(node, tempNode)
            tempNodes.push(tempNode)
            tempEdges.push(tempEdge)
          }
          if (relatedEntityCount.domain.total && !this.hasChildNodeByType(node, 'domain')) {
            const tempNode = this.generateTempNode('domain', node)
            tempNode.data.count = relatedEntityCount.domain.total
            const tempEdge = this.generateTempEdge(node, tempNode)
            tempNodes.push(tempNode)
            tempEdges.push(tempEdge)
          }
          break
        }
      }
      return { tempNodes, tempEdges }
    },
    generateTempEdge (node, tempNode) {
      return {
        id: `${node.id}-${tempNode.id}`,
        source: node.id,
        target: tempNode.id,
        style: {
          stroke: '#DDD',
          lineDash: [3, 2],
          endArrow: {
            path: G6.Arrow.triangle(5, 5)
          },
          data: {
            isTemp: true
          }
        }
      }
    },
    handleLoaded (node, data, childNodes) {
      if (!node.data.loaded) {
        node.data.loaded = []
      }
      node.data.loaded.push(...data.list)

      if (!node.data.childNodes) {
        node.data.childNodes = []
      }
      node.data.childNodes.push(...childNodes)
    },
    handleRelatedEntityCount (node, relatedEntityTotalCount) {
      const relatedEntityCount = {
        ip: { total: relatedEntityTotalCount.ipCount, current: null },
        domain: { total: relatedEntityTotalCount.domainCount, current: null },
        subDomain: { total: relatedEntityTotalCount.subDomainCount, current: null },
        app: { total: relatedEntityTotalCount.appCount, current: null }
      }
      if (node.data.childNodes) {
        node.data.childNodes.forEach(n => {
          switch (n.data.type) {
            case 'ip': {
              relatedEntityCount.ip.current = n.data.loaded ? n.data.loaded.length : 0
              n.data.count = relatedEntityTotalCount.ipCount
              break
            }
            case 'domain': {
              if (n.data.isSubdomain) {
                relatedEntityCount.subDomain.current = n.data.loaded ? n.data.loaded.length : 0
                n.data.count = relatedEntityTotalCount.subDomainCount
              } else {
                relatedEntityCount.domain.current = n.data.loaded ? n.data.loaded.length : 0
                n.data.count = relatedEntityTotalCount.domainCount
              }
              break
            }
            case 'app': {
              relatedEntityCount.app.current = n.data.loaded ? n.data.loaded.length : 0
              n.data.count = relatedEntityTotalCount.appCount
              break
            }
          }
        })
      }
      return relatedEntityCount
    },
    addNodes (nodes) {
      const _nodes = nodes.filter(n => {
        return !this.graphData.nodes.some(n2 => n2.id === n.id)
      })
      this.graphData.nodes.push(..._nodes)
    },
    addEdges (edges) {
      const _edges = edges.filter(e => {
        return !this.graphData.edges.some(e2 => e2.source === e.source && e2.target === e.target)
      })
      this.graphData.edges.push(..._edges)
    },
    updateRelatedCount (node, childNodes) {
      childNodes.forEach(c => {
        this.entity.relatedEntityCount[c.data.isSubdomain ? 'subDomain' : c.data.type].current = c.data.loaded.length
      })
    },
    getNodeLevel (id) {
      const { findShortestPath } = Algorithm
      const info = findShortestPath(this.graphData, this.entity.entityName, id)
      return info.length
    },
    onCloseBlock () {
      // todo 关闭右侧graph面板
      this.rightBox.mode = ''
      this.rightBox.show = false
    },
    onExpandDetail (mode) {
      this.rightBox.mode = mode
    },
    onExpand (val) {
      // todo 调用接口，拓展关系
    },
    onMouseenter (val) {
      // todo 鼠标移动过graph列表名称时，graph图的分支图形会变大一点
      if (!val.isTrusted) {
        // 鼠标移动反馈
      }
    },
    buildTooltip () {
      const _this = this
      return new G6.Tooltip({
        offsetX: 10,
        offsetY: 20,
        itemTypes: ['node'],
        getContent (e) {
          const node = e.item.getModel()
          if (node.nodeType === 'primary') {
            let iconClass = ''
            let title = ''
            switch (node.data.type) {
              case 'ip': {
                iconClass = 'cn-icon cn-icon-resolve-ip'
                title = _this.$t('entities.graph.resolveIp')
                break
              }
              case 'domain': {
                iconClass = 'cn-icon cn-icon-subdomain'
                title = _this.$t('entity.graph.resolvedDomain')
                break
              }
              case 'app': {
                iconClass = 'cn-icon cn-icon-app-name'
                title = _this.$t('entities.tab.relatedApp')
                break
              }
            }
            return `<div class="primary-node-tooltip">
              <div class="tooltip__header"><i class="${iconClass}"></i><span class="tooltip__title">${title}</span></div>
              <div class="tooltip__content">
                <span>${_this.$t('entity.graph.associatedCount')}:&nbsp;${node.data.count || 0}</span>
                <span>${_this.$t('entity.graph.expandedEntityCount')}:&nbsp;${node.data.loaded ? node.data.loaded.length : 0}</span>
              </div>
            </div>`
          } else if (node.nodeType === 'entity' || node.nodeType === 'root') {
            if (node.data && node.data.tags && node.data.tags.length > 0) {
              return `<div class="entity-node-tooltip">
                <div class="tooltip__header">
                  <span class="tooltip__title">${node.id}</span>
                </div>
                <div class="tooltip__content">
                  <div class="content-header">
                    <div class="header-icon"></div>
                    <span>${_this.$t('entity.graph.tags')}</span>
                  </div>
                  <div class="content-tag-list">${generateTagHTML(node.data.tags)}</div>
                </div>
              </div>`
            } else {
              return `<div style="padding: 0 6px; font-size: 15px; line-height: 15px; color: #111;">${node.id}</div>`
            }
          } else if (node.nodeType === 'temp') {
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
            <li code='zoomOut'><i class="cn-icon cn-icon-zoom-in"></i></li>
            <li code='zoomIn'><i class="cn-icon cn-icon-zoom-out"></i></li>
            <li code='undo'><i class="cn-icon cn-icon-next-step"></i></li>
            <li code='redo'><i class="cn-icon cn-icon-pre-step"></i></li>
            <li code='autoZoom'><i class="cn-icon cn-icon-auto-zoom"></i></li>
          </ul>`
        },
        handleClick: (code, graph) => {
          console.info(code)
          toolbar.handleDefaultOperator(code)
        }
      })
      return toolbar
    },
    async expandList (sourceNodeId, nodeId) {
      const sourceNode = this.graphData.nodes.find(n => n.id === sourceNodeId)
      const node = this.graphData.nodes.find(n => n.id === nodeId)
      if (node && sourceNode) {
        console.info(node)
        if (node.data.childNodes && node.data.childNodes.length < 50) {
          if (node.data.childNodes.length >= node.data.count) {
            this.$message.error(this.$t('entities.graph.allEntitiesExpanded'))
          } else {
            this.entity.loading = true
            const queryEntityNodes = await this.generateHalfLevelNodes(node)
            const relatedEntityCount = await this.queryRelatedEntityCount(sourceNode.data.type, sourceNodeId)
            // 赋值总数和已拓展数。entity node可从其childNodes取到已拓展数
            this.entity = {
              ...this.entity,
              relatedEntityCount: this.handleRelatedEntityCount(sourceNode, relatedEntityCount),
              listData: node.data.loaded,
              loading: false
            }
            sourceNode.data.relatedEntityCount = this.entity.relatedEntityCount

            this.addNodes(queryEntityNodes)
            this.addEdges(this.generateEdges(node, queryEntityNodes))
            this.graph.changeData(this.graphData)
          }
        } else {
          this.$message.error(this.$t('entities.graph.expandedNumberMaxLimit'))
        }
      }
    },
    async expandDetailList (expandType, currentName) {
      const currentNode = this.graphData.nodes.find(n => n.id === currentName)
      // 如果存在primary node，直接拓展
      const _primaryNode = currentNode.data.childNodes ? currentNode.data.childNodes.find(n => n.data.type === expandType) : null
      if (_primaryNode) {
        await this.expandList(currentName, _primaryNode.id)
      } else {
        // 如果是temp node，删掉，新增primary node，再拓展
        const tempNode = this.graphData.nodes.find(n => n.nodeType === 'temp' && n.data.sourceName === currentName && n.data.type === expandType)
        if (tempNode) {
          // 先清除此temp node和temp edge
          this.graphData.nodes = this.graphData.nodes.filter(n => {
            return n.id !== tempNode.id
          })
          this.graphData.edges = this.graphData.edges.filter(e => {
            return e.target !== tempNode.id
          })

          const primaryNode = this.generatePrimaryNode({
            id: `${tempNode.data.type}-${tempNode.data.sourceName}`,
            label: tempNode.label + `(${tempNode.data.count})`,
            data: {
              sourceName: tempNode.data.sourceName,
              sourceType: tempNode.data.sourceType,
              type: tempNode.data.type,
              isSubdomain: tempNode.data.isSubdomain || false,
              count: tempNode.data.count
            }
          })
          // 新node放入source node的childNodes中
          if (!currentNode.data.childNodes) {
            currentNode.data.childNodes = []
          }
          currentNode.data.childNodes.push(primaryNode)
          const edge = this.generateEdges(currentNode, primaryNode)
          this.addNodes([primaryNode])
          this.addEdges(edge)
          // 判断primary层级，若大于等于5，则不继续拓展entity node，并给用户提示。否则拓展entity node
          const entityNodes = []
          const edges = []
          const level = this.getNodeLevel(primaryNode.id)
          if (level < 9) {
            this.entity.loading = true
            const queryEntityNodes = await this.generateHalfLevelNodes(primaryNode)
            this.entity.loading = false
            this.updateRelatedCount(currentNode, [primaryNode])
            entityNodes.push(...queryEntityNodes)
            edges.push(...this.generateEdges(primaryNode))
            // TODO 高亮
          } else {
            this.$message.error(this.$t('entities.graph.expandedLevelMaxLimit'))
          }
          this.addNodes(entityNodes)
          this.addEdges(edges)
          this.graph.changeData(this.graphData)
        }
      }
    }
  },
  async mounted () {
    if (this.entity.entityType && this.entity.entityName) {
      await this.init()
    }
  },
  setup () {
    const route = useRoute()
    const { entityType, entityName } = route.query
    const entity = ref({
      entityType,
      entityName
    })
    const graph = shallowRef(null)
    const rightBox = ref({
      mode: `${entityType}Detail`, // ipList, ipDetail, domainList, domainDetail, appList, appDetail
      show: true
    })

    // echarts关系图的节点和连线
    const graphData = shallowRef({})
    return {
      graphData,
      entity,
      rightBox,
      graph
    }
  }
}
</script>
<style lang="scss">
.graph-toolbar {
  position: fixed;
  top: 100px;
  left: 0;

  .toolbar__tools {
    display: flex;
    padding: 0 10px;

    li {
      display: flex;
      justify-content: center;
      width: 32px;
      margin-right: 4px;
      cursor: pointer;

      i {
        color: #575757;
        font-size: 18px;
      }
    }
  }
}
.entity-graph {
  display: flex;

  .entity-graph__chart {
    width: 100%;

    .graph-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: transparent !important;
      transition: linear all .2s;

      .graph-node__text {
        width: 120px;
        font-size: 12px;
        color: #353636;
      }

      &.graph-node--root {
        padding-top: 18px;
        width: 82px;
        height: 82px;
        border: 5px solid !important;
        // 覆盖自带的node点击效果
        &.rel-node-checked {
          box-shadow: none;
          animation: none;
        }
        &.graph-node--ip {
          border-color: #CBD9BB !important;
          box-shadow: 0 0 0 8px rgba(126,159,84,0.14);
          i {
            color: #7E9F54;
          }
        }
        &.graph-node--domain {
          border-color: #AFDEED !important;
          box-shadow: 0 0 0 8px rgba(56,172,210,0.14);
          i {
            color: #38ACD2;
          }
        }
        &.graph-node--app {
          border-color: #F5DAA3 !important;
          box-shadow: 0 0 0 8px rgba(229,162,25,0.14);
          i {
            color: #E5A219;
          }
        }
        i {
          font-size: 36px;
        }
        .graph-node__text {
          padding-top: 30px;
        }
      }

      &.graph-node--primary {
        padding-top: 20px;
        width: 66px;
        height: 66px;
        border: 1px solid #A7B0B9 !important;
        box-shadow: none;

        // 覆盖自带的node点击效果
        &.rel-node-checked {
          box-shadow: 0 0 0 5px rgba(151,151,151,0.21);
          animation: none;
          border-color: #778391 !important;
        }
        i {
          font-size: 24px;
          color: #778391;
        }
        .graph-node__text {
          padding-top: 24px;
        }
      }

      &.graph-node--entity {
        width: 21px;
        height: 21px;
        justify-content: center;
        border: none !important;

        &.graph-node--ip {
          i {
            color: #7E9F54;
          }
        }
        &.graph-node--domain {
          i {
            color: #38ACD2;
          }
        }
        &.graph-node--app {
          i {
            color: #E5A219;
          }
        }
        i {
          font-size: 21px;
        }
      }
    }
  }

  .entity-graph__right-box {
    & > div {
      left: unset !important;
      right: 0 !important;
    }
    .entity-graph__detail {
      height: calc(100% - 100px) !important;
      top: 100px !important;
      // border-left: 1px solid #E2E5EC;
      overflow: auto;
      padding: 20px;
    }
  }

  .g6-component-tooltip {
    box-shadow: -1px 1px 10px -1px rgba(205,205,205,0.85);

    .primary-node-tooltip {
      padding: 5px;

      .tooltip__header {
        display: flex;
        align-items: center;

        i {
          color: #717171;
          font-size: 14px;
        }
        .tooltip__title {
          padding-left: 6px;
          font-size: 15px;
          line-height: 15px;
          color: #111;
        }
      }
      .tooltip__content {
        padding-top: 10px;
        color: #222;
        font-size: 12px;

        span:first-of-type {
          padding-right: 20px;
        }
      }
    }
    .entity-node-tooltip {
      width: 300px;
      padding: 5px;

      .tooltip__header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        .tooltip__title {
          font-size: 15px;
          line-height: 15px;
          color: #111;
        }
      }

      .tooltip__content {
        display: flex;
        flex-direction: column;

        .content-header {
          display: flex;
          align-items: center;

          .header-icon {
            width: 3px !important;
            height: 12px !important;
            background: #38ACD2;
            border-radius: 1px;
            margin-right: 6px;
          }
        }
        .content-tag-list {
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;

          .entity-tag {
            margin: 10px 0;
            padding: 0 8px;
            height: 20px;
            font-size: 12px;
            border: 1px solid;
            border-radius: 2px;

            $normal-color: #778391;
            $normal-light-color: #F7F8F9;
            $negative-color: #E26154;
            $negative-light-color: #FEF6F5;
            $positive-color: #749F4D;
            $positive-light-color: #F7FAF5;
            &.entity-tag--level-two-normal {
              border-color: $normal-color;
              color: $normal-color;
              background-color: $normal-light-color;
            }
            &.entity-tag--level-two-negative {
              border-color: $negative-color;
              color: $negative-color;
              background-color: $negative-light-color;
            }
            &.entity-tag--level-two-positive {
              border-color: $positive-color;
              color: $positive-color;
              background-color: $positive-light-color;
            }
          }
        }
      }
    }
  }
}
</style>
