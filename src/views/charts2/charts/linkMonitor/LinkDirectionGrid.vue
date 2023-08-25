<template>
  <div class="link-direction-grid">
    <!--左侧链路出入口-->
    <popover-content :title="$t('linkMonitor.egressLink') + ' & ' + $t('linkMonitor.ingressLink')" :isNoData="isLinkNoData" :gridData="linkGridData" :showError="isLinkShowError" :content="linkErrorMsg" style="width: 900px;"/>

    <!--右侧链路下一跳-->
    <popover-content :title="$t('linkMonitor.nextHopInternetOfGrid')" :isNoData="isNextNoData" :gridData="nextGridData" :showError="isNextShowError" :content="nextErrorMsg" />
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import { storageKey } from '@/utils/constants'
import PopoverContent from './LinkDirectionGrid/PopoverContent'
import { computeScore } from '@/utils/tools'
import axios from 'axios'

export default {
  name: 'LinkDirectionGrid',
  mixins: [chartMixin],
  data () {
    return {
      linkGridData: [],
      nextGridData: [],
      isLinkNoData: false,
      isNextNoData: false,
      isLinkShowError: false, // 显示左侧链路报错标识
      linkErrorMsg: '', // 左侧链路的报错信息
      isNextShowError: false, // 显示右侧下一跳报错标识
      nextErrorMsg: '' // 右侧下一跳的报错信息
    }
  },
  components: {
    PopoverContent
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
    init () {
      // 链路基本信息
      let linkInfo = localStorage.getItem(storageKey.linkInfo)
      linkInfo = JSON.parse(linkInfo)

      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }

      const dataRequest = axios.get(api.linkMonitor.bigramAnalysis, { params: params }).catch(e => {
        this.isLinkShowError = true
        this.isLinkNoData = false
        this.linkErrorMsg = this.errorMsgHandler(e)
      })
      const nextHopRequest = axios.get(api.linkMonitor.bigramNextHopAnalysis, { params: params }).catch(e => {
        this.isNextShowError = true
        this.isNextNoData = false
        this.nextErrorMsg = this.errorMsgHandler(e)
      })
      this.toggleLoading(true)

      Promise.all([dataRequest, nextHopRequest]).then(response => {
        if (response[0].status === 200 && response[1].status === 200) {
          const res = []
          res[0] = response[0].data
          res[1] = response[1].data
          if (response[0].status === 200) {
            this.isLinkShowError = false
            // 链路流量数据
            const linkData = res[0].data.result
            // 接口数据乱序，根据入链路id（ingressLinkId）大小排序之后，
            // 再根据同ingressLinkId下的egressLinkId进行排序
            linkData.sort((a, b) => {
              if (a.ingressLinkId !== b.ingressLinkId) {
                return a.ingressLinkId - b.ingressLinkId
              }
              return a.egressLinkId - b.egressLinkId
            })

            this.isLinkNoData = linkData.length === 0
            if (!this.isLinkNoData) {
              // 链路流量数据
              const linkGridData = []
              linkData.forEach(d => {
                const ingressLink = linkInfo.find(l => l.originalLinkId === d.ingressLinkId)
                const egressLink = linkInfo.find(l => l.originalLinkId === d.egressLinkId)
                if (ingressLink && egressLink) {
                  const data = linkGridData.find(g => g.linkId === ingressLink.linkId)

                  // 上行使用情况计算
                  const egressUsage = this.computeUsage(d.egressBitsRate, egressLink.bandwidth)
                  // 下行使用情况计算
                  const ingressUsage = this.computeUsage(d.ingressBitsRate, ingressLink.bandwidth)
                  // 宽带使用超过90%，赋红点

                  d.usageMore90 = egressUsage >= 0.9 || ingressUsage >= 0.9
                  // 计算npm分数
                  // 分数低于3分，赋红点
                  d.score = this.localComputeScore(d)

                  d.scoreLow3 = d.score < 3 || d.score === '-'

                  if (data) {
                    const existedEgressLink = data.egress.find(e => e.linkId === egressLink.linkId)
                    if (!existedEgressLink) {
                      data.egress.push({
                        linkId: egressLink.linkId,
                        egressUsage: egressUsage,
                        ingressUsage: ingressUsage,
                        popoverWidth: this.computeWidth(egressUsage, ingressUsage, 'popover'),
                        valueWidth: this.computeWidth(egressUsage, ingressUsage, 'value'),
                        totalBitsRate: d.totalBitsRate,
                        ...d
                      })
                    }
                  } else {
                    linkGridData.push({
                      linkId: ingressLink.linkId,
                      egress: [{
                        linkId: egressLink.linkId,
                        egressUsage: egressUsage,
                        ingressUsage: ingressUsage,
                        popoverWidth: this.computeWidth(egressUsage, ingressUsage, 'popover'),
                        valueWidth: this.computeWidth(egressUsage, ingressUsage, 'value'),
                        totalBitsRate: d.totalBitsRate,
                        ...d
                      }]
                    })
                  }
                }
              })
              this.isLinkNoData = linkGridData.length === 0
              this.linkGridData = linkGridData
            }
          } else {
            this.isLinkNoData = true
            this.isLinkShowError = true
            this.linkErrorMsg = this.errorMsgHandler(res[0])
          }

          if (response[1].status === 200) {
            this.isNextShowError = false

            // 链路下一跳信息
            const nextLinkData = res[1].data.result
            // 接口数据乱序，根据入方向排序，再根据同个入方向下的出方向进行排序
            nextLinkData.sort((a, b) => {
              if (a.ingressLinkDirection !== b.ingressLinkDirection) {
                return a.ingressLinkDirection.localeCompare(b.ingressLinkDirection, 'zh')
              }
              return a.egressLinkDirection.localeCompare(b.egressLinkDirection, 'zh')
            })

            this.isNextNoData = nextLinkData.length === 0
            if (!this.isNextNoData) {
              // 链路下一跳数据
              const nextGridData = []

              nextLinkData.forEach(d => {
                const ingressLink = linkInfo.find(l => l.nextHop === d.ingressLinkDirection && l.direction === 'ingress')
                const egressLink = linkInfo.find(l => l.nextHop === d.egressLinkDirection && l.direction === 'egress')

                if (ingressLink && egressLink) {
                  const data = nextGridData.find(g => g.linkId === ingressLink.linkId)

                  let egressBanwidth = 0
                  let ingressBanwidth = 0
                  linkInfo.forEach((item) => {
                    if (item.nextHop === d.egressLinkDirection && item.direction === 'egress') {
                      egressBanwidth += item.bandwidth
                    }
                    if (item.nextHop === d.ingressLinkDirection && item.direction === 'ingress') {
                      ingressBanwidth += item.bandwidth
                    }
                  })

                  // 上行使用情况计算
                  const egressUsage = this.computeUsage(d.egressBitsRate, egressBanwidth)
                  // 下行使用情况计算
                  const ingressUsage = this.computeUsage(d.ingressBitsRate, ingressBanwidth)
                  // 宽带使用超过90%，赋红点

                  d.usageMore90 = egressUsage >= 0.9 || ingressUsage >= 0.9
                  // 计算npm分数
                  // 分数低于3分，赋红点
                  d.score = this.localComputeScore(d)

                  d.scoreLow3 = d.score < 3 || d.score === '-'

                  if (data) {
                    const existedEgressLink = data.egress.find(e => e.linkId === egressLink.linkId)
                    if (!existedEgressLink) {
                      data.egress.push({
                        linkId: egressLink.linkId,
                        nextHop: egressLink.nextHop,
                        egressUsage: egressUsage,
                        ingressUsage: ingressUsage,
                        popoverWidth: this.computeWidth(egressUsage, ingressUsage, 'popover'),
                        valueWidth: this.computeWidth(egressUsage, ingressUsage, 'value'),
                        totalBitsRate: d.totalBitsRate,
                        ...d
                      })
                    }
                  } else {
                    nextGridData.push({
                      linkId: ingressLink.linkId,
                      nextHop: ingressLink.nextHop,
                      egress: [{
                        linkId: egressLink.linkId,
                        nextHop: ingressLink.nextHop,
                        egressUsage: egressUsage,
                        ingressUsage: ingressUsage,
                        popoverWidth: this.computeWidth(egressUsage, ingressUsage, 'popover'),
                        valueWidth: this.computeWidth(egressUsage, ingressUsage, 'value'),
                        totalBitsRate: d.totalBitsRate,
                        ...d
                      }]
                    })
                  }
                }
              })
              this.isNextNoData = nextGridData.length === 0
              this.nextGridData = nextGridData
            }
          } else {
            this.isNextNoData = true
            this.isNextShowError = true
            this.nextErrorMsg = this.errorMsgHandler(res[1])
          }
        }
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
     * 本地计算npm分数
     */
    localComputeScore (data) {
      let score = 0
      const dataScore = {
        establishLatencyMs: data.establishLatencyMs || null,
        httpResponseLatency: data.httpResponseLatency || null,
        sslConLatency: data.sslConLatency || null,
        tcpLostlenPercent: data.tcpLostlenPercent || null,
        pktRetransPercent: data.pktRetransPercent || null
      }
      score = computeScore(dataScore)
      return score
    },
    /**
     * 计算popover弹窗和右侧数据模块的宽度
     * 弹窗最小宽度为360px，右侧数据最小宽度为75px，右侧数据每大一位，popover弹窗宽度增加7px
     */
    computeWidth (egress, ingress, flag) {
      let width = 0
      let length = 0

      let egressUsage = ''
      let ingressUsage = ''

      if (egress < 0.0001 && egress !== 0) {
        egressUsage = '<0.01%'
      } else {
        egressUsage = JSON.stringify(parseFloat((egress * 100).toFixed(2)))
      }
      if (ingress < 0.0001 && ingress !== 0) {
        ingressUsage = '<0.01%'
      } else {
        ingressUsage = JSON.stringify(parseFloat((ingress * 100).toFixed(2)))
      }

      length = egressUsage.length + ingressUsage.length - 1

      if (flag === 'popover') {
        width = 360 + length * 7
      } else {
        width = 75 + length * 7
      }

      return width
    }
  }
}
</script>
