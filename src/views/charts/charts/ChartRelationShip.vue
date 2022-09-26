<template>
  <div class="chart-drawing chart-drawing-ship__width" :id="`chart${chartInfo.id}`"></div>
  <div class="ship" :class="{'ship--show': showList}" v-ele-click-outside="shipChangeDown" id="ship">
    <div class="ship-title">
      <div class="ship-title-symbol" v-if="entityData.tableData.symbol"><img :src="entityData.tableData.symbol" /></div>
      <div class="ship-title-name">{{ $_.get(entityData.tableData, 'name') || '-' }}</div>
    </div>
    <div class="ship-body">
      <div class="ship-body-basicInfo" v-if="entityData.tableData.type === 'ip'">
        <loading :loading="loadingIp"></loading>
        <div class="ship-body-list">
          <div class="ship-body-list-title">{{$t('overall.location')}}</div>
          <div class="ship-body-list-value">{{ipLocationRegion(entityData)}}</div>
        </div>
        <div class="ship-body-list">
          <div class="ship-body-list-title">ASN</div>
          <div class="ship-body-list-value">{{entityData.asn || '-'}}</div>
        </div>
      </div>
      <div class="ship-body-basicInfo" v-if="entityData.tableData.type === 'app'">
        <loading :loading="loadingApp"></loading>
        <div class="ship-body-list">
         <div class="ship-body-list-title">APP ID</div>
         <div class="ship-body-list-value">{{entityData.appId|| '-'}}</div>
       </div>
        <div class="ship-body-list">
         <div class="ship-body-list-title">{{$t('entities.category')}}</div>
         <div class="ship-body-list-value">{{entityData.category|| '-'}}</div>
       </div>
        <div class="ship-body-list">
          <div class="ship-body-list-title">{{$t('entities.subcategory')}}</div>
          <div class="ship-body-list-value">{{entityData.subcategory || '-'}}</div>
        </div>
        <div class="ship-body-list">
         <div class="ship-body-list-title">{{$t('entities.riskLevel')}}</div>
         <div class="ship-body-list-value">{{appRisk(entityData.appRisk) || '-'}}</div>
       </div>
      </div>
      <div class="ship-body-basicInfo" v-if="entityData.tableData.type === 'domain'">
        <loading :loading="loadingDomain"></loading>
        <div class="ship-body-list">
            <div class="ship-body-list-title">{{$t('entities.category')}}</div>
            <div class="ship-body-list-value">{{entityData.domainCategory || '-'}}</div>
          </div>
        <div class="ship-body-list">
            <div class="ship-body-list-title">{{$t('entities.domainDetail.categoryGroup')}}</div>
            <div class="ship-body-list-value">{{entityData.domainCategoryGroup || '-'}}</div>
          </div>
        <div class="ship-body-list">
            <div class="ship-body-list-title">{{$t('entities.reputationLevel')}}</div>
            <div class="ship-body-list-value">{{entityData.domainReputationScore || '-'}}</div>
          </div>
        <div class="ship-body-list">
            <div class="ship-body-list-title">{{$t('entities.registration')}}</div>
            <div class="ship-body-list-value">{{entityData.domainWhoisAddress || '-'}}</div>
          </div>
        <div class="ship-body-list">
          <div class="ship-body-list-title">{{$t('entities.org')}}</div>
          <div class="ship-body-list-value">{{entityData.domainWhoisOrg || '-'}}</div>
        </div>
      </div>
      <div class="ship-body-list ship-body-child">
        <div class="ship-body-list-title">{{$t('overall.traffic')}}</div>
        <div class="ship-body-list-child">
          <loading :loading="loadingTraffic"></loading>
          <div class="ship-body-list-child-left">
            <div class="ship-body-list-child-title">{{$t('overall.received')}}</div>
            <div class="ship-body-list-child-value">
              <div class="ship-body-list-child-msg">{{unitConvert(entityData.bytesReceivedRate, unitTypes.byte).join(' ')}}ps</div>
              <div class="ship-body-list-child-loading">
                <div class="ship-body-list-child-charts" id="entityDetailReceived"></div>
              </div>
            </div>
          </div>
          <div class="ship-body-list-child-left">
            <div class="ship-body-list-child-title">{{$t('overall.sent')}}</div>
            <div class="ship-body-list-child-value">
              <div class="ship-body-list-child-msg">{{unitConvert(entityData.bytesSentRate, unitTypes.byte).join(' ')}}ps</div>
              <div class="ship-body-list-child-loading">
                <div class="ship-body-list-child-charts" id="entityDetailSend"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ship-body-list ship-body-child">
        <div class="ship-body-list-title">{{$t('relationShip.serviceQuality')}}</div>
        <div class="ship-body-list-child">
          <loading :loading="loadingServiceQuality"></loading>
          <div class="ship-body-list-child-left">
            <div class="ship-body-list-child-trip">{{$t('networkAppPerformance.tripTime')}}: </div><span>{{unitConvert(entityData.establishLatencyMs, unitTypes.time).join(' ')}}</span>
          </div>
          <div class="ship-body-list-child-left">
            <div class="ship-body-list-child-trip">{{$t('overall.packetLoss')}}: </div><span>{{unitConvert(entityData.pktRetransPercent, unitTypes.percent).join(' ')}}</span>
          </div>
        </div>
      </div>
      <div class="ship-body-list">
        <loading :loading="loadingAlert"></loading>
        <div class="ship-body-list-title">{{$t('relationShip.alert')}}</div>
        <div class="ship-body-list-value security">
          <template v-if="shipSeverity.length > 0">
            <span v-for="ship in shipSeverity" class="ship-severity">
              <span class="ship-body-list-security-alert" :class="iconClass(ship)">{{ ship.eventSeverity }}</span>
              <span class="ship-body-list-security-length">{{ ship.totalNumberOfEvents }}</span>
            </span>
          </template>
          <span v-else-if="!loadingAlert && shipSeverity.length <= 0" class="no-recent-alerts"><i style="font-size: 14px;" class="el-icon-success"></i>{{$t('relationShip.noRecentAlerts')}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import _ from 'lodash'
import { relationShip } from './options/sankey'
import ChartRelationShip from '@/views/charts/charts/chart-relation-ship'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import loading from '@/components/common/Loading'

export default {
  name: 'ChartRelationShip',
  data () {
    return {
      myChart: null,
      chartOption: null,
      showList: true,
      timer: null,
      relationShipIpUrl: {
        entityType: 'ip',
        trafficUrl: api.entityIpDetailTraffic,
        performanceUrl: api.entityIpDetailPerformance,
        securityUrl: api.entityIpDetailSecurity,
        ServerOverviewUrl: api.entityIpRelatedServerIpOverview,
        basicProperties: api.entityIpDetailBasic
      },
      relationShipDomainUrl: {
        entityType: 'domain',
        trafficUrl: api.entityDomainDetailTraffic,
        performanceUrl: api.entityDomainDetailPerformance,
        securityUrl: api.entityDomainDetailSecurity,
        ServerOverviewUrl: api.entityDomainRelatedServerDomainOverview,
        basicProperties: api.entityDomainDetailBasic
      },
      relationShipAppUrl: {
        entityType: 'app',
        trafficUrl: api.entityAppDetailTraffic,
        performanceUrl: api.entityAppDetailPerformance,
        securityUrl: api.entityAppDetailSecurity,
        ServerOverviewUrl: api.entityAppRelatedServerAppOverview,
        basicProperties: api.entityAppDetailBasic
      },
      loadingAlert: false,
      loadingServiceQuality: false,
      loadingTraffic: false,
      loadingIp: false,
      loadingDomain: false,
      loadingApp: false,
      tableName: '',

      firstRender: true
    }
  },
  components: {
    loading
  },
  mixins: [ChartRelationShip],
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object,
    queryParams: Object,
    entity: Object,
    needTimeout: Boolean
  },
  methods: {
    init (id) {
      const name = this.$route.query.name
      const path = window.location.protocol + '//' + window.location.host
      const dom = document.getElementById(id)
      const div = document.getElementById('ship')
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = this.$_.cloneDeep(relationShip)
      const data = []
      const links = []
      handleData(data, links, this.chartData)
      const _this = this
      let queryParams = {}
      this.myChart.on('click', function (params) {
        this.tableName = params.data.name
        setTimeout(() => {
          div.style.left = params.event.event.offsetX + 'px'
          if (dom.offsetHeight > (params.event.event.offsetY + div.offsetHeight)) {
            div.style.top = params.event.event.offsetY + 'px'
            div.style.bottom = ''
          } else {
            div.style.top = ''
            div.style.bottom = '10px'
          }
          _this.showList = true
        }, 300)

        if (params.data.type === 'ip') {
          queryParams = {
            ip: params.data.name,
            startTime: getSecond(_this.timeFilter.startTime),
            endTime: getSecond(_this.timeFilter.endTime)
          }
          _this.queryEntityDetail(_this.relationShipIpUrl, params, queryParams)
        } else if (params.data.type === 'app_name') {
          queryParams = {
            appName: params.data.name,
            startTime: getSecond(_this.timeFilter.startTime),
            endTime: getSecond(_this.timeFilter.endTime)
          }
          _this.queryEntityDetail(_this.relationShipAppUrl, params, queryParams)
        } else if (params.data.type === 'domain') {
          queryParams = {
            domain: params.data.name,
            startTime: getSecond(_this.timeFilter.startTime),
            endTime: getSecond(_this.timeFilter.endTime)
          }
          _this.queryEntityDetail(_this.relationShipDomainUrl, params, queryParams)
        }
      })
      this.chartOption.series[0].data = data
      this.chartOption.series[0].links = links
      this.myChart.setOption(this.chartOption)
      function handleData (data, links, item) {
        if (item && !data.some(d => d.name === item.name)) {
          data.push({ name: item.name, ...handleStyle(item) })
        }
        if (item && !_.isEmpty(item.from) && !_.isEmpty(item.to)) {
          links.push({ target: item.to, source: item.from })
        }
        if (item && !_.isEmpty(item.leaf)) {
          item.leaf.forEach(i => {
            handleData(data, links, i)
          })
        }
      }

      function handleStyle (item) {
        const style = {}
        style.label = {
          position: 'top'
        }
        style.symbolSize = 50
        style.label.color = '#999'
        switch (item.type) {
          case 'app_name': {
            style.symbolSize = 55
            style.type = item.type
            if (name === item.name) {
              style.label.color = '#333'
              style.symbol = `image://${path}/images/entity-symbol/app-active.svg`
            } else {
              style.symbol = `image://${path}/images/entity-symbol/app.svg`
            }
            break
          }
          case 'domain': {
            style.symbolSize = 55
            style.type = item.type
            if (name === item.name) {
              style.label.color = '#333'
              style.symbol = `image://${path}/images/entity-symbol/domain-active.svg`
            } else {
              style.symbol = `image://${path}/images/entity-symbol/domain.svg`
            }
            break
          }
          case 'ip': {
            style.symbolSize = 40
            style.type = item.type
            if (name === item.name) {
              style.label.color = '#333'
              style.symbol = `image://${path}/images/entity-symbol/ip-active.svg`
            } else {
              style.symbol = `image://${path}/images/entity-symbol/ip.svg`
            }
            break
          }
        }
        return style
      }
    },
    shipChangeDown () {
      this.showList = false
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        if (this.needTimeout && this.firstRender) {
          this.firstRender = false
          setTimeout(() => {
            this.init(`chart${this.chartInfo.id}`)
          }, 5000)
        } else {
          this.init(`chart${this.chartInfo.id}`)
        }
      }
    }
  },
  setup () {
    return {
      unitConvert,
      unitTypes
    }
  }
}
</script>
