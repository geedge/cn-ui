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
              <template v-for="(item, index) in customTableTitles">
                <li v-if="item.tabColumn != true"
                    :key="item.label"
                    class="list-item"
                    @dragenter="dragMetricEnter($event, index)"
                    @dragover="dragMetricOver($event, index)"
                    @dragstart="dragMetricStart(index)"
                    draggable="true"
                >
                  <i class="cn-icon-sort cn-icon icon-drag"
                     :key="item.label"
                  ></i> <el-checkbox @change="metricChange" v-model="item.checked"  :label="$t(item.label) " size="small" :key="item.label"/>
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
import { operationType, unitTypes, networkTable, tableColumnType, networkDefaultLimit, curTabState } from '@/utils/constants'
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
      customTableTitles: [],
      list: [], // 当前状态列表
      networkTabList: [], // 原始状态列表
      showBackground: false,
      tableData: [],
      tableDataBackup: [],
      showRecordNum: 10,
      showCustomizeTabs: true,
      columnNameGroup: {},
      cycleColumnNameGroup: {},
      metricUnit: 'bytes',
      // loading: false,
      tableColumnType: tableColumnType,
      curTabState: curTabState,
      curTable: {}, // 当前的表格类型
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
    timeFilter: {
      deep: true,
      handler (n) {
        const curTab = this.getCurTab()
        let queryParams = {
          orderBy: this.orderBy,
          limit: networkDefaultLimit,
          type: curTab.prop
        }
        const condition = this.$store.getters.getQueryCondition
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
    initState () {
      // 没有选中任何tab时，默认选中第一个
      const tabList = this.list.filter(item => item.checked === true)
      if (tabList.length === 0) {
        this.list[0].checked = true
        this.showTab(this.list[0])
      } else {
        this.showTab(tabList[0])
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
      const columnName = this.$store.getters.getBreadcrumbColumnName
      if (columnName) {
        this.list.forEach(item => {
          if (item.label === columnName) {
            item.checked = false
          }
        })
        this.$store.commit('setNetworkOverviewTabList', this.list)
      }
      this.list.forEach(item => {
        const tabDom = document.getElementById('tab-' + item.label)
        if (tabDom) {
          tabDom.style.display = ''
        }
      })

      let curTab = this.getCurTab()
      const curOperationType = this.$store.getters.getTabOperationType
      const beforeOperationType = this.$store.getters.getTabOperationBeforeType
      if (curOperationType === operationType.changeTab) { // 切换tab
        if (curTab) { // tab切换
          this.showTab(curTab)
        }
        this.showCustomizeTabs = true
        this.setShowNum(10)
      } else if (curOperationType === operationType.thirdMenu) { // 点击的为第三级菜单
        const name = this.$store.getters.getBreadcrumbColumnName
        const networkTabList = []
        this.list.forEach(item => {
          if (this.$t(item.label) === name) {
            item.checked = true
          }
          networkTabList.push(item)
        })
        this.$store.commit('setNetworkOverviewTabList', networkTabList)
        const breadcrumbColumnTab = this.list.find(item => this.$t(item.label) === name)
        this.changeUrlTabState(this.curTabState.curTab, breadcrumbColumnTab.prop)

        this.hideTabs(breadcrumbColumnTab)
        this.customTableTitles[0].label = breadcrumbColumnTab.label
        this.showCustomizeTabs = false
        // this.showRecordNum = 10
        this.setShowNum(10)
      } else if (curOperationType === operationType.fourthMenu) { // 点击的为第四级菜单
        curTab = this.getDefaultTab()
        if (curTab) {
          this.showTab(curTab)
          this.changeUrlTabState(this.curTabState.curTab, curTab.prop)
        }
        this.showCustomizeTabs = true
        this.setShowNum(10)
      } else if (curOperationType === operationType.secondMenu || curOperationType === operationType.mainMenu) { // 点击的为第二级菜单、或者点击菜单进入、
        this.list = this.$_.cloneDeep(this.curTable.tabList)
        this.$store.commit('setNetworkOverviewTabList', this.list)
        if (curTab) {
          this.showTab(curTab)
          this.changeUrlTabState(this.curTabState.curTab, curTab.prop)
        }
        this.showCustomizeTabs = true
      } else if (curOperationType === operationType.changeMetric) { // 切换metric
        if (beforeOperationType === operationType.thirdMenu) {
          this.hideTabs(curTab)
          this.customTableTitles[0].label = curTab.label
          this.showCustomizeTabs = false
        }
      } else if (curOperationType === operationType.customize) { // customize
        if (beforeOperationType === operationType.thirdMenu) {
          this.hideTabs(curTab)
          this.customTableTitles[0].label = curTab.label
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
      const condition = this.$store.getters.getQueryCondition
      if (condition) {
        queryParams.q = condition
      }

      const self = this
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
                        trendPercent = trendPercent + '%'
                      } else if (totalDiff < 0) {
                        trend = 'down'
                        trendPercent = trendPercent + '%'
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
                                  trendPercent = trendPercent + '%'
                                } else if (totalDiff < 0) {
                                  trend = 'down'
                                  trendPercent = trendPercent + '%'
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
    },
    showMore () {
      this.setShowNum(50)
      this.sortChange(this.column, this.index)// 当前选中的tab？？？？
    },
    setShowNum (num) {
      this.showRecordNum = num
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
      // this.showRecordNum = 10
      this.setShowNum(10)
      const beforeType = this.$store.getters.getTabOperationBeforeType
      if (beforeType != operationType.thirdMenu) {
        this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      }
      this.$store.commit('setTabOperationType', operationType.changeMetric)
      const curTab = this.getCurTab()
      const label = curTab.label
      this.changeUrlTabState(this.curTabState.tableMetric, this.metric)
      if (this.metric === 'Bits/s') {
        this.columnNameGroup = this.curTable.bytesColumnNameGroup
        this.cycleColumnNameGroup = this.curTable.bytesCycleColumnNameGroup
        this.orderBy = 'bytesTotal'
        this.metricUnit = 'bytes'
        const titleGroup = []
        if (this.customTableTitles.length === 2) {
          this.curTable.column.forEach((item, index) => {
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
      } else if (this.metric === 'Packets/s') {
        this.columnNameGroup = this.curTable.packetsColumnNameGroup
        this.cycleColumnNameGroup = this.curTable.packetsCycleColumnNameGroup
        this.orderBy = 'packetsTotal'
        this.metricUnit = 'packets'
        const titleGroup = []
        if (this.customTableTitles.length === 2) {
          this.curTable.column.forEach((item, index) => {
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
      } else if (this.metric === 'Sessions/s') {
        this.columnNameGroup = this.curTable.sessionsColumnNameGroup
        this.cycleColumnNameGroup = this.curTable.sessionsCycleColumnNameGroup
        this.orderBy = 'sessions'
        this.metricUnit = 'sessions'
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
      }
      let queryParams = {
        orderBy: this.orderBy,
        limit: networkDefaultLimit,
        type: curTab.prop
      }
      const condition = this.$store.getters.getQueryCondition
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
      const columnName = this.$store.getters.getBreadcrumbColumnName
      const columnValue = this.$store.getters.getBreadcrumbColumnValue
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
        this.$store.commit('setNetworkOverviewTabList', this.list)
      }
    },
    getDefaultTab () {
      let tabObjGroup = this.list.filter(item => item.checked)
      if (tabObjGroup && tabObjGroup.length > 0) {
        return tabObjGroup[0]
      } else {
        return tabObjGroup = this.networkTabList.filter(item => item.checked)[0]
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
      const { query } = this.$route
      const newQuery = {}
      newQuery[param] = value
      const newUrl = urlParamsHandler(window.location.href, query, newQuery)
      overwriteUrl(newUrl)
    },
    // 激活tab修改的内容：第一列的列名，list中此tab为checked=true
    showTab (curTab) {
      this.activeTab = ref(curTab.label)
      this.customTableTitles[0].label = curTab.label
    },
    tabChange (index) {
      this.isNoData = false
      // 操作类型设置
      const beforeType = this.$store.getters.getTabOperationBeforeType
      if (beforeType != operationType.thirdMenu) {
        this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      }
      this.$store.commit('setTabOperationType', operationType.customize)
      // 获得操作tab和当前选中的所有tab
      const handleTab = this.list[index]
      const tabList = this.list.filter(item => item.checked === true)
      const defaultTab = tabList.length > 0 ? tabList[0] : {}
      // 当前操作之后，只有1个tab被选中，则这一个不允许取消选中
      const columnName = this.$store.getters.getBreadcrumbColumnName
      const columnValue = this.$store.getters.getBreadcrumbColumnValue
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
        this.$store.commit('setNetworkOverviewTabList', this.list)
      }

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
        const condition = this.$store.getters.getQueryCondition
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
      this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      this.$store.commit('setTabOperationType', operationType)
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
      this.$store.commit('setNetworkOverviewBeforeTab', tab)
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
        this.$store.commit('setQueryCondition', queryCondition.join(' AND '))
      } else {
        searchProps.forEach(item => {
          queryCondition.push(item + "='" + value + "'")
        })
        this.$store.commit('setQueryCondition', queryCondition.join(' OR '))
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
      const oldCurTab = this.$store.getters.getNetworkOverviewBeforeTab
      const clickTab = this.getTabByLabel(columnName)
      this.setBeforeTab(clickTab)
      this.setOperationType(operationType.fourthMenu)
      this.setQueryCondition(clickTab, columnValue)

      this.$store.getters.menuList.forEach(menu => {
        if (this.$_.isEmpty(menu.children) && menu.route) {
          if (this.$route.path === menu.route) {
            menu.columnName = columnName
            menu.columnValue = columnValue
            this.$store.commit('setPanelName', columnValue)
            this.$store.commit('setBreadcrumbColumnName', columnName)
            this.$store.commit('setDimensionType', clickTab ? clickTab.prop : '')
            this.$store.commit('setBreadcrumbColumnValue', columnValue)
          }
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            if (this.$route.path === child.route) {
              child.columnName = columnName
              child.columnValue = columnValue
              this.$store.commit('setPanelName', columnValue)
              this.$store.commit('setBreadcrumbColumnName', columnName)
              this.$store.commit('setDimensionType', clickTab ? clickTab.prop : '')
              this.$store.commit('setBreadcrumbColumnValue', columnValue)
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
        if (oldCurTab && (item.label === oldCurTab.label)) {
          item.checked = true
        }
      })
      this.$store.commit('setNetworkOverviewTabList', this.list)
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
        this.$store.commit('setQueryCondition', queryCondition.join(' AND '))
      } else {
        searchProps.forEach(item => {
          queryCondition.push(item + "='" + columnValue + "'")
        })
        this.$store.commit('setQueryCondition', queryCondition.join(' OR '))
      }
    },
    metricChange () {
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
      this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      this.$store.commit('setTabOperationType', operationType.changeTab)
      this.customTableTitles[0].label = tab.paneName

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
        const condition = this.$store.getters.getQueryCondition
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
      const condition = this.$store.getters.getQueryCondition
      if (condition) {
        return this.networkSearchUrl.drilldownCurUrl
      } else {
        return this.networkSearchUrl.curUrl
      }
    },
    gerCycleUrl () {
      const condition = this.$store.getters.getQueryCondition
      if (condition) {
        return this.networkSearchUrl.drilldownCycleUrl
      } else {
        return this.networkSearchUrl.cycleUrl
      }
    },
    gerColumnUrl (tableColumn) {
      const condition = this.$store.getters.getQueryCondition
      if (condition) {
        return tableColumn.dillDownCycleDataUrl
      } else {
        return tableColumn.cycleDataUrl
      }
    },
    /*
    getTabList(){
      let tabList = this.$store.getters.getNetworkOverviewTabList
      if (!tabList || tabList.length === 0) {
        tabList = this.$_.cloneDeep(this.networkTabList)
      }
      return tabList
    }, */
    handleQueryParams (extraParams) {
      let queryType = ''
      const name = this.$store.getters.getBreadcrumbColumnName
      const curOperationType = this.$store.getters.getTabOperationType
      if (curOperationType === operationType.fourthMenu) { // 点击的为第四级菜单
        const checkedTab = this.list.find(item => item.checked)
        queryType = checkedTab ? checkedTab.prop : ''
      } else if (curOperationType === operationType.thirdMenu) { // 点击的为第三级菜单
        const breadcrumbTab = this.list.find(item => this.$t(item.label) === name)
        queryType = breadcrumbTab ? breadcrumbTab.prop : ''
      } else if (curOperationType === operationType.changeTab) { // 切换tab
        const curTab = this.getCurTab()
        queryType = curTab.prop
      } else if (curOperationType === operationType.secondMenu || curOperationType === operationType.mainMenu) { // 点击第二级菜单，点击菜单
        this.list = this.$_.cloneDeep(this.curTable.tabList)
        this.$store.commit('setNetworkOverviewTabList', this.list)
        const curTab = this.getCurTab()
        queryType = curTab.prop
      } else {
        const curTab = this.getCurTab()
        queryType = curTab.prop
      }

      if (JSON.stringify(extraParams) === '{}') {
        extraParams = {
          type: queryType || this.networkTabList[0].prop,
          orderBy: this.orderBy ? this.orderBy : 'bytesTotal',
          limit: networkDefaultLimit
        }
        const condition = this.$store.getters.getQueryCondition
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
    // 获取当前tab
    getCurTab () {
      const curTabProp = this.$route.query.curTab ? this.$route.query.curTab : null
      let curTab = curTabProp ? this.list.find(item => item.prop === curTabProp) : null
      // let curTab = this.$store.getters.getNetworkOverviewCurrentTab
      if (!curTab) {
        const tabObjGroup = this.list.filter(item => item.checked)
        if (tabObjGroup && tabObjGroup.length > 0) {
          curTab = tabObjGroup[0]
        } else {
          curTab = this.networkTabList[0]
        }
        this.changeUrlTabState(this.curTabState.curTab, curTab.prop)
      } else {
        this.list.forEach(item => {
          if (item.label === curTab.label) {
            // item.checked = true
            // this.showTab(curTab)
          }
        })
        this.$store.commit('setNetworkOverviewTabList', this.list)
      }
      return curTab
    }
  },
  mounted () {
    // 表格结构初始化
    this.tableType = this.chart.params ? this.chart.params.name : 'networkOverview'// 可以改成根据path得到类型，并获取对应的配置
    this.curTable = this.networkTable[this.tableType] ? this.networkTable[this.tableType] : this.networkTable.networkOverview
    this.customTableTitles = this.$_.cloneDeep(this.curTable.column)
    this.list = this.$_.cloneDeep(this.curTable.tabList)
    this.networkTabList = this.curTable.tabList
    this.activeTab = ref(this.networkTabList[0].label)
    this.activeCustomize = ref('tabs')
    this.networkSearchUrl = this.curTable.url
    this.columnNameGroup = this.curTable.bytesColumnNameGroup
    this.cycleColumnNameGroup = this.curTable.bytesCycleColumnNameGroup
    // 表格状态初始化
    this.metric = this.$route.query[curTabState.tableMetric] ? this.$route.query[curTabState.tableMetric] : 'Bits/s'
    this.showRecordNum = this.$route.query[curTabState.tableShowMore] ? Number(this.$route.query[curTabState.tableShowMore]) : 10
    this.tableSortColumn = this.$route.query[curTabState.tableSortColumn] ? this.$route.query[curTabState.tableSortColumn] : ''
    this.tableSortType = this.$route.query[curTabState.tableSortType] ? this.$route.query[curTabState.tableSortType] : ''
    this.tableSortTab = this.$route.query[curTabState.tableSortTab] ? this.$route.query[curTabState.tableSortTab] : ''

    if (this.$store.getters.getNetworkOverviewTabList.length > 0) {
      this.list = this.$store.getters.getNetworkOverviewTabList
    } else {
      this.$store.commit('setNetworkOverviewTabList', this.list)
    }
    // this.initState()
    this.getChartData()
    this.$nextTick(() => {
      setTimeout(() => {
        this.hasMetricSearch = this.curTable.hasMetricSearch
      }, 250)
    })
  },
  setup (props) {
  },
  unmounted () {
    this.isNoData = false
    this.$store.commit('setNetworkOverviewTabList', this.list)// 保存状态
  }
}
</script>
