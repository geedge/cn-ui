<template>
  <div class="cn-chart__alarm-info">
    <div class="no-data" v-if="isNoData">No data</div>
    <template v-else>
      <div class="alarm-info__box">
        <div
          class="box__body"
          v-for="(value, index) in chartData ? chartData : []"
          :key="index"
        >
          <div class="body__content">
            <div class="content__icon-box">
              <div
                class="icon-box__icon"
                :style="{
                  background: eventSeverityColor[value.eventSeverity], opacity: 0.1}"
              ></div>
              <i
                class="cn-icon cn-icon-alert"
                :style="{
                  color: eventSeverityColor[value.eventSeverity], opacity: 1}"
              ></i>
            </div>
            <div class="content__text-box">
              <div class="text-box__title">
                <div v-if="value.entityType === 'domain'" :title="value.domain">
                  <span>{{ value.domain }}</span>
                </div>
                <div v-if="value.entityType === 'app'" :title="value.appName">
                  <span>{{ value.appName }}</span>
                </div>
                <div v-if="value.entityType === 'ip'" :title="value.serverIp">
                  <span>{{ value.serverIp }}</span>
                </div>
              </div>

              <div class="text-box__text">
                <div
                  class="text__type"
                  :style="{
                    color: eventSeverityColor[value.eventSeverity],
                    'border-color': eventSeverityColor[value.eventSeverity],
                  }"
                  :title="value.eventType"
                >
                  {{ value.eventType }}
                </div>
                <div class="text__time-box">
                  <i class="cn-icon cn-icon-time2"></i>

                  <div class="time-box__start-time">
                    &nbsp; {{ $t(`dns.startTime`) }}:&nbsp;&nbsp;&nbsp;
                  </div>
                  <div>
                    {{value.startTime ? dateFormatByAppearance(value.startTime) : '-'}}
                  </div>
                </div>

                <div class="text__duration-box">
                  <i class="cn-icon cn-icon-time2"></i>
                  <div class="time-box__start-time">
                    &nbsp;{{ $t(`dns.duration`) }}:&nbsp;&nbsp;&nbsp;
                  </div>

                  <div
                    class="duration-box__circle"
                    :style="{
                      background: eventSeverityColor[value.eventSeverity],
                    }"
                  ></div>
                  &nbsp;&nbsp;&nbsp;
                  <div>
                    {{unitConvert(value.endTime - value.startTime, 'time').join(' ')}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <chart-table-pagination
        ref="tablePagination"
        class="alarm-info__pagination"
        :total="alarmInfoCount.result"
        :pageSizeForAlarm="pageSizeForAlarm"
        v-model:currentPage="pageNo"
        @pageJump="pageJump"
      ></chart-table-pagination>
    </template>
  </div>
</template>

<script>
import { eventSeverityColor } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import ChartTablePagination from '@/views/charts/charts/ChartTablePagination'
import { get } from '@/utils/http'
import { api } from '@/utils/api'

export default {
  name: 'isAlarmInfo',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    tabHandleClickType: String,
    queryParams: Object
  },
  data () {
    return {
      pageSizeForAlarm: 9,
      eventSeverityColor: eventSeverityColor,
      pageNo: 1,
      alarmInfoCount: {},
      fromChartData: '',
      startTime: '',
      endTime: ''
    }
  },
  computed: {
    isNoData () {
      let isNoData = true
      if (!this.$_.isEmpty(this.chartData)) {
        isNoData = false
      }
      return isNoData
    }
  },
  watch: {
    tabHandleClickType: {
      deep: true,
      handler (n) {
        this.$nextTick(() => {
          this.getData(1, n)
        })
      }
    },
    queryParams: {
      deep: true,
      handler (n) {
        if (n) {
          this.startTime = n.startTime
          this.endTime = n.endTime
          this.getCount()
        }
      }
    }
  },
  components: {
    ChartTablePagination
  },
  methods: {
    unitConvert,
    getCount () {
      const countQuery = {
        startTime: this.startTime,
        endTime: this.endTime,
        eventSeverity:
          this.tabHandleClickType === 'All' ? '' : this.tabHandleClickType
      }
      this.$nextTick(() => {
        get(api.dashboard.DnsServiceInsights.alarmInfoCount, {
          ...countQuery
        }).then((response) => {
          if (response.code === 200) {
            this.alarmInfoCount = response.data
          }
        })
      })
    },
    getData (val, n) {
      this.pageNo = val
      const extraParams = {
        pageNo: val,
        pageSize: this.pageSizeForAlarm,
        eventSeverity: n
          ? n === 'All'
            ? ''
            : n
          : this.tabHandleClickType === 'All'
            ? ''
            : this.tabHandleClickType
      }
      const query = {
        startTime: this.queryParams.startTime,
        endTime: this.queryParams.endTime,
        eventSeverity:
          this.tabHandleClickType === 'All' ? '' : this.tabHandleClickType
      }
      this.$emit('getAlarmInfo', null, extraParams, false, {
        startTime: query.startTime,
        endTime: query.endTime
      })
      get(api.dashboard.DnsServiceInsights.alarmInfoCount, {
        ...query
      }).then((response) => {
        if (response.code === 200) {
          this.alarmInfoCount = response.data
        }
      })
    },
    pageJump (val) {
      this.getData(val)
    }
  },
  mounted () {
    const _this = this
    this.emitter.on('chart-info', function (value) {
      _this.getData(1, value)
    })
    this.getCount()
  }
}
</script>
