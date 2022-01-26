<template>
  <div class="chart-header" :class="{'chart-header--title-chart': isTitle}">
    <div class="chart-header__title" v-if="!isCurrentTable&&(isGroup)" :class="{'chart-header__title--block': isBlock}">
      <span @click="groupShow"> <i class="cn-icon" :class="chartInfo.params&&chartInfo.params.collpase ? 'cn-icon-arrow-right': 'cn-icon-arrow-down'"></i></span>
      {{chartInfo.name}}
    </div>
    <div class="chart-header__title" v-else-if="!isCurrentTable" :class="{'chart-header__title--block': isBlock}">{{chartInfo.name}}</div>
    <template v-if="isCurrentTable">
      <div class="chart-header__title">
<!--        -->
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
        <span
            v-if="chartInfo.params && chartInfo.params.as"
            class="ip-detail-as"
        >
          as&nbsp;<span style="text-transform: capitalize">{{chartInfo.params.as}}</span>
        </span>
      </div >
      <div class="header__operations">
        <el-popover trigger="hover" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
          <template>
            <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
          </template>
        </el-popover>
        <div class="header__operation header__operation--table">
          <el-select
              size="mini"
              v-model="table.limit"
              class="option__select select-topn"
              placeholder=""
              popper-class="option-popper"
              @change="tableLimitChange"
          >
            <el-option v-for="item in chartTableTopOptions" :key="item" :value="item">TOP&nbsp;{{item}}</el-option>
            <template #prefix>TOP&nbsp;</template>
          </el-select>
        </div>
        <div class="header__operation header__operation--table">
          <el-select
              size="mini"
              v-model="table.orderBy"
              class="option__select select-column"
              :placeholder="$t('overall.field')"
              popper-class="option-popper"
              @change="tableLimitChange"
          >
            <template v-for="(item, index) in table.tableColumns" :key="item.prop">
              <el-option v-if="index > 0" :value="item.prop">{{item.prop}}</el-option>
            </template>
          </el-select>
        </div>
        <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
      </div>
    </template>
    <template v-else-if="isActiveIpTable">
      <div class="header__operations">
        <div class="header__operation header__operation--table" >
        <el-select
            size="mini"
            v-model="activeIpTable.orderBy"
            class="option__select select-column"
            :placeholder="$t('overall.field')"
            popper-class="option-popper"
            @change="activeIpTableLimitChange"
        >
          <template v-for="item in chartActiveIpTableOrderOptions" :key="item">
            <el-option :value="item">{{item}}</el-option>
          </template>
        </el-select>
      </div>
      </div>
    </template>

    <template v-else-if="isEchartsWithTable">
      <div class="header__operations">
        <div class="header__operation header__operation--table" >
          <el-select
                  size="mini"
                  v-model="orderPieTable"
                  class="option__select select-column"
                  placeholder=""
                  popper-class="option-popper"
                  @change="orderPieTableChange"
          >
            <el-option v-for="item in chartPieTableTopOptions" :key="item.value" :value="item.value">&nbsp{{item.name}}</el-option>
          </el-select>
        </div>
        <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
      </div>
    </template>

    <chart-error :isError="isError" :errorInfo="errorInfo"></chart-error>
    <div class="chart-header__tools" v-if="!isTitle && !isTabs && !isCurrentTable && !isActiveIpTable && !isEchartsWithTable">
      <div class="panel__time" v-if="chartInfo.params && chartInfo.params.showTimeTool">
        <date-time-range class="date-time-range" :start-time="chartTimeFilter.startTime" :end-time="chartTimeFilter.endTime" ref="dateTimeRange" @change="reload"/>
        <time-refresh class="date-time-range" @change="timeRefreshChange" :end-time="chartTimeFilter.endTime"/>
      </div>
      <template v-else-if="!isBlock">
        <el-popover trigger="click" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
          <template #reference>
            <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
          </template>
        </el-popover>
        <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
      </template>
    </div>
  </div>
</template>

<script>
import { isTitle, isTabs, isBlock, isTable, isActiveIpTable, isCurrentTable, isGroup, isEchartsWithTable } from './charts/tools'
import ChartError from '@/components/charts/ChartError'
import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'
import { chartTableTopOptions, chartActiveIpTableOrderOptions, chartPieTableTopOptions } from '@/utils/constants'

export default {
  name: 'ChartHeader',
  props: {
    chartInfo: Object,
    errorInfo: {
      type: String,
      default: ''
    },
    isError: {
      type: Boolean,
      default: false
    },
    table: Object,
    orderPieTable: Object
  },
  components: {
    ChartError
  },
  data () {
    return {
      dropdownMenuShow: false,
      errorText: '',

      activeIpTable: { // ActiveIpTable select
        orderBy: 'machine',
        tableData: [
          {
            name: '192.168.20.21',
            num: 111

          }, {
            name: '192.168.20.22',
            num: 345
          }, {
            name: '192.168.20.23',
            num: 111

          }, {
            name: '192.168.20.24',
            num: 345
          }, {
            name: '192.168.20.25',
            num: 111

          }, {
            name: '192.168.20.26',
            num: 345
          }
        ] // table的所有数据
      }
    }
  },
  methods: {
    refresh () {
      this.$emit('refresh')
    },
    timeRefreshChange () {
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.chartTimeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      }
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
    },
    groupShow () {
      this.$emit('groupShow', this.chartInfo)
    },
    dateTimeRangeChange (s, e, v) {
      this.chartTimeFilter = { startTime: s, endTime: e, dateRangeValue: v }
    },
    tableLimitChange () {
      this.$emit('tableChange')
    },
    activeIpTableLimitChange () {
      this.$emit('tableChange')
    },
    orderPieTableChange () {
      this.$emit('orderPieTableChange', this.orderPieTable)
    }
  },
  setup (props) {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    // entity详情内的chart时间工具不是公共的，需要单独定义
    const chartTimeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      chartTimeFilter,
      chartTableTopOptions,
      chartActiveIpTableOrderOptions,
      chartPieTableTopOptions,
      isTitle: isTitle(props.chartInfo.type),
      isBlock: isBlock(props.chartInfo.type),
      isTabs: isTabs(props.chartInfo.type),
      isTable: isTable(props.chartInfo.type),
      isCurrentTable: isCurrentTable(props.chartInfo.type),
      isActiveIpTable: isActiveIpTable(props.chartInfo.type),
      isEchartsWithTable: isEchartsWithTable(props.chartInfo.type),
      isGroup: isGroup(props.chartInfo.type)
    }
  }
}
</script>
