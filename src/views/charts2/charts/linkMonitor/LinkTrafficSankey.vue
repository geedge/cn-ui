<template>
  <div class="link-traffic-sankey">
    <el-tabs v-model="tab">
      <el-tab-pane :label="$t('linkMonitor.ingress')" name="0">
        <chart-no-data v-if="ingress"></chart-no-data>
        <div class="chart-drawing" id="link-traffic-sankey-0"></div>
      </el-tab-pane>
      <el-tab-pane :label="$t('linkMonitor.egress')" name="1">
        <chart-no-data v-if="egress"></chart-no-data>
        <div class="chart-drawing" id="link-traffic-sankey-1"></div>
      </el-tab-pane>
    </el-tabs>
    <template v-if="tab == 0 && !ingress">
      <div class="sankey__label" style="left: 5%;">External Locations</div>
      <div class="sankey__label" style="left: 35%;">Next-Hop Internets</div>
      <div class="sankey__label" style="left: 63%;">Links</div>
      <div class="sankey__label" style="right: 9%; transform: translateX(50%)">Internal Locations</div>
    </template>
    <template v-else-if="tab == 1 && !egress">
      <div class="sankey__label" style="left: 5%;">Internal Locations</div>
      <div class="sankey__label" style="left: 33.2%;">Links</div>
      <div class="sankey__label" style="left: 64.5%;">Next-Hop Internets</div>
      <div class="sankey__label" style="right: 9%; transform: translateX(50%)">External Locations</div>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import { linksTrafficSankeyOption } from '@/views/charts2/charts/options/echartOption'
import { ref, shallowRef } from 'vue'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import { useRoute } from 'vue-router'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import unitConvert from '@/utils/unit-convert'
import { storageKey, unitTypes } from '@/utils/constants'

export default {
  name: 'LinksTrafficSankey',
  mixins: [chartMixin],
  components: {
    ChartNoData
  },
  setup () {
    const { query } = useRoute()
    const tab = ref(query.tabIndex || 0)
    // const d = `egress_link_direction='${256}' AND ingress_link_direction='${256}' `
    const queryCondition = ref(query.queryCondition || '')
    return {
      tab,
      queryCondition,
      myChart: shallowRef(null),
      myChart2: shallowRef(null)
    }
  },
  data () {
    return {
      timer: null,
      ingress: false,
      egress: false,
      unitConvert,
      unitTypes,
      cnLinkInfo: JSON.parse(localStorage.getItem(storageKey.linkInfo))
    }
  },
  watch: {
    tab (n) {
      this.$nextTick(() => {
        this.linkTrafficSankeyDataRequest(n)
      })
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        tabIndex: n
      })
      overwriteUrl(newUrl)
    },
    timeFilter: {
      deep: true,
      handler (n) {
        this.linkTrafficSankeyDataRequest(this.tab)
      }
    }
  },
  methods: {
    linkTrafficSankeyDataRequest (n) {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      let condition = ''
      if (this.queryCondition.indexOf(' AND ') > -1) {
        condition = this.queryCondition.split(/["'= ](.*?)["'= ]/)
      } else {
        condition = this.queryCondition
      }
      if (condition.length > 1 && condition[0] === 'common_egress_link_id') {
        if (n == 0) {
          params.q = `${condition[0]}=${condition[3]}`
        } else {
          params.q = `${condition[5]}=${condition[8]}`
        }
      } else {
        if (n == 0) {
          params.q = `${condition[0]}=${condition[4]}`
        } else {
          params.q = `${condition[7]}=${condition[11]}`
        }
      }
      let url = ''
      if (n == 0) {
        url = api.linkMonitor.quadrupleIngressAnalysis // 入口
      } else {
        url = api.linkMonitor.quadrupleEgressAnalysis // 出口
      }
      get(url, params).then(res => {
        if (res.code === 200) {
          if (n == 0) {
            this.ingress = res.data.result.length === 0
          } else {
            this.egress = res.data.result.length === 0
          }
          this.dataProcessing(res.data.result, n)
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    dataProcessing (result, tab) {
      let data = []
      let links = []
      result.forEach(t => {
        this.cnLinkInfo.forEach(e => {
          if (t.commonEgressLinkId == e.originalLinkId) {
            t.commonEgressLinkId = e.linkId
            t.ingressLinkDirection = e.nextHop
            t.egressLinkDirection = e.nextHop
            t.bandWidth = e.bandwidth
          }
        })
        data.push(
          { name: t.serverCity },
          { name: t.commonEgressLinkId },
          { name: tab == 0 ? t.ingressLinkDirection : t.egressLinkDirection },
          { name: t.clientCity }
        )
      })
      const clientCity = []
      const linkDirection = []
      const commonEgressLinkId = []
      let link = []
      result.forEach(t => {
        const LinkDirectionShow = tab == 0 ? t.ingressLinkDirection : t.egressLinkDirection
        const bytes = tab == 0 ? t.ingressBytes : t.egressBytes
        if (tab == 0) {
          clientCity.push({
            source: t.clientCity,
            target: LinkDirectionShow,
            commonEgressLinkId: t.commonEgressLinkId,
            serverCity: t.serverCity,
            value: bytes,
            bandWidth: t.bandWidth,
            depth: 0
          })
          linkDirection.push({
            clientCity: t.clientCity,
            source: LinkDirectionShow,
            target: t.commonEgressLinkId,
            serverCity: t.serverCity,
            value: bytes,
            bandWidth: t.bandWidth,
            depth: 1
          })
          commonEgressLinkId.push({
            clientCity: t.clientCity,
            LinkDirectionShow: LinkDirectionShow,
            source: t.commonEgressLinkId,
            target: t.serverCity,
            value: bytes,
            bandWidth: t.bandWidth,
            depth: 2
          })
        } else {
          clientCity.push({
            source: t.clientCity,
            target: t.commonEgressLinkId,
            LinkDirectionShow: LinkDirectionShow,
            serverCity: t.serverCity,
            value: bytes,
            bandWidth: t.bandWidth,
            depth: 0
          })
          linkDirection.push({
            clientCity: t.clientCity,
            source: t.commonEgressLinkId,
            target: LinkDirectionShow,
            serverCity: t.serverCity,
            value: bytes,
            bandWidth: t.bandWidth,
            depth: 1
          })
          commonEgressLinkId.push({
            clientCity: t.clientCity,
            commonEgressLinkId: t.commonEgressLinkId,
            source: LinkDirectionShow,
            target: t.serverCity,
            value: bytes,
            bandWidth: t.bandWidth,
            depth: 2
          })
        }
      })
      link = [...clientCity, ...linkDirection, ...commonEgressLinkId]
      for (let i = 0; i < link.length; i++) {
        for (let j = i + 1; j < link.length; j++) {
          if (link[i].source === link[j].source && link[i].target === link[j].target) {
            link[i].value = link[i].value * 1 + link[j].value * 1
            link.splice(j, 1)
          }
        }
      }
      const map = new Map()
      for (const item of data) {
        if (!map.has(item.name)) {
          map.set(item.name, item)
        }
      }
      data = [...map.values()]
      links = link
      this.echartsInit(tab, data, links)
    },
    echartsInit (tab, data, links) {
      const _this = this
      let dom = ''
      if (tab == 0) {
        dom = document.getElementById('link-traffic-sankey-0')
        !this.myChart && (this.myChart = echarts.init(dom))
      } else {
        dom = document.getElementById('link-traffic-sankey-1')
        !this.myChart2 && (this.myChart2 = echarts.init(dom))
      }
      this.chartOption = this.$_.cloneDeep(linksTrafficSankeyOption)
      this.chartOption.tooltip.formatter = function (param) {
        if (param.data.name) return ''
        let data = ''
        let value = 0
        if (param.data.depth === 0) {
          if (tab == 0) {
            data = ` ${param.data.source} > ${param.data.target} > ${param.data.commonEgressLinkId} > ${param.data.serverCity}`
          } else {
            data = `${param.data.source} > ${param.data.target} > ${param.data.LinkDirectionShow} > ${param.data.serverCity}`
          }
          value = unitConvert((param.data.value / param.data.bandWidth), unitTypes.percent).join(' ')
        } else if (param.data.depth === 1) {
          if (tab == 0) {
            data = `${param.data.clientCity} > ${param.data.source} > ${param.data.target} > ${param.data.serverCity}`
          } else {
            data = `${param.data.clientCity} > ${param.data.source} > ${param.data.target} > ${param.data.serverCity}`
          }
          value = unitConvert((param.data.value / param.data.bandWidth), unitTypes.percent).join(' ')
        } else if (param.data.depth === 2) {
          if (tab == 0) {
            data = `${param.data.clientCity} > ${param.data.LinkDirectionShow} > ${param.data.source} > ${param.data.target}`
          } else {
            data = ` ${param.data.clientCity} > ${param.data.commonEgressLinkId} > ${param.data.source} > ${param.data.target}`
          }
          value = unitConvert((param.data.value / param.data.bandWidth), unitTypes.percent).join(' ')
        }
        return `
            <div class="traffic-sankey">
              <div class="traffic-sankey-row-header">
                <div class="traffic-sankey__row-value">${data}</div>
              </div>
              <div class="traffic-sankey-row-body">
                <div class="traffic-sankey__tooltip-left">
                  <div class="traffic-sankey__row-label">${_this.$t('overall.traffic')}</div>
                  <div class="traffic-sankey__row-label">${_this.$t('linkMonitor.bandwidthUsage')}</div>
                </div>
                <div class="traffic-sankey__tooltip-right">
                  <div class="traffic-sankey__row-value">${unitConvert(param.value, unitTypes.bps).join(' ')}</div>
                  <div class="traffic-sankey__row-value">${value}</div>
                </div>
              </div>
            </div>
          `
      }
      this.chartOption.series[0].data = data
      this.chartOption.series[0].links = links
      if (tab == 0) {
        this.myChart.setOption(this.chartOption)
      } else {
        this.myChart2.setOption(this.chartOption)
      }
    },
    resize () {
      if (this.tab == 0) {
        this.myChart.resize()
      } else {
        this.myChart2.resize()
      }
    }
  },
  mounted () {
    this.timer = setTimeout(() => {
      this.linkTrafficSankeyDataRequest(this.tab)
    }, 100)
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount () {
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)
  }
}
</script>
