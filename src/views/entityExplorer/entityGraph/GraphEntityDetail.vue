<template>
  <!--title-->
  <div class="graph-detail-basic-info">
    <div class="graph-detail-basic-info__block">
      <div class="graph-detail__icon"><i :class="iconClass"></i></div>

      <div class="graph-detail-header">
        <div class="entity-graph-type">{{entityTypeName}}</div>
        <div class="graph-basic-info">
          <div class="graph-basic-info-name__block">
            <div class="graph-basic-info-name" :title="$_.get(node, 'id', '')" id="entityName">{{ $_.get(node, 'id', '') }}</div>
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
      <div class="graph-content-item" v-for="detail in detailCards" :key="detail.name">
        <div class="graph-content-item-label">{{ detail.label }}:</div>
        <div class="graph-content-item-value">{{ detail.value || '-' }}</div>
      </div>
    </div>
  </div>

  <!--关系拓展-->
  <div class="digital-certificate graph-basic-info__block">
    <loading :loading="loading" size="small"></loading>
    <div class="digital-certificate-header padding-b-10">
      <div class="digital-certificate-header__icon graph-header__icon"></div>
      <div class="graph-basic-info__block-title">
        {{ $t('entity.graph.relationshipExpansion') }}
      </div>
    </div>

    <div class="graph-basic-info__block-content margin-t--4">
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
  <div v-if="$_.get(node, 'data.tags', []).length > 0" class="digital-certificate graph-basic-info__block">
    <div class="digital-certificate-header padding-b-10">
      <div class="digital-certificate-header__icon graph-header__icon"></div>
      <div class="graph-basic-info__block-title">
        {{ $t('entity.graph.tags') }}
      </div>
    </div>

    <div class="entity-detail graph-basic-info__block-content">
      <div class="graph-tag-list">
        <div v-for="ic in $_.get(node, 'data.tags', [])" :key="ic.value">
          <div class="entity-tag graph-tag-item" :class="`entity-tag--level-two-${ic.type}`" :style="getTagColor(ic.color)">
            <span>{{ic.value}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { copySelectionText, selectElementText, getTagColor } from '@/utils/tools'
import { entityType, riskLevelMapping } from '@/utils/constants'
import chartMixin from '@/views/charts2/chart-mixin'
import { dateFormatByAppearance } from '@/utils/date-util'
import { ref } from 'vue'
import _ from 'lodash'
import Loading from '@/components/common/Loading'

export default {
  name: 'GraphEntityDetail',
  props: {
    node: {
      type: Object
    },
    loading: {
      type: Boolean
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
    iconClass () {
      let className
      switch (_.get(this.node, 'data.entityType', '')) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip2'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-subdomain'
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
    entityTypeName () {
      const type = _.get(this.node, 'data.entityType', '')
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
        default:
          break
      }
      return entityTypeName
    },
    handleDate () {
      return function (key) {
        const date = _.get(this.node, key, '')
        return date ? dateFormatByAppearance(date) : '-'
      }
    }
  },
  watch: {
    node: {
      deep: true,
      handler (n) {
        console.info(n)
        this.handleDetailData(n)
      }
    }
  },
  mounted () {
    this.handleDetailData(this.node)
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
    getTagColor,
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
      this.$emit('expandDetailList', this.node.id, name)
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    },
    appRisk (level) {
      const m = riskLevelMapping.find(mapping => {
        return mapping.value == level
      })
      return (m && m.name) || level
    },
    location (detailData) {
      let location = ''
      if (detailData) {
        const data = detailData.basicInfo.location
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
    handleDetailData (node) {
      const n = node
      const type = _.get(n, 'data.entityType', '')
      switch (type) {
        case 'ip': {
          this.detailCards = [
            { name: 'asn', label: this.$t('entities.asNumber'), value: _.get(n, 'data.basicInfo.asn.asn', '-') },
            {
              name: 'asOrg',
              label: this.$t('entities.asOrg'),
              value: _.get(n.data, 'basicInfo.asn.organization', '-')
            },
            {
              name: 'isp',
              label: this.$t('entities.graph.isp'),
              value: _.get(n.data, 'basicInfo.location.isp', '-')
            },
            { name: 'location', label: this.$t('overall.location'), value: this.location(n.data) }
          ]
          this.relationList = [
            {
              icon: 'cn-icon cn-icon-subdomain',
              name: 'domain',
              label: this.$t('entity.graph.resolveDomain'),
              value: _.get(n.data, 'relatedEntities.domain.list', []).length,
              total: _.get(n.data, 'relatedEntities.domain.total', 0) || 0
            },
            {
              icon: 'cn-icon cn-icon-app-name',
              name: 'app',
              label: this.$t('entities.tab.relatedApp'),
              value: _.get(n.data, 'relatedEntities.app.list', []).length,
              total: _.get(n.data, 'relatedEntities.app.total', '0') || 0
            }
          ]
          break
        }
        case 'domain': {
          const expireDate = _.get(n.data, 'basicInfo.whois.expireDate', '')
          const createDate = _.get(n.data, 'basicInfo.whois.createDate', '')
          this.detailCards = [
            {
              name: 'categoryName',
              label: this.$t('entities.category'),
              value: _.get(n.data, 'basicInfo.category.categoryName', '-')
            },
            {
              name: 'categoryGroup',
              label: this.$t('entities.group'),
              value: _.get(n.data, 'basicInfo.category.categoryGroup', '-')
            },
            {
              name: 'reputationLevel',
              label: this.$t('entities.creditLevel2'),
              value: _.get(n.data, 'basicInfo.category.reputationLevel', '-')
            },
            {
              name: 'expireDate',
              label: this.$t('entities.graph.expirationDate'),
              value: expireDate ? dateFormatByAppearance(expireDate) : '-'
            },
            {
              name: 'registrarName',
              label: this.$t('entities.registrar'),
              value: _.get(n.data, 'basicInfo.whois.registrarName', '-')
            },
            {
              name: 'registrantOrg',
              label: this.$t('entities.registry'),
              value: _.get(n.data, 'basicInfo.whois.registrantOrg', '-')
            },
            {
              name: 'registrantCountry',
              label: this.$t('entities.registrationCountry'),
              value: _.get(n.data, 'basicInfo.whois.registrantCountry', '-')
            },
            {
              name: 'createDate',
              label: this.$t('entities.registrationDate'),
              value: createDate ? dateFormatByAppearance(createDate) : '-'
            },
            {
              name: 'email',
              label: this.$t('entities.registryEmail'),
              value: _.get(n.data, 'basicInfo.whois.email', '-')
            }
          ]
          this.relationList = [
            {
              icon: 'cn-icon cn-icon-resolve-ip',
              name: 'ip',
              label: this.$t('entities.graph.resolveIp'),
              value: _.get(n.data, 'relatedEntities.ip.list', []).length,
              total: _.get(n.data, 'relatedEntities.ip.total', '0') || 0
            },
            {
              icon: 'cn-icon cn-icon-subdomain',
              name: 'domain',
              label: this.$t('entities.subdomain'),
              value: _.get(n.data, 'relatedEntities.domain.list', []).length,
              total: _.get(n.data, 'relatedEntities.domain.total', '0') || 0
            },
            {
              icon: 'cn-icon cn-icon-app-name',
              name: 'app',
              label: this.$t('entities.tab.relatedApp'),
              value: _.get(n.data, 'relatedEntities.app.list', []).length,
              total: _.get(n.data, 'relatedEntities.app.total', 0) || 0
            }
          ]
          break
        }
        case 'app': {
          this.detailCards = [
            {
              name: 'appCategory',
              label: this.$t('entities.category'),
              value: _.get(n.data, 'basicInfo.category.appCategory', '-')
            },
            {
              name: 'appSubcategory',
              label: this.$t('entities.subcategory'),
              value: _.get(n.data, 'basicInfo.category.appSubcategory', '-')
            },
            {
              name: 'appRisk',
              label: this.$t('entities.riskLevel'),
              value: this.appRisk(_.get(n.data, 'basicInfo.category.appRisk', '-'))
            },
            {
              name: 'appTechnology',
              label: this.$t('overall.technology'),
              value: _.get(n.data, 'basicInfo.category.appTechnology', '-')
            },
            {
              name: 'appLongname',
              label: this.$t('overall.appFullName'),
              value: _.get(n.data, 'basicInfo.category.appLongname', '-')
            },
            {
              name: 'appDescription',
              label: this.$t('config.dataSource.description'),
              value: _.get(n.data, 'basicInfo.category.appDescription', '-')
            }
          ]

          this.relationList = [
            {
              icon: 'cn-icon cn-icon-resolve-ip',
              name: 'ip',
              label: this.$t('entities.tab.relatedIp'),
              value: _.get(n.data, 'relatedEntities.ip.list', []).length,
              total: _.get(n.data, 'relatedEntities.ip.total', '0') || 0
            },
            {
              icon: 'cn-icon cn-icon-subdomain',
              name: 'domain',
              label: this.$t('entities.graph.relatedDomain'),
              value: _.get(n.data, 'relatedEntities.domain.list', []).length,
              total: _.get(n.data, 'relatedEntities.domain.total', '0') || 0
            }
          ]
        }
      }
    }
  }
}
</script>
