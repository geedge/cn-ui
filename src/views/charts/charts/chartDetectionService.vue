<template>
  <div class="service cn-detection--list">
    <div class="cn-detection-table">
      <chart-detections-table
          v-for="(data, index) in chartData"
          :detection="data"
          :timeFilter="timeFilter"
          :key="index"
          :ref="`detectionRow${index}`"
          :index="index"
      ></chart-detections-table>
    </div>
    <div class="cn-chart__footer" v-show="pageObj.total > 0">
      <chart-detection-pagination
        ref="pagination"
        :page-obj="pageObj"
        @pageJump="pageJump"
        :pageSizeForAlarm="pageSizeForAlarm"
      ></chart-detection-pagination>
    </div>
  </div>
</template>

<script>
import chartDetectionPagination from '@/views/charts/charts/chartDetectionPagination'
import chartDetectionsTable from '@/views/charts/charts/chartDetectionsTable'
import { get } from '@/utils/http'
import { replaceUrlPlaceholder } from '@/utils/tools'
export default {
  name: 'chartDetectionService',
  props: {
    chartInfo: Object,
    chartData: Array,
    resultType: Object,
    queryParams: Object,
    timeFilter: Object
  },
  components: {
    chartDetectionPagination,
    chartDetectionsTable
  },
  data () {
    return {
      pageObj: {
        pageNo: 1,
        pageSize: 6,
        total: 0,
        resetPageNo: true
      },
      pageSizeForAlarm: 6
    }
  },
  methods: {
    securityCount () {
      const requestUrl = this.chartInfo.params.countUrl
      get(replaceUrlPlaceholder(requestUrl, this.queryParams)).then(response => {
        this.pageObj.total = response.data.result
      })
    },
    getDetectionData (val) {
      this.pageObj.pageNo = val
      const extraParams = {
        pageNo: val,
        pageSize: this.pageSizeForAlarm
      }
      this.$emit('getDetectionData', this.chartInfo.params.url, extraParams, false, {
        startTime: this.queryParams.startTime,
        endTime: this.queryParams.endTime
      })
      const requestUrl = this.chartInfo.params.countUrl
      get(replaceUrlPlaceholder(requestUrl, this.queryParams)).then(response => {
        this.pageObj.total = response.data.result
      })
    },
    pageJump (val) {
      this.getDetectionData(val)
    }
  },
  mounted () {
    this.securityCount()
  }
}
</script>
