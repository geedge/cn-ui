<template>
  <div class="geo-analysis">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('geo.locationMap')" name="locationMap"></el-tab-pane>
      <el-tab-pane :label="$t('geo.traceTracking')" name="traceTracking"></el-tab-pane>
    </el-tabs>
    <div class="geo-tools">
      <el-input size="mini" style="margin-right: 10px; width: 200px;" placeholder="Press Enter to Search"></el-input>
      <div class="panel__time">
        <date-time-range
            class="date-time-range"
            :start-time="timeFilter.startTime"
            :end-time="timeFilter.endTime"
            :date-range="timeFilter.dateRangeValue"
            ref="dateTimeRange"
            @change="reload"
        />
        <time-refresh
            class="date-time-range"
            @change="timeRefreshChange"
            :end-time="timeFilter.endTime"
        />
      </div>
    </div>
    <div class="geo-analysis__container">
      <div class="analysis-map" id="analysisMap"></div>
      <div class="analysis-statistics">
        <div class="analysis-statistics__chart">
          <div class="chart__header">{{$t('locationIntelligence.populationDensity')}}</div>
          <div class="chart__body">
            <div class="chart__drawing" id="populationDensityChart"></div>
            <div class="chart__legend">
              <div v-for="legend in pieValueRamp" class="legend-item">
                <div class="legend-icon" :style="`background:rgb(${legend.color});`"></div>
                <div class="legend-range" >{{legend.start}}~{{legend.end}}</div>
                <div class="legend-count">{{legend.count}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="analysis-statistics__chart">
          <div class="chart__header">{{$t('locationIntelligence.activeSubscribers')}}</div>
          <div class="chart__statistics">
            <div class="statistics-number">{{activeCount}}</div>
            <div class="statistics-trend">-{{valueToRangeValue(activeCountChain, unitTypes.percent).join(' ')}}</div>
          </div>
          <div class="chart-line__drawing" id="activeSubscribersChart"></div>
        </div>
        <div class="analysis-statistics__title">Followed Subscribers</div>
        <div class="analysis-statistics__subscribers">
          <template v-for="item in 8">
            <div class="analysis-statistics__subscriber">
              <div class="subscriber__header">
                <div class="header__icon">
                  <div class="icon__box">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z" fill="#ffffff"></path></svg>
                  </div>
                </div>
                <div class="header__title">MSISDN</div>
                <div class="header__content">1-555-7777000</div>
              </div>
              <div class="subscriber__body">
                <div class="body__item">
                  <div class="item__label">Group</div>
                  <div class="item__value">Terrorist</div>
                </div>
                <div class="body__item">
                  <div class="item__label">Info</div>
                  <div class="item__value">Leader</div>
                </div>
                <div class="body__item">
                  <div class="item__label">Location</div>
                  <div class="item__value">China, Shanghai</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="geo-analysis__hexagon-tooltip" :class="`geo-analysis__hexagon-tooltip--${tooltip.type}`" v-if="tooltip.showMarkerTooltip || tooltip.showPolygonTooltip" :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}" @mouseenter="tooltipMouseEnter" @mouseleave="tooltipMouseLeave" @mousemove="tooltipMouseMove">
      <div class="hexagon-tooltip__header" :style="`background-color: ${tooltipHeaderColor}`">
        <div class="header__icon">
          <svg v-if="tooltip.type === tooltipType.hexagon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="36" height="36"><path d="M747.52 921.088H277.504L42.496 514.048l235.008-407.04H747.52l235.008 407.04-235.008 407.04z m-425.472-76.8h381.44l190.464-330.24-190.464-330.24h-381.44l-190.464 330.24 190.464 330.24z" fill="#fff"></path></svg>
          <template v-else-if="tooltip.type === tooltipType.human">
            <div class="icon__box">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z" fill="#ffffff"></path></svg>
            </div>
          </template>
          <template v-else-if="tooltip.type === tooltipType.baseStation">
            <div class="icon__box">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M164.901926 519.585185a391.35763 391.35763 0 0 1-30.151111-152.38637c0-52.527407 10.05037-105.054815 30.151111-152.348445 15.094519-47.29363 45.283556-89.353481 80.516741-126.103703L174.990222 15.17037C129.706667 62.464 94.511407 114.991407 69.328593 178.062222 44.183704 241.095111 34.133333 304.165926 34.133333 367.198815c0 63.070815 10.05037 131.375407 35.19526 189.174518 25.182815 57.799111 60.378074 115.598222 105.661629 162.891852l70.428445-73.576296c-35.233185-36.788148-65.422222-78.810074-80.516741-126.103704z" p-id="8786" fill="#ffffff"></path><path d="M255.469037 477.563259c15.094519 36.788148 35.195259 68.266667 60.340148 94.549334l70.428445-73.576297a233.168593 233.168593 0 0 1-40.201482-57.761185c-5.044148-26.282667-10.088296-47.29363-10.088296-73.576296 0-26.244741 5.044148-47.29363 15.094518-68.266667 5.006222-26.282667 20.100741-42.097778 35.19526-63.070815l-70.428445-73.576296c-25.144889 26.282667-45.24563 57.799111-60.340148 94.587259-15.094519 36.788148-20.100741 73.576296-20.100741 110.364445 0 36.788148 5.006222 73.53837 20.100741 110.326518zM436.527407 367.198815c0 43.538963 33.792 78.810074 75.472593 78.810074s75.472593-35.271111 75.472593-78.810074c0-43.501037-33.792-78.810074-75.472593-78.810074s-75.472593 35.271111-75.472593 78.810074zM637.76237 498.574222l70.428445 73.576297c25.144889-26.282667 45.24563-57.837037 60.340148-94.58726 15.094519-36.788148 20.100741-73.576296 20.100741-110.364444 0-36.788148-5.006222-73.576296-20.100741-110.364445-15.094519-36.750222-35.195259-68.266667-60.340148-94.549333l-70.428445 73.576296c15.094519 15.739259 30.189037 36.788148 40.201482 57.799111 10.088296 21.010963 15.132444 47.29363 15.132444 68.266667 0 26.282667-5.044148 47.331556-15.094518 68.342519-10.05037 31.516444-25.144889 47.29363-40.239408 68.266666z" p-id="8787" fill="#ffffff"></path><path d="M954.671407 178.062222C929.488593 114.991407 894.293333 62.464 849.009778 15.17037L778.619259 88.746667c35.233185 36.788148 60.378074 78.810074 80.516741 126.103703 20.100741 47.255704 30.151111 99.821037 30.151111 152.348445 0 52.565333-10.05037 105.092741-30.151111 152.38637-20.100741 47.29363-45.283556 89.315556-80.516741 126.103704l70.428445 73.576296c45.283556-47.29363 80.478815-99.858963 105.661629-162.891852 25.144889-63.070815 35.195259-126.103704 35.19526-189.174518 0-63.032889-10.05037-131.337481-35.19526-189.136593zM210.185481 1024h603.629038L512 551.10163 210.185481 1024z m186.102519-105.054815L512 740.238222l115.674074 178.631111h-231.348148z" fill="#ffffff"></path></svg>
            </div>
          </template>
        </div>
        <div class="header__title">
          <template v-if="tooltip.type === tooltipType.hexagon">HEX</template>
          <template v-else-if="tooltip.type === tooltipType.human">MSISDN</template>
          <template v-else-if="tooltip.type === tooltipType.baseStation">CID</template>
        </div>
        <div class="header__content">
          <template v-if="tooltip.type === tooltipType.hexagon">{{currentPolygon.hexId}}</template>
        </div>
      </div>
      <div class="hexagon-tooltip__body">
        <template v-if="tooltip.type === tooltipType.hexagon">
          <div class="body__item">
            <div class="item__label">Number</div>
            <div class="item__value">{{currentPolygon.number}}</div>
          </div>
          <div class="body__item">
            <div class="item__label">Locals</div>
            <div class="item__value">{{currentPolygon.number}}</div>
          </div>
          <div class="body__item">
            <div class="item__label">Visitors</div>
            <div class="item__value">{{currentPolygon.number}}</div>
          </div>
          <div class="body__item">
            <div class="item__label">Roamers</div>
            <div class="item__value">{{currentPolygon.number}}</div>
          </div>
        </template>
        <template v-else-if="tooltip.type === tooltipType.human">
          <div class="body__item">
            <div class="item__label">Group</div>
            <div class="item__value">Terrorist</div>
          </div>
          <div class="body__item">
            <div class="item__label">Info</div>
            <div class="item__value">Leader</div>
          </div>
          <div class="body__item">
            <div class="item__label">Location</div>
            <div class="item__value">China, Shanghai</div>
          </div>
          <div class="body__tracking">Trace Tracking</div>
        </template>
        <template v-else-if="tooltip.type === tooltipType.baseStation">
          <div class="body__item">
            <div class="item__label">Location Area Code</div>
            <div class="item__value">12</div>
          </div>
          <div class="body__item">
            <div class="item__label">Mobile Network Code</div>
            <div class="item__value">1</div>
          </div>
          <div class="body__item">
            <div class="item__label">Signal Strength</div>
            <div class="item__value">4</div>
          </div>
          <div class="body__item">
            <div class="item__label">Communication Type</div>
            <div class="item__value">4G</div>
          </div>
          <div class="body__item">
            <div class="item__label">Number of Online</div>
            <div class="item__value">1442</div>
          </div>
          <div class="body__item">
            <div class="item__label">Location</div>
            <div class="item__value">China, Shanghai</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, shallowRef } from 'vue'
import { getNowTime, getSecond } from '@/utils/date-util'
import maplibregl from 'maplibre-gl'
import mapStyle from '@/views/charts2/charts/entityDetail/mapStyle'
import 'maplibre-gl/dist/maplibre-gl.css'
import { valueToRangeValue } from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import * as echarts from 'echarts'
import { appListChartOption } from '@/views/charts2/charts/options/echartOption'
import { pieOption } from '@/views/location/chartOption'
import _ from 'lodash'
import { useRoute, useRouter } from 'vue-router'
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import axios from 'axios'
import { api } from '@/utils/api'
import { h3ToGeoBoundary } from 'h3-js'

export default {
  name: 'Location',
  data () {
    return {
      tooltipType: {
        hexagon: 'hexagon',
        baseStation: 'base-station',
        human: 'human'
      },
      activeCount: '',
      activeCountChain: ''
    }
  },
  methods: {
    valueToRangeValue,
    async initMap () {
      const _this = this
      const map = new maplibregl.Map({
        container: 'analysisMap',
        style: mapStyle,
        center: this.center,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        zoom: this.defaultZoom
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
      this.mapChart = map

      // 最先渲染右上角饼图
      await this.renderDensityPie()
      // 然后渲染地图的色块、基站、人（包括右侧关注列表），最后渲染右上角折线图
      map.on('load', async function () {
        console.info('map loaded')
        /* 地图色块 */
        const hexagonData = await _this.queryHexagon()
        // 将查到的h3hexagon数据转为geojson
        const polygonSourceData = _this.hexagonDataConverter(hexagonData)
        map.addSource('hexGrid', {
          type: 'geojson',
          data: polygonSourceData
        })
        // TODO 六边形边框，考虑加一层line layer
        map.addLayer({
          id: 'hexagon',
          type: 'fill',
          source: 'hexGrid',
          layout: {},
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.6]
          }
        })
        // 六边形的鼠标事件
        _this.bindHexagonEvents()

        /* 地图上的基站 */
        const baseStationData = await _this.queryBaseStation()
        /* 地图上的人 */

        /* 右侧关注列表 */

        /* 右上角折线图 */
        _this.renderActiveSubscribersLine()
      })
    },
    async renderDensityPie () {
      const params = {
        ...this.timeFilter
      }
      this.loading.pieLoading = true
      try {
        const response = await axios.get(api.location.density, { params })
        const densityData = response.data.data.list
        // 按值的大小分为5组，并计算各组数量和颜色
        this.pieValueRamp = this.calculateValueRamp(densityData)
        const option = _.cloneDeep(pieOption)
        option.color = this.pieColorRamp.map(c => `rgb(${c})`)
        option.series[0].data = this.pieValueRamp.map((r, i) => ({
          name: `${r.start}~${r.end}`,
          value: r.count
        }))
        this.pieOption = option
        if (!this.pieChart) {
          this.pieChart = echarts.init(document.getElementById('populationDensityChart'))
        }
        this.$nextTick(() => {
          this.pieChart.setOption(this.pieOption)
        })
      } catch (e) {
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        this.loading.pieLoading = false
      }
    },
    async renderActiveSubscribersLine () {
      const params = {
        ...this.timeFilter
      }
      this.loading.lineLoading = true
      try {
        const curCountResponse = await axios.get(api.location.count, { ...params, cycle: 0, data: { cycle: 0 } })// 当前周期活跃用户总数
        const preCountResponse = await axios.get(api.location.count, { ...params, cycle: 1, data: { cycle: 1 } })// 上一周期活跃用户总数
        this.activeCount = curCountResponse.data.data.total
        const preActiveCount = preCountResponse.data.data.total
        if (preActiveCount !== 0) {
          this.activeCountChain = (this.activeCount - preActiveCount) / preActiveCount
        }
        const trendResponse = await axios.get(api.location.trend, { params })
        const activeSubscribersData = trendResponse.data.data.result.values
        const option = _.cloneDeep(appListChartOption)
        option.series[0].data = activeSubscribersData.map(d => {
          return [d[0], d[1], unitTypes.number]
        })
        this.lineOption = option
        if (!this.lineChart) {
          this.lineChart = echarts.init(document.getElementById('activeSubscribersChart'))
        }
        this.lineChart.setOption(this.lineOption)
      } catch (e) {
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        this.loading.lineLoading = false
      }
    },
    async queryHexagon () {
      const params = {
        ...this.boundaryBox,
        ...this.timeFilter
      }
      this.loading.hexagonLoading = true
      try {
        const response = await axios.get(api.location.map, { params })
        return response.data.data.list
      } catch (e) {
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        this.loading.hexagonLoading = false
      }
      return []
    },
    async queryBaseStation () {
      this.loading.baseStationLoading = true
      try {
        const response = await axios.get(api.location.baseStation)
        return response.data.data.list
      } catch (e) {
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        this.loading.hexagonLoading = false
      }
      return []
    },
    // 先使用min=0的等宽分组法，若后续出现特大或特小的异常值导致等宽分组效果不理想，考虑用分位数分组法
    calculateValueRamp (data) {
      const max = _.maxBy(data, d => d.number)
      const maxLength = String(max.number).length
      const maxLegend = Math.ceil(max.number / Math.pow(10, maxLength - 1)) * Math.pow(10, maxLength - 1)
      const result = []
      for (let i = 1; i <= 5; i++) {
        const item = {
          start: maxLegend * (i - 1) / 5 + 1,
          end: maxLegend * i / 5,
          color: this.pieColorRamp[i - 1]
        }
        item.count = data.filter(d => d.number >= item.start && d.number < item.end).length
        result.push(item)
      }
      return result
    },
    hexagonDataConverter (data) {
      const features = data.map((d, i) => ({
        id: i + 1,
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            h3ToGeoBoundary(d.hexId, true)
          ]
        },
        properties: {
          hexId: d.hexId,
          number: d.number,
          color: this.getHexagonFillColor(d.number)
        }
      }))
      return {
        type: 'FeatureCollection',
        features: features
      }
    },
    getHexagonFillColor (number) {
      const ramp = this.pieValueRamp.filter(r => number >= r.start && number < r.end)
      if (ramp.length > 0) {
        return ramp[0].color.split(',').map(n => Number(n))
      }
      return [255, 255, 255]
    },
    bindHexagonEvents () {
      const _this = this
      this.mapChart.on('mouseenter', 'hexagon', () => {
        _this.tooltip.mouseIsInPolygon = true
      })
      this.mapChart.on('mouseleave', 'hexagon', () => {
        _this.tooltip.showPolygonTooltip = false
        _this.tooltip.mouseIsInPolygon = false
        // 去掉上一块的高亮
        hoverTrigger('hexGrid', _this.currentPolygon.id, false)
      })
      this.mapChart.on('mousemove', 'hexagon', ({ point, originalEvent, features }) => {
        if (!_this.tooltip.mouseIsInMarker) {
          _this.tooltip.showPolygonTooltip = true
          _this.tooltip.type = _this.tooltipType.hexagon
          if (_this.tooltip.type === _this.tooltipType.hexagon && _this.currentPolygon.id && _this.currentPolygon.id !== features[0].id) {
            // 去掉上一块的高亮
            hoverTrigger('hexGrid', _this.currentPolygon.id, false)
          }
          _this.currentPolygon = features[0].properties
          _this.currentPolygon.id = features[0].id
          _this.tooltip.x = originalEvent.clientX + 15
          _this.tooltip.y = originalEvent.clientY + 5

          // 鼠标滑过高亮
          hoverTrigger('hexGrid', _this.currentPolygon.id, true)
        }
      })
      function hoverTrigger (source, id, hover) {
        _this.mapChart.setFeatureState({ source, id }, { hover })
      }
    },
    tooltipMouseEnter () {
    },
    tooltipMouseMove () {
    },
    tooltipMouseLeave () {
    },
    reload (startTime, endTime, dateRangeValue) {
      this.timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime), dateRangeValue: dateRangeValue }
      const { query } = this.$route
      this.$store.commit('setTimeRangeArray', [this.timeFilter.startTime, this.timeFilter.endTime])
      this.$store.commit('setTimeRangeFlag', dateRangeValue.value)

      const newUrl = urlParamsHandler(window.location.href, query, {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        range: dateRangeValue.value
      })
      overwriteUrl(newUrl)
    },
    timeRefreshChange () {
      // 不是自选时间
      if (this.$refs.dateTimeRange) {
        if (!this.$refs.dateTimeRange.isCustom) {
          const value = this.timeFilter.dateRangeValue
          this.$refs.dateTimeRange.quickChange(value)
        } else {
          this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
        }
      } else {
        this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
      }
    }
  },
  watch: {
  },
  computed: {
    tooltipHeaderColor () {
      if (this.tooltip.type === this.tooltipType.hexagon) {
        const color = this.currentPolygon.color.split(',')
        color[0] = color[0].split('[')[1]
        color[2] = color[2].split(']')[0]
        return `rgba(${color.join(',')},.8)`
      } else if (this.tooltip.type === this.tooltipType.human) {
        return '#38ACD2'
      } else if (this.tooltip.type === this.tooltipType.baseStation) {
        return '#233447'
      }
      return ''
    }
  },
  async mounted () {
    await this.initMap()
  },
  setup () {
    const { currentRoute } = useRouter()
    const currentPath = currentRoute.value.path
    const activeTab = ref('')
    switch (currentPath) {
      case ('/location/map'): {
        activeTab.value = 'locationMap'
        break
      }
      case ('/location/tracking'): {
        activeTab.value = 'traceTracking'
        break
      }
    }
    const { query } = useRoute()
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime

    // 优先级：url > config.js > 默认值。
    const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.dashboard || 60)
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(dateRangeValue)
      timeFilter.value.startTime = getSecond(startTime)
      timeFilter.value.endTime = getSecond(endTime)
      // 如果没有时间参数，就将参数写入url
      const newUrl = urlParamsHandler(window.location.href, useRoute().query, { startTime: timeFilter.value.startTime, endTime: timeFilter.value.endTime, range: dateRangeValue })
      overwriteUrl(newUrl)
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }
    const minuteTimeFilter = ref({ startTime: timeFilter.value.startTime - 60, endTime: timeFilter.value.endTime })
    const tooltip = ref({
      type: ''
    })
    // const pieColorRamp = ['186,224,255', '105,177,255', '22,119,255', '0,62,179', '0,29,102']
    // const pieColorRamp = ['156,174,29', '241,198,0', '89,202,242', '63,133,186', '37,55,128']
    const pieColorRamp = ['196,214,59', '190,230,255', '135,206,250', '63,133,186', '37,55,128']
    const pieValueRamp = ref([])
    const boundaryBox = ref({}) // minLongitude、maxLongitude、minLatitude、maxLatitude
    const mapChart = shallowRef({})
    const pieChart = shallowRef(null)
    const pieOption = ref({})
    const lineChart = shallowRef(null)
    const lineOption = ref({})
    const currentBaseStation = ref({})
    const currentSubscriber = ref({})
    const currentPolygon = ref({})
    const loading = ref({
      mapLoading: true, // mapLoading控制地图的loading，它状态同时受hexagonLoading、timeBarLoading、baseStationLoading影响
      hexagonLoading: true, // 六边形加载状态
      timeBarLoading: true, // 时间轴和地图上的人型图标的加载状态
      baseStationLoading: true, // 基站加载状态

      followSubscriberLoading: true, // 控制右侧关注用户列表加载状态
      pieLoading: true, // 控制饼图加载状态
      lineLoading: true // 控制折线图加载状态
    })
    return {
      activeTab,
      timeFilter,
      minuteTimeFilter, // 底下时间轴的时间
      tooltip, // 控制鼠标悬浮框
      pieColorRamp, // 六边形颜色坡度
      pieValueRamp, // 饼图数值坡度，动态获取
      boundaryBox, // 查六边形的范围，minLongitude、maxLongitude、minLatitude、maxLatitude
      mapChart, // 地图对象
      pieChart, // 饼图对象
      pieOption,
      lineChart, // 折线图对象
      lineOption,
      currentBaseStation, // 鼠标当前悬浮的基站
      currentSubscriber, // 鼠标当前悬浮的Subscriber
      currentPolygon, // 鼠标当前悬浮的六边形
      loading, // 控制组件内各处loading图标
      maxZoom: 14, // 地图最小缩放比例
      minZoom: 3, // 地图最大缩放比例
      unitTypes,
      defaultZoom: 13, // 地图默认缩放比例
      center: [116.38, 39.9] // 地图默认中心点。北京：[116.38, 39.9] 纽约：[-73.94539, 40.841843]
    }
  },
  unmounted () {
    if (this.mapChart.remove) {
      this.mapChart && this.mapChart.remove()
    }
    if (this.pieChart.dispose) {
      this.pieChart && this.pieChart.dispose()
    }
    if (this.lineChart.dispose) {
      this.lineChart && this.lineChart.dispose()
    }
  }
}
</script>
<style lang="scss">
.geo-analysis {
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
  position: relative;

  .maplibregl-canvas:focus-visible {
    outline: none;
  }
  .geo-tools {
    position: absolute;
    display: flex;
    top: 11px;
    right: 20px;

    .panel__time {
      display: flex;
    }
  }
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
      border-radius: 2px;

      .map-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: default;
        padding: 0;

        &.map-marker--human {
          background-color: #233447;
        }
        &.map-marker--base-station {
          background-color: #585B5F;
        }
        &.map-marker--hover {
          width: 36px;
          height: 36px;
          border: 2px solid rgba(255,255,255,1);
        }
      }
    }
    .analysis-statistics {
      width: 330px;
      overflow-y: auto;
      padding-right: 5px;

      .analysis-statistics__chart {
        margin: 0 0 10px 20px;
        height: 148px;
        background: rgba(113,113,113,0.06);
        border: 1px solid rgba(226,229,236,1);
        border-radius: 4px;

        .chart__header {
          padding: 8px 0 0 10px;
          color: #353636;
          font-size: 16px;
        }
        .chart__body {
          display:flex;
          flex-direction:row;
          width:100%;
          height:calc(100% - 32px);
          .chart__legend {
            width:calc(60% - 22px);
            height: 100%;
            display:flex;
            flex-direction:column;
            justify-content: center;
            .legend-item {
              display:flex;
              flex-direction:row;
              justify-content: left;
              align-items: center;
              padding-top:2px;
              padding-bottom:2px;
              .legend-icon {
                width:16px;
                height:6px;
                border-radius: 2px;
                margin-right:10px;
              }
              .legend-range {
                margin-right:40px;
                width:54px;
                font-family: Helvetica;
                font-size: 12px;
                color: #575757;
                line-height: 12px;
                font-weight: 400;
              }
              .legend-count {
                font-family: Helvetica;
                font-size: 12px;
                color: #353636;
                line-height: 12px;
                font-weight: 400;
              }
            }
          }
        }
        .chart__statistics {
          display: flex;
          height: 20px;
          padding-left: 10px;

          .statistics-number {
            margin-right: 8px;
            color: #353636;
            font-size: 16px;
            line-height: 22px;
          }
          .statistics-trend {
            padding: 0 10px;
            background: #7E9F54;
            border-radius: 10px;
            text-align: center;
            font-size: 12px;
            color: white;
          }
        }
        .chart__drawing {
          height: 100%;
          width:calc(40% + 12px);
          margin-right:10px;
        }
        .chart-line__drawing {
          height: calc(100% - 32px);
        }
        #activeSubscribersChart {
          height: calc(100% - 52px);
        }
      }
      .analysis-statistics__title {
        margin-bottom: 10px;
        padding-left: 20px;
        font-size: 16px;
        color: #353636;
      }
      .analysis-statistics__subscribers {
        padding-left: 20px;

        .analysis-statistics__subscriber {
          margin-bottom: 10px;
          &:last-of-type {
            margin-bottom: 0;
          }

          background: #F7F7F7;
          border: 1px solid rgba(226,229,236,1);
          border-radius: 2px;

          .subscriber__header {
            position: relative;
            flex-direction: column;
            padding: 6px 0 0 70px;
            color: white;
            height: 58px;
            background-color: #38ACD2;

            .header__icon {
              position: absolute;
              left: 20px;
              top: 14px;

              .icon__box {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 30px;
                width: 30px;
                background-color: #233447;
                border-radius: 50%;
              }
            }
            .header__title {
              font-size: 16px;
            }
            .header__content {
              font-size: 14px;
            }
          }
          .subscriber__body {
            padding: 10px 18px;

            .body__item {
              display: flex;

              .item__label {
                padding-right: 10px;
                text-align: right;
                width: 60px;
                font-size: 12px;
                color: #353636;
              }
              .item__value {
                font-size: 12px;
                font-weight: bold;
                color: #233447;
              }
            }
          }
        }
      }
    }
  }

  .geo-analysis__hexagon-tooltip {
    position: fixed;
    background-color: rgba(255,255,255,0.80);
    box-shadow: 0 1px 10px 0 rgba(0,0,0,0.5);
    border-radius: 2px;
    min-width: 185px;

    /*&.geo-analysis__hexagon-tooltip--hexagon {
    }*/
    &.geo-analysis__hexagon-tooltip--human {
      .icon__box {
        background-color: #233447;
      }
    }
    &.geo-analysis__hexagon-tooltip--base-station {
      .icon__box {
        background-color: #585B5F;
      }
      .hexagon-tooltip__body {
        .body__item .item__label {
          width: 140px;
        }
      }
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

        .icon__box {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          width: 32px;
          border-radius: 50%;
        }
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
          padding-right: 10px;
          text-align: right;
          width: 60px;
          font-size: 12px;
          color: #353636;
        }
        .item__value {
          font-size: 12px;
          font-weight: bold;
          color: #233447;
        }
      }
      .body__tracking {
        padding-top: 6px;
        font-size: 12px;
        color: #38ACD2;
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
</style>
