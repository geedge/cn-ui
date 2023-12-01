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
    const entityData = { entityType: query.entityType, entityName: query.entityName }
    switch (query.entityType) {
      case 'ip': {
        panelType = panelTypeAndRouteMapping.ipEntityDetail
        entityData.ip = query.entityName
        break
      }
      case 'domain': {
        panelType = panelTypeAndRouteMapping.domainEntityDetail
        entityData.domain = query.entityName
        break
      }
      case 'app': {
        panelType = panelTypeAndRouteMapping.appEntityDetail
        entityData.appName = query.entityName
        break
      }
      case 'subscriber': {
        panelType = panelTypeAndRouteMapping.subscribeEntityDetail
        entityData.appName = query.entityName
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
