<template>
  <div class="cn-chart__map">
    <div class="map-canvas" id="npmMap"></div>
    <div class="map-filter">
      <el-select
          size="mini"
          v-model="trafficDirection"
          class="map-select map-select__direction"
          popper-class="map-select-down"
          :popper-append-to-body="false"
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
          popper-class="map-select-down"
          :popper-append-to-body="false"
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
import { shallowRef } from 'vue'
import * as am4Core from '@amcharts/amcharts4/core'
import * as am4Maps from '@amcharts/amcharts4/maps'
import { computeScore, getGeoData } from '@/utils/tools'
import { storageKey, unitTypes, countryNameIdMapping } from '@/utils/constants'
import locationOptions from '@/views/charts2/charts/locationOptions'
import { valueToRangeValue } from '@/utils/unit-convert'
import { getSecond } from '@/utils/date-util'
import { api, getData } from '@/utils/api'
import { get } from '@/utils/http'
import chartMixin from '@/views/charts2/chart-mixin'
import { Rectangle3D } from '@amcharts/amcharts4/.internal/core/elements/3d/Rectangle3D'
export default {
  name: 'NpmMap',
  data () {
    return {
      locationOptions,
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
  mixins: [chartMixin],
  methods: {
    async initMap () {
      // 初始化插件
      this.toggleLoading(true)
      const geoData = await getGeoData(storageKey.iso36112WorldLow)
      const chart = am4Core.create('npmMap', am4Maps.MapChart)
      chart.geodata = geoData
      chart.projection = new am4Maps.projections.Miller()
      chart.homeZoomLevel = 2
      chart.homeGeoPoint = {
        latitude: 21,
        longitude: 0
      }
      this.myChart = shallowRef(chart)
      this.polygonSeries = shallowRef(this.polygonSeriesFactory())
      this.worldImageSeries = shallowRef(this.imageSeriesFactory('score', this.polygonSeries))
      // 渲染
      this.loadAm4ChartMap(this.polygonSeries, this.worldImageSeries)

      this.worldImageSeries.mapImages.template.events.on('hit', async ev => {
        this.$store.commit('setNpmLocationCountry', ev.target.dataItem.dataContext.name)
        this.location = ev.target.dataItem.dataContext.name
        const countryId = ev.target.dataItem.dataContext.id
        ev.target.isHover = false
        await this.drill(countryId)
      })
    },
    loadAm4ChartMap (polygonSeries, imageSeries) {
      try {
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
          side: this.trafficDirection.toLowerCase(),
          country: this.location
        }
        getData(api.npm.location.map, params).then(res => {
          if (res.length > 0) {
            // 计算分数
            const tcpRequest = get(api.npm.location.mapTcp, params)
            const httpRequest = get(api.npm.location.mapHttp, params)
            const sslRequest = get(api.npm.location.mapSsl, params)
            const tcpLostRequest = get(api.npm.location.mapPacketLoss, params)
            const packetRetransRequest = get(api.npm.location.mapPacketRetrans, params)
            Promise.all([tcpRequest, httpRequest, sslRequest, tcpLostRequest, packetRetransRequest]).then(res2 => {
              const keyPre = ['tcp', 'http', 'ssl', 'tcpLost', 'packetRetrans']
              const mapData = res
              res2.forEach((r, i) => {
                if (r.code === 200) {
                  mapData.forEach(t => {
                    let score = 0
                    const find = r.data.result.find(d => d.country === t.country)
                    if (find) {
                      score = computeScore(find, i)
                    }
                    t[keyPre[i] + 'Score'] = score
                  })
                } else {
                  mapData.forEach(t => {
                    t[keyPre[i] + 'Score'] = 0
                  })
                }
              })
              mapData.forEach(t => {
                t.score = Math.ceil((t.tcpScore + t.httpScore + t.sslScore + t.tcpLostScore + t.packetRetransScore) * 6)
                if (t.score > 6) {
                  t.score = 6
                }
              })
              this.loadMarkerData(imageSeries, mapData)
            })
          } else {
            imageSeries.data = [{}]
          }
        }).finally(() => {
          this.toggleLoading(false)
        })
      } catch (e) {
        console.error(e)
      }
    },
    loadMarkerData (imageSeries, data) {
      imageSeries.data = data.map(r => ({
        score: r.score,
        name: r.province || r.country,
        throughput: valueToRangeValue(r.throughBitsRate, unitTypes.bps).join(' '),
        id: r.serverId,
        color: this.scoreColor(r.score),
        border: this.scoreColor(r.score)
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
          <div class="map-tooltip__title">{name}</div>
          <div class="map-tooltip__content">
            <div class="content-row">
              <div class="row__label">Score</div>
              <div class="row__value">{score}</div>
            </div>
            <div class="content-row">
              <div class="row__label">Throughput</div>
              <div class="row__value">{throughput}</div>
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
    },
    async drill (countryId) {
      if (countryId) {
        const targetMapObject = this.polygonSeries.getPolygonById(countryId)
        targetMapObject.series.chart.zoomToMapObject(targetMapObject)
        const geoData = await getGeoData(countryId)
        if (geoData) {
          if (!this.countrySeries) {
            this.countrySeries = this.polygonSeriesFactory()
          }
          if (!this.countryImageSeries) {
            this.countryImageSeries = this.imageSeriesFactory('score', this.countrySeries)
          }
          this.countrySeries.show()
          this.countryImageSeries.show()
          this.countrySeries.geodata = geoData
          this.polygonSeries.hide()
          this.worldImageSeries.hide()
          this.$nextTick(() => {
            this.loadAm4ChartMap(this.countrySeries, this.countryImageSeries)
          })
        }
      }
    }
  },
  watch: {
    trafficDirection (n) {
      this.$store.commit('setNpmLocationSide', n.toLowerCase())
      if (this.location) {
        this.loadAm4ChartMap(this.countrySeries, this.countryImageSeries)
      } else {
        this.loadAm4ChartMap(this.polygonSeries, this.worldImageSeries)
      }
    },
    async location (n) {
      this.$store.commit('setNpmLocationCountry', n)
      if (n) {
        const countryId = countryNameIdMapping[n]
        await this.drill(countryId)
      } else {
        this.polygonSeries.show()
        this.worldImageSeries.show()
        this.countrySeries.hide()
        this.countryImageSeries.hide()
        this.myChart.zoomToGeoPoint(this.myChart.homeGeoPoint, this.myChart.homeZoomLevel, true)
      }
    },
    timeFilter: {
      deep: true,
      handler (n) {
        if (this.location) {
          this.loadAm4ChartMap(this.countrySeries, this.countryImageSeries)
        } else {
          this.loadAm4ChartMap(this.polygonSeries, this.worldImageSeries)
        }
      }
    }
  },
  mounted () {
    this.initMap()
  },
  beforeUnmount () {
    if (this.polygonSeries) {
      this.polygonSeries.mapPolygons.template.events.off('hit', this.mapBlockHitEvent)
    }
    this.polygonSeries = null
    this.countrySeries = null
    this.worldImageSeries = null
    this.countryImageSeries = null
    this.myChart && this.myChart.dispose()
    this.myChart = null
  }
}
</script>
