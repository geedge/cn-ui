<template>
  <div
      class="entity-explorer"
      :class="{'entity-explorer--show-list': showList}">
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools" v-show="showList">
      <DateTimeRange class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" ref="dateTimeRange" @change="reload"/>
      <TimeRefresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
      <el-button-group size="mini">
        <el-button size="mini" @click="listMode = 'list'" :class="{'active': listMode === 'list'}"><i class="cn-icon cn-icon-list"></i></el-button>
        <el-button size="mini" @click="listMode = 'block'" :class="{'active': listMode === 'block'}"><i class="cn-icon cn-icon-blocks"></i></el-button>
      </el-button-group>
    </div>
    <!-- 搜索组件 -->
    <explorer-search
        ref="search"
        :class="{'explorer-search--show-list': showList}"
        :show-list="showList"
        @search="search"
    ></explorer-search>
    <!-- 内容区 -->
    <div class="explorer-container" v-if="showList"  style="height: calc(100% - 20px); flex-direction: column">
      <div style="display: flex; height: 100%;">
        <entity-filter
            :filter-data="filterData"
            :search-params="searchParams"
            :time-filter="timeFilter"
            @filter="filter"
        ></entity-filter>
        <entity-list
            :list-data="listData"
            :list-mode="listMode"
            :pageObj="pageObj"
            :time-filter="timeFilter"
            @pageSize="pageSize"
            @pageNo="pageNo"
            :loading="listLoading"
        ></entity-list>
      </div>
      <div class="entity__pagination" style="position: absolute; bottom: 0; width: 100%;">
        <pagination
            ref="pagination"
            :page-obj="pageObj"
            @pageNo='pageNo'
            @pageSize='pageSize'
            @size-change="pageSize"
            @prev-click="prev"
            @next-click="next"
        >
        </pagination>
      </div>
    </div>
    <div class="explorer-foot" v-else>
      <div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span>{{entityAppTotal}}</span>
            <span>APP</span>
          </div>
          <div class="overview-right">
            <div class="right-row">
              <i class="cn-icon cn-icon-increase"></i>
              <div class="right-label">New</div>
              <div class="right-value">{{entityAppNew}}</div>
            </div>
            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">Active</div>
              <div class="right-value">{{entityAppActive}}</div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span>{{entityDomainTotal}}</span>
            <span>DOMAIN</span>
          </div>
          <div class="overview-right">
            <div class="right-row">
              <i class="cn-icon cn-icon-increase"></i>
              <div class="right-label">New</div>
              <div class="right-value">{{entityDomainNew}}</div>
            </div>
            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">Active</div>
              <div class="right-value">{{entityDomainActive}}</div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span>{{entityIpTotal}}</span>
            <span>IP</span>
          </div>
          <div class="overview-right">
            <div class="right-row">
              <i class="cn-icon cn-icon-increase"></i>
              <div class="right-label">New</div>
              <div class="right-value">{{entityIpNew}}</div>
            </div>
            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">Active</div>
              <div class="right-value">{{entityIpActive}}</div>
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
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'
import TimeRefresh from '@/components/common/TimeRange/TimeRefresh'
import EntityFilter from '@/views/entityExplorer/EntityFilter'
import EntityList from '@/views/entityExplorer/entityList/EntityList'
import { entityType, entityFilterType, defaultPageSize } from '@/utils/constants'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'
import pagination from '@/components/common/Pagination'

export default {
  name: 'entity-explorer',
  components: {
    ExplorerSearch,
    DateTimeRange,
    TimeRefresh,
    EntityFilter,
    EntityList,
    pagination: pagination
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

      searchParams: {},
      showFilter: ['ip', 'app', 'domain'], // ip,domain,app
      pageObj: {
        pageNo: 1,
        pageSize: defaultPageSize,
        total: 0
      },
      filterData: [
        {
          type: 'ip',
          title: entityType.ip,
          totalCount: 0,
          data: [
            {
              label: this.$t('overall.country'),
              column: 'countryDistinctCount',
              topColumn: 'ip_location_country', // top弹框查询字段
              icon: entityFilterType.ip[0].icon,
              value: 0
            },
            {
              label: this.$t('overall.province'),
              column: 'provinceDistinctCount',
              topColumn: 'ip_location_province', // top弹框查询字段
              icon: entityFilterType.ip[1].icon,
              value: 0
            },
            {
              label: this.$t('overall.city'),
              column: 'cityDistinctCount',
              topColumn: 'ip_location_city', // top弹框查询字段
              icon: entityFilterType.ip[2].icon,
              value: 0
            },
            {
              label: this.$t('entities.asn'),
              column: 'asnDistinctCount',
              topColumn: 'ip_asn', // top弹框查询字段
              icon: entityFilterType.ip[3].icon,
              value: 0
            }
          ]
        },
        {
          type: 'app',
          title: entityType.app,
          totalCount: 0,
          data: [
            {
              label: this.$t('entities.category'),
              column: 'categoryDistinctCount',
              topColumn: 'app_category', // top弹框查询字段
              icon: entityFilterType.app[0].icon,
              value: 0
            },
            {
              label: this.$t('entities.subcategory'),
              column: 'subcategoryDistinctCount',
              topColumn: 'app_subcategory', // top弹框查询字段
              icon: entityFilterType.app[1].icon,
              value: 0
            },
            {
              label: this.$t('entities.risk'),
              column: 'riskDistinctCount',
              topColumn: 'app_risk', // top弹框查询字段
              icon: entityFilterType.app[2].icon,
              value: 0
            }
          ]
        },
        {
          type: 'domain',
          title: entityType.domain,
          totalCount: 0,
          data: [
            {
              label: this.$t('entities.domainDetail.categoryGroup'),
              column: 'categoryGroupDistinctCount',
              topColumn: 'domain_category_group', // top弹框查询字段
              icon: entityFilterType.domain[0].icon,
              value: 0
            },
            {
              label: this.$t('entities.category'),
              column: 'categoryDistinctCount',
              topColumn: 'domain_category', // top弹框查询字段
              icon: entityFilterType.domain[1].icon,
              value: 0
            },
            {
              label: this.$t('entities.reputationLevel'),
              column: 'reputationLevelDistinctCount',
              topColumn: 'domain_reputation_level', // top弹框查询字段
              icon: entityFilterType.domain[2].icon,
              value: 0
            }
          ]
        }
      ],
      listData: [],
      listLoading: false/*,
      listData: JSON.parse(`[
        {
          "entityType": "app",
          "appName": "360cn",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "domainCategory": "Streaming Media",
          "domainCategoryGroup": "IT Resources",
          "domainReputationScore": 79,
          "domainName": "9ddm.com",
          "entityType": "domain",
          "domainReputationLevel": "Low Risk"
        },
        {
          "ipAsn": "",
          "ipLocationCountry": "China",
          "entityType": "ip",
          "ipLocationProvince": "Other",
          "ipAddr": "116.178.30.96",
          "ipLocationCity": "Other"
        },
        {
          "entityType": "app",
          "appName": "youku",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "qqmusic",
          "appCategory": "media",
          "appId": "",
          "appRisk": "3",
          "appSubcategory": "multimedia-streaming"
        },
        {
          "entityType": "app",
          "appName": "meituan",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "sohu",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "mqtt",
          "appCategory": "networking",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "remote-access"
        },
        {
          "entityType": "app",
          "appName": "adjust",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "tiktok",
          "appCategory": "media",
          "appId": "",
          "appRisk": "2",
          "appSubcategory": "photo-video"
        },
        {
          "entityType": "app",
          "appName": "4399com",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "ixigua",
          "appCategory": "media",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "Multimedia-streaming"
        },
        {
          "entityType": "app",
          "appName": "oicq",
          "appCategory": "collaboration",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "instant-messaging"
        },
        {
          "entityType": "app",
          "appName": "digicert",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "rdp",
          "appCategory": "networking",
          "appId": "",
          "appRisk": "4",
          "appSubcategory": "remote-access"
        },
        {
          "entityType": "app",
          "appName": "163com",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "meitu",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "gitv_tv",
          "appCategory": "media",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "Multimedia-streaming"
        },
        {
          "entityType": "app",
          "appName": "tencent",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "thunder",
          "appCategory": "networking",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "infrastructure"
        }
      ]`) */
    }
  },
  methods: {
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
    search (params) {
      if (params) {
        this.searchParams = params
      }
      if (!this.showList) {
        this.showList = true
      }
      // 带参数时，只查询对应类型的entity；不带参数时，3种entity都查
      if (this.searchParams && Object.keys(this.searchParams).length > 0) {
        this.queryFilter({ entityType: 'ip', q: this.searchParams.q, ...this.timeFilter })
        this.queryFilter({ entityType: 'app', q: this.searchParams.q, ...this.timeFilter })
        this.queryFilter({ entityType: 'domain', q: this.searchParams.q, ...this.timeFilter })
        this.queryList({ q: this.searchParams.q, ...this.timeFilter, ...this.pageObj })
        this.queryListTotal({ q: this.searchParams.q, ...this.timeFilter })
      } else {
        this.queryFilter({ entityType: 'ip', ...this.timeFilter })
        this.queryFilter({ entityType: 'app', ...this.timeFilter })
        this.queryFilter({ entityType: 'domain', ...this.timeFilter })
        this.queryList({ ...this.timeFilter, ...this.pageObj })
        this.queryListTotal({ ...this.timeFilter })
      }
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.search()
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.search()
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
      const params = {}
      params[topData.topColumn] = name
      this.$refs.search.addParams(params)
    },
    /* 查询filter数据 */
    queryFilter (params) {
      const queryParams = {
        ...params,
        startTime: parseInt(params.startTime / 1000),
        endTime: parseInt(params.endTime / 1000)
      }
      get(api.entityFilter, queryParams).then(response => {
        if (response.data.result) {
          switch (params.entityType) {
            case 'ip': {
              this.filterData[0].data.forEach(d => {
                d.value = response.data.result[d.column]
              })
              this.filterData[0].totalCount = response.data.result.count
              break
            }
            case 'app': {
              this.filterData[1].data.forEach(d => {
                d.value = response.data.result[d.column]
              })
              this.filterData[1].totalCount = response.data.result.count
              break
            }
            case 'domain': {
              this.filterData[2].data.forEach(d => {
                d.value = response.data.result[d.column]
              })
              this.filterData[2].totalCount = response.data.result.count
              break
            }
          }
        }
      })
    },
    queryList (params) {
      this.listLoading = true
      const queryParams = {
        ...params,
        startTime: parseInt(params.startTime / 1000),
        endTime: parseInt(params.endTime / 1000)
      }
      get(api.entityList, queryParams).then(response => {
        if (response.code === 200) {
          this.listData = []
          this.$nextTick(() => {
            this.listData = response.data.result
          })
        }
      }).finally(() => {
        this.listLoading = false
      })
    },

    queryListTotal (params) {
      const queryParams = {
        ...params,
        startTime: parseInt(params.startTime / 1000),
        endTime: parseInt(params.endTime / 1000)
      }
      get(api.entityListTotal, queryParams).then(response => {
        if (response.code === 200) {
          this.pageObj.total = response.data.result
        }
      })
    },
    handleQ (params) {
      return Object.keys(params).map(param => {
        return `${param}='${params[param]}'`
      }).join(' AND ')
    },

    getEntityIndexData () {
      const now = window.$dayJs.tz().valueOf()
      const timeFilter = {
        startTime: parseInt(now / 1000 - 3600),
        endTime: parseInt(now / 1000)
      }
      // Total
      get(api.entityTotal, { entityType: 'app' }).then(response => {
        if (response.code === 200) {
          this.entityAppTotal = response.data.result
        }
      })
      get(api.entityTotal, { entityType: 'domain' }).then(response => {
        if (response.code === 200) {
          this.entityDomainTotal = response.data.result
        }
      })
      get(api.entityTotal, { entityType: 'ip' }).then(response => {
        if (response.code === 200) {
          this.entityIpTotal = response.data.result
        }
      })
      // New
      get(api.entityNew, { entityType: 'app', ...timeFilter }).then(response => {
        if (response.code === 200) {
          this.entityAppNew = response.data.result
        }
      })
      get(api.entityNew, { entityType: 'domain', ...timeFilter }).then(response => {
        if (response.code === 200) {
          this.entityDomainNew = response.data.result
        }
      })
      get(api.entityNew, { entityType: 'ip', ...timeFilter }).then(response => {
        if (response.code === 200) {
          this.entityIpNew = response.data.result
        }
      })
      // Active
      get(api.entityActive, { entityType: 'app', ...timeFilter }).then(response => {
        if (response.code === 200) {
          this.entityAppActive = response.data.result
        }
      })
      get(api.entityActive, { entityType: 'domain', ...timeFilter }).then(response => {
        if (response.code === 200) {
          this.entityDomainActive = response.data.result
        }
      })
      get(api.entityActive, { entityType: 'ip', ...timeFilter }).then(response => {
        if (response.code === 200) {
          this.entityIpActive = response.data.result
        }
      })
    }
  },
  mounted () {
    this.getEntityIndexData()
  },
  watch: {
    timeFilter (n) {
      this.search()
    }
  },
  setup () {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      timeFilter
    }
  }
}
</script>
