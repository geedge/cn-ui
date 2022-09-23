<template>
  <div class="link-direction-grid">
    <div class="link-statistical-dimension" style="width: 900px;">
      <div class="dimension-title">{{$t('linkMonitor.egressLink')}}&nbsp;&&nbsp;{{$t('linkMonitor.ingressLink')}}</div>
      <div class="data-grid">
        <div class="egress-row">
          <div class="egress-id" v-for="(item, index) in gridData" :key="index">{{item.linkId}}</div>
        </div>
        <div class="data-row" v-for="(row, index) in gridData" :key="index">
          <div class="ingress-id">{{row.linkId}}</div>
          <div class="data-item" v-for="(item, index2) in row.egress" :key="index2">
            <div class="data-item__point"></div>
            <div class="data-item__point"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="link-statistical-dimension">
      <div class="dimension-title">{{$t('linkMonitor.egressLink')}}&nbsp;&&nbsp;{{$t('linkMonitor.ingressLink')}}</div>
      <div class="data-grid">
        <div class="egress-row">
          <template v-for="(item, index) in gridData">
            <div class="egress-id" v-if="index <= 2" :key="index">{{item.linkId}}</div>
          </template>
        </div>
        <template v-for="(row, index) in gridData">
          <div class="data-row" v-if="index <= 2" :key="index">
            <div class="ingress-id">{{row.linkId}}</div>
            <template v-for="(row, index2) in row.egress">
              <div class="data-item" v-if="index2 <= 2" :key="index2">
                <div class="data-item__point"></div>
                <div class="data-item__point"></div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { getSecond } from '@/utils/date-util'
import { api } from '@/utils/api'
import { get } from '@/utils/http'

export default {
  name: 'LinkDirectionGrid',
  mixins: [chartMixin],
  data () {
    return {
      gridData: [],
      gridData2: []
    }
  },
  methods: {
    init () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      const configRequest = get(api.config, { ckey: 'link_info' })
      const dataRequest = get(api.linkMonitor.linkTrafficDirection, params)
      Promise.all([configRequest, dataRequest]).then(res => {
        if (res[0].code === 200 && res[1].code === 200) {
          if (res[0].page.list && res[0].page.list.length > 0) {
            // 链路基本信息
            const linkInfo = JSON.parse(res[0].page.list[0].cvalue)
            // 链路流量数据
            const linkData = res[1].data.result
            const gridData = []
            linkData.forEach(d => {
              const ingressLink = linkInfo.find(l => l.originalLinkId === d.ingressLinkId)
              const egressLink = linkInfo.find(l => l.originalLinkId === d.egressLinkId)
              if (ingressLink && egressLink) {
                const data = gridData.find(g => g.linkId === ingressLink.linkId)
                if (data) {
                  const existedEgressLink = data.egress.find(e => e.linkId === egressLink.linkId)
                  if (!existedEgressLink) {
                    data.egress.push({ linkId: egressLink.linkId, totalBytes: d.totalBytes })
                  }
                } else {
                  gridData.push({ linkId: ingressLink.linkId, egress: [{ linkId: egressLink.linkId, totalBytes: d.totalBytes }] })
                }
              }
            })
            this.gridData = gridData
          }
        }
      })
    }
  },
  mounted () {
    this.toggleLoading(false)
    this.init()
  }
}
</script>
