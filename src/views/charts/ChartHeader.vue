<template>
  <div
    class="chart-header"
    :class="{
      'chart-header--title-chart': isTitle,
      'is-group-collapse': isGroup,
      'panel-chart-block': isBlock
    }"
  >
    <div class="chart-header__title" v-if="isGroup">
      <span
        @click="groupShow"
        v-if="chartInfo.params && chartInfo.params.collapsable"
        class="arrow-icon"
        :class="{ 'reg-down': chartInfo.params && !chartInfo.params.collapse }"
      >
        <i class="cn-icon cn-icon-arrow-right"></i>
      </span>
      {{ chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name }}
    </div>
    <div
      class="chart-header__title"
      v-else-if="!isBasicTable"
      :class="{ 'chart-header__title--block': isBlock }"
      :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name"
    >
      {{ chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name }}
    </div>
    <template v-if="isBasicTable">
      <div class="chart-header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{
          chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name
        }}</span>
        <span
          v-if="chartInfo.params && chartInfo.params.as"
          class="ip-detail-as"
        >
          as&nbsp;<span style="text-transform: capitalize">{{
            chartInfo.params.as
          }}</span>
        </span>
      </div>
      <div class="header__operations">
        <el-popover
          trigger="hover"
          placement="top"
          :content="chartInfo.remark"
          v-if="chartInfo.remark"
        >
          <template>
            <span class="header__operation-btn"
              ><i class="cn-icon el-icon-info"></i
            ></span>
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
            <el-option
              v-for="item in chartTableTopOptions"
              :key="item"
              :value="item"
              >TOP&nbsp;{{ item }}</el-option
            >
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
            <template
              v-for="item in table.tableColumns.order"
              :key="item.prop"
            >
              <el-option
                :value="item"
                :label="$t(chartTableColumnMapping[item])"
              ></el-option>
            </template>
          </el-select>
        </div>
        <span class="header__operation-btn" @click="refresh"
          ><i class="cn-icon cn-icon-refresh"></i
        ></span>
      </div>
    </template>
    <template v-else-if="isActiveIpTable">
      <div class="header__operations">
        <div class="header__operation header__operation--table">
          <el-select
            size="mini"
            v-model="activeIpTable.orderBy"
            class="option__select select-column"
            :placeholder="$t('overall.field')"
            popper-class="option-popper"
            @change="activeIpTableLimitChange"
          >
            <template
              v-for="item in chartActiveIpTableOrderOptions"
              :key="item"
            >
              <el-option :value="item">{{ item }}</el-option>
            </template>
          </el-select>
        </div>
      </div>
    </template>

    <template v-else-if="isEchartsWithTable">
      <div class="header__operations">
        <div class="header__operation header__operation--table">
          <el-select
            size="mini"
            v-model="copyOrderPieTable"
            class="option__select select-column"
            placeholder=""
            popper-class="option-popper"
            @change="orderPieTableChange"
          >
            <el-option
              v-for="item in chartPieTableTopOptions"
              :key="item.value"
              :value="item.value"
              >&nbsp;{{ item.name }}</el-option
            >
          </el-select>
        </div>
        <span class="header__operation-btn" @click="refresh"
          ><i class="cn-icon cn-icon-refresh"></i
        ></span>
      </div>
    </template>

    <template v-else-if="isAlarmInfo">
      <div class="cn-chart-header-button">
        <el-button-group class="cn-chart-header-button-group">
          <el-button
            :class="isFocusAll ? 'cn-chart-header-button-all' : ''"
            @click="tabHandleClick('All')"
            size="small"
            >{{ $t('dns.all') }}</el-button
          >
          <el-button
            :label="value"
            :name="value"
            plain:true
            v-for="(value, key) in eventSeverity"
            :key="key"
            size="small"
            :class="isFocus === value ? 'cn-chart-header-button-' + value : ''"
            @click="tabHandleClick(value)"
          >
            {{ value }}
          </el-button>
        </el-button-group>
        <div>
          <span class="header__operation-btn" @click="refresh"
            ><i class="cn-icon cn-icon-refresh"></i
          ></span>
        </div>
      </div>
    </template>

    <chart-error :isError="isError" :errorInfo="errorInfo"></chart-error>
    <div
      class="chart-header__tools"
      v-if="
        !isTitle &&
        !isTabs &&
        !isBasicTable &&
        !isActiveIpTable &&
        !isEchartsWithTable &&
        !isAlarmInfo
      "
    >
      <div
        class="panel__time"
        v-if="chartInfo.params && chartInfo.params.showTimeTool"
      >
        <date-time-range
          class="date-time-range"
          :start-time="chartTimeFilter.startTime"
          :end-time="chartTimeFilter.endTime"
          :date-range="chartTimeFilter.dateRangeValue"
          ref="dateTimeRange"
          @change="reload"
        />
        <time-refresh
          class="date-time-range"
          @change="timeRefreshChange"
          :end-time="chartTimeFilter.endTime"
        />
      </div>
      <template v-else-if="!isBlock">
        <el-popover
          trigger="click"
          placement="top"
          :content="chartInfo.remark"
          v-if="chartInfo.remark"
        >
          <template #reference>
            <span class="header__operation-btn"
              ><i class="cn-icon el-icon-info"></i
            ></span>
          </template>
        </el-popover>
        <span
          class="header__operation-btn"
          @click="refresh"
          v-if="showRefreshButton"
          ><i class="cn-icon cn-icon-refresh"></i
        ></span>
      </template>
    </div>
  </div>
</template>

<script>
import {
  isTitle,
  isTabs,
  isBlock,
  isTable,
  isActiveIpTable,
  isBasicTable,
  isGroup,
  isEchartsWithTable,
  isAlarmInfo
} from './charts/tools'
import ChartError from '@/views/charts/ChartError'
import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'
import {
  chartTableTopOptions,
  chartActiveIpTableOrderOptions,
  chartPieTableTopOptions,
  eventSeverity,
  chartTableColumnMapping, panelTypeAndRouteMapping
} from '@/utils/constants'
import { useRouter } from 'vue-router'

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
    orderPieTable: String
  },
  components: {
    ChartError
  },
  data () {
    return {
      chartTableColumnMapping,
      dropdownMenuShow: false,
      errorText: '',
      isFocus: false,
      isFocusAll: true,
      activeIpTable: {
        // ActiveIpTable select
        orderBy: 'machine',
        tableData: [
          {
            name: '192.168.20.21',
            num: 111
          },
          {
            name: '192.168.20.22',
            num: 345
          },
          {
            name: '192.168.20.23',
            num: 111
          },
          {
            name: '192.168.20.24',
            num: 345
          },
          {
            name: '192.168.20.25',
            num: 111
          },
          {
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
      if (this.isAlarmInfo) {
        this.tabHandleClick('All')
        this.emitter.emit('chart-info', 'All')
      }
    },
    timeRefreshChange () {
      // 不是自选时间
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.chartTimeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      } else {
        this.$emit('refresh', this.chartTimeFilter)
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
      this.$emit('refresh', this.chartTimeFilter)
    },
    tableLimitChange () {
      this.$emit('tableChange')
    },
    activeIpTableLimitChange () {
      this.$emit('tableChange')
    },
    orderPieTableChange () {
      this.$emit('orderPieTableChange', this.copyOrderPieTable)
    },
    tabHandleClick (item) {
      this.isFocus = item
      if (item === 'All') {
        this.isFocusAll = true
      } else {
        this.isFocusAll = false
      }
      this.$emit('tabHandleClick', item)
    }
  },
  watch: {
    isFocus: {
      deep: true,
      handler (n) {}
    }
  },
  computed: {
    showRefreshButton () {
      // 自己是group且父元素是block时，不显示刷新按钮
      // TODO 父元素是block，且只有自己一个子元素时，不显示刷新按钮
      const isGroupAndParentIsBlock =
        this.$_.get(this.chartInfo.parent, 'type') === 95 && this.isGroup
      return !isGroupAndParentIsBlock
    }
  },
  setup (props) {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    // entity详情内的chart时间工具不是公共的，需要单独定义
    const chartTimeFilter = ref({ startTime, endTime, dateRangeValue })
    // 复制一份prop中需要被组件v-model的内容，避免报错
    const copyOrderPieTable = ref(props.orderPieTable)
    return {
      chartTimeFilter,
      chartTableTopOptions,
      chartActiveIpTableOrderOptions,
      chartPieTableTopOptions,
      eventSeverity,
      copyOrderPieTable,
      isTitle: isTitle(props.chartInfo.type),
      isBlock: isBlock(props.chartInfo.type),
      isTabs: isTabs(props.chartInfo.type),
      isTable: isTable(props.chartInfo.type),
      isBasicTable: isBasicTable(props.chartInfo.type),
      isActiveIpTable: isActiveIpTable(props.chartInfo.type),
      isEchartsWithTable: isEchartsWithTable(props.chartInfo.type),
      isGroup: isGroup(props.chartInfo.type),
      isAlarmInfo: isAlarmInfo(props.chartInfo.type)
    }
  }
}
</script>
