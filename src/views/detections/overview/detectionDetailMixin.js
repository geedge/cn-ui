import { detectionEventType, detectionRuleType, EN, storageKey, ZH } from '@/utils/constants'
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
  computed: {
    // 下拉详情的描述
    handleDescription () {
      const language = localStorage.getItem(storageKey.language) || EN
      const valuesList = this.detection.keyValues.split(',')
      if (language === EN) {
        switch (this.detection.ruleType) {
          case detectionRuleType.indicator.key: {
            return `<span>${valuesList[0]}</span>  communicated with <span>${valuesList[1]}</span> that was associated with the indicator of <span>${valuesList[2]}</span>.`
          }
          case detectionRuleType.threshold.key: {
            return `<span>${valuesList[0]}</span> experienced exceptions exceeding the threshold number of times.`
          }
          case detectionRuleType.sequence.key:
          case detectionRuleType.unordered.key: {
            return `<span>${valuesList[0]}</span> experienced <span>${this.detection.eventName}</span> exception event.`
          }
        }
      } else if (language === ZH) {
        switch (this.detection.ruleType) {
          case detectionRuleType.indicator.key: {
            return `<span>${valuesList[0]}</span> 与 <span> ${valuesList[1]} </span> 进行了通信，后者与 <span>${valuesList[2]}</span> 的指标相关联。`
          }
          case detectionRuleType.threshold.key: {
            return `<span>${valuesList[0]}</sapn> 发生异常的次数超出阈值。`
          }
          case detectionRuleType.sequence.key:
          case detectionRuleType.unordered.key: {
            return `<span>${valuesList[0]}</span> 发生了 <span>${this.detection.eventName}</span> 异常事件。`
          }
        }
      }
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
            const data = res.data.data.result
            if (data && data.length > 0) {
              const seriesData = []
              data.forEach(item => {
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
            }
          } else {
            const data = res.data.data.result
            if (data && data.length > 0) {
              const detailData = res.data.data.result.pop()
              if (detailData?.eventInfo) {
                detailData.eventInfoList = JSON.parse(detailData.eventInfo)
              }
              this.myDetection = { ...detailData, ...this.detection }
            }
          }
        }
      }).catch(e => {
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    changeTimeline (e) {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        eventId: e,
        ruleType: this.detection.ruleType,
        resource: this.q,
        isGroup: this.isGroup
      }
      axios.get(api.detection.event.detail, { params }).then(res => {
        if (res.status === 200) {
          const data = res.data.data.result
          if (data && data.length > 0) {
            const detailData = data[0]
            if (detailData.eventInfo) {
              detailData.eventInfoList = JSON.parse(detailData.eventInfo)
            }
            this.myDetection = { ...this.myDetection, ...detailData }
          }
        }
      }).catch(e => {
        this.$message.error(this.errorMsgHandler(e))
      })
    }
  }
}
