<template>
  <div class="entity-detail" style="height: 100%;">
    <panel
        :entity="entityData"
    ></panel>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import Panel from '@/views/charts2/Panel'
import { panelTypeAndRouteMapping } from '@/utils/constants'
export default {
  name: 'EntityDetail',
  components: {
    Panel
  },
  data () {
    return {
    }
  },
  setup (props) {
    const { query } = useRoute()
    let panelType
    const entityData = { entityType: query.entityType, entityName: query.name }
    switch (query.entityType) {
      case 'ip': {
        panelType = panelTypeAndRouteMapping.ipEntityDetail
        entityData.ip = query.name
        break
      }
      case 'domain': {
        panelType = panelTypeAndRouteMapping.domainEntityDetail
        entityData.domain = query.name
        break
      }
      case 'app': {
        panelType = panelTypeAndRouteMapping.appEntityDetail
        entityData.appName = query.name
        break
      }
      default: {
        panelType = panelTypeAndRouteMapping.ipEntityDetail
        break
      }
    }
    entityData.type = panelType
    return {
      entityData
    }
  },
  methods: {
  },
  mounted () {
  }
}
</script>
