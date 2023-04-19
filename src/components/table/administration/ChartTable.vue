<template>
  <el-table
          id="chartTable"
          ref="dataTable"
          :data="tableData"
          :height="height"
          border
          @header-dragend="dragend"
          @sort-change="tableDataSort"
          @selection-change="selectionChange"
  >
    <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="55">
    </el-table-column>
    <el-table-column
            v-for="item in customTableTitles"
            :key="item.prop"
            :fixed="item.fixed"
            :label="item.label"
            :min-width="`${item.minWidth}`"
            :prop="item.prop"
            :resizable="true"
            :sort-orders="['ascending', 'descending']"
            :sortable="item.sortable"
            :width="`${item.width}`"
            class="data-column"
    >
      <template #header>
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template  #default="scope" :column="item">
        <template v-if="item.prop === 'name'">
          <template v-if="scope.row.i18n">
            <span>{{$t(scope.row.i18n)}}</span>
          </template>
          <template v-else-if="scope.row.name">
            <span>{{scope.row.name}}</span>
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'buildIn'">
          <template v-if="scope.row[item.prop]==1">
            {{$t('config.chart.buildIn.yes')}}
          </template>
          <template v-else-if="scope.row[item.prop]==0">
             {{$t('config.chart.buildIn.no')}}
          </template>
          <template v-else>
            {{scope.row[item.prop]}}
          </template>
        </template>
        <template v-else-if="item.prop === 'panelId'">
          <template v-if="scope.row[item.prop]==panelTypeAndRouteMapping.trafficSummary">
            {{$t('trafficSummary.trafficSummary')}}
          </template>
          <template v-else-if="scope.row[item.prop]==panelTypeAndRouteMapping.networkAppPerformance">
             {{$t('networkAppPerformance.networkAppPerformance')}}
          </template>
          <template v-else-if="scope.row[item.prop]==panelTypeAndRouteMapping.dnsServiceInsights">
            {{$t('dnsServiceInsights.dnsServiceInsights')}}
          </template>
          <template v-else-if="scope.row[item.prop]==panelTypeAndRouteMapping.ipEntityDetail">
            {{$t('entities.ipEntityDetail')}}
          </template>
          <template v-else-if="scope.row[item.prop]==panelTypeAndRouteMapping.domainEntityDetail">
            {{$t('entities.domainEntityDetail')}}
          </template>
          <template v-else-if="scope.row[item.prop]==panelTypeAndRouteMapping.appEntityDetail">
            {{$t('entities.appEntityDetail')}}
          </template>
          <template v-else>
            {{scope.row[item.prop]}}
          </template>
        </template>
        <span v-else>{{scope.row[item.prop]}}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { panelTypeAndRouteMapping } from '@/utils/constants'

export default {
  name: 'chartTable',
  mixins: [table],
  data () {
    return {
      panelTypeAndRouteMapping: panelTypeAndRouteMapping,
      tableTitle: [ // 原table列
      
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 110,
          sortable: 'custom'
        }, {
          label: this.$t('config.chart.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('config.chart.params'),
          prop: 'params',
          show: true
        }, {
          label: this.$t('config.chart.panel'),
          prop: 'panelId',
          show: true
        }, {
          label: this.$t('config.chart.i18n'),
          prop: 'i18n',
          show: true
        }, {
          label: this.$t('config.chart.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('config.chart.x'),
          prop: 'x',
          show: true
        }, {
          label: this.$t('config.chart.y'),
          prop: 'y',
          show: true
        }, {
          label: this.$t('config.chart.w'),
          prop: 'w',
          show: true
        }, {
          label: this.$t('config.chart.h'),
          prop: 'h',
          show: true
        }, {
          label: this.$t('config.chart.buildIn'),
          prop: 'buildIn',
          show: true
        }, {
          label: this.$t('config.chart.remark'),
          prop: 'remark',
          show: true
        }
      ]
    }
  }
}
</script>
