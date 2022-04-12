<template>
  <div class="cn-chart__map">
    <div class="map-back" v-show="showMapBackButton" @click="mapBack">&lt; back</div>
    <div class="map-drawing" :id="`chart${chartInfo.id}`"></div>
    <div class="map-chart__legends" v-if="chartInfo.params.hasLegend">
      <div
          class="map-chart__legend"
          :class="`${currentLegendIndex === index ? 'map-chart__legend--active' : ''}`"
          v-for="(legend, index) in legends"
          :key="index"
          @click="changeLegend(index)"
      >
        <div
            class="legend__circle-marker"
            :style="`background-color:${markerColors[index].background};border: 1px solid ${markerColors[index].border};`"
        ></div>
        <div class="legend__value">{{unitConvert(legend.value, unitTypes.number).join(' ')}}</div>
        <div class="legend__name">{{legend.name}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import * as am4Core from '@amcharts/amcharts4/core'
import * as am4Maps from '@amcharts/amcharts4/maps'
import { getGeoData, replaceUrlPlaceholder } from '@/utils/tools'
import { storageKey, dnsServerRole, unitTypes } from '@/utils/constants'
import { isMapBlock, isMapPoint } from './tools'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import { HeatLegend } from '@/components/amcharts/heatLegend'
import { getData } from '@/utils/api'
import chartMixin from './chart-mixin'
import _ from 'lodash'
import { shallowRef } from 'vue'

export default {
  name: 'ChartMap',
  data () {
    return {
      unitTypes,
      mapPictureUrl: '/Tiles/{z}/{x}/{y}.png',
      showMapBackButton: false,
      polygonSeries: null, // 世界地图series
      countrySeries: null, // 下钻国家series
      worldImageSeries: null, // 世界地图圆点series
      countryImageSeries: null, // 下钻国家圆点series
      currentLegendIndex: 0,
      legends: [
        {
          name: this.$t('dns.rootDomainServers'),
          type: dnsServerRole.RTDNS,
          value: 0
        },
        {
          name: this.$t('dns.topLevelDomainServers'),
          type: dnsServerRole.TLDNS,
          value: 0
        },
        {
          name: this.$t('dns.authoritativeDomainServers'),
          type: dnsServerRole.ADNS,
          value: 0
        },
        {
          name: this.$t('dns.publicRecursiveDomainServers'),
          type: dnsServerRole.OPRDNS,
          value: 0
        },
        {
          name: this.$t('dns.selfBuiltDomainServers'),
          type: dnsServerRole.SBDNS,
          value: 0
        }
      ],
      markerColors: [
        {
          background: '#C0DEFE',
          border: '#68AFFC'
        },
        {
          background: '#DBCFFA',
          border: '#AA8CF2'
        },
        {
          background: '#A0E8E0',
          border: '#1CC9B5'
        },
        {
          background: '#FFE1B5',
          border: '#FFB84E'
        },
        {
          background: '#FDC6C6',
          border: '#FA7777'
        },
        {
          background: '#ECC6F7',
          border: '#B620E0'
        }
      ],
      keyMapping: [
        {
          key: 'sessions',
          label: this.$t('overall.sessions'),
          unitType: unitTypes.number
        },
        {
          key: 'establishLatency',
          label: this.$t('networkAppPerformance.tripTime'),
          unitType: unitTypes.time
        },
        {
          key: 'httpResponseLatency',
          label: this.$t('networkAppPerformance.httpResponse'),
          unitType: unitTypes.time
        },
        {
          key: 'sslConLatency',
          label: this.$t('networkAppPerformance.sslResponse'),
          unitType: unitTypes.time
        },
        {
          key: 'sequenceGapLossPercent',
          label: this.$t('networkAppPerformance.packetLossRate'),
          unitType: unitTypes.percent
        },
        {
          key: 'pktRetransPercent',
          label: this.$t('networkAppPerformance.retransmissionRate'),
          unitType: unitTypes.percent
        },
        {
          key: 'packets',
          label: this.$t('overall.packets'),
          unitType: unitTypes.number
        },
        {
          key: 'sentBytes',
          label: this.$t('overall.sent'),
          unitType: unitTypes.byte
        },
        {
          key: 'receivedBytes',
          label: this.$t('overall.received'),
          unitType: unitTypes.byte
        },
        {
          key: 'count',
          label: this.$t('overall.count'),
          unitType: unitTypes.number
        }
      ]
    }
  },
  mixins: [chartMixin],
  methods: {
    unitConvert,
    initMap (id) {
      const chart = am4Core.create(id, am4Maps.MapChart)
      chart.geodata = getGeoData(storageKey.iso36112WorldLow)
      chart.projection = new am4Maps.projections.Miller()
      this.myChart = shallowRef(chart)
      this.polygonSeries = this.polygonSeriesFactory()

      if (this.isMapPoint) {
        this.worldImageSeries = this.imageSeriesFactory()
      }

      this.loadAm4ChartMap(this.polygonSeries, this.worldImageSeries)

      // 地图点击事件
      if (this.isMapBlock) {
        this.polygonSeries.mapPolygons.template.events.on('hit', async ev => {
          const countryId = ev.target.dataItem.dataContext.id
          if (countryId) {
            ev.target.series.chart.zoomToMapObject(ev.target)
            ev.target.isHover = false
            const geoData = getGeoData(countryId)
            if (geoData) {
              this.countrySeries = this.polygonSeriesFactory()
              this.countrySeries.geodata = geoData
              this.polygonSeries.hide()
              const country = ev.target.dataItem.dataContext.serverCountry
              const queryParams = { ...this.queryParams, country }
              const chartData = await getData(replaceUrlPlaceholder(this.chartInfo.params.url, queryParams))
              this.loadAm4ChartMap(this.countrySeries, null, country, chartData)
            }
          }
        })
      } else if (this.isMapPoint) {
        this.worldImageSeries.mapImages.template.events.on('hit', async ev => {
          const countryId = ev.target.dataItem.dataContext.id
          ev.target.isHover = false
          if (countryId) {
            const targetMapObject = this.polygonSeries.getPolygonById(countryId)
            targetMapObject.series.chart.zoomToMapObject(targetMapObject)
            const geoData = getGeoData(countryId)
            if (geoData) {
              this.countrySeries = this.polygonSeriesFactory()
              this.countrySeries.geodata = geoData
              this.countryImageSeries = this.imageSeriesFactory()
              this.polygonSeries.hide()
              this.worldImageSeries.hide()
              const country = ev.target.dataItem.dataContext.name
              const queryParams = { ...this.queryParams, ipLocationCountry: country }
              const chartData = await getData(replaceUrlPlaceholder(this.chartInfo.params.url, queryParams))
              this.loadAm4ChartMap(this.countrySeries, this.countryImageSeries, country, chartData)
            }
          }
        })
      }
      // dns地图legend上的数据
      if (!_.isEmpty(this.chartInfo.params.legendUrl)) {
        setTimeout(() => {
          this.chartInfo.params.legendUrl.forEach((url, i) => {
            getData(url).then(data => {
              this.legends[i].value = data
            })
          })
        })
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
      polygonTemplate.tooltipHTML = this.generatePolygonTooltipHTML()
      polygonTemplate.nonScalingStroke = true
      polygonTemplate.strokeWidth = 0.5
      polygonTemplate.fill = am4Core.color('rgba(176,196,222,.5)')
      return polygonSeries
    },
    imageSeriesFactory (dataField) {
      const vm = this
      const imageSeries = this.myChart.series.push(new am4Maps.MapImageSeries())
      imageSeries.dataFields.value = dataField || 'count'

      const imageTemplate = imageSeries.mapImages.template
      imageTemplate.nonScaling = true

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

      const circle = imageTemplate.createChild(am4Core.Circle)
      circle.propertyFields.fill = 'color'
      circle.propertyFields.stroke = 'border'
      circle.strokeWidth = 1
      circle.tooltipHTML = this.generatePolygonTooltipHTML()
      imageSeries.tooltip.getFillFromObject = false
      imageSeries.tooltip.background.fill = am4Core.color('#41495D')
      imageSeries.tooltip.background.filters.clear()
      imageSeries.tooltip.background.stroke = '#41495D'

      imageSeries.heatRules.push({
        target: circle,
        property: 'radius',
        min: 6,
        max: 25,
        dataField: 'value'
      })

      return imageSeries
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
        const chartParams = this.chartInfo.params
        const data = chartData || this.chartData
        if (data && this.isMapBlock) {
          const seriesData = data.map(r => {
            return {
              ...this.convertMapData(r),
              id: r.serverId,
              serverCountry: r.serverCountry,
              value: r[chartParams.valueColumn]
            }
          })
          !this.$_.isEmpty(seriesData) && (polygonSeries.data = [...seriesData])
          // 数据全为0的情况，legend只显示1个颜色
          const sorted = seriesData.sort((a, b) => b.value - a.value)
          const allZero = this.$_.isEmpty(sorted) || Number(sorted[0].value) === 0

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
        } else if (data && this.isMapPoint) {
          imageSeries.data = data.map(r => ({
            ...this.convertMapData(r),
            id: r.ipLocationId,
            dnsServerRole: r.dnsServerRole,
            name: r.ipLocationCity || r.ipLocationProvince || r.ipLocationCountry,
            desc: this.$t(this.dnsTypeI18n(r.dnsServerRole)),
            color: this.circleColor[r.dnsServerRole.toUpperCase()].background,
            border: this.circleColor[r.dnsServerRole.toUpperCase()].border
          }))
        }
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
    mapBack () {
      this.countrySeries.hide()
      if (this.isMapPoint) {
        this.countryImageSeries.hide()
      }
      this.$nextTick(() => {
        this.showMapBackButton = false
        this.polygonSeries.show()
        if (this.isMapPoint) {
          this.worldImageSeries.show()
        }
        this.myChart.goHome()
      })
    },
    changeLegend (index) {
      this.currentLegendIndex = index
      this.$emit('getChartData', null, { dnsServerRole: this.legends[index].type })
    },
    dnsTypeI18n (role) {
      let i18n = ''
      switch (role.toUpperCase()) {
        case dnsServerRole.RTDNS: {
          i18n = 'dns.rootDomainServers'
          break
        }
        case dnsServerRole.TLDNS: {
          i18n = 'dns.topLevelDomainServers'
          break
        }
        case dnsServerRole.OPRDNS: {
          i18n = 'dns.publicRecursiveDomainServers'
          break
        }
        case dnsServerRole.ADNS: {
          i18n = 'dns.authoritativeDomainServers'
          break
        }
        case dnsServerRole.SBDNS: {
          i18n = 'dns.selfBuiltDomainServers'
          break
        }
        case dnsServerRole.RTDNSM: {
          i18n = 'RTDNSM'
          break
        }
        default: break
      }
      return i18n
    },
    generatePolygonTooltipHTML () {
      let html = `
        <div class="map-tooltip" style="padding-bottom: 10px;">
          <div class="map-tooltip__title">{name}</div>
          <div class="map-tooltip__content">`
      this.keyMapping.forEach(mapping => {
        html += `
            <div class="content-row" style="display: none; display: {${mapping.key}Display}">
              <span class="row__label">{${mapping.key}Label}:</span>
              <span class="row__value">{${mapping.key}ShowValue}</span>
            </div>
        `
      })
      html += `
          </div>
        </div>`
      return html
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
    },
    convertMapData (data) {
      const converted = {}
      this.keyMapping.forEach(mapping => {
        if (data[mapping.key] || data[mapping.key] === 0) {
          converted[mapping.key] = Number(data[mapping.key])
          converted[`${mapping.key}Label`] = mapping.label
          converted[`${mapping.key}ShowValue`] = valueToRangeValue(data[mapping.key], mapping.unitType).join(' ')
          converted[`${mapping.key}Display`] = 'block'
        } else {
          converted[mapping.key] = ''
          converted[`${mapping.key}Label`] = ''
          converted[`${mapping.key}Display`] = 'none'
        }
      })
      return converted
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.initMap(`chart${this.chartInfo.id}`)
      }
    }
  },
  setup (props) {
    const circleColor = {}
    circleColor[dnsServerRole.RTDNS] = {
      background: '#C0DEFE',
      border: '#478AD5'
    }
    circleColor[dnsServerRole.TLDNS] = {
      background: '#DBCFFA',
      border: '#AA8CF2'
    }
    circleColor[dnsServerRole.ADNS] = {
      background: '#A0E8E0',
      border: '#1CC9B5'
    }
    circleColor[dnsServerRole.OPRDNS] = {
      background: '#FFE1B5',
      border: '#FFB84E'
    }
    circleColor[dnsServerRole.SBDNS] = {
      background: '#FDC6C6',
      border: '#FA7777'
    }
    circleColor[dnsServerRole.RTDNSM] = {
      background: '#ECC6F7',
      border: '#BF49DF'
    }
    return {
      myChart: shallowRef(null),
      circleColor,
      isMapBlock: isMapBlock(props.chartInfo.type),
      isMapPoint: isMapPoint(props.chartInfo.type)
    }
  }
}
</script>
