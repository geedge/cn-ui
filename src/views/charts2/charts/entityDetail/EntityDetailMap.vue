<template>
  <div class="subscriber-map">
    <div class="subscriber-map-header">
      <div class="subscriber-map-title">{{$t('subscriber.locationTrack')}}</div>
      <date-time-range
          class="entity-detail-date-time-range"
          :start-time="timeFilter.startTime"
          :end-time="timeFilter.endTime"
          :date-range="timeFilter.dateRangeValue"
          ref="dateTimeRange"
          @change="reload"
      />
    </div>

    <div class="subscriber-map-body">
      <chart-no-data v-if="isNoData" test-id="noData" style="width: calc(100% - 312px)"></chart-no-data>
      <chart-error v-if="showError" :content="errorMsg" style="width: calc(100% - 312px)" />
      <div id="subscriberMap" class="subscriber-map" style="width: calc(100% - 310px)"></div>

      <!-- 右侧数据栏-trace -->
      <div class="analysis-statistics" id="subscribersBlock" style="position: absolute;right: 0;top: 0;">
        <div class="analysis-statistics__subscribers">
          <div class="analysis-statistics__subscriber" style="height: 664px;">
            <chart-no-data v-if="trackingNoData" test-id="trackingNoData" style="width: calc(100% - 20px);height: 100%;"></chart-no-data>
            <chart-error v-if="showTrackingError" :content="trackingErrorMsg" style="width: calc(100% - 20px);margin-left: 20px;" />
            <div v-if="!trackingNoData && !showTrackingError" class="subscriber__body">
              <div class="body-item-record">
                <div class="item-record__header">{{ $t('location.trackRecord') }}</div>
                <div class="item-record__info">
                  <div class="circle"></div>
                </div>
                <div class="item-record__timeline">

                  <div class="scroll-view" @scroll="onScroll" :id="trackingSubscriber.subscriberId">
                    <!-- 虚拟列表 -->
                    <div class="virtual-scroller" :style="`height: ${trackingSubscriber.listHeight}px`"></div>
                    <div class="scroll-list" :style="`transform: translateY(${trackingSubscriber.startOffset}px)`">
                      <div class="scroll__item"
                           v-for="(record, index) in trackingSubscriber.trackRecords.slice(trackingSubscriber.scrollStartIndex, trackingSubscriber.scrollEndIndex)"
                           :key="index">
                        <div class="item-circle">
                          <div class="circle-circle"></div>
                          <div class="circle-line"></div>
                        </div>
                        <div class="item-content">
                          <div>
                            <span>{{$t('overall.location')}}: </span><span class="item__value">{{record.subscriberLongitude}},&nbsp;{{record.subscriberLatitude}}</span>
                          </div>
                          <div>
                            <span>{{ $t('location.timeOfArrival') }}: </span><span class="item__value">{{dateFormatByAppearance(Number(record.time))}}</span>
                          </div>
                          <div>
                            <span>{{ $t('location.residenceTime') }}: </span><span class="item__value">{{record.stayTime}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图point悬浮框 -->
    <div class="subscriber-map-point-tooltip" v-if="tooltip.showTooltip" :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}">
      <div class="subscriber-map-point-tooltip__time">{{dateFormatByAppearance(currentPoint.stat_time)}}</div>
      <div class="subscriber-map-point-tooltip__coordinates">
        <div class="subscriber-map-point-tooltip__coordinate">
          <div class="coordinate__label">{{$t('overall.longitude')}}</div>
          <div class="coordinate__value">{{currentPoint.longitude}}</div>
        </div>
        <div class="subscriber-map-point-tooltip__coordinate">
          <div class="coordinate__label">{{$t('overall.latitude')}}</div>
          <div class="coordinate__value">{{currentPoint.latitude}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import maplibregl from 'maplibre-gl'
import mapStyle from './mapStyle'
import axios from 'axios'
import { api } from '@/utils/api'
import 'maplibre-gl/dist/maplibre-gl.css'
import _ from 'lodash'
import { ref, shallowRef } from 'vue'
import { getNowTime, getSecond, dateFormatByAppearance } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'

export default {
  name: 'EntityDetailMap',
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  mounted () {
    this.initMap()
    this.queryTraceTracking()
  },
  unmounted () {
    this.myChart && this.myChart?.remove?.()
    this.myChart = null
  },
  methods: {
    dateFormatByAppearance,
    async initMap () {
      const _this = this
      const map = new maplibregl.Map({
        container: 'subscriberMap',
        style: mapStyle,
        center: this.center,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        zoom: 7
      })
      maplibregl.addProtocol('cn', (params, callback) => { // 切片显示接口 防止跨域的问题
        fetch(`${params.url.split('://')[1]}`)
          .then(t => {
            if (t.status == 200) {
              t.arrayBuffer().then(arr => {
                callback(null, arr, null, null)
              })
            } else {
              callback(new Error(`Tile fetch error: ${t.statusText}`))
            }
          })
          .catch(e => {
            callback(new Error(e))
          })
        return { cancel: () => { } }
      })
      this.queryData().then(res => {
        map.on('load', () => {
          this.showError = false
          const result = _.get(res, 'data.data.result', []).sort((a, b) => a.stat_time - b.stat_time)
          const route = this.generateRouteGEOJSON(result)
          const points = this.generatePointsGEOJSON(result)
          if (result.length > 0) {
            map.jumpTo({ center: this.computeMapCenter(result) })
            map.zoomTo(this.computeMapZoom(result))
          }
          map.loadImage(
              `${window.location.protocol}//${window.location.host}/images/entity-detail/track-point.png`,
              (error, image) => {
                if (error) throw error
                map.addImage('trace-point', image)
                map.addSource('points', {
                  type: 'geojson',
                  data: points
                })
                map.addLayer(this.generatePointsLayer())
              }
          )
          map.addSource('route', {
            type: 'geojson',
            lineMetrics: true,
            data: route
          })
          map.addLayer(this.generateRouteLayer())

          this.myChart = map

          // point的鼠标事件
          map.on('mouseenter', 'points', () => {
            _this.tooltip.showTooltip = true
          })
          map.on('mouseleave', 'points', () => {
            _this.tooltip.showTooltip = false
          })
          map.on('mousemove', 'points', ({ point, originalEvent, features }) => {
            _this.tooltip.x = originalEvent.clientX + 10
            _this.tooltip.y = originalEvent.clientY - 95
            _this.currentPoint = { ...features[0].properties }
          })
        })
      }).catch(e => {
        this.showError = true
        console.error(e)
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    queryData () {
      /* return new Promise((resolve, reject) => {
        resolve({
          status: 200,
          data: {
            data: {
              result: [
                {
                  stat_time: 1701259999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.29,
                  subscriber_latitude: 39.8
                },
                {
                  stat_time: 1701269999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.34,
                  subscriber_latitude: 39.85
                },
                {
                  stat_time: 1701279999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.29,
                  subscriber_latitude: 39.9
                },
                {
                  stat_time: 1701299999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.39,
                  subscriber_latitude: 39.9
                },
                {
                  stat_time: 1701289999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.3,
                  subscriber_latitude: 39.97
                }
              ]
            }
          }
        })
      }) */
      const params = {
        resource: this.entity.entityName,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      return axios.get(`${api.entity.locationTrack}`, { params })
    },
    generateRouteGEOJSON (result) {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: result.map(r => [r.subscriber_longitude, r.subscriber_latitude])
            }
          }
        ]
      }
    },
    generatePointsGEOJSON (result) {
      return {
        type: 'FeatureCollection',
        features: result.map((r, index) => {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [r.subscriber_longitude, r.subscriber_latitude]
            },
            properties: {
              index: index + 1,
              stat_time: r.stat_time,
              longitude: r.subscriber_longitude,
              latitude: r.subscriber_latitude
            }
          }
        })
      }
    },
    generateRouteLayer () {
      return {
        id: 'route',
        source: 'route',
        type: 'line',
        paint: {
          'line-color': '#E26154',
          'line-width': 4,
          'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0,
            '#F4B32F',
            1,
            '#E26154'
          ]
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        }
      }
    },
    generatePointsLayer () {
      return {
        id: 'points',
        type: 'symbol',
        source: 'points',
        layout: {
          'icon-image': 'trace-point',
          'icon-size': 0.7,
          'icon-offset': [0, -20],
          'text-field': ['get', 'index'],
          'text-font': ['Noto Sans Bold'],
          'text-offset': [0, -1.1],
          'text-size': 13
        },
        paint: {
          'text-color': '#FFF'
        }
      }
    },
    computeMapCenter (result) {
      const longitude = result.map(r => r.subscriber_longitude)
      const latitude = result.map(r => r.subscriber_latitude)
      return [
        _.floor((_.max(longitude) + _.min(longitude)) / 2, 6),
        _.floor((_.max(latitude) + _.min(latitude)) / 2, 6)
      ]
    },
    computeMapZoom (result) {
      const longitude = result.map(r => r.subscriber_longitude)
      const latitude = result.map(r => r.subscriber_latitude)
      const longitudeRange = _.max(longitude) - _.min(longitude)
      const latitudeRange = _.max(latitude) - _.min(latitude)
      const max = _.max([this.minZoom, 7 - Math.log2(_.max([longitudeRange, latitudeRange]))])
      return _.min([max, this.maxZoom])
    },
    reload (startTime, endTime, dateRangeValue) {
      this.toggleLoading(true)
      this.timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime), dateRangeValue: dateRangeValue }
      this.queryData().then(res => {
        this.showError = false
        const result = _.get(res, 'data.data.result', []).sort((a, b) => a.stat_time - b.stat_time)
        console.info(result)
        const route = this.generateRouteGEOJSON(result)
        const points = this.generatePointsGEOJSON(result)
        this.myChart.getSource('route').setData(route)
        this.myChart.getSource('points').setData(points)
        if (result.length > 0) {
          this.myChart.jumpTo({ center: this.computeMapCenter(result) })
          this.myChart.zoomTo(this.computeMapZoom(result))
        }
      }).catch(e => {
        this.showError = true
        console.error(e)
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    async queryTraceTracking () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        dateRangeValue: this.timeFilter.dateRangeValue,
        subscriberIds: `'${this.entity.entityName}'`,
        level: this.mapLevel
      }
      this.trackingSubscriber.subscriberId = this.entity.entityName
      try {
        const response = await axios.get(api.location.tracking, { params })
        if (response.data.data.result) {
          this.trackingNoData = false
          this.showTrackingError = false
          const find = response.data.data.result.find(item => item.subscriberId === this.trackingSubscriber.subscriberId)
          if (find) {
            this.trackingSubscriber.trackRecords = find.trackRecords
          } else {
            this.trackingSubscriber.trackRecords = []
          }
          this.trackingSubscriber.show = false
        } else {
          this.trackingSubscriber.trackRecords = []
        }

        // 计算停留时间
        if (this.trackingSubscriber.trackRecords.length > 0) {
          const trackRecords = this.trackingSubscriber.trackRecords
          // 初始化时间线可视范围角标
          if (trackRecords.length < 11) {
            this.trackingSubscriber.scrollStartIndex = 0
            this.trackingSubscriber.scrollEndIndex = trackRecords.length
          } else {
            this.trackingSubscriber.scrollStartIndex = 0
            this.trackingSubscriber.scrollEndIndex = 11
          }

          if (trackRecords && trackRecords.length > 0) {
            for (let i = 0; i < trackRecords.length; i++) {
              if (i > 0) {
                if ((trackRecords[i - 1].subscriberLongitude === trackRecords[i].subscriberLongitude) && (trackRecords[i - 1].subscriberLatitude === trackRecords[i].subscriberLatitude)) {
                  // 如果连续两条地址重复，则将时间累加，并将上一条删除，键值-1继续循环
                  if (i > 1 && trackRecords[i - 2]) {
                    const stayTime = unitConvert(trackRecords[i - 2].time - trackRecords[i].time, unitTypes.time, 's')
                    if (Number(stayTime[0]) === Number(Number(stayTime[0]).toFixed(0))) {
                      stayTime[0] = Number(stayTime[0]).toFixed(0)
                    }
                    trackRecords[i].stayTime = stayTime.join(' ')
                  } else {
                    // 数据只有2条，或者第1条和第2条地点重复，删除1，合并时间
                    const stayTime = unitConvert(trackRecords[i - 1].time - trackRecords[i].time, unitTypes.time, 's')
                    if (Number(stayTime[0]) === Number(Number(stayTime[0]).toFixed(0))) {
                      stayTime[0] = Number(stayTime[0]).toFixed(0)
                    }
                    trackRecords[i].stayTime = stayTime.join(' ')
                  }
                  trackRecords.splice(i - 1, 1)
                  i = i - 1
                } else {
                  const stayTime = unitConvert(trackRecords[i - 1].time - trackRecords[i].time, unitTypes.time, 's')
                  if (Number(stayTime[0]) === Number(Number(stayTime[0]).toFixed(0))) {
                    stayTime[0] = Number(stayTime[0]).toFixed(0)
                  }
                  trackRecords[i].stayTime = stayTime.join(' ')
                }
                if (i === trackRecords.length - 1) {
                  // 初始化数据时，重置偏移量和列表高度
                  this.trackingSubscriber.startOffset = 0
                  this.trackingSubscriber.listHeight = i * this.scrollInfo.itemSize
                }
              } else {
                trackRecords[i].stayTime = '-'
              }
            }
          }
          this.trackingSubscriber.trackRecords = trackRecords
        } else {
          this.trackingNoData = true
        }
      } catch (e) {
        this.showTrackingError = true
        this.trackingErrorMsg = this.errorMsgHandler(e)
        console.error(e)
      } finally {
        // this.loading.trackingMapLoading = false
      }
    },
    onScroll (e) {
      // 当前滚动位置
      const scrollTop = e.target.scrollTop
      // 列表开始索引
      const startIndex = Math.floor(scrollTop / this.scrollInfo.itemSize) || 1
      // 列表结束索引
      const endIndex = Math.ceil((scrollTop + this.scrollInfo.containerHeight) / this.scrollInfo.itemSize)
      this.trackingSubscriber.scrollStartIndex = startIndex
      this.trackingSubscriber.scrollEndIndex = endIndex
      // 列表距离顶部距离
      this.trackingSubscriber.startOffset = scrollTop - (scrollTop % this.scrollInfo.itemSize)
    }
  },
  setup () {
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.subscriberMap || 60
    const timeFilter = ref({ dateRangeValue })
    const { startTime, endTime } = getNowTime(dateRangeValue)
    timeFilter.value.startTime = startTime
    timeFilter.value.endTime = endTime

    const currentPoint = ref({})
    const tooltip = ref({
      showTooltip: false
    })
    const myChart = shallowRef({})
    const mapLevel = ref('2')
    const trackingSubscriber = ref({
      subscriberId: '',
      show: false,
      showLine: false,
      scrollStartIndex: 0,
      scrollEndIndex: 11,
      startOffset: 0,
      listHeight: 0,
      trackRecords: []
    })
    const trackingSubscriberList = ref([])
    const scrollInfo = ref({
      itemSize: 50,
      containerHeight: 660
    })
    const trackingNoData = ref(true)
    const showTrackingError = ref(false)
    const trackingErrorMsg = ref('')

    return {
      timeFilter,
      currentPoint,
      tooltip,
      myChart,
      maxZoom: 13,
      minZoom: 1,
      center: [116.38, 39.9],
      mapLevel,
      trackingSubscriber,
      trackingSubscriberList,
      scrollInfo,
      trackingNoData,
      showTrackingError,
      trackingErrorMsg
    }
  }
}
</script>
