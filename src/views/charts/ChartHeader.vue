<template>
  <div class="chart-header" :class="{'chart-header--title-chart': isTitle}">
    <div class="chart-header__title" :class="{'chart-header__title--block': isBlock}">{{chartInfo.name}}</div>
    <chart-error :isError="isError" :errorInfo="errorInfo"></chart-error>
    <div class="chart-header__tools" v-if="!isTitle && !isTabs">
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
import { isTitle, isTabs, isBlock } from './charts/tools'
import ChartError from '@/components/charts/ChartError'
import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'

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
    }
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
    }
  },
  setup (props) {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    // entity详情内的chart时间工具不是公共的，需要单独定义
    const chartTimeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      chartTimeFilter,
      isTitle: isTitle(props.chartInfo.type),
      isBlock: isBlock(props.chartInfo.type),
      isTabs: isTabs(props.chartInfo.type)
    }
  }
}
</script>
