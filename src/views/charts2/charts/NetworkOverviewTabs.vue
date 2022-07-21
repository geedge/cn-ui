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
          <el-table-column
                  v-for="(item, index) in customTableTitles"
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
        </el-table>

      </el-tab-pane>
    </template>

    </el-tabs>
    <div class="tab-search" >
      <div class="search-select" >
        <span>{{$t('network.metric')}}:</span>
        <el-select v-model="metric"
                   class="option__select select-column"
                   placeholder=""
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
      <el-popover placement="left"
                  :width="280"
                  :show-arrow="false"
                  :append-to-body="false"
                  :offset="-91"
                  :hide-after="0"
                  title="Customize"
                  popper-class="customize-tab__popper"
                  trigger="click">
        <template #reference>
          <div class="search-customize-tab">
            <i class="cn-icon-gear cn-icon icon-gear"></i>  {{$t('network.customize')}}
          </div>
        </template>

        <div>
          <transition-group name="drag" class="list" tag="ul">
            <li v-for="(item, index) in list"
                    :key="item.label"
                    class="list-item"
            >
              <i class="cn-icon-sort cn-icon icon-drag"
                 @dragenter="dragenter($event, index)"
                 @dragover="dragover($event, index)"
                 @dragstart="dragstart(index)"
                 draggable="true"
              ></i> <el-checkbox @change="tabChange" v-model="item.checked"  :label="$t(item.label) " size="small" />
            </li>
          </transition-group>
        </div>
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
      metric: '',
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
          ips: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '33%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trendValue: '6%',
          trend: '',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '6%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: '',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          ips: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        }
      ],
      customTableTitles: [
        { label: 'network.ips', prop: 'ips' },
        { label: 'network.total', prop: 'total' },
        { label: 'network.inbound', prop: 'inbound' },
        { label: 'network.outbound', prop: 'outbound' }
      ],
      list: [
        {
          label: 'network.ips',
          checked: true
        }, {
          label: 'network.countries',
          checked: true
        }, {
          label: 'network.asns',
          checked: true
        }, {
          label: 'network.applications',
          checked: true
        }, {
          label: 'network.providers',
          checked: true
        }, {
          label: 'network.domains',
          checked: true
        }, {
          label: 'network.protocols',
          checked: true
        }, {
          label: 'network.idcTenants',
          checked: true
        }, {
          label: 'network.provinces',
          checked: false
        }, {
          label: 'network.cities',
          checked: false
        }, {
          label: 'network.isps',
          checked: false
        }, {
          label: 'network.applicationCategories',
          checked: false
        }, {
          label: 'network.domainCategories',
          checked: false
        }, {
          label: 'network.hosts',
          checked: false
        }, {
          label: 'network.snis',
          checked: false
        }, {
          label: 'network.protocolPorts',
          checked: false
        }
      ],
      dragIndex: '',
      enterIndex: '',
      endIndex: ''
    }
  },
  components: {

  },
  methods: {
    shuffle () {
      this.list = _.shuffle(this.list)
    },
    tabChange () {
      const tabList = this.list.filter(item => item.checked == true)
      if (tabList && tabList.length > 0) {
        this.activeTab = tabList[0].label
        this.customTableTitles[0].label = this.$t(tabList[0].label)
      }
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
    handleClick (tab) {
      this.customTableTitles[0].label = tab.paneName
      // this.activeTab = tab.paneName
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

    return {
      activeTab,
      networkOverviewTabs
      // dataList
    }
  }
}
</script>
