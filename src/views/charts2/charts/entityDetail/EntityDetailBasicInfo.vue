<template>
  <div class="entity-detail-basic-info">
    <chart-error v-if="showError" :content="errorMsg"/>
    <div class="entity-type">{{entityTypeName}}</div>
    <div class="entity-basic-info">
      <div class="entity-basic-info__name">
        <span id="entityName">{{entity.entityName}}</span>
        <div @click="copyEntityName"><i class="cn-icon cn-icon-copy"></i></div>
      </div>
      <el-popover
          placement="bottom-end"
          :width="450"
          trigger="click"
          popper-class="analysis-popper"
          @show="analysisPopSwitch(true)"
          @hide="analysisPopSwitch(false)"
      >
        <template #reference v-if="entity.entityType !== entityType.subscriber">
          <div class="analysis-btn" :class="{'analysis-btn--active': analysisPopShow}"><i class="cn-icon cn-icon-analysis"></i>{{$t('overall.analysis')}}</div>
        </template>
        <div class="analysis-entry">
          <div class="analysis-entry__header">{{$t('entities.fastEntry')}}</div>
          <div class="analysis-entry__body">
            <div class="analysis-entry-item" v-for="item in analysisItems" :key="item.label" @click="jump(item.url)">
              <div>
                <i :class="item.icon"></i>
              </div>
              <span>{{item.label}}</span>
            </div>
          </div>
        </div>
      </el-popover>
    </div>
    <div class="entity-tags" v-if="!hideTagArea">
      <div v-for="tag in levelTwoTags"
           :key="tag.value"
           class="entity-tag"
           :class="`entity-tag--level-two-${tag.type}`"
           :style="getTagColor(tag.color)">
        {{tag.value}}
      </div>
    </div>
<!--    分割线-->
    <div class="dividing-line"></div>
    <div class="entity-detail-info">
      <div class="detail-card" v-for="card in detailCards" :key="card.name">
        <i :class="card.icon"></i>
        <div class="detail-card__text">
          <div class="detail-card__label">{{card.label}}:</div>
          <div class="detail-card__value" :title="card.value">{{card.value || '-'}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import {
  drillDownPanelTypeMapping,
  entityType,
  entityDetailTags,
  tagValueLabelMapping,
  riskLevelMapping,
  entityDefaultColor
} from '@/utils/constants'
import { selectElementText, copySelectionText, getTagColor } from '@/utils/tools'
import { ref } from 'vue'
import i18n from '@/i18n'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import axios from 'axios'
import { api } from '@/utils/api'
import { dateFormatByAppearance } from '@/utils/date-util'

export default {
  name: 'EntityDetailBasicInfo',
  mixins: [chartMixin],
  components: {
    ChartError
  },
  mounted () {
    this.getData()
  },
  data () {
    return {
      // type: positive 正面的，绿色；normal 灰色；negative 负面的，红色
      levelTwoTags: [{ value: '安全', type: 'positive' }, { value: '工具', type: 'normal' }, { value: '恶意IP', type: 'negative' }],
      analysisPopShow: false,
      hideTagArea: false
    }
  },
  computed: {
    entityTypeName () {
      const type = this.entity.entityType
      let entityTypeName = '-'
      switch (type) {
        case ('ip'): {
          entityTypeName = 'IP'
          break
        }
        case ('domain'): {
          entityTypeName = this.$t('overall.domain')
          break
        }
        case ('app'): {
          entityTypeName = 'APP'
          break
        }
        case ('subscriber'): {
          entityTypeName = 'SUBSCRIBER'
          break
        }
        default:
          break
      }
      return entityTypeName
    }
  },
  methods: {
    getTagColor,
    tagValueHandler (value) {
      const find = tagValueLabelMapping.find(t => t.value === value)
      return find ? find.name : value
    },
    getData () {
      this.toggleLoading(true)
      this.showError = false
      this.levelTwoTags = []
      const basicInfoRequest = axios.get(`${api.entity.basicInfo}/${this.entity.entityType}?resource=${this.entity.entityName}`)
      let requestArray = []
      if(this.entity.entityType === entityType.subscriber) {
        requestArray = [null,basicInfoRequest]
      }else {
        const tagRequest = axios.get(`${api.entity.tags}/${this.entity.entityType}?resource=${this.entity.entityName}`)
        requestArray = [tagRequest, basicInfoRequest]
      }
      Promise.all(requestArray).then(response => {
        const tagData = response[0]
        let tagError = ''
        const basicInfoData = response[1]
        let basicInfoError = ''
        if (tagData) {
          const res = tagData.data
          if (tagData.status === 200) {
            Object.keys(res.data).forEach(k => {
              if (k !== 'userDefinedTags' && res.data[k]) {
                Object.keys(res.data[k]).forEach(k2 => {
                  const find = entityDetailTags[this.entity.entityType].find(t => t.name === k2)
                  if (find) {
                    this.levelTwoTags.push({ key: k2, value: this.tagValueHandler(res.data[k][k2]), type: find.type })
                  }
                })
              }
            })
            if (_.isArray(res.data.userDefinedTags)) {
              this.levelTwoTags = _.concat(this.levelTwoTags, res.data.userDefinedTags.map(tag => ({ value: tag.tagValue, color: tag.knowledgeBase ? tag.knowledgeBase.color : entityDefaultColor })))
            }
            this.hideTagArea = _.isEmpty(this.levelTwoTags)
            this.$nextTick(() => {
              this.emitter.emit('entity-detail-hide-tag-area')
            })
          } else {
            tagError = this.errorMsgHandler(res)
          }
        }
        if (basicInfoData) {
          const res = basicInfoData.data
          if (basicInfoData.status === 200) {
            switch (this.entity.entityType) {
              case 'ip': {
                if (res.data.asn) {
                  this.detailCards.find(c => c.name === 'asn').value = res.data.asn.asn
                  this.detailCards.find(c => c.name === 'asOrg').value = res.data.asn.organization
                  // AS子网接口未返回
                }
                if (res.data.location) {
                  this.detailCards.find(c => c.name === 'isp').value = res.data.location.isp
                  this.detailCards.find(c => c.name === 'location').value = this.handleLocation(res.data.location)
                  // DNS PTR接口未返回
                }
                break
              }
              case 'domain': {
                if (res.data.category) {
                  this.detailCards.find(c => c.name === 'categoryName').value = res.data.category.categoryName
                  this.detailCards.find(c => c.name === 'categoryGroup').value = res.data.category.categoryGroup
                  this.detailCards.find(c => c.name === 'reputationLevel').value = res.data.category.reputationLevel
                }
                if (res.data.whois) {
                  this.detailCards.find(c => c.name === 'expireDate').value = dateFormatByAppearance(res.data.whois.expireDate)
                  this.detailCards.find(c => c.name === 'registrarName').value = res.data.whois.registrarName
                  this.detailCards.find(c => c.name === 'registrantOrg').value = res.data.whois.registrantOrg
                  this.detailCards.find(c => c.name === 'registrantCountry').value = res.data.whois.registrantCountry
                  this.detailCards.find(c => c.name === 'createDate').value = dateFormatByAppearance(res.data.whois.createDate)
                  this.detailCards.find(c => c.name === 'email').value = res.data.whois.email
                }
                break
              }
              case 'app': {
                if (res.data.category) {
                  this.detailCards.find(c => c.name === 'appCategory').value = res.data.category.appCategory
                  this.detailCards.find(c => c.name === 'appSubcategory').value = res.data.category.appSubcategory
                  this.detailCards.find(c => c.name === 'appRisk').value = this.appRisk(res.data.category.appRisk)
                  this.detailCards.find(c => c.name === 'appTechnology').value = res.data.category.appTechnology
                  this.detailCards.find(c => c.name === 'appName').value = res.data.category.appName
                  this.detailCards.find(c => c.name === 'appLongname').value = res.data.category.appLongname
                  this.detailCards.find(c => c.name === 'appDescription').value = res.data.category.appDescription
                }
                break
              }
              case 'subscriber': {
                this.detailCards.find(c => c.name === 'iphoneNumber').value = res.data.phone_number
                this.detailCards.find(c => c.name === 'imei').value = res.data.imei
                this.detailCards.find(c => c.name === 'imsi').value = res.data.imsi
                this.detailCards.find(c => c.name === 'apn').value = res.data.apn
                break
              }
            }
          } else {
            basicInfoError = this.errorMsgHandler(res)
          }
        }
        if (tagError) {
          this.showError = true
          this.errorMsg += tagError
        }
        if (basicInfoError) {
          this.showError = true
          this.errorMsg += basicInfoError
        }
      }).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    appRisk (level) {
      const m = riskLevelMapping.find(mapping => {
        return mapping.value == level
      })
      return (m && m.name) || level
    },
    handleLocation (data) {
      const location = []
      if (data.country) {
        location.push(data.country)
      }
      if (data.province) {
        location.push(data.province)
      }
      if (data.city) {
        location.push(data.city)
      }
      return location.join(' - ')
    },
    copyEntityName () {
      selectElementText(document.getElementById('entityName'))
      if (copySelectionText()) {
        this.$message.success(this.$t('tip.copySuccess'))
      } else {
        this.$message.error('Unknown error')
      }
    },
    analysisPopSwitch (show) {
      this.analysisPopShow = show
    },
    jump (url) {
      window.open(url, '_blank')
    }
  },
  setup (props) {
    const analysisItems = ref([])

    // 生成url
    const resolvePath = (router) => {
      const { href } = useRouter().resolve(router)
      return href
    }
    // 右上角analysis按钮
    const networkOverviewAnalysisItem = {
      icon: 'cn-icon cn-icon-overview',
      label: i18n.global.t('networkOverview.networkOverview'),
      path: '/panel/networkOverview'
    }
    const npmAnalysisItem = {
      icon: 'cn-icon cn-icon-network-performance',
      label: i18n.global.t('entities.networkPerformance'),
      path: '/panel/networkAppPerformance'
    }
    const dnsAnalysisItem = {
      icon: 'cn-icon cn-icon-dns-insight',
      label: i18n.global.t('dns.dnsInsights'),
      path: '/panel/dnsServiceInsights'
    }
    const graphItem = {
      icon: 'cn-icon cn-icon-graph',
      label: i18n.global.t('entities.graph'),
      url: resolvePath({
        path: '/entity/graph',
        query: {
          entityType: props.entity.entityType,
          entityName: props.entity.entityName
        }
      })
    }
    switch (props.entity.entityType) {
      case 'ip': {
        const networkOverviewAnalysisItemCopy = _.cloneDeep(networkOverviewAnalysisItem)
        networkOverviewAnalysisItemCopy.url = resolvePath({
          path: networkOverviewAnalysisItemCopy.path,
          query: {
            queryCondition: `common_client_ip='${props.entity.entityName}' OR common_server_ip='${props.entity.entityName}'`,
            lineQueryCondition: `ip='${props.entity.entityName}'`,
            panelName: props.entity.entityName,
            thirdMenu: 'network.ips',
            dimensionType: 'ip',
            fourthMenu: props.entity.entityName,
            thirdPanel: drillDownPanelTypeMapping.networkOverview,
            fourthPanel: drillDownPanelTypeMapping.networkOverview
          }
        })
        const npmAnalysisItemCopy = _.cloneDeep(npmAnalysisItem)
        npmAnalysisItemCopy.url = resolvePath({
          path: npmAnalysisItemCopy.path,
          query: {
            queryCondition: `ip='${props.entity.entityName}'`,
            lineQueryCondition: `ip='${props.entity.entityName}'`,
            panelName: props.entity.entityName,
            thirdMenu: 'network.ips',
            dimensionType: 'ip',
            fourthMenu: props.entity.entityName,
            thirdPanel: drillDownPanelTypeMapping.npmThirdMenu,
            fourthPanel: drillDownPanelTypeMapping.npmOverviewIp
          }
        })
        const dnsAnalysisItemCopy = _.cloneDeep(dnsAnalysisItem)
        dnsAnalysisItemCopy.url = resolvePath({
          path: dnsAnalysisItem.path,
          query: {
            queryCondition: `common_server_ip='${props.entity.entityName}'`,
            lineQueryCondition: `server_ip='${props.entity.entityName}'`,
            panelName: props.entity.entityName,
            thirdMenu: 'dns.dnsServer',
            dimensionType: 'dnsServer',
            fourthMenu: props.entity.entityName,
            thirdPanel: drillDownPanelTypeMapping.dnsThirdMenu,
            fourthPanel: drillDownPanelTypeMapping.dnsFourthMenu
          }
        })
        analysisItems.value.push(networkOverviewAnalysisItemCopy)
        analysisItems.value.push(npmAnalysisItemCopy)
        analysisItems.value.push(dnsAnalysisItemCopy)
        break
      }
      case 'domain': {
        const networkOverviewAnalysisItemCopy = _.cloneDeep(networkOverviewAnalysisItem)
        networkOverviewAnalysisItemCopy.url = resolvePath({
          path: networkOverviewAnalysisItemCopy.path,
          query: {
            queryCondition: `domain='${props.entity.entityName}'`,
            lineQueryCondition: `domain='${props.entity.entityName}'`,
            panelName: props.entity.entityName,
            thirdMenu: 'network.domains',
            dimensionType: 'domain',
            fourthMenu: props.entity.entityName,
            thirdPanel: drillDownPanelTypeMapping.networkOverview,
            fourthPanel: drillDownPanelTypeMapping.networkOverview
          }
        })
        const npmAnalysisItemCopy = _.cloneDeep(npmAnalysisItem)
        npmAnalysisItemCopy.url = resolvePath({
          path: npmAnalysisItemCopy.path,
          query: {
            queryCondition: `domain='${props.entity.entityName}'`,
            lineQueryCondition: `domain='${props.entity.entityName}'`,
            panelName: props.entity.entityName,
            thirdMenu: 'network.domains',
            dimensionType: 'domain',
            fourthMenu: props.entity.entityName,
            thirdPanel: drillDownPanelTypeMapping.npmThirdMenu,
            fourthPanel: drillDownPanelTypeMapping.npmOverviewDomain
          }
        })
        const dnsAnalysisItemCopy = _.cloneDeep(dnsAnalysisItem)
        dnsAnalysisItemCopy.url = resolvePath({
          path: dnsAnalysisItem.path,
          query: {
            queryCondition: `dns_qname='${props.entity.entityName}'`,
            lineQueryCondition: `qname='${props.entity.entityName}'`,
            panelName: props.entity.entityName,
            thirdMenu: 'QNames',
            dimensionType: 'qname',
            fourthMenu: props.entity.entityName,
            thirdPanel: drillDownPanelTypeMapping.dnsThirdMenu,
            fourthPanel: drillDownPanelTypeMapping.dnsFourthMenu
          }
        })
        analysisItems.value.push(networkOverviewAnalysisItemCopy)
        analysisItems.value.push(npmAnalysisItemCopy)
        analysisItems.value.push(dnsAnalysisItemCopy)
        break
      }
      case 'app': {
        const queryCondition = `common_app_label='${props.entity.entityName}'`
        const networkOverviewAnalysisItemCopy = _.cloneDeep(networkOverviewAnalysisItem)
        networkOverviewAnalysisItemCopy.url = resolvePath({
          path: networkOverviewAnalysisItemCopy.path,
          query: {
            queryCondition: queryCondition,
            lineQueryCondition: queryCondition,
            panelName: props.entity.entityName,
            thirdMenu: 'network.applications',
            dimensionType: 'appLabel',
            fourthMenu: props.entity.entityName,
            thirdPanel: drillDownPanelTypeMapping.networkOverview,
            fourthPanel: drillDownPanelTypeMapping.networkOverview
          }
        })
        const npmAnalysisItemCopy = _.cloneDeep(npmAnalysisItem)
        npmAnalysisItemCopy.url = resolvePath({
          path: npmAnalysisItemCopy.path,
          query: {
            queryCondition: queryCondition,
            lineQueryCondition: queryCondition,
            panelName: props.entity.entityName,
            thirdMenu: 'network.applications',
            dimensionType: 'appLabel',
            fourthMenu: props.entity.entityName,
            thirdPanel: drillDownPanelTypeMapping.npmThirdMenu,
            fourthPanel: drillDownPanelTypeMapping.npmOverviewApp
          }
        })
        analysisItems.value.push(networkOverviewAnalysisItemCopy)
        analysisItems.value.push(npmAnalysisItemCopy)
        break
      }
    }
    analysisItems.value.push(graphItem)
    // 底部各属性
    const detailCards = ref([])
    switch (props.entity.entityType) {
      case 'ip': {
        detailCards.value = _.concat(detailCards.value,
          { icon: 'cn-icon cn-icon-as', name: 'asn', label: 'ASN', value: '' },
          { icon: 'cn-icon cn-icon-registry', name: 'asOrg', label: i18n.global.t('entities.asOrg'), value: '' },
          // { icon: 'cn-icon cn-icon-as-subnet', name: 'asSubnet', label: i18n.global.t('entities.asSubnet'), value: '' },
          { icon: 'cn-icon cn-icon-operator', name: 'isp', label: 'ISP', value: '' },
          { icon: 'cn-icon cn-icon-geo-location', name: 'location', label: i18n.global.t('entities.geographicLocation'), value: '' }
          // { icon: 'cn-icon cn-icon-dns-ptr', name: 'dnsPtr', label: 'DNS PTR', value: '' }
        )
        break
      }
      case 'domain': {
        detailCards.value = _.concat(detailCards.value,
          { icon: 'cn-icon cn-icon-category2', name: 'categoryName', label: i18n.global.t('entities.category'), value: '' },
          { icon: 'cn-icon cn-icon-sub-type', name: 'categoryGroup', label: i18n.global.t('entities.domainDetail.categoryGroup'), value: '' },
          { icon: 'cn-icon cn-icon-credit-rating', name: 'reputationLevel', label: i18n.global.t('entities.creditLevel2'), value: '' },
          { icon: 'cn-icon cn-icon-expire-date', name: 'expireDate', label: i18n.global.t('entities.expirationDate2'), value: '' },
          { icon: 'cn-icon cn-icon-registrar', name: 'registrarName', label: i18n.global.t('entities.registrar'), value: '' },
          { icon: 'cn-icon cn-icon-registry', name: 'registrantOrg', label: i18n.global.t('entities.registry'), value: '' },
          { icon: 'cn-icon cn-icon-registration-country', name: 'registrantCountry', label: i18n.global.t('entities.registrationCountry'), value: '' },
          { icon: 'cn-icon cn-icon-registration-date', name: 'createDate', label: i18n.global.t('entities.registrationDate'), value: '' },
          { icon: 'cn-icon cn-icon-registry-email', name: 'email', label: i18n.global.t('entities.registryEmail'), value: '' }
        )
        break
      }
      case 'app': {
        detailCards.value = _.concat(detailCards.value,
          { icon: 'cn-icon cn-icon-category2', name: 'appCategory', label: i18n.global.t('entities.category'), value: '' },
          { icon: 'cn-icon cn-icon-sub-type', name: 'appSubcategory', label: i18n.global.t('entities.subcategory'), value: '' },
          { icon: 'cn-icon cn-icon-credit-rating', name: 'appRisk', label: i18n.global.t('entities.riskLevel'), value: '' },
          { icon: 'cn-icon cn-icon-technology', name: 'appTechnology', label: i18n.global.t('overall.technology'), value: '' },
          { icon: 'cn-icon cn-icon-app-name', name: 'appName', label: i18n.global.t('overall.appName2'), value: '' },
          { icon: 'cn-icon cn-icon-app-full-name', name: 'appLongname', label: i18n.global.t('overall.appFullName'), value: '' },
          { icon: 'cn-icon cn-icon-description', name: 'appDescription', label: i18n.global.t('config.dataSource.description'), value: '' }
        )
      }
      case 'subscriber': {
        detailCards.value = _.concat(detailCards.value,
          { icon: 'cn-icon cn-icon-shoujihaoma', name: 'iphoneNumber', label: i18n.global.t('entities.iphoneNumber'), value: '' },
          { icon: 'cn-icon cn-icon-IMEI', name: 'imei', label: i18n.global.t('entities.imei'), value: '' },
          { icon: 'cn-icon cn-icon-IMSI', name: 'imsi', label: i18n.global.t('entities.imsi'), value: '' },
          { icon: 'cn-icon cn-icon-APN', name: 'apn', label: i18n.global.t('entities.apn'), value: '' }
        )
      }
    }
    return {
      entityType,
      analysisItems,
      detailCards
    }
  }
}
</script>
