<template>
  <div class="link-blocks">
    <div class="block-list">
      <div class="block-list__title">{{ $t('linkMonitor.links') }}</div>
      <div class="block-list__list">
        <el-popover
            placement="bottom"
            trigger="hover"
            popper-class="link-block__popper"
            v-for="(item, index) in linkData"
            :width="item.popoverWidth"
            :key="index"
        >
          <template #reference>
            <div class="block-list__block" :key="index" @click="drillLinkId(item)">
              <span class="block-hex">
                <span class="block-hex-in" :style="`background-color: ${item.color}`"></span>
              </span>
            </div>
          </template>
          <template #default>
            <div class="popper-content">
              <div class="popper-content__link-id">Link ID: {{ item.linkId }}</div>
              <div class="popper-content__link-info">
                <div class="info__label">{{ $t('linkMonitor.linkBlock.total') }}</div>
                <div class="info__value" style="margin-left: 8px">
                  {{ unitConvert(item.totalBitsRate, unitTypes.bps).join(' ') }}bps
                </div>
              </div>
              <div class="popper-content__link-info">
                <div class="info__label">{{ $t('linkMonitor.linkBlock.bandwidthUsage') }}</div>
                <div class="info__value" style="display: flex">
                  <div>
                    <svg class="icon item-popover-up" aria-hidden="true">
                      <use xlink:href="#cn-icon-egress"></use>
                    </svg>
                    {{ unitConvert(item.egressUsage, unitTypes.percent).join('') }}
                  </div>
                  <div>
                    <svg class="icon item-popover-down" aria-hidden="true">
                      <use xlink:href="#cn-icon-ingress"></use>
                    </svg>
                    {{ unitConvert(item.ingressUsage, unitTypes.percent).join('') }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-popover>
      </div>
    </div>

    <div class="block-list">
      <!--todo  此处应将linkid改成nextHop显示-->
      <div class="block-list__title">{{ $t('linkMonitor.nextHopInternet') }}</div>
      <div class="block-list__list">
        <el-popover
            placement="bottom"
            trigger="hover"
            popper-class="link-block__popper"
            v-for="(item, index) in nextHopData"
            :width="item.popoverWidth"
            :key="index"
        >
          <template #reference>
            <div class="block-list__block" :key="index" @click="drillNextHop(item)">
              <span class="block-hex">
                <span class="block-hex-in" :style="`background-color: ${item.color}`"></span>
              </span>
            </div>
          </template>
          <template #default>
            <div class="popper-content">
              <div class="popper-content__link-id">Next-Hop Internet: {{ item.linkDirection }}</div>
              <div class="popper-content__link-info">
                <div class="info__label">{{ $t('linkMonitor.linkBlock.total') }}</div>
                <div class="info__value" style="margin-left: 8px">
                  {{ unitConvert(item.totalBitsRate, unitTypes.bps).join(' ') }}bps
                </div>
              </div>
              <div class="popper-content__link-info">
                <div class="info__label">{{ $t('linkMonitor.linkBlock.bandwidthUsage') }}</div>
                <div class="info__value" style="display: flex">
                  <div>
                    <svg class="icon item-popover-up" aria-hidden="true">
                      <use xlink:href="#cn-icon-egress"></use>
                    </svg>
                    {{ unitConvert(item.egressUsage, unitTypes.percent).join('') }}
                  </div>
                  <div>
                    <svg class="icon item-popover-down" aria-hidden="true">
                      <use xlink:href="#cn-icon-ingress"></use>
                    </svg>
                    {{ unitConvert(item.ingressUsage, unitTypes.percent).join('') }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script>
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { colorGradientCalculation } from '@/utils/tools'
import unitConvert from '@/utils/unit-convert'
import { drillDownPanelTypeMapping, storageKey, unitTypes } from '@/utils/constants'
import { getSecond } from '@/utils/date-util'

export default {
  name: 'LinkBlock',
  mixins: [chartMixin],
  components: {
    ChartNoData
  },
  data () {
    return {
      unitTypes,
      linkData: [],
      nextHopData: [],
      gradientColor: ['#FF005C', '#40537E'] // [start, end]
    }
  },
  setup () {
    const { query } = useRoute()
    const tab = ref(query.blockTab || 0)
    return {
      tab
    }
  },
  watch: {
    timeFilter: {
      handler (n) {
        this.init()
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    unitConvert,
    init () {
      this.toggleLoading(true)
      // 链路基本信息
      let linkInfo = localStorage.getItem(storageKey.linkInfo)
      linkInfo = JSON.parse(linkInfo)
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      const dataRequest = get(api.linkMonitor.analysis, params)
      const nextHopRequest = get(api.linkMonitor.nextHopAnalysis, params)

      Promise.all([dataRequest, nextHopRequest]).then(res => {
        if (res[0].code === 200 && res[1].code === 200) {
          const linkData = res[0].data.result
          const nextHopData = res[1].data.result
          this.isNoData = linkData.length === 0 && nextHopData.length === 0
          if (this.isNoData) {
            return
          }
          const data = []
          linkData.forEach(d => {
            const info = linkInfo.find(i => i.originalLinkId == d.linkId)
            if (info) {
              const hit = data.find(d => d.linkId === info.linkId)
              if (hit) {
                hit.egressBytes += d.egressBytes
                hit.ingressBytes += d.ingressBytes
                if (info.direction === 'egress') {
                  hit.egressBandwidth = info.bandwidth
                  hit.egressLinkId = d.linkId
                } else if (info.direction === 'ingress') {
                  hit.ingressBandwidth = info.bandwidth
                  hit.ingressLinkId = d.linkId
                }
              } else {
                const hit = {
                  linkId: info.linkId,
                  egressBytes: d.egressBytes,
                  ingressBytes: d.ingressBytes
                }
                if (info.direction === 'egress') {
                  hit.egressBandwidth = info.bandwidth
                  hit.egressLinkId = d.linkId
                } else if (info.direction === 'ingress') {
                  hit.ingressBandwidth = info.bandwidth
                  hit.ingressLinkId = d.linkId
                }
                data.push(hit)
              }
            }
          })
          data.forEach((item) => {
            item.totalBitsRate = item.egressBytes + item.ingressBytes
          })

          nextHopData.forEach((item) => {
            item.totalBitsRate = item.egressBytes + item.ingressBytes
          })

          const sorted = data.sort((a, b) => b.totalBitsRate - a.totalBitsRate)
          const linkColors = colorGradientCalculation(this.gradientColor[0], this.gradientColor[1], sorted.map(s => s.totalBitsRate))
          sorted.forEach((s, i) => {
            s.color = linkColors[i]
            s.egressUsage = this.computeUsage(s.egressBytes, s.egressBandwidth)
            s.ingressUsage = this.computeUsage(s.ingressBytes, s.ingressBandwidth)
            s.popoverWidth = this.computePopoverWidth(s.egressUsage, s.ingressUsage)
          })
          this.linkData = sorted

          // 下一跳数据处理
          const nextHopSorted = nextHopData.sort((a, b) => b.totalBitsRate - a.totalBitsRate)
          const nextHopColors = colorGradientCalculation(this.gradientColor[0], this.gradientColor[1], nextHopSorted.map(s => s.totalBitsRate))
          nextHopSorted.forEach((s, i) => {
            s.color = nextHopColors[i]

            let sum = 0
            linkInfo.forEach((item) => {
              // todo 此处需注意，不明确接口返回的方向字段名是拼音还是汉字，后期可能会变动缓存中的nextHop
              if (s.linkDirection === item.nextHop) {
                sum += item.bandwidth
              }
            })

            // 上行使用情况计算
            const egressUsage = this.computeUsage(s.egressBytes, sum)
            // 下行使用情况计算
            const ingressUsage = this.computeUsage(s.ingressBytes, sum)
            s.egressUsage = egressUsage
            s.ingressUsage = ingressUsage
            s.popoverWidth = this.computePopoverWidth(egressUsage, ingressUsage)
          })

          this.nextHopData = nextHopSorted
        } else {
          this.isNoData = true
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    /**
     * 计算上下行使用占比
     */
    computeUsage (e, bandwidth) {
      let usage = e / bandwidth
      if (usage >= 1) {
        usage = 1
      }
      return usage
    },
    /**
     * 计算popover弹窗的宽度
     * 最小宽度为252px，百分比每大一位，popover弹窗宽度增加7px
     */
    computePopoverWidth (egress, ingress) {
      let width = 252
      let length = 0

      // 将上下行乘100保留2位转换，即10.00为5位，100.00为6位，popover弹窗宽度就增加7px
      // 最小宽度为252px，最少位数为上下行相加为8位
      const egressUsage = (egress * 100).toFixed(2)
      const ingressUsage = (ingress * 100).toFixed(2)
      length = egressUsage.length + ingressUsage.length

      if (length > 8) {
        width = 252 + (length - 8) * 7
      }
      return width
    },
    drillLinkId (item) {
      const queryCondition = `common_egress_link_id = ${item.egressLinkId} AND common_ingress_link_id = ${item.ingressLinkId}`
      this.$router.push({
        query: {
          ...this.$route.query,
          thirdPanel: drillDownPanelTypeMapping.linkMonitor,
          thirdMenu: `Link ID: ${item.linkId}`,
          panelName: `Link ID: ${item.linkId}`,
          queryCondition,
          t: +new Date()
        }
      })
    },
    drillNextHop (item) {
      const queryCondition = `egress_link_direction = '${item.linkDirection}' AND ingress_link_direction = '${item.linkDirection}'`
      this.$router.push({
        query: {
          ...this.$route.query,
          thirdPanel: drillDownPanelTypeMapping.linkMonitor,
          thirdMenu: `Next-Hop Internet: ${item.linkDirection}`,
          panelName: `Next-Hop Internet: ${item.linkDirection}`,
          queryCondition,
          t: +new Date()
        }
      })
    }
  }
}
</script>
