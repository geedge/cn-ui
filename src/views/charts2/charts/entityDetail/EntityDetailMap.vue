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
      <chart-no-data v-if="isNoData" test-id="noData"></chart-no-data>
      <chart-error v-if="showError" :content="errorMsg" />
      <div id="subscriberMap" class="subscriber-map"></div>
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
import { getNowTime, getSecond } from '@/utils/date-util'

export default {
  name: 'EntityDetailMap',
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  mounted () {
    this.initMap()
  },
  unmounted () {
    this.myChart && this.myChart.remove()
    this.myChart = null
  },
  methods: {
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
      /*return new Promise((resolve, reject) => {
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
      })*/
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

    return {
      timeFilter,
      currentPoint,
      tooltip,
      myChart,
      maxZoom: 13,
      minZoom: 1,
      center: [116.38, 39.9]
    }
  }
}
</script>
