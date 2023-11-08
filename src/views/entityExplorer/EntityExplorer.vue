<template>
  <div
      class="entity-explorer"
      :class="{'entity-explorer--show-list': showList}">
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools explorer-top-tools-new" style="margin: 2px 0;" v-show="showList">
      <div class="explorer-entity-top-tools">
        <div class="explorer-top-tools-title" style="padding: 0;margin-left: -10px;">{{$t('network.entity')}}</div>
        <date-time-range
            class="date-time-range"
            :start-time="timeFilter.startTime"
            :end-time="timeFilter.endTime"
            :date-range="timeFilter.dateRangeValue"
            ref="dateTimeRange"
            @change="reload"
        />
      </div>
    </div>
    <!-- 搜索组件 -->
    <explorer-search
        v-if="!showList"
        ref="search"
        :class="{'explorer-search--show-list': showList}"
        :show-list="showList"
        @search="search"
    ></explorer-search>
    <!-- 内容区 -->
    <div v-if="showList" style="display: flex;flex-direction: row;padding-bottom: 20px;">
      <entity-filter
          :filter-data="newFilterData"
          :loading-left="loadingLeft"
          :q="q"
          :time-filter="timeFilter"
          @filter="filter"
      ></entity-filter>
      <div class="explorer-container explorer-container-new">
        <explorer-search
            ref="search"
            :class="{'explorer-search--show-list': showList}"
            :show-list="showList"
            @search="search"
        ></explorer-search>

        <div style="display: flex;flex-direction: column;height: calc(100% - 42px);">
          <div class="explorer-result" v-if="showList" style="position: relative;">
            <loading :loading="loadingCount" style="width: 240px"></loading>
            <span>{{ summaryCount.totalCount }}&nbsp;</span>{{$t('overall.results')}}，IP
            <span>{{ summaryCount.ipCount }}</span>，{{$t('overall.domain')}}
            <span>{{ summaryCount.domainCount }}</span>，APP
            <span>{{ summaryCount.appCount }}</span>
          </div>

          <entity-list
              style="width: 100%;"
              :list-data="listData"
              :list-mode="listMode"
              :keywordList="keywordList"
              :pageObj="pageObj"
              :time-filter="timeFilter"
              @pageSize="pageSize"
              @pageNo="pageNo"
              :loading="listLoading"
          ></entity-list>
        </div>
      </div>
    </div>

    <div class="explorer-foot" v-if="!showList">
      <div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span class="overview-left-loading">
              <span class="overview-left-loading-span">APP</span>
            </span>
          </div>
          <div class="overview-right">
            <div class="right-row margin-b-6">
              <i class="cn-icon cn-icon-proportion entity-explorer-total__icon"></i>
              <div class="right-label">{{ $t('network.total') }}</div>
              <div class="right-label-loading">
                <loading :loading="loadingApp" size="small"></loading>
                <div class="right-value">{{ numberWithCommas(entityAppTotal) }}</div>
              </div>
            </div>

            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">{{ $t('entity.active') }}</div>
              <div class="right-label-loading">
                <loading :loading="loadingAppActive" size="small"></loading>
                <div class="right-value-block">
                  <span class="margin-r-6">{{ numberWithCommas(entityAppActive) }}</span>
                  <span class="last-hour">{{ $t('entity.inLastHour') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span class="overview-left-loading">
              <span class="overview-left-loading-span">{{$t('overall.domain')}}</span>
            </span>
          </div>
          <div class="overview-right">
            <div class="right-row margin-b-6">
              <i class="cn-icon cn-icon-proportion entity-explorer-total__icon"></i>
              <div class="right-label">{{ $t('network.total') }}</div>
              <div class="right-label-loading">
                <loading :loading="loadingDomain" size="small"></loading>
                <div class="right-value">{{ numberWithCommas(entityDomainTotal) }}</div>
              </div>
            </div>

            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">{{ $t('entity.active') }}</div>
              <div class="right-label-loading">
                <loading :loading="loadingDomainActive" size="small"></loading>
                <div class="right-value-block">
                  <span class="margin-r-6">{{ numberWithCommas(entityDomainActive) }}</span>
                  <span class="last-hour">{{ $t('entity.inLastHour') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span class="overview-left-loading">
              <span class="overview-left-loading-span">IP</span>
            </span>
          </div>
          <div class="overview-right">
            <div class="right-row margin-b-6">
              <i class="cn-icon cn-icon-proportion entity-explorer-total__icon"></i>
              <div class="right-label">{{ $t('network.total') }}</div>
              <div class="right-label-loading">
                <loading :loading="loadingIp" size="small"></loading>
                <div class="right-value">{{ numberWithCommas(entityIpTotal) }}</div>
              </div>
            </div>

            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">{{ $t('entity.active') }}</div>
              <div class="right-label-loading">
                <loading :loading="loadingIpActive" size="small"></loading>
                <div class="right-value-block">
                  <span class="margin-r-6">{{ numberWithCommas(entityIpActive) }}</span>
                  <span class="last-hour">{{ $t('entity.inLastHour') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
      </div>
    </div>
  </div>
</template>

<script>
import ExplorerSearch from '@/views/entityExplorer/search/ExplorerSearch'
import EntityFilter from '@/views/entityExplorer/EntityFilter'
import EntityList from '@/views/entityExplorer/entityList/EntityList'
import { defaultPageSize, riskLevelMapping } from '@/utils/constants'
import axios from 'axios'
import { api } from '@/utils/api'
import { getNowTime, getSecond } from '@/utils/date-util'
import { ref } from 'vue'
import _ from 'lodash'
import Loading from '@/components/common/Loading'
import {
  overwriteUrl,
  urlParamsHandler,
  numberWithCommas
} from '@/utils/tools'
import Parser from '@/components/advancedSearch/meta/parser'
import { handleErrorTip } from '@/components/advancedSearch/meta/error'
import { columnList } from '@/utils/static-data'
import { useRoute } from 'vue-router'
import { columnType } from '@/components/advancedSearch/meta/meta'
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'

export default {
  name: 'entity-explorer',
  components: {
    Loading,
    ExplorerSearch,
    EntityFilter,
    EntityList,
    DateTimeRange
  },
  data () {
    return {
      showList: false,
      listMode: 'list', // entity列表的模式，list|block

      entityAppTotal: '-',
      entityAppNew: '-',
      entityAppActive: '-',

      entityDomainTotal: '-',
      entityDomainNew: '-',
      entityDomainActive: '-',

      entityIpTotal: '-',
      entityIpNew: '-',
      entityIpActive: '-',

      newFilterData: [
        {
          icon: 'cn-icon cn-icon-registration-country',
          title: this.$t('entity.topCountries'),
          topColumn: 'ip.country',
          totalCount: 0,
          data: []
        },
        {
          icon: 'cn-icon cn-icon-city',
          title: this.$t('entity.topCities'),
          topColumn: 'ip.city',
          totalCount: 0,
          data: []
        },
        {
          icon: 'cn-icon cn-icon-as',
          title: this.$t('entity.topASNs'),
          topColumn: 'ip.asn',
          totalCount: 0,
          data: []
        },
        {
          icon: 'cn-icon cn-icon-operator',
          title: this.$t('entity.topISPs'),
          topColumn: 'ip.isp',
          totalCount: 0,
          data: []
        },
        {
          icon: 'cn-icon cn-icon-open-port',
          title: this.$t('entity.topPorts'),
          topColumn: 'ip.port',
          topColumn1: 'ip.protocol',
          totalCount: 0,
          data: []
        },
        {
          icon: 'cn-icon cn-icon-FQDN',
          title: this.$t('entity.topFQDNCategories'),
          topColumn: 'domain.category',
          totalCount: 0,
          data: []
        },
        {
          icon: 'cn-icon cn-icon-category2',
          title: this.$t('entity.topAppCategories'),
          topColumn: 'app.category',
          totalCount: 0,
          data: []
        },
        {
          icon: 'cn-icon cn-icon-tag1',
          title: this.$t('entity.topTags'),
          topColumn: 'tag',
          totalCount: 0,
          data: []
        }
      ],
      listData: [],
      q: '',
      metaList: [],
      listLoading: false,
      // 实体详情搜索页面 底部列表
      loadingApp: false,
      loadingDomain: false,
      loadingIp: false,
      // Active
      loadingAppActive: false,
      loadingDomainActive: false,
      loadingIpActive: false,

      // 实体详情列表页面 左侧筛选条件
      loadingLeft: false,
      initFlag: true, // 初始化标志，避免初始化时pageSize和pageNo会调用搜索
      timer: null, // 初始化标志的延时器，需要销毁
      summaryCount: {
        totalCount: 0,
        domainCount: 0,
        ipCount: 0,
        appCount: 0
      },
      loadingCount: false, // 实体基数统计的loading
      keywordList: []
    }
  },
  methods: {
    numberWithCommas,
    timeRefreshChange () {
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      }
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
    },
    // methods
    dateTimeRangeChange (s, e, v) {
      this.timeFilter = { startTime: s, endTime: e, dateRangeValue: v }
    },
    // sql特殊字段转换
    specialColumnHandle (sql) {
      const columns = [
        {
          target: "app_risk='1'",
          original: `app_risk='${riskLevelMapping[0].name.toLowerCase()}'`
        },
        {
          target: "app_risk='2'",
          original: `app_risk='${riskLevelMapping[1].name.toLowerCase()}'`
        },
        {
          target: "app_risk='3'",
          original: `app_risk='${riskLevelMapping[2].name.toLowerCase()}'`
        },
        {
          target: "app_risk='4'",
          original: `app_risk='${riskLevelMapping[3].name.toLowerCase()}'`
        },
        {
          target: "app_risk='5'",
          original: `app_risk='${riskLevelMapping[4].name.toLowerCase()}'`
        },
        {
          target: "=''",
          original: "='unknown'"
        }
      ]
      let result = sql
      columns.forEach(c => {
        result = _.replace(result, c.original, c.target)
      })
      return result
    },
    search (param) {
      // todo 下版本08版本删除 ---- start
      if (param && param.q.indexOf("QUERY('") > -1) {
        this.$message.error(this.$t('overall.versionNotSupportThisFormat'))
        return true
      }
      // 下版本08版本删除 ---- end
      let q
      let metaList
      if (param) {
        q = param.q
        metaList = param.metaList
      }
      if (q) {
        this.q = this.specialColumnHandle(q)
        this.metaList = metaList
      } else {
        this.q = ''
        this.metaList = []
      }
      this.getKeyword(param.keywordList)

      // 参数q，避免切换页码时，地址栏参数q为空
      let urlQ = ''
      if (param.str) {
        urlQ = encodeURI(param.str)
      } else if (this.q) {
        urlQ = encodeURI(this.q)
      }

      // 在非列表模式下选择tag模式，在地址栏输入内容时将mode添加到地址栏
      const mode = this.$route.query.mode || 'text'
      if (this.pageObj.resetPageNo && !this.initFlag) {
        this.pageObj.pageNo = 1
      } else {
        this.pageObj.resetPageNo = true
      }

      this.reloadUrl({
        listMode: this.listMode,
        q: urlQ,
        mode: mode,
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize
      })

      if (!this.showList) {
        // 首页进入搜索时重载页面，视觉上进入列表页面
        this.$router.push({
          path: '/entityExplorer',
          query: {
            listMode: this.listMode,
            q: urlQ,
            mode: mode,
            range: this.timeFilter.dateRangeValue,
            pageNo: this.pageObj.pageNo,
            pageSize: this.pageObj.pageSize
          }
        })
        this.showList = true
        // 跳转页面，则不执行搜索功能
        return true
      }

      this.queryFilterNew({ q: this.q, ...this.pageObj, ...this.timeFilter })
      this.queryList({ q: this.q, ...this.pageObj, ...this.timeFilter })
      this.queryCount({ q: this.q, ...this.pageObj, ...this.timeFilter })

      // 延时一秒，避免初始化时pageSize为20，pageNo为1也会调用“搜索”的情况
      if (this.initFlag) {
        this.timer = setTimeout(() => {
          this.initFlag = false
        }, 1000)
      }
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      if (this.initFlag) {
        if (val !== 20) {
          this.search({ metaList: this.metaList, q: this.q })
        }
      } else {
        this.search({ metaList: this.metaList, q: this.q })
      }
    },
    pageNo (val) {
      if (!this.initFlag) {
        this.pageObj.pageNo = val
        this.pageObj.resetPageNo = false
        this.search({ metaList: this.metaList, q: this.q })
      }
    },
    // 点击上一页箭头
    prev () {
      this.scrollbarToTop()
    },
    // 点击下一页箭头
    next () {
      this.scrollbarToTop()
    },
    // currentPage 改变时会触发
    current (val) {
      this.$emit('pageNo', val)
      this.scrollbarToTop()
    },
    scrollbarToTop () {
      this.$nextTick(() => {
        const wraps = document.querySelector('#entityList')
        wraps.scrollTop = 0
      })
    },
    /* filter组件内点击后查询 */
    filter (name, topData) {
      if (topData.topColumn === 'ip.port') {
        const params = [
          {
            column: topData.topColumn,
            operator: '=',
            value: topData.port
          },
          {
            column: topData.topColumn1,
            operator: '=',
            value: topData.l7Protocol
          }
        ]
        this.$refs.search.addParams(params)
      } else if (topData.topColumn === 'tag') {
        const params = {
          column: topData.topColumn,
          operator: 'has',
          value: name
        }
        this.$refs.search.addParams([params])
      } else {
        const params = {
          column: topData.topColumn,
          operator: '=',
          value: name
        }
        this.$refs.search.addParams([params])
      }
      this.$nextTick(() => {
        this.emitter.emit('advanced-search')
      })
    },
    /** 新版查询filter数据 */
    queryFilterNew (params) {
      const queryParams = {
        // startTime: getSecond(params.startTime),
        // endTime: getSecond(params.endTime),
        resource: params.q || ''
      }
      this.loadingLeft = true
      const aggCountry = axios.get(api.entity.entityList.aggCountry, { params: queryParams })
      const aggCity = axios.get(api.entity.entityList.aggCity, { params: queryParams })
      const aggIPAsn = axios.get(api.entity.entityList.aggIPAsn, { params: queryParams })
      const aggIPIsp = axios.get(api.entity.entityList.aggIPIsp, { params: queryParams })
      const aggPort = axios.get(api.entity.entityList.aggPort, { params: queryParams })
      const aggDomain = axios.get(api.entity.entityList.aggDomain, { params: queryParams })
      const aggAppCategory = axios.get(api.entity.entityList.aggAppCategory, { params: queryParams })
      const aggTag = axios.get(api.entity.entityList.aggTag, { params: queryParams })

      Promise.all([aggCountry, aggCity, aggIPAsn, aggIPIsp, aggPort, aggDomain, aggAppCategory, aggTag]).then(response => {
        response.forEach((item1, index) => {
          if (item1.status === 200 && item1.data.data.list) {
            if (item1.data.data.list.length >= 5) {
              this.newFilterData[index].showNum = 5
            } else {
              this.newFilterData[index].showNum = item1.data.data.list.length
            }
            this.newFilterData[index].data = []
            item1.data.data.list.forEach((item, i) => {
              let obj = {
                label: item.value,
                topColumn: this.newFilterData[index].topColumn,
                value: item.uniqueEntities,
                showNum: 5
              }
              if (index === 0) {
                obj.flag = item.value // 接口字段名称为'China'，svg名称为'CN'，通过countryNameIdMapping进行转换
              }
              if (index === 4) {
                obj = {
                  topColumn: this.newFilterData[index].topColumn,
                  topColumn1: this.newFilterData[index].topColumn1,
                  port: item.port,
                  l7Protocol: item.l7Protocol,
                  value: item.uniqueEntities,
                  showNum: 5
                }
              }
              this.newFilterData[index].data.push(obj)
            })
          }
        })
      }).catch(e => {
        this.$message.error(e.response.data.message)
      }).finally(() => {
        this.loadingLeft = false
      })
    },
    /** 实体列表查询 */
    queryList (params) {
      this.listLoading = true
      const queryParams = {
        pageSize: params.pageSize,
        pageNo: params.pageNo,
        startTime: getSecond(params.startTime),
        endTime: getSecond(params.endTime),
        resource: params.q || ''
      }
      axios.get(api.entity.entityList.list, { params: queryParams }).then(response => {
        if (response.status === 200) {
          this.listData = []
          this.$nextTick(() => {
            this.listData = response.data.data.list
          })
        } else {
          this.$message.error(response.data.message)
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    /** 实体基数统计 */
    queryCount (params) {
      this.loadingCount = true
      const queryParams = {
        startTime: getSecond(params.startTime),
        endTime: getSecond(params.endTime),
        resource: params.q || ''
      }
      axios.get(api.entity.entityList.summaryCount, { params: queryParams }).then(response => {
        if (response.status === 200) {
          this.summaryCount = response.data.data
          this.pageObj.total = response.data.data.totalCount
        } else {
          this.summaryCount = { totalCount: 0, domainCount: 0, ipCount: 0, appCount: 0 }
        }
      }).catch(e => {
        console.error(e)
        this.summaryCount = { totalCount: 0, domainCount: 0, ipCount: 0, appCount: 0 }
      }).finally(() => {
        this.loadingCount = false
      })
    },

    queryListTotal (params) {
      const queryParams = {
        ...params,
        startTime: getSecond(params.startTime),
        endTime: getSecond(params.endTime)
      }
      axios.get(api.entityListTotal, { params: queryParams }).then(response => {
        if (response.status === 200) {
          this.pageObj.total = response.data.data.result
        }
      })
    },
    handleQ (params) {
      return Object.keys(params).map(param => {
        return `${param}='${params[param]}'`
      }).join(' AND ')
    },

    getEntityIndexData () {
      // Total
      this.loadingApp = true
      this.loadingDomain = true
      this.loadingIp = true
      // Active
      this.loadingAppActive = true
      this.loadingDomainActive = true
      this.loadingIpActive = true

      axios.get(api.entity.entityList.entityTotal).then(response => {
        if (response.status === 200) {
          this.entityDomainTotal = response.data.data.domainCount
          this.entityIpTotal = response.data.data.ipCount
          this.entityAppTotal = response.data.data.appCount
        }
        this.loadingDomain = false
        this.loadingIp = false
        this.loadingApp = false
      })
      // Active
      axios.get(api.entity.entityList.entityActive).then(response => {
        if (response.status === 200) {
          this.entityDomainActive = response.data.data.domainCount
          this.entityIpActive = response.data.data.ipCount
          this.entityAppActive = response.data.data.appCount
        }
        this.loadingDomainActive = false
        this.loadingIpActive = false
        this.loadingAppActive = false
      })
    },
    setListMode (mode) {
      this.listMode = mode
      const newParam = {
        listMode: mode
      }
      this.reloadUrl(newParam)
    },
    /**
     * 向地址栏添加/删除参数
     */
    reloadUrl (newParam, clean) {
      const { query } = this.$route
      let newUrl = urlParamsHandler(window.location.href, query, newParam)
      if (clean) {
        newUrl = urlParamsHandler(window.location.href, query, newParam, clean)
      }
      overwriteUrl(newUrl)
    },
    /**
     * 初始化搜索，分享url或者刷新界面，保留本次搜索结果
     * @param q
     */
    initSearch (q) {
      let str = q
      // 此处的mode不做text和tag区分，是因为text和tag构造搜索参数过程不一样，但结果的参数一致
      // 故采用text的参数形式进行搜索，tag形式在tagMode.vue的mounted里根据地址栏的参数q构造metaList
      if (str) {
        // 为避免地址栏任意输入导致全查询的q带QUERY，解析时不识别导致的语法错误
        // 如地址栏输入116.178.222.171，此时的q很长，刷新界面时需要把q里的116.178.222.171拿出来进行搜索
        if (str.indexOf('QUERY') > -1) {
          const strList = str.split(' ')
          if (strList.length > 0) {
            // 此时strList[1]为ip_addr:116.178.222.171，获取116.178.222.171
            str = strList[1].slice(8)
          }
        }
        const parser = new Parser(columnList)
        const metaList = parser.parseStr(_.cloneDeep(str)).metaList
        const keywordList = []
        metaList.forEach(item => {
          if (item.column && item.column.type === columnType.fullText) {
            keywordList.push({ type: item.column.type, value: item.column.label })
          } else if (item.column && item.column.type === columnType.string) {
            keywordList.push({ type: item.column.type, value: item.value.value })
          }
        })
        const keyInfo = parser.comparedEntityKey(parser.handleEntityTypeByStr(str))
        if (keyInfo.isKey) {
          const errorList = parser.validateStr(keyInfo.key)
          if (_.isEmpty(errorList)) {
            this.search({ ...parser.parseStr(keyInfo.key), str: str, keywordList: keywordList })
          } else {
            this.$message.error(handleErrorTip(errorList[0]))
          }
        } else {
          this.$message.error(this.$t('tip.invalidQueryField') + ' ' + keyInfo.key)
        }
      } else {
        this.search({ q: '', str: '', metaList: [] })
      }
    },
    queryScoreBase () {
      const { startTime, endTime } = getNowTime(60 * 24)
      const params = {
        startTime: getSecond(startTime),
        endTime: getSecond(endTime)
      }
      const tcp = axios.get(api.npm.overview.tcpSessionDelay, { params: params })
      const http = axios.get(api.npm.overview.httpResponseDelay, { params: params })
      const ssl = axios.get(api.npm.overview.sslConDelay, { params: params })
      const tcpPercent = axios.get(api.npm.overview.tcpLostlenPercent, { params: params })
      const packetPercent = axios.get(api.npm.overview.packetRetransPercent, { params: params })
      Promise.all([tcp, http, ssl, tcpPercent, packetPercent]).then(res => {
        const scoreBase = {}
        res.forEach((t, i) => {
          if (t.status === 200) {
            if (i === 0) {
              scoreBase.establishLatencyMsP10 = _.get(t.data, 'data.result.establishLatencyMsP10', null)
              scoreBase.establishLatencyMsP90 = _.get(t.data, 'data.result.establishLatencyMsP90', null)
            } else if (i === 1) {
              scoreBase.httpResponseLatencyP10 = _.get(t.data, 'data.result.httpResponseLatencyP10', null)
              scoreBase.httpResponseLatencyP90 = _.get(t.data, 'data.result.httpResponseLatencyP90', null)
            } else if (i === 2) {
              scoreBase.sslConLatencyP10 = _.get(t.data, 'data.result.sslConLatencyP10', null)
              scoreBase.sslConLatencyP90 = _.get(t.data, 'data.result.sslConLatencyP90', null)
            } else if (i === 3) {
              scoreBase.tcpLostlenPercentP10 = _.get(t.data, 'data.result.tcpLostlenPercentP10', null)
              scoreBase.tcpLostlenPercentP90 = _.get(t.data, 'data.result.tcpLostlenPercentP90', null)
            } else if (i === 4) {
              scoreBase.pktRetransPercentP10 = _.get(t.data, 'data.result.pktRetransPercentP10', null)
              scoreBase.pktRetransPercentP90 = _.get(t.data, 'data.result.pktRetransPercentP90', null)
            }
          }
        })
        this.$store.commit('setScoreBase', scoreBase)
      }).catch((e) => {
      }).finally(() => {
      })
    },
    getKeyword (list) {
      if (list) {
        const metaList = JSON.parse(JSON.stringify(list))
        const keyList = []
        metaList.forEach(item => {
          if (item.value) {
            keyList.push({ type: item.type, value: this.getKeyValue(item.value) })
          }
        })
        this.keywordList = keyList
      } else {
        this.keywordList = []
      }
    },
    getKeyValue (str) {
      if (str[0] === "'" && str[str.length - 1] === "'") {
        str = str.substring(1, str.length)
        str = str.substring(0, str.length - 1)
      }
      if (str[0] === '%') {
        str = str.substring(1, str.length)
      }
      if (str[str.length - 1] === '%') {
        str = str.substring(0, str.length - 1)
      }
      return str
    }
  },
  mounted () {
    this.getEntityIndexData()
    let { q, listMode } = this.$route.query

    // 如果地址栏有listMode，即列表页，并非首页，则开始搜索
    if (listMode) {
      this.showList = true
      // %位置为0是输入中文时能解码，%20，25%分别是空格和%的情况
      if (q && (q.indexOf('%') === 0 || q.indexOf('%20') > -1 || q.indexOf('%25') > -1)) {
        q = decodeURI(q)
      }
      // %位置不为0，即内容包含非英文时
      let str1 = ''
      if (q) {
        str1 = q.substring(q.indexOf('%'), q.indexOf('%') + 3)
      }
      if (q && q.indexOf('%') > 0 && (str1 !== '%20' || str1 === '%25')) {
        q = decodeURI(q)
      }
      this.initSearch(q)
      this.listMode = listMode
      // 查询评分基准
      this.$store.commit('resetScoreBase')
      this.queryScoreBase()
    }
  },
  watch: {
    timeFilter () {
      this.search({ metaList: this.metaList, q: this.q })
    }
  },
  setup () {
    const { query } = useRoute()
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime
    // 若url携带了，使用携带的值，否则使用默认值。
    const dateRangeValue = rangeParam ? parseInt(query.range) : 60
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(60)
      timeFilter.value.startTime = startTime
      timeFilter.value.endTime = endTime
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }
    const pageObj = ref({
      pageNo: query.pageNo ? parseInt(query.pageNo) : 1,
      // 是否重置pageNo，在执行新搜索时是true
      resetPageNo: true,
      pageSize: query.pageSize ? parseInt(query.pageSize) : defaultPageSize,
      total: 0
    })
    return {
      timeFilter,
      pageObj
    }
  },
  beforeUnmount () {
    clearTimeout(this.timer)
  }
}
</script>
