<template>
  <div class="detection-detail-overview">
    <div class="overview__left">
      <div class="overview__title">{{$t('overall.remark')}}</div>
      <div class="overview__row">
        <div class="row__content">
          <span
              class="row__content--link"
              @click="goDetail('app', detection.appName)"
              >{{ detection.appName }}</span
            >
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
        <div class="row__content">{{basicInfo.appCategory || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.subcategory')}}</div>
        <div class="row__content">{{basicInfo.appSubcategory || '-'}}</div>
      </div>
      <div class="overview__row">
        <div class="row__label">{{$t('entities.riskLevel')}}</div>
        <div class="row__content">
          <div class="row__tag" :style="`background-color:${eventSeverityColor[basicInfo.appRisk]}`">{{basicInfo.appRisk || '-'}}</div>
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
              @click="goDetail('app', detection.appName)">{{detection.appName}}</span>
        </div>
      </div>
      <div class="overview__title">{{$t('detections.goToHunt')}}</div>
      <div class="overview__row">
        <div class="row__content row__content--link">{{$t('detections.viewAllRelated')}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { eventSeverityColor } from '@/utils/constants'
import { api, getData } from '@/utils/api'
import { unitTypes } from '@/utils/constants'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import * as echarts from 'echarts'
import { markRaw } from 'vue'
import { metricOption } from '@/views/detections/options/detectionOptions'
import { sortBy,reverseSortBy } from '@/utils/tools'
export default {
  name: 'DetectionPerformanceEventAppOverview',
  props: {
    detection: Object
  },
  data () {
    return {
      eventSeverityColor,
      basicInfo: {},
      metricList:[[1435781430781, "1"], [1435781431781, "5"],[1435781432781, "5"], [1435781433781, "3"],[1435781434781, "4"], [1435781435781, "5"]],
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
      this.metricChart = markRaw(echarts.init(document.getElementById('detectionMetricChartDomain')))
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
            startTime: this.searchStartTime,
            endTime: this.searchEndTime,
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
          getData(api.detection.performanceEvent.overviewBasic, { domain: this.detection.appName, startTime: this.detection.startTime }).then(data => {
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
