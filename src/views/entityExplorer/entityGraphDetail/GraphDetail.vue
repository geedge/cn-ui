<template>
  <!--title-->
  <div class="graph-detail-basic-info">
    <div style="display: flex">
      <div class="graph-detail__icon"><i :class="iconClass"></i></div>

      <div class="graph-detail-header">
        <div class="entity-graph-type">{{ entityType[entity.entityType] }}</div>
        <div class="graph-basic-info">
          <div class="graph-basic-info-name__block">
            <div class="graph-basic-info-name" id="entityName">{{ entity.entityName }}</div>
            <div class="graph-basic-info-icon" @click="copyEntityName">
              <i class="cn-icon cn-icon-copy"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <i class="cn-icon cn-icon-close graph-close" @click="closeBlock"></i>
  </div>

  <!--basic info-->
  <div class="digital-certificate graph-basic-info__block">
    <div class="digital-certificate-header padding-b-10">
      <div class="digital-certificate-header__icon graph-header__icon"></div>
      <div class="graph-basic-info__block-title">
        {{ $t('overall.basicInfo') }}
      </div>
    </div>

    <div class="graph-basic-info__block-content">
      <div class="graph-content-item" v-for="item in detailCards" :key="item.name">
        <div class="graph-content-item-label">{{ item.label }}:</div>
        <div class="graph-content-item-value">{{ item.value || '-' }}</div>
      </div>
    </div>
  </div>

  <!--关系拓展-->
  <div class="digital-certificate graph-basic-info__block">
    <div class="digital-certificate-header padding-b-10">
      <div class="digital-certificate-header__icon graph-header__icon"></div>
      <div class="graph-basic-info__block-title">
        {{ $t('entity.graph.relationshipExpansion') }}
      </div>
    </div>

    <div class="graph-basic-info__block-content" style="margin-top: -4px;">
      <div v-for="item in relationList" :key="item.name" @click="expandRelation(item.name)">
        <el-popover
            v-if="item.value.length === item.total"
            placement="top"
            auto-close="2000"
            trigger="click"
            :content="$t('entity.graph.completed')"
            popper-class="graph-popover"
        >
          <template #reference>
            <div class="graph-content-item graph-content-relationship-item">
              <div class="graph-relationship-item-label">
                <i class="margin-r-6" :class="item.icon"></i>
                <span>{{ item.label }}：</span>
              </div>
              <div class="graph-relationship-item-value">
                <span class="margin-r-6">{{ item.value.length }}/{{ item.total }}</span>
                <i class="cn-icon cn-icon-expand-relationship" :style="{color: iconColor(item.value.length, item.total)}"></i>
              </div>
            </div>
          </template>
        </el-popover>

        <div v-else class="graph-content-item graph-content-relationship-item">
          <div class="graph-relationship-item-label">
            <i class="graph-relationship-item-label-icon margin-r-6" :class="item.icon"></i>
            <span>{{ item.label }}：</span>
          </div>
          <div class="graph-relationship-item-value">
            <span class="margin-r-6">{{ item.value.length }}/{{ item.total }}</span>
            <el-tooltip
                effect="dark"
                :content="$t('entity.graph.expandDownward')"
                placement="top-end"
            >
              <i class="cn-icon cn-icon-expand-relationship graph-expand-relationship__icon" :style="{color: iconColor(item.value.length, item.total)}"></i>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--标签-->
  <div class="digital-certificate graph-basic-info__block">
    <div class="digital-certificate-header padding-b-10">
      <div class="digital-certificate-header__icon graph-header__icon"></div>
      <div class="graph-basic-info__block-title">
        {{ $t('entity.graph.labels') }}
      </div>
    </div>

    <div class="entity-detail graph-basic-info__block-content">
      <div class="graph-tag-list">
        <div v-for="ic in tagList" :key="ic.key">
          <div class="entity-tag graph-tag-item" :class="`entity-tag--level-two-${ic.type}`">
            <span>{{ic.value}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n'
import { copySelectionText, selectElementText } from '@/utils/tools'
import { entityType, riskLevelMapping } from '@/utils/constants'
import axios from 'axios'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import { dateFormatByAppearance } from '@/utils/date-util'
import { ref } from 'vue'
import _ from 'lodash'

export default {
  name: 'DomainDetail',
  props: {
    entity: {
      type: Object
    }
  },
  mixins: [chartMixin],
  data () {
    return {
      entityType
    }
  },
  computed: {
    iconClass () {
      let className
      switch (this.entity.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip2'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain2'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app2'
          break
        }
        default:
          break
      }
      return className
    }
  },
  mounted () {
    this.initData()
  },
  setup (props) {
    const detailCards = ref([])
    const relationList = ref([])
    const tagList = ref([])
    // 标签列表，后续请求接口时处理
    tagList.value = [
      { key: 'isp', value: '信息技术', type: 'positive' },
      { key: 'malwareName', value: '互联网', type: 'normal' },
      { key: 'malwareName1', value: '互联网', type: 'normal' },
      { key: 'malwareName2', value: '互联网', type: 'normal' },
      { key: 'malwareName3', value: '互联网', type: 'normal' },
      { key: 'malwareName4', value: '互联网', type: 'normal' },
      { key: 'malwareName5', value: '互联网', type: 'normal' },
      { key: 'malwareName6', value: '互联网', type: 'normal' },
      { key: 'malwareName7', value: '互联网', type: 'normal' },
      { key: 'malwareName8', value: '互联网', type: 'normal' },
      { key: 'malwareName9', value: '互联网', type: 'normal' },
      { key: 'malwareName10', value: '互联网', type: 'normal' },
      { key: 'malwareName11', value: '互联网', type: 'normal' },
      { key: 'malwareName12', value: '互联网', type: 'normal' }
    ]

    switch (props.entity.entityType) {
      case 'ip': {
        detailCards.value = _.concat(detailCards.value,
          { name: 'asn', label: i18n.global.t('entities.asNumber'), value: '' },
          { name: 'asOrg', label: i18n.global.t('entities.asOrg'), value: '' },
          { name: 'asSubnet', label: i18n.global.t('entities.asSubnet'), value: '' },
          { name: 'isp', label: i18n.global.t('entities.graph.isp'), value: '' },
          { name: 'location', label: i18n.global.t('entities.geographicLocation'), value: '' }
          // { name: 'dnsPtr', label: 'DNS PTR', value: '' }
        )

        relationList.value = _.concat(relationList.value,
          { icon: 'cn-icon cn-icon-subdomain', name: 'resolveIp', label: i18n.global.t('entity.graph.resolveDomain'), value: [], total: 12 },
          { icon: 'cn-icon cn-icon-app-name', name: 'relatedApp', label: i18n.global.t('entities.tab.relatedApp'), value: [], total: 6 }
        )
        break
      }
      case 'domain': {
        detailCards.value = _.concat(detailCards.value,
          { name: 'categoryName', label: i18n.global.t('entities.category'), value: '' },
          { name: 'categoryGroup', label: i18n.global.t('entities.domainDetail.subcategory'), value: '' },
          { name: 'reputationLevel', label: i18n.global.t('entities.creditLevel2'), value: '' },
          { name: 'expireDate', label: i18n.global.t('entities.graph.expirationDate'), value: '' },
          { name: 'registrarName', label: i18n.global.t('entities.registrar'), value: '' },
          { name: 'registrantOrg', label: i18n.global.t('entities.registry'), value: '' },
          { name: 'registrantCountry', label: i18n.global.t('entities.registrationCountry'), value: '' },
          { name: 'createDate', label: i18n.global.t('entities.registrationDate'), value: '' },
          { name: 'email', label: i18n.global.t('entities.registryEmail'), value: '' }
        )

        relationList.value = _.concat(relationList.value,
          { icon: 'cn-icon cn-icon-resolve-ip', name: 'resolveIp', label: i18n.global.t('entities.graph.resolveIp'), value: [], total: 12 },
          { icon: 'cn-icon cn-icon-subdomain', name: 'subdomain', label: i18n.global.t('entities.subdomain'), value: [1, 2], total: 2 },
          { icon: 'cn-icon cn-icon-app-name', name: 'relatedApp', label: i18n.global.t('entities.tab.relatedApp'), value: [], total: 6 }
        )
        break
      }
      case 'app': {
        detailCards.value = _.concat(detailCards.value,
          { name: 'appCategory', label: i18n.global.t('entities.category'), value: '' },
          { name: 'appSubcategory', label: i18n.global.t('entities.subcategory'), value: '' },
          { name: 'appRisk', label: i18n.global.t('entities.riskLevel'), value: '' },
          { name: 'appTechnology', label: i18n.global.t('overall.technology'), value: '' },
          { name: 'appName', label: i18n.global.t('overall.appName2'), value: '' },
          { name: 'appLongname', label: i18n.global.t('overall.appFullName'), value: '' },
          { name: 'appDescription', label: i18n.global.t('config.dataSource.description'), value: '' }
        )

        relationList.value = _.concat(relationList.value,
          { icon: 'cn-icon cn-icon-resolve-ip', name: 'resolveIp', label: i18n.global.t('entities.graph.resolveIp'), value: [], total: 12 },
          { icon: 'cn-icon cn-icon-subdomain', name: 'resolveDomain', label: i18n.global.t('entity.graph.resolveDomain'), value: [], total: 12 }
        )
      }
    }

    return {
      detailCards,
      relationList,
      tagList
    }
  },
  methods: {
    initData () {
      axios.get(`${api.entity.basicInfo}/${this.entity.entityType}?resource=${this.entity.entityName}`).then(response => {
        const res = response.data
        if (res.code === 200) {
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
          }
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    /** 复制实体名称 */
    copyEntityName () {
      selectElementText(document.getElementById('entityName'))
      if (copySelectionText()) {
        this.$message.success(this.$t('tip.copySuccess'))
      } else {
        this.$message.error('Unknown error')
      }
    },
    /** 修改关系拓展图标颜色，全部拓展浅灰色，否则深灰色 */
    iconColor (length, total) {
      if (length < total) {
        return 'rgba(57, 57, 57, 1)'
      } else {
        return 'rgba(57, 57, 57, 0.5)'
      }
    },
    // 关闭右侧详情栏
    closeBlock () {
      this.$emit('closeBlock')
    },
    /** 构造地址，国-省市-市 */
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
    appRisk (level) {
      const m = riskLevelMapping.find(mapping => {
        return mapping.value === level
      })
      return (m && m.name) || level
    },
    /** 关系拓展 */
    expandRelation (name) {
      // todo 模拟效果，后续修改
      const obj = this.relationList.find(item => item.name === name)
      if (obj) {
        const num = obj.total - obj.value.length
        if (num > 0) {
          const len = num < 10 ? num : 10
          for (let i = 0; i < len; i++) {
            obj.value.push(i)
          }
          this.$emit('expand')
        }
      }
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    }
  }
}
</script>
