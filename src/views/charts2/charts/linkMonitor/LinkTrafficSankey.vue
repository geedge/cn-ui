<template>
  <div class="link-traffic-sankey">
    <el-tabs v-model="tab">
      <el-tab-pane :label="$t('linkMonitor.ingress')" name="0">
        <chart-error v-if="showError" :content="errorMsg"></chart-error>
        <chart-no-data v-if="ingress"></chart-no-data>
        <div v-if="parseInt(tab) === 0 && !showError" class="chart-drawing" id="link-traffic-sankey-0"></div>
      </el-tab-pane>
      <el-tab-pane :label="$t('linkMonitor.egress')" name="1">
        <chart-error v-if="showError" :content="errorMsg"></chart-error>
        <chart-no-data v-if="egress"></chart-no-data>
        <div v-if="parseInt(tab) === 1 && !showError" class="chart-drawing" id="link-traffic-sankey-1"></div>
      </el-tab-pane>
    </el-tabs>
    <template v-if="parseInt(tab) === 0 && !ingress">
      <div class="sankey__label" style="left: 5%;">External Locations</div>
      <div class="sankey__label" style="left: 35%;">Next-Hop Internets</div>
      <div class="sankey__label" style="left: 63%;">Links</div>
      <div class="sankey__label" style="right: 9%; transform: translateX(50%)">Internal Locations</div>
    </template>
    <template v-else-if="parseInt(tab) === 1 && !egress">
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
import ChartError from '@/components/common/Error'

export default {
  name: 'LinksTrafficSankey',
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  setup () {
    const { query } = useRoute()
    const tab = ref(query.tabIndex || 0)
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
      cnLinkInfo: JSON.parse(localStorage.getItem(storageKey.linkInfo)),
      showError: false,
      errorMsg: ''
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
      handler () {
        this.linkTrafficSankeyDataRequest(this.tab)
      }
    }
  },
  methods: {
    linkTrafficSankeyDataRequest (n) {
      n = parseInt(n)
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      let url = ''
      if (this.queryCondition) {
        const condition = this.queryCondition.toLowerCase().split(' or ')
        if (condition.length > 1) {
          if (n === 0) {
            params.q = condition.find(c => c.indexOf('common_ingress_link_id') > -1 || c.indexOf('ingress_link_direction') > -1)
          } else {
            params.q = condition.find(c => c.indexOf('common_egress_link_id') > -1 || c.indexOf('egress_link_direction') > -1)
          }
        }
        if (n === 0) {
          url = api.linkMonitor.drilldownQuadrupleIngressAnalysis // 入口
        } else {
          url = api.linkMonitor.drilldownQquadrupleEgressAnalysis // 出口
        }
      } else {
        if (n === 0) {
          url = api.linkMonitor.quadrupleIngressAnalysis // 入口
        } else {
          url = api.linkMonitor.quadrupleEgressAnalysis // 出口
        }
      }
      this.toggleLoading(true)
      get(url, params).then(res => {
        if (res.code === 200) {
          this.showError = false
          if (n === 0) {
            this.ingress = res.data.result.length === 0
          } else {
            this.egress = res.data.result.length === 0
          }
          this.dataProcessing(res.data.result, parseInt(n))
        } else {
          this.showError = true
          this.errorMsg = res.message
        }
      }).catch(e => {
        console.error(e)
        this.egress = true
        this.ingress = true
        this.showError = true
        this.errorMsg = e.message
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    dataProcessing (result, tab) {
      if (tab === 0) {
        result.forEach(t => {
          this.cnLinkInfo.forEach(e => {
            if (t.commonIngressLinkId === e.originalLinkId) {
              t.linkId = e.linkId
              t.linkDirection = e.nextHop
              t.bandwidth = e.bandwidth
              t.value = parseInt(t.ingressBitsRate)
              t.client = `c_${t.clientProvince}`
              t.server = `s_${t.serverProvince}`
            }
          })
        })
      } else {
        result.forEach(t => {
          this.cnLinkInfo.forEach(e => {
            if (t.commonEgressLinkId === e.originalLinkId) {
              t.linkId = e.linkId
              t.bandwidth = e.bandwidth
              t.linkDirection = e.nextHop
              t.value = parseInt(t.egressBitsRate)
              t.client = `c_${t.clientProvince}`
              t.server = `s_${t.serverProvince}`
            }
          })
        })
      }
      result = result.filter(r => r.clientProvince && r.serverProvince)

      const data = []
      const links = []
      const data0 = []
      const data1 = []
      const data2 = []
      const data3 = []
      const links0 = []
      const linksAnalyze0 = []
      const links1 = []
      const links2 = []
      const linksAnalyze2 = []
      if (tab === 1) {
        result.forEach(r => {
          // 第一列
          if (!data0.some(d => d.name === r.client)) {
            data0.push({ name: r.client, originalName: r.clientProvince, depth: 0 })
          }
          const existLink0 = links0.find(l => l.source === r.client && l.target === r.linkId)
          if (existLink0) {
            existLink0.value += r.value
          } else {
            links0.push({ source: r.client, target: r.linkId, tooltip0: r.clientProvince, tooltip1: r.linkId, value: r.value, depth: 0, bandwidth: r.bandwidth })
          }
          const existLinkAnalyze0 = linksAnalyze0.find(l => l.name === r.client)
          if (existLinkAnalyze0) {
            existLinkAnalyze0.value += r.value
          } else {
            linksAnalyze0.push({ name: r.client, value: r.value })
          }
          // 第二列
          if (!data1.some(d => d.name === r.linkId)) {
            data1.push({ name: r.linkId, depth: 1 })
          }
          const existLink1 = links1.find(l => l.source === r.linkId && l.target === r.linkDirection)
          if (existLink1) {
            existLink1.value += r.value
          } else {
            links1.push({ source: r.linkId, target: r.linkDirection, tooltip0: r.linkId, tooltip1: r.linkDirection, value: r.value, depth: 1, bandwidth: r.bandwidth })
          }
          // 第三列
          if (!data2.some(d => d.name === r.linkDirection)) {
            data2.push({ name: r.linkDirection, depth: 2 })
          }
          const existLink2 = links2.find(l => l.source === r.linkDirection && l.target === r.server)
          if (existLink2) {
            existLink2.value += r.value
          } else {
            links2.push({ source: r.linkDirection, target: r.server, tooltip0: r.linkDirection, tooltip1: r.serverProvince, value: r.value, depth: 2 })
          }
          const existLinkAnalyze2 = linksAnalyze2.find(l => l.name === r.server)
          if (existLinkAnalyze2) {
            existLinkAnalyze2.value += r.value
          } else {
            linksAnalyze2.push({ name: r.server, value: r.value })
          }
          // 第四列
          if (!data3.some(d => d.name === r.server)) {
            data3.push({ name: r.server, originalName: r.serverProvince, depth: 3 })
          }
        })
      } else {
        result.forEach(r => {
          // 第一列
          if (!data0.some(d => d.name === r.client)) {
            data0.push({ name: r.client, originalName: r.clientProvince, depth: 0 })
          }
          const existLink0 = links0.find(l => l.source === r.client && l.target === r.linkDirection)
          if (existLink0) {
            existLink0.value += r.value
          } else {
            links0.push({ source: r.client, target: r.linkDirection, tooltip0: r.clientProvince, tooltip1: r.linkDirection, value: r.value, depth: 0 })
          }
          const existLinkAnalyze0 = linksAnalyze0.find(l => l.name === r.client)
          if (existLinkAnalyze0) {
            existLinkAnalyze0.value += r.value
          } else {
            linksAnalyze0.push({ name: r.client, value: r.value })
          }
          // 第二列
          if (!data1.some(d => d.name === r.linkDirection)) {
            data1.push({ name: r.linkDirection, depth: 1 })
          }
          const existLink1 = links1.find(l => l.source === r.linkDirection && l.target === r.linkId)
          if (existLink1) {
            existLink1.value += r.value
          } else {
            links1.push({ source: r.linkDirection, target: r.linkId, tooltip0: r.linkDirection, tooltip1: r.linkId, value: r.value, depth: 1, bandwidth: r.bandwidth })
          }
          // 第三列
          if (!data2.some(d => d.name === r.linkId)) {
            data2.push({ name: r.linkId, depth: 2 })
          }
          const existLink2 = links2.find(l => l.source === r.linkId && l.target === r.server)
          if (existLink2) {
            existLink2.value += r.value
          } else {
            links2.push({ source: r.linkId, target: r.server, tooltip0: r.linkId, tooltip1: r.serverProvince, value: r.value, depth: 2, bandwidth: r.bandwidth })
          }
          const existLinkAnalyze2 = linksAnalyze2.find(l => l.name === r.server)
          if (existLinkAnalyze2) {
            existLinkAnalyze2.value += r.value
          } else {
            linksAnalyze2.push({ name: r.server, value: r.value })
          }
          // 第四列
          if (!data3.some(d => d.name === r.server)) {
            data3.push({ name: r.server, originalName: r.serverProvince, depth: 3 })
          }
        })
      }
      if (linksAnalyze0.length > 10) {
        const sortedLinksAnalyze0 = linksAnalyze0.sort((a, b) => b.value - a.value)
        const top10LinksAnalyze0 = []
        const otherLinksAnalyze0 = []
        sortedLinksAnalyze0.forEach((sl, i) => {
          if (i < 10) {
            top10LinksAnalyze0.push(sl)
          } else {
            const existOtherLinkAnalyze0 = otherLinksAnalyze0.find(ol => ol.target === sl.target)
            if (existOtherLinkAnalyze0) {
              existOtherLinkAnalyze0.value += sl.value
            } else {
              otherLinksAnalyze0.push({ ...sl, name: 'c_others' })
            }
          }
        })
        const top10Links0 = []
        const othersLinks0 = []
        links0.forEach(l0 => {
          if (top10LinksAnalyze0.some(t => t.name === l0.source)) {
            top10Links0.push(l0)
          } else {
            const existOtherSLink0 = othersLinks0.find(ol0 => ol0.target === l0.target)
            if (existOtherSLink0) {
              existOtherSLink0.value += l0.value
            } else {
              othersLinks0.push({ ...l0, source: 'c_others', tooltip0: 'others' })
            }
          }
        })
        links.push(...top10Links0)
        links.push(...othersLinks0)
        data.push(...data0.filter(d0 => top10LinksAnalyze0.some(l0 => l0.name === d0.name)))
        data.push({ name: 'c_others', originalName: 'others', depth: 0 })
      } else {
        data.push(...data0)
        links.push(...links0)
      }

      data.push(...data1)
      data.push(...data2)
      links.push(...links1)

      if (linksAnalyze2.length > 10) {
        const sortedLinksAnalyze2 = linksAnalyze2.sort((a, b) => b.value - a.value)
        const top10LinksAnalyze2 = []
        const otherLinksAnalyze2 = []
        sortedLinksAnalyze2.forEach((sl, i) => {
          if (i < 10) {
            top10LinksAnalyze2.push(sl)
          } else {
            const existOtherLinkAnalyze2 = otherLinksAnalyze2.find(ol => ol.source === sl.source)
            if (existOtherLinkAnalyze2) {
              existOtherLinkAnalyze2.value += sl.value
            } else {
              otherLinksAnalyze2.push({ ...sl, name: 's_others' })
            }
          }
        })
        const top10Links2 = []
        const othersLinks2 = []
        links2.forEach(l2 => {
          if (top10LinksAnalyze2.some(t => t.name === l2.target)) {
            top10Links2.push(l2)
          } else {
            const existOtherSLink2 = othersLinks2.find(ol2 => ol2.source === l2.source)
            if (existOtherSLink2) {
              existOtherSLink2.value += l2.value
            } else {
              othersLinks2.push({ ...l2, target: 's_others', tooltip1: 'others' })
            }
          }
        })
        links.push(...top10Links2)
        links.push(...othersLinks2)
        data.push(...data3.filter(d2 => top10LinksAnalyze2.some(l2 => l2.name === d2.name)))
        data.push({ name: 's_others', originalName: 'others', depth: 3 })
      } else {
        data.push(...data3)
        links.push(...links2)
      }
      this.$nextTick(() => {
        this.echartsInit(tab, data, links)
      })
    },
    echartsInit (tab, data, links) {
      const _this = this
      let dom = ''
      if (tab === 0) {
        dom = document.getElementById('link-traffic-sankey-0')
        if (this.myChart) {
          this.myChart.dispose()
        }
        this.myChart = echarts.init(dom)
      } else {
        dom = document.getElementById('link-traffic-sankey-1')
        if (this.myChart2) {
          this.myChart2.dispose()
        }
        this.myChart2 = echarts.init(dom)
      }
      this.chartOption = this.$_.cloneDeep(linksTrafficSankeyOption)
      this.chartOption.tooltip.formatter = function (param) {
        if (param.data.name) return ''
        const data = `${param.data.tooltip0} > ${param.data.tooltip1}`
        const value = param.data.bandwidth ? unitConvert((param.data.value / param.data.bandwidth), unitTypes.percent)[0] : ''
        let html = `
            <div class="traffic-sankey">
              <div class="traffic-sankey-row-header">
                <div class="traffic-sankey__row-value">${data}</div>
              </div>
              <div class="traffic-sankey-row-body">
                <div class="traffic-sankey__tooltip-left">
                  <div class="traffic-sankey__row-label">${_this.$t('overall.traffic')}</div>`
        if (value || value === 0) {
          html += `<div class="traffic-sankey__row-label">${_this.$t('linkMonitor.bandwidthUsage')}</div>`
        }
        html += `</div>
                <div class="traffic-sankey__tooltip-right">
                  <div class="traffic-sankey__row-value">${unitConvert(param.value, unitTypes.bps).join(' ')}</div>`
        if (value || value === 0) {
          html += `<div class="traffic-sankey__row-value">${value < 0.01 ? '< 0.01 %' : value + ' %'}</div>`
        }
        html += `</div>
              </div>
            </div>
          `
        return html
      }
      this.chartOption.series[0].data = data
      this.chartOption.series[0].links = links
      if (tab === 0) {
        this.myChart.setOption(this.chartOption)
      } else {
        this.myChart2.setOption(this.chartOption)
      }
    },
    resize () {
      if (this.tab === 0) {
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
