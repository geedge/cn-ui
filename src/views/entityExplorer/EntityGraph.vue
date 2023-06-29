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
            <div class="graph-node__text">{{node.text}}</div>
          </template>
          <!-- entity节点 -->
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
      chartOption: {}
    }
  },
  methods: {
    async init () {
      /* 定义了以下几种节点类型和节点状态：
      *  1.类型：根节点 root；状态：ip、app、domain;
      *  2.类型：普通节点 primary；状态：normal、active;
      *  3.类型：实体 entity；状态1：ip、app、domain；状态2：normal、active.
      *  ip基色#7E9F54，domain基色#38ACD2，app基色E5A219
      *  */
      this.graphData.rootId = this.entity.entityName
      const rootNode = this.generateRootNode()
      const secondLevelNodes = await this.generateSecondLevelNodes()
      this.graphData.nodes = [rootNode, ...secondLevelNodes]
      this.graphData.lines = this.generateLines(rootNode, secondLevelNodes)
      console.info(this.graphData)
      this.$refs.relationGraph.setJsonData(this.graphData)
    },
    generateRootNode () {
      let nodeIconClass = ''
      switch (this.entity.entityType) {
        case 'ip': {
          nodeIconClass = 'cn-icon cn-icon-resolve-ip'
          break
        }
        case 'domain': {
          nodeIconClass = 'cn-icon cn-icon-domain1'
          break
        }
        case 'app': {
          nodeIconClass = 'cn-icon cn-icon-app-name'
          break
        }
      }
      return {
        id: this.entity.entityName,
        text: this.entity.entityName,
        nodeShape: 0,
        styleClass: `graph-node graph-node--root graph-node--${this.entity.entityType}`,
        data: { level: '1', iconClass: nodeIconClass }
      }
    },
    generatePrimaryNode (props) {
      const node = {
        styleClass: `graph-node graph-node--primary graph-node--${this.entity.entityType}`
      }
      return {
        ...node,
        ...props
      }
    },
    async generateSecondLevelNodes () {
      /*
      * 2级及以上的整数节点，先查数量，大于0的才展示
      * */
      const relatedEntityCount = await this.queryRelatedEntityCount(this.entity.entityType, this.entity.entityName)
      const ipNode = this.generatePrimaryNode({
        id: 'ip-1',
        text: this.$t('entities.graph.resolveIp'),
        data: { level: '2', iconClass: 'cn-icon cn-icon-resolve-ip' }
      })
      const domainNode = this.generatePrimaryNode({
        id: 'domain-1',
        text: this.$t('entity.graph.resolveDomain'),
        data: { level: '2', iconClass: 'cn-icon cn-icon-subdomain' }
      })
      const subdomainNode = this.generatePrimaryNode({
        id: 'domain-1',
        text: this.$t('entities.subdomain'),
        data: { level: '2', iconClass: 'cn-icon cn-icon-subdomain' }
      })
      const appNode = this.generatePrimaryNode({
        id: 'app-1',
        text: this.$t('entities.tab.relatedApp'),
        data: { level: '2', iconClass: 'cn-icon cn-icon-app-name' }
      })
      const nodes = []
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
      return nodes
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
    generateLines (source, targets) {
      const lines = []
      targets.forEach(t => {
        lines.push({
          from: source.id,
          to: t.id,
          color: '#BEBEBE'
        })
      })
      return lines
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

  .entity-graph__chart {
    width: calc(100% - 360px);

    .graph-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: transparent !important;

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
          box-shadow: 0 0 0 8px #E3F3F9;
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
        transition: linear all .2s;

        // 覆盖自带的node点击效果
        &.rel-node-checked {
          box-shadow: 0 0 0 5px #E9E9E9;
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
