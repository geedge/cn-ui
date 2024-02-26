<template>
  <div class="geo-analysis">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('geo.locationMap')" name="locationMap"></el-tab-pane>
      <el-tab-pane :label="$t('geo.traceTracking')" name="traceTracking"></el-tab-pane>
    </el-tabs>
    <div class="geo-analysis__container">
      <div class="analysis-map" id="analysisMap"></div>
      <div class="analysis-statistics"></div>
    </div>
  </div>
</template>
<style lang="scss">
.geo-analysis {
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;

  .el-tabs {
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__active-bar {
      height: 3px;
      background-color: #046eca;
    }
    .el-tabs__item {
      &.is-active {
        color: #046eca;
      }
      height: 50px;
      line-height: 50px;
      font-size: 20px;
      color: #353636;
    }
  }

  .geo-analysis__container {
    height: calc(100% - 50px);
    display: flex;

    .analysis-map {
      flex: 1;
    }
    .analysis-statistics {
      width: 330px;
    }
  }
}
</style>
<script>

import { ref, shallowRef } from 'vue'
import { getNowTime } from '@/utils/date-util'
import maplibregl from 'maplibre-gl'
import mapStyle from '@/views/charts2/charts/entityDetail/mapStyle'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { HexagonLayer } from '@deck.gl/aggregation-layers'
import _data from '@/test/nyc_crashes.json'

export default {
  name: 'Temp',
  data () {
    return {
      activeTab: 'locationMap', // locationMap/traceTracking

    }
  },
  methods: {
    init () {
      const _this = this
      const map = new maplibregl.Map({
        container: 'analysisMap',
        style: mapStyle,
        center: this.center,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        zoom: 10
      })
      const data = []
      _data.features.forEach(item => {
        data.push({
          coordinates: item.geometry.coordinates,
          value: Math.random() * 100
        })
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
      const colorRange = [
        [1, 152, 189],
        [73, 227, 206],
        [216, 254, 181],
        [254, 237, 177],
        [254, 173, 84],
        [209, 55, 78]
      ]
      const hexagon = new MapboxOverlay({
        layers: [
          new HexagonLayer({
            id: 'hex',
            colorRange,
            coverage: 1,
            radius: 500,
            extruded: false,
            data,
            wireframe: true,
            stroked: true,
            getPosition: d => d.coordinates,
            pickable: true,
            getLineColor: d => [0, 0, 0],
            getLineWidth: () => 2,
            getFillColor: d => [255, 255, 255]
          })
        ],
        getTooltip: ({ object }) => object && {
          html: `<h2>${object.index}</h2><div>${object.position}</div>`,
          style: {
            backgroundColor: '#fff',
            fontSize: '1em'
          }
        }
      })
      map.addControl(hexagon)
    }
  },
  async mounted () {
    this.init()
  },
  setup () {
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.dashboard || 60
    const timeFilter = ref({ dateRangeValue })
    const { startTime, endTime } = getNowTime(dateRangeValue)
    timeFilter.value.startTime = startTime
    timeFilter.value.endTime = endTime
    const tooltip = ref({
      showTooltip: false
    })
    const myChart = shallowRef({})
    return {
      timeFilter,
      tooltip,
      myChart,
      maxZoom: 13,
      minZoom: 1,
      center: [-73.94539, 40.841843] // [116.38, 39.9]
    }
  }
}
</script>
