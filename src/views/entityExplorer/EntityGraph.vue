<template>
  <div class="entity-graph">
    <div class="entity-graph__chart" id="entityGraph">
      <relation-graph ref="relationGraph" :options="chartOption">
        <template #node="{ node }">
          <!-- root节点 -->
          <template v-if="node.data.level === '1'">
            <i :class="node.data.iconClass"></i>
            <div class="graph-node__text">{{node.text}}</div>
          </template>
          <!-- primary节点 -->
          <template v-else-if="node.data.level && node.data.level.length === 1">
            <i :class="node.data.iconClass"></i>
            <div class="graph-node__text">{{node.text}}({{node.data.count}})</div>
          </template>
          <!-- entity节点 -->
          <template v-else-if="node.data.level && node.data.level.length === 3">
            <i :class="node.data.iconClass"></i>
          </template>
        </template>
      </relation-graph>
    </div>
    <div class="entity-graph__detail">
      <ip-list
          v-if="mode === 'ipList'"
          :entity="entity"
          @closeBlock="onCloseBlock"
          @mouseenter="onMouseenter"
          @expandDetail="onExpandDetail">
      </ip-list>
      <app-or-domain-list
          v-if="mode === 'appList' || mode === 'domainList'"
          :entity="entity"
          @expandDetail="onExpandDetail"
          @mouseenter="onMouseenter"
          @closeBlock="onCloseBlock">
      </app-or-domain-list>
      <graph-detail
          v-if="mode === 'appDetail' || mode === 'ipDetail' || mode === 'domainDetail'"
          :entity="entity"
          @expand="onExpand"
          @closeBlock="onCloseBlock">
      </graph-detail>
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
import RelationGraph from 'relation-graph/vue3'

export default {
  name: 'EntityRelationship',
  components: {
    IpList,
    GraphDetail,
    AppOrDomainList,
    RelationGraph
  },
  data () {
    return {
      chartOption: {
        debug: false
      }
    }
  },
  methods: {
    async init () {
      /* 定义了以下几种节点类型和节点状态：
      *  1.类型：根节点 root；状态：ip、app、domain;
      *  2.类型：普通节点 primary；状态：normal、active;
      *  3.类型：实体 entity；状态1：ip、app、domain；状态2：normal、active.
      *
      *  ip基色#7E9F54，domain基色#38ACD2，app基色E5A219
      *
      *  为方便在逻辑上区分实体列表（圆圈节点）和实体（纯图标节点），将层级分为整层和半层两种，实体列表为整层，实体为半层。
      *  */
      this.graphData.rootId = this.entity.entityName
      // 初始化时加载到2层半
      const rootNode = this.generateRootNode()
      const secondLevelNodes = await this.generateSecondLevelNodes(rootNode)
      const secondHalfLevelNodes = await this.generateHalfLevelNodes(secondLevelNodes)
      this.graphData.nodes = [rootNode, ...secondLevelNodes, ...secondHalfLevelNodes]
      this.graphData.lines = this.generateLines(rootNode)
      this.graphData.lines.push(...this.generateLines(secondLevelNodes))

      console.info(JSON.stringify(this.graphData))
      this.$refs.relationGraph.setJsonData(this.graphData)
    },
    generateRootNode () {
      let iconClass = ''
      switch (this.entity.entityType) {
        case 'ip': {
          iconClass = 'cn-icon cn-icon-resolve-ip'
          break
        }
        case 'domain': {
          iconClass = 'cn-icon cn-icon-domain1'
          break
        }
        case 'app': {
          iconClass = 'cn-icon cn-icon-app-name'
          break
        }
      }
      return {
        id: this.entity.entityName,
        text: this.entity.entityName,
        nodeShape: 0,
        styleClass: `graph-node graph-node--root graph-node--${this.entity.entityType}`,
        data: { level: '1', iconClass }
      }
    },
    generatePrimaryNode (props) {
      const node = {
        styleClass: 'graph-node graph-node--primary'
      }
      return {
        ...node,
        ...props
      }
    },
    generateEntityNode (level, relatedType, data) {
      let iconClass = ''
      switch (relatedType) {
        case 'ip': {
          iconClass = 'cn-icon cn-icon-resolve-ip'
          break
        }
        case 'domain': {
          iconClass = 'cn-icon cn-icon-subdomain'
          break
        }
        case 'app': {
          iconClass = 'cn-icon cn-icon-app-name'
          break
        }
      }
      return {
        id: data.vertex,
        text: data.vertex,
        styleClass: `graph-node graph-node--entity graph-node--${relatedType}`,
        data: {
          level,
          iconClass,
          entityName: data.vertex,
          entityType: relatedType
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
          text: this.$t('entities.graph.resolveIp'),
          data: {
            level: '2',
            iconClass: 'cn-icon cn-icon-resolve-ip',
            entityName: this.entity.entityName,
            entityType: this.entity.entityType,
            relatedType: 'ip'
          }
        })
        const domainNode = this.generatePrimaryNode({
          id: 'domain-1',
          text: this.$t('entity.graph.resolveDomain'),
          data: {
            level: '2',
            iconClass: 'cn-icon cn-icon-subdomain',
            entityName: this.entity.entityName,
            entityType: this.entity.entityType,
            relatedType: 'domain'
          }
        })
        const subdomainNode = this.generatePrimaryNode({
          id: 'domain-1',
          text: this.$t('entities.subdomain'),
          data: {
            level: '2',
            iconClass: 'cn-icon cn-icon-subdomain',
            entityName: this.entity.entityName,
            entityType: this.entity.entityType,
            relatedType: 'domain'
          }
        })
        const appNode = this.generatePrimaryNode({
          id: 'app-1',
          text: this.$t('entities.tab.relatedApp'),
          data: {
            level: '2',
            iconClass: 'cn-icon cn-icon-app-name',
            entityName: this.entity.entityName,
            entityType: this.entity.entityType,
            relatedType: 'app'
          }
        })
        switch (this.entity.entityType) {
          case 'ip': {
            if (relatedEntityCount.domainCount) {
              domainNode.data.count = relatedEntityCount.domainCount
              nodes.push(domainNode)
            }
            if (relatedEntityCount.appCount) {
              domainNode.data.count = relatedEntityCount.appCount
              nodes.push(appNode)
            }
            break
          }
          case 'domain': {
            if (relatedEntityCount.ipCount) {
              ipNode.data.count = relatedEntityCount.ipCount
              nodes.push(ipNode)
            }
            if (relatedEntityCount.subDomainCount) {
              subdomainNode.data.count = relatedEntityCount.subDomainCount
              nodes.push(subdomainNode)
            }
            if (relatedEntityCount.appCount) {
              appNode.data.count = relatedEntityCount.appCount
              nodes.push(appNode)
            }
            break
          }
          case 'app': {
            if (relatedEntityCount.ipCount) {
              ipNode.data.count = relatedEntityCount.ipCount
              nodes.push(ipNode)
            }
            if (relatedEntityCount.domainCount) {
              domainNode.data.count = relatedEntityCount.domainCount
              nodes.push(domainNode)
            }
            break
          }
        }
        rootNode.data.childNodes = nodes
      }
      return nodes
    },
    async generateHalfLevelNodes (nodes) {
      const newNodes = []
      for (const node of nodes) {
        const newNodes2 = []
        const data = await this.queryRelatedEntity(node.data.entityType, node.data.entityName, node.data.relatedType)
        if (data) {
          // 生成节点
          data.list.forEach(d => {
            newNodes2.push(this.generateEntityNode(String(parseInt(node.data.level) + 0.5), node.data.relatedType, d))
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
    async queryRelatedEntity (entityType, entityName, relatedType) {
      if (entityType === relatedType) {
        // 若源type和关联type都是domain，说明关联type是subdomain
        relatedType = 'subdomain'
      }
      const response = await axios.get(`${api.entity.entityGraph[`${entityType}Related${_.upperFirst(relatedType)}`]}?resource=${entityName}`).catch(e => {
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
    generateLines (source, target) {
      const lines = []

      if (!target) {
        const sourceArr = []
        if (!source.length) {
          sourceArr.push(source)
        } else {
          sourceArr.push(...source)
        }
        sourceArr.forEach(s => {
          if (s.data && s.data.childNodes) {
            const lines2 = []
            s.data.childNodes.forEach(c => {
              lines2.push({
                from: s.id,
                to: c.id,
                color: '#BEBEBE'
              })
            })
            s.lines = lines2
            lines.push(...lines2)
          }
        })
      }
      return lines
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
      this.mode = ''
    },
    onExpandDetail (mode) {
      this.mode = mode
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
    const mode = ref('ipList') // ipList, ipDetail, domainList, domainDetail, appList, appDetail

    // echarts关系图的节点和连线
    const graphData = ref({})
    // 从url获取实体类型、名称，若为空直接报错
    const myChart = shallowRef(null)
    return {
      graphData,
      entity,
      myChart,
      mode
    }
  }
}
</script>
<style lang="scss">
.entity-graph {
  display: flex;

  .rel-node-peel {
    padding: 4px;
  }
  .entity-graph__chart {
    width: calc(100% - 360px);

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
          box-shadow: 0 0 0 8px #EDF1E7;
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
          box-shadow: 0 0 0 8px #FBF2DF;
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

  .entity-graph__detail {
    width: 360px;
    border-left: 1px solid #E2E5EC;
    overflow: auto;
    padding: 20px;
  }
}
</style>
