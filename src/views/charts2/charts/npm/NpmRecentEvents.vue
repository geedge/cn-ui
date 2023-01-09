<template>
  <div class="npm-recent">
    <div class="npm-recent-title">
      {{ $t('network.recentEvents') }}
      <chart-error v-if="showError" tooltip :content="errorMsg" />
    </div>
    <el-table
        id="tabTable"
        ref="dataTable"
        :data="tableData"
        class="npm-recent-table"
        :class="{'npm-recent-table-ten': tableData.length === 10}"
        empty-text=""
        height="100%"
    >
      <template v-for="(item, index) in customTableTitles" :key="index">
        <el-table-column class="data-column">
          <template #header>
            <span class="data-column__span">{{$t(item.label)}}</span>
          </template>
          <template  #default="scope" :column="item">
            <div class="data-recent-table">
              <template v-if="item.prop === 'eventSeverity'">
                <span class="data-recent-table-severity" :class="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              </template>
              <template v-else-if="item.prop === 'eventKey'">
                <span class="data-recent-table-entity click-active" @click="jumpPage(scope.row)">{{splitEventKey(scope.row[item.prop])}}</span>
              </template>
              <template v-else-if="item.prop === 'eventType'">
                <span class="data-recent-table-eventType">{{scope.row[item.prop]}}</span>
              </template>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
      </template>
      <template v-slot:empty>
        <div class="table-no-data" v-show="isNoData">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#cn-icon-good"></use>
          </svg>
          <div class="table-no-data__title">{{ $t('npm.thereNoEvents') }}</div>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script>
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond, dateFormatByAppearance } from '@/utils/date-util'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import ChartError from '@/components/common/Error'

export default {
  name: 'NpmRecentEvents',
  components: { ChartError },
  mixins: [chartMixin],
  setup () {
    const { query } = useRoute()
    const queryCondition = ref(query.queryCondition || '')
    const dimensionType = ref(query.dimensionType || '')
    return {
      queryCondition,
      dimensionType
    }
  },
  data () {
    return {
      tableData: [],
      customTableTitles: [
        { label: 'network.severity', prop: 'eventSeverity' },
        { label: 'network.entity', prop: 'eventKey' },
        { label: 'detections.eventType', prop: 'eventType' }
      ],
      showError: false,
      errorMsg: ''
    }
  },
  watch: {
    timeFilter: {
      handler (n) {
        if (n) {
          this.recentEventsListData()
        }
      }
    }
  },
  methods: {
    recentEventsListData () {
      const condition = this.queryCondition.split(/["|'](.*?)["|']/)
      let url = ''
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        limit: 8
      }
      if (condition.length > 1 && this.dimensionType) {
        params.param = condition[1]
        params.type = this.dimensionType
        if (params.type === 'serverIp' || params.type === 'clientIp') params.type = 'ip'
        params.limit = 10
        url = api.npm.events.recentEventsD
        this.customTableTitles = [
          { label: 'network.severity', prop: 'eventSeverity' },
          { label: 'detections.eventType', prop: 'eventType' },
          { label: 'detection.list.startTime', prop: 'startTime' }
        ]
      } else {
        url = api.npm.events.recentEvents
      }
      this.toggleLoading(true)
      get(url, params).then(res => {
        if (res.code === 200) {
          this.showError = false
          this.isNoData = res.data.result.length === 0
          res.data.result.forEach(e => {
            if (e.startTime) {
              e.startTime = dateFormatByAppearance(e.startTime)
            }
          })
          this.tableData = res.data.result
        } else {
          // this.isNoData = true
          this.showError = true
          this.errorMsg = res.message
        }
      }).catch(error => {
        this.showError = true
        this.errorMsg = error.message
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    /**
     * 只要实体名称
     * @param key
     * @returns {*}
     */
    splitEventKey (key) {
      let name = ''
      if (key) {
        name = key.split(' ')[0]
      } else {
        name = '-'
      }
      return name
    },
    jumpPage (item) {
      this.$router.push({
        path: '/detection/performanceEvent',
        query: {
          t: +new Date(),
          eventId: item.eventId
        }
      })
    }
  },
  mounted () {
    this.recentEventsListData()
  }
}
</script>
