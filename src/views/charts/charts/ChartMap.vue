<template>
  <div class="map-back" v-show="showMapBackButton" @click="mapBack">&lt; back</div>
  <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
</template>

<script>
import * as L from 'leaflet'
import * as am4Core from '@amcharts/amcharts4/core'
import * as am4Maps from '@amcharts/amcharts4/maps'
import { getGeoData, replaceUrlPlaceholder } from '@/utils/tools'
import { storageKey } from '@/utils/constants'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import {
  isIpBasicInfo,
  isMapBlock
} from './tools'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import { HeatLegend } from '@/components/amcharts/heatLegend'
import { getData } from '@/utils/api'

export default {
  name: 'ChartMap',
  data () {
    return {
      myChart: null,
      mapPictureUrl: '/Tiles/{z}/{x}/{y}.png',
      showMapBackButton: false,
      polygonSeries: null, // 世界地图series
      countrySeries: null // 下钻国家series
    }
  },
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    queryParams: Object
  },
  methods: {
    initMap (id) {
      if (this.isIpBasicInfo) {
        L.Marker.prototype.options.icon = L.icon({
          iconUrl: icon,
          shadowUrl: iconShadow
        })
        const map = L.map(`chart${this.chartInfo.id}`, {
          minZoom: 3,
          maxZoom: 7,
          zoom: 5,
          attributionControl: false,
          zoomControl: false,
          maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
        })
        L.tileLayer(
          this.mapPictureUrl,
          { noWrap: true }
        ).addTo(map)

        const attribution = L.control.attribution({ position: 'bottomright', prefix: '' })
        attribution.addAttribution(' © OpenStreetMap contributors')
        attribution.addTo(map)

        /* L.control.zoom({
          position: 'bottomright',
          zoomInText: '<i class="nz-icon nz-icon-enlarge"></i>',
          zoomOutText: '<i class="nz-icon nz-icon-narrow"></i>',
          zoomInTitle: '',
          zoomOutTitle: ''
        }).addTo(map) */

        this.myChart = map
        this.loadLeafletMap()
      } else {
        const chart = am4Core.create(id, am4Maps.MapChart)
        chart.geodata = getGeoData(storageKey.iso36112WorldLow)
        chart.projection = new am4Maps.projections.Miller()
        this.myChart = chart
        const polygonSeries = chart.series.push(new am4Maps.MapPolygonSeries())
        polygonSeries.useGeodata = true
        polygonSeries.exclude = ['AQ'] // 排除南极洲
        polygonSeries.tooltip.getFillFromObject = false
        polygonSeries.tooltip.background.fill = am4Core.color('#FFFFFF')
        this.polygonSeries = polygonSeries
        const polygonTemplate = polygonSeries.mapPolygons.template
        polygonTemplate.tooltipHTML = this.generateTooltipHTML()
        polygonTemplate.nonScalingStroke = true
        polygonTemplate.strokeWidth = 0.5
        polygonTemplate.fill = am4Core.color('rgba(176,196,222,.5)')
        this.loadAm4ChartMap(this.polygonSeries)
        // 地图点击事件
        polygonTemplate.events.on('hit', async ev => {
          const countryId = ev.target.dataItem.dataContext.id
          if (countryId) {
            ev.target.series.chart.zoomToMapObject(ev.target)
            ev.target.isHover = false
            this.countrySeries = chart.series.push(new am4Maps.MapPolygonSeries())
            this.countrySeries.tooltip.getFillFromObject = false
            this.countrySeries.tooltip.background.fill = am4Core.color('#FFFFFF')
            const countryTemplate = this.countrySeries.mapPolygons.template
            countryTemplate.tooltipHTML = this.generateTooltipHTML()
            countryTemplate.nonScalingStroke = true
            countryTemplate.strokeWidth = 0.5
            countryTemplate.fill = am4Core.color('rgba(176,196,222,.5)')
            const geoData = getGeoData(countryId)
            if (geoData) {
              this.countrySeries.geodata = geoData
              this.polygonSeries.hide()
              const country = ev.target.dataItem.dataContext.serverCountry
              const queryParams = { ...this.queryParams, country }
              const chartData = await getData(replaceUrlPlaceholder(this.chartInfo.params.url, queryParams))
              this.loadAm4ChartMap(this.countrySeries, ev.target.dataItem.dataContext.serverCountry, chartData)
            }
          }
        })
      }
    },
    loadAm4ChartMap (polygonSeries, country, chartData) {
      this.$emit('showLoading', true)
      try {
        // 清除数据
        polygonSeries.data.splice(0)
        // 清除legend
        this.myChart.children.each((s, i) => {
          if (s && s.className !== 'Container') {
            this.myChart.children.removeIndex(i)
          }
        })

        this.showMapBackButton = !!country
        const chartParams = this.chartInfo.params
        const data = chartData || this.chartData
        if (data && this.isMapBlock) {
          const sumData = []
          data.forEach(r => {
            const hit = sumData.find(s => s.id === r.serverId)
            const { key, labelText } = this.getDataKey(r)
            const value = Number(r[key]) || 0
            if (hit) {
              hit.value += value
            } else {
              sumData.push({
                id: r.serverId,
                serverCountry: r.serverCountry,
                key,
                labelText,
                value
              })
            }
          })
          const seriesData = sumData.map(r => ({
            ...r,
            showValue: (r.value || r.value === 0) ? valueToRangeValue(r.value, chartParams.unitType).join(' ') : ''
          }))
          polygonSeries.data = [...seriesData]
          const sorted = seriesData.sort((a, b) => b.value - a.value)
          const allZero = this.$_.isEmpty(sorted) || Number(sorted[0].value) === 0 // 数据全为0的情况，legend只显示1个颜色

          polygonSeries.heatRules.push({
            property: 'fill',
            target: polygonSeries.mapPolygons.template,
            min: this.myChart.colors.getIndex(1).brighten(1),
            max: allZero ? this.myChart.colors.getIndex(1).brighten(1) : this.myChart.colors.getIndex(1).brighten(-0.3)
          })
          const heatLegend = this.myChart.createChild(HeatLegend)
          heatLegend.markerContainer.height = 6
          heatLegend.series = polygonSeries
          heatLegend.align = 'left'
          heatLegend.markerCount = allZero ? 1 : 3
          heatLegend.minValue = 0
          heatLegend.fontSize = 12
          heatLegend.maxValue = allZero ? 1 : Number(sorted[0].value)
          heatLegend.width = allZero ? am4Core.percent(10) : am4Core.percent(25)
          heatLegend.marginLeft = 15
          heatLegend.valign = 'bottom'

          const minRange = heatLegend.valueAxis.axisRanges.create()
          minRange.value = heatLegend.minValue
          minRange.label.text = minRange.value === 0 ? 0 : unitConvert(heatLegend.minValue, chartParams.unitType).join(' ')
          const maxRange = heatLegend.valueAxis.axisRanges.create()
          maxRange.value = heatLegend.maxValue
          maxRange.label.text = maxRange.value === 0 ? 0 : unitConvert(heatLegend.maxValue, chartParams.unitType).join(' ')

          heatLegend.valueAxis.renderer.labels.template.adapter.add('text', function (labelText) {
            return ''
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 200)
      }
    },
    loadLeafletMap () {
      this.$emit('showLoading', true)
      try {
        this.myChart.setView([this.chartData.latitude, this.chartData.longitude], 5)
        const myIcon = L.divIcon({
          className: 'cn-icon cn-icon-position2 position-icon'
        })
        L.marker([this.chartData.latitude, this.chartData.longitude], { icon: myIcon }).addTo(this.myChart)
      } finally {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 200)
      }
    },
    mapBack () {
      this.countrySeries.hide()
      this.$nextTick(() => {
        this.showMapBackButton = false
        this.polygonSeries.show()
        this.myChart.goHome()
      })
    },
    generateTooltipHTML () {
      return `
        <div class="map-tooltip" style="padding-bottom: 10px;">
          <div class="map-tooltip__title">{name}</div>
          <div class="map-tooltip__content">
            <span>{labelText}</span>
            <span>{showValue}</span>
          </div>
        </div>
      `
    },
    getDataKey (r) {
      let key = ''
      let labelText = ''
      if (r.establishLatency || r.establishLatency === 0) {
        key = 'establishLatency'
        labelText = this.$t('networkAppPerformance.tripTime')
      } else if (r.httpResponseLatency || r.httpResponseLatency === 0) {
        key = 'httpResponseLatency'
        labelText = this.$t('networkAppPerformance.httpResponse')
      } else if (r.sslConLatency || r.sslConLatency === 0) {
        key = 'sslConLatency'
        labelText = this.$t('networkAppPerformance.sslResponse')
      } else if (r.sequenceGapLossPercent || r.sequenceGapLossPercent === 0) {
        key = 'sequenceGapLossPercent'
        labelText = this.$t('networkAppPerformance.packetLossRate')
      } else if (r.pktRetransPercent || r.pktRetransPercent === 0) {
        key = 'pktRetransPercent'
        labelText = this.$t('networkAppPerformance.retransmissionRate')
      } else if (r.sessions || r.sessions === 0) {
        key = 'sessions'
        labelText = this.$t('overall.sessions')
      }
      return { key, labelText }
    }
  },
  mounted () {
    this.initMap(`chart${this.chartInfo.id}`)
  },
  setup (props) {
    return {
      isIpBasicInfo: isIpBasicInfo(props.chartInfo.type),
      isMapBlock: isMapBlock(props.chartInfo.type)
    }
  }
}
</script>
