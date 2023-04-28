<template>
  <div class="entity-detail-tabs">
    <el-tabs v-model="activeTab"
             class="cn-chart__tabs--border-card"
             type="border-card"
    >
      <el-tab-pane v-for="tab in tabs"
                   :key="tab.name"
                   :name="tab.name"
                   class="tab-pane--border-card"
      >
        <template #label>
<!--          <div class="el-tabs__active-bar is-top" style="width: 80.9998px; transform: translateX(177px);"></div>-->
          <i :class="tab.icon"></i>{{tab.label}}
        </template>
        <information-aggregation v-if="tab.name === entityDetailTabsName.informationAggregation"></information-aggregation>
        <domain-name-resolution v-else-if="tab.name === entityDetailTabsName.domainNameResolution"></domain-name-resolution>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<style lang="scss">
.entity-detail-tabs {
  $tab-border-color: #E2E5EC;
  height: 100%;

  .cn-chart__tabs--border-card {
    height: 100%;
    border: none;
    box-shadow: none;

    & > .el-tabs__header {
      background-color: #fff;
      border-bottom: 1px solid $tab-border-color;

      .el-tabs__item {
        color: #353636;

        i {
          margin-right: 8px;
        }

      }
      .el-tabs__item:not(.is-disabled):not(.is-active):hover {
        color: #353636;
      }
      .el-tabs__item.is-active {
        color: #046ECA;
        background-color: #FFFFFF;
        border-right-color: $tab-border-color;
        border-left-color: $tab-border-color;
        border-radius: 4px 4px 0 0;
        box-shadow: 0 1px $tab-border-color inset;

        &:hover {
          color: #046ECA;
        }
      }
      .el-tabs__item:first-of-type.is-active {
        box-shadow: 1px 1px $tab-border-color inset;
      }
    }
    .el-tabs__content {
      height: calc(100% - 39px);
      border: 1px solid $tab-border-color;
      border-top: none;
    }
  }
}

</style>
<script>
import chartMixin from '@/views/charts2/chart-mixin'
import i18n from '@/i18n'
import { entityDetailTabsName } from '@/utils/constants'
import { ref } from 'vue'
import InformationAggregation from '@/views/charts2/charts/entityDetail/tabs/InformationAggregation'
import DomainNameResolution from '@/views/charts2/charts/entityDetail/tabs/DomainNameResolution'

export default {
  name: 'EntityDetailTabs',
  mixins: [chartMixin],
  components: {
    InformationAggregation,
    DomainNameResolution
  },
  data () {
    return {
    }
  },
  mounted () {
    this.toggleLoading(false)
  },
  setup (props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const entityType = props.entity.entityType

    const tabs = [
      { name: entityDetailTabsName.domainNameResolution, label: i18n.global.t('entities.domainNameResolution'), icon: 'cn-icon cn-icon-domain-name-resolution' },
      { name: entityDetailTabsName.openPort, label: i18n.global.t('entities.openPort'), icon: 'cn-icon cn-icon-open-port' },
      { name: entityDetailTabsName.digitalCertificate, label: i18n.global.t('entities.digitalCertificate'), icon: 'cn-icon cn-icon-digital-certificate' },
      { name: entityDetailTabsName.securityEvent, label: i18n.global.t('overall.securityEvent'), icon: 'cn-icon cn-icon-security-event' },
      { name: entityDetailTabsName.performanceEvent, label: i18n.global.t('overall.performanceEvent'), icon: 'cn-icon cn-icon-a-PerformanceEvent' }
    ]
    if (entityType !== 'app') {
      tabs.unshift({ name: entityDetailTabsName.informationAggregation, label: i18n.global.t('entities.informationAggregation'), icon: 'cn-icon cn-icon-information-aggregation' })
    }
    if (entityType === 'domain') {
      tabs.splice(2, 0, { name: entityDetailTabsName.subdomain, label: i18n.global.t('entities.subdomain'), icon: 'cn-icon cn-icon-sub-type' })
    }
    const activeTab = ref(tabs[0].name)
    return {
      entityType,
      activeTab,
      tabs,
      entityDetailTabsName
    }
  }
}
</script>
