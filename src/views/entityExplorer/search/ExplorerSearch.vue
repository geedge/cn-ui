<template>
  <div class="explorer-search">
    <div class="explorer-search__title" v-show="!showList">{{$t('search.title')}}</div>
    <div class="explorer-search__input-case" :class="{'explorer-search__input-case--question-mark-in-line': showList}">
      <div class="explorer-search__input">
      <!--新版实体列表改版，后续记得解开-->
      <!--<div class="explorer-search__input" style="border: 1px #DEDEDE solid;height: 42px;">-->
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
      <div v-else class="explorer-search__foot" v-ele-click-outside="esc">
        <div class="foot__item" @click="triggerHistory">
          <i class="el-icon-arrow-right" :class="{ 'arrow-rotate': showHistory }" style="padding-right: 5px;"></i>
          <span>{{$t('search.searchHistory')}}</span>
        </div>
        <div class="foot__item">
          <span @click="search">{{$t('overall.explore')}}</span>
<!--          <el-divider direction="vertical"></el-divider>
          <span>{{$t('overall.help')}}</span>-->
        </div>
        <transition name="el-zoom-in-top">
          <div class="search__history" v-show="showHistory">
            <div class="history__items">
              <div class="history__item" v-for="(h, i) in history" :key="i" @click="selectHistory(h.str)">
                <span class="item-date">{{h.date}}</span>
                <div class="item-value" :title="h.str">{{h.str}}</div>
              </div>
            </div>
            <div class="clear-all">
              <span @click="clearHistory" v-if="!$_.isEmpty(history)">{{$t('overall.clear')}}</span>
              <div v-else>{{$t('overall.noRecords')}}</div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import AdvancedSearch from '@/components/advancedSearch/Index'
import _ from 'lodash'
import { storageKey } from '@/utils/constants'
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
          label: 'Entity type'
        },
        {
          name: 'ip_addr',
          type: 'string',
          label: 'IP.Address'
        },
        {
          name: 'ip_location_country',
          type: 'string',
          label: 'IP.Country'
        },
        {
          name: 'ip_location_province',
          type: 'string',
          label: 'IP.Province'
        },
        {
          name: 'ip_location_city',
          type: 'string',
          label: 'IP.City'
        },
        {
          name: 'ip_asn',
          type: 'string',
          label: 'IP.ASN'
        },
        {
          name: 'dns_server_role',
          type: 'string',
          label: 'IP.DNS server role'
        },
        {
          name: 'dns_server_org',
          type: 'string',
          label: 'IP.DNS server organization'
        },
        {
          name: 'dns_server_os',
          type: 'string',
          label: 'IP.Operating system'
        },
        {
          name: 'dns_server_software',
          type: 'string',
          label: 'IP.DNS server software'
        },
        {
          name: 'domain_name',
          type: 'string',
          label: 'Domain.Name'
        },
        {
          name: 'domain_category',
          type: 'string',
          label: 'Domain.Category'
        },
        {
          name: 'domain_category_group',
          type: 'string',
          label: 'Domain.Category group'
        },
        {
          name: 'domain_reputation_level',
          type: 'string',
          label: 'Domain.Reputation'
        },
        {
          name: 'domain_whois_email',
          type: 'string',
          label: 'Domain.Whois email'
        },
        {
          name: 'domain_whois_name_servers',
          type: 'string',
          label: 'Domain.Whois nameserver'
        },
        {
          name: 'domain_whois_registrar',
          type: 'string',
          label: 'Domain.Whois registrar'
        },
        {
          name: 'domain_whois_org',
          type: 'string',
          label: 'Domain.Whois organization'
        },
        {
          name: 'domain_whois_address',
          type: 'string',
          label: 'Domain.Whois address'
        },
        {
          name: 'domain_whois_city',
          type: 'string',
          label: 'Domain.Whois city'
        },
        {
          name: 'domain_whois_state',
          type: 'string',
          label: 'Domain.Whois state'
        },
        {
          name: 'domain_whois_country',
          type: 'string',
          label: 'Domain.Whois country'
        },
        {
          name: 'domain_icp_owner',
          type: 'string',
          label: 'Domain.ICP owner'
        },
        {
          name: 'domain_icp_company_name',
          type: 'string',
          label: 'Domain.ICP company'
        },
        {
          name: 'domain_icp_company_type',
          type: 'string',
          label: 'Domain.ICP company type'
        },
        {
          name: 'domain_icp_site_license',
          type: 'string',
          label: 'Domain.ICP site license'
        },
        {
          name: 'domain_icp_site_name',
          type: 'string',
          label: 'Domain.ICP site'
        },
        {
          name: 'app_name',
          type: 'string',
          label: 'APP.Name'
        },
        {
          name: 'app_id',
          type: 'string',
          label: 'APP.ID'
        },
        {
          name: 'app_category',
          type: 'string',
          label: 'APP.Category'
        },
        {
          name: 'app_subcategory',
          type: 'string',
          label: 'APP.Subcategory'
        },
        {
          name: 'app_risk',
          type: 'string',
          label: 'APP.Risk'
        },
        {
          name: 'app_description',
          type: 'string',
          label: 'APP.Description'
        },
        {
          name: 'app_longname',
          type: 'string',
          label: 'APP.Long name'
        },
        {
          name: 'app_technology',
          type: 'string',
          label: 'APP.Technology'
        }
      ],
      operatorList: ['=', '!=', /* '>', '<', '>=', '<=', */'IN', 'NOT IN', 'LIKE', 'NOT LIKE'],
      connectionList: [
        {
          value: 'AND',
          label: 'AND'
        },
        {
          value: 'OR',
          label: 'OR'
        }
      ],
      showHistory: false,
      history: []
    }
  },
  methods: {
    search ({ str, q, metaList }) {
      if (str) {
        // 加入搜索记录，将记录数量控制在30以内
        const oldHistory = localStorage.getItem(storageKey.entitySearchHistory)
        let arr = []
        const newItem = { str, date: this.dateFormatByAppearance(new Date()) }
        if (!_.isEmpty(oldHistory)) {
          const oldArr = JSON.parse(oldHistory)
          oldArr.unshift(newItem)
          arr = [...oldArr]
          if (arr.length > 30) {
            arr = arr.slice(0, 30)
          }
        } else {
          arr.push(newItem)
        }
        localStorage.setItem(storageKey.entitySearchHistory, JSON.stringify(arr))
      }
      this.$emit('search', { q, metaList })
    },
    addParams (params) {
      this.$refs.search.addParams(params)
    },
    selectHistory (str) {
      this.$refs.search.setStr(str)
      this.showHistory = false
      this.$nextTick(() => {
        if (this.$refs.search.$refs.textMode) {
          this.$refs.search.$refs.textMode.focus()
        }
      })
    },
    clearHistory () {
      localStorage.setItem(storageKey.entitySearchHistory, '')
      this.history = []
    },
    triggerHistory () {
      this.showHistory = !this.showHistory
      if (this.showHistory) {
        const history = localStorage.getItem(storageKey.entitySearchHistory)
        if (!_.isEmpty(history)) {
          this.history = JSON.parse(history)
        }
      }
    },
    esc () {
      this.showHistory = false
    }
  }
}
</script>
