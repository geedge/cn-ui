<template>
  <div class="cn-chart-alarm-info">
    <div class="no-data" v-if="isNoData">No data</div>
    <template v-else>
      <div class="cn-chart-alarm-info-mainContent">
        <div
          class="cn-chart-alarm-content"
          v-for="(value, index) in chartData ? chartData : []"
          :key="index"
        >
          <div class="cn-alarm-info-main">
            <div class="cn-alarm-info-main-left">
              <div
                class="cn-chart-alarm-info-icon"
                :style="{
                  background: eventSeverityColor[value.eventSeverity],
                  opacity: 0.1,
                }"
              ></div>
              <i
                class="cn-icon cn-icon-alert"
                :style="{
                  color: eventSeverityColor[value.eventSeverity],
                  opacity: 1,
                }"
              ></i>
            </div>
            <div class="cn-alarm-info-textContent">
              <div class="cn-alarm-info-main-title">
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

              <div class="cn-alarm-info-bottom">
                <div
                  class="cn-alarm-info-bottom-type"
                  :style="{
                    color: eventSeverityColor[value.eventSeverity],
                    'border-color': eventSeverityColor[value.eventSeverity],
                  }"
                  :title="value.eventType"
                >
                  {{ value.eventType }}
                </div>
                <div class="cn-alarm-info-bottom-middle">
                  <i class="cn-icon cn-icon-time2"></i>

                  <div class="cn-alarm-info-bottom-time">
                    &nbsp; {{ $t(`dns.startTime`) }}:&nbsp;&nbsp;&nbsp;
                  </div>
                  <div>
                    {{
                      value.startTime
                        ? dayJs
                            .tz(getMillisecond(value.startTime))
                            .format('YYYY-MM-DD HH:mm:ss')
                        : '-'
                    }}
                  </div>
                </div>
                &nbsp;&nbsp;&nbsp;

                <div class="cn-alarm-info-bottom-right">
                  <i class="cn-icon cn-icon-time2"></i>
                  <div class="cn-alarm-info-bottom-time">
                    &nbsp;{{ $t(`dns.duration`) }}:&nbsp;&nbsp;&nbsp;
                  </div>

                  <div
                    class="cn-alarm-info-bottom-circle"
                    :style="{
                      background: eventSeverityColor[value.eventSeverity],
                    }"
                  ></div>
                  &nbsp;&nbsp;&nbsp;
                  <div>
                    {{
                      unitConvert(value.endTime - value.startTime, 'time').join(
                        ' ',
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <chart-table-pagination
        ref="tablePagination"
        class="cn-chart-alarm-info-pagination"
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
import _ from 'lodash'
import unitConvert from '@/utils/unit-convert'
import ChartTablePagination from '@/views/charts/charts/ChartTablePagination'
import { get } from '@/utils/http'
import { getMillisecond } from '@/utils/date-util'

export default {
  name: 'isAlarmInfo',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    tabHandleClickType: String,
    queryParams: Object,
  },
  data() {
    return {
      pageSizeForAlarm: 9,
      eventSeverityColor: eventSeverityColor,
      pageNo: 1,
      alarmInfoCount: {},
      fromChartData: '',
      isNoData:false
      // result: [
      //   {
      //     entityType: 'ip',
      //     serverIp: '1.2.3.41.2.3.41.2.3.41.2.3.41.2.3.41.2.3.4',
      //     domain: '',
      //     appName: 'wechat',
      //     eventSeverity: 'high',
      //     eventType: 'type',
      //     startTime: 1111111111,
      //     durationMs: 60000,
      //     endTime: 1111111112,
      //   },
      // ],
    }
  },
  computed: {
    isNoData() {
      let isNoData = true
      if (!this.$_.isEmpty(this.chartData)) {
        isNoData = false
      }
      return isNoData
    },
  },
  watch: {
    tabHandleClickType: {
      deep: true,
      handler(n) {
        this.$nextTick(() => {
          this.getData(1, n)
        })
      },
    },
    alarmInfoCount: {
      deep: true,
      handler(n) {},
    },
    queryParams: {
      deep: true,
      handler(n) {
        if (n.startTime && n.endTime) {
          this.getCount(1)
        }
      },
    },
  },
  components: {
    ChartTablePagination,
  },
  methods: {
    unitConvert,
    getMillisecond,
    getCount() {
      let countQuery = {
        startTime: this.queryParams.startTime,
        endTime: this.queryParams.endTime,
        eventSeverity:
          this.tabHandleClickType === 'All' ? '' : this.tabHandleClickType,
      }
      this.$nextTick(() => {
        get('/interface/dns/alarmInfoCount', {
          ...countQuery,
        }).then((response) => {
          if (response.code === 200) {
            this.alarmInfoCount = response.data
          }
        })
      })
    },
    getData(val, n) {
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
          : this.tabHandleClickType,
      }
      const query = {
        startTime: this.queryParams.startTime,
        endTime: this.queryParams.endTime,
        eventSeverity:
          this.tabHandleClickType === 'All' ? '' : this.tabHandleClickType,
      }
      this.$emit('getAlarmInfo', null, extraParams, false, {
        startTime: query.startTime,
        endTime: query.endTime,
      })
      get('/interface/dns/alarmInfoCount', {
        ...query,
      }).then((response) => {
        if (response.code === 200) {
          this.alarmInfoCount = response.data
        }
      })
    },
    pageJump(val) {
      this.getData(val)
    },
  },
}
</script>
