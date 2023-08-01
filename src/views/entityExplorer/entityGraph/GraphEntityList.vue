<template>
  <div>
    <loading :loading="loading" size="small"></loading>
    <div class="graph-list-header">
      <div>
        <div class="graph-list-header-title">
          <i class="cn-icon cn-icon-resolve-ip graph-list-header-icon"></i>
          <span>{{ title }}</span>
        </div>
        <div class="graph-list-header-number">
          {{ $t('entity.graph.associatedCount') }}:&nbsp;<span>{{$_.get(node, 'sourceNode.myData.relatedEntity.' + $_.get(node, 'myData.entityType') + '.total', '-')}}</span>
        </div>
      </div>

      <i class="cn-icon cn-icon-close graph-close" @click="closeBlock"></i>
    </div>

    <div class="graph-list-expand-btn-block">
      <div class="graph-list-expand-btn" :class="{ 'graph-list-expand-btn--disabled': expandBtnDisable }" style="display: inline-flex;" @click="expandList">
          <i class="cn-icon cn-icon-expand-continue graph-expand-continue"></i>
        {{ $t('entity.graph.continueToExpand') }}
      </div>
    </div>

    <div>
      <div class="digital-certificate">
        <div class="digital-certificate-header padding-b-16">
          <div class="digital-certificate-header__icon graph-header__icon"></div>
          <div class="graph-list-content-header ">
            {{ $t('entity.graph.expandedEntityCount') }}:&nbsp
            <span>{{$_.get(node, 'sourceNode.myData.relatedEntity.' + $_.get(node, 'myData.entityType') + '.list', []).length}}</span>
          </div>
        </div>

        <div class="graph-list-content">
          <div v-for="(item, index) in $_.get(node, 'sourceNode.myData.relatedEntity.' + $_.get(node, 'myData.entityType') + '.list', [])" :key="index">
            <div class="graph-list-item-ip"><span @click="expandDetail">{{ item.vertex }}</span></div>
            <template v-if="$_.get(node, 'myData.entityType', '') === 'ip'">
              <div class="graph-list-item-block">
                <div class="graph-list-item padding-b-4">
                  <div class="graph-list-item-label">{{ $t('overall.location') }}:</div>
                  <div class="graph-list-item-value graph-list-item-value1" style="display: flex;align-items: center;">
                    <!--                  <img :src="require(`../../../../public/images/flag/${item.flag}.svg`)" class="graph-list-country-flag"/>-->
                    <span>{{ $_.get(item.detail, 'location.city', '-') }}</span>
                  </div>
                </div>

                <div class="graph-list-item">
                  <div class="graph-list-item-label">ASN:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'asn.asn', '-') }}</div>
                </div>
              </div>
            </template>
            <template v-else-if="$_.get(node, 'myData.entityType', '') === 'domain'">
              <div class="graph-list-item-block">
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{$t('entities.category')}}:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.name', '-') }}</div>
                </div>
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{$t('entities.group')}}:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.group', '-') }}</div>
                </div>
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{$t('entities.registration')}}:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'whois.registrantCountry', '-') }}</div>
                </div>
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{$t('entities.registry')}}:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'whois.registrantOrg', '-') }}</div>
                </div>
              </div>
            </template>
            <template v-else-if="$_.get(node, 'myData.entityType', '') === 'app'">
              <div class="graph-list-item-block">
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">APP ID:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.appId', '-') }}</div>
                </div>
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{$t('entities.category')}}:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.appCategory', '-') }}</div>
                </div>
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{$t('entities.subcategory')}}:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.appSubcategory', '-') }}</div>
                </div>
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{$t('entities.riskLevel')}}:</div>
                  <div class="graph-list-item-value">{{ appRisk($_.get(item.detail, 'category.appRisk', '-')) }}</div>
                </div>
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{$t('config.dataSource.description')}}:</div>
                  <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.appDescription', '-') }}</div>
                </div>
              </div>
            </template>
            <div class="graph-list-dividing-line" v-if="index !== $_.get(node, 'sourceNode.myData.relatedEntity.' + $_.get(node, 'myData.entityType') + '.list', []).length - 1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import { riskLevelMapping } from '@/utils/constants'
import { scrollToTop } from '@/utils/tools'
import _ from 'lodash'

export default {
  name: 'GraphEntityList',
  props: {
    node: {
      type: Object
    },
    loading: {
      type: Boolean
    }
  },
  components: {
    Loading
  },
  computed: {
    expandBtnDisable () {
      const loaded = _.get(this.node, 'sourceNode.myData.relatedEntity.' + _.get(this.node, 'myData.entityType') + '.list', []).length
      const total = _.get(this.node, 'sourceNode.myData.relatedEntity.' + _.get(this.node, 'myData.entityType') + '.total', 0)
      return !(loaded < total && total > 10 && (loaded && loaded < 50))
    },
    appRisk () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value == level
        })
        return (m && m.name) || level
      }
    },
    title () {
      let title = ''
      if (this.node) {
        const entityType = _.get(this.node, 'myData.entityType', '')
        if (entityType) {
          const sourceType = _.get(this.node, 'sourceNode.myData.entityType', '')
          switch (entityType) {
            case 'ip': {
              if (sourceType === 'domain') {
                title = this.$t('entities.graph.resolveIp')
              } else {
                title = this.$t('entities.tab.relatedIp')
              }
              break
            }
            case 'domain': {
              if (sourceType === 'ip') {
                title = this.$t('entity.graph.resolveDomain')
              } else if (sourceType === 'domain') {
                title = this.$t('entities.subdomain')
              } else {
                title = this.$t('entities.relatedDomain')
              }
              break
            }
            case 'app': {
              title = this.$t('entities.tab.relatedApp')
              break
            }
          }
        }
      }
      return title
    }
  },
  methods: {
    closeBlock () {
      this.$emit('closeBlock')
    },
    expandDetail () {
      this.$emit('expandDetail', this.node.id)
    },
    expandList () {
      // 继续拓展ip列表，传递信息，调用接口
      this.$emit('expandList', _.get(this.node, 'id'))
    }
  },
  mounted () {
    this.$nextTick(() => {
      scrollToTop()
    })
  }
}
</script>
