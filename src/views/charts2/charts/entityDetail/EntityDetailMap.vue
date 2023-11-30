<template>
  <div class="subscriber-map">
    <div class="subscriber-map-header">
      <div class="subscriber-map-title">{{$t('subscriber.kpi')}}</div>
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
import _ from 'lodash'
import { ref } from 'vue'
import { getNowTime } from '@/utils/date-util'

export default {
  name: 'EntityDetailMap',
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  data () {
    return {
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      const map = new maplibregl.Map({
        container: 'subscriberMap',
        style: mapStyle,
        center: [116.39, 39.9],
        zoom: 9,
        maxZoom: 12,
        minZoom: 4,
        transformRequest: function (url, resourceType) {
          if (resourceType === 'Tile' && url.indexOf('https://api.maptiler.com/tiles/v3') > -1) {
            const urlParams = url.split('.pbf')[0].split('/')
            const z = urlParams[urlParams.length - 3]
            const x = urlParams[urlParams.length - 2]
            const y = urlParams[urlParams.length - 1]
            const newUrl1 = `${window.location.protocol}//${window.location.host}/tiles/${z}/${x}/${y}.pbf`
            return {
              url: newUrl1,
              credentials: 'include',
              method: 'GET'
            }
          }
          if (resourceType === 'SpriteJSON') {
            return {
              url: `${window.location.protocol}//${window.location.host}/tiles/sprite.json`,
              credentials: 'include',
              method: 'GET'
            }
          }
          if (resourceType === 'SpriteImage') {
            return {
              url: `${window.location.protocol}//${window.location.host}/tiles/sprite.png`,
              credentials: 'include',
              method: 'GET'
            }
          }
        }
      })

      /* axios.get(`${api.entity.locationTrack}?resource=${this.entity.entityName}`).then(res => {

      }) */
      this.toggleLoading(false)
      const res = {
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
      }
      const result = _.get(res, 'data.data.result', []).sort((a, b) => a.stat_time - b.stat_time)

      const route = {
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

      const points = {
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
              stat_time: r.stat_time
            }
          }
        })
      }

      map.on('load', () => {
        map.loadImage(
          `${window.location.protocol}//${window.location.host}/images/entity-detail/track-point.png`,
          (error, image) => {
            if (error) throw error
            map.addImage('trace-point', image)
            map.addSource('points', {
              type: 'geojson',
              data: points
            })
            map.addLayer({
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
            })
          }
        )
        map.addSource('route', {
          type: 'geojson',
          lineMetrics: true,
          data: route
        })
        map.addLayer({
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
        })
      })
    }
  },
  setup () {
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.subscriberMap || 60
    const timeFilter = ref({ dateRangeValue })
    const { startTime, endTime } = getNowTime(dateRangeValue)
    timeFilter.value.startTime = startTime
    timeFilter.value.endTime = endTime
    return {
      timeFilter
    }
  }
}
</script>
