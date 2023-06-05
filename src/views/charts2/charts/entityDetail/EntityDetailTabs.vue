<template>
  <div class="entity-detail-tabs">
    <div class="entity-detail-tabs__active-bar"></div>
    <el-tabs v-model="activeTab" class="cn-chart__tabs--border-card" type="border-card">
      <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :name="tab.name"
          class="tab-pane--border-card">
        <template #label>
          <!--<div class="el-tabs__active-bar is-top" style="width: 80.9998px; transform: translateX(177px);"></div>-->
          <i :class="tab.icon"></i>{{tab.label}}
        </template>
        <information-aggregation v-if="tab.name === entityDetailTabsName.informationAggregation && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity"></information-aggregation>
        <domain-name-resolution v-else-if="tab.name === entityDetailTabsName.domainNameResolution && tab.name === activeTab" @toggleLoading="setLoading"></domain-name-resolution>
        <digital-certificate v-else-if="tab.name === entityDetailTabsName.digitalCertificate && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" />
        <security-event v-else-if="tab.name === entityDetailTabsName.securityEvent && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" />
        <performance-event v-else-if="tab.name === entityDetailTabsName.performanceEvent && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" />
        <open-port v-else-if="tab.name === entityDetailTabsName.openPort && tab.name === activeTab" @toggleLoading="setLoading"></open-port>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import i18n from '@/i18n'
import { entityDetailTabsName } from '@/utils/constants'
import { ref } from 'vue'
import InformationAggregation from '@/views/charts2/charts/entityDetail/tabs/InformationAggregation'
import DomainNameResolution from '@/views/charts2/charts/entityDetail/tabs/DomainNameResolution'
import SecurityEvent from '@/views/charts2/charts/entityDetail/tabs/SecurityEvent'
import PerformanceEvent from '@/views/charts2/charts/entityDetail/tabs/PerformanceEvent'
import OpenPort from '@/views/charts2/charts/entityDetail/tabs/OpenPort'
import DigitalCertificate from '@/views/charts2/charts/entityDetail/tabs/DigitalCertificate'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { useRoute } from 'vue-router'

export default {
  name: 'EntityDetailTabs',
  mixins: [chartMixin],
  components: {
    PerformanceEvent,
    SecurityEvent,
    InformationAggregation,
    DomainNameResolution,
    OpenPort,
    DigitalCertificate
  },
  data () {
    return {
      timer: null,
      // 最近一天的时间
      oneDayTimeFilter: {
        startTime: window.$dayJs.tz().valueOf() - 1440 * 60 * 1000,
        endTime: window.$dayJs.tz().valueOf()
      }
    }
  },
  watch: {
    activeTab (n) {
      this.$nextTick(() => {
        this.handleActiveBar(n)
      })
    }
  },
  mounted () {
    // this.toggleLoading(false)
    this.timer = setTimeout(() => {
      this.handleActiveBar(this.activeTab)
    }, 200)
  },
  setup (props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const entityType = props.entity.entityType

    const tabs = [
      { name: entityDetailTabsName.domainNameResolution, label: i18n.global.t('entities.domainNameResolution'), icon: 'cn-icon cn-icon-domain-name-resolution' },
      { name: entityDetailTabsName.openPort, label: i18n.global.t('entities.openPort'), icon: 'cn-icon cn-icon-open-port' },
      // { name: entityDetailTabsName.digitalCertificate, label: i18n.global.t('entities.digitalCertificate'), icon: 'cn-icon cn-icon-digital-certificate' },
      { name: entityDetailTabsName.securityEvent, label: i18n.global.t('overall.securityEvent'), icon: 'cn-icon cn-icon-security-event' },
      { name: entityDetailTabsName.performanceEvent, label: i18n.global.t('overall.performanceEvent'), icon: 'cn-icon cn-icon-a-PerformanceEvent' }
    ]
    if (entityType !== 'app') {
      tabs.unshift({ name: entityDetailTabsName.informationAggregation, label: i18n.global.t('entities.informationAggregation'), icon: 'cn-icon cn-icon-information-aggregation' })
    }
    const activeTab = ref(tabs[0].name)

    const { query } = useRoute()
    const item = tabs.find(item => item.name === query.currentTab)
    if (item) {
      activeTab.value = query.currentTab
    }

    return {
      entityType,
      activeTab,
      tabs,
      entityDetailTabsName
    }
  },
  methods: {
    handleActiveBar (name) {
      const tabDom = document.getElementById('tab-' + name)
      if (tabDom) {
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, { currentTab: name })
        overwriteUrl(newUrl)

        const offsetLeft = tabDom.offsetLeft
        const clientWidth = tabDom.clientWidth
        const clientLeft = tabDom.clientLeft
        const activeBar = document.querySelector('.entity-detail-tabs .entity-detail-tabs__active-bar')
        activeBar.style.cssText += `width: ${clientWidth + 2}px; left: ${offsetLeft + clientLeft - 1}px;`
      }
    },
    setLoading (loading) {
      this.toggleLoading(loading)
    }
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>
