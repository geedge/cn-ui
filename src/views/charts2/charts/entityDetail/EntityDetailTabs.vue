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
          <i :class="tab.icon"></i>{{$t(tab.label)}}
          <el-tag :type="tab.name === activeTab ? 'primary' : 'info'" size="small" class="margin-l-6" round>{{ tab.tag }}</el-tag>
        </template>
        <information-aggregation v-if="tab.name === entityDetailTabsName.informationAggregation && tab.name === activeTab" @toggleLoading="setLoading"  :entity="entity" @checkTag="setTag"></information-aggregation>
        <domain-name-resolution v-else-if="tab.name === entityDetailTabsName.relatedEntity && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity"  @checkTag="setTag"></domain-name-resolution>
        <digital-certificate v-else-if="tab.name === entityDetailTabsName.digitalCertificate && tab.name === activeTab" @toggleLoading="setLoading" @checkTag="setTag" />
        <security-event v-else-if="tab.name === entityDetailTabsName.securityEvent && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" @checkTag="setTag" />
        <performance-event v-else-if="tab.name === entityDetailTabsName.performanceEvent && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" @checkTag="setTag" />
        <open-port v-else-if="tab.name === entityDetailTabsName.openPort && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity"  @checkTag="setTag"></open-port>
        <behavior-pattern v-else-if="tab.name === entityDetailTabsName.behaviorPattern && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" @checkTag="setTag"></behavior-pattern>
        <device-information v-else-if="tab.name === entityDetailTabsName.deviceInformation && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" @checkTag="setTag"></device-information>
        <account-information v-else-if="tab.name === entityDetailTabsName.accountInformation && tab.name === activeTab" @toggleLoading="setLoading" :entity="entity" @checkTag="setTag"></account-information>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { entityDetailTabsName } from '@/utils/constants'
import { reactive, ref } from 'vue'
import InformationAggregation from '@/views/charts2/charts/entityDetail/tabs/InformationAggregation'
import DomainNameResolution from '@/views/charts2/charts/entityDetail/tabs/DomainNameResolution'
import SecurityEvent from '@/views/charts2/charts/entityDetail/tabs/SecurityEvent'
import PerformanceEvent from '@/views/charts2/charts/entityDetail/tabs/PerformanceEvent'
import BehaviorPattern from '@/views/charts2/charts/entityDetail/tabs/BehaviorPattern'
import OpenPort from '@/views/charts2/charts/entityDetail/tabs/OpenPort'
import AccountInformation from '@/views/charts2/charts/entityDetail/tabs/AccountInformation'
import DeviceInformation from '@/views/charts2/charts/entityDetail/tabs/DeviceInformation'
import DigitalCertificate from '@/views/charts2/charts/entityDetail/tabs/DigitalCertificate'
import { formatTagsOfDetails, overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { api } from '@/utils/api'
import { entityType, entityDetailTabConfig } from '../../../../utils/constants'

export default {
  name: 'EntityDetailTabs',
  mixins: [chartMixin],
  components: {
    PerformanceEvent,
    BehaviorPattern,
    SecurityEvent,
    InformationAggregation,
    DomainNameResolution,
    OpenPort,
    DeviceInformation,
    AccountInformation,
    DigitalCertificate
  },
  data () {
    return {
      timer: null
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

    const tabObj = entityDetailTabConfig.find(tab => tab.name === entityType)

    const tabs = reactive(tabObj ? tabObj.config : [])
    const activeTab = ref(tabs[0] ? tabs[0].name : {})

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
      const url = this.getUrlByEntityType(this.entity.entityType)
      const informationAggregation = axios.get(`${api.entity.informationAggregation}/${this.entity.entityType}?resource=${this.entity.entityName}&pageSize=100&pageNo=1`, { params: this.getParamsByTabType(entityDetailTabsName.informationAggregation) })
      const openPort = axios.get(url, { params: this.getParamsByTabType(entityDetailTabsName.openPort) })
      const security = axios.get(`${api.entity.security}/${this.entity.entityType}`, { params: this.getParamsByTabType(entityDetailTabsName.securityEvent) })
      // const performance = axios.get(`${api.entity.performance}/${this.entityType}`, { params: this.getParamsByTabType(entityDetailTabsName.performanceEvent) })
      const requestArray = [informationAggregation, openPort, security]

      // todo 暂时隐藏performance的请求，后续接口开发完毕后再解开注释
      // Promise.allSettled([informationAggregation, openPort, security, performance]).then(response => {
      Promise.allSettled(requestArray).then(response => {
        const informationAggregationResponse = response[0].value
        if (informationAggregationResponse && informationAggregationResponse.status === 200) {
          const list = []
          formatTagsOfDetails(informationAggregationResponse.data.data.result, this.entity.entityType, list)
          this.initSetTag(entityDetailTabsName.informationAggregation, list.length)
        }
        const openPortResponse = response[1].value
        if (openPortResponse && openPortResponse.status === 200) {
          this.initSetTag(entityDetailTabsName.openPort, openPortResponse.data.data.result.length)
        }
        const securityResponse = response[2].value
        if (securityResponse && securityResponse.status === 200) {
          if (this.entity.entityType === entityType.subscriber) {
            this.initSetTag(entityDetailTabsName.securityEvent, 0)
          } else {
            this.initSetTag(entityDetailTabsName.securityEvent, securityResponse.data.data.result.length)
          }
        }
        // let performanceResponse = response[3].value
        // if (performanceResponse && performanceResponse.status === 200) {
        //   this.initSetTag(entityDetailTabsName.performanceEvent, performanceResponse.data.data.result.length)
        // }
        this.initSetTag(entityDetailTabsName.performanceEvent, 0)
      })

      const relatedEntityParams = this.getParamsByTabType(entityDetailTabsName.relatedEntity)
      // 域名解析
      if (this.entity.entityType === entityType.app) {
        const ipsOfApp = axios.get(api.entity.domainNameResolutionAboutIpsOfApp, { params: relatedEntityParams })
        const domainsOfApp = axios.get(api.entity.domainNameResolutionAboutDomainsOfApp, { params: relatedEntityParams })
        this.promiseData(ipsOfApp, domainsOfApp)
      }

      if (this.entity.entityType === entityType.ip) {
        const appsOfIp = axios.get(api.entity.domainNameResolutionAboutAppsOfIp, { params: relatedEntityParams })
        const domainsOfIp = axios.get(api.entity.domainNameResolutionAboutDomainsOfIp, { params: relatedEntityParams })
        const behaviorPattern = axios.get(api.entity.behaviorPattern, { params: relatedEntityParams })
        this.promiseData(appsOfIp, domainsOfIp, behaviorPattern)
      }

      if (this.entity.entityType === entityType.domain) {
        const appsOfDomain = axios.get(api.entity.domainNameResolutionAboutAppsOfDomain, { params: relatedEntityParams })
        const ipsOfDomain = axios.get(api.entity.domainNameResolutionAboutIpsOfDomain, { params: relatedEntityParams })
        const fqdnsOfDomain = axios.get(api.entity.domainNameResolutionAboutFQDNsOfDomain, { params: relatedEntityParams })
        this.promiseData(appsOfDomain, ipsOfDomain, fqdnsOfDomain)
      }

      if (this.entity.entityType === entityType.subscriber) {
        /*
        axios.get(api.entity.deviceInformation, { params: this.getParamsByTabType(entityDetailTabsName.deviceInformation) }).then(response => {
          const res = response.data
          if (response.status === 200) {
            this.initSetTag(entityDetailTabsName.deviceInformation, res.data.result.length)
          }
        })
        const accountInformation = axios.get(api.entity.accountInformation, { params: this.getParamsByTabType(entityDetailTabsName.accountInformation) }).then(response => {
          const res = response.data
          if (response.status === 200) {
            this.initSetTag(entityDetailTabsName.accountInformation, res.data.result.length)
          }
        }) */
        this.initSetTag(entityDetailTabsName.deviceInformation, 0)
        this.initSetTag(entityDetailTabsName.accountInformation, 0)
        const subscriberOfApp = axios.get(api.entity.entityList.subscriberRelatedApp, { params: relatedEntityParams })
        this.promiseData(subscriberOfApp)
      }
    },
    promiseData (data1, data2, data3) {
      Promise.all([data1, data2, data3]).then(res => {
        const res0 = res[0].data
        const res1 = res[1] ? res[1].data : res[1]

        switch (this.entity.entityType) {
          case entityType.ip: {
            const len1 = res[0].status === 200 ? res0.data.result.length : 0
            const len2 = res[1].status === 200 ? res1.data.result.length : 0
            this.initSetTag(entityDetailTabsName.relatedEntity, len1 + len2)
            const behaviorPatternData = res[2].status === 200 ? res[2].data.data.result : 0
            let behaviorPatternLen = 0
            if (behaviorPatternData && behaviorPatternData[0]) {
              const dataObject = behaviorPatternData[0]
              Object.keys(dataObject).forEach(key => {
                const value = Number(dataObject[key]) ? Number(dataObject[key]) : 0
                if (value !== 0 && key !== 'total') {
                  behaviorPatternLen++
                }
              })
            }
            this.initSetTag(entityDetailTabsName.behaviorPattern, behaviorPatternLen)
            break
          }
          case entityType.domain: {
            const res2 = res[2].data
            const len1 = res[0].status === 200 ? res0.data.result.length : 0
            const len2 = res[1].status === 200 ? res1.data.result.length : 0
            const len3 = res[2].status === 200 ? res2.data.result.length : 0
            this.initSetTag(entityDetailTabsName.relatedEntity, len1 + len2 + len3)
            break
          }
          case entityType.app: {
            const len1 = res[0].status === 200 ? res0.data.result.length : 0
            const len2 = res[1].status === 200 ? res1.data.result.length : 0
            this.initSetTag(entityDetailTabsName.relatedEntity, len1 + len2)
            break
          }
          case entityType.subscriber: {
            const len1 = res[0].status === 200 ? res0.data.result.length : 0
            // const len2 = res[1].status === 200 ? res1.data.result.length : 0
            this.initSetTag(entityDetailTabsName.relatedEntity, len1)
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
    }
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>
