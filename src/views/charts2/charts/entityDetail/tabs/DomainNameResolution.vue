<template>
  <div>
    <chart-no-data v-if="isNoData"></chart-no-data>

    <div v-if="!isNoData && initFlag" class="type-data__column">
      <div class="type-data" v-if="entity.entityType !== 'app'">
        <div class="type-title">
          <span class="title-mark"></span>
          {{ $t('entities.tab.relatedApp') }}&nbsp;&nbsp;({{ relatedAppList.length }})
        </div>
        <div class="type-content" v-if="!showError0">
          <div v-for="(entity, index) in relatedAppList" class="data-item" :key="index">
            {{ entity.appName ? entity.appName : entity }}
          </div>
        </div>
        <div class="type-error-content" v-else>
          <chart-error class="type-error-content__block" :content="errorMsg0"></chart-error>
        </div>
      </div>

      <div class="type-data" v-if="entity.entityType !== 'ip'">
        <div class="type-title">
          <span class="title-mark"></span>
          {{ $t('entities.tab.relatedIp') }}&nbsp;&nbsp;({{ relatedIpList.length }})
        </div>
        <div class="type-content" v-if="!showError1">
          <div v-for="(entity, index) in relatedIpList" :key="index" class="data-item">
            {{ entity.ip ? entity.ip : entity }}
          </div>
        </div>
        <div class="type-error-content" v-else>
          <chart-error class="type-error-content__block" :content="errorMsg1"></chart-error>
        </div>
      </div>

      <div class="type-data">
        <div class="type-title">
          <span class="title-mark"></span>
          {{ $t('entities.tab.relatedDomain') }}&nbsp;&nbsp;({{ relatedDomainList.length }})
        </div>
        <div class="type-content" v-if="!showError2">
          <div v-for="(entity, index) in relatedDomainList" class="data-item" :key="index">
            {{ entity.domain ? entity.domain : entity }}
          </div>
        </div>
        <div class="type-error-content" v-else>
          <chart-error class="type-error-content__block" :content="errorMsg2"></chart-error>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import { getSecond } from '@/utils/date-util'
import chartNoData from '@/views/charts/charts/ChartNoData'
import { entityDetailTabsName } from '@/utils/constants'

export default {
  name: 'DomainNameResolution',
  mixins: [chartMixin],
  props: {
  },
  components: {
    chartNoData
  },
  data () {
    return {
      relatedAppList: [],
      relatedIpList: [],
      relatedDomainList: [],
      initFlag: false, // 初始化标识，请求接口之后再显示，避免标题初始化会闪一下
      showError0: false,
      errorMsg0: '',
      showError1: false,
      errorMsg1: '',
      showError2: false,
      errorMsg2: ''
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      const params = {
        resource: this.entity.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
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
      this.showError0 = false
      this.showError1 = false
      this.showError2 = false
      this.toggleLoading(true)
      Promise.all([data1, data2, data3]).then(res => {
        const res0 = res[0].data
        const res1 = res[1].data
        if (res0.code === 200 && res1.code === 200) {
          this.isNoData = res0.data.result.length === 0 && res1.data.result.length === 0
        }

        // app相关，显示ip、domain
        if (this.entity.entityType === 'app' && !this.isNoData) {
          if (res0.code === 200) {
            this.relatedIpList = res0.data.result
          } else {
            this.showError1 = true
            this.errorMsg1 = this.errorMsgHandler(res0)
          }

          if (res1.code === 200) {
            this.relatedDomainList = res1.data.result
          } else {
            this.showError2 = true
            this.errorMsg2 = this.errorMsgHandler(res1)
          }
          this.$emit('checkTag', entityDetailTabsName.relatedEntity, res0.data.result.length + res1.data.result.length)
        }

        // ip相关，显示app，domain
        if (this.entity.entityType === 'ip' && !this.isNoData) {
          if (res0.code === 200) {
            this.relatedAppList = res0.data.result
          } else {
            this.showError0 = true
            this.errorMsg0 = this.errorMsgHandler(res0)
          }
          if (res1.code === 200) {
            this.relatedDomainList = res1.data.result
          } else {
            this.showError2 = true
            this.errorMsg2 = this.errorMsgHandler(res1)
          }
          this.$emit('checkTag', entityDetailTabsName.relatedEntity, res0.data.result.length + res1.data.result.length)
        }

        // domain相关，显示app，ip，domain
        if (this.entity.entityType === 'domain') {
          const res2 = res[2].data
          if (res0.code === 200 && res1.code === 200 && res2.code === 200) {
            this.isNoData = res0.data.result.length === 0 && res1.data.result.length === 0 && res2.data.result.length === 0
          }

          if (res0.code === 200) {
            this.relatedAppList = res0.data.result
          } else {
            this.showError0 = true
            this.errorMsg0 = this.errorMsgHandler(res0)
          }

          if (res1.code === 200) {
            this.relatedIpList = res1.data.result
          } else {
            this.showError1 = true
            this.errorMsg1 = this.errorMsgHandler(res1)
          }

          if (res2.code === 200) {
            this.relatedDomainList = res2.data.result
          } else {
            this.showError2 = true
            this.errorMsg2 = this.errorMsgHandler(res2)
          }
          this.$emit('checkTag', entityDetailTabsName.relatedEntity, res0.data.result.length + res1.data.result.length + res2.data.result.length)
        }
      }).catch(e => {
        console.log(e)
        this.showError0 = true
        this.showError1 = true
        this.showError2 = true
        this.errorMsg0 = this.errorMsgHandler(e)
        this.errorMsg1 = this.errorMsgHandler(e)
        this.errorMsg2 = this.errorMsgHandler(e)
      }).finally(() => {
        this.initFlag = true
        this.toggleLoading(false)
      })
    }
  }
}
</script>
