<template>
  <div class="tabs" :style="showCustomizeTabs ? (tableData.length > 10 && showRecordNum === 10 ? 'height: calc(100% - 36px);'
                                                                                      : 'height: calc(100% - 2px)')
                                     : (tableData.length > 10 && showRecordNum === 10 ? 'height: calc(100% - 77px);'
                                                                                      : 'height: calc(100% - 26px);')">
    <el-tabs v-model="activeTab"
             :class="showCustomizeTabs?'cn-chart__tabs':'tab-hide cn-chart__tabs cn-chart__tabs-hide-tab'"
             @tab-click="handleClick"
    >
      <template v-for="(tab,index) in list">
        <el-tab-pane  v-if="tab.checked"
                      :name="tab.label"
                      :key="tab.label"
                      :ref="`chart-tab-${index}`"
                      class="tab-pane"
        ><!-- key原来设置的值为index，导致自定义拖拽时，选中tab下方的蓝色线不随着拖拽移动，key修改为label后，此问题消失 -->
          <template #label>
            {{$t(tab.label)}}
          </template>
          <el-table
                  :id="`tabTable_${index}`"
                  :ref="`dataTable_${tab.prop}`"
                  :data="tableData.slice(0,showRecordNum)"
                  border
                  :cell-style="tableCellStyle"
                  :header-cell-style="tableHeaderCellStyle"
                  :class="tableClass"
                  height="100%"
                  empty-text=" "
                  @sort-change="((column) => {sortChange(column,tab.prop)})"
                  :key="index"
          >
            <template v-for="(item, index) in customTableTitles">
              <el-table-column
                      v-if="item.checked"
                      :sortable="sortable(item)"
                      align="center"
                      :prop="item.prop"
                      class="data-column"
                      :ref="item.prop"
                      :key="index"
              >
                <template #header >
                  <span class="data-column__span" >{{$t(item.label)}}</span>
                </template>
                <template  #default="scope" :column="item">
                  <template v-if="item.columnType === tableColumnType.chainRatio"  >
                    <div class="data-total" >
                      <div class="data-value">
                        <template v-if="showUnit && item.unit">
                          {{scope.row[item.prop]?((scope.row[item.prop][0]||scope.row[item.prop][0]===0)? unitConvert(scope.row[item.prop][0], item.unit).join(' ') : '-'):'' }}
                        </template>
                        <template v-else>
                          {{scope.row[item.prop]?((scope.row[item.prop][0]||scope.row[item.prop][0]===0)? unitConvert(scope.row[item.prop][0], unitTypes.number).join(' ') : '-'):'' }}
                        </template>
                      </div>
                      <div class="data-trend">
                        <template v-if="scope.row[item.prop]">
                          <div v-if="scope.row[item.prop][1] === 'up'" class="data-total-trend data-total-trend-red">
                            <i class="cn-icon-rise1 cn-icon"></i><span>{{scope.row[item.prop][2]}}</span>
                          </div>
                          <div v-else-if="scope.row[item.prop][1] === 'down'" class="data-total-trend data-total-trend-green">
                            <i class="cn-icon-decline cn-icon"></i><span>{{scope.row[item.prop][2]}}</span>
                          </div>
                          <div v-else-if="scope.row[item.prop][1] === 'noChange'" class="data-total-trend data-total-trend-black">
                            <i class="cn-icon-constant cn-icon"></i>
                          </div>
                        </template>
                        <template  v-else>
                          -
                        </template>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="item.columnType === tableColumnType.dillDown" >
                    <div v-if="isOnlyRead" >
                      <template v-if="tableType === fromRoute.dnsServiceInsights && isDnsMapType">
                        {{dnsMapData.get(scope.row['tab'])}}
                      </template>
                      <template v-else>
                        {{scope.row['tab']}}
                      </template>
                    </div>
                    <div v-else class="data-click" @click="handleTabValue(item.name,scope.row['tab'])">
                      <template v-if="tableType === fromRoute.dnsServiceInsights && isDnsMapType">
                        {{dnsMapData.get(scope.row['tab'])}}
                      </template>
                      <template v-else>
                        {{scope.row['tab']}}
                      </template>
                    </div>
                  </template>
                  <template v-else-if="item.columnType === tableColumnType.percent" >
                    <div class="dns-in-ex">
                      <div class="dns-percent-pic">
                        <div v-if="scope.row[item.prop][0] !== false" class="div-green" id="green" :style="`width:${scope.row[item.prop][0]}`"></div>
                        <div v-if="scope.row[item.prop][0] !== false" class="div-yellow" id="yellow" :style="`width:${scope.row[item.prop][1]}`"></div>
                      </div>
                      <div class="dns-percent">{{scope.row[item.prop][2]}}</div>
                    </div>
                  </template>
                  <template v-else-if="item.prop === 'score'" >
                    <div class="score-cell">
                      <div v-if="scope.row.score <= 2" class="data-score data-score-red" >
                        {{scope.row[item.prop] ? unitConvert(scope.row[item.prop], unitTypes.number).join(' ') : '0'}}
                      </div>
                      <div v-else-if="scope.row.score <= 4" class="data-score data-score-yellow" >
                        {{scope.row[item.prop] ? unitConvert(scope.row[item.prop], unitTypes.number).join(' ') : '0'}}
                      </div>
                      <div v-else-if="scope.row.score <= 6" class="data-score data-score-green" >
                        {{scope.row[item.prop] ? unitConvert(scope.row[item.prop], unitTypes.number).join(' ') : '0'}}
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <template v-if="showUnit && item.unit">
                      {{(scope.row[item.prop]  || scope.row[item.prop]===0) ? unitConvert(scope.row[item.prop], item.unit).join(' ') : '-'}}
                    </template>
                    <template v-else>
                      {{(scope.row[item.prop] || scope.row[item.prop]===0)? unitConvert(scope.row[item.prop], unitTypes.number).join(' ') : '-'}}
                    </template>
                  </template>
                </template>
              </el-table-column>
            </template>
            <template v-slot:empty>
              <div class="table-no-data" v-if="isNoData">
                <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
              </div>
            </template>
          </el-table>
        </el-tab-pane>

      </template>
    </el-tabs>
    <div class="tab-search" >
      <el-popover placement="bottom-end"
                  :width="240"
                  :show-arrow="false"
                  :append-to-body="true"
                  :hide-after="0"
                  popper-class="customize-tab__popper"
                  @show="handleCustomizeButton(true)"
                  @hide="handleCustomizeButton(false)"
                  trigger="click">
        <template #reference>
          <div class="search-customize-tab "  :class="showBackground?'search-customize-tab__active':''"  >
            <i class="cn-icon-gear cn-icon icon-gear"></i> <span> {{$t('network.customize')}}</span>
          </div>
        </template>

        <el-tabs v-model="activeCustomize"
                 @tab-click="handleCustomizeClick"
                 type="card"
        >
          <el-tab-pane :label="$t('network.tabs')" name="tabs" width="50%"  v-if="showCustomizeTabs" >
            <transition-group name="dragTabs" class="list" tag="ul" ref="tabs">
              <li v-for="(item, index) in list"
                  :key="item.label"
                  class="list-item"
                  @dragenter="dragenter($event, index)"
                  @dragover="dragover($event, index)"
                  @dragstart="dragstart(index)"
                  draggable="true"
              >
                <i class="cn-icon-sort cn-icon icon-drag"
                   :key="item.label"
                ></i> <el-checkbox @change="tabChange(index)" :disabled="item.disabled"  v-model="item.checked"  :label="$t(item.label) " size="small"  :key="item.label"/>
              </li>
            </transition-group>
          </el-tab-pane>
          <el-tab-pane :label="tableType==='networkOverview'?$t('network.direction'):$t('network.metrics')" name="metrics" width="50%" >
            <transition-group name="dragMetric" class="list" tag="ul" ref="metric">
              <template v-for="(item, index) in customTableTitles"  :key="item.label">
                <li v-if="index>0"
                    class="list-item"
                    @dragenter="dragMetricEnter($event, index)"
                    @dragover="dragMetricOver($event, index)"
                    @dragstart="dragMetricStart(index)"
                    draggable="true"
                >
                  <i class="cn-icon-sort cn-icon icon-drag"
                     :key="item.label"
                  ></i> <el-checkbox @change="metricChange" :disabled="item.disabled" v-model="item.checked"  :label="$t(item.label) " size="small" :key="item.label"/>
                </li>
              </template>
            </transition-group>
          </el-tab-pane>
        </el-tabs>
      </el-popover>
    </div>
  </div>
  <div class="fixed-row" v-if="tableData.length > 10 && showRecordNum===10 ">
    <div class="fixed-button" @click="showMore" >{{$t('network.showTop50Results')}}</div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { operationType, unitTypes, networkTable, tableColumnType, networkDefaultLimit, curTabState, storageKey, dbDrilldownTableConfig, fromRoute } from '@/utils/constants'
import { get } from '@/utils/http'
import unitConvert from '@/utils/unit-convert'
import { getChainRatio, computeScore, urlParamsHandler, overwriteUrl, getUserDrilldownTableGeo, readDrilldownTableConfigByUser, combinDrilldownTableWithUserConfig, getDnsMapData } from '@/utils/tools'
import { getSecond } from '@/utils/date-util'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { db } from '@/indexedDB'
import { api, getDictList } from '@/utils/api'

export default {
  name: 'NetworkOverviewTabs',
  data () {
    return {
      dragIndex: '',
      dragMetricIndex: '',
      orderBy: 'totalBytes',
      tab: 'ip',
      unitConvert,
      unitTypes,
      networkTable,
      isNoData: false,
      customTableTitlesForTab: [],
      customTableTitles: [],
      commonTabList: [],
      commonColumnList: [],
      tables: [],
      list: [], // 当前状态列表
      allList: [], // 包含2级标签的所有状态的列表
      networkTabList: [], // 原始状态列表
      showBackground: false,
      tableData: [],
      tableDataBackup: [],
      showRecordNum: 10,
      showCustomizeTabs: true,
      columnNameGroup: {},
      cycleColumnNameGroup: {},
      // metricUnit: 'bytes',
      // loading: false,
      tableColumnType: tableColumnType,
      metricsList: [],
      curTabState: curTabState,
      curTable: {}, // 当前的表格类型
      isOnlyRead: false,
      curTableInCode: {}, // 代码中的配置
      tableType: '',
      userId: null,
      drillDownTableConfigs: [],
      activeTab: '',
      activeCustomize: '',
      networkSearchUrl: {},
      column: {},
      index: 0,
      chartData: [],
      dnsMapData: new Map(),
      dnsQtypeMapData: new Map(),
      dnsRcodeMapData: new Map(),
      isDnsMapType: false,
      tableSortColumn: '',
      tableSortType: '',
      tableSortTab: '',
      urlChangeParams: {},
      showUnit: false,
      fromRoute: fromRoute
    }
  },
  props: {
    timeFilter: Object,
    chart: Object,
    metric: {
      type: String,
      default: 'Bits/s'
    }
  },
  components: {
    ChartNoData
  },
  watch: {
    timeFilter: {
      handler (n) {
        // console.log('watch')
        const curTab = this.getCurTab()
        let queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: curTab.prop
        }
        const condition = this.getQueryCondition()
        if (condition) {
          queryParams = {
            orderBy: this.orderBy,
            limit: networkDefaultLimit,
            type: curTab.prop,
            q: condition
          }
        }
        this.changeUrlTabState()
        this.getChartData(queryParams)
      }
    },
    metric (n) {
      this.changeMetric()
    }
  },
  computed: {
    tableClass () {
      let className
      if (this.showRecordNum >= 10) {
        className = 'tab-table__average'
      } else {
        className = 'tab-table'
      }
      if (!(this.tableData.length > 10 && this.showRecordNum === 10)) {
        className = 'tab-table tab-table__no-bottom'
      }
      return className
    }
  },
  mixins: [chartMixin],
  methods: {
    /* 参数 extraParams 额外请求参数 */
    getChartData (extraParams = {}) {
      this.initState()
      const queryParams = {
        ...this.handleQueryParams(extraParams),
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      const requestUrl = this.getCurUrl()
      get(requestUrl, queryParams).then(response => {
        if (response.code === 200) {
          this.chartData = response.data.result
          this.initData()
        } else {
          this.isNoData = true
          this.toggleLoading(false)
        }
      }).catch(e => {
        console.error(e)
      }).finally(() => {
        this.changeUrlTabState()
        this.toggleLoading(false)
      })
    },
    sortable (title) {
      const excludeName = ['queriesFromIE']
      return excludeName.indexOf(title.name) > -1 ? false : 'custom'
    },
    // 切换metric：bit、packet、session
    changeMetric () {
      this.tableData = []
      this.tableDataBackup = []
      this.setShowNum(10)
      const beforeType = this.getUrlParam(this.curTabState.tabOperationBeforeType, '', true)
      if (beforeType && beforeType != operationType.thirdMenu) {
        this.urlChangeParams[this.curTabState.tabOperationBeforeType] = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      }
      this.urlChangeParams[this.curTabState.tabOperationType] = operationType.changeMetric
      this.urlChangeParams[this.curTabState.tableMetric] = this.metric

      const curTab = this.getCurTab()
      this.initMetric()
      this.combineColumnList(curTab.label)

      let queryParams = {
        orderBy: this.orderBy,
        limit: networkDefaultLimit,
        type: curTab.prop
      }
      const condition = this.getQueryCondition()
      if (condition) {
        queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: curTab.prop,
          q: condition
        }
      }
      this.changeUrlTabState()
      this.getChartData(queryParams)
    },
    cancleSortArrow () {
      // 取消表格排序高亮的箭头
      if (this.column.prop) {
        // const table = this.$refs['dataTable_' + this.index]
        const tableHeaer = this.$refs['dataTable_' + this.index]
          ? (Array.isArray(this.$refs['dataTable_' + this.index])
              ? this.$refs['dataTable_' + this.index][0].$refs.tableHeader
              : this.$refs['dataTable_' + this.index].$refs.tableHeader)
          : []
        const columns = tableHeaer.columns
        if (columns) {
          columns.forEach(item => {
            item.order = ''
          })
        }
        this.column = {}
        this.index = 0
      }
    },
    isThirdMenu () { // 当前是否为3级
      if (this.isOnlyRead) {
        return false
      } else {
        const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
        const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')
        return thirdMenu && !fourthMenu
      }
    },
    isFourthMenu () { // 当前是否为4级
      if (this.isOnlyRead) {
        return false
      } else {
        const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
        const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')
        return thirdMenu && fourthMenu
      }
    },
    initState () {
      // console.log('InitState：开始')
      let curTab = this.getCurTab()
      if (curTab) { // 显示当前tab
        const realTab = this.list.find(item => item.name === curTab.name)
        if (realTab) {
          realTab.checked = true
        }
        this.showTab(curTab)
      }

      this.isNoData = false
      this.tableData = []
      this.tableDataBackup = []
      this.toggleLoading(true)
      this.$nextTick(() => {
        // 取消表格排序高亮的箭头
        this.cancleSortArrow()
        // 设置默认排序
        if (this.tableSortColumn) {
          const refName = 'dataTable_' + this.tableSortTab
          const table = this.$refs[refName]
          const tableHeaer = table
            ? (Array.isArray(table)
                ? table[0].$refs.tableHeader
                : table.$refs.tableHeader)
            : []
          const columns = tableHeaer.columns
          if (columns) {
            columns.forEach(item => {
              if (item.property === this.tableSortColumn) {
                item.order = this.tableSortType
              }
            })
          }
          this.sortChange({ prop: this.tableSortColumn, order: this.tableSortType }, this.tableSortTab)
        }
      })

      // 针对network overview – app list 点击标题触发下钻，相关内容处理
      const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      if (this.isFourthMenu()) {
        this.list.forEach(item => {
          if (item.label === thirdMenu) {
            // item.checked = false
          }
        })
      } else if (this.isThirdMenu()) {
        this.list.forEach(item => {
          if (item.label === thirdMenu) {
            item.checked = true
          }
        })
      }
      // 选中的都进行展示
      this.list.forEach(item => {
        if (item.checked) {
          const tabDom = document.getElementById('tab-' + item.label)
          if (tabDom) {
            tabDom.style.display = ''
          }
        }
      })

      const curOperationType = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      if (this.isFourthMenu()) { // 点击的为第四级菜单
        curTab = this.getCurTab()
        if (curTab) {
          this.showTab(curTab)
          this.urlChangeParams[this.curTabState.curTab] = curTab.prop
        }
        this.showCustomizeTabs = true
      } else if (this.isThirdMenu()) { // 点击的为第三级菜单
        const name = this.getUrlParam(this.curTabState.thirdMenu, '')
        // const networkTabList = []
        this.list.forEach(item => {
          if (item.label === name) {
            item.checked = true
          }
        })
        const breadcrumbColumnTab = this.list.find(item => item.label === name)
        this.urlChangeParams[this.curTabState.curTab] = breadcrumbColumnTab.prop

        this.hideTabs(breadcrumbColumnTab)
        this.combineColumnList(breadcrumbColumnTab.name)
        this.showCustomizeTabs = false
      } else if (curOperationType === operationType.changeTab) { // 切换tab
        this.showCustomizeTabs = true
      } else if (curOperationType === operationType.secondMenu || curOperationType === operationType.mainMenu) { // 点击的为第二级菜单、或者点击菜单进入、
        if (curTab) {
          this.showTab(curTab)
          this.urlChangeParams[this.curTabState.curTab] = curTab.prop
        }
        if (this.isFourthMenu()) {
          this.$nextTick(() => {
            this.list.forEach(item => {
              if (item.label === thirdMenu) {
                item.checked = false
              }
            })
          })
        } else if (this.isThirdMenu()) {
          this.list.forEach(item => {
            if (item.label === thirdMenu) {
              item.checked = true
              this.$nextTick(() => {
                this.hideTabs(item)
              })
              this.combineColumnList(item.name)
            }
          })
          this.activeTab = ''
        }
        this.list = Object.assign({}, this.list)
        this.showCustomizeTabs = true
      } else if (curOperationType === operationType.changeMetric) { // 切换metric
        if (this.isThirdMenu()) {
          this.hideTabs(curTab)
          this.combineColumnList(curTab.name)
          this.showCustomizeTabs = false
        }
      } else if (curOperationType === operationType.customize) { // customize
        if (this.isThirdMenu()) {
          this.hideTabs(curTab)
          this.combineColumnList(curTab.name)
          this.showCustomizeTabs = false
        } else {
          this.$nextTick(() => {
            this.list.forEach(item => {
              const tabDom = document.getElementById('tab-' + item.label)
              const paneDom = document.getElementById('pane-' + item.label)
              if (tabDom) {
                tabDom.style.display = ''
              }
              if (paneDom) {
                if (curTab.name === item.name) {
                  paneDom.style.display = ''
                }
              }
            })
            this.showTab(curTab)
            this.showCustomizeTabs = true
          })
        }
      } else {
        this.showCustomizeTabs = true
      }
      this.changeUrlTabState()
      // console.log('InitState: 结束')
    },
    async initData () {
      const tabList = []
      const curTab = this.getCurTab()
      const tableDataTmp = this.chartData.map(item => {
        tabList.push(item[curTab.prop])
        const otherData = { tab: item[curTab.prop] }
        otherData[curTab.prop] = item[curTab.prop]
        Object.keys(this.columnNameGroup).forEach(i => {
          const propName = this.columnNameGroup[i]
          const column = this.customTableTitles.find(tableColumn => { return tableColumn.prop === i })
          if (column && column.columnType === tableColumnType.percent) {
            let sum = 0
            const propGroup = propName.split(',')
            propGroup.forEach(prop => {
              sum = sum + Number(item[prop])
            })
            const resultGroup = []
            propGroup.forEach(prop => {
              resultGroup.push(unitConvert(Number(item[prop]) / sum, unitTypes.percent, null, null, 0).join(''))
            })
            otherData[i] = []
            if (resultGroup[0] === '-') {
              otherData[i][0] = false
              otherData[i][1] = resultGroup[1]
              otherData[i][2] = resultGroup.join(' / ')
            } else {
              otherData[i][0] = resultGroup[0]
              otherData[i][1] = resultGroup[1]
              otherData[i][2] = resultGroup.join(' / ')
            }
          } else {
            otherData[i] = item[propName]
          }
        })
        return otherData
      })

      if (!this.chartData || this.chartData.length === 0) {
        this.isNoData = true
        this.toggleLoading(false)
      } else {
        this.isNoData = false
      }

      const queryParams = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      if (tabList.length > 0) {
        let conditionGroup = tabList.filter(item => item != '')
        let conditionHandleRlt = []
        conditionGroup.forEach(condition => {
          condition = condition.replaceAll("'", "\\\\'")
          condition = "'"+condition+ "'"
          conditionHandleRlt.push(condition)
        })
        queryParams.params = conditionHandleRlt.join(",")
        queryParams.type = curTab.prop
      }

      let cycleTotalList = []
      const condition = this.getQueryCondition()
      if (condition) {
        queryParams.q = condition
      }

      const self = this
      if (this.customTableTitles && this.customTableTitles.length > 0) {
        this.customTableTitles.forEach(tableColumn => {
          if (tableColumn.columnType === tableColumnType.chainRatio && tableColumn.isInMainUrl && tableDataTmp && tableDataTmp.length > 0) {
            get(self.gerCycleUrl(), queryParams).then(response => {
              if (response.code === 200) {
                cycleTotalList = response.data.result
                tableDataTmp.forEach(item => {
                  const cycle = cycleTotalList.find(i => i[curTab.prop] === item.tab)
                  let trend = ''// 空：无图标；up：向上的图标；down：向下的图标；noChange：横向箭头图标
                  let trendPercent = ''
                  if (cycle) {
                    const curVal = Number(item[tableColumn.prop])
                    const preVal = Number(cycle[self.cycleColumnNameGroup[tableColumn.prop]])
                    if (preVal && preVal != 0) {
                      const totalDiff = curVal - preVal
                      const chainRatio = getChainRatio(curVal, preVal)
                      if (chainRatio === '-') {
                        trend = ''
                        trendPercent = ''
                      } else {
                        trendPercent = parseFloat(Math.abs(chainRatio) * 100).toFixed(2)
                        if (totalDiff > 0) {
                          trend = 'up'
                          if (trendPercent <= 500) {
                            trendPercent = trendPercent + '%'
                          } else {
                            trendPercent = '>500%'
                          }
                        } else if (totalDiff < 0) {
                          trend = 'down'
                          if (trendPercent <= 500) {
                            trendPercent = trendPercent + '%'
                          } else {
                            trendPercent = '>500%'
                          }
                        } else if (totalDiff === 0) {
                          trend = 'noChange'// 横向图标
                        } else {
                          trend = ''
                        }
                        if (trendPercent === '0%') {
                          trend = 'noChange'
                          trendPercent = ''
                        }
                      }
                    }
                  }
                  item[tableColumn.prop] = [(item[tableColumn.prop] || item[tableColumn.prop] === 0) ? item[tableColumn.prop] : '', trend, trendPercent]
                })
              }
            }).catch(e => {
              console.log(e)
            }).finally(e => {
              this.tableData = tableDataTmp
              this.tableDataBackup = tableDataTmp
              if (this.tableSortColumn) { // 执行url中指定的排序
                this.sortChange({ prop: this.tableSortColumn, order: this.tableSortType }, this.tableSortTab)
              }
              this.toggleLoading(false)
              // 查询需要单独查询的，且需要展示环比图标，列的当前周期的数据
              this.customTableTitles.forEach(tableColumn => {
                if (tableColumn.columnType === tableColumnType.chainRatio && !tableColumn.isInMainUrl) {
                  get(self.gerColumnUrl(tableColumn), queryParams).then(response => {
                    if (response.code === 200) {
                      const columnList = response.data.result
                      self.tableData.forEach((item, i) => {
                        const data = columnList.find(i => i[curTab.prop] === item.tab)
                        if (!item.scoreGroup) {
                          item.scoreGroup = {}
                        }
                        if (data) {
                          item[tableColumn.prop] = data[self.columnNameGroup[tableColumn.prop]]
                          item.scoreGroup[self.columnNameGroup[tableColumn.prop]] = data[self.columnNameGroup[tableColumn.prop]]
                        } else {
                          item.scoreGroup[self.columnNameGroup[tableColumn.prop]] = 0
                        }
                        if (Object.keys(item.scoreGroup).length >= 5) {
                          item.score = computeScore(item.scoreGroup)
                        }
                      })
                    }
                  }).catch(e => {
                    console.log(e)
                  }).finally(e => {
                    // 查询需要单独查询的，且需要展示环比图标，列的前一周期的数据
                    if (tableColumn.cycle && self.tableData && self.tableData.length > 0) {
                      const queryCycleParams = {
                        ...queryParams,
                        cycle: tableColumn.cycle
                      }
                      get(self.gerColumnUrl(tableColumn), queryCycleParams).then(response => {
                        if (response.code === 200) {
                          cycleTotalList = response.data.result
                          self.tableData.forEach(item => {
                            const cycle = cycleTotalList.find(i => i[curTab.prop] === item.tab)
                            let trend = ''// 空：无图标；up：向上的图标；down：向下的图标；noChange：横向箭头图标
                            let trendPercent = ''
                            if (cycle) {
                              const curVal = Number(item[tableColumn.prop])
                              // let preVal = Number(cycle[self.metricUnit])
                              const preVal = Number(cycle[self.columnNameGroup[tableColumn.prop]])
                              if (preVal && preVal != 0) {
                                const totalDiff = curVal - preVal
                                const chainRatio = getChainRatio(curVal, preVal)
                                if (chainRatio === '-') {
                                  trend = ''
                                  trendPercent = ''
                                } else {
                                  trendPercent = parseFloat(Math.abs(chainRatio) * 100).toFixed(2)
                                  if (totalDiff > 0) {
                                    trend = 'up'
                                    if (trendPercent <= 500) {
                                      trendPercent = trendPercent + '%'
                                    } else {
                                      trendPercent = '>500%'
                                    }
                                  } else if (totalDiff < 0) {
                                    trend = 'down'
                                    if (trendPercent <= 500) {
                                      trendPercent = trendPercent + '%'
                                    } else {
                                      trendPercent = '>500%'
                                    }
                                  } else if (totalDiff === 0) {
                                    trend = 'noChange'// 横向图标
                                  } else {
                                    trend = ''
                                  }
                                  if (trendPercent === '0%') {
                                    trend = 'noChange'
                                    trendPercent = ''
                                  }
                                }
                              }
                            }
                            if (!(item[tableColumn.prop] && item[tableColumn.prop].length >= 3)) {
                              item[tableColumn.prop] = [(item[tableColumn.prop] || item[tableColumn.prop] === 0) ? item[tableColumn.prop] : '', trend, trendPercent]
                            }
                          })
                        }
                      }).catch(e => {
                        console.log(e)
                      })
                    }
                  })
                }
              })
            })
          }
        })
      } else {
        this.tableData = tableDataTmp
        this.tableDataBackup = tableDataTmp
        this.toggleLoading(false)
      }
      this.changeUrlTabState()
    },
    showMore () {
      this.setShowNum(50)
      this.sortChange(this.column, this.index)// 当前选中的tab？？？？
      this.changeUrlTabState()
    },
    setShowNum (num) {
      this.showRecordNum = Number(num)
      this.urlChangeParams[curTabState.tableShowMore] = this.showRecordNum
    },
    rowClass (row, column, rowIndex, columnIndex) {
      if (rowIndex === 49) {
        return 'fixed-row'
      }
    },
    getChartType (char) {
      // 数字可按照排序的要求进行自定义，我这边产品的要求是
      // 数字（0->9）->大写字母（A->Z）->小写字母（a->z）->中文拼音（a->z）
      if (/^[\u4e00-\u9fa5]$/.test(char)) {
        return ['zh', 300]
      }
      if (/^[a-zA-Z]$/.test(char)) {
        return ['en', 200]
      }
      if (/^[0-9]$/.test(char)) {
        return ['number', 100]
      }
      return ['others', 999]
    },
    sortChange (column, index) {
      if (column.prop) {
        this.urlChangeParams[this.curTabState.tableSortColumn] = column.prop
      }
      if (column.order) {
        this.urlChangeParams[this.curTabState.tableSortType] = column.order
      }
      if (index || index === 0) {
        this.urlChangeParams[this.curTabState.tableSortTab] = index
      }

      this.index = index
      this.column = column
      const arr = []
      this.tableData.forEach(val => {
        arr.push(val)
      })
      if (column.order == 'descending') {
        arr.sort((a, b) => {
          const str1 = Array.isArray(a[column.prop]) ? a[column.prop][0] : a[column.prop]
          const str2 = Array.isArray(b[column.prop]) ? b[column.prop][0] : b[column.prop]
          if ((_.isNumber(str1)) || str1 === '') {
            return str2 - str1
          } else {
            let aObj = a[column.prop] ? a[column.prop] : a[index]
            let bObj = b[column.prop] ? b[column.prop] : b[index]
            if (!aObj) {
              const curTab = this.getCurTab()
              aObj = a[curTab.prop]
              bObj = b[curTab.prop]
            }
            let res = 0
            if (aObj && bObj) {
              const len = aObj.length < bObj.length ? aObj.length : bObj.length
              for (let i = 0; i < len; i++) {
                const char1 = aObj[i]
                const char2 = bObj[i]
                const char1Type = this.getChartType(char1)
                const char2Type = this.getChartType(char2)
                if (char1 === char2) {
                  continue
                } else {
                  if (char1Type[0] === 'zh') {
                    res = char2.localeCompare(char1)
                  } else if (char1Type[0] === 'en') {
                    res = char2.charCodeAt(0) - char1.charCodeAt(0)
                  } else {
                    res = char2 - char1
                  }
                  break
                }
              }
            }
            return res
          }
        })
        this.tableData = arr
      } else if (column.order == 'ascending') {
        arr.sort((a, b) => {
          const str1 = Array.isArray(a[column.prop]) ? a[column.prop][0] : a[column.prop]
          const str2 = Array.isArray(b[column.prop]) ? b[column.prop][0] : b[column.prop]
          if ((_.isNumber(str1)) || str1 === '') {
            return str1 - str2
          } else {
            let aObj = a[column.prop] ? a[column.prop] : a[index]
            let bObj = b[column.prop] ? b[column.prop] : b[index]
            if (!aObj) {
              const curTab = this.getCurTab()
              aObj = a[curTab.prop]
              bObj = b[curTab.prop]
            }
            let res = 0
            if (aObj && bObj) {
              const len = aObj.length < bObj.length ? aObj.length : bObj.length
              for (let i = 0; i < len; i++) {
                const char1 = aObj[i]
                const char2 = bObj[i]
                const char1Type = this.getChartType(char1)
                const char2Type = this.getChartType(char2)
                if (char1 === char2) {
                  continue
                } else {
                  if (char1Type[0] === 'zh') {
                    res = char1.localeCompare(char2)
                  } else if (char1Type[0] === 'en') {
                    res = char1.charCodeAt(0) - char2.charCodeAt(0)
                  } else {
                    res = char1 - char2
                  }
                  break
                }
              }
            }
            return res
          }
        })
        this.tableData = arr
      } else if (!column.order) {
        this.tableData = this.tableDataBackup
      }
    },
    // 切换metric：bit、packet、session
    changeMetric () {
      this.tableData = []
      this.tableDataBackup = []
      this.setShowNum(10)
      const beforeType = this.getUrlParam(this.curTabState.tabOperationBeforeType, '', true)
      if (beforeType && beforeType != operationType.thirdMenu) {
        this.urlChangeParams[this.curTabState.tabOperationBeforeType] = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      }
      this.urlChangeParams[this.curTabState.tabOperationType] = operationType.changeMetric
      const curTab = this.getCurTab()
      const label = curTab.label
      this.urlChangeParams[this.curTabState.tableMetric] = this.metric

      let queryParams = {
        orderBy: this.orderBy,
        limit: networkDefaultLimit,
        type: curTab.prop
      }
      const condition = this.getQueryCondition()
      if (condition) {
        queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: curTab.prop,
          q: condition
        }
      }
      this.changeUrlTabState()
      this.getChartData(queryParams)
    },
    handleCustomizeButton (status) {
      this.showBackground = status
      if (!this.showCustomizeTabs) {
        this.activeCustomize = 'metrics'
      }
      const tabList = this.list.filter(item => item.checked === true)
      const defaultTab = tabList.length > 0 ? tabList[0] : {}
      const columnName = this.getUrlParam(this.curTabState.thirdMenu, '')
      const columnValue = this.getUrlParam(this.curTabState.fourthMenu, '')
      if (tabList.length === 1) {
        defaultTab.disabled = true
      } else if (tabList.length > 1) {
        this.list.forEach(item => {
          item.disabled = false
          if (columnValue) {
            if (item.label === columnName) {
              // item.disabled = true
            }
          }
        })
      }
    },
    // 隐藏tabs的标题
    hideTabs (curTab) {
      // 此处的id为tab-name
      this.list.forEach(item => {
        const tabDom = document.getElementById('tab-' + item.label)
        const paneDom = document.getElementById('pane-' + item.label)
        if (tabDom) {
          tabDom.style.display = 'none'
        }
        if (paneDom) {
          if (curTab.name === item.name) {
            paneDom.style.display = ''
          }
        }
      })
    },
    // tab改变
    changeUrlTabState () {
      if (this.urlChangeParams && JSON.stringify(this.urlChangeParams) !== '{}') {
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, this.urlChangeParams)
        overwriteUrl(newUrl)
      }
      this.urlChangeParams = {}
    },
    // 激活tab修改的内容：第一列的列名，list中此tab为checked=true
    showTab (curTab) {
      if (curTab) {
        this.activeTab = ref(curTab.label)
        this.combineColumnList(curTab.name)
      }
    },
    // 配置tab：显示隐藏与顺序
    tabChange (index) {
      this.isNoData = false
      // 操作类型设置
      const beforeType = this.getUrlParam(this.curTabState.tabOperationBeforeType, '', true)
      if (beforeType != operationType.thirdMenu) {
        this.urlChangeParams[this.curTabState.tabOperationBeforeType] = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      }
      this.urlChangeParams[this.curTabState.tabOperationType] = operationType.customize
      // 获得操作tab和当前选中的所有tab
      const handleTab = this.list[index]
      const tabList = this.list.filter(item => item.checked === true)
      const defaultTab = tabList.length > 0 ? tabList[0] : {}
      // 当前操作之后，只有1个tab被选中，则这一个不允许取消选中
      const columnName = this.getUrlParam(this.curTabState.thirdMenu, '')
      const columnValue = this.getUrlParam(this.curTabState.fourthMenu, '')
      if (tabList.length === 1) {
        defaultTab.disabled = true
      } else if (tabList.length > 1) {
        this.list.forEach(item => {
          item.disabled = false
          if (columnValue) {
            if (item.label === columnName) {
              // item.disabled = true
            }
          }
        })
      }
      this.saveUserLocalConfig()
      // 如果取消tab，则如果取消的是当前选中的tab，则当前tab就需要修改为第一个默认的tab，否则不用
      const curTab = this.getCurTab()
      if (!handleTab.checked && handleTab.name === curTab.name) {
        this.setShowNum(10)
        this.urlChangeParams[this.curTabState.curTab] = tabList[0].prop
        let queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: tabList[0].prop
        }
        this.changeUrlTabState()
        // const condition = this.$store.getters.getQueryCondition
        const condition = this.getQueryCondition()
        if (condition) {
          queryParams = {
            orderBy: this.orderBy,
            limit: networkDefaultLimit,
            type: tabList[0].prop,
            q: condition
          }
        }
        this.getChartData(queryParams)
      } else {
        this.changeUrlTabState()
      }
    },
    setOperationType (operationType) {
      this.urlChangeParams[this.curTabState.tabOperationBeforeType] = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      this.urlChangeParams[this.curTabState.tabOperationType] = operationType
    },
    getTabByName (name) {
      let tab = null
      const tabGroup = this.list.filter(item => item.name === name)
      if (tabGroup && tabGroup.length > 0) {
        tab = tabGroup[0]
      }
      return tab
    },
    setBeforeTab (tab) {
      this.urlChangeParams[this.curTabState.networkOverviewBeforeTab] = tab.prop
    },
    setQueryCondition (tab, value) {
      value = value.replaceAll("'", "\\\\'")
      const queryCondition = []
      if (tab.prop === 'protocolPort') {
        const valueGroup = value.split(':')
        if (valueGroup) {
          queryCondition.push("common_l7_protocol='" + valueGroup[0] + "'")
          queryCondition.push('common_server_port=' + valueGroup[1])
        }
        this.urlChangeParams[this.curTabState.queryCondition] = queryCondition.join(' AND ')
      } else {
        if (tab.queryCondition) {
          tab.queryCondition.forEach(item => {
            queryCondition.push(item.replaceAll('$param', value))
          })
        } else {
          if (tab.dillDownProp) {
            tab.dillDownProp.forEach(item => {
              queryCondition.push(item + "='" + value + "'")
            })
          }
        }
        this.urlChangeParams[this.curTabState.queryCondition] = queryCondition.join(' OR ')
      }
    },
    getFirstCheckedTab () {
      let tab = null
      const tabObjGroup = this.list.filter(item => item.checked)
      if (tabObjGroup && tabObjGroup.length > 0) {
        tab = tabObjGroup[0]
      }
      return tab
    },
    /*
    * 点击表格第一列数据后
        1.设置beforeTab
        2.设置OperationType
        3.设置QueryCondition
        4.设置菜单：第三级，第四级名称，并保存到store中
        5.设置panel名称，表格维度类型：如ip，domain等(即查询参数中的type)
    * */
    handleTabValue (columnName, columnValue) {
      // console.log('NetworkOverview类------handleTabValue：下钻')
      // 下钻前保存当前路由状态
      this.beforeRouterPush()
      const clickTab = this.getTabByName(columnName)// 下钻后，显示的下钻tab对应的drilldownTabs
      const tabLable = clickTab.label
      const tabName = clickTab.name
      this.setBeforeTab(clickTab)
      this.setOperationType(operationType.fourthMenu)
      this.setQueryCondition(clickTab, columnValue)
      const toPanel = clickTab.panelId
      this.urlChangeParams[this.curTabState.curTab] = ''
      this.changeUrlTabState()
      const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      const tabList = this.getAllTabList()
      if (this.isDrilldown()) { // 点击之前就已经是下钻状态了
        this.list.forEach(tab => {
          if (tab.label === thirdMenu) {
            // tab.checked = true
          }
        })
        this.list = this.getDrilldownTabList(tabName)
        const curTab = this.getCurTab(clickTab)
        tabList.forEach(tab => {
          if (tab.name === curTab.name) {
            this.combineColumnList(tab.name)
          }
        })
      } else {
        const changeTab = tabList.find(item => item.name == tabName)// 下钻的tab
        this.list = changeTab.drilldownTabs
        this.list.forEach(tab => {
          const hiddenTab = tabList.find(item => item.name == tab.name)
        })
        const curTab = this.getCurTab(clickTab)
        tabList.forEach(tab => {
          if (tab.name === curTab.name) {
            this.combineColumnList(tab.name)
          }
        })
      }

      this.saveUserLocalConfig()
      // console.log(this.drillDownTableConfigs)
      let forthMenuName = ''
      if (clickTab.prop === 'qtype') {
        forthMenuName = this.dnsQtypeMapData.get(columnValue)
      } else if (clickTab.prop === 'rcode') {
        forthMenuName = this.dnsRcodeMapData.get(columnValue)
      } else {
        forthMenuName = columnValue
      }
      this.$store.getters.menuList.forEach(menu => {
        if (this.$_.isEmpty(menu.children) && menu.route) {
          if (this.$route.path === menu.route) {
            menu.columnName = tabLable
            menu.columnValue = columnValue
            this.urlChangeParams[this.curTabState.panelName] = columnValue
            this.urlChangeParams[this.curTabState.thirdMenu] = tabLable
            this.urlChangeParams[this.curTabState.dimensionType] = clickTab ? clickTab.prop : ''
            this.urlChangeParams[this.curTabState.fourthMenu] = columnValue
          }
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            if (this.$route.path === child.route) {
              child.columnName = tabLable
              child.columnValue = columnValue
              this.urlChangeParams[this.curTabState.panelName] = columnValue
              this.urlChangeParams[this.curTabState.thirdMenu] = tabLable
              this.urlChangeParams[this.curTabState.dimensionType] = clickTab ? clickTab.prop : ''
              this.urlChangeParams[this.curTabState.fourthMenu] = columnValue
            }
          })
        }
      })
      this.changeUrlTabState()
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          thirdPanel: this.curTable.panelIdOfThirdMenu,
          fourthPanel: toPanel,
          t: +new Date()
        }
      })
    },
    /**
     * 在路由跳转前，即下钻前将路由数据保存起来，确保回退和前进保留当时状态
     */
    beforeRouterPush () {
      const currentRouter = this.$_.cloneDeep(this.$route.query)
      const historyList = this.$_.cloneDeep(this.$store.getters.getRouterHistoryList)

      const tempObj = {
        t: currentRouter.t,
        query: currentRouter,
        path: this.$_.cloneDeep(this.$route.path),
        params: this.$_.cloneDeep(this.$route.params)
      }
      if (historyList.length > 0) {
        let flag = true
        historyList.forEach((item, index) => {
          if (item.t === currentRouter.t) {
            historyList[index] = tempObj
            flag = false
          }
          if (!flag) {
            return true
          }
        })
        if (flag) historyList.push(tempObj)
      } else {
        historyList.push(tempObj)
      }
      this.$store.commit('setRouterHistoryList', historyList)
    },
    handleSearchParams (columnValue) {
      columnValue = columnValue.replaceAll("'", "\\\\'")
      const queryCondition = []
      const curTab = this.getCurTab()
      if (curTab.prop === 'protocolPort') {
        const valueGroup = columnValue.split(':')
        if (valueGroup) {
          queryCondition.push("common_l7_protocol='" + valueGroup[0] + "'")
          queryCondition.push('common_server_port=' + valueGroup[1])
        }
        this.urlChangeParams[this.curTabState.queryCondition] = queryCondition.join(' AND ')
      } else {
        if (curTab.queryCondition) {
          curTab.queryCondition.forEach(item => {
            queryCondition.push(item.replaceAll('$param', columnValue))
          })
        } else {
          if (curTab.dillDownProp) {
            curTab.dillDownProp.forEach(item => {
              queryCondition.push(item + "='" + columnValue + "'")
            })
          }
        }

        this.urlChangeParams[this.curTabState.queryCondition] = queryCondition.join(' OR ')
      }
    },
    async metricChange () {
      // 需要将列设置到当前tab的"hiddenColumns": [],"disabledColumns": [],
      await this.saveUserLocalConfig()
    },
    dragstart (index) {
      this.dragIndex = index
    },
    dragenter (e, index) {
      e.preventDefault()
      if (this.dragIndex !== index) {
        const moving = this.list[this.dragIndex]
        this.list.splice(this.dragIndex, 1)
        this.list.splice(index, 0, moving)
        this.dragIndex = index
        this.saveUserLocalConfig()
      }
      // 拖拽完毕需要把数据存入userId里？？
    },
    dragover (e, index) {
      e.preventDefault()
    },
    dragMetricStart (index) {
      this.dragMetricIndex = index
    },
    dragMetricEnter (e, index) {
      e.preventDefault()
      if (this.dragMetricIndex !== index) {
        const moving = this.customTableTitles[this.dragMetricIndex]
        this.customTableTitles.splice(this.dragMetricIndex, 1)
        this.customTableTitles.splice(index, 0, moving)
        this.dragMetricIndex = index
        this.saveUserLocalConfig()
      }
    },
    dragMetricOver (e, index) {
      e.preventDefault()
    },
    clearSort () {
      const table = this.$refs['dataTable_' + this.tableSortTab]
      const tableHeaer = table
        ? (Array.isArray(table)
            ? table[0].$refs.tableHeader
            : table.$refs.tableHeader)
        : []
      const columns = tableHeaer.columns
      if (columns) {
        columns.forEach(item => {
          item.order = ''
        })
      }
      this.cancleSortArrow()
      this.column = {}
      this.index = 0
      this.tableSortColumn = ''
      this.tableSortType = ''
      this.tableSortTab = ''
      this.urlChangeParams = this.$_.omit(this.urlChangeParams, [this.curTabState.tableSortColumn, this.curTabState.tableSortType, this.curTabState.tableSortTab])
    },
    // 切换tab
    handleClick (tab) {
      this.tableData = []
      this.tableDataBackup = []
      this.setShowNum(10)
      this.clearSort()
      const tabOpeType = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      if (tabOpeType) {
        this.urlChangeParams[this.curTabState.tabOperationBeforeType] = tabOpeType
      }
      this.urlChangeParams[this.curTabState.tabOperationType] = operationType.changeTab
      // 下钻的tab觉得显示哪些tab，这些tab显示什么列，取决于tab本身
      const tabObjGroup = this.list.filter(item => item.label == tab.paneName)
      if (tabObjGroup && tabObjGroup.length > 0) {
        const curTab = tabObjGroup[0]
        this.urlChangeParams[this.curTabState.curTab] = curTab.prop
        this.combineColumnList(curTab.name)
        this.saveUserLocalConfig()
        this.tab = curTab.prop
        this.isDnsMapType = false
        if (this.tab === 'qtype') {
          this.dnsMapData = this.dnsQtypeMapData
          this.isDnsMapType = true
        } else if (this.tab === 'rcode') {
          this.dnsMapData = this.dnsRcodeMapData
          this.isDnsMapType = true
        }
        let queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: curTab.prop
        }
        const condition = this.getQueryCondition()
        if (condition) {
          queryParams = {
            orderBy: this.orderBy,
            limit: networkDefaultLimit,
            type: curTab.prop,
            q: condition
          }
        }
        this.changeUrlTabState()
        this.tableData = []
        this.tableDataBackup = []
        this.toggleLoading(true)
        this.getChartData(queryParams)
      }
    },
    getCurUrl () {
      const condition = this.getQueryCondition()
      if (condition) {
        return this.networkSearchUrl.drilldownCurUrl
      } else {
        return this.networkSearchUrl.curUrl
      }
    },
    gerCycleUrl () {
      const condition = this.getQueryCondition()
      if (condition) {
        return this.networkSearchUrl.drilldownCycleUrl
      } else {
        return this.networkSearchUrl.cycleUrl
      }
    },
    gerColumnUrl (tableColumn) {
      const condition = this.getQueryCondition()
      if (condition) {
        return tableColumn.dillDownCycleDataUrl
      } else {
        return tableColumn.cycleDataUrl
      }
    },
    handleQueryParams (extraParams) {
      let queryType = ''
      // const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      // const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')
      const name = this.getUrlParam(this.curTabState.thirdMenu, '')
      const curOperationType = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      if (this.isFourthMenu()) { // 点击的为第四级菜单
        const curTab = this.getCurTab()
        if (curTab) {
          queryType = curTab.prop
        } else {
          const checkedTab = this.list.find(item => item.checked)
          queryType = checkedTab ? checkedTab.prop : ''
        }
      } else if (this.isThirdMenu()) { // 点击的为第三级菜单
        const breadcrumbTab = this.list.find(item => item.label === name)
        queryType = breadcrumbTab ? breadcrumbTab.prop : ''
      } else if (curOperationType === operationType.changeTab) { // 切换tab
        const curTab = this.getCurTab()
        if (curTab) {
          queryType = curTab.prop
        }
      } else if (curOperationType === operationType.secondMenu || curOperationType === operationType.mainMenu) { // 点击第二级菜单，点击菜单
        this.list = this.$_.cloneDeep(this.allList)
        const curTab = this.getCurTab()
        if (curTab) {
          queryType = curTab.prop
        }
      } else {
        const curTab = this.getCurTab()
        if (curTab) {
          queryType = curTab.prop
        }
      }

      if (JSON.stringify(extraParams) === '{}') {
        extraParams = {
          type: queryType,
          orderBy: this.orderBy ? this.orderBy : 'totalBytes',
          limit: networkDefaultLimit
        }
        // const condition = this.$store.getters.getQueryCondition
        const condition = this.getQueryCondition()
        if (condition) {
          extraParams.q = condition
        }
      }
      return extraParams
    },
    handleCustomizeClick (tab) {
      this.activeCustomize = tab.paneName
    },
    tableCellStyle ({ row, column, rowIndex, columnIndex }) {
      let style = 'border-right:0px;font-size:12px;padding:7px 0 !important;border-bottom: 1px solid #ECECEC;height:41px !important;'
      if (rowIndex === this.tableData.length - 1) {
        // style = style + 'border-bottom:0px !important;'
      }
      if (columnIndex === 0) {
        style = style + 'color:#046ECA;text-align:left;'
      }
      return style
    },
    tableHeaderCellStyle ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return 'text-align:left;border-right:0px;font-size:12px;font-weight:500;padding:4px 0 !important;border-bottom: 1px solid #E2E5EC;'
      } else {
        return 'border-right:0px;font-size:12px;font-weight:500;padding:4px 0 !important;border-bottom: 1px solid #E2E5EC;'
      }
    },
    getQueryCondition () {
      return this.$route.query.queryCondition ? this.$route.query.queryCondition : ''
    },
    getUrlParam (param, defaultValue, isNumber) {
      if (isNumber) {
        return this.$route.query[param] ? Number(this.$route.query[param]) : defaultValue
      } else {
        return this.$route.query[param] ? this.$route.query[param] : defaultValue
      }
    },
    // 获取当前tab:url中的curTab，如果url中curTab为空，则从list中取第一个checked为true的tab，如果list里没有checked为true的，就选第一个tab，并更新url
    getCurTab (excludeTab) {
      const curTabProp = this.$route.query.curTab ? this.$route.query.curTab : null
      let curTab = curTabProp ? this.list.find(item => item.prop === curTabProp) : null
      if (!curTab) {
        let tabObjGroup = []
        if (excludeTab) {
          tabObjGroup = this.list.filter(item => item.checked && (item.prop !== excludeTab.prop))
        } else {
          tabObjGroup = this.list.filter(item => item.checked)
        }
        if (tabObjGroup && tabObjGroup.length > 0) {
          tabObjGroup[0].checked = true
          curTab = tabObjGroup[0]
          this.urlChangeParams[this.curTabState.curTab] = curTab.prop
          this.changeUrlTabState()
        } else {
          if (this.list && this.list.length > 0) {
            this.list[0].checked = true
            curTab = this.list[0]
            this.urlChangeParams[this.curTabState.curTab] = curTab.prop
            this.changeUrlTabState()
          }
        }
      } else {
        this.list.forEach(item => {
          if (item.name === curTab.name) {
            // item.checked = true
            // this.showTab(curTab)
          }
        })
      }
      return curTab
    },
    combineTabList (tabList, isDrillDown) {
      const listInCode = this.curTableInCode ? this.curTableInCode.tabList : []
      tabList.forEach(tab => {
        const tabName = tab ? (tab.name ? tab.name : tab) : ''
        const commonTab = this.commonTabList.find(item => item.name === tabName)
        tab.label = commonTab ? commonTab.i18n : ''
        tab.prop = commonTab ? commonTab.prop : ''
        if (!tab.hasOwnProperty('checked') || tab.checked === undefined || tab.checked === null) {
          tab.checked = tab ? tab.show : true
        }
        if (!tab.hasOwnProperty('disabled') || tab.disabled === undefined || tab.disabled === null) {
          tab.disabled = tab ? !tab.enable : false
        }
        if (!tab.hasOwnProperty('panelId') || tab.panelId === undefined || tab.panelId === null) {
          tab.panelId = tab ? tab.panelIdOfFourthMenu : null
        }
        // 代码里写死的
        const tabInCode = listInCode ? listInCode.find(item => item.label === tab.label) : {}
        tab.queryCycleTotalProp = tabInCode ? tabInCode.queryCycleTotalProp : null
        tab.dillDownProp = tabInCode ? tabInCode.dillDownProp : []
        tab.queryCondition = tabInCode ? tabInCode.queryCondition : []
      })
      // 设置drilldownTabs：未下钻状态设置，已下钻状态无需设置
      // let thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      // if (!thirdMenu) {
      const oldList = this.$_.cloneDeep(tabList)
      tabList.forEach(tab => {
        const drilldownTabFull = []
        const drilldownTabList = tab.drilldownTabs
        drilldownTabList.forEach(drilldownTab => {
          if (!drilldownTab.hasOwnProperty('name') || drilldownTab.name === undefined || drilldownTab.name === null) {
            const drilldownTabName = drilldownTab ? (drilldownTab.name ? drilldownTab.name : drilldownTab) : ''
            const fullTab = oldList.find(item => item.name === drilldownTabName)
            const drilldownTabWithAllInfo = this.$_.cloneDeep(fullTab)
            if (drilldownTabWithAllInfo) {
              const commonTab = this.commonTabList.find(item => item.name === drilldownTabName)
              drilldownTabWithAllInfo.name = drilldownTabName
              drilldownTabWithAllInfo.label = commonTab ? commonTab.i18n : ''
              drilldownTabWithAllInfo.prop = commonTab ? commonTab.prop : ''
              // if (!drilldownTabWithAllInfo.hasOwnProperty('checked') || drilldownTabWithAllInfo.checked === undefined || drilldownTabWithAllInfo.checked === null) {
              drilldownTabWithAllInfo.checked = !((tab.hiddenDrilldownTabs.indexOf(drilldownTabName) >= 0))
              // }
              // if (!drilldownTabWithAllInfo.hasOwnProperty('disabled') || drilldownTabWithAllInfo.disabled === undefined || drilldownTabWithAllInfo.disabled === null) {
              drilldownTabWithAllInfo.disabled = (tab.disabledDrilldownTabs.indexOf(drilldownTabName) >= 0)
              // }
              // 代码里写死的
              const tabInCode = listInCode ? listInCode.find(item => item.label === fullTab.label) : {}
              drilldownTabWithAllInfo.queryCycleTotalProp = tabInCode ? tabInCode.queryCycleTotalProp : null
              drilldownTabWithAllInfo.dillDownProp = tabInCode ? tabInCode.dillDownProp : []
              drilldownTabWithAllInfo.queryCondition = tabInCode ? tabInCode.queryCondition : []
              drilldownTabFull.push(drilldownTabWithAllInfo)
            }
          }
        })
        if (drilldownTabFull.length > 0) {
          tab.drilldownTabs = drilldownTabFull
        }
      })
    },
    getColumnsByTab (tab) {
      let columns = []
      if (tab && tab.hasMetricSearch === true) {
        const columnsForMetric = tab.metrics.find(metric => metric.name === this.metric)
        columns = columnsForMetric ? columnsForMetric.columns : []
      } else {
        columns = tab.columns
      }

      return columns
    },
    setColumnsByTab (tab, columns) {
      if (tab && tab.hasMetricSearch === true) {
        const columnsForMetric = tab.metrics.find(metric => metric.name === this.metric)
        columnsForMetric.columns = columns
      } else {
        tab.columns = tab.columns
      }
    },
    combineColumnList (tabName) {
      const allTabs = this.getAllTabList()
      const curTab = allTabs.find(item => item.name === tabName)
      const customTableTitles = this.getColumnsByTab(curTab)
      const hiddenColumnList = this.curTable ? this.curTable.hiddenColumns : []
      const disabledColumnList = this.curTable ? this.curTable.disabledColumns : []
      const newColumnList = []
      if (customTableTitles && customTableTitles.length > 0) {
        customTableTitles.forEach(column => {
          // if (!column.hasOwnProperty('checked') || column.checked === undefined || column.checked === null) {
          const columnName = column ? (column.name ? column.name : column) : ''
          // 配置的内容
          const commonColumn = this.commonColumnList.find(item => item.name === columnName)
          column = {}
          column.name = commonColumn ? commonColumn.name : ''
          column.label = commonColumn ? commonColumn.i18n : ''
          column.prop = commonColumn ? commonColumn.prop : ''
          column.unit = commonColumn ? commonColumn.unit : null
          column.checked = !((hiddenColumnList.indexOf(columnName) >= 0))
          column.disabled = (disabledColumnList.indexOf(columnName) >= 0)
          column.columnType = commonColumn ? commonColumn.columnType : ''
          // 代码里写死的
          const listInCode = this.curTableInCode ? this.curTableInCode.column : []
          const columnInCode = listInCode ? listInCode.find(item => item.label === column.label) : {}
          column.cycleDataUrl = columnInCode ? columnInCode.cycleDataUrl : ''
          column.isInMainUrl = columnInCode ? columnInCode.isInMainUrl : false
          column.dillDownCycleDataUrl = columnInCode ? columnInCode.dillDownCycleDataUrl : ''
          column.cycle = columnInCode ? columnInCode.cycle : 0
          column.scoreType = columnInCode ? columnInCode.scoreType : 0
          column.isScoreColumn = columnInCode ? columnInCode.isScoreColumn : true
          newColumnList.push(column)
          // }
        })
        if (newColumnList && newColumnList.length > 0) {
          this.setColumnsByTab(curTab, newColumnList)
          this.customTableTitles = newColumnList
        } else {
          this.customTableTitles = customTableTitles
        }
      }
    },
    /*
    async getUserLocalConfig () {
      const userLocalCongfig = await db[dbDrilldownTableConfig].get({ id: this.userId })
      if (userLocalCongfig) {
        return userLocalCongfig.config
      } else {
        return null
      }
    }, */
    isDrilldown () {
      if (this.getUrlParam(this.curTabState.fourthMenu)) {
        return true
      } else {
        return false
      }
    },
    isSetDrilldownTabInfo (tabList) {
      let isSetDrilldownTabInfo = false
      if (tabList && tabList.length > 0) {
        const drilldownTab = tabList[0].drilldownTabs
        if (drilldownTab && drilldownTab.length > 0 && drilldownTab.hasOwnProperty('name')) {
          isSetDrilldownTabInfo = true
        }
      }
      return isSetDrilldownTabInfo
    },
    async saveUserLocalConfig () {
      let curUserConfigs = await readDrilldownTableConfigByUser()
      const hiddenColumns = this.getHiddenColumnNameGroup()
      this.curTable.hiddenColumns = hiddenColumns
      if (curUserConfigs && curUserConfigs.length > 0) { // 当前用户存在缓存配置
        const currentRouteConfig = curUserConfigs.find(config => config.route === this.tableType)
        if (currentRouteConfig) { // 用户的缓存中存在当前路径对应的下钻表格对应的配置
          const currentTableConfig = currentRouteConfig.tables.find(table => table.id === this.tableType)
          if (currentTableConfig) {
            currentTableConfig.hiddenColumns = hiddenColumns
            currentTableConfig.tabs.forEach(tab => {
              const newTab = this.curTable.tabs.find(newTab => newTab.name === tab.name)
              tab.hiddenDrilldownTabs = this.getHiddenDrilldownTabNameGroup(newTab)
              tab.checked = newTab.checked
            })
          }
        } else { // 用户的缓存中不存在当前路径对应的下钻表格对应的配置
          curUserConfigs.push(this.handleInitDrilldownTableConfig())
        }
      } else { // 当前用户不存在缓存配置
        curUserConfigs = []
        curUserConfigs.push(this.handleInitDrilldownTableConfig())
      }
      // 更新缓存中的配置
      await db[dbDrilldownTableConfig].put({
        id: this.userId,
        config: this.$_.cloneDeep(curUserConfigs)
      })
      // 更新使用的配置
      const curCfg = this.drillDownTableConfigs.find(cfg => cfg.route === this.tableType)
      if (curCfg) {
        const curTable = curCfg.tables.find(table => table.id === this.tableType)
        curTable.hiddenColumns = hiddenColumns
        curTable.tabs.forEach(tab => {
          const newTab = this.curTable.tabs.find(newTab => newTab.name === tab.name)
          tab.hiddenDrilldownTabs = this.getHiddenDrilldownTabNameGroup(newTab)
        })
      }
    },
    handleInitDrilldownTableConfig () {
      let config = {}
      const hiddenColumns = this.getHiddenColumnNameGroup()
      config = {
        route: this.tableType,
        tables: [{
          id: this.tableType,
          hiddenColumns: hiddenColumns,
          tabs: []
        }]
      }
      this.curTable.tabs.forEach(tab => {
        const hiddenTabsConfig = {
          name: tab.name,
          hiddenDrilldownTabs: this.getHiddenDrilldownTabNameGroup(tab),
          checked: tab.checked
        }
        config.tables[0].tabs.push(hiddenTabsConfig)
      })
      return config
    },
    getHiddenColumnNameGroup () {
      const hiddenColumns = []
      this.customTableTitles.forEach(column => {
        if (column.checked === false) {
          hiddenColumns.push(column.name)
        }
      })
      /*
      if (hiddenColumns.length === 0) {
        hiddenColumns = this.curTable.hiddenColumns
      } */
      return hiddenColumns
    },
    getHiddenDrilldownTabNameGroup (newTab) {
      let hiddenDrilldownTabs = []
      if (newTab && newTab.drilldownTabs) {
        newTab.drilldownTabs.forEach(drilldownTab => {
          if (drilldownTab.checked === false) {
            hiddenDrilldownTabs.push(drilldownTab.name)
          }
        })
        if (hiddenDrilldownTabs.length === 0) {
          hiddenDrilldownTabs = newTab.hiddenDrilldownTabs
        }
      }
      return hiddenDrilldownTabs
    },
    getAllTabList () {
      let tabs = []
      if (this.curTable.tabs) {
        tabs = this.curTable.tabs
      }
      return tabs
    },
    getDrilldownTabList (name) {
      let tabs = []
      if (this.curTable.tabs) {
        const firstTabs = this.curTable.tabs
        if (firstTabs) {
          firstTabs.forEach(tab => {
            if (tab.name === name) {
              tabs = tab.drilldownTabs
            }
          })
        }
      }
      return tabs
    },
    initMetric () {
      if (this.metric === 'Bits/s') {
        this.columnNameGroup = this.curTableInCode ? this.curTableInCode.bytesColumnNameGroup : []
        this.cycleColumnNameGroup = this.curTableInCode ? this.curTableInCode.bytesCycleColumnNameGroup : []
        this.orderBy = 'totalBytes'
        this.metricUnit = 'bytes'
      } else if (this.metric === 'Packets/s') {
        this.columnNameGroup = this.curTableInCode ? this.curTableInCode.packetsColumnNameGroup : []
        this.cycleColumnNameGroup = this.curTableInCode ? this.curTableInCode.packetsCycleColumnNameGroup : []
        this.orderBy = 'totalPackets'
        this.metricUnit = 'packets'
      } else if (this.metric === 'Sessions/s') {
        this.columnNameGroup = this.curTableInCode ? this.curTableInCode.sessionsColumnNameGroup : []
        this.cycleColumnNameGroup = this.curTableInCode ? this.curTableInCode.sessionsCycleColumnNameGroup : []
        this.orderBy = 'sessions'
        this.metricUnit = 'sessions'
      }
    }
  },
  async mounted () {
    console.log('mounted start...')
    // 是否需要dns的qtype和rcode的数据字典
    this.dnsQtypeMapData = await getDnsMapData('dnsQtype')
    this.dnsRcodeMapData = await getDnsMapData('dnsRcode')
    this.userId = localStorage.getItem(storageKey.userId)
    this.drillDownTableConfigs = await combinDrilldownTableWithUserConfig()
    this.tableType = this.$route.params ? this.$route.params.typeName : 'networkOverview'
    this.curTableInCode = this.networkTable[this.tableType] ? this.networkTable[this.tableType] : this.networkTable.networkOverview
    // 表格状态初始化(url)
    this.showRecordNum = Number(this.getUrlParam(this.curTabState.tableShowMore, 10))
    this.tableSortColumn = this.getUrlParam(this.curTabState.tableSortColumn, '')
    this.tableSortType = this.getUrlParam(this.curTabState.tableSortType, '')
    this.tableSortTab = this.getUrlParam(this.curTabState.tableSortTab, '')
    const currentTableConfig = this.drillDownTableConfigs.find(config => config.route === this.tableType)
    // 开始设置当前table，当前tab，当前tab对应的列等信息
    this.commonTabList = currentTableConfig ? currentTableConfig.tabs : []
    this.commonColumnList = currentTableConfig ? currentTableConfig.columns : []
    this.tables = currentTableConfig ? currentTableConfig.tables : []
    if (this.tables && this.tables.length > 0) {
      const curTableOldConfig = this.tables.find(table => table.id === this.tableType)
      this.curTable = curTableOldConfig
      if (this.curTable) {
        let curTab = null
        if (this.isDrilldown()) { // 下钻状态
          const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
          const tabList = this.getAllTabList()
          if (tabList && tabList.length > 0) {
            if (!this.isSetDrilldownTabInfo(tabList)) { // 设否设置了下钻的详细信息
              this.combineTabList(tabList, true)
            }
            const drilldownTab = tabList.find(item => item.label === thirdMenu)
            this.list = drilldownTab ? drilldownTab.drilldownTabs : []
            this.allList = this.$_.cloneDeep(tabList)// 备份所有配置，下钻及返回时使用
            curTab = this.getCurTab()// 初始化完list，才能正确执行
            const curTabColumns = tabList.find(item => item.prop === curTab.prop)
            this.combineColumnList(curTabColumns.name)
            this.activeTab = ref(curTab.label)
          }
        } else { // 非下钻状态
          this.list = this.getAllTabList()
          if (!this.isSetDrilldownTabInfo(this.list)) { // 是否设置了下钻的详细信息
            this.combineTabList(this.list, true)
          }
          this.allList = this.$_.cloneDeep(this.list)// 备份所有配置，下钻及返回时使用
          if (this.list && this.list.length > 0) {
            curTab = this.getCurTab()// 初始化完list，才能正确执行
            this.combineColumnList(curTab.name)
            this.activeTab = ref(curTab.label)
          }
        }
        if (curTab && curTab.prop) {
          const tabName = curTab.prop
          this.isDnsMapType = false
          if (tabName === 'qtype') {
            this.dnsMapData = this.dnsQtypeMapData
            this.isDnsMapType = true
          } else if (tabName === 'rcode') {
            this.dnsMapData = this.dnsRcodeMapData
            this.isDnsMapType = true
          }
        }
        this.activeCustomize = ref('tabs')
        this.networkSearchUrl = this.curTable.url
        // let metric = this.getUrlParam(this.curTabState.tableMetric, 'Bits/s')
        this.initMetric()
        this.isOnlyRead = this.curTable.isOnlyRead ? this.curTable.isOnlyRead : false
        this.showUnit = this.curTable.showUnit ? this.curTable.showUnit : false
        if (this.curTableInCode.defaultOrderBy) {
          this.orderBy = this.curTableInCode.defaultOrderBy
        }
      }
    }
    this.saveUserLocalConfig()
    this.getChartData()
  },
  setup (props) {
  },
  unmounted () {
    this.isNoData = false
  }
}
</script>
