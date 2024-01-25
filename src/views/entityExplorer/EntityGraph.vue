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
import Node, { nodeType } from './entityGraph/node'
import Link, { linkType } from './entityGraph/link'
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
      initialData: null // 初始化数据，用于重置
    }
  },
  methods: {
    async init () {
      try {
        const initialData = await this.generateInitialData()
        this.initialData = _.cloneDeep(initialData) // 初始化数据
        ForceGraph()(document.getElementById('entityGraph'))
          .graphData(initialData)
          .nodeRelSize(18)
          .onNodeHover(node => {
          })
          .nodeCanvasObject((node, ctx) => {
            ctx.beginPath()
            ctx.arc(node.x, node.y, 18, 0, 2 * Math.PI, false)
            ctx.stroke()
          })
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

      const rootNode = new Node(nodeType.rootNode, this.entity.entityName, this.entity)
      await rootNode.queryDetailData()
      nodes.push(rootNode)

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
              rootNode
            )
            listNodes.push(listNode)
            links.push(new Link(rootNode, listNode))
          }
        })
        // entityNode
        const entityNodes = []
        for (const listNode of listNodes) {
          const entities = await rootNode.queryRelatedEntities(listNode.data.entityType)
          entities.list.forEach(entity => {
            const entityNode = new Node(
              nodeType.entityNode,
              entity.vertex,
              {
                entityType: listNode.data.entityType,
                entityName: entity.vertex
              },
              listNode
            )
            entityNodes.push(entityNode)
            links.push(new Link(listNode, entityNode))
          })
        }
        nodes.push(...listNodes, ...entityNodes)
      }
      return {
        nodes,
        links
      }
    },
    expandList () {

    },
    expandDetailList () {

    },
    onCloseBlock () {

    },
    resize () {

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
    return {
      entity,
      rightBox,
      graph
    }
  }
}
</script>
