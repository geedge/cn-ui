<template>
  <div class="cn-chart__map-title" v-if="queryCondition">
    {{$t('npm.clientLocation')}}
    <chart-error v-if="showError" width="300" tooltip :content="errorMsg" />
  </div>
  <div class="cn-chart__map" :class="{'cn-chart__map-drilldown': queryCondition}">
    <div class="map-canvas" id="npmDrillDownMap"></div>
  </div>
</template>

<script>
import { ref, shallowRef } from 'vue'
import * as am4Core from '@amcharts/amcharts4/core'
import * as am4Maps from '@amcharts/amcharts4/maps'
import { computeScore, getGeoData } from '@/utils/tools'
import { curTabState, storageKey, unitTypes } from '@/utils/constants'
import { valueToRangeValue } from '@/utils/unit-convert'
import { getSecond } from '@/utils/date-util'
import { api, getData } from '@/utils/api'
import axios from 'axios'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import ChartError from '@/components/common/Error'

export default {
  name: 'NpmIpMap',
  components: { ChartError },
  setup () {
    const { query } = useRoute()
    const tabIndex = ref(query.tabIndex || '')
    const queryCondition = ref(query.queryCondition || '')
    return {
      tabIndex,
      queryCondition
    }
  },
  data () {
    return {
      myChart: null,
      polygonSeries: null,
      worldImageSeries: null,
      // Server | Client
      trafficDirection: 'Server',
      curTabState: curTabState,
      showError: false,
      errorMsg: ''
    }
  },
  mixins: [chartMixin],
  watch: {
    timeFilter: {
      handler () {
        this.loadAm4ChartMap(this.polygonSeries, this.worldImageSeries)
      }
    }
  },
  methods: {
    async initMap () {
      // 初始化插件
      this.toggleLoading(true)
      const geoData = await getGeoData(storageKey.iso36112WorldLow)
      const chart = am4Core.create('npmDrillDownMap', am4Maps.MapChart)
      chart.geodata = geoData
      chart.projection = new am4Maps.projections.Miller()
      chart.homeZoomLevel = 1.5
      chart.homeGeoPoint = {
        latitude: 21,
        longitude: 0
      }
      this.myChart = shallowRef(chart)
      this.polygonSeries = shallowRef(this.polygonSeriesFactory())
      this.worldImageSeries = shallowRef(this.imageSeriesFactory('score', this.polygonSeries))
      // 渲染
      this.loadAm4ChartMap(this.polygonSeries, this.worldImageSeries)
    },
    getUrlParam (param, defaultValue) {
      return this.$route.query[param] ? this.$route.query[param] : defaultValue
    },
    loadAm4ChartMap (polygonSeries, imageSeries) {
      try {
        // 清除数据
        // polygonSeries.data.splice(0)
        this.toggleLoading(true)
        // 清除legend
        this.myChart.children.each((s, i) => {
          if (s && s.className !== 'Container') {
            this.myChart.children.removeIndex(i)
          }
        })

        const params = {
          startTime: getSecond(this.timeFilter.startTime),
          endTime: getSecond(this.timeFilter.endTime),
          // type: this.$store.getters.getDimensionType,
          type: this.$route.query.dimensionType ? this.$route.query.dimensionType : '',
          // typeVal: this.$store.getters.getBreadcrumbColumnValue
          typeVal: this.getUrlParam(this.curTabState.fourthMenu, '')
        }
        if (params.type === 'serverIp' || params.type === 'clientIp') params.type = 'ip'
        getData(api.npm.overview.map, params).then(res => {
          this.showError = false
          if (res && res.length > 0) {
            const subParams = {
              ...params,
              params: res.map(r => `'${r.countryRegion}'`).join(',')
            }
            // 计算分数
            const tcpRequest = axios.get(api.npm.overview.mapTcp, { params: subParams })
            const httpRequest = axios.get(api.npm.overview.mapHttp, { params: subParams })
            const sslRequest = axios.get(api.npm.overview.mapSsl, { params: subParams })
            const tcpLostRequest = axios.get(api.npm.overview.mapPacketLoss, { params: subParams })
            const packetRetransRequest = axios.get(api.npm.overview.mapPacketRetrans, { params: subParams })
            Promise.all([tcpRequest, httpRequest, sslRequest, tcpLostRequest, packetRetransRequest]).then(res2 => {
              const keyPre = ['tcp', 'http', 'ssl', 'tcpLost', 'packetRetrans']
              const mapData = res
              res2.forEach((r, i) => {
                if (r.status === 200) {
                  mapData.forEach(t => {
                    t[keyPre[i] + 'Score'] = r.data.data.result.find(d => d.countryRegion === t.countryRegion && d.superAdminArea === t.superAdminArea)
                  })
                } else {
                  this.showError = true
                  this.errorMsg = this.errorMsgHandler(r)
                }
              })
              mapData.forEach(t => {
                const data = {
                  establishLatencyMs: t.tcpScore ? t.tcpScore.establishLatencyMs : null,
                  httpResponseLatency: t.httpScore ? t.httpScore.httpResponseLatency : null,
                  sslConLatency: t.sslScore ? t.sslScore.sslConLatency : null,
                  tcpLostlenPercent: t.tcpLostScore ? t.tcpLostScore.tcpLostlenPercent : null,
                  pktRetransPercent: t.packetRetransScore ? t.packetRetransScore.pktRetransPercent : null
                }
                t.tooltip = {}
                t.tooltip.width = t.superAdminArea ? 0 : 18
                t.tooltip.marginRight = t.superAdminArea ? 0 : 6
                t.tooltip.data = {
                  establishLatencyMs: valueToRangeValue(data.establishLatencyMs, unitTypes.time).join(' '),
                  httpResponseLatency: valueToRangeValue(data.httpResponseLatency, unitTypes.time).join(' '),
                  sslConLatency: valueToRangeValue(data.sslConLatency, unitTypes.time).join(' '),
                  tcpLostlenPercent: valueToRangeValue(data.tcpLostlenPercent, unitTypes.percent).join(' '),
                  pktRetransPercent: valueToRangeValue(data.pktRetransPercent, unitTypes.percent).join(' ')
                }
                t.tooltip.data.score = computeScore(data)
                if (t.tooltip.data.score === '-') {
                  t.tooltip.data.score = ''
                }
                t.tooltip.data.total = valueToRangeValue(t.totalBitsRate, unitTypes.bps).join(' ')
                t.tooltip.data.inbound = valueToRangeValue(t.inboundBitsRate, unitTypes.bps).join(' ')
                t.tooltip.data.outbound = valueToRangeValue(t.outboundBitsRate, unitTypes.bps).join(' ')
                t.tooltip.text = {
                  traffic: this.$t('overall.traffic'),
                  total: this.$t('network.total'),
                  inbound: this.$t('network.inbound'),
                  outbound: this.$t('network.outbound'),
                  performance: this.$t('linkMonitor.performance'),
                  score: this.$t('network.score'),
                  tcpLostlenPercent: this.$t('networkAppPerformance.packetLoss'),
                  pktRetransPercent: this.$t('networkAppPerformance.packetRetrans'),
                  establishLatencyMs: this.$t('networkAppPerformance.tcpConnectionEstablishLatency'),
                  httpResponseLatency: this.$t('networkAppPerformance.httpResponseLatency'),
                  sslConLatency: this.$t('networkAppPerformance.sslResponseLatency')
                }
              })
              this.loadMarkerData(imageSeries, mapData)
            })
          } else {
            // 没数据，清空图表
            imageSeries.data = [{}]
          }
        }).catch(e => {
          this.showError = true
          this.errorMsg = this.errorMsgHandler(e)
        }).finally(() => {
          this.toggleLoading(false)
        })
      } catch (e) {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
      }
    },
    loadMarkerData (imageSeries, data) {
      const _data = data.filter(d => d.tooltip.data.score || d.tooltip.data.score === 0)
      imageSeries.data = _data.map(r => ({
        ...r,
        score: r.tooltip.data.score,
        name: r.superAdminArea || r.countryRegion,
        id: r.serverId,
        color: this.scoreColor(r.tooltip.data.score),
        border: this.scoreColor(r.tooltip.data.score)
      }))
    },
    scoreColor (score) {
      if (score >= 0 && score <= 2) {
        return '#E26154'
      } else if (score > 2 && score <= 4) {
        return '#E5A219'
      } else if (score > 4 && score <= 6) {
        return '#7E9F54'
      }
    },
    generatePolygonTooltipHTML () {
      const html = `
        <div class="map-tooltip" style="padding-bottom: 10px;">
          <div class="map-tooltip__title"><img src="/images/flag/{id}.png" style="width: {tooltip.width}px;height: 12px;margin-right: {tooltip.marginRight}px;"/>{name}</div>
          <div class="map-tooltip__content">
            <div class="content-title">{tooltip.text.traffic}</div>
            <div class="content-row">
              <div class="row__label">{tooltip.text.total}</div>
              <div class="row__value">{tooltip.data.total}</div>
            </div>
            <div class="content-row">
              <div class="row__label">{tooltip.text.inbound}</div>
              <div class="row__value">{tooltip.data.inbound}</div>
            </div>
            <div class="content-row">
              <div class="row__label">{tooltip.text.outbound}</div>
              <div class="row__value">{tooltip.data.outbound}</div>
            </div>
            <div class="content-title">{tooltip.text.performance}</div>
            <div class="content-row content-row--score">
              <span style="background-color: {color}"></span>
              <div class="row__label">{tooltip.text.score}</div>
              <div class="row__value">{tooltip.data.score}</div>
            </div>
            <div class="content-row">
              <div class="row__label">{tooltip.text.tcpLostlenPercent}</div>
              <div class="row__value">{tooltip.data.tcpLostlenPercent}</div>
            </div>
            <div class="content-row">
              <div class="row__label">{tooltip.text.pktRetransPercent}</div>
              <div class="row__value">{tooltip.data.pktRetransPercent}</div>
            </div>
            <div class="content-row">
              <div class="row__label">{tooltip.text.establishLatencyMs}</div>
              <div class="row__value">{tooltip.data.establishLatencyMs}</div>
            </div>
            <div class="content-row">
              <div class="row__label">{tooltip.text.httpResponseLatency}</div>
              <div class="row__value">{tooltip.data.httpResponseLatency}</div>
            </div>
            <div class="content-row">
              <div class="row__label">{tooltip.text.sslConLatency}</div>
              <div class="row__value">{tooltip.data.sslConLatency}</div>
            </div>
          </div>
        </div>`
      return html
    },
    polygonSeriesFactory () {
      const polygonSeries = this.myChart.series.push(new am4Maps.MapPolygonSeries())
      polygonSeries.useGeodata = true
      polygonSeries.exclude = ['AQ'] // 排除南极洲
      polygonSeries.tooltip.getFillFromObject = false
      polygonSeries.tooltip.background.fill = am4Core.color('#41495D')
      polygonSeries.tooltip.background.filters.clear()
      polygonSeries.tooltip.background.stroke = '#41495D'
      const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.nonScalingStroke = true
      polygonTemplate.strokeWidth = 0.5
      polygonTemplate.stroke = am4Core.color('#CAD2D3')
      polygonTemplate.fill = am4Core.color('#EFEFEF')
      return polygonSeries
    },
    imageSeriesFactory (dataField, polygonSeries) {
      // amcharts实例中增加地图图案series（用来在地图上画圆点、方块、连线等）
      const imageSeries = this.myChart.series.push(new am4Maps.MapImageSeries())
      // 指定接口数据中哪个字段名代表数值
      imageSeries.dataFields.value = dataField || 'count'
      // 取出图案的默认模板，用来接下来做自定义更改
      const imageTemplate = imageSeries.mapImages.template
      imageTemplate.nonScaling = true
      // 通过地区ID来获取经纬度，设置后无需自己提供经纬度
      imageTemplate.adapter.add('latitude', function (latitude, target) {
        const polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id)
        if (polygon) {
          return polygon.visualLatitude
        }
        return latitude
      })
      imageTemplate.adapter.add('longitude', function (longitude, target) {
        const polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id)
        if (polygon) {
          return polygon.visualLongitude
        }
        return longitude
      })

      // 设置图案样式
      const circle = imageTemplate.createChild(am4Core.Circle)
      circle.propertyFields.fill = 'color'
      circle.propertyFields.stroke = 'border'
      circle.strokeWidth = 1
      circle.fillOpacity = 0.8
      circle.tooltipHTML = this.generatePolygonTooltipHTML()
      imageSeries.tooltip.getFillFromObject = false
      imageSeries.tooltip.background.fill = am4Core.color('#FFFFFF')
      imageSeries.tooltip.background.filters.clear()
      imageSeries.tooltip.background.stroke = '#C5C5C5'

      imageSeries.heatRules.push({
        target: circle,
        property: 'radius',
        min: 15,
        max: 15,
        dataField: 'value'
      })

      return imageSeries
    }
  },
  mounted () {
    this.initMap()
  },
  beforeUnmount () {
    this.polygonSeries = null
    this.worldImageSeries = null
    this.myChart && this.myChart.dispose()
    this.myChart = null
  }
}
</script>
