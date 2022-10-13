<template>
  <div class="dns-recent-event npm-app-event">
    <div class="dns-recent-event-header">
      <div class="dns-recent-event-title">{{ $t('network.recentEvents') }}</div>
      <div class="dns-recent-event-select">
        <div class="metric-select">
          <el-select v-model="tableType"
                     class="option__select select-column"
                     popper-class="option-popper common-select"
                     :popper-append-to-body="false"
                     key="tabMetric"
                     :placeholder="$t('overall.select')"
                     @change="changeMetric"
                     size="mini"
                     width="100">
            <el-option
                v-for="item in options"
                :key="item.label"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <span>{{$t('overall.type')}}：</span>
        </div>
        <div class="metric-select">
          <el-select v-model="tableSeverity"
                     class="option__select select-column"
                     popper-class="option-popper common-select"
                     :popper-append-to-body="false"
                     key="tabMetric"
                     :placeholder="$t('overall.select')"
                     @change="changeMetric"
                     size="mini"
                     width="100">
            <el-option
                v-for="item in severityOption"
                :key="item.label"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <span>{{$t('network.severity')}}：</span>
        </div>
      </div>
    </div>
    <el-table
        :id="`tabTable_${index}`"
        :ref="`dataTable_${index}`"
        :data="tableData"
        class="npm-app-event-table dns-recent-event-table"
        height="100%"
        empty-text=""
    >
      <template v-for="(item, index) in customTableTitles" :key="index">
        <el-table-column class="data-column" :min-width="columnWidth(index)">
          <template #header>
            <span class="data-column__span">{{$t(item.label)}}</span>
          </template>
          <template  #default="scope" :column="item">
            <div class="data-app-event-table">
              <template v-if="item.prop === 'type'">
                <span v-if="scope.row[item.prop] === 'Performance Event'" class="data-applications">
                  <span class="cn-icon cn-icon-events-type performance">&nbsp;</span>
                  {{scope.row[item.prop]}}
                </span>
                <span v-else class="data-applications">
                  <span class="cn-icon cn-icon-events-type security">&nbsp;</span>
                  {{scope.row[item.prop]}}
                </span>
              </template>
              <template v-else-if="item.prop === 'event'">
                <span class="data-eventType">{{scope.row[item.prop]}}</span>
              </template>
              <template v-else-if="item.prop === 'severity'">
                <template v-if="scope.row[item.prop]==='critical'">
                  <div v-for="(item, index) in 5" class="red-dot" :key="index"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='high'">
                  <div v-for="(item, index) in 4" class="red-dot" :key="index"></div>
                  <div class="grey-dot"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='medium'">
                  <div v-for="(item, index) in 3" class="red-dot" :key="index"></div>
                  <div v-for="(item, index) in 2" class="grey-dot" :key="index"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='low'">
                  <div v-for="(item, index) in 2" class="red-dot" :key="index"></div>
                  <div v-for="(item, index) in 3" class="grey-dot" :key="index"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='info'">
                  <div v-for="(item, index) in 1" class="red-dot" :key="index"></div>
                  <div v-for="(item, index) in 4" class="grey-dot" :key="index"></div>
                </template>
                <span class="data-severity" >{{scope.row[item.prop]}}</span>
              </template>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
      </template>
      <template v-slot:empty>
        <div class="table-no-data" v-show="isNoData">
          <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'

export default {
  name: 'DnsRecentEvents',
  setup () {
    const { query } = useRoute()
    const tableType = ref(query.tableType || '')
    const tableSeverity = ref(query.tableSeverity || '')
    return {
      tableType,
      tableSeverity
    }
  },
  data () {
    return {
      options: [
        {
          label: this.$t('dnsInsight.securityEvent'),
          value: 'securityEvent'
        },
        {
          label: this.$t('dnsInsight.PerEvent'),
          value: 'performanceEvent'
        }
      ],
      severityOption: [
        {
          value: 'critical',
          label: 'Critical'
        },
        {
          value: 'high',
          label: 'High'
        },
        {
          value: 'medium',
          label: 'Medium'
        },
        {
          value: 'low',
          label: 'Low'
        },
        {
          value: 'info',
          label: 'Info'
        }
      ],
      tableData: [],
      customTableTitles: [
        { label: 'overall.type', prop: 'type' },
        { label: 'dnsInsight.event', prop: 'event' },
        { label: 'network.severity', prop: 'severity' }
      ]
    }
  },
  mixins: [chartMixin],
  watch: {
    timeFilter: {
      handler (n) {
        this.dnsRecentEventData()
      }
    },
    tableType (n) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        tableType: n
      })
      overwriteUrl(newUrl)
    },
    tableSeverity (n) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        tableSeverity: n
      })
      overwriteUrl(newUrl)
    }
  },
  mounted () {
    this.dnsRecentEventData()
  },
  methods: {
    dnsRecentEventData () {
      this.toggleLoading(true)
      this.tableData = []
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        limit: 8,
        type: this.tableType,
        severity: this.tableSeverity
      }
      get(api.dnsInsight.recentEvents, params).then(res => {
        if (res.code === 200) {
          if (!res.data.result || res.data.result.length === 0) {
            this.isNoData = true
          }
          this.tableData = res.data.result
          this.tableData.forEach((t, index) => {
            if (index > 5) {
              t.type = 'Security Event'
            } else {
              t.type = 'Performance Event'
            }
          })
        } else {
          this.isNoData = true
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    changeMetric () {
      this.dnsRecentEventData()
    },
    columnWidth (index) {
      if (index === 0 || index === 1) {
        return '50%'
      } else if (index === 2) {
        return '25%'
      } else if (index === 3) {
        return '15%'
      }
    }

  },
  computed: {
  }
}
</script>
