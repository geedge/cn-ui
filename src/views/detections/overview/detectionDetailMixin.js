import { detectionEventType, detectionRuleType } from '@/utils/constants'
import { getMillisecond, getSecond } from '@/utils/date-util'
import axios from 'axios'
import { api } from '@/utils/api'
import { getSeverityNumberColor, lineOption } from '@/views/detections/options/detectionOptions'
import { markRaw } from 'vue'
import * as echarts from 'echarts'

export default {
  props: {
    detection: Object,
    timeFilter: Object,
    pageObj: Object,
    eventFlag: String,
    q: String
  },
  data () {
    return {
      detectionEventType,
      myDetection: {},
      timeData: [],
      isGroup: 0,
      myChart: null,
      lineOption: lineOption,
      seriesDataNum: 0
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      this.myDetection = this.detection
      if (this.eventFlag === detectionEventType.aggregation) {
        this.isGroup = 1
        const timeParams = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          resource: this.q,
          keyFields: `'${this.detection.keyFields}'`,
          keyValues: `'${this.detection.keyValues}'`,
          ruleId: this.detection.ruleId,
          ruleVersion: `'${this.detection.ruleVersion}'`
        }
        axios.get(api.detection.event.detailTimeDistribution, { params: timeParams }).then(res => {
          if (res.status === 200) {
            this.timeData = res.data.data.result
          }
        }).catch(e => {
          this.$message.error(this.errorMsgHandler(e))
        })
      } else {
        this.isGroup = 0
      }

      if (this.myChart) {
        this.myChart.dispose()
      }
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        eventId: this.detection.eventId,
        ruleType: this.detection.ruleType,
        resource: this.q,
        isGroup: this.isGroup
      }
      axios.get(api.detection.event.detail, { params }).then(res => {
        if (res.status === 200) {
          // 类型为Threshold时处理折线图
          if (this.detection.ruleType === detectionRuleType.threshold.key) {
            const seriesData = []
            res.data.data.result.forEach(item => {
              seriesData.push([getMillisecond(JSON.parse(item.statTime)), item.recordsNums])
            })
            this.lineOption.series[0].data = seriesData
            this.lineOption.series[0].color = getSeverityNumberColor(res.data.data.result[0].severity) || '#ff9a79'

            this.seriesDataNum = seriesData.length
            if (this.seriesDataNum <= 1) {
              this.lineOption.series[0].symbol = 'circle'
              this.lineOption.series[0].symbolSize = 9
            } else {
              this.lineOption.series[0].symbol = 'none'
            }

            this.myChart = markRaw(echarts.init(document.getElementById('myChart' + this.detection.eventId)))
            this.myChart.setOption(this.lineOption)
          } else {
            const detailData = res.data.data.result.pop()
            if (detailData?.eventInfo) {
              detailData.eventInfoList = JSON.parse(detailData.eventInfo)
            }
            this.myDetection = { ...detailData, ...this.detection }
          }
        }
      }).catch(e => {
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    changeTimeline (e) {
      const params = {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        eventId: e,
        ruleType: this.detection.ruleType,
        resource: this.q,
        isGroup: this.isGroup
      }
      axios.get(api.detection.event.detail, { params }).then(res => {
        if (res.status === 200) {
          const detailData = res.data.data.result[0]
          if (detailData.eventInfo) {
            detailData.eventInfoList = JSON.parse(detailData.eventInfo)
          }
          this.myDetection = { ...this.myDetection, ...detailData }
        }
      }).catch(e => {
        this.$message.error(this.errorMsgHandler(e))
      })
    }
  }
}
