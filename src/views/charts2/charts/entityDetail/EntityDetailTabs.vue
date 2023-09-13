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
          <el-tag size="small" style="margin-left: 6px" :color="tab.name === activeTab ? 'rgb(223,237,248)' : 'rgb(237,237,237)'" round>
            <span :style="{color: tab.name === activeTab ? '#046ECA' : '#717171'}">{{ tab.tag }}</span>
          </el-tag>
        </template>
        <information-aggregation v-if="tab.name === entityDetailTabsName.informationAggregation && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" @checkTag="setTag"></information-aggregation>
        <domain-name-resolution v-else-if="tab.name === entityDetailTabsName.relatedEntity && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" :timeFilter="oneDayTimeFilter" @checkTag="setTag"></domain-name-resolution>
        <digital-certificate v-else-if="tab.name === entityDetailTabsName.digitalCertificate && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" @checkTag="setTag" />
        <security-event v-else-if="tab.name === entityDetailTabsName.securityEvent && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" @checkTag="setTag" />
        <performance-event v-else-if="tab.name === entityDetailTabsName.performanceEvent && tab.name === activeTab" @toggleLoading="setLoading" :timeFilter="oneDayTimeFilter" @checkTag="setTag" />
        <open-port v-else-if="tab.name === entityDetailTabsName.openPort && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" :timeFilter="oneDayTimeFilter" @checkTag="setTag"></open-port>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import i18n from '@/i18n'
import { entityDetailTabsName, entityDetailTags, psiphon3IpType } from '@/utils/constants'
import { reactive, ref } from 'vue'
import InformationAggregation from '@/views/charts2/charts/entityDetail/tabs/InformationAggregation'
import DomainNameResolution from '@/views/charts2/charts/entityDetail/tabs/DomainNameResolution'
import SecurityEvent from '@/views/charts2/charts/entityDetail/tabs/SecurityEvent'
import PerformanceEvent from '@/views/charts2/charts/entityDetail/tabs/PerformanceEvent'
import OpenPort from '@/views/charts2/charts/entityDetail/tabs/OpenPort'
import DigitalCertificate from '@/views/charts2/charts/entityDetail/tabs/DigitalCertificate'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { useRoute } from 'vue-router'
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
      { name: entityDetailTabsName.relatedEntity, label: i18n.global.t('entities.relatedEntity'), icon: 'cn-icon cn-icon-domain-name-resolution', tag: 0 },
      { name: entityDetailTabsName.openPort, label: i18n.global.t('entities.openPort'), icon: 'cn-icon cn-icon-open-port', tag: 0 },
      // { name: entityDetailTabsName.digitalCertificate, label: i18n.global.t('entities.digitalCertificate'), icon: 'cn-icon cn-icon-digital-certificate', tag: 0 },
      { name: entityDetailTabsName.securityEvent, label: i18n.global.t('overall.securityEvent'), icon: 'cn-icon cn-icon-security-event', tag: 0 },
      { name: entityDetailTabsName.performanceEvent, label: i18n.global.t('overall.performanceEvent'), icon: 'cn-icon cn-icon-a-PerformanceEvent', tag: 0 }
    ])
    if (entityType !== 'app') {
      tabs.unshift({ name: entityDetailTabsName.informationAggregation, label: i18n.global.t('entities.informationAggregation'), icon: 'cn-icon cn-icon-information-aggregation', tag: 0 })
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
        resource: this.entity.entityName
        // startTime: getSecond(this.oneDayTimeFilter.startTime),
        // endTime: getSecond(this.oneDayTimeFilter.endTime)
      }

      const url = this.getUrlByEntityType(this.entity.entityType)
      const informationAggregation = axios.get(`${api.entity.informationAggregation}/${this.entity.entityType}?resource=${this.entity.entityName}&pageSize=100&pageNo=1`, { params: params })
      const openPort = axios.get(url, { params: params })
      // const security = axios.get(`${api.entity.security}/${this.entity.entityType}`, { params: params })
      // const performance = axios.get(`${api.entity.performance}/${this.entityType}`, { params: params })

      Promise.all([informationAggregation, openPort]).then(response => {
        if (response[0].status === 200) {
          const list = []
          response[0].data.data.result.forEach(r => {
            Object.keys(r).forEach(k => {
              const aggregation = {
                createTime: r[k].createTime,
                updateTime: r[k].updateTime,
                status: r[k].isValid,
                intelligenceContent: []
              }
              if (k === 'userDefinedTag') {
                aggregation.intelligenceContent.push({ key: k, value: r[k].tagValue, type: 'normal' })
              } else {
                Object.keys(r[k]).forEach(k2 => {
                  const find = entityDetailTags[this.entity.entityType].find(t => t.name === k2)
                  if (find) {
                    aggregation.intelligenceContent.push({ key: k2, value: this.tagValueHandler(k, k2, r[k][k2]), type: find.type })
                  }
                })
              }
              if (aggregation.intelligenceContent.length > 0) {
                list.push(aggregation)
              }
            })
          })

          this.initSetTag(entityDetailTabsName.informationAggregation, list.length)
        }
        if (response[1].status === 200) {
          this.initSetTag(entityDetailTabsName.openPort, response[1].data.data.result.length)
        }
        if (response[2].status === 200) {
          // this.initSetTag(entityDetailTabsName.securityEvent, response[2].data.data.result.length)
          this.initSetTag(entityDetailTabsName.securityEvent, 0)
        }
        if (response[3].status === 200) {
          // this.initSetTag(entityDetailTabsName.performanceEvent, response[3].data.data.result.length)
          this.initSetTag(entityDetailTabsName.performanceEvent, 0)
        }
      })

      // 域名解析
      if (this.entity.entityType === 'app') {
        const ipsOfApp = axios.get(api.entity.domainNameResolutionAboutIpsOfApp, { params: params })
        const domainsOfApp = axios.get(api.entity.domainNameResolutionAboutDomainsOfApp, { params: params })
        this.promiseData(ipsOfApp, domainsOfApp)
      }

      if (this.entity.entityType === 'ip') {
        const appsOfIp = axios.get(api.entity.domainNameResolutionAboutAppsOfIp, { params: params })
        const domainsOfIp = axios.get(api.entity.domainNameResolutionAboutDomainsOfIp, { params: params })
        this.promiseData(appsOfIp, domainsOfIp)
      }

      if (this.entity.entityType === 'domain') {
        const appsOfDomain = axios.get(api.entity.domainNameResolutionAboutAppsOfDomain, { params: params })
        const ipsOfDomain = axios.get(api.entity.domainNameResolutionAboutIpsOfDomain, { params: params })
        const fqdnsOfDomain = axios.get(api.entity.domainNameResolutionAboutFQDNsOfDomain, { params: params })
        this.promiseData(appsOfDomain, ipsOfDomain, fqdnsOfDomain)
      }
    },
    promiseData (data1, data2, data3) {
      Promise.all([data1, data2, data3]).then(res => {
        const res0 = res[0].data
        const res1 = res[1].data

        switch (this.entity.entityType) {
          case 'ip': {
            const len1 = res[0].status === 200 ? res0.data.result.length : 0
            const len2 = res[1].status === 200 ? res1.data.result.length : 0
            this.initSetTag(entityDetailTabsName.relatedEntity, len1 + len2)
            break
          }
          case 'domain': {
            const res2 = res[2].data
            const len1 = res[0].status === 200 ? res0.data.result.length : 0
            const len2 = res[1].status === 200 ? res1.data.result.length : 0
            const len3 = res[2].status === 200 ? res2.data.result.length : 0
            this.initSetTag(entityDetailTabsName.relatedEntity, len1 + len2 + len3)
            break
          }
          case 'app': {
            const len1 = res[0].status === 200 ? res0.data.result.length : 0
            const len2 = res[1].status === 200 ? res1.data.result.length : 0
            this.initSetTag(entityDetailTabsName.relatedEntity, len1 + len2)
            break
          }
        }
      })
    },
    handleActiveBar (name, num) {
      const tabDom = document.getElementById('tab-' + name)
      if (tabDom) {
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, { currentTab: name })
        overwriteUrl(newUrl)

        const offsetLeft = tabDom.offsetLeft
        const clientWidth = tabDom.clientWidth
        const clientLeft = tabDom.clientLeft
        const activeBar = document.querySelector('.entity-detail-tabs .entity-detail-tabs__active-bar')
        const newWidth = num ? num * 6 : 0
        activeBar.style.cssText += `width: ${clientWidth + 2 + newWidth}px; left: ${offsetLeft + clientLeft - 1}px;`
      }
    },
    setLoading (loading) {
      this.toggleLoading(loading)
    },
    setTag (name, num) {
      const obj = this.tabs.find(t => t.name === name)
      if (obj) {
        const oldNum = JSON.parse(JSON.stringify(obj.tag))
        obj.tag = num
        // 根据前后位数的变化来增减状态栏的长短，
        // 如初始是0（位数是1），点击tab变成10条（位数是2），所以状态栏宽度增加(2-1)*6px
        this.handleActiveBar(name, JSON.stringify(num).length - JSON.stringify(oldNum).length)
      }
    },
    initSetTag (name, num) {
      const obj = this.tabs.find(t => t.name === name)
      if (obj) {
        obj.tag = num
      }
    },
    getUrlByEntityType (type) {
      switch (type) {
        case 'ip': return api.entity.openPortOfIp
        case 'domain': return api.entity.openPortOfDomain
        case 'app': return api.entity.openPortOfApp
      }
    },
    tagValueHandler (k, k2, value) {
      if (k === 'psiphon3Ip') {
        if (k2 === 'type') {
          const find = psiphon3IpType.find(t => t.value === value)
          if (find) {
            return find.name
          }
        }
      }
      return value
    }
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped>
.el-tag {
  font-size: 12px !important;
  border-radius: 20px !important;
}
</style>
