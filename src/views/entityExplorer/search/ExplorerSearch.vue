<template>
  <div class="explorer-search">
    <div class="explorer-search__title" v-show="!showList">{{$t('search.title')}}</div>
    <div class="explorer-search__input-case" :class="{'explorer-search__input-case--question-mark-in-line': showList}">
      <div class="explorer-search__input">
        <advanced-search
          ref="search"
          :column-list="columnList"
          :operator-list="operatorList"
          :connection-list="connectionList"
          :full-text="true"
          :class="{'advanced-search--show-list': showList}"
          @search="search"
        ></advanced-search>
      </div>
      <div class="search-symbol-inline" v-if="showList">
        <i class="cn-icon cn-icon-help"></i>
      </div>
      <div v-else class="explorer-search__foot">
        <div class="foot__item">
          <i class="el-icon-arrow-right" style="padding-right: 5px;"></i>
          <span>{{$t('search.searchHistory')}}</span>
        </div>
        <div class="foot__item">
          <span @click="search({})">{{$t('overall.explore')}}</span>
          <el-divider direction="vertical"></el-divider>
          <span>{{$t('overall.help')}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdvancedSearch from '@/components/advancedSearch/Index'
export default {
  name: 'CnSearch',
  components: {
    AdvancedSearch
  },
  props: {
    showList: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      columnList: [
        {
          name: 'entity_type',
          type: 'string',
          label: this.$t('overall.type')
        },
        {
          name: 'ip_addr',
          type: 'string',
          label: 'IP'
        },
        {
          name: 'ip_location_country',
          type: 'string',
          label: this.$t('overall.country')
        },
        {
          name: 'ip_location_province',
          type: 'string',
          label: this.$t('overall.province')
        },
        {
          name: 'ip_location_city',
          type: 'string',
          label: this.$t('overall.city')
        },
        {
          name: 'ip_asn',
          type: 'string',
          label: this.$t('entities.asn')
        },
        {
          name: 'ip_os',
          type: 'string',
          label: 'OS'
        },
        {
          name: 'domain_name',
          type: 'string',
          label: 'Domain'
        },
        {
          name: 'domain_category',
          type: 'string',
          label: this.$t('entities.domainCategory')
        },
        {
          name: 'domain_category_group',
          type: 'string',
          label: this.$t('entities.domainDetail.categoryGroup')
        },
        {
          name: 'domain_reputation_score',
          type: 'long',
          label: this.$t('entities.domainDetail.reputationValue')
        },
        {
          name: 'domain_reputation_level',
          type: 'string',
          label: this.$t('entities.reputationLevel')
        },
        {
          name: 'domain_whois_email',
          type: 'string',
          label: 'Domain whois email'
        },
        {
          name: 'domain_whois_name_servers',
          type: 'string',
          label: 'Domain whois ns'
        },
        {
          name: 'domain_whois_registrar',
          type: 'string',
          label: 'Domain whois registrar'
        },
        {
          name: 'domain_whois_org',
          type: 'string',
          label: 'Domain whois organization'
        },
        {
          name: 'domain_whois_city',
          type: 'string',
          label: 'Domain whois city'
        },
        {
          name: 'domain_whois_state',
          type: 'string',
          label: 'Domain whois state'
        },
        {
          name: 'domain_whois_country',
          type: 'string',
          label: 'Domain whois country'
        },
        {
          name: 'app_name',
          type: 'string',
          label: 'App'
        },
        {
          name: 'app_category',
          type: 'string',
          label: this.$t('trafficSummary.appCategory')
        },
        {
          name: 'app_subcategory',
          type: 'string',
          label: this.$t('entities.domainDetail.appSubcategory')
        },
        {
          name: 'app_risk',
          type: 'long',
          label: this.$t('trafficSummary.appRisk')
        }
      ],
      operatorList: ['=', '!=', '>', '<', '>=', '<='/* , 'IN', 'NOT IN', 'LIKE', 'NOT LIKE' */],
      connectionList: [
        {
          value: 'AND',
          label: 'AND'
        },
        {
          value: 'OR',
          label: 'OR'
        }
      ]
    }
  },
  methods: {
    search (q) {
      this.$emit('search', { q: q })
    },
    addParams (params) {
      this.$refs.search.addParams(params)
    }
  }
}
</script>
