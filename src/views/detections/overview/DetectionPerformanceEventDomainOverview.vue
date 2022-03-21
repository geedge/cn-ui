<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{$t('overall.remark')}}</div>
      <div class="overview__row">
        <div class="row__content">
            <span
              class="row__content--link"
              @click="goDetail('domain', computeSecondaryDomain(detection.domain))"
              >{{ computeSecondaryDomain(detection.domain) }}</span>
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
          <span>{{ $t('detections.viewDetailOf') }}</span> &nbsp;
          <span
              class="row__content--link"
              @click="goDetail('domain', computeSecondaryDomain(detection.domain))">{{computeSecondaryDomain(detection.domain)}}</span>
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
            <div class="row__content--metric ">{{detection.domain  || '-'}}</div>
          </div>
        </div>
        <div class="metric__column">
          <div class="overview__title">{{$t('detections.value')}}</div>
          <div class="overview__row">
            <div class="row__charts" id="detectionMetricChartDomain" ></div>
          </div>
        </div>
        <div class="metric__column">
          <div class="overview__title">{{$t('detections.startTime')}}</div>
          <div class="overview__row">
            <div class="row__content--metric ">{{dayJs.tz(detection.startTime*1000).format('YYYY-MM-DD HH:mm:ss') || '-'}}</div>
          </div>
        </div>
        <div class="metric__column">
          <div class="overview__title">{{$t('detections.endTime')}}</div>
          <div class="overview__row">
            <div class="row__content--metric ">{{dayJs.tz(detection.endTime*1000).format('YYYY-MM-DD HH:mm:ss') || '-'}}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { api, getData } from '@/utils/api'
import { eventSeverityColor, unitTypes } from '@/utils/constants'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import * as echarts from 'echarts'
import { metricOption } from '@/views/detections/options/detectionOptions'
import { sortBy, reverseSortBy, computeSecondaryDomain } from '@/utils/tools'
export default {
  name: 'DetectionPerformanceEventDomainOverview',
  props: {
    detection: Object
  },
  data () {
    return {
      eventSeverityColor,
      basicInfo: {},
      metricList:[[1435781430781, "1"], [1435781431781, "5"],[1435781432781, "5"], [1435781433781, "3"],[1435781434781, "4"], [1435781435781, "5"]],
      metricChart: null,
      searchStartTime:null,
      searchEndTime:null
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
    }
  },
  methods: {
    computeSecondaryDomain,
    query () {
      this.queryBasic().then(responses => {
        responses && (this.basicInfo = responses)
      })

      this.queryMetric().then(responses => {
        responses && (this.metricList = responses.values)
        this.initChart()
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        setTimeout(() => {
          try {
            this.$nextTick(() => {
              console.log(this.metricChart)
              this.metricChart && this.metricChart.resize()
            })
          } catch (e) {}
        }, 250)
      })
    },

    initChart(){
      this.metricChart = echarts.init(document.getElementById('detectionMetricChartDomain'))
      this.chartOptionMetric = _.cloneDeep(this.chartOption)

      this.metricList.sort(reverseSortBy(0))//将返回的数据按时间降序排序，方便找到实线和虚线的交点
      //let endIndex = (this.metricList). findIndex ((item) => item[0]  <=  1435781434781 );
      let endIndex = (this.metricList). findIndex ((item) => item[0]  <=  this.detection.endTime*1000 );
      endIndex = this.metricList.length-endIndex

      this.metricList.sort(sortBy(0))//将返回的数据按时间升序排序，方便找到实线和虚线的交点
      //let startIndex = (this.metricList). findIndex ((item) => item[0]  >=  1435781432781 );
      let startIndex = (this.metricList). findIndex ((item) => item[0]  >=  this.detection.startTime*1000 );

      if(startIndex >-1 && endIndex >-1){
        this.chartOptionMetric.series[0].data = this.metricList.slice(0,startIndex).map(v => [Number(v[0]), Number(v[1]), unitTypes.number])
        this.chartOptionMetric.series[1].data = this.metricList.slice(startIndex-1,endIndex).map(v => [Number(v[0]), Number(v[1]), unitTypes.number])
        this.chartOptionMetric.series[2].data = this.metricList.slice(endIndex-1,this.metricList.length).map(v => [Number(v[0]), Number(v[1]), unitTypes.number])
      }

      this.chartOptionMetric && this.metricChart.setOption(this.chartOptionMetric)
      console.log(this.chartOptionMetric)
    },

    queryMetric() {
      return new Promise((resolve, reject) => {
        try {
          let allTime = this.detection.endTime-this.detection.startTime
          let nowTime = getSecond(new Date())
          this.searchStartTime = this.detection.startTime-allTime/2
          this.searchEndTime = _.min([nowTime,(this.detection.endTime+allTime/2)])

          get(api.detection.performanceEvent.metric, {
            domain: this.detection.domain,
            startTime: this.searchStartTime*1000,
            endTime: this.searchEndTime*1000,
          }).then((response) => {
            if (response.code === 200) {
              resolve(response.data.result[0])
            } else {
              reject(response)
            }
          })
        } catch (e) {
          reject(e)
        }
      })
    },
    queryBasic () {
      return new Promise((resolve, reject) => {
        try {
          getData(api.detection.performanceEvent.overviewBasic, { domain: this.detection.domain, startTime: this.detection.startTime }).then(data => {
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
          name: name
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
      chartOption: metricOption,
    }
  },
}
</script>
