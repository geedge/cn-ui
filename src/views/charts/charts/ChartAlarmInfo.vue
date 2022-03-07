<template>
  <div class="cn-chart-alarm-info">
    <div class="cn-chart-alarm-info-mainContent">
    <div
      class="cn-chart-alarm-content"
      v-for="(value, index) in chartData"
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
            <!-- <span v-if="value.entityType === 'domain'">{{ value.domain }}</span>
            <span v-if="value.entityType === 'app'">{{ value.appName }}</span>
            <span v-if="value.entityType === 'ip'">{{ value.serverIp }}</span> -->
            111.111.1.1
          </div>

          <div class="cn-alarm-info-bottom">
            <div
              class="cn-alarm-info-bottom-type"
              :style="{ 'color': eventSeverityColor[value.eventSeverity] ,'border-color':eventSeverityColor[value.eventSeverity]}"
            >
              <!-- {{$t(`${value.eventType}`)}} -->
              {{ value.eventType }}
            </div>

            <div class="cn-alarm-info-bottom-middle">
              <i class="cn-icon cn-icon-time2"></i>

              <div class="cn-alarm-info-bottom-time">
               &nbsp; {{ $t(`dns.startTime`) }}:&nbsp;&nbsp;&nbsp;
              </div>
              <div>{{ changeDate(value.startTime) }}</div>
            </div>

            <div class="cn-alarm-info-bottom-right">
              <i class="cn-icon cn-icon-time2"></i>
              <div class="cn-alarm-info-bottom-time">
                &nbsp;{{ $t(`dns.duration`) }}:&nbsp;&nbsp;&nbsp;
              </div>

              <div
                class="cn-alarm-info-bottom-circle"
                :style="{ background: eventSeverityColor[value.eventSeverity] }"
              ></div>
              &nbsp;&nbsp;&nbsp;
              <div>
                {{
                  unitConvert(value.endTime - value.startTime, 'time').join(' ')
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
  </div>
</template>

<script>
import { eventSeverityColor } from '@/utils/constants'
import _ from 'lodash'
import unitConvert from '@/utils/unit-convert'
import ChartTablePagination from '@/views/charts/charts/ChartTablePagination'
import { get } from '@/utils/http'

export default {
  name: 'isAlarmInfo',
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    tabHandleClickType: String,
  },
  data() {
    return {
      pageSizeForAlarm: 9,
      eventSeverityColor: eventSeverityColor,
      pageNo: 1,
      alarmInfoCount: {
        
      },
      fromChartData:''
    }
  },
  watch: {
    tabHandleClickType: {
      deep: true,
      handler(n) {
        this.getData(1,n)
      },
    },
  },
  created(){
    this.getData(1,'All')
  },
  components: {
    ChartTablePagination,
  },
  methods: {
    unitConvert,
    getData(val,n) {
      this.pageNo = val
      const now = window.$dayJs.tz().valueOf()
      const extraParams = {
        pageNo: val,
        pageSize: this.pageSizeForAlarm,
        eventSeverity: n? (n==='All'?'':n ): this.tabHandleClickType === 'All'?'':this.tabHandleClickType
      }
      console.log('extraParams',extraParams);
      this.$emit('getAlarmInfo', null, extraParams)
      const queryParams = {
        startTime: Math.floor(now / 1000 - 3600),
        endTime: Math.floor(now / 1000),
        eventSeverity:
          this.tabHandleClickType === 'All' ? '' : this.tabHandleClickType,
      }

      get('/interface/dns/alarmInfoCount', {
        ...queryParams,
      }).then((response) => {
        if (response.code === 200) {
          this.alarmInfoCount = response.data
        }
      })
    },
    changeDate(value) {
      return window.$dayJs.tz(value).format('YYYY-MM-DD HH:mm:ss')
    },
    pageJump(val) {
      this.getData(val)
    },
  },
}
</script>
