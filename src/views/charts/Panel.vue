<template>
  <div>{{panel.name}}</div>
</template>

<script>
import { useRoute } from 'vue-router'
import { panelTypeAndRouteMapping } from '@/utils/constants'
import { panel as api, getPanelList } from '@/utils/api'

export default {
  name: 'Panel',
  data () {
    return {
      panel: {}
    }
  },
  async mounted () {
    this.panel = (await getPanelList({ type: this.panelType }))[0]
  },
  setup () {
    // 取得panel的type
    let panelType = 1
    const { params } = useRoute()
    panelTypeAndRouteMapping[params.typeName] && (panelType = panelTypeAndRouteMapping[params.typeName])
    return {
      panelType,
      api
    }
  }
}
</script>

<style>

</style>
