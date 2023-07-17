<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{$t('overall.remark')}}</div>
      <div class="overview__row">
        <div class="row__content">
            <span
                    class="row__content--link"
                    @click="goDetail('domain', computeSecondaryDomain(detection.domain))"
            >{{detection.domain}}</span>
          <template v-if="detection.eventType === 'dns error'">
            <span>
              {{$t('detections.dnsQueryError')}}
            </span>
          </template>
          <template v-if="detection.eventType === 'http error'">
            <span>
              {{$t('detections.httpQueryError')}}
            </span>
          </template>
          <template v-if="detection.eventType === 'high dns response time'">
            <span>
              {{$t('detections.responseTime')}}
            </span>
          </template>
        </div>
      </div>
      <div class="overview__title">Fields</div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.category')}}</div>
        <div class="row__content">{{basicInfo.domainCategoryName || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.group')}}</div>
        <div class="row__content">{{basicInfo.domainCategoryGroup || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.credit')}}</div>
        <div class="row__content">{{basicInfo.domainReputationScore || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.reputationLevel')}}</div>
        <div class="row__content">
          <div class="row__tag" :style="`background-color:${eventSeverityColor[basicInfo.domainReputationLevel]}`">{{basicInfo.domainReputationLevel || '-'}}</div>
        </div>
      </div>
    </div>
    <div class="overview__right">
      <div class="overview__title">{{$t('detections.goToEntity')}}</div>
      <div class="overview__row">
        <div class="row__content">
          <span class="row__content--span">{{ $t('detections.viewDetailOf') }}</span> &nbsp;
          <span
                  class="row__content--link"
                  @click="goDetail('domain', computeSecondaryDomain(detection.domain))">{{detection.domain}}</span>
        </div>
      </div>
      <div class="overview__title">{{$t('detections.goToHunt')}}</div>
      <div class="overview__row">
        <div class="row__content row__content--link">{{$t('detections.viewAllRelated')}}</div>
      </div>
      <div class="overview__metric">
        <div class="metric__column">
          <div class="overview__title">{{$t('detections.metric')}}</div>
          <div class="overview__row">
            <div class="row__content--metric ">{{getNameByEventType(detection.eventType)  || '-'}}</div>
          </div>
        </div>
        <div class="metric__column">
          <div class="overview__title">{{$t('detections.value')}}</div>
          <div class="overview__row">
            <div class="row__charts" :id="`detectionMetricChartDomain${detection.domain}`" ></div>
          </div>
        </div>
        <div class="metric__column">
          <div class="overview__title">{{$t('detections.startTime')}}</div>
          <div class="overview__row">
            <div class="row__content--metric ">{{dateFormatByAppearance(detection.startTime*1000) || '-'}}</div>
          </div>
        </div>
        <div class="metric__column">
          <div class="overview__title">{{$t('detections.endTime')}}</div>
          <div class="overview__row">
            <div class="row__content--metric ">{{dateFormatByAppearance(detection.endTime*1000) || '-'}}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { api, getData } from '@/utils/api'
import { eventSeverityColor, unitTypes, topDomain } from '@/utils/constants'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import * as echarts from 'echarts'
import { markRaw } from 'vue'
import { metricOption } from '@/views/detections/options/detectionOptions'
import { sortBy, reverseSortBy, getNameByEventType } from '@/utils/tools'
import _ from 'lodash'
export default {
  name: 'DetectionPerformanceEventDomainOverview',
  props: {
    detection: Object,
    pageObj: Object
  },
  data () {
    return {
      eventSeverityColor,
      basicInfo: {},
      metricList: [],
      metricChart: null,
      searchStartTime: null,
      searchEndTime: null
    }
  },
  computed: {
    computeLocation () {
      return function (basicInfo) {
        let result = ''
        if (basicInfo.serverLocationCountry) {
          result += basicInfo.serverLocationCountry
        }
        if (basicInfo.serverLocationProvince) {
          if (result) {
            result += ', '
          }
          result += basicInfo.serverLocationProvince
        }
        if (basicInfo.serverLocationRegion) {
          if (result) {
            result += ', '
          }
          result += basicInfo.serverLocationRegion
        }
        return result || '-'
      }
    },
    computeSecondaryDomain () {
      return function (name) {
        // 命中的顶级域名
        let hitTopDomain = ''
        // 同顶级域名比对
        const hits = []
        topDomain.forEach(td => {
          const hitIndex = name.lastIndexOf(td)
          if (hitIndex > -1 && hitIndex + td.length === name.length) {
            hits.push(td)
          }
        })
        if (hits.length > 0) {
          hits.sort((a, b) => {
            return b.split('.').length - a.split('.').length
          })
          hitTopDomain = hits[0]
        } else {
          const arr = name.split('.')
          hitTopDomain = arr[arr.length - 1]
        }
        const index = name.lastIndexOf(hitTopDomain)
        const preArr = name.substring(0, index).split('.')
        return [preArr[preArr.length - 2], hitTopDomain].join('.')
      }
    }
  },
  methods: {
    getNameByEventType,
    query () {
      this.queryBasic().then(responses => {
        responses && (this.basicInfo = responses)
      })

      this.queryMetric().then(responses => {
        responses && (this.metricList = responses.values)
        if (this.metricList.length > 0) {
          this.initChart()
        } else {
          const chartDom = document.getElementById(`detectionMetricChartDomain${this.detection.domain}`)
          chartDom.innerHTML = '<span style="padding-left:5px;">-</span>'
        }
      }).catch(error => {
        console.error(error)
        const chartDom = document.getElementById(`detectionMetricChartDomain${this.detection.domain}`)
        chartDom.innerHTML = '<span style="padding-left:5px;">-</span>'
      }).finally(() => {
        setTimeout(() => {
          try {
            this.$nextTick(() => {
              this.metricChart && this.metricChart.resize()
            })
          } catch (e) {}
        }, 250)
      })
    },

    initChart () {
      this.metricChart = markRaw(echarts.init(document.getElementById(`detectionMetricChartDomain${this.detection.domain}`)))// 使用markRaw的原因：vue3+echart5 遇到的坑 Cannot read properties of undefined (reading 'type')
      this.chartOptionMetric = _.cloneDeep(this.chartOption)

      this.metricList.sort(reverseSortBy(0))// 将返回的数据按时间降序排序，方便找到实线和虚线的交点
      // let endIndex = (this.metricList). findIndex ((item) => item[0]  <=  1435781434781 );
      let endIndex = (this.metricList).findIndex((item) => item[0] <= this.detection.endTime)
      endIndex = this.metricList.length - endIndex

      this.metricList.sort(sortBy(0))// 将返回的数据按时间升序排序，方便找到实线和虚线的交点
      // let startIndex = (this.metricList). findIndex ((item) => item[0]  >=  1435781432781 );
      const startIndex = (this.metricList).findIndex((item) => item[0] >= this.detection.startTime)

      if (startIndex > -1 && endIndex > -1) {
        this.chartOptionMetric.series[0].data = this.metricList.slice(0, startIndex).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])
        this.chartOptionMetric.series[1].data = this.metricList.slice(startIndex - 1, endIndex).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])
        this.chartOptionMetric.series[2].data = this.metricList.slice(endIndex - 1, this.metricList.length).map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.number])
      }

      this.chartOptionMetric.series.forEach(item => {
        item.name = this.getNameByEventType(this.detection.eventType)
      })

      this.chartOptionMetric && this.metricChart.setOption(this.chartOptionMetric)
    },

    queryMetric () {
      return new Promise((resolve, reject) => {
        try {
          const allTime = this.detection.endTime - this.detection.startTime
          const nowTime = getSecond(new Date())
          this.searchStartTime = this.detection.startTime - allTime / 2
          this.searchEndTime = _.min([nowTime, (this.detection.endTime + allTime / 2)])
          let url
          if (this.detection.eventType === 'dns error') {
            url = api.detection.performanceEvent.dnsErrorMetric
          } else if (this.detection.eventType === 'http error') {
            url = api.detection.performanceEvent.httpErrorMetric
          } else if (this.detection.eventType === 'high dns response time') {
            url = api.detection.performanceEvent.highDnsResponseTimeMetric
          }
          if (url) {
            get(url, {
              domain: this.detection.domain,
              startTime: this.searchStartTime,
              endTime: this.searchEndTime,
              eventType: this.detection.eventType
            }).then((response) => {
              if (response.code === 200) {
                resolve(response.data.result[0])
              } else {
                reject(response)
              }
            })
          } else {
            resolve()
          }
        } catch (e) {
          reject(e)
        }
      })
    },
    queryBasic () {
      return new Promise((resolve, reject) => {
        try {
          getData(api.detection.performanceEvent.overviewBasic, { domain: this.detection.domain, startTime: this.detection.startTime, endTime: this.detection.endTime, pageNo: this.pageObj.pageNo, pageSize: this.pageObj.pageSize }).then(data => {
            resolve(data[0])
          }).catch(error => {
            reject(error)
          })
        } catch (e) {
          reject(e)
        }
      })
    },
    goDetail (type, name) {
      const { href } = this.$router.resolve({
        path: '/entityDetail',
        query: {
          entityType: type,
          entityName: name
        }
      })
      window.open(href, '_blank')
    }
  },
  mounted () {
    this.query()
  },
  setup () {
    return {
      chartOption: metricOption
    }
  }
}
</script>
