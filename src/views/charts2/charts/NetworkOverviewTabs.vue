<template>
  <div class="tabs">
    <el-tabs v-model="activeTab"
             class="cn-chart__tabs"
             @tab-click="handleClick"
    >
      <el-tab-pane  v-for="(tab,index) in networkOverviewTabs"
                    :label="$t(tab)"
                    :name="tab"
                    :key="index"
                    :ref="`chart-tab-${index}`"
                    class="tab-pane"

      >

        <el-table
                id="tabTable"
                ref="dataTable"
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

    </el-tabs>
    <div class="tab-search" >
      <div class="search-select" >
        <span>{{$t('network.metric')}}:</span>
        <el-select v-model="metric"
                   class="option__select select-column"
                   placeholder=""
                   popper-class="option-popper"
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
      <div class="search-customize-tab">
        <i class="cn-icon-gear cn-icon icon-gear"></i>  {{$t('network.customizeTabs')}}
      </div>

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
          categories: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '33%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trendValue: '6%',
          trend: '',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '6%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: '',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'up',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        },
        {
          categories: 'cate',
          total: 10,
          trend: 'down',
          trendValue: '2%',
          inbound: 0.1,
          outbound: 0.89
        }
      ],
      customTableTitles: [
        { label: 'network.categories', prop: 'categories' },
        { label: 'network.total', prop: 'total' },
        { label: 'network.inbound', prop: 'inbound' },
        { label: 'network.outbound', prop: 'outbound' }
      ]
    }
  },
  methods: {
    handleClick (tab) {
      console.log(tab)
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
  setup (props) {
    let activeTab = ref(networkOverviewTabs[0])
    if (props.chartInfo) {
      if (!_.isEmpty(props.chartInfo.children)) {
        activeTab = `${props.chartInfo.children[0].id}`
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
