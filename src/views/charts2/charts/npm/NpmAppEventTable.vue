<template>
  <div class="npm-app-event">
    <div class="metric-select">
      <el-select
          v-model="metric"
          class="option__select select-column"
          popper-class="option-popper common-select"
          :popper-append-to-body="false"
          key="tabMetric"
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
      <span>{{ $t('network.metric') }}：</span>
    </div>
    <el-table
        id="tabTable"
        ref="dataTable"
        :data="tableData"
        class="npm-app-event-table"
        height="100%"
        empty-text=""
    >
      <template v-for="(item, index) in customTableTitles" :key="index">
        <el-table-column class="data-column" :min-width="columnWidth(index)">
          <template #header>
            <span class="data-column__span">{{ $t(item.label) }}</span>
          </template>
          <template #default="scope" :column="item">
            <div class="data-app-event-table">
              <template v-if="item.prop === 'domain' ||item.prop === 'appName' ||item.prop === 'serverIp' ">
                <span class="data-applications">{{ scope.row[item.prop] }}</span>
              </template>
              <template v-else-if="item.prop === 'eventSeverity'">
                <template v-if="scope.row[item.prop]==='critical'">
                  <div v-for="item in 5" class="red-dot" :key="item"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='high'">
                  <div v-for="item in 4" class="red-dot" :key="item"></div>
                  <div class="grey-dot"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='medium'">
                  <div v-for="item in 3" class="red-dot" :key="item"></div>
                  <div v-for="item in 2" class="grey-dot" :key="item"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='low'">
                  <div v-for="item in 2" class="red-dot" :key="item"></div>
                  <div v-for="item in 3" class="grey-dot" :key="item"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='info'">
                  <div v-for="item in 1" class="red-dot" :key="item"></div>
                  <div v-for="item in 4" class="grey-dot" :key="item"></div>
                </template>
                <span class="data-severity">{{ scope.row[item.prop] }}</span>
              </template>
              <template v-else-if="item.prop === 'eventType'">
                <!-- <span class="data-eventType" v-for="type in scope.row[item.prop]">{{type}}</span>-->
                <span class="data-eventType">{{ scope.row[item.prop] }}</span>
              </template>
              <template v-else-if="item.prop === 'count'">
                <span class="data-eventCount">{{ scope.row[item.prop] }}</span>
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

    <div class="table-error">
      <chart-error v-if="showError" :content="errorMsg"></chart-error>
    </div>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'

export default {
  name: 'NpmAppEventTable',
  components: { ChartError },
  data () {
    return {
      metric: 'appLabel',
      dataProp: 'appLabel',
      options: [
        {
          value: 'appLabel',
          label: 'Application'
        },
        {
          value: 'idcRenter',
          label: 'Provider'
        }
      ],
      typePropMap: {
        appLabel: 'appName',
        idcRenter: 'domain'
      },
      typeLabelMap: {
        appLabel: 'network.applications',
        idcRenter: 'network.idcRenter'
      },
      dotList: ['grey-dot', 'grey-dot', 'grey-dot', 'grey-dot', 'grey-dot'],
      tableData: [],
      customTableTitles: [
        {
          label: 'network.applications',
          prop: 'serverIp'
        },
        {
          label: 'network.severity',
          prop: 'eventSeverity'
        },
        {
          label: 'network.eventType',
          prop: 'eventType'
        },
        {
          label: 'network.eventCount',
          prop: 'count'
        }
      ],
      isNoData: false,
      showError: false,
      errorMsg: ''
    }
  },
  mixins: [chartMixin],
  watch: {
    timeFilter: {
      handler () {
        this.init()
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.toggleLoading(true)
      this.isNoData = false
      this.customTableTitles[0].prop = this.typePropMap[this.metric]
      this.customTableTitles[0].label = this.typeLabelMap[this.metric]
      this.tableData = []
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        limit: 10,
        type: this.metric
      }
      get(api.npm.events.dimensionEvents, params).then(res => {
        if (res.code === 200) {
          this.showError = false
          if (!res.data.result || res.data.result.length === 0) {
            this.isNoData = true
          }
          this.tableData = res.data.result
        } else {
          this.isNoData = false
          this.showError = true
          this.errorMsg = res.message
        }
      }).catch((e) => {
        this.isNoData = false
        this.showError = true
        this.errorMsg = e.message
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    changeMetric () {
      this.init()
    },
    columnWidth (index) {
      if (index === 0 || index === 1) {
        return '20%'
      } else if (index === 2) {
        return '35%'
      } else if (index === 3) {
        return '15%'
      }
    }
  },
  computed: {}
}
</script>
