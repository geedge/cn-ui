<template>
  <div class="entity-graph">
    <div class="entity-graph__chart" id="entityGraph">
    </div>
    <div class="entity-graph__right-box">
      <el-drawer
          v-model="rightBox.show"
          direction="rtl"
          custom-class="entity-graph__detail"
          :modal="false"
          :size="360"
          :with-header="false"
          destroy-on-close>
        <ip-list
            v-if="rightBox.mode === 'ipList'"
            :entity="entity"
            @closeBlock="onCloseBlock"
            @mouseenter="onMouseenter"
            @expandDetail="onExpandDetail">
        </ip-list>
        <app-or-domain-list
            v-if="rightBox.mode === 'appList' || rightBox.mode === 'domainList'"
            :entity="entity"
            @expandDetail="onExpandDetail"
            @mouseenter="onMouseenter"
            @closeBlock="onCloseBlock">
        </app-or-domain-list>
        <graph-detail
            v-if="rightBox.mode === 'appDetail' || rightBox.mode === 'ipDetail' || rightBox.mode === 'domainDetail'"
            :entity="entity"
            @expand="onExpand"
            @closeBlock="onCloseBlock">
        </graph-detail>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import IpList from '@/views/entityExplorer/entityGraphDetail/IpList'
import GraphDetail from '@/views/entityExplorer/entityGraphDetail/GraphDetail'
import AppOrDomainList from '@/views/entityExplorer/entityGraphDetail/AppOrDomainList'
import { useRoute } from 'vue-router'
import { ref, shallowRef } from 'vue'
import _ from 'lodash'
import { api } from '@/utils/api'
import axios from 'axios'
import G6 from '@antv/g6'
import testData from './testData'

export default {
  name: 'EntityRelationship',
  components: {
    IpList,
    GraphDetail,
    AppOrDomainList
  },
  data () {
    return {
      rightBox: {
        show: false
      },
      chartOption: {
        container: 'entityGraph',
        layout: {
          type: 'force',
          preventOverlap: true,
          linkDistance: (d) => {
            if (!d.target.isRoot && d.target.data.level && d.target.data.level.length === 1) {
              return 300
            }
            return 80
          },
          nodeStrength: (d) => {
            if (!d.isRoot && d.data.level && d.data.level.length === 1) {
              return -50
            }
            return -10
          },
          edgeStrength: (d) => {
            if (!d.target.isRoot && d.target.data.level && d.target.data.level.length === 1) {
              return 0.1
            }
            return 0.7
          }
        },
        modes: {
          default: ['drag-nodes', 'click-select', 'zoom-canvas']
        }
      }
    }
  },
  methods: {
    async init () {
      const _this = this
      const graph = new G6.Graph(this.chartOption)
      /*const rootNode = this.generateRootNode()
      const secondLevelNodes = await this.generateSecondLevelNodes(rootNode)
      const secondHalfLevelNodes = await this.generateHalfLevelNodes(secondLevelNodes)
      this.graphData.nodes = [rootNode, ...secondLevelNodes, ...secondHalfLevelNodes]
      const rootEdges = this.generateEdges(rootNode)
      const secondEdges = this.generateEdges(secondLevelNodes)
      this.graphData.edges = [...rootEdges, ...secondEdges]
      graph.data(this.graphData)*/
      graph.data(testData)
      graph.render()

      graph.on('node:dragstart', function (e) {
        graph.layout()
        refreshDragedNodePosition(e)
      })
      graph.on('node:drag', function (e) {
        refreshDragedNodePosition(e)
      })
      graph.on('node:dragend', function (e) {
        e.item.get('model').fx = null
        e.item.get('model').fy = null
      })
      graph.on('node:click', function (e) {
        const node = e.item.get('model')
        if (!_this.rightBox.show) {
          _this.rightBox.show = true
        }
        if (node.data.level && node.data.level.length === 1) {
          _this.rightBox.mode = `${node.data.type}List`
        } else {
          _this.rightBox.mode = `${node.data.type}Detail`
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
      return `${window.location.protocol}//${window.location.host}/images/entity-symbol2/${entityType}${subfix}.svg`
    },
    generateRootNode () {
      let borderColor = ''
      let shadowColor = ''
      let width = 0
      let height = 0
      switch (this.entity.entityType) {
        case 'ip': {
          borderColor = '#CBD9BB'
          shadowColor = 'rgba(126,159,84,0.14)'
          width = 36
          height = 33
          break
        }
        case 'domain': {
          borderColor = '#AFDEED'
          shadowColor = 'rgba(56,172,210,0.14)'
          width = 36
          height = 30
          break
        }
        case 'app': {
          borderColor = '#F5DAA3'
          shadowColor = 'rgba(229,162,25,0.14)'
          width = 30
          height = 36
          break
        }
      }
      return {
        isRoot: true,
        type: 'circle',
        id: this.entity.entityName,
        label: this.entity.entityName,
        size: 82,
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
          level: '1'
        }
      }
    },
    generatePrimaryNode (props) {
      let width = 0
      let height = 0
      switch (props.data.type) {
        case 'ip': {
          width = 24
          height = 22
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
        size: 66,
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
    generateEntityNode (level, type, data) {
      let width = 0
      let height = 0
      switch (type) {
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
        icon: {
          show: true,
          img: this.generateIconUrl(type, true),
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
          level,
          type,
          name: data.vertex,
          data
        }
      }
    },
    async generateSecondLevelNodes (rootNode) {
      /*
      * 2级及以上的整数层节点，先查数量，大于0的才展示
      * */
      const relatedEntityCount = await this.queryRelatedEntityCount(this.entity.entityType, this.entity.entityName)
      const nodes = []
      if (relatedEntityCount) {
        const ipNode = this.generatePrimaryNode({
          id: 'ip-1',
          label: this.$t('entities.graph.resolveIp'),
          x: 0,
          y: 300,
          data: {
            level: '2',
            sourceName: this.entity.entityName,
            sourceType: this.entity.entityType,
            type: 'ip'
          }
        })
        const domainNode = this.generatePrimaryNode({
          id: 'domain-1',
          label: this.$t('entity.graph.resolveDomain'),
          x: 260,
          y: -150,
          data: {
            level: '2',
            sourceName: this.entity.entityName,
            sourceType: this.entity.entityType,
            type: 'domain'
          }
        })
        const subdomainNode = this.generatePrimaryNode({
          id: 'domain-1',
          label: this.$t('entities.subdomain'),
          x: 260,
          y: -150,
          data: {
            level: '2',
            sourceName: this.entity.entityName,
            sourceType: this.entity.entityType,
            type: 'domain'
          }
        })
        const appNode = this.generatePrimaryNode({
          id: 'app-1',
          label: this.$t('entities.tab.relatedApp'),
          x: -260,
          y: -150,
          data: {
            level: '2',
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
      console.info(nodes)
      return nodes
    },
    async generateHalfLevelNodes (nodes) {
      const newNodes = []
      for (const node of nodes) {
        const newNodes2 = []
        const data = await this.queryRelatedEntity(node.data.sourceType, node.data.sourceName, node.data.type)
        if (data) {
          // 生成节点
          data.list.forEach(d => {
            newNodes2.push(this.generateEntityNode(String(parseInt(node.data.level) + 0.5), node.data.type, d))
          })
          // 更新源节点的已拓展数和列表
          this.handleLoaded(node, data, newNodes2)
          newNodes.push(...newNodes2)
        }
      }
      return newNodes
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
        this.showError = true
        this.errorMsg = this.errorMsgHandler(response)
        return null
      }
    },
    async queryRelatedEntity (sourceType, sourceName, type) {
      if (sourceType === type) {
        // 若源type和关联type都是domain，说明关联type是subdomain
        type = 'subdomain'
      }
      const response = await axios.get(`${api.entity.entityGraph[`${sourceType}Related${_.upperFirst(type)}`]}?resource=${sourceName}`).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      })
      if (response.data && response.data.code === 200) {
        return response.data.data
      } else {
        console.error(response)
        this.showError = true
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

      if (!target) {
        const sourceArr = []
        if (!source.length) {
          sourceArr.push(source)
        } else {
          sourceArr.push(...source)
        }
        sourceArr.forEach(s => {
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
                }
              })
            })
            s.edges = edges2
            edges.push(...edges2)
          }
        })
      }
      return edges
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
    const entity = {
      entityType,
      entityName
    }
    const rightBox = ref({
      mode: 'ipList', // ipList, ipDetail, domainList, domainDetail, appList, appDetail
      show: false
    })

    // echarts关系图的节点和连线
    const graphData = ref({})
    // 从url获取实体类型、名称，若为空直接报错
    const myChart = shallowRef(null)
    return {
      graphData,
      entity,
      myChart,
      rightBox
    }
  }
}
</script>
<style lang="scss">
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
      width: 360px;
    }
    .entity-graph__detail {
      height: calc(100% - 100px) !important;
      top: 100px !important;
      border-left: 1px solid #E2E5EC;
      overflow: auto;
      padding: 20px;
    }
  }
}
</style>
