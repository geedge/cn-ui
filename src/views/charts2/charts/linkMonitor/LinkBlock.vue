<template>
  <div class="link-blocks">
    <el-tabs v-model="tab">
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
import { unitTypes } from '@/utils/constants'

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
  mounted () {
    this.init()
  },
  methods: {
    unitConvert,
    init () {
      this.toggleLoading(true)
      get(api.linkMonitor.links).then(res => {
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          if (this.isNoData) {
            return
          }
          const sorted = res.data.result.sort((a, b) => b.totalBitsRate - a.totalBitsRate)
          const colors = colorGradientCalculation(this.gradientColor[0], this.gradientColor[1], sorted.map(s => s.totalBitsRate))
          sorted.forEach((s, i) => {
            s.color = colors[i]
          })
          this.linkData = sorted
        } else {
          this.isNoData = true
        }
      }).catch(e => {
        console.error(e)
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  }
}
</script>
