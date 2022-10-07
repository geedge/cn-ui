<template>
  <div class="link-blocks">
    <!--<el-tabs v-model="tab">
          <el-tab-pane :label="$t('linkMonitor.links')" :name="0"></el-tab-pane>
          <el-tab-pane :label="$t('linkMonitor.nextHopInternet')" :name="1"></el-tab-pane>
        </el-tabs>
        <div class="block-list">
          <el-popover
              placement="bottom"
              trigger="hover"
              popper-class="link-block__popper"
              v-for="(item, index) in linkData"
              :width="220"
              :key="index"
          >
            <template #reference>
              <div class="link-block" :style="`background-color: ${item.color}`"></div>
            </template>
            <template #default>
              <div class="popper-content">
                <div class="popper-content__link-id">Link ID: {{item.linkId}}</div>
                <div class="popper-content__link-info">
                  <div class="info__label">{{$t('linkMonitor.linkBlock.total')}}</div>
                  <div class="info__value">{{unitConvert(item.totalBitsRate, unitTypes.bps).join('')}}</div>
                </div>
                <div class="popper-content__link-info">
                  <div class="info__label">{{$t('linkMonitor.linkBlock.bandwidthUsage')}}</div>
                  <div class="info__value">50%</div>
                </div>
              </div>
            </template>
          </el-popover>
        </div>
        <div class="block-heat-legend">
          <div class="legend__box">
            <div class="legend__value">
              <span>0</span>
              <span>90%</span>
            </div>
            <div class="legend__color-piece"></div>
            <div class="legend__desc">{{$t('linkMonitor.linkBlock.bandwidthUsage')}}</div>
          </div>
        </div> -->
    <div class="block-list">
      <div class="block-list__title">{{ $t('linkMonitor.links') }}</div>
      <div class="block-list__list">
        <el-popover
            placement="bottom"
            trigger="hover"
            popper-class="link-block__popper"
            v-for="(item, index) in linkData"
            :width="285"
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
                  {{ unitConvert(item.totalBitsRate, unitTypes.bps).join('') }}
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
            :width="285"
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
              <div class="popper-content__link-id">Link ID: {{ item.linkDirection }}</div>
              <div class="popper-content__link-info">
                <div class="info__label">{{ $t('linkMonitor.linkBlock.total') }}</div>
                <div class="info__value" style="margin-left: 8px">
                  {{ unitConvert(item.totalBitsRate, unitTypes.bps).join('') }}
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
import {drillDownPanelTypeMapping, storageKey, unitTypes} from '@/utils/constants'
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
      gradientColor: ['#FF005C', '#40537E'], // [start, end]
      gradientColor1: ['#793973', '#654277', '#40537E'] // [start, end]
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
      deep: true,
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
      const nextHopRequest = get(api.linkMonitor.nextHopAnalysis1, params)

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
          const colors = colorGradientCalculation(this.gradientColor[0], this.gradientColor[1], sorted.map(s => s.totalBitsRate))
          sorted.forEach((s, i) => {
            s.color = colors[i]
            s.egressUsage = this.computeUsage(s.egressBytes, s.egressBandwidth)
            s.ingressUsage = this.computeUsage(s.ingressBytes, s.ingressBandwidth)
            /*const ingressLink = linkInfo.find(l => l.linkId === s.linkId && l.direction === 'ingress')
            const egressLink = linkInfo.find(l => l.linkId === s.linkId && l.direction === 'egress')
            if (ingressLink && egressLink) {
              // 上行使用情况计算
              const egressUsage = this.computeUsage(s.egressBytes, egressLink.bandwidth)
              // 下行使用情况计算
              const ingressUsage = this.computeUsage(s.ingressBytes, ingressLink.bandwidth)
              s.egressUsage = egressUsage
              s.ingressUsage = ingressUsage
            }*/
          })
          this.linkData = sorted

          const nextHopSorted = nextHopData.sort((a, b) => b.totalBitsRate - a.totalBitsRate)

          nextHopSorted.forEach((s, i) => {
            s.color = this.gradientColor1[i]

            let sum = 0
            linkInfo.forEach((item) => {
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
    drillLinkId (item) {
      const queryCondition = `common_egress_link_id = ${item.egressLinkId} AND common_ingress_link_id = ${item.ingressLinkId}`
      this.jumpAndCache(this.$route.path, {
        ...this.$route.query,
        thirdPanel: drillDownPanelTypeMapping.linkMonitor,
        thirdMenu: `Link ID: ${item.linkId}`,
        panelName: `Link ID: ${item.linkId}`,
        queryCondition
      })
    },
    drillNextHop (item) {
      const queryCondition = `egress_link_direction = '${item.linkDirection}' AND ingress_link_direction = '${item.linkDirection}'`
      this.jumpAndCache(this.$route.path, {
        ...this.$route.query,
        thirdPanel: drillDownPanelTypeMapping.linkMonitor,
        thirdMenu: `Link ID: ${item.linkDirection}`,
        panelName: `Link ID: ${item.linkDirection}`,
        queryCondition
      })
    }
  }
}
</script>
