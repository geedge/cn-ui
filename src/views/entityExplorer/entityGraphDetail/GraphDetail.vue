<template>
  <!--title-->
  <div class="graph-detail-basic-info">
    <div style="display: flex">
      <div class="graph-detail__icon"><i :class="iconClass"></i></div>

      <div class="graph-detail-header">
        <div class="entity-graph-type">{{ entityType[entity.type || entity.entityType] }}</div>
        <div class="graph-basic-info">
          <div class="graph-basic-info-name__block">
            <div class="graph-basic-info-name" :title="$_.get(entity, 'detailData.vertex', '')" id="entityName">{{ $_.get(entity, 'detailData.vertex', '') }}</div>
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
      <template v-if="entity.type === 'ip'">
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.asNumber') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity.detailData, 'detail.asn.asn', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.asOrg') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity.detailData, 'detail.asn.organization', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.graph.isp') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity.detailData, 'detail.location.isp', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('overall.location') }}:</div>
          <div class="graph-content-item-value">{{ location(entity.detailData) }}</div>
        </div>
      </template>
      <template v-else-if="entity.type === 'domain'">
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.category') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.category.name', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.group') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.category.group', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.creditLevel2') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.category.reputationLevel', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.graph.expirationDate') }}:</div>
          <div class="graph-content-item-value">{{ handleDate('detailData.detail.whois.expireDate') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.registrar') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.whois.registrarName', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.registry') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.whois.registrantOrg', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.registrationCountry') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.whois.registrantCountry', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.registrationDate') }}:</div>
          <div class="graph-content-item-value">{{ handleDate('detailData.detail.whois.createDate') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.registryEmail') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.whois.email', '-') }}</div>
        </div>
      </template>
      <template v-else-if="entity.type === 'app'">
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.category') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.category.appCategory', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.subcategory') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.category.appSubcategory', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('entities.riskLevel') }}:</div>
          <div class="graph-content-item-value">{{ appRisk($_.get(entity, 'detailData.detail.category.appRisk', '-')) }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('overall.technology') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.category.appTechnology', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('overall.appFullName') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.category.appLongname', '-') }}</div>
        </div>
        <div class="graph-content-item" >
          <div class="graph-content-item-label">{{ $t('config.dataSource.description') }}:</div>
          <div class="graph-content-item-value">{{ $_.get(entity, 'detailData.detail.category.appDescription', '-') }}</div>
        </div>
      </template>
    </div>
  </div>

  <!--关系拓展-->
  <div class="digital-certificate graph-basic-info__block">
    <loading :loading="entity.loading" size="small"></loading>
    <div class="digital-certificate-header padding-b-10">
      <div class="digital-certificate-header__icon graph-header__icon"></div>
      <div class="graph-basic-info__block-title">
        {{ $t('entity.graph.relationshipExpansion') }}
      </div>
    </div>

    <div class="graph-basic-info__block-content" style="margin-top: -4px;">
      <div v-for="item in relationList" :key="item.name">
        <div class="graph-content-item graph-content-relationship-item" v-if="item.value === item.total">
          <div class="graph-relationship-item-label">
            <i class="margin-r-6" :class="item.icon"></i>
            <span>{{ item.label }}：</span>
          </div>
          <div class="graph-relationship-item-value">
            <span class="margin-r-6">{{ item.value }}/{{ item.total }}</span>
            <i class="cn-icon cn-icon-expand-relationship" :style="{color: iconColor(item.value, item.total)}"></i>
          </div>
        </div>

        <div v-else class="graph-content-item graph-content-relationship-item">
          <div class="graph-relationship-item-label">
            <i class="graph-relationship-item-label-icon margin-r-6" :class="item.icon"></i>
            <span>{{ item.label }}：</span>
          </div>
          <div class="graph-relationship-item-value">
            <span class="margin-r-6">{{ item.value }}/{{ item.total }}</span>
            <i class="cn-icon cn-icon-expand-relationship graph-expand-relationship__icon" :style="{color: iconColor(item.value, item.total)}" @click="expandRelation(item.name)"></i>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--标签-->
  <div v-if="entity.tags" class="digital-certificate graph-basic-info__block">
    <div class="digital-certificate-header padding-b-10">
      <div class="digital-certificate-header__icon graph-header__icon"></div>
      <div class="graph-basic-info__block-title">
        {{ $t('entity.graph.tags') }}
      </div>
    </div>

    <div class="entity-detail graph-basic-info__block-content">
      <div class="graph-tag-list">
        <div v-for="ic in entity.tags" :key="ic.value">
          <div class="entity-tag graph-tag-item" :class="`entity-tag--level-two-${ic.type}`">
            <span>{{ic.value}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { copySelectionText, selectElementText } from '@/utils/tools'
import { entityType, riskLevelMapping } from '@/utils/constants'
import chartMixin from '@/views/charts2/chart-mixin'
import { dateFormatByAppearance } from '@/utils/date-util'
import { ref } from 'vue'
import _ from 'lodash'
import Loading from '@/components/common/Loading'

export default {
  name: 'DomainDetail',
  props: {
    entity: {
      type: Object
    }
  },
  mixins: [chartMixin],
  components: {
    Loading
  },
  data () {
    return {
      entityType
    }
  },
  computed: {
    appRisk () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value == level
        })
        return (m && m.name) || level
      }
    },
    iconClass () {
      let className
      switch (this.entity.type) {
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
    },
    handleDate () {
      return function (key) {
        const date = _.get(this.entity, key, '')
        return date ? dateFormatByAppearance(date) : '-'
      }
    }
  },
  watch: {
    entity: {
      deep: true,
      handler (n) {
        this.handleDetailData(n)
      }
    }
  },
  mounted () {
    this.handleDetailData(this.entity)
  },
  setup (props) {
    const detailCards = ref([])
    const relationList = ref([])
    const tagList = ref([])

    return {
      detailCards,
      relationList,
      tagList
    }
  },
  methods: {
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
        if (length === 50) {
          return 'rgba(57, 57, 57, 0.5)'
        } else {
          return 'rgba(57, 57, 57, 1)'
        }
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
    /** 关系拓展 */
    expandRelation (name) {
      this.$emit('expandDetailList', name === 'subDomain' ? 'domain' : name, this.entity.name)
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    },
    location (detailData) {
      let location = ''
      if (detailData) {
        const data = detailData.detail
        if (data) {
          if (data.city) {
            location = data.city
          }
          if (data.province) {
            location = location ? `${data.province}, ${location}` : data.province
          }
          if (data.country) {
            location = location ? `${data.country}, ${location}` : data.country
          }
        }
      }
      return location || '-'
    },
    handleDetailData (entity) {
      const n = entity
      const type = n.type || n.entityType
      switch (type) {
        case 'ip': {
          this.detailCards = [
            { name: 'asn', label: this.$t('entities.asNumber'), value: _.get(n.detailData, 'detail.asn.asn', '-') },
            {
              name: 'asOrg',
              label: this.$t('entities.asOrg'),
              value: _.get(n.detailData, 'detail.asn.organization', '-')
            },
            {
              name: 'isp',
              label: this.$t('entities.graph.isp'),
              value: _.get(n.detailData, 'detail.location.isp', '-')
            },
            { name: 'location', label: this.$t('overall.location'), value: this.location(n.detailData) }
          ]
          this.relationList = [
            {
              icon: 'cn-icon cn-icon-subdomain',
              name: 'domain',
              label: this.$t('entity.graph.resolveDomain'),
              value: _.get(n.relatedEntityCount, 'domain.current', '0') || 0,
              total: _.get(n.relatedEntityCount, 'domain.total', '0') || 0
            },
            {
              icon: 'cn-icon cn-icon-app-name',
              name: 'app',
              label: this.$t('entities.tab.relatedApp'),
              value: _.get(n.relatedEntityCount, 'app.current', '0') || 0,
              total: _.get(n.relatedEntityCount, 'app.total', '0') || 0
            }
          ]
          break
        }
        case 'domain': {
          const expireDate = _.get(n.detailData, 'detail.whois.expireDate', '')
          const createDate = _.get(n.detailData, 'detail.whois.createDate', '')
          this.detailCards = [
            {
              name: 'categoryName',
              label: this.$t('entities.category'),
              value: _.get(n.detailData, 'detail.category.name', '-')
            },
            {
              name: 'categoryGroup',
              label: this.$t('entities.group'),
              value: _.get(n.detailData, 'detail.category.group', '-')
            },
            {
              name: 'reputationLevel',
              label: this.$t('entities.creditLevel2'),
              value: _.get(n.detailData, 'detail.category.reputationLevel', '-')
            },
            {
              name: 'expireDate',
              label: this.$t('entities.graph.expirationDate'),
              value: expireDate ? dateFormatByAppearance(expireDate) : '-'
            },
            {
              name: 'registrarName',
              label: this.$t('entities.registrar'),
              value: _.get(n.detailData, 'detail.whois.registrarName', '-')
            },
            {
              name: 'registrantOrg',
              label: this.$t('entities.registry'),
              value: _.get(n.detailData, 'detail.whois.registrantOrg', '-')
            },
            {
              name: 'registrantCountry',
              label: this.$t('entities.registrationCountry'),
              value: _.get(n.detailData, 'detail.whois.registrantCountry', '-')
            },
            {
              name: 'createDate',
              label: this.$t('entities.registrationDate'),
              value: createDate ? dateFormatByAppearance(createDate) : '-'
            },
            {
              name: 'email',
              label: this.$t('entities.registryEmail'),
              value: _.get(n.detailData, 'detail.whois.email', '-')
            }
          ]
          this.relationList = [
            {
              icon: 'cn-icon cn-icon-resolve-ip',
              name: 'ip',
              label: this.$t('entities.graph.resolveIp'),
              value: _.get(n.relatedEntityCount, 'ip.current', '0') || 0,
              total: _.get(n.relatedEntityCount, 'ip.total', '0') || 0
            },
            {
              icon: 'cn-icon cn-icon-subdomain',
              name: 'subDomain',
              label: this.$t('entities.subdomain'),
              value: _.get(n.relatedEntityCount, 'subDomain.current', '0') || 0,
              total: _.get(n.relatedEntityCount, 'subDomain.total', '0') || 0
            },
            {
              icon: 'cn-icon cn-icon-app-name',
              name: 'app',
              label: this.$t('entities.tab.relatedApp'),
              value: _.get(n.relatedEntityCount, 'app.current', 0) || 0,
              total: _.get(n.relatedEntityCount, 'app.total', 0) || 0
            }
          ]
          break
        }
        case 'app': {
          this.detailCards = [
            {
              name: 'appCategory',
              label: this.$t('entities.category'),
              value: _.get(n.detailData, 'detail.category.appCategory', '-')
            },
            {
              name: 'appSubcategory',
              label: this.$t('entities.subcategory'),
              value: _.get(n.detailData, 'detail.category.appSubcategory', '-')
            },
            {
              name: 'appRisk',
              label: this.$t('entities.riskLevel'),
              value: _.get(n.detailData, 'detail.category.appRisk', '-')
            },
            {
              name: 'appTechnology',
              label: this.$t('overall.technology'),
              value: _.get(n.detailData, 'detail.category.appTechnology', '-')
            },
            {
              name: 'appLongname',
              label: this.$t('overall.appFullName'),
              value: _.get(n.detailData, 'detail.category.appLongname', '-')
            },
            {
              name: 'appDescription',
              label: this.$t('config.dataSource.description'),
              value: _.get(n.detailData, 'detail.category.appDescription', '-')
            }
          ]

          this.relationList = [
            {
              icon: 'cn-icon cn-icon-resolve-ip',
              name: 'ip',
              label: this.$t('entities.graph.resolveIp'),
              value: _.get(n.relatedEntityCount, 'ip.current', '0') || 0,
              total: _.get(n.relatedEntityCount, 'ip.total', '0') || 0
            },
            {
              icon: 'cn-icon cn-icon-subdomain',
              name: 'domain',
              label: this.$t('entity.graph.resolveDomain'),
              value: _.get(n.relatedEntityCount, 'domain.current', '0') || 0,
              total: _.get(n.relatedEntityCount, 'domain.total', '0') || 0
            }
          ]
        }
      }
    }
  }
}
</script>
