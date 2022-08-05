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
                v-loading="loading"
                :cell-style="tableCellStyle"
                :header-cell-style="tableHeaderCellStyle"
                class="tab-table"
                height="100%"
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
                <template v-if="item.prop === 'total'"  >
                  <div class="data-total" >
                    {{scope.row[item.prop]}}
                    <div v-if="scope.row['trend'] === 'up'" class="data-total-trend data-total-trend-red">
                      <i class="cn-icon-rise1 cn-icon"></i>{{scope.row['trendValue']}}
                    </div>
                    <div v-else-if="scope.row['trend'] === 'down'" class="data-total-trend data-total-trend-green">
                      <i class="cn-icon-decline cn-icon"></i>{{scope.row['trendValue']}}
                    </div>
                    <div v-else-if="scope.row['trend'] === 'noChange'" class="data-total-trend data-total-trend-black">
                      <i class="cn-icon-decline cn-icon"></i>{{scope.row['trendValue']}}
                    </div>

                  </div>
                </template>
                <template v-else-if="item.prop === 'tab'" >
                  <div class="data-click" v-if='drillDown' @click="handleTabValue(item.label,scope.row['tab'])">{{scope.row['tab']}}</div>
                  <div v-else >{{scope.row['tab']}}</div>
                </template>
                <template v-else>
                  {{scope.row[item.prop]}}
                </template>
              </template>
            </el-table-column>
          </template>
        </el-table>

      </el-tab-pane>
    </template>

    </el-tabs>
    <div class="tab-search" >
      <div class="search-select"  v-if="drillDown">
        <span>{{$t('network.metric')}}:</span>
        <el-select v-model="metric"
                   class="option__select select-column"
                   popper-class="option-popper metric-select"
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
import { networkOverviewTabs, networkOverviewTabList, operationType, networkOverviewSearchUrl } from '@/utils/constants'
import { get } from '@/utils/http'

export default {
  name: 'NetworkOverviewTabs',
  data () {
    return {
      metric: 'Bits/s',
      orderBy: 'bytesTotal',
      tab: 'ip',
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
      customTableTitles: [
        { label: 'network.ips', prop: 'tab', checked: true, tabColumn: true },
        { label: 'network.total', prop: 'total', checked: true, tabColumn: false },
        { label: 'network.inbound', prop: 'inbound', checked: true, tabColumn: false },
        { label: 'network.outbound', prop: 'outbound', checked: true, tabColumn: false },
        { label: 'network.internal', prop: 'internal', checked: true, tabColumn: false },
        { label: 'network.through', prop: 'through', checked: true, tabColumn: false }
      ],
      list: this.$_.cloneDeep(networkOverviewTabList),
      dragIndex: '',
      dragMetricIndex: '',
      showBackground: false,
      tabUrl: networkOverviewTabList[0].url,
      cycleTotalUrl: networkOverviewTabList[0].cycleTotalUrl,
      tableData: [],
      showTabs: true,
      columnNameGroup: {
        total: 'bytesTotal',
        inbound: 'inboundBitsRate',
        outbound: 'outboundBitsRate',
        internal: 'internalBitsRate',
        through: 'throughBitsRate'
      },
      metricUnit: 'bytes',
      loading: false,
      drillDown:false
    }
  },
  props: {
    chartData: Array,
    timeFilter: Object,
    chart: Object
  },
  components: {

  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        if (this.chartData) {
          this.initData()
        }
      }
    }
  },
  computed: {

  },
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
        this.columnNameGroup = {
          total: 'bytesTotal',
          inbound: 'inboundBitsRate',
          outbound: 'outboundBitsRate',
          internal: 'internalBitsRate',
          through: 'throughBitsRate'
        }
        this.orderBy = 'bytesTotal'
        this.metricUnit = 'bytes'

        if (this.customTableTitles.length === 2) {
          this.customTableTitles = [
            { label: label, prop: 'tab', checked: true, tabColumn: true },
            { label: 'network.total', prop: 'total', checked: this.customTableTitles[1].checked, tabColumn: false },
            { label: 'network.inbound', prop: 'inbound', checked: this.customTableTitles[2] ? this.customTableTitles[2].checked : true, tabColumn: false },
            { label: 'network.outbound', prop: 'outbound', checked: this.customTableTitles[3] ? this.customTableTitles[3].checked : true, tabColumn: false },
            { label: 'network.internal', prop: 'internal', checked: this.customTableTitles[4] ? this.customTableTitles[4].checked : true, tabColumn: false },
            { label: 'network.through', prop: 'through', checked: this.customTableTitles[5] ? this.customTableTitles[5].checked : true, tabColumn: false }
          ]
        } else {
          const titleGroup = []
          this.customTableTitles.forEach(item => {
            if (item.tabColumn) {
              item.label = label
            }
            titleGroup.push(item)
          })
          this.customTableTitles = titleGroup
        }
      } else if (this.metric === 'Packets/s') {
        this.columnNameGroup = {
          total: 'packetsTotal',
          inbound: 'inboundPacketsRate',
          outbound: 'outboundPacketsRate',
          internal: 'internalPacketsRate',
          through: 'throughPacketsRate'
        }
        this.orderBy = 'packetsTotal'
        this.metricUnit = 'packets'
        if (this.customTableTitles.length === 2) {
          this.customTableTitles = [
            { label: label, prop: 'tab', checked: true, tabColumn: true },
            { label: 'network.total', prop: 'total', checked: this.customTableTitles[1].checked, tabColumn: false },
            { label: 'network.inbound', prop: 'inbound', checked: this.customTableTitles[2] ? this.customTableTitles[2].checked : true, tabColumn: false },
            { label: 'network.outbound', prop: 'outbound', checked: this.customTableTitles[3] ? this.customTableTitles[3].checked : true, tabColumn: false },
            { label: 'network.internal', prop: 'internal', checked: this.customTableTitles[4] ? this.customTableTitles[4].checked : true, tabColumn: false },
            { label: 'network.through', prop: 'through', checked: this.customTableTitles[5] ? this.customTableTitles[5].checked : true, tabColumn: false }
          ]
        } else {
          const titleGroup = []
          this.customTableTitles.forEach(item => {
            if (item.tabColumn) {
              item.label = label
            }
            titleGroup.push(item)
          })
          this.customTableTitles = titleGroup
        }
      } else if (this.metric === 'Sessions/s') {
        this.columnNameGroup = {
          total: 'sessionsRate'
        }
        this.orderBy = 'sessions'
        this.metricUnit = 'sessions'
        let totalChecked = true
        this.customTableTitles.forEach(item => {
          if (item.prop === 'total') {
            totalChecked = item.checked
          }
        })
        this.customTableTitles = [
          { label: label, prop: 'tab', checked: true, tabColumn: true },
          { label: 'network.total', prop: 'total', checked: totalChecked, tabColumn: false }
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
      this.loading = true
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
        return tabObjGroup = networkOverviewTabList.filter(item => item.checked)[0]
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
        // 此处的id为tab- name
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
      } else if (curOperationType === operationType.secondMenu) { // 点击的为第二级菜单、或者点击菜单进入、
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

      this.tableData = []
      const tabList = []
      const tableDataTmp = this.chartData.map(item => {
        tabList.push(item[curTab.prop])
        return {
          tab: item[curTab.prop],
          total: item[this.columnNameGroup.total],
          inbound: item[this.columnNameGroup.inbound],
          outbound: item[this.columnNameGroup.outbound],
          internal: item[this.columnNameGroup.internal],
          through: item[this.columnNameGroup.through]
        }
      })
      const queryParams = {}
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
      get(this.gerCycleUrl(), queryParams).then(response => {
        if (response.code === 200) {
          cycleTotalList = response.data.result
          tableDataTmp.forEach(item => {
            const cycle = cycleTotalList.find(i => i[curTab.prop] === item.tab)
            let trend = ''
            let trendPercent = ''
            if (cycle) {
              const totalDiff = item.total - cycle[this.metricUnit]
              if (cycle[this.metricUnit]) {
                trendPercent = Math.round((Math.abs(totalDiff) / cycle[this.metricUnit]) * 100)
                if (totalDiff > 0) {
                  trend = 'up'
                } else if (totalDiff < 0) {
                  trend = 'down'
                } else {
                  trend = 'noChange'
                }
                trendPercent = trendPercent + '%'
              }
            }
            this.tableData.push({
              tab: item.tab,
              total: item.total,
              trend: trend,
              trendValue: trendPercent,
              inbound: item.inbound,
              outbound: item.outbound,
              internal: item.internal,
              through: item.through
            })
          })
          this.loading = false
        } else {
          this.tableData = tableDataTmp
          this.loading = false
        }
      }).catch(e => {
        this.loading = false
      }).finally(e => {
        this.loading = false
      })
    },
    tabChange (index) {
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

      this.tabUrl = tabList[0].url
      this.cycleTotalUrl = tabList[0].cycleTotalUrl
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
      this.loading = true
      this.$emit('getChartData', this.getCurUrl(), queryParams)
    },
    handleTabValue (columnName, columnValue) {
      this.emitter.emit('get-chart-data', columnValue)
      const oldCurTab = this.$store.getters.getNetworkOverviewBeforeTab
      const tabGroup = this.list.filter(item => item.label === columnName)
      if (tabGroup && tabGroup.length > 0) {
        this.$store.commit('setNetworkOverviewBeforeTab', tabGroup[0])
      }
      this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
      this.$store.commit('setTabOperationType', operationType.fourthMenu)

      const queryCondition = []
      const searchProps = tabGroup[0].dillDownProp
      searchProps.forEach(item => {
        queryCondition.push(item + "='" + columnValue + "'")
      })
      this.$store.commit('setQueryCondition', queryCondition.join(' OR '))
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
            this.$store.commit('setBreadcrumbColumnValue', columnValue)
          }
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            if (this.$route.path === child.route) {
              child.columnName = columnName
              child.columnValue = columnValue
              this.$store.commit('setPanelName', columnValue)
              this.$store.commit('setBreadcrumbColumnName', columnName)
              this.$store.commit('setBreadcrumbColumnValue', columnValue)
            }
          })
        }
      })
      this.list.forEach((item, index) => {
        if (item.label === columnName) {
          item.checked = false
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
      this.tabUrl = tab.url
      this.cycleTotalUrl = tab.cycleTotalUrl

      // 如果面包屑的columnValue有值，则不更新valueList
      const valueList = []
      this.tableData.map(item => {
        valueList.push(item.tab)
      })
      this.$store.commit('setBreadcrumbColumnValueList', valueList)
      this.$router.push({
        path: this.$route.path,
        query: {
          t: +new Date()
        }
      })
    },
    handleSearchParams (columnValue) {
      const queryCondition = []
      const curTab = this.getCurTab()
      const searchProps = curTab.dillDownProp
      searchProps.forEach(item => {
        queryCondition.push(item + "='" + columnValue + "'")
      })
      this.$store.commit('setQueryCondition', queryCondition.join(' OR '))
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
        this.tabUrl = curTab.url
        this.cycleTotalUrl = curTab.cycleTotalUrl
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
        this.loading = true
        this.$emit('getChartData', this.getCurUrl(), queryParams, queryParams.q)
      }
    },
    getCurUrl () {
      const condition = this.$store.getters.getQueryCondition
      if (condition) {
        return networkOverviewSearchUrl.drilldownCurUrl
      } else {
        return networkOverviewSearchUrl.curUrl
      }
    },
    handleQueryParams (extraParams) {
      let queryType = ''
      const name = this.$store.getters.getBreadcrumbColumnName
      let tabList = this.$store.getters.getNetworkOverviewTabList
      if (tabList.length === 0 || !tabList) {
        tabList = this.$_.cloneDeep(networkOverviewTabList)
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
        const networkOverviewTabList = []
        tabList.forEach(item => {
          if (this.$t(item.label) === name) {
            item.checked = true
          }
          networkOverviewTabList.push(item)
        })
        this.$store.commit('setNetworkOverviewTabList', networkOverviewTabList)

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
      } else if (curOperationType === operationType.secondMenu) { // 点击第二级菜单，点击菜单
        const list = this.$_.cloneDeep(networkOverviewTabList)
        const tabObjGroup = list.filter(item => item.checked)
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
          if (list.length === 0 || !list) {
            list = this.$_.cloneDeep(networkOverviewTabList)
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
          type: queryType || networkOverviewTabList[0].prop,
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
    gerCycleUrl () {
      const condition = this.$store.getters.getQueryCondition
      if (condition) {
        return networkOverviewSearchUrl.drilldownCycleUrl
      } else {
        return networkOverviewSearchUrl.cycleUrl
      }
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
          curTab = networkOverviewTabList[0]
        }
        this.$store.commit('setNetworkOverviewCurrentTab', curTab)
      }
      return curTab
    }
  },
  mounted () {
    if(this.chart.params && this.chart.params.drillDown){
      this.drillDown = this.chart.params.drillDown
    }

    this.list = this.$_.cloneDeep(networkOverviewTabList)
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
  setup (props) {
    const activeTab = networkOverviewTabList[0].label
    const activeCustomize = ref('tabs')
    return {
      activeTab,
      activeCustomize,
      networkOverviewTabs
    }
  },
  destroyed () {
    this.$store.commit('setNetworkOverviewTabList', this.list)
  }
}
</script>
