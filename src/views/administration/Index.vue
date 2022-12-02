<template>
  <div class="administration entity-explorer entity-explorer--show-list">
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools explorer-detection-top-tools">
      <div class="explorer-top-tools-title">{{$t('overall.administration')}}</div>
    </div>
    <div style="width: 100%;padding-bottom: 26px;">
      <administration-tabs :tabs-data="tabsData" />
    </div>
    <!-- 内容区 -->
    <div class="explorer-container administration-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import AdministrationTabs from '@/views/administration/AdministrationTabs'
export default {
  name: 'index',
  components: {
    AdministrationTabs
  },
  data () {
    return {
      tabsData: [
        {
          name: 'User',
          i18n: 'overall.user',
          path: '/administration/user',
          icon: 'cn-icon cn-icon-user2'
        },
        {
          name: 'Role',
          i18n: 'overall.role',
          path: '/administration/role',
          icon: 'cn-icon cn-icon-role2'
        },
        {
          name: 'OperationLog',
          i18n: 'overall.operationLog',
          path: '/administration/operationLog',
          icon: 'cn-icon cn-icon-operation-log'
        },
        {
          name: 'I18n',
          i18n: 'I18n',
          path: '/administration/i18n',
          icon: 'cn-icon cn-icon-i18n'
        },
        {
          name: 'GalaxyProxy',
          i18n: 'galaxyProxy.galaxyProxy',
          path: '/administration/galaxyProxy',
          icon: 'cn-icon cn-icon-proxy'
        },
        {
          name: 'Chart',
          i18n: 'overall.chart',
          path: '/administration/chart',
          icon: 'cn-icon cn-icon-chart'
        }
      ]
    }
  }
}
</script>
