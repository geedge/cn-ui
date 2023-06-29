<template>
  <div class="entity-graph">
    <div class="entity-graph__chart"></div>
    <div class="entity-graph__detail" v-if="mode !== ''">
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
import { ref } from 'vue'

export default {
  name: 'EntityRelationship',
  components: {
    IpList,
    GraphDetail,
    AppOrDomainList
  },
  setup () {
    const route = useRoute()
    const { entityType, name } = route.query
    const entity = ref({
      entityType: entityType,
      entityName: name
    })
    const mode = ref('')
    mode.value = 'appList'

    return {
      entity,
      mode
    }
  },
  data () {
    return {
      // mode: 'appList' // ipList, ipDetail, domainList, domainDetail, appList, appDetail
    }
  },
  methods: {
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
  }
}
</script>
<style lang="scss">
.entity-graph {
  display: flex;

  .entity-graph__chart {
    width: calc(100% - 360px);
  }

  .entity-graph__detail {
    width: 360px;
    border-left: 1px solid #E2E5EC;
    overflow: auto;
    padding: 20px;
  }
}
</style>
