<template>
  <div class="tabs">
    <el-tabs v-model="activeTab"
             class="cn-chart__tabs"
             :class="showTabs?'':'tab-hide'"
             @tab-click="handleClick"
    >
      <template v-for="(tab,index) in list">
        <el-tab-pane  v-if="tab.checked"
                      :name="tab.label"
                      :key="index"
                      :ref="`chart-tab-${index}`"
                      class="tab-pane"
        >
          <template #label>
            {{$t(tab.label)}}
          </template>
          <el-table
                  :id="`tabTable_${index}`"
                  :ref="`dataTable_${index}`"
                  :data="tableData"
                  border
                  :cell-style="tableCellStyle"
                  :header-cell-style="tableHeaderCellStyle"
                  class="tab-table"
                  height="100%"
                  empty-text=" "
          >
            <template v-for="(item,index) in customTableTitles">
              <el-table-column
                      v-if="item.checked"
                      class="data-column"
              >
                <template #header>
                  <span class="data-column__span">{{$t(item.label)}}</span>
                </template>
                <template  #default="scope" :column="item">
                  <template v-if="item.columnType === tableColumnType.chainRatio"  >
                    <div class="data-total" >
                      {{scope.row[item.prop]?((scope.row[item.prop][0]||scope.row[item.prop][0]===0)? unitConvert(scope.row[item.prop][0], unitTypes.number).join(' ') : '-'):'' }}
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
              <div class="table-no-data" v-show="isNoData">
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
          <el-tab-pane :label="$t('network.tabs')" name="tabs" width="50%"  v-if="showTabs" >
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

</template>
<script>
import { ref } from 'vue'
import { operationType, unitTypes, networkTable, tableColumnType } from '@/utils/constants'
import { get } from '@/utils/http'
import unitConvert from '@/utils/unit-convert'
import { getChainRatio, computeScore } from '@/utils/tools'
import { getSecond } from '@/utils/date-util'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartNoData from '@/views/charts/charts/ChartNoData'

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
      showTabs: true,
      columnNameGroup: {},
      cycleColumnNameGroup: {},
      metricUnit: 'bytes',
      //loading: false,
      tableColumnType: tableColumnType,
      curTable: {}, // 当前的表格类型
      tableType: '',
      hasMetricSearch: true,
      activeTab: '',
      activeCustomize: '',
      networkSearchUrl: {}
    }
  },
  props: {
    chartData: Array,
    timeFilter: Object,
    chart: Object
  },
  components: {
    ChartNoData
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        if (this.chartData) {
          this.initData()
        }
      }
    },
    timeFilter: {
      deep: true,
      handler (n) {
        const curTab = this.getCurTab()
        let queryParams = {
          orderBy: this.orderBy,
          limit: 10,
          type: curTab.prop
        }
        const condition = this.$store.getters.getQueryCondition
        if (condition) {
          queryParams = {
            orderBy: this.orderBy,
            limit: 10,
            type: curTab.prop,
            q: condition
          }
        }
        this.$emit('getChartData', this.getCurUrl(), queryParams)
      }
    }
  },
  mixins: [chartMixin],
  methods: {
    changeMetric () {
      const beforeType = this.$store.getters.getTabOperationBeforeType
      if (beforeType != operationType.thirdMenu) {
        this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      }
      this.$store.commit('setTabOperationType', operationType.changeMetric)
      const curTab = this.getCurTab()
      const label = curTab.label
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
        limit: 10,
        type: curTab.prop
      }
      const condition = this.$store.getters.getQueryCondition
      if (condition) {
        queryParams = {
          orderBy: this.orderBy,
          limit: 10,
          type: curTab.prop,
          q: condition
        }
      }
      this.$emit('getChartData', this.getCurUrl(), queryParams)
    },
    handleCustomizeButton (status) {
      this.showBackground = status
      if (!this.showTabs) {
        this.activeCustomize = 'metrics'
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
    initData () {
      const curTab = this.getCurTab()
      const columnName = this.$store.getters.getBreadcrumbColumnName

      this.list.forEach(item => {
        const tabDom = document.getElementById('tab-' + item.label)
        if (tabDom) {
          tabDom.style.display = ''
        }
      })

      const curOperationType = this.$store.getters.getTabOperationType
      if (curOperationType === operationType.changeTab) { // 切换tab
        if (curTab) { // tab切换
          this.activeTab = curTab.label
          this.customTableTitles[0].label = curTab.label
          this.$store.commit('setNetworkOverviewCurrentTab', curTab)
        }
        this.showTabs = true
      } else if (curOperationType === operationType.thirdMenu) { // 点击的为第三级菜单
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
        this.customTableTitles[0].label = curTab.label
        this.showTabs = false
      } else if (curOperationType === operationType.fourthMenu) { // 点击的为第四级菜单
        const curTab = this.getDefaultTab()
        if (curTab) {
          this.activeTab = curTab.label
          this.customTableTitles[0].label = curTab.label
          this.$store.commit('setNetworkOverviewCurrentTab', curTab)
        }
        this.showTabs = true
      } else if (curOperationType === operationType.secondMenu || curOperationType === operationType.mainMenu) { // 点击的为第二级菜单、或者点击菜单进入、
        this.list = this.$_.cloneDeep(this.curTable.tabList)
        if (curTab) { // tab切换
          this.activeTab = curTab.label
          this.customTableTitles[0].label = curTab.label
          this.$store.commit('setNetworkOverviewCurrentTab', curTab)
        }
        this.showTabs = true
      } else if (curOperationType === operationType.changeMetric) { // 切换metric
        const beforeOperationType = this.$store.getters.getTabOperationBeforeType
        if (beforeOperationType === operationType.thirdMenu) {
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
          this.customTableTitles[0].label = curTab.label
          this.showTabs = false
        }
      } else if (curOperationType === operationType.customize) { // customize
        const beforeOperationType = this.$store.getters.getTabOperationBeforeType
        if (beforeOperationType === operationType.thirdMenu) {
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
          this.customTableTitles[0].label = curTab.label
          this.showTabs = false
        } else {
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
          this.activeTab = curTab.label
          this.customTableTitles[0].label = curTab.label
          this.showTabs = true
        }
      }

      const tabList = []
      const tableDataTmp = this.chartData.map(item => {
        tabList.push(item[curTab.prop])
        const otherData = { tab: item[curTab.prop] }
        Object.keys(this.columnNameGroup).forEach(i => {
          otherData[i] = item[this.columnNameGroup[i]]
        })
        return otherData
      })

      this.toggleLoading(false)
      if(!this.chartData || this.chartData.length === 0){
        this.isNoData = true
      }else {
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

      // 获取上一周期的总流量
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
                      }else {
                        item.scoreGroup = item.scoreGroup ? [...item.scoreGroup, 0] : [0]
                      }
                      if (scoreNum >= 5) {
                        // self.tableData.forEach(data => {
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
    tabChange (index) {
      this.toggleLoading(true)
      this.isNoData = false
      const beforeType = this.$store.getters.getTabOperationBeforeType
      if (beforeType != operationType.thirdMenu) {
        this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      }
      this.$store.commit('setTabOperationType', operationType.customize)
      const handleTab = this.list[index]
      const tabList = this.list.filter(item => item.checked === true)
      const defaultTab = tabList.length > 0 ? tabList[0] : {}
      if (handleTab.label === defaultTab.label && handleTab.checked) {
        this.activeTab = handleTab.label
        this.customTableTitles.forEach(item => {
          if (item.tabColumn) {
            item.label = handleTab.label
          }
        })
      }
      if (tabList.length === 1) { // 当前操作之后，只有1个tab被选中，则这一个不允许取消选中
        defaultTab.disabled = true
      } else if (tabList.length > 1) {
        this.list.forEach(item => {
          item.disabled = false
        })
      }

      this.$store.commit('setNetworkOverviewCurrentTab', tabList[0])

      let queryParams = {
        orderBy: this.orderBy,
        limit: 10,
        type: tabList[0].prop
      }
      const condition = this.$store.getters.getQueryCondition
      if (condition) {
        queryParams = {
          orderBy: this.orderBy,
          limit: 10,
          type: tabList[0].prop,
          q: condition
        }
      }
      this.$emit('getChartData', this.getCurUrl(), queryParams)
    },
    handleTabValue (columnName, columnValue) {
      const oldCurTab = this.$store.getters.getNetworkOverviewBeforeTab
      const tabGroup = this.list.filter(item => item.label === columnName)
      if (tabGroup && tabGroup.length > 0) {
        this.$store.commit('setNetworkOverviewBeforeTab', tabGroup[0])
      }
      this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      this.$store.commit('setTabOperationType', operationType.fourthMenu)

      const queryCondition = []
      const searchProps = tabGroup[0].dillDownProp
      if (tabGroup[0].prop === 'protocolPort') {
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
      /*
        * 点击表格第一列后
            1.顶部面包屑增加两级，分别是列名和值；
            2.panel标题变更为值；
            3.当前panel只保留折线图和表格；
            4.面包屑上的值可点击下拉，切换内容；
        * */
      this.$store.getters.menuList.forEach(menu => {
        if (this.$_.isEmpty(menu.children) && menu.route) {
          if (this.$route.path === menu.route) {
            menu.columnName = columnName
            menu.columnValue = columnValue
            this.$store.commit('setPanelName', columnValue)
            this.$store.commit('setBreadcrumbColumnName', columnName)
            this.$store.commit('setDimensionType', tabGroup[0] ? tabGroup[0].prop : '')
            this.$store.commit('setBreadcrumbColumnValue', columnValue)
          }
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            if (this.$route.path === child.route) {
              child.columnName = columnName
              child.columnValue = columnValue
              this.$store.commit('setPanelName', columnValue)
              this.$store.commit('setBreadcrumbColumnName', columnName)
              this.$store.commit('setDimensionType', tabGroup[0] ? tabGroup[0].prop : '')
              this.$store.commit('setBreadcrumbColumnValue', columnValue)
            }
          })
        }
      })
      let toPanel = null
      this.list.forEach((item, index) => {
        if (item.label === columnName) {
          item.checked = false
          toPanel = item.panelId
        }
        if (oldCurTab && (item.label === oldCurTab.label)) {
          item.checked = true
        }
      })
      this.$store.commit('setNetworkOverviewTabList', this.list)
      this.handleSearchParams(columnValue)

      const tabObjGroup = this.list.filter(item => item.checked)
      if (tabObjGroup && tabObjGroup.length > 0) {
        const curTab = tabObjGroup[0]
        this.$store.commit('setNetworkOverviewCurrentTab', curTab)
      }

      const tab = this.list.filter(item => item.checked)

      // 如果面包屑的columnValue有值，则不更新valueList
      const valueList = []
      this.tableData.map(item => {
        valueList.push(item.tab)
      })
      this.$store.commit('setBreadcrumbColumnValueList', valueList)
      this.$router.push({
        name: 'panel',
        path: this.$route.path,
        query: {
          t: +new Date()
        },
        params: {
          thirdPanel: this.curTable.panelIdOfThirdMenu,
          fourthPanel: toPanel
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
    handleClick (tab) {
      this.tableData = []
      this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      this.$store.commit('setTabOperationType', operationType.changeTab)
      this.customTableTitles[0].label = tab.paneName

      const tabObjGroup = this.list.filter(item => item.label == tab.paneName)
      if (tabObjGroup && tabObjGroup.length > 0) {
        const curTab = tabObjGroup[0]
        this.$store.commit('setNetworkOverviewCurrentTab', curTab)
        this.tab = curTab.prop

        let queryParams = {
          orderBy: this.orderBy,
          limit: 10,
          type: curTab.prop
        }
        const condition = this.$store.getters.getQueryCondition
        if (condition) {
          queryParams = {
            orderBy: this.orderBy,
            limit: 10,
            type: curTab.prop,
            q: condition
          }
        }
        this.toggleLoading(true)
        this.$emit('getChartData', this.getCurUrl(), queryParams)
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
    handleQueryParams (extraParams) {
      this.toggleLoading(true)
      let queryType = ''
      const name = this.$store.getters.getBreadcrumbColumnName
      let tabList = this.$store.getters.getNetworkOverviewTabList
      if (!tabList || tabList.length === 0) {
        tabList = this.$_.cloneDeep(this.networkTabList)
      }

      const curOperationType = this.$store.getters.getTabOperationType
      if (curOperationType === operationType.fourthMenu) { // 点击的为第四级菜单
        const tabCheckedGroup = []
        tabList.forEach(item => {
          if (item.checked) {
            tabCheckedGroup.push(item)
          }
        })
        if (tabCheckedGroup && tabCheckedGroup.length > 0) {
          queryType = tabCheckedGroup[0].prop
          this.$store.commit('setNetworkOverviewCurrentTab', tabCheckedGroup[0])
          this.customTableTitles[0].label = tabCheckedGroup[0].label
        }
      } else if (curOperationType === operationType.thirdMenu) { // 点击的为第三级菜单
        const networkTabList = []
        tabList.forEach(item => {
          if (this.$t(item.label) === name) {
            item.checked = true
          }
          networkTabList.push(item)
        })
        this.$store.commit('setNetworkOverviewTabList', networkTabList)

        const breadcrumbColumnNameUrl = tabList.filter(item => this.$t(item.label) === name)
        if (breadcrumbColumnNameUrl && breadcrumbColumnNameUrl.length > 0) {
          queryType = breadcrumbColumnNameUrl[0].prop
          this.$store.commit('setNetworkOverviewCurrentTab', breadcrumbColumnNameUrl[0])
          this.customTableTitles[0].label = breadcrumbColumnNameUrl[0].label
        }
      } else if (curOperationType === operationType.changeTab) { // 切换tab
        let curTab = this.$store.getters.getNetworkOverviewCurrentTab
        if (!curTab) {
          const list = this.$store.getters.getNetworkOverviewTabList
          const tabObjGroup = list.filter(item => item.checked)
          if (tabObjGroup && tabObjGroup.length > 0) {
            curTab = tabObjGroup[0]
          }
        }
        if (curTab) {
          queryType = curTab.prop
          this.customTableTitles[0].label = curTab.label
          this.$store.commit('setNetworkOverviewCurrentTab', curTab)
        }
      } else if (curOperationType === operationType.secondMenu || curOperationType === operationType.mainMenu) { // 点击第二级菜单，点击菜单
        this.list = this.$_.cloneDeep(this.curTable.tabList)
        this.$store.commit('setNetworkOverviewTabList', this.list)
        const tabObjGroup = this.list.filter(item => item.checked)
        if (tabObjGroup && tabObjGroup.length > 0) {
          const curTab = tabObjGroup[0]
          queryType = curTab.prop
          this.customTableTitles[0].label = curTab.label
          this.$store.commit('setNetworkOverviewCurrentTab', curTab)
        }
      } else {
        let curTab = this.$store.getters.getNetworkOverviewCurrentTab
        if (!curTab) {
          let list = this.$store.getters.getNetworkOverviewTabList
          if (!list || list.length === 0) {
            list = this.$_.cloneDeep(this.networkTabList)
          }
          const tabObjGroup = list.filter(item => item.checked)
          if (tabObjGroup && tabObjGroup.length > 0) {
            curTab = tabObjGroup[0]
          }
        }
        if (curTab) {
          queryType = curTab.prop
          this.customTableTitles[0].label = curTab.label
          this.$store.commit('setNetworkOverviewCurrentTab', curTab)
        }
      }

      if (JSON.stringify(extraParams) === '{}') {
        extraParams = {
          type: queryType || this.networkTabList[0].prop,
          orderBy: this.orderBy ? this.orderBy : 'bytesTotal',
          limit: 10
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
        style = style + 'color:#046ECA;'
      }
      return style
    },
    tableHeaderCellStyle ({ row, column, rowIndex, columnIndex }) {
      return 'border-right:0px;font-size:12px;font-weight:500;padding:4px 0 !important;border-bottom: 1px solid #E2E5EC;'
    },
    getCurTab () {
      let curTab = this.$store.getters.getNetworkOverviewCurrentTab
      if (!curTab) {
        const tabObjGroup = this.list.filter(item => item.checked)
        if (tabObjGroup && tabObjGroup.length > 0) {
          curTab = tabObjGroup[0]
        } else {
          curTab = this.networkTabList[0]
        }
        this.$store.commit('setNetworkOverviewCurrentTab', curTab)
      }
      return curTab
    }
  },
  mounted () {
    // 当前表格相关数据初始化
    this.tableType = this.chart.params ? this.chart.params.name : 'networkOverview'
    this.curTable = this.networkTable[this.tableType] ? this.networkTable[this.tableType] : this.networkTable.networkOverview
    this.hasMetricSearch = this.curTable.hasMetricSearch
    this.customTableTitles = this.$_.cloneDeep(this.curTable.column)
    this.list = this.$_.cloneDeep(this.curTable.tabList)
    this.networkTabList = this.curTable.tabList
    this.activeTab = this.networkTabList[0].label
    this.activeCustomize = ref('tabs')
    this.networkSearchUrl = this.curTable.url
    this.columnNameGroup = this.curTable.bytesColumnNameGroup
    this.cycleColumnNameGroup = this.curTable.bytesCycleColumnNameGroup

    if (this.$store.getters.getNetworkOverviewTabList.length > 0) {
      this.list = this.$store.getters.getNetworkOverviewTabList
    } else {
      this.$store.commit('setNetworkOverviewTabList', this.list)
    }
    const curOperationType = this.$store.getters.getTabOperationType
    if (curOperationType === operationType.thirdMenu) { // 点击的为第三级菜单
      const curTab = this.getCurTab()
      this.customTableTitles[0].label = curTab.label
      this.showTabs = false
      this.$nextTick(() => {
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
      })
    }
  },
  setup (props) {},
  unmounted () {
    this.$store.commit('setNetworkOverviewTabList', this.list)// 保存状态
  }
}
</script>
