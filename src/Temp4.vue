<template>
  <div class="geo-analysis">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('geo.locationMap')" name="locationMap"></el-tab-pane>
      <el-tab-pane :label="$t('geo.traceTracking')" name="traceTracking"></el-tab-pane>
    </el-tabs>
    <div class="geo-analysis__container">
      <div class="analysis-map" id="analysisMap4"></div>
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

  .geo-analysis__hexagon-tooltip {
    position: fixed;
    background-color: rgba(255,255,255,0.80);
    box-shadow: 0 1px 10px 0 rgba(0,0,0,0.5);
    border-radius: 2px;

    &.geo-analysis__hexagon-tooltip--hexagon {
      width: 185px;
    }
    .hexagon-tooltip__header {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 10px 0 10px 63px;
      color: white;

      .header__icon {
        position: absolute;
        left: 14px;
        top: 16px;
      }
      .header__title {
        font-size: 16px;
      }
      .header__content {
        font-size: 14px;
      }
    }
    .hexagon-tooltip__body {
      padding: 8px 18px;

      .body__item {
        display: flex;
        .item__label {
          width: 60px;
          font-size: 12px;
          color: #353636;
        }
        .item__value {
          font-size: 12px;
          color: #233447;
        }
      }
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
import _data4 from '@/test/nyc_crashes3.json'
import _data2 from '@/test/humanAndStation.json'
import _data3 from '@/test/testHex.json'
import hexbinDataConverter from '@/utils/hexbinDataConverter'

export default {
  name: 'Temp',
  data () {
    return {
      activeTab: 'locationMap', // locationMap/traceTracking
      // colorRamp: ['#9CAE1D', '#3F85BA', '#253780']
      colorRamp: ['156,174,29', '63,133,186', '37,55,128'],
      tooltipType: {
        hexagon: 'hexagon',
        baseStation: 'base-station',
        human: 'human'
      }
    }
  },
  methods: {
    init () {
      const _this = this
      const map = new maplibregl.Map({
        container: 'analysisMap4',
        style: mapStyle,
        center: this.center,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        zoom: 10
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
      map.on('load', function () {
        map.addSource('hexGrid', {
          type: 'geojson',
          data: _data4
        })
        map.addLayer({
          id: 'crashesHexGrid',
          type: 'fill',
          source: 'hexGrid',
          layout: {},
          paint: {
            'fill-color': '#088',
            'fill-opacity': 0.8
          }
        })
      })
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
      showTooltip: false,
      type: ''
    })
    const myChart = shallowRef({})
    const currentPoint = ref({})
    return {
      timeFilter,
      tooltip,
      myChart,
      currentPoint,
      maxZoom: 13,
      minZoom: 1,
      center: [-73.94539, 40.841843] // [116.38, 39.9]
    }
  }
}
</script>
