<template>
  <div class="entity-graph">
    <div class="entity-graph__chart"></div>
    <div class="entity-graph__detail">
      <ip-list v-if="mode === 'ipList'"></ip-list>
    </div>
  </div>
</template>

<script>
import IpList from '@/views/entityExplorer/entityGraphDetail/IpList'
export default {
  name: 'EntityRelationship',
  components: {
    IpList
  },
  data () {
    return {
      mode: 'ipList' // ipList, ipDetail, domainList, domainDetail, appList, appDetail
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
  }
}
</style>
