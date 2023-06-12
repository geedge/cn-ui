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
          <i v-if="tab.warnFlag" :class="tab.warnIcon" class="tab-pane-warn--icon"></i>
        </template>
        <information-aggregation v-if="tab.name === entityDetailTabsName.informationAggregation && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity"></information-aggregation>
        <domain-name-resolution v-else-if="tab.name === entityDetailTabsName.domainNameResolution && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" :timeFilter="oneDayTimeFilter"></domain-name-resolution>
        <digital-certificate v-else-if="tab.name === entityDetailTabsName.digitalCertificate && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" />
        <security-event v-else-if="tab.name === entityDetailTabsName.securityEvent && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" @checkWarn="setWarn" />
        <performance-event v-else-if="tab.name === entityDetailTabsName.performanceEvent && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" @checkWarn="setWarn" />
        <open-port v-else-if="tab.name === entityDetailTabsName.openPort && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" :timeFilter="oneDayTimeFilter"></open-port>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import i18n from '@/i18n'
import { entityDetailTabsName } from '@/utils/constants'
import { reactive, ref } from 'vue'
import InformationAggregation from '@/views/charts2/charts/entityDetail/tabs/InformationAggregation'
import DomainNameResolution from '@/views/charts2/charts/entityDetail/tabs/DomainNameResolution'
import SecurityEvent from '@/views/charts2/charts/entityDetail/tabs/SecurityEvent'
import PerformanceEvent from '@/views/charts2/charts/entityDetail/tabs/PerformanceEvent'
import OpenPort from '@/views/charts2/charts/entityDetail/tabs/OpenPort'
import DigitalCertificate from '@/views/charts2/charts/entityDetail/tabs/DigitalCertificate'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { useRoute } from 'vue-router'
import { getSecond } from '@/utils/date-util'
import axios from 'axios'
import { api } from '@/utils/api'

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
    this.initData()
  },
  setup (props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const entityType = props.entity.entityType

    const tabs = reactive([
      { name: entityDetailTabsName.domainNameResolution, label: i18n.global.t('entities.domainNameResolution'), icon: 'cn-icon cn-icon-domain-name-resolution' },
      { name: entityDetailTabsName.openPort, label: i18n.global.t('entities.openPort'), icon: 'cn-icon cn-icon-open-port' },
      // { name: entityDetailTabsName.digitalCertificate, label: i18n.global.t('entities.digitalCertificate'), icon: 'cn-icon cn-icon-digital-certificate' },
      { name: entityDetailTabsName.securityEvent, label: i18n.global.t('overall.securityEvent'), icon: 'cn-icon cn-icon-security-event', warnIcon: 'cn-icon cn-icon-warn', warnFlag: false },
      { name: entityDetailTabsName.performanceEvent, label: i18n.global.t('overall.performanceEvent'), icon: 'cn-icon cn-icon-a-PerformanceEvent', warnIcon: 'cn-icon cn-icon-warn', warnFlag: false }
    ])
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
    initData () {
      const params = {
        resource: this.entity.entityName,
        startTime: getSecond(this.oneDayTimeFilter.startTime),
        endTime: getSecond(this.oneDayTimeFilter.endTime)
      }

      const security = axios.get(`${api.entity.security}/${this.entity.entityType}`, { params: params })
      const performance = axios.get(`${api.entity.performance}/${this.entityType}`, { params: params })

      Promise.all([security, performance]).then(response => {
        if (response[0].data.code === 200 && response[1].data.code === 200) {
          const name1 = entityDetailTabsName.securityEvent
          const name2 = entityDetailTabsName.performanceEvent

          // 为了避免tabs其中某项被注释或删除，使用name查找到该项进行更改，避免icon显示错误
          const obj1 = this.tabs.find(t => t.name === name1)
          const obj2 = this.tabs.find(t => t.name === name2)
          if (obj1) {
            obj1.warnFlag = response[0].data.data.result.length > 0
          }
          if (obj2) {
            obj2.warnFlag = response[1].data.data.result.length > 0
          }
        }
      })
    },
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
    },
    setWarn (name, flag) {
      const obj = this.tabs.find(t => t.name === name)
      if (obj) {
        obj.warnFlag = flag
      }
    }
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>
