<template>
  <div class="tabs" :style="showCustomizeTabs ? (tableData.length > 10 && showRecordNum === 10 ? 'height: calc(100% - 40px);'
                                                                                      : 'height: calc(100% - 2px)')
                                     : (tableData.length > 10 && showRecordNum === 10 ? 'height: calc(100% - 64px);'
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
            <template v-for="(item,index) in customTableTitles">
              <el-table-column
                      v-if="item.checked"
                      sortable="custom"
                      align="center"
                      :prop="item.prop"
                      class="data-column"
                      :ref="item.prop"
              >
                <template #header >
                  <span class="data-column__span" >{{$t(item.label)}}</span>
                </template>
                <template  #default="scope" :column="item">
                  <template v-if="item.columnType === tableColumnType.chainRatio"  >
                    <div class="data-total" >
                      <div class="data-value">
                        {{scope.row[item.prop]?((scope.row[item.prop][0]||scope.row[item.prop][0]===0)? unitConvert(scope.row[item.prop][0], unitTypes.number).join(' ') : '-'):'' }}
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
                    <div class="data-click" @click="handleTabValue(item.label,scope.row['tab'])">{{scope.row['tab']}}</div>
                  </template>
                  <template v-else-if="item.prop === 'score'" >
                    {{scope.row[item.prop] ? unitConvert(scope.row[item.prop], unitTypes.number).join(' ') : '0'}}
                  </template>
                  <template v-else>
                    {{scope.row[item.prop] ? unitConvert(scope.row[item.prop], unitTypes.number).join(' ') : '-'}}
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
      <div class="search-select"  v-if="hasMetricSearch">
        <span>{{$t('network.metric')}}:</span>
        <el-select v-model="metric"
                   class="option__select select-column"
                   popper-class="common-select"
                   :popper-append-to-body="false"
                   key="tabMetric"
                   @change="changeMetric"
                   size="mini">
          <el-option
                  v-for="item in options"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
          />
        </el-select>
      </div>
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
          <el-tab-pane :label="$t('network.metric')" name="metrics" width="50%" >
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
import { operationType, unitTypes, networkTable, tableColumnType, networkDefaultLimit, curTabState, storageKey } from '@/utils/constants'
import { get } from '@/utils/http'
import unitConvert from '@/utils/unit-convert'
import { getChainRatio, computeScore, urlParamsHandler, overwriteUrl } from '@/utils/tools'
import { getSecond } from '@/utils/date-util'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { useRoute } from 'vue-router'

export default {
  name: 'NetworkOverviewTabs',
  data () {
    return {
      dragIndex: '',
      dragMetricIndex: '',
      metric: 'Bits/s',
      orderBy: 'bytesTotal',
      tab: 'ip',
      unitConvert,
      unitTypes,
      networkTable,
      isNoData: false,
      options: [
        {
          value: 'Bits/s',
          label: 'Bits/s'
        },
        {
          value: 'Packets/s',
          label: 'Packets/s'
        },
        {
          value: 'Sessions/s',
          label: 'Sessions/s'
        }
      ],
      customTableTitlesForTab: [],
      customTableTitles: [],
      commonTabList: [],
      commonColumnList: [],
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
      curTableInCode: {}, // 代码中的配置
      tableType: '',
      hasMetricSearch: true,
      activeTab: '',
      activeCustomize: '',
      networkSearchUrl: {},
      column: {},
      index: 0,
      chartData: [],
      tableSortColumn: '',
      tableSortType: '',
      tableSortTab: ''
    }
  },
  props: {
    timeFilter: Object,
    chart: Object
  },
  components: {
    ChartNoData
  },
  watch: {
    /* chartData: {
      deep: true,
      handler (n) {
        if (this.chartData) {
          this.initData()
        }
      }
    }, */
    list: {
      deep: true,
      handler (n) {
        if (this.hasMetricSearch) {
          if (this.metricsList && this.metricsList.length > 0) {
            this.metricsList.forEach(metric => {
              if (metric.name != this.metric) {
                // metric.tabs = this.list
                metric.tabs.forEach(metricTabItem => {
                  const newConfig = this.list.find(item => item.name === metricTabItem.name)
                  // metricTabItem.show = newConfig?newConfig.checked:true
                  // metricTabItem.checked = newConfig?newConfig.checked:true
                })
              }
            })
          }
        }
      }
    },
    timeFilter: {
      deep: true,
      handler (n) {
        console.log('watch')
        const curTab = this.getCurTab()
        let queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: curTab.prop
        }
        // const condition = this.$store.getters.getQueryCondition
        const condition = this.getQueryCondition()
        if (condition) {
          queryParams = {
            orderBy: this.orderBy,
            limit: networkDefaultLimit,
            type: curTab.prop,
            q: condition
          }
        }
        this.getChartData(queryParams)
      }
    }
  },
  computed: {
    tableClass () {
      console.log('computed')
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
      try {
        this.initState()
        // const chartParams = this.chart.params
        this.queryParams = {
          ...this.handleQueryParams(extraParams),
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime)
        }
        const requestUrl = this.getCurUrl()
        get(requestUrl, this.queryParams).then(response => {
          if (response.code === 200) {
            this.chartData = response.data.result
            this.initData()
          } else {
            this.isNoData = true
            this.toggleLoading(false)
          }
        })
      } catch (e) {
        console.error(e)
      }
    },
    cancleSortArrow () {
      // 取消表格排序高亮的箭头
      if (this.column.prop) {
        const table = this.$refs['dataTable_' + this.index]
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
      const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')
      return thirdMenu && !fourthMenu
    },
    isFourthMenu () { // 当前是否为4级
      const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')
      return thirdMenu && fourthMenu
    },
    initState () {
      let curTab = this.getCurTab()
      if (curTab) { // 显示当前tab
        const realTab = this.list.find(item => item.label === curTab.label)
        if (realTab) {
          realTab.checked = true
        }
        this.showTab(curTab)
      }
      /*
      else {// 没有选中任何tab时，默认选中第一个
        const tabList = this.list.filter(item => item.checked === true)
        if (tabList.length > 0) {
          tabList[0].checked = true
          this.showTab(tabList[0])
        }else {
          this.list[0].checked = true
          this.showTab(this.list[0])
        }
      } */

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
      const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')
      if (thirdMenu && fourthMenu) {
        this.list.forEach(item => {
          if (item.label === thirdMenu) {
            item.checked = false
          }
        })
        // this.$store.commit('setNetworkOverviewTabList', this.list)
      } else if (thirdMenu && !fourthMenu) {
        this.list.forEach(item => {
          if (item.label === thirdMenu) {
            item.checked = true
          }
        })
        // this.$store.commit('setNetworkOverviewTabList', this.list)
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

      if (this.hasMetricSearch && this.metric === 'Sessions/s') {
        this.columnNameGroup = this.curTable.sessionsColumnNameGroup
        this.cycleColumnNameGroup = this.curTable.sessionsCycleColumnNameGroup
        this.orderBy = 'sessions'
        this.metricUnit = 'sessions'
        /*
        let totalChecked = true
        this.customTableTitles.forEach(item => {
          if (item.prop === 'total') {
            totalChecked = item.checked
          }
        })
        const totalColumn = this.customTableTitles.filter(item => item.prop === 'total')
        this.customTableTitles = [
          { label:curTab.label, prop: 'tab', checked: true, tabColumn: true, columnType: this.curTable.column[0].columnType },
          { label: 'network.total', prop: 'total', checked: totalChecked, tabColumn: false, columnType: this.curTable.column[1].columnType, cycleDataUrl: totalColumn ? totalColumn.cycleDataUrl : '', isInMainUrl: true }
        ] */
      }

      // this.showCustomizeTabs = true
      // this.setShowNum(10)
      const curOperationType = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      const beforeOperationType = this.getUrlParam(this.curTabState.tabOperationBeforeType, '', true)
      if (this.isFourthMenu()) { // 点击的为第四级菜单
        curTab = this.getCurTab()
        if (curTab) {
          this.showTab(curTab)
          this.changeUrlTabState(this.curTabState.curTab, curTab.prop)// curTab改变了，所有要更新
        }
        this.showCustomizeTabs = true
        // this.setShowNum(10)
      } else if (this.isThirdMenu()) { // 点击的为第三级菜单
        // const name = this.$store.getters.getBreadcrumbColumnName
        const name = this.getUrlParam(this.curTabState.thirdMenu, '')
        // const networkTabList = []
        this.list.forEach(item => {
          if (item.label === name) {
            item.checked = true
          }
          // networkTabList.push(item)
        })
        // this.$store.commit('setNetworkOverviewTabList', networkTabList)
        const breadcrumbColumnTab = this.list.find(item => item.label === name)
        this.changeUrlTabState(this.curTabState.curTab, breadcrumbColumnTab.prop)

        this.hideTabs(breadcrumbColumnTab)
        // this.customTableTitles[0].label = breadcrumbColumnTab.label
        this.combineColumnList(breadcrumbColumnTab.columns)
        this.setUserConfig()
        this.showCustomizeTabs = false
        // this.setShowNum(10)
      } else if (curOperationType === operationType.changeTab) { // 切换tab
        // if (curTab) { // tab切换
        // this.showTab(curTab)//???????
        // }
        this.showCustomizeTabs = true
        // this.setShowNum(10)
      } else if (curOperationType === operationType.secondMenu || curOperationType === operationType.mainMenu) { // 点击的为第二级菜单、或者点击菜单进入、
        // this.list = this.$_.cloneDeep(this.curTable.tabList)
        this.list = this.$_.cloneDeep(this.allList)
        this.setUserConfig()
        // this.$store.commit('setNetworkOverviewTabList', this.list)
        if (curTab) {
          this.showTab(curTab)
          this.changeUrlTabState(this.curTabState.curTab, curTab.prop)
        }
        if (thirdMenu && fourthMenu) {
          this.$nextTick(() => {
            this.list.forEach(item => {
              if (item.label === thirdMenu) {
                item.checked = false
              }
            })
          })
        } else if (thirdMenu && !fourthMenu) {
          this.list.forEach(item => {
            if (item.label === thirdMenu) {
              item.checked = true
              this.$nextTick(() => {
                this.hideTabs(item)
              })
              // this.customTableTitles[0].label = item.label
              this.combineColumnList(item.columns)
              this.setUserConfig()
            }
          })
          this.activeTab = ''
        }
        this.list = Object.assign({}, this.list)
        // this.$store.commit('setNetworkOverviewTabList', this.list)
        this.showCustomizeTabs = true
      } else if (curOperationType === operationType.changeMetric) { // 切换metric
        // if (beforeOperationType === operationType.thirdMenu) {
        if (this.isThirdMenu()) {
          this.hideTabs(curTab)
          // this.customTableTitles[0].label = curTab.label
          this.combineColumnList(curTab.columns)
          this.setUserConfig()
          this.showCustomizeTabs = false
        }
      } else if (curOperationType === operationType.customize) { // customize
        // if (beforeOperationType === operationType.thirdMenu) {
        if (this.isThirdMenu()) {
          this.hideTabs(curTab)
          // this.customTableTitles[0].label = curTab.label
          this.combineColumnList(curTab.columns)
          this.setUserConfig()
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
                if (curTab.label === item.label) {
                  paneDom.style.display = ''
                }
              }
            })
            this.showTab(curTab)
            this.showCustomizeTabs = true
          })
        }
      }
    },
    initData () {
      const tabList = []
      const curTab = this.getCurTab()
      const tableDataTmp = this.chartData.map(item => {
        tabList.push(item[curTab.prop])
        const otherData = { tab: item[curTab.prop] }
        Object.keys(this.columnNameGroup).forEach(i => {
          otherData[i] = item[this.columnNameGroup[i]]
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
        const conditionStr = tabList.filter(item => item != '')
        queryParams.params = conditionStr.toString()
        queryParams.type = curTab.prop
      }

      let cycleTotalList = []
      const condition = this.getQueryCondition()
      if (condition) {
        queryParams.q = condition
      }

      const self = this
      if (this.customTableTitles) {
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
                        trendPercent = Math.round(Math.abs(chainRatio) * 100)
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
                  item[tableColumn.prop] = [item[tableColumn.prop] ? item[tableColumn.prop] : '', trend, trendPercent]
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
              let scoreNum = 0
              this.customTableTitles.forEach(tableColumn => {
                if (tableColumn.columnType === tableColumnType.chainRatio && !tableColumn.isInMainUrl) {
                  scoreNum++
                  get(self.gerColumnUrl(tableColumn), queryParams).then(response => {
                    if (response.code === 200) {
                      const columnList = response.data.result
                      self.tableData.forEach((item, i) => {
                        const data = columnList.find(i => i[curTab.prop] === item.tab)
                        if (data) {
                          item[tableColumn.prop] = data[self.columnNameGroup[tableColumn.prop]]
                          let score = 0
                          if (data) {
                            score = computeScore(data, tableColumn.scoreType)
                          }
                          item.scoreGroup = item.scoreGroup ? [...item.scoreGroup, score] : [score]
                        } else {
                          item.scoreGroup = item.scoreGroup ? [...item.scoreGroup, 0] : [0]
                        }
                        if (scoreNum >= 5) {
                          let score = 0
                          item.scoreGroup.forEach(i => {
                            score = Number(score) + Number(i)
                          })
                          score = Math.ceil(score * 6)
                          if (score > 6) {
                            score = 6
                          }
                          item.score = score || 0
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
                                  trendPercent = Math.round(Math.abs(chainRatio) * 100)
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
                              item[tableColumn.prop] = [item[tableColumn.prop] ? item[tableColumn.prop] : '', trend, trendPercent]
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
      }
    },
    showMore () {
      this.setShowNum(50)
      this.sortChange(this.column, this.index)// 当前选中的tab？？？？
    },
    setShowNum (num) {
      this.showRecordNum = Number(num)
      this.changeUrlTabState(curTabState.tableShowMore, this.showRecordNum)
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
      this.changeUrlTabState(this.curTabState.tableSortColumn, column.prop)
      this.changeUrlTabState(this.curTabState.tableSortType, column.order)
      this.changeUrlTabState(this.curTabState.tableSortTab, index)
      this.index = index
      this.column = column
      const arr = []
      this.tableData.slice(0, this.showRecordNum).forEach(val => {
        arr.push(val)
      })
      if (column.prop != 'tab') {
        if (column.order == 'descending') {
          arr.sort((a, b) => {
            const str1 = Array.isArray(a[column.prop]) ? a[column.prop][0] : a[column.prop]
            const str2 = Array.isArray(b[column.prop]) ? b[column.prop][0] : b[column.prop]
            return str2 - str1
          })
          if (this.tableData.length - 1 > this.showRecordNum) {
            this.tableData = arr.concat(this.tableDataBackup.slice(this.showRecordNum))
          } else {
            this.tableData = arr
          }
        } else if (column.order == 'ascending') {
          arr.sort((a, b) => {
            const str1 = Array.isArray(a[column.prop]) ? a[column.prop][0] : a[column.prop]
            const str2 = Array.isArray(b[column.prop]) ? b[column.prop][0] : b[column.prop]
            return str1 - str2
          })
          if (this.tableData.length - 1 > this.showRecordNum) {
            this.tableData = arr.concat(this.tableDataBackup.slice(this.showRecordNum))
          } else {
            this.tableData = arr
          }
        } else if (!column.order) {
          this.tableData = this.tableDataBackup
        }
      } else {
        if (column.order == 'descending') {
          arr.sort((a, b) => {
            const aObj = a[column.prop]
            const bObj = b[column.prop]
            let res = 0
            for (let i = 0; ;i++) {
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
            return res
          })
          if (this.tableData.length - 1 > this.showRecordNum) {
            this.tableData = arr.concat(this.tableDataBackup.slice(this.showRecordNum))
          } else {
            this.tableData = arr
          }
        } else if (column.order == 'ascending') {
          arr.sort((a, b) => {
            const aObj = a[column.prop]
            const bObj = b[column.prop]
            let res = 0
            for (let i = 0; ;i++) {
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
            return res
          })
          if (this.tableData.length - 1 > this.showRecordNum) {
            this.tableData = arr.concat(this.tableDataBackup.slice(this.showRecordNum))
          } else {
            this.tableData = arr
          }
        } else if (!column.order) {
          this.tableData = this.tableDataBackup
        }
      }
    },
    changeMetric () {
      this.tableData = []
      this.tableDataBackup = []
      this.setShowNum(10)
      const beforeType = this.getUrlParam(this.curTabState.tabOperationBeforeType, '', true)
      // if (beforeType != operationType.thirdMenu) {
      if (beforeType != operationType.thirdMenu) {
        this.changeUrlTabState(this.curTabState.tabOperationBeforeType, this.getUrlParam(this.curTabState.tabOperationType, '', true))
      }
      this.changeUrlTabState(this.curTabState.tabOperationType, operationType.changeMetric)
      const curTab = this.getCurTab()
      const label = curTab.label
      this.changeUrlTabState(this.curTabState.tableMetric, this.metric)

      // 1:先根据metric获得tabs，再根据当前tab，获得columns，再进行数据组装？？？

      if (this.metricsList && this.metricsList.length > 0) {
        const metricTab = this.metricsList.find(metric => metric.name === this.metric)
        this.list = metricTab ? metricTab.tabs : []
        this.networkTabList = metricTab ? metricTab.tabs : []
        this.combineTabList()
        // this.allList = this.$_.cloneDeep(this.list)//备份所有配置，下钻及返回时使用
        this.customTableTitles = this.list ? this.list[0].columns : []// 需要获得当前tab的列:默认第一个tab的列
        this.combineColumnList(this.customTableTitles)
        this.setUserConfig()
      }

      if (this.metric === 'Bits/s') {
        this.columnNameGroup = this.curTable.bytesColumnNameGroup
        this.cycleColumnNameGroup = this.curTable.bytesCycleColumnNameGroup
        this.orderBy = 'bytesTotal'
        this.metricUnit = 'bytes'
        /*
        const titleGroup = []
        if (this.customTableTitles.length === 2) {
          //this.curTable.column.forEach((item, index) => {
          this.curTable.columns.forEach((item, index) => {
            if (item.tabColumn) {
              //item.label = label
            }
            if (index === 1) {
              item.checked = this.customTableTitles[1].checked
            }
            titleGroup.push(item)
          })
        } else {
          this.customTableTitles.forEach(item => {
            if (item.tabColumn) {
              //item.label = label
            }
            titleGroup.push(item)
          })
        }
        this.customTableTitles = titleGroup */
      } else if (this.metric === 'Packets/s') {
        this.columnNameGroup = this.curTable.packetsColumnNameGroup
        this.cycleColumnNameGroup = this.curTable.packetsCycleColumnNameGroup
        this.orderBy = 'packetsTotal'
        this.metricUnit = 'packets'
        /*
        const titleGroup = []
        if (this.customTableTitles.length === 2) {
          this.curTable.columns.forEach((item, index) => {
            if (item.tabColumn) {
              item.label = label
            }
            if (index === 1) {
              item.checked = this.customTableTitles[1].checked
            }
            titleGroup.push(item)
          })
        } else {
          this.customTableTitles.forEach(item => {
            if (item.tabColumn) {
              item.label = label
            }
            titleGroup.push(item)
          })
        }
        this.customTableTitles = titleGroup
        */
      } else if (this.metric === 'Sessions/s') {
        this.columnNameGroup = this.curTable.sessionsColumnNameGroup
        this.cycleColumnNameGroup = this.curTable.sessionsCycleColumnNameGroup
        this.orderBy = 'sessions'
        this.metricUnit = 'sessions'
        /*
        let totalChecked = true
        this.customTableTitles.forEach(item => {
          if (item.prop === 'total') {
            totalChecked = item.checked
          }
        })
        const totalColumn = this.customTableTitles.filter(item => item.prop === 'total')
        this.customTableTitles = [
          { label: label, prop: 'tab', checked: true, tabColumn: true, columnType: this.curTable.column[0].columnType },
          { label: 'network.total', prop: 'total', checked: totalChecked, tabColumn: false, columnType: this.curTable.column[1].columnType, cycleDataUrl: totalColumn ? totalColumn.cycleDataUrl : '', isInMainUrl: true }
        ]
        */
      }
      let queryParams = {
        orderBy: this.orderBy,
        limit: networkDefaultLimit,
        type: curTab.prop
      }
      // const condition = this.$store.getters.getQueryCondition
      const condition = this.getQueryCondition()
      if (condition) {
        queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: curTab.prop,
          q: condition
        }
      }
      this.getChartData(queryParams)
    },
    handleCustomizeButton (status) {
      this.showBackground = status
      if (!this.showCustomizeTabs) {
        this.activeCustomize = 'metrics'
      }
      const tabList = this.list.filter(item => item.checked === true)
      const defaultTab = tabList.length > 0 ? tabList[0] : {}
      // const columnName = this.$store.getters.getBreadcrumbColumnName
      const columnName = this.getUrlParam(this.curTabState.thirdMenu, '')
      // const columnValue = this.$store.getters.getBreadcrumbColumnValue
      const columnValue = this.getUrlParam(this.curTabState.fourthMenu, '')
      if (tabList.length === 1) {
        defaultTab.disabled = true
      } else if (tabList.length > 1) {
        this.list.forEach(item => {
          item.disabled = false
          if (columnValue) {
            if (item.label === columnName) {
              item.disabled = true
            }
          }
        })
        // this.$store.commit('setNetworkOverviewTabList', this.list)
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
          if (curTab.label === item.label) {
            paneDom.style.display = ''
          }
        }
      })
    },
    // tab改变
    changeUrlTabState (param, value) {
      if (value != null && value != undefined) {
        const { query } = this.$route
        const newQuery = {}
        newQuery[param] = value
        const newUrl = urlParamsHandler(window.location.href, query, newQuery)
        overwriteUrl(newUrl)
      }
    },
    // 激活tab修改的内容：第一列的列名，list中此tab为checked=true
    showTab (curTab) {
      if (curTab) {
        this.activeTab = ref(curTab.label)
        // this.customTableTitles[0].label = curTab.label
        this.combineColumnList(curTab.columns)
        this.setUserConfig()
      }
    },
    tabChange (index) {
      this.isNoData = false
      // 操作类型设置
      // const beforeType = this.$store.getters.getTabOperationBeforeType
      const beforeType = this.getUrlParam(this.curTabState.tabOperationBeforeType, '', true)
      if (beforeType != operationType.thirdMenu) {
        // this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
        this.changeUrlTabState(this.curTabState.tabOperationBeforeType, this.getUrlParam(this.curTabState.tabOperationType, '', true))
      }
      // this.$store.commit('setTabOperationType', operationType.customize)
      this.changeUrlTabState(this.curTabState.tabOperationType, operationType.customize)
      // 获得操作tab和当前选中的所有tab
      const handleTab = this.list[index]
      const tabList = this.list.filter(item => item.checked === true)
      const defaultTab = tabList.length > 0 ? tabList[0] : {}
      // 当前操作之后，只有1个tab被选中，则这一个不允许取消选中
      // const columnName = this.$store.getters.getBreadcrumbColumnName
      const columnName = this.getUrlParam(this.curTabState.thirdMenu, '')
      // const columnValue = this.$store.getters.getBreadcrumbColumnValue
      const columnValue = this.getUrlParam(this.curTabState.fourthMenu, '')
      if (tabList.length === 1) {
        defaultTab.disabled = true
      } else if (tabList.length > 1) {
        this.list.forEach(item => {
          item.disabled = false
          if (columnValue) {
            if (item.label === columnName) {
              item.disabled = true
            }
          }
        })
        // this.$store.commit('setNetworkOverviewTabList', this.list)
      }
      // 如果有metric切换，则需要更新其它metric的tabs
      if (this.hasMetricSearch) {
        if (this.metricsList && this.metricsList.length > 0) {
          this.metricsList.forEach(metric => {
            if (metric.name != this.metric) {
              // metric.tabs = this.list
              metric.tabs.forEach(metricTabItem => {
                const newConfig = this.list.find(item => item.name === metricTabItem.name)
                metricTabItem.show = newConfig ? newConfig.checked : true
                metricTabItem.checked = newConfig ? newConfig.checked : true
              })
            }
          })
        }
      }

      this.saveUserLocalConfig()
      // 如果取消tab，则如果取消的是当前选中的tab，则当前tab就需要修改为第一个默认的tab，否则不用
      const curTab = this.getCurTab()
      if (!handleTab.checked && handleTab.label === curTab.label) {
        // this.showRecordNum = 10
        this.setShowNum(10)
        this.changeUrlTabState(this.curTabState.curTab, tabList[0].prop)
        let queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: tabList[0].prop
        }
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
      }
    },
    setOperationType (operationType) {
      // this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      // this.$store.commit('setTabOperationType', operationType)
      this.changeUrlTabState(this.curTabState.tabOperationBeforeType, this.getUrlParam(this.curTabState.tabOperationType, '', true))
      this.changeUrlTabState(this.curTabState.tabOperationType, operationType)
    },
    getTabByLabel (label) {
      let tab = null
      const tabGroup = this.list.filter(item => item.label === label)
      if (tabGroup && tabGroup.length > 0) {
        tab = tabGroup[0]
      }
      return tab
    },
    setBeforeTab (tab) {
      // this.$store.commit('setNetworkOverviewBeforeTab', tab)
      this.changeUrlTabState(this.curTabState.networkOverviewBeforeTab, tab.prop)
    },
    setQueryCondition (tab, value) {
      const queryCondition = []
      const searchProps = tab.dillDownProp
      if (tab.prop === 'protocolPort') {
        const valueGroup = value.split(':')
        if (valueGroup) {
          queryCondition.push("common_l7_protocol='" + valueGroup[0] + "'")
          queryCondition.push('common_server_port=' + valueGroup[1])
        }
        // this.$store.commit('setQueryCondition', queryCondition.join(' AND '))
        this.changeUrlTabState(this.curTabState.queryCondition, queryCondition.join(' AND '))
      } else {
        searchProps.forEach(item => {
          queryCondition.push(item + "='" + value + "'")
        })
        // this.$store.commit('setQueryCondition', queryCondition.join(' OR '))
        this.changeUrlTabState(this.curTabState.queryCondition, queryCondition.join(' OR '))
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
      // const oldCurTab = this.$store.getters.getNetworkOverviewBeforeTab
      const oldCurTab = this.getUrlParam(this.curTabState.networkOverviewBeforeTab, '')
      const clickTab = this.getTabByLabel(columnName)
      this.setBeforeTab(clickTab)
      this.setOperationType(operationType.fourthMenu)
      this.setQueryCondition(clickTab, columnValue)

      this.$store.getters.menuList.forEach(menu => {
        if (this.$_.isEmpty(menu.children) && menu.route) {
          if (this.$route.path === menu.route) {
            menu.columnName = columnName
            menu.columnValue = columnValue
            // this.$store.commit('setPanelName', columnValue)
            this.changeUrlTabState(this.curTabState.panelName, columnValue)
            // this.$store.commit('setBreadcrumbColumnName', columnName)
            this.changeUrlTabState(this.curTabState.thirdMenu, columnName)
            // this.$store.commit('setDimensionType', clickTab ? clickTab.prop : '')
            this.changeUrlTabState(this.curTabState.dimensionType, clickTab ? clickTab.prop : '')
            // this.$store.commit('setBreadcrumbColumnValue', columnValue)
            this.changeUrlTabState(this.curTabState.fourthMenu, columnValue)
          }
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            if (this.$route.path === child.route) {
              child.columnName = columnName
              child.columnValue = columnValue
              // this.$store.commit('setPanelName', columnValue)
              this.changeUrlTabState(this.curTabState.panelName, columnValue)
              // this.$store.commit('setBreadcrumbColumnName', columnName)
              this.changeUrlTabState(this.curTabState.thirdMenu, columnName)
              // this.$store.commit('setDimensionType', clickTab ? clickTab.prop : '')
              this.changeUrlTabState(this.curTabState.dimensionType, clickTab ? clickTab.prop : '')
              // this.$store.commit('setBreadcrumbColumnValue', columnValue)
              this.changeUrlTabState(this.curTabState.fourthMenu, columnValue)
            }
          })
        }
      })
      const toPanel = clickTab.panelId
      this.list.forEach((item, index) => {
        if (item.label === columnName) {
          item.checked = false
          // toPanel = item.panelId
        }
        if (oldCurTab && (item.prop === oldCurTab)) {
          item.checked = true
        }
      })
      // this.$store.commit('setNetworkOverviewTabList', this.list)
      // this.handleSearchParams(columnValue)

      const curTab = this.getFirstCheckedTab()
      this.changeUrlTabState(this.curTabState.curTab, curTab.prop)

      this.$router.push({
        query: {
          ...this.$route.query,
          thirdPanel: this.curTable.panelIdOfThirdMenu,
          fourthPanel: toPanel,
          time: +new Date()
        }
      })
    },
    handleSearchParams (columnValue) {
      const queryCondition = []
      const curTab = this.getCurTab()
      const searchProps = curTab.dillDownProp
      if (curTab.prop === 'protocolPort') {
        const valueGroup = columnValue.split(':')
        if (valueGroup) {
          queryCondition.push("common_l7_protocol='" + valueGroup[0] + "'")
          queryCondition.push('common_server_port=' + valueGroup[1])
        }
        // this.$store.commit('setQueryCondition', queryCondition.join(' AND '))
        this.changeUrlTabState(this.curTabState.queryCondition, queryCondition.join(' AND '))
      } else {
        searchProps.forEach(item => {
          queryCondition.push(item + "='" + columnValue + "'")
        })
        // this.$store.commit('setQueryCondition', queryCondition.join(' OR '))
        this.changeUrlTabState(this.curTabState.queryCondition, queryCondition.join(' OR '))
      }
    },
    metricChange () {
      this.saveUserLocalConfig()
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
      this.column = {}
      this.index = 0
      this.tableSortColumn = ''
      this.tableSortType = ''
      this.tableSortTab = ''
      this.changeUrlTabState(this.curTabState.tableSortColumn, '')
      this.changeUrlTabState(this.curTabState.tableSortType, '')
      this.changeUrlTabState(this.curTabState.tableSortTab, '')
      this.cancleSortArrow()
    },
    handleClick (tab) {
      this.tableData = []
      this.tableDataBackup = []
      this.setShowNum(10)
      this.clearSort()
      // this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      // this.$store.commit('setTabOperationType', operationType.changeTab)
      this.changeUrlTabState(this.curTabState.tabOperationBeforeType, this.getUrlParam(this.curTabState.tabOperationType, '', true))
      this.changeUrlTabState(this.curTabState.tabOperationType, operationType.changeTab)
      // this.customTableTitles[0].label = tab.paneName
      const clickTab = this.list.filter(item => item.label == tab.paneName)
      if (clickTab.columns) {
        this.combineColumnList(clickTab.columns)
        this.setUserConfig()
      }

      this.saveUserLocalConfig()
      const tabObjGroup = this.list.filter(item => item.label == tab.paneName)
      if (tabObjGroup && tabObjGroup.length > 0) {
        const curTab = tabObjGroup[0]
        this.changeUrlTabState(this.curTabState.curTab, curTab.prop)
        this.tab = curTab.prop

        let queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: curTab.prop
        }
        // const condition = this.$store.getters.getQueryCondition
        const condition = this.getQueryCondition()
        if (condition) {
          queryParams = {
            orderBy: this.orderBy,
            limit: networkDefaultLimit,
            type: curTab.prop,
            q: condition
          }
        }
        this.tableData = []
        this.tableDataBackup = []
        this.toggleLoading(true)
        this.getChartData(queryParams)
      }
    },
    getCurUrl () {
      // const condition = this.$store.getters.getQueryCondition
      const condition = this.getQueryCondition()
      if (condition) {
        return this.networkSearchUrl.drilldownCurUrl
      } else {
        return this.networkSearchUrl.curUrl
      }
    },
    gerCycleUrl () {
      // const condition = this.$store.getters.getQueryCondition
      const condition = this.getQueryCondition()
      if (condition) {
        return this.networkSearchUrl.drilldownCycleUrl
      } else {
        return this.networkSearchUrl.cycleUrl
      }
    },
    gerColumnUrl (tableColumn) {
      // const condition = this.$store.getters.getQueryCondition
      const condition = this.getQueryCondition()
      if (condition) {
        return tableColumn.dillDownCycleDataUrl
      } else {
        return tableColumn.cycleDataUrl
      }
    },
    handleQueryParams (extraParams) {
      let queryType = ''
      const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')
      // const name = this.$store.getters.getBreadcrumbColumnName
      const name = this.getUrlParam(this.curTabState.thirdMenu, '')
      // const curOperationType = this.$store.getters.getTabOperationType
      const curOperationType = this.getUrlParam(this.curTabState.tabOperationType, '', true)
      // if (curOperationType === operationType.fourthMenu) { // 点击的为第四级菜单
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
        this.setUserConfig()
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
          orderBy: this.orderBy ? this.orderBy : 'bytesTotal',
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
      let style = 'border-right:0px;font-size:12px;padding:7px 0 !important;border-bottom: 1px solid #ECECEC;'
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
    /*
    getUrlCurTab () {
      let curTab = this.$route.query.curTab?JSON.parse(this.$route.query.curTab):null
      return curTab
    }, */
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
    getCurTab () {
      const curTabProp = this.$route.query.curTab ? this.$route.query.curTab : null
      let curTab = curTabProp ? this.list.find(item => item.prop === curTabProp) : null
      // let curTab = this.$store.getters.getNetworkOverviewCurrentTab
      if (!curTab) {
        const tabObjGroup = this.list.filter(item => item.checked)
        if (tabObjGroup && tabObjGroup.length > 0) {
          tabObjGroup[0].checked = true
          curTab = tabObjGroup[0]
          this.changeUrlTabState(this.curTabState.curTab, curTab.prop)
        } else {
          if (this.list && this.list.length > 0) {
            this.list[0].checked = true
            curTab = this.list[0]
            this.changeUrlTabState(this.curTabState.curTab, curTab.prop)
          }
        }
      } else {
        this.list.forEach(item => {
          if (item.label === curTab.label) {
            // item.checked = true
            // this.showTab(curTab)
          }
        })
        // this.$store.commit('setNetworkOverviewTabList', this.list)
      }
      return curTab
    },
    combineTabList () {
      const listInCode = this.curTableInCode ? this.curTableInCode.tabList : []
      // let userTableConfig = this.getUserLocalConfig()
      this.list.forEach(tab => {
        // 配置的内容
        const commonTab = this.commonTabList.find(item => item.name === tab.name)
        tab.label = commonTab ? commonTab.i18n : ''
        tab.prop = commonTab ? commonTab.prop : ''
        if (!tab.hasOwnProperty('checked')) {
          tab.checked = tab ? tab.show : true
        }
        if (!tab.hasOwnProperty('disabled')) {
          tab.disabled = tab ? !tab.enable : false
        }
        if (!tab.hasOwnProperty('panelId')) {
          tab.panelId = tab ? tab.panelIdOfFourthMenu : null
        }
        // 代码里写死的
        const tabInCode = listInCode ? listInCode.find(item => item.label === tab.label) : {}
        tab.queryCycleTotalProp = tabInCode ? tabInCode.queryCycleTotalProp : null
        tab.dillDownProp = tabInCode ? tabInCode.dillDownProp : []
      })
      // 设置drilldownTabs
      const oldList = this.$_.cloneDeep(this.list)
      this.list.forEach(tab => {
        const drilldownTabFull = []
        tab.drilldownTabs.forEach(drilldownTab => {
          const drilldownTabName = drilldownTab ? (drilldownTab.name ? drilldownTab.name : drilldownTab) : ''
          const fullTab = oldList.find(item => item.name === drilldownTabName)
          const commonTab = this.commonTabList.find(item => item.name === drilldownTabName)
          fullTab.label = commonTab ? commonTab.i18n : ''
          fullTab.prop = commonTab ? commonTab.prop : ''
          if (!tab.hasOwnProperty('panelId')) {
            fullTab.panelId = tab ? tab.panelIdOfFourthMenu : ''
          }
          fullTab.show = !(tab.hiddenDrilldownTabs.indexOf(drilldownTabName) >= 0)
          fullTab.checked = !(tab.hiddenDrilldownTabs.indexOf(drilldownTabName) >= 0)
          fullTab.enable = !(tab.disabledDrilldownTabs.indexOf(drilldownTabName) >= 0)
          fullTab.disabled = tab.disabledDrilldownTabs.indexOf(drilldownTabName) >= 0

          // 代码里写死的
          const tabInCode = listInCode ? listInCode.find(item => item.label === fullTab.label) : {}
          fullTab.queryCycleTotalProp = tabInCode ? tabInCode.queryCycleTotalProp : null
          fullTab.dillDownProp = tabInCode ? tabInCode.dillDownProp : []
          drilldownTabFull.push(fullTab)
        })
        tab.drilldownTabs = drilldownTabFull
      })
      console.log(this.list)
    },

    setUserConfig () {
      const userTableConfig = this.getUserLocalConfig()
      if (userTableConfig) {
        const newTabConfigs = []
        userTableConfig.tabConfig.forEach(tab => {
          const tabConfig = this.list.find(item => item.name === tab.name)
          if (tabConfig) {
            tabConfig.checked = tab ? tab.checked : true
          } else {
            tabConfig.checked = true
          }
          newTabConfigs.push(tabConfig)
        })
        this.list = newTabConfigs

        const newColumnConfigs = []
        userTableConfig.columnConfig.forEach((column, index) => {
          if (index === 0) {
            newColumnConfigs.push(this.customTableTitles[0])
          } else {
            const customColumnConfig = this.customTableTitles.find(item => item.name === column.name)
            if (customColumnConfig) {
              customColumnConfig.checked = column ? column.checked : true
              newColumnConfigs.push(customColumnConfig)
            }
          }
        })
        this.customTableTitles = newColumnConfigs
        /*        let cfg = userTableConfig.columnConfig
        this.customTableTitles.forEach(item => {
          let customColumnConfig = cfg.find(column => item.name===column.name)
          if(customColumnConfig){
            item.checked = customColumnConfig?customColumnConfig.checked:true
            //newColumnConfigs.push(customColumnConfig)
          }
        }) */
      }
    },
    combineColumnList (list) {
      const hiddenColumnList = this.list ? this.list[0].hiddenColumns : []
      const disabledColumns = this.list ? this.list[0].disabledColumns : []
      const newColumnList = []
      if (list && list.length > 0) {
        list.forEach(column => {
          // let columnName = column
          const columnName = column ? (column.name ? column.name : column) : ''
          // 配置的内容
          const commonColumn = this.commonColumnList.find(item => item.name === columnName)
          column = {}
          column.name = commonColumn ? commonColumn.name : ''
          column.label = commonColumn ? commonColumn.i18n : ''
          column.prop = commonColumn ? commonColumn.prop : ''
          column.checked = !(hiddenColumnList.indexOf(columnName) >= 0)
          column.disabled = disabledColumns.indexOf(columnName) >= 0
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
        })
        this.customTableTitles = newColumnList
      }
      console.log(this.customTableTitles)
    },
    initConfig () {

    },
    getUserLocalConfig () {
      let config = null
      const userCustomizationConfigs = localStorage.getItem(storageKey.userCustomizationConfig)// 所有用户的[{id:1,tabsConfig:{},columnsConfig:{}},{id:2,tabsConfig:{},columnsConfig:{}}]
      const userId = localStorage.getItem(storageKey.userId)
      if (userCustomizationConfigs) { // 用户自定义配置
        const userConfigGroup = JSON.parse(userCustomizationConfigs)
        const currentUserConfig = userConfigGroup ? userConfigGroup.find(userConfig => userConfig.userId === userId) : null
        const allConfig = currentUserConfig ? currentUserConfig.config : null
        if (allConfig) {
          config = allConfig.find(config => config.route === this.tableType)
        }
      }
      return config
    },
    saveUserLocalConfig () {
      const columnConfig = []
      this.customTableTitles.forEach(item => {
        const config = {
          name: item.name,
          checked: item.checked
        }
        columnConfig.push(config)
      })
      const tabConfig = []
      this.list.forEach(item => {
        const config = {
          name: item.name,
          checked: item.checked,
          columns: columnConfig
        }
        tabConfig.push(config)
      })

      const userCustomizationConfigs = localStorage.getItem(storageKey.userCustomizationConfig)
      const userConfigGroup = userCustomizationConfigs ? JSON.parse(userCustomizationConfigs) : []
      const userId = localStorage.getItem(storageKey.userId)
      if (this.getUserLocalConfig()) {
        userConfigGroup.forEach(item => {
          if (item.userId === userId) {
            if (item.config) {
              item.config.forEach(config => {
                if (config.route === this.tableType) {
                  config.tabConfig = tabConfig
                  config.columnConfig = columnConfig
                }
              })
            }
          }
        })
      } else {
        if (userConfigGroup && userConfigGroup.length > 0) {
          userConfigGroup.forEach(userConfig => {
            if (userConfig.userId === userId) {
              if (userConfig.config) {
                userConfig.config.push({
                  route: this.tableType,
                  tabConfig: tabConfig,
                  columnConfig: columnConfig
                })
              } else {
                userConfig.config = [
                  {
                    route: this.tableType,
                    tabConfig: tabConfig,
                    columnConfig: columnConfig
                  }
                ]
              }
            }
          })
        }
        const currentUserConfig = userConfigGroup ? userConfigGroup.find(userConfig => userConfig.userId === userId) : null
        if (!currentUserConfig) {
          const newConfig = {
            userId: userId,
            config: [
              {
                route: this.tableType,
                tabConfig: tabConfig,
                columnConfig: columnConfig
              }
            ]
          }
          userConfigGroup.push(newConfig)
        }
      }

      console.log(userConfigGroup)
      // localStorage.removeItem(storageKey.userCustomizationConfig)
      localStorage.setItem(storageKey.userCustomizationConfig, JSON.stringify(userConfigGroup))
    }
  },
  mounted () {
    console.log('mounted')
    this.tableType = this.$route.params ? this.$route.params.typeName : 'networkOverview'
    this.curTableInCode = this.networkTable[this.tableType] ? this.networkTable[this.tableType] : this.networkTable.networkOverview
    // 表格状态初始化(url)
    this.metric = this.getUrlParam(this.curTabState.tableMetric, 'Bits/s')
    this.showRecordNum = Number(this.getUrlParam(this.curTabState.tableShowMore, 10))
    this.tableSortColumn = this.getUrlParam(this.curTabState.tableSortColumn, '')
    this.tableSortType = this.getUrlParam(this.curTabState.tableSortType, '')
    this.tableSortTab = this.getUrlParam(this.curTabState.tableSortTab, '')
    // 先从localStorage中获取用户定制的自定义配置，如果没有，则使用默认的自定义配置
    // let userTableConfig = this.getUserLocalConfig()
    // if (!currentTableConfig) {//未找到当前用户的配置，使用默认配置
    const defaultDrillDownTableConfigs = JSON.parse(localStorage.getItem(storageKey.drillDownTableConfig))// 所有表格的配置
    const currentTableConfig = defaultDrillDownTableConfigs.find(config => config.route === this.tableType)
    // }
    this.commonTabList = currentTableConfig ? currentTableConfig.tabs : []
    this.commonColumnList = currentTableConfig ? currentTableConfig.columns : []
    const tables = currentTableConfig ? currentTableConfig.tables : []
    const tableId = this.tableType
    if (tables && tables.length > 0) {
      const curTableOldConfig = tables.find(table => table.id === tableId)
      this.curTable = curTableOldConfig || null
      if (this.curTable) {
        if (this.curTable.hasMetricSearch) { // 有metric
          this.metricsList = this.curTable ? this.curTable.metrics : []
          if (this.metricsList && this.metricsList.length > 0) {
            const metricTab = this.metricsList.find(metric => metric.name === this.metric)
            this.list = metricTab ? metricTab.tabs : []
            this.networkTabList = metricTab ? metricTab.tabs : []
          }
        } else { // 无metric
          this.list = this.curTable ? this.curTable.tabs : []
          this.networkTabList = this.curTable ? this.curTable.tabs : []
        }
        this.combineTabList()
        this.allList = this.$_.cloneDeep(this.list)// 备份所有配置，下钻及返回时使用
        this.customTableTitles = this.list ? this.list[0].columns : []// 需要获得当前tab的列:默认第一个tab的列
        this.combineColumnList(this.customTableTitles)
        this.activeTab = ref(this.list[0].label)
        this.activeCustomize = ref('tabs')
        this.networkSearchUrl = this.curTable.url
        this.curTable.bytesColumnNameGroup = this.curTableInCode ? this.curTableInCode.bytesColumnNameGroup : []
        this.curTable.bytesCycleColumnNameGroup = this.curTableInCode ? this.curTableInCode.bytesCycleColumnNameGroup : []
        this.curTable.packetsColumnNameGroup = this.curTableInCode ? this.curTableInCode.packetsColumnNameGroup : []
        this.curTable.packetsCycleColumnNameGroup = this.curTableInCode ? this.curTableInCode.packetsCycleColumnNameGroup : []
        this.curTable.sessionsColumnNameGroup = this.curTableInCode ? this.curTableInCode.sessionsColumnNameGroup : []
        this.curTable.sessionsCycleColumnNameGroup = this.curTableInCode ? this.curTableInCode.sessionsCycleColumnNameGroup : []
        this.columnNameGroup = this.curTable.bytesColumnNameGroup
        this.cycleColumnNameGroup = this.curTable.bytesCycleColumnNameGroup

        this.setUserConfig()
      }
    }
    console.log('第一次存储默认配置到localstorage')
    this.saveUserLocalConfig()
    this.getChartData()
    this.$nextTick(() => {
      setTimeout(() => {
        this.hasMetricSearch = this.curTable.hasMetricSearch
      }, 250)
    })
  },
  setup (props) {
    console.log('setup')
  },
  unmounted () {
    this.isNoData = false
    // 存储用户的设置
    // this.setUserConfig()
    this.saveUserLocalConfig()
    console.log('退出界面时，将修改的配置存储到localstorage')
    console.log('unmounted')
  }
}
</script>
