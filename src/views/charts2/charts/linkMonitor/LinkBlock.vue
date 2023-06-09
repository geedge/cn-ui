<template>
  <div class="link-blocks">
    <div class="block-list" style="position: relative">
      <div class="block-list__title">{{ $t('linkMonitor.links') }}</div>

      <!--无数据noData-->
      <chart-no-data v-if="linkNoData" test-id="linkBlockNoData"></chart-no-data>

      <chart-error style="top: 40px;" v-show="!linkNoData" v-if="showError1" :content="errorMsg1" />
      <div class="block-list__list" v-show="!linkNoData" v-else>
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
                <div class="info__value" :test-id="`linkBlockTotal${index}`" style="margin-left: 8px">
                  {{ unitConvert(item.totalBitsRate, unitTypes.bps).join(' ') }}
                </div>
              </div>
              <div class="popper-content__link-info">
                <div class="info__label">{{ $t('linkMonitor.linkBlock.bandwidthUsage') }}</div>
                <div class="info__value" style="display: flex">
                  <div :test-id="`linkBlockEgressUsage${index}`">
                    <svg class="icon item-popover-up" aria-hidden="true">
                      <use xlink:href="#cn-icon-egress"></use>
                    </svg>
                    {{ convertValue(item.egressUsage) }}
                  </div>
                  <div :test-id="`linkBlockIngressUsage${index}`">
                    <svg class="icon item-popover-down" aria-hidden="true">
                      <use xlink:href="#cn-icon-ingress"></use>
                    </svg>
                    {{ convertValue(item.ingressUsage) }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-popover>
      </div>
    </div>

    <div class="block-list" >
      <div class="block-list__title">{{ $t('linkMonitor.nextHopInternet') }}</div>

      <chart-no-data v-if="nextHopNoData" test-id="nextHpNoData"></chart-no-data>
      <chart-error style="top: 40px;" v-show="!nextHopNoData" class="link-block-error" v-if="showError2" :content="errorMsg2" />
      <div class="block-list__list" v-show="!nextHopNoData" v-else>
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
                <div class="info__value" :test-id="`nextHopTotal${index}`" style="margin-left: 8px">
                  {{ unitConvert(item.totalBitsRate, unitTypes.bps).join(' ') }}
                </div>
              </div>
              <div class="popper-content__link-info">
                <div class="info__label">{{ $t('linkMonitor.linkBlock.bandwidthUsage') }}</div>
                <div class="info__value" style="display: flex">
                  <div :test-id="`nextHopEgressUsage${index}`">
                    <svg class="icon item-popover-up" aria-hidden="true">
                      <use xlink:href="#cn-icon-egress"></use>
                    </svg>
                    {{ convertValue(item.egressUsage) }}
                  </div>
                  <div :test-id="`nextHopIngressUsage${index}`">
                    <svg class="icon item-popover-down" aria-hidden="true">
                      <use xlink:href="#cn-icon-ingress"></use>
                    </svg>
                    {{ convertValue(item.ingressUsage) }}
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
import { api } from '@/utils/api'
import { colorGradientCalculation } from '@/utils/tools'
import unitConvert from '@/utils/unit-convert'
import { drillDownPanelTypeMapping, storageKey, unitTypes } from '@/utils/constants'
import { getSecond } from '@/utils/date-util'
import ChartError from '@/components/common/Error'
import axios from 'axios'

export default {
  name: 'LinkBlock',
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  data () {
    return {
      linkNoData: false,
      nextHopNoData: false,
      unitTypes,
      linkData: [],
      nextHopData: [],
      gradientColor: ['#FF005C', '#40537E'], // [start, end]
      showError1: false,
      showError2: false,
      errorMsg1: '',
      errorMsg2: ''
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
      handler () {
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
      let linkInfo = null
      linkInfo = localStorage.getItem(storageKey.linkInfo)
      linkInfo = JSON.parse(linkInfo)
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      const dataRequest = axios.get(api.linkMonitor.analysis, { params: params }).catch(e => {
        console.error(e)
        this.linkNoData = false
        this.showError1 = true
        this.errorMsg1 = this.errorMsgHandler(e)
      })
      const nextHopRequest = axios.get(api.linkMonitor.nextHopAnalysis, { params: params }).catch(e => {
        console.error(e)
        this.nextHopNoData = false
        this.showError2 = true
        this.errorMsg2 = this.errorMsgHandler(e)
      })

      Promise.all([dataRequest, nextHopRequest]).then(response => {
        if (response[0] && response[1]) {
          const res = []
          res[0] = response[0].data
          res[1] = response[1].data
          if (res[0].code === 200) {
            this.showError1 = false

            const linkData = res[0].data.result

            this.linkNoData = linkData.length === 0
            if (!this.linkNoData) {
              const data = []
              linkData.forEach(d => {
                const info = linkInfo.find(i => i.originalLinkId === d.linkId)
                if (info) {
                  const hit = data.find(d => d.linkId === info.linkId)
                  if (hit) {
                    hit.egressBitsRate += d.egressBitsRate
                    hit.ingressBitsRate += d.ingressBitsRate
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
                      egressBitsRate: d.egressBitsRate,
                      ingressBitsRate: d.ingressBitsRate
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
                item.totalBitsRate = item.egressBitsRate + item.ingressBitsRate
              })

              const sorted = data.sort((a, b) => b.totalBitsRate - a.totalBitsRate)
              const linkColors = colorGradientCalculation(this.gradientColor[0], this.gradientColor[1], sorted.map(s => s.totalBitsRate))
              sorted.forEach((s, i) => {
                s.color = linkColors[i]
                s.egressUsage = this.computeUsage(s.egressBitsRate, s.egressBandwidth)
                s.ingressUsage = this.computeUsage(s.ingressBitsRate, s.ingressBandwidth)
                s.popoverWidth = this.computePopoverWidth(s.egressUsage, s.ingressUsage)
              })
              this.linkData = sorted
            }
          } else {
            this.linkNoData = false
            this.showError1 = true
            this.errorMsg1 = this.errorMsgHandler(res[0])
          }

          if (res[1].code === 200) {
            this.showError2 = false

            const nextHopData = res[1].data.result
            this.nextHopNoData = nextHopData.length === 0
            if (!this.nextHopNoData) {
              let directionArr = []
              nextHopData.forEach((item) => {
                if (item.egressLinkDirection !== '' && item.ingressLinkDirection !== '') {
                  directionArr.push(item.egressLinkDirection)
                  directionArr.push(item.ingressLinkDirection)
                }
              })
              directionArr = Array.from(new Set(directionArr))

              const newNextHopData = []

              directionArr.forEach((item1) => {
                const newObj = { egressBitsRate: 0, ingressBitsRate: 0, totalBitsRate: 0, linkDirection: item1 }
                nextHopData.forEach((item2) => {
                  if (item1 === item2.egressLinkDirection) {
                    newObj.egressBitsRate += item2.egressBitsRate
                    newObj.totalBitsRate += item2.egressBitsRate
                  }
                  if (item1 === item2.ingressLinkDirection) {
                    newObj.ingressBitsRate += item2.ingressBitsRate
                    newObj.totalBitsRate += item2.ingressBitsRate
                  }
                })
                newNextHopData.push(newObj)
              })

              // 下一跳数据处理
              const nextHopSorted = newNextHopData.sort((a, b) => b.totalBitsRate - a.totalBitsRate)
              const nextHopColors = colorGradientCalculation(this.gradientColor[0], this.gradientColor[1], nextHopSorted.map(s => s.totalBitsRate))
              nextHopSorted.forEach((s, i) => {
                s.color = nextHopColors[i]

                let sum = 0
                linkInfo.forEach((item) => {
                  if (s.linkDirection === item.nextHop) {
                    sum += item.bandwidth
                  }
                })

                // 上行使用情况计算
                const egressUsage = this.computeUsage(s.egressBitsRate, sum)
                // 下行使用情况计算
                const ingressUsage = this.computeUsage(s.ingressBitsRate, sum)
                s.egressUsage = egressUsage
                s.ingressUsage = ingressUsage
                s.popoverWidth = this.computePopoverWidth(egressUsage, ingressUsage)
              })

              this.nextHopData = nextHopSorted
            }
          } else {
            this.showError2 = true
            this.nextHopNoData = false
            this.errorMsg2 = this.errorMsgHandler(res[1])
          }
        }
      }).catch(e => {
        console.error(e)
        this.linkNoData = false
        this.nextHopNoData = false
        this.showError1 = true
        this.showError2 = true
        this.errorMsg1 = this.errorMsgHandler(e)
        this.errorMsg2 = this.errorMsgHandler(e)
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
      let egressUsage = ''
      let ingressUsage = ''

      if (egress < 0.0001 && egress !== 0) {
        egressUsage = '< 0.01%'
      } else {
        egressUsage = JSON.stringify(parseFloat((egress * 100).toFixed(2)))
      }
      if (ingress < 0.0001 && ingress !== 0) {
        ingressUsage = '< 0.01%'
      } else {
        ingressUsage = JSON.stringify(parseFloat((ingress * 100).toFixed(2)))
      }

      length = egressUsage.length + ingressUsage.length

      if (length > 8) {
        width = 252 + (length - 8) * 7
      }
      return width
    },
    drillLinkId (item) {
      const queryCondition = `common_egress_link_id = ${item.egressLinkId} or common_ingress_link_id = ${item.ingressLinkId}`
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
      const queryCondition = `egress_link_direction = '${item.linkDirection}' or ingress_link_direction = '${item.linkDirection}'`
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
    },
    /**
     * 对单位进行转换，值小于0.0001的显示为<0.01%，除此之外正常转换显示
     * @param value
     * @returns {string}
     */
    convertValue (value) {
      let newValue = null
      if (value < 0.0001 && value !== 0) {
        newValue = '< 0.01%'
      } else {
        newValue = unitConvert(value, unitTypes.percent).join('')
      }

      return newValue
    }
  },
  beforeUnmount () {
    this.unitConvert = null
  }
}
</script>
