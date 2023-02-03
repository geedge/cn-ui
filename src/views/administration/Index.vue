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
export default {
  name: 'index',
  components: {
    ChartTabs
  },
  data () {
    return {
      tabsData: [
        {
          i18n: 'overall.user',
          path: '/administration/user',
          icon: 'cn-icon cn-icon-user2'
        },
        {
          i18n: 'overall.role',
          path: '/administration/role',
          icon: 'cn-icon cn-icon-role2'
        },
        {
          i18n: 'overall.operationLog',
          path: '/administration/operationLog',
          icon: 'cn-icon cn-icon-operation-log'
        },
        {
          i18n: 'I18n',
          path: '/administration/i18n',
          icon: 'cn-icon cn-icon-i18n'
        }
      ]
    }
  }
}
</script>
