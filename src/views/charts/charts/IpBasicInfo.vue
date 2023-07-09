<template>
  <div class="cn-chart__ip-basic">
    <div class="cn-chart__ip-basic-info">
      <el-descriptions :column="1">
        <el-descriptions-item label="ASN:">{{(chartData && chartData.asn) || '-'}}</el-descriptions-item>
        <el-descriptions-item label="AS Org:">{{(chartData && chartData.asOrganization) || '-'}}</el-descriptions-item>
        <el-descriptions-item :label="$t('entities.asSubnet') + ':'">{{(chartData && chartData.asSubnet) || '-'}}</el-descriptions-item>
        <el-descriptions-item label="ISP:">{{(chartData && chartData.isp) || '-'}}</el-descriptions-item>
        <el-descriptions-item label="DNS PTR:">{{(chartData && chartData.dnsPtr) || '-'}}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" v-if="detectionsData.dnsServerRole">
        <el-descriptions-item :label="$t('overall.dnsServerInfo.role') + ':'">{{$_.get(detectionsData, 'dnsServerRole') || '-'}}</el-descriptions-item>
        <el-descriptions-item :label="$t('overall.dnsServerInfo.mechanism') + ':'">{{$_.get(detectionsData, 'dnsServerOrg') || '-'}}</el-descriptions-item>
        <el-descriptions-item :label="$t('overall.dnsServerInfo.software') + ':'">{{$_.get(detectionsData, 'dnsServerSoftware') || '-'}}</el-descriptions-item>
        <el-descriptions-item :label="$t('overall.dnsServerInfo.system') + ':'">{{$_.get(detectionsData, 'dnsServerOs') || '-'}}</el-descriptions-item>
        <el-descriptions-item :label="$t('overall.dnsServerInfo.protocol') + ':'">{{detectionIpSupporting(detectionsData)}}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts/charts/chart-mixin'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
export default {
  name: 'IpBasicInfo',
  mixins: [chartMixin],
  data () {
    return {
      myChart: null,
      entityDetectionsIpUrl: api.entityDetectionsIp,
      detectionsData: {}
    }
  },
  computed: {
    location () {
      let location = ''
      if (this.chartInfo) {
        if (this.chartInfo.city) {
          location = this.chartInfo.city
        }
        if (this.chartInfo.province) {
          location = location ? `${this.chartInfo.province}, ${location}` : this.chartInfo.province
        }
        if (this.chartInfo.country) {
          location = location ? `${this.chartInfo.country}, ${location}` : this.chartInfo.country
        }
      }
      return location
    },
    detectionIpSupporting () {
      return function (detectionsData) {
        let result = ''
        if (detectionsData.dnssecSupport) {
          result += 'DNSSec/'
        }
        if (detectionsData.dohSupport) {
          result += 'DoH/'
        }
        if (detectionsData.dotSupport) {
          result += 'Dot/'
        }
        result = result.substr(0, result.length - 1)
        if (!result) {
          result = '-'
        }
        return result
      }
    }
  },
  methods: {
    queryDetection () {
      get(this.entityDetectionsIpUrl, this.queryParams).then(response => {
        if (response.code === 200) {
          this.detectionsData = response.data.result
        }
      })
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.queryDetection()
    })
  }
}
</script>
