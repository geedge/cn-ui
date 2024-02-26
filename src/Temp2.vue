<template>
  <div class="geo-analysis">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('geo.locationMap')" name="locationMap"></el-tab-pane>
      <el-tab-pane :label="$t('geo.traceTracking')" name="traceTracking"></el-tab-pane>
    </el-tabs>
    <div class="geo-analysis__container">
      <div class="analysis-map" id="analysisMap2"></div>
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
import { H3HexagonLayer } from '@deck.gl/geo-layers'
import _data from '@/test/nyc_crashes.json'
import { h3ToGeo, geoToH3, h3ToGeoBoundary } from 'h3-js'

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
        container: 'analysisMap2',
        style: mapStyle,
        center: this.center,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        zoom: 10
      })
      const data = []
      _data.features.forEach(item => {
        data.push({
          hex: geoToH3(item.geometry.coordinates[1], item.geometry.coordinates[0], 9),
          value: Math.random()
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
      const hexagon = new MapboxOverlay({
        layers: [
          new H3HexagonLayer({
            id: 'hex',
            data: data,
            elevationScale: 20,
            extruded: false,
            filled: true,
            getFillColor: d => [255, (1 - d.value) * 255, 0, 160],
            getLineColor: d => [255, (1 - d.value) * 255 * 1.5 > 255 ? 255 : (1 - d.value) * 255 * 1.5, 0],
            getLineWidth: 20,
            getHexagon: d => d.hex,
            wireframe: false,
            pickable: true
          })
        ]
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
