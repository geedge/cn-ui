<template>
  <div class="tabs">
    <el-tabs v-model="activeTab"
             class="cn-chart__tabs"
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
                <div class="data-total" >
                  {{scope.row[item.prop]}}
                  <template v-if="item.prop === 'total'"  >
                    <div v-if="scope.row['trend'] === 'up'" class="data-total-trend data-total-trend-red">
                      <i class="cn-icon-rise1 cn-icon"></i>{{scope.row['trendValue']}}
                    </div>
                    <div v-else-if="scope.row['trend'] === 'down'" class="data-total-trend data-total-trend-green">
                      <i class="cn-icon-decline cn-icon"></i>{{scope.row['trendValue']}}
                    </div>
                    <div v-else class="data-total-trend data-total-trend-black">
                      <i class="cn-icon-constant cn-icon"></i>
                    </div>
                  </template>
                </div>
              </template>
            </el-table-column>
          </template>
        </el-table>

      </el-tab-pane>
    </template>

    </el-tabs>
    <div class="tab-search" >
      <div class="search-select" >
        <span>{{$t('network.metric')}}:</span>
        <el-select v-model="metric"
                   class="option__select select-column"
                   popper-class="option-popper metric-select"
                   :popper-append-to-body="false"
                   size="mini">
          <el-option
                  v-for="item in options"
                  :key="item.value"
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
            <el-tab-pane :label="$t('network.tabs')" name="tabs" width="50%"  >
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
                  ></i> <el-checkbox @change="tabChange" v-model="item.checked"  :label="$t(item.label) " size="small"  :key="item.label"/>
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
import _ from 'lodash'
import { ref } from 'vue'
import { networkOverviewTabs } from '@/utils/constants'

export default {
  name: 'NetworkOverviewTabs',
  data () {
    return {
      metric: 'Bits',
      options: [
        {
          value: 'Bits',
          label: 'Bits'
        },
        {
          value: 'Bits2',
          label: 'Bits2'
        },
        {
          value: 'Bits3',
          label: 'Bits3'
        }
      ],
      tableData: [
        {
          tab: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '33%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trendValue: '6%',
          trend: '',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '6%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: '',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          tab: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        }
      ],
      customTableTitles: [
        { label: 'network.ips', prop: 'tab', checked: true, tabColumn: true },
        { label: 'network.total', prop: 'total', checked: true, tabColumn: false },
        { label: 'network.inbound', prop: 'inbound', checked: true, tabColumn: false },
        { label: 'network.outbound', prop: 'outbound', checked: true, tabColumn: false }
      ],
      list: [
        {
          label: 'network.ips',
          prop: 'tab',
          checked: true
        }, {
          label: 'network.countries',
          prop: 'tab',
          checked: true
        }, {
          label: 'network.asns',
          prop: 'tab',
          checked: true
        }, {
          label: 'network.applications',
          prop: 'tab',
          checked: true
        }, {
          label: 'network.providers',
          prop: 'tab',
          checked: true
        }, {
          label: 'network.domains',
          prop: 'tab',
          checked: true
        }, {
          label: 'network.protocols',
          prop: 'tab',
          checked: true
        }, {
          label: 'network.idcTenants',
          prop: 'tab',
          checked: true
        }, {
          label: 'network.provinces',
          prop: 'tab',
          checked: false
        }, {
          label: 'network.cities',
          prop: 'tab',
          checked: false
        }, {
          label: 'network.isps',
          prop: 'tab',
          checked: false
        }, {
          label: 'network.applicationCategories',
          prop: 'tab',
          checked: false
        }, {
          label: 'network.domainCategories',
          prop: 'tab',
          checked: false
        }, {
          label: 'network.hosts',
          prop: 'tab',
          checked: false
        }, {
          label: 'network.snis',
          prop: 'tab',
          checked: false
        }, {
          label: 'network.protocolPorts',
          prop: 'tab',
          checked: false
        }
      ],
      dragIndex: '',
      dragMetricIndex: '',
      showBackground: false
    }
  },
  components: {

  },
  methods: {
    shuffle () {
      this.list = _.shuffle(this.list)
    },
    handleCustomizeButton (status) {
      console.log(this.showBackground)
      this.showBackground = status
    },
    tabChange () {
      const tabList = this.list.filter(item => item.checked == true)
      if (tabList && tabList.length > 0) {
        this.activeTab = tabList[0].label
        this.customTableTitles.forEach(item => {
          if (item.tabColumn) {
            item.label = tabList[0].label
            item.prop = tabList[0].prop
          }
        })
      }
    },
    metricChange () {
      // const metricList = this.customTableTitles.filter(item => item.checked == true)
      // if (metricList && metricList.length > 0) {
      // this.activeCustomize = metricList[0].label
      // this.customTableTitles[0].label = this.$t(metricList[0].label)
      // }
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
      this.customTableTitles.forEach(item => {
        if (item.tabColumn) {
          item.label = tab.paneName
        }
      })
      // this.customTableTitles[0].label = tab.paneName
      // this.activeTab = tab.paneName
    },
    handleCustomizeClick (tab) {
      // this.customTableTitles[0].label = tab.paneName
      this.activeCustomize = tab.paneName
    },
    tableCellStyle ({ row, column, rowIndex, columnIndex }) {
      let style = 'border-right:0px;font-size:12px;padding:7px 0 !important;border-bottom: 1px solid #ECECEC;'
      if (rowIndex === this.tableData.length - 1) {
        style = style + 'border-bottom:0px !important;'
      }
      if (columnIndex === 0) {
        style = style + 'color:#046ECA;'
      }
      return style
    },
    tableHeaderCellStyle ({ row, column, rowIndex, columnIndex }) {
      return 'border-right:0px;font-size:12px;font-weight:500;padding:4px 0 !important;border-bottom: 1px solid #E2E5EC;'
    }
  },
  mounted () {
  },
  setup (props) {
    const activeTab = ref(networkOverviewTabs[0])
    if (props.chartInfo) {
      if (!_.isEmpty(props.chartInfo.children)) {
        // activeTab = `${props.chartInfo.children[0].id}`
      }
      // const dataList = [...props.chartInfo.children]
    }
    const activeCustomize = ref('tabs')

    return {
      activeTab,
      activeCustomize,
      networkOverviewTabs
      // dataList
    }
  }
}
</script>
