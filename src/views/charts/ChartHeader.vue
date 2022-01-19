<template>
  <div class="chart-header" :class="{'chart-header--title-chart': isTitle}">
    <div class="chart-header__title" v-if="!isTable" :class="{'chart-header__title--block': isBlock}">{{chartInfo.name}}</div>
    <template v-if="isTable">
      <div class="chart-header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
        <span
            v-if="chartInfo.params && chartInfo.params.as"
            class="ip-detail-as"
        >
          as&nbsp;<span style="text-transform: capitalize">{{chartInfo.params.as}}</span>
        </span>
      </div>
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
    <chart-error :isError="isError" :errorInfo="errorInfo"></chart-error>
    <div class="chart-header__tools" v-if="!isTitle && !isTabs && !isTable">
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
import { isTitle, isTabs, isBlock, isTable } from './charts/tools'
import ChartError from '@/components/charts/ChartError'
import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'
import {chartTableTopOptions} from "@/utils/constants";

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
    table: Object
  },
  components: {
    ChartError
  },
  data () {
    return {
      dropdownMenuShow: false,
      errorText: ''
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
    dateTimeRangeChange (s, e, v) {
      this.chartTimeFilter = { startTime: s, endTime: e, dateRangeValue: v }
    },
    tableLimitChange () {
      this.$emit('tableChange')
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
      isTitle: isTitle(props.chartInfo.type),
      isBlock: isBlock(props.chartInfo.type),
      isTabs: isTabs(props.chartInfo.type),
      isTable: isTable(props.chartInfo.type)
    }
  }
}
</script>
