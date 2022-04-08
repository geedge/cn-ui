<template>
  <div
      class="entity-explorer"
      :class="{'entity-explorer--show-list': showList}">
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools" v-show="showList">
      <DateTimeRange class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" :date-range="timeFilter.dateRangeValue" ref="dateTimeRange" @change="reload"/>
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
            :q="q"
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
        <Pagination
            ref="pagination"
            :page-obj="pageObj"
            @pageNo='pageNo'
            @pageSize='pageSize'
            @size-change="pageSize"
            @prev-click="prev"
            @next-click="next"
        >
        </Pagination>
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
import { entityType, entityFilterType, defaultPageSize, riskLevelMapping } from '@/utils/constants'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getNowTime, getSecond } from '@/utils/date-util'
import { ref } from 'vue'
import Pagination from '@/components/common/Pagination'

export default {
  name: 'entity-explorer',
  components: {
    ExplorerSearch,
    DateTimeRange,
    TimeRefresh,
    EntityFilter,
    EntityList,
    Pagination
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

      pageObj: {
        pageNo: 1,
        // 是否重置pageNo，在执行新搜索时是true
        resetPageNo: true,
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
      q: '',
      metaList: [],
      limitFilterType: true, // 是否限定了filter的类型
      listLoading: false
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
        result = this.$_.replace(result, c.original, c.target)
      })
      return result
    },
    search (metaList, formatSql) {
      if (formatSql) {
        this.q = this.specialColumnHandle(formatSql)
        this.metaList = metaList
      } else {
        this.q = ''
        this.metaList = []
      }

      if (!this.showList) {
        this.showList = true
      }
      if (this.pageObj.resetPageNo) {
        this.pageObj.pageNo = 1
      } else {
        this.pageObj.resetPageNo = true
      }
      // 带参数时，只查询对应类型的entity；不带参数时，3种entity都查
      if (formatSql) {
        // entity_type处理，不查其他两种entity_type对应的左侧筛选
        const entityTypeMeta = metaList.find(meta => {
          return meta.column && meta.column.name === 'entity_type'
        })
        if (entityTypeMeta && entityTypeMeta.operator.value === '=') {
          let entityType = ''
          this.limitFilterType = false
          if (entityTypeMeta.value.value.toLowerCase() === "'ip'") {
            this.limitFilterType = true
            entityType = 'ip'
          } else if (entityTypeMeta.value.value.toLowerCase() === "'domain'") {
            this.limitFilterType = true
            entityType = 'domain'
          } else if (entityTypeMeta.value.value.toLowerCase() === "'app'") {
            this.limitFilterType = true
            entityType = 'app'
          } else {
            this.limitFilterType = false
          }
          this.queryFilter({ entityType: entityType, q: this.q, ...this.timeFilter })
          this.queryList({ q: this.q, ...this.timeFilter, ...this.pageObj })
          this.queryListTotal({ q: this.q, ...this.timeFilter })
        } else {
          this.limitFilterType = false
          this.queryFilter({ entityType: 'ip', q: this.q, ...this.timeFilter })
          this.queryFilter({ entityType: 'domain', q: this.q, ...this.timeFilter })
          this.queryFilter({ entityType: 'app', q: this.q, ...this.timeFilter })
          this.queryList({ q: this.q, ...this.timeFilter, ...this.pageObj })
          this.queryListTotal({ q: this.q, ...this.timeFilter })
        }
      } else {
        this.limitFilterType = false
        this.queryFilter({ entityType: 'ip', ...this.timeFilter })
        this.queryFilter({ entityType: 'app', ...this.timeFilter })
        this.queryFilter({ entityType: 'domain', ...this.timeFilter })
        this.queryList({ ...this.timeFilter, ...this.pageObj })
        this.queryListTotal({ ...this.timeFilter })
      }
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.search(this.metaList, this.q)
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.pageObj.resetPageNo = false
      this.search(this.metaList, this.q)
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
      const params = {
        column: topData.topColumn,
        operator: '=',
        value: name
      }
      this.$refs.search.addParams([params])
      this.$nextTick(() => {
        this.emitter.emit('advanced-search')
      })
    },
    /* 查询filter数据 */
    queryFilter (params) {
      const queryParams = {
        ...params,
        startTime: getSecond(params.startTime),
        endTime: getSecond(params.endTime)
      }
      get(api.entityFilter, queryParams).then(response => {
        if (response.data && response.data.result) {
          switch (params.entityType) {
            case 'ip': {
              this.filterData[0].data.forEach(d => {
                d.value = response.data.result[d.column]
              })
              this.filterData[0].totalCount = response.data.result.count
              if (this.limitFilterType) {
                this.cleanFilterData(1)
                this.cleanFilterData(2)
              }
              break
            }
            case 'app': {
              this.filterData[1].data.forEach(d => {
                d.value = response.data.result[d.column]
              })
              this.filterData[1].totalCount = response.data.result.count
              if (this.limitFilterType) {
                this.cleanFilterData(0)
                this.cleanFilterData(2)
              }
              break
            }
            case 'domain': {
              this.filterData[2].data.forEach(d => {
                d.value = response.data.result[d.column]
              })
              this.filterData[2].totalCount = response.data.result.count
              if (this.limitFilterType) {
                this.cleanFilterData(0)
                this.cleanFilterData(1)
              }
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
    },
    cleanFilterData (index) {
      this.filterData[index].data.forEach(d => {
        d.value = 0
      })
      this.filterData[index].totalCount = 0
    }
  },
  mounted () {
    this.getEntityIndexData()
  },
  watch: {
    timeFilter (n) {
      this.search(this.metaList, this.q)
    }
  },
  setup () {
    const dateRangeValue = 60 * 24
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      timeFilter
    }
  }
}
</script>
