<template>
  <div class="npm-recent">
    <div class="npm-recent-title">{{ $t('network.recentEvents') }}</div>
    <el-table
        :id="`tabTable_${index}`"
        :ref="`dataTable_${index}`"
        :data="tableData"
        class="npm-recent-table"
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
        <div class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#cn-icon-a-allclear"></use>
          </svg>
          <div class="table-no-data__title">{{ $t('npm.thereNoEvents') }}</div>
        </div>
        <!-- <div v-else>&nbsp;</div>-->
      </template>
    </el-table>
  </div>
</template>

<script>
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'

export default {
  name: 'NpmRecentEvents',
  props: {
    chart: Object,
    timeFilter: Object
  },
  data () {
    return {
      tableData: [],
      customTableTitles: [
        { label: 'network.severity', prop: 'eventSeverity' },
        { label: 'network.entity', prop: 'eventKey' },
        { label: 'detections.eventType', prop: 'eventType' }
      ],
      isNoData: true
    }
  },
  methods: {
    recentEventsListData () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        limit: 8
      }
      get(api.npm.events.recentEvents, params).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.result
        }
      })
    }
  },
  mounted () {
    this.recentEventsListData()
  }
}
</script>
