<template>
  <div class="npm-recent">
    <div class="npm-recent-title">{{ $t('network.recentEvents') }}</div>
    <el-table
        :id="`tabTable_${index}`"
        :ref="`dataTable_${index}`"
        :data="tableData"
        class="npm-recent-table"
        empty-text=" "
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
                <span class="data-recent-table-severity" :class="scope.row[item.prop]">{{$t(scope.row[item.prop])}}</span>
              </template>
              <template v-else-if="item.prop === 'eventKey'">
                <span class="data-recent-table-entity">{{$t(scope.row[item.prop])}}</span>
              </template>
              <template v-else-if="item.prop === 'eventType'">
                <span class="data-recent-table-eventType">{{$t(scope.row[item.prop])}}</span>
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
            <use xlink:href="#cn-icon-a-allclear"></use>
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

export default {
  name: 'NpmRecentEvents',
  mixins: [chartMixin],
  data () {
    return {
      tableData: [],
      customTableTitles: [
        { label: 'network.severity', prop: 'eventSeverity' },
        { label: 'network.entity', prop: 'eventKey' },
        { label: 'detections.eventType', prop: 'eventType' }
      ]
    }
  },
  watch: {
    timeFilter: {
      deep: true,
      handler (n) {
        this.recentEventsListData()
      }
    }
  },
  methods: {
    recentEventsListData () {
      const condition = this.$store.getters.getQueryCondition.split(/["|'](.*?)["|']/)
      const type = this.$store.getters.getDimensionType
      let url = ''
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        limit: 8
      }
      if (condition.length > 1 && type) {
        params.param = condition[1]
        params.type = type
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
          if (res.data.result.length === 0) {
            this.isNoData = true
          }
          res.data.result.forEach(e => {
            if (e.startTime) {
              e.startTime = dateFormatByAppearance(e.startTime)
            }
          })
          this.tableData = res.data.result
        } else {
          this.isNoData = true
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.recentEventsListData()
  }
}
</script>
