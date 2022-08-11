<template>
  <div class="cn-chart__map">
    <div class="map-canvas" id="npmMap"></div>
    <div class="map-filter">
      <el-select
          size="mini"
          v-model="trafficDirection"
          class="map-select map-select__direction"
      >
        <el-option value="Server">Server</el-option>
        <el-option value="Client">Client</el-option>
      </el-select>
      <el-select
          size="mini"
          v-model="location"
          class="map-select map-select__location"
          clearable
          placeholder="All"
          filterable
      >
        <template #prefix><i class="cn-icon cn-icon-location" style="color: #575757;"></i></template>
        <el-option v-for="(country, index) in locationOptions" :key="index" :value="country.value">{{country.label}}</el-option>
      </el-select>
    </div>
    <div class="map-legend">
      <div class="map-legend__row">
        <div class="map-legend__symbol map-legend__symbol--green"></div>
        <div class="map-legend__desc">{{$t('npm.highScore')}}</div>
      </div>
      <div class="map-legend__row">
        <div class="map-legend__symbol map-legend__symbol--yellow"></div>
        <div class="map-legend__desc">{{$t('npm.middleScore')}}</div>
      </div>
      <div class="map-legend__row">
        <div class="map-legend__symbol map-legend__symbol--red"></div>
        <div class="map-legend__desc">{{$t('npm.lowScore')}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapData, drillDownData } from '@/views/charts2/charts/mapTestData'
import { shallowRef } from 'vue'
import * as am4Core from '@amcharts/amcharts4/core'
import * as am4Maps from '@amcharts/amcharts4/maps'
import { getGeoData } from '@/utils/tools'
import { storageKey, unitTypes } from '@/utils/constants'
import locationOptions from '@/views/charts2/charts/locationOptions'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'

export default {
  name: 'NpmMap',
  data () {
    return {
      locationOptions,
      mapData,
      drillDownData,
      myChart: null,
      polygonSeries: null,
      countrySeries: null,
      worldImageSeries: null,
      countryImageSeries: null,
      // Server | Client
      trafficDirection: 'Server',
      location: ''
    }
  },
  methods: {
    initMap () {
      // 初始化插件
      const chart = am4Core.create('npmMap', am4Maps.MapChart)
      chart.geodata = getGeoData(storageKey.iso36112WorldLow)
      chart.projection = new am4Maps.projections.Miller()
      chart.homeZoomLevel = 2
      chart.homeGeoPoint = {
        latitude: 21,
        longitude: 0
      }
      this.myChart = shallowRef(chart)
      this.polygonSeries = shallowRef(this.polygonSeriesFactory())
      this.worldImageSeries = shallowRef(this.imageSeriesFactory('score'))
      // 渲染
      this.loadAm4ChartMap(this.polygonSeries, this.worldImageSeries)
      this.worldImageSeries.mapImages.template.events.on('hit', async ev => {
        const countryId = ev.target.dataItem.dataContext.id
        ev.target.isHover = false
        if (countryId) {
          const targetMapObject = this.polygonSeries.getPolygonById(countryId)
          targetMapObject.series.chart.zoomToMapObject(targetMapObject)
          const geoData = getGeoData(countryId)
          if (geoData) {
            this.countrySeries = shallowRef(this.polygonSeriesFactory())
            this.countrySeries.geodata = geoData
            this.countryImageSeries = shallowRef(this.imageSeriesFactory('score'))
            this.polygonSeries.hide()
            this.worldImageSeries.hide()
            const country = ev.target.dataItem.dataContext.name
            const queryParams = { ...this.queryParams, ipLocationCountry: country }
            const chartData = this.drillDownData
            this.loadAm4ChartMap(this.countrySeries, this.countryImageSeries, country, chartData)
          }
        }
      })
    },
    loadAm4ChartMap (polygonSeries, imageSeries, country, chartData) {
      // chartData不为空是下钻
      if (chartData) {
        this.$emit('showLoading', true)
      }
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
        const data = chartData || this.mapData
        imageSeries.data = data.map(r => ({
          score: r.score,
          id: r.locationId,
          color: this.scoreColor(r.score),
          border: this.scoreColor(r.score)
        }))
      } catch (e) {
        console.error(e)
      } finally {
        if (chartData) {
          setTimeout(() => {
            this.$emit('showLoading', false)
          }, 200)
        }
      }
    },
    convertMapData (data) {
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
    imageSeriesFactory (dataField) {
      const vm = this
      // amcharts实例中增加地图图案series（用来在地图上画圆点、方块、连线等）
      const imageSeries = this.myChart.series.push(new am4Maps.MapImageSeries())
      // 指定接口数据中哪个字段名代表数值
      imageSeries.dataFields.value = dataField || 'count'
      // 取出图案的默认模板，用来接下来做自定义更改
      const imageTemplate = imageSeries.mapImages.template
      imageTemplate.nonScaling = true
      // 通过地区ID来获取经纬度，设置后无需自己提供经纬度
      imageTemplate.adapter.add('latitude', function (latitude, target) {
        const polygon = vm.polygonSeries.getPolygonById(target.dataItem.dataContext.id)
        if (polygon) {
          return polygon.visualLatitude
        }
        return latitude
      })
      imageTemplate.adapter.add('longitude', function (longitude, target) {
        const polygon = vm.polygonSeries.getPolygonById(target.dataItem.dataContext.id)
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
      // circle.tooltipHTML = this.generatePolygonTooltipHTML()
      imageSeries.tooltip.getFillFromObject = false
      imageSeries.tooltip.background.fill = am4Core.color('#41495D')
      imageSeries.tooltip.background.filters.clear()
      imageSeries.tooltip.background.stroke = '#41495D'

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
  }
}
</script>
