import { detectionEventType, detectionRuleType, EN, storageKey, ZH, unitTypes } from '@/utils/constants'
import { dateFormatByAppearance, getMillisecond, getSecond } from '@/utils/date-util'
import axios from 'axios'
import { api } from '@/utils/api'
import { getSeverityNumberColor, lineOption } from '@/views/detections/options/detectionOptions'
import { markRaw } from 'vue'
import * as echarts from 'echarts'
import { getSeverityByCode } from '@/utils/tools'
import Loading from '@/components/common/Loading'
import unitConvert from '@/utils/unit-convert'

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
      seriesDataNum: 0,
      mapColor: [],
      markLineData: [],
      mapWidth: 523, // 折线图底部色条宽度
      lineWidth: 520, // 时间轴宽度
      loading: true,
      activeIndex: -1,
      loadingTop: 0,
      isExpire: false
    }
  },
  components: {
    Loading
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
    dateFormatByAppearance,
    unitConvert,
    initData () {
      this.loading = true
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
            const timeData = res.data.data.result
            if (timeData && timeData.length > 0) {
              this.isExpire = false
              timeData.sort((a, b) => a.endTime - b.endTime)
              this.timeData = timeData
              const detailData = JSON.parse(JSON.stringify(timeData)).pop()
              detailData.durationS = detailData.endTime - detailData.startTime
              this.myDetection = { ...this.myDetection, ...detailData }
            } else {
              this.isExpire = true
              this.$message.error(this.$t('detection.detail.dataExpired'))
            }
          }
        }).catch(e => {
          console.error(e)
          this.$message.error(this.errorMsgHandler(e))
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.isGroup = 0
        this.loading = false
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
              this.handleMapColor(data)
              this.$nextTick(() => {
                this.handleLineChart(data)
              })
            } else {
              this.isExpire = true
              this.$message.error(this.$t('detection.detail.dataExpired'))
            }
          } else {
            const data = res.data.data.result
            if (data && data.length > 0) {
              const detailData = this.$_.cloneDeep(res.data.data.result).pop()
              if (detailData?.eventInfo) {
                detailData.eventInfoList = JSON.parse(detailData.eventInfo)
              }
              this.myDetection = { ...this.myDetection, ...detailData }
            }
          }
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      }).finally(() => {
        // this.loading = false
      })
    },
    changeTimeline (e) {
      this.loading = true

      if (this.detection.ruleType === 1) {
        this.loadingTop = 210
      } else if (this.detection.ruleType === 2) {
        this.loadingTop = 250
      } else if (this.detection.ruleType === 3 || this.detection.ruleType === 4) {
        this.loadingTop = 300
      }

      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        eventId: e.eventId,
        ruleType: this.detection.ruleType,
        resource: this.q,
        isGroup: this.isGroup
      }
      axios.get(api.detection.event.detail, { params }).then(res => {
        if (res.status === 200) {
          const data = res.data.data.result
          if (data && data.length > 0) {
            this.activeIndex = e.index
            if (this.detection.ruleType === detectionRuleType.threshold.key) {
              this.handleMapColor(data)
              this.$nextTick(() => {
                this.handleLineChart(data)
              })
            }
            const detailData = data[0]
            if (detailData?.eventInfo) {
              detailData.eventInfoList = JSON.parse(detailData.eventInfo)
            }
            if (detailData.startTime && detailData.endTime) {
              detailData.durationS = detailData.endTime - detailData.startTime
            } else {
              detailData.startTime = e.startTime
              detailData.endTime = e.endTime
              detailData.durationS = e.endTime - e.startTime
            }
            detailData.status = detailData.eventStatus || e.eventStatus
            this.myDetection = { ...this.myDetection, ...detailData }
            this.myDetection.eventId = e.eventId
          }
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      }).finally(() => {
        this.loading = false
      })
    },
    // 挂载echarts折线图
    handleLineChart (data) {
      if (this.myChart) {
        this.myChart.dispose()
      }
      const chartDom = this.$refs['myChart' + this.myDetection.eventId]
      if (!chartDom) {
        const timer = setTimeout(() => {
          clearTimeout(timer)
          this.handleLineChart(data)
        }, 200)
        return true
      }
      this.myChart = markRaw(echarts.init(chartDom))
      const seriesData = []
      const markLineData = []
      data.forEach(item => {
        seriesData.push([getMillisecond(JSON.parse(item.startTime)), item.metricValue, getSeverityNumberColor(item.severity)])
        const obj = markLineData.find(d => d.yAxis === item.thresholdValue)
        if (!obj) {
          markLineData.push({
            yAxis: item.thresholdValue,
            itemStyle: { color: getSeverityNumberColor(item.severity) },
            label: getSeverityByCode(item.severity)
          })
          this.markLineData = markLineData
          this.lineOption.series[0].markLine = {
            silent: true,
            symbol: 'none',
            data: markLineData,
            label: {
              show: false,
              position: 'insideStartTop',
              color: '#999',
              formatter (params) {
                return `${params.data.label}: ${params.value}`
              }
            }
          }
          this.lineOption.yAxis.axisLabel = {
            formatter: function (value) {
              switch (item.unit) {
                case 1: {
                  return unitConvert(value, unitTypes.number, '', '', 1).join(' ')
                }
                case 2: {
                  return unitConvert(value, unitTypes.percent, '', '', 1).join(' ')
                }
                case 3: {
                  return unitConvert(value, unitTypes.time, '', '', 1).join(' ')
                }
              }
              return value
            }
          }
          this.lineOption.tooltip.formatter = function (params) {
            const param = JSON.parse(JSON.stringify(params[0]))
            let value = ''
            switch (item.unit) {
              case 1: {
                value = unitConvert(param.data[1], unitTypes.number, '', '', 1).join(' ')
                break
              }
              case 2: {
                value = unitConvert(param.data[1], unitTypes.percent, '', '', 1).join(' ')
                break
              }
              case 3: {
                value = unitConvert(param.data[1], unitTypes.time, '', '', 1).join(' ')
                break
              }
              default: break
            }
            param.marker = param.marker.replace('#2E7AFE', param.data[2])
            const str = `<div style="display: flex;justify-content: space-between"><div>${param.marker}&nbsp;&nbsp;${value}</div></div>`
            return `${param.axisValueLabel}<br />${str}`
          }
        }
      })

      this.lineOption.series[0].data = seriesData

      this.seriesDataNum = seriesData.length
      if (this.seriesDataNum <= 1) {
        this.lineOption.series[0].symbol = 'circle'
        this.lineOption.series[0].symbolSize = 9
      } else {
        this.lineOption.series[0].symbol = 'none'
      }
      this.myChart.setOption(this.lineOption)
    },
    /** 高亮markLine */
    highLightMarkLine (index) {
      // this.myChart.dispatchAction({
      //   type: 'highlight',
      //   seriesName: 'markLine', // 系列索引，根据实际情况修改
      //   dataIndex: index // 数据索引，表示哪一条markLine会被高亮
      // })

      // // 如果之后需要取消高亮，可以使用下面的代码
      // myChart.dispatchAction({
      //   type: 'downplay',
      //   seriesIndex: 0, // 系列索引，根据实际情况修改
      //   dataIndex: dataIndex // 数据索引，表示哪一条markLine的高亮状态将被取消
      // });
    },
    /** 计算折线图色条的分布情况 */
    handleMapColor (data) {
      const diffTime = this.$_.cloneDeep(data).pop().startTime - data[0].startTime
      const totalWidth = this.countTotalWidth(data, diffTime, this.mapWidth)
      if (Math.abs(this.mapWidth - totalWidth) >= 1) {
        this.countTotalWidth(data, diffTime, 600)
      }
    },
    countTotalWidth (data, diffTime, width) {
      this.mapColor = []
      let totalWidth = 0
      data.forEach((item, index) => {
        let itemWidth = 0
        if (index > 0) {
          itemWidth = ((item.startTime - data[index - 1].startTime) / diffTime) * width
          totalWidth = totalWidth + JSON.parse(itemWidth.toFixed(1))
        }
        this.mapColor.push({
          color: getSeverityNumberColor(item.severity),
          width: itemWidth + 'px',
          startTime: item.startTime
        })
      })
      return totalWidth
    }
  },
  beforeUnmount () {
    if (this.myChart) {
      this.myChart.dispose()
    }
  }
}
