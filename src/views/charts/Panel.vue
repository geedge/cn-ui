<template>
  <div>{{panel}}</div>
</template>

<script>
import { useRoute } from 'vue-router'
import { panelTypeAndRouteMapping } from '@/utils/constants'
import { api, getPanelList } from '@/utils/api'

export default {
  name: 'Panel',
  data () {
    return {
      panel: {}
    }
  },
  async mounted () {
    const panels = await getPanelList({ type: this.panelType })
    if (panels && panels.length > 0) {
      this.panel = panels[0]
    }
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
