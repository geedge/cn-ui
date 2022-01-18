<template>
  <div class="cn-chart__ip-basic">
    <el-descriptions :column="1">
      <el-descriptions-item label="ASN:">{{(chartData && chartData.asn) || '-'}}</el-descriptions-item>
      <el-descriptions-item label="AS Org:">{{(chartData && chartData.asOrganization) || '-'}}</el-descriptions-item>
      <el-descriptions-item :label="$t('entities.asSubnet') + ':'">{{(chartData && chartData.asSubnet) || '-'}}</el-descriptions-item>
      <el-descriptions-item label="ISP:">{{(chartData && chartData.isp) || '-'}}</el-descriptions-item>
      <el-descriptions-item label="DNS PTR:">{{(chartData && chartData.dnsPtr) || '-'}}</el-descriptions-item>
    </el-descriptions>
    <div class="chart-location">
      <el-descriptions :column="1">
        <el-descriptions-item :label="$t('overall.location') + ':'">{{location}}</el-descriptions-item>
      </el-descriptions>
      <div class="chart-drawing" style="padding: 0 36px 30px 0;" :id="`chart${chartInfo.id}`"></div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts/charts/chart-mixin'
import * as L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'IpBasicInfo',
  mixins: [chartMixin],
  data () {
    return {
      myChart: null,
      mapPictureUrl: '/Tiles/{z}/{x}/{y}.png'
    }
  },
  computed: {
    location () {
      let location = ''
      if (this.chartInfo) {
        if (this.chartInfo.country) {
          location = this.chartInfo.country
          if (this.chartInfo.province) {
            location += ', '
            location += this.chartInfo.province
            if (this.chartInfo.city) {
              location += ', '
              location += this.chartInfo.city
            }
          }
        } else if (this.chartInfo.province) {
          location = this.chartInfo.province
          if (this.chartInfo.city) {
            location += ', '
            location += this.chartInfo.city
          }
        } else if (this.chartInfo.city) {
          location = this.chartInfo.city
        }
      }
      return location
    }
  },
  methods: {
    initMap (id) {
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
    },
    loadLeafletMap () {
      if (this.chartData.latitude && this.chartData.longitude) {
        this.myChart.setView([this.chartData.latitude, this.chartData.longitude], 5)
        const myIcon = L.divIcon({
          className: 'cn-icon cn-icon-position2 position-icon'
        })
        L.marker([this.chartData.latitude, this.chartData.longitude], { icon: myIcon }).addTo(this.myChart)
      }
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.initMap(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>
