<template>
  <div class="administration entity-explorer entity-explorer--show-list">
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools explorer-detection-top-tools">
      <div class="explorer-top-tools-title">{{$t('overall.administration')}}</div>
    </div>
    <div style="width: 100%;padding-bottom: 26px;">
      <chart-tabs :data="tabsData" router></chart-tabs>
    </div>
    <!-- 内容区 -->
    <div class="explorer-container administration-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import ChartTabs from '@/components/common/ChartTabs'
import { useStore } from 'vuex'
export default {
  name: 'index',
  components: {
    ChartTabs
  },
  setup () {
    const store = useStore()
    const menu = store.getters.menuList.find(m => m.code === 'administration')
    const tabsData = menu.children.map(l => ({
      ...l,
      path: l.route
    })).sort((a, b) => a.sort - b.sort)
    return {
      tabsData
    }
  }
}
</script>
