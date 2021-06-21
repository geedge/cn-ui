<template>
  <div>
    <div class="panel-header">
      <DateTimeRange :start-time="startTime" :end-time="endTime" ref="dateTimeRange" @change="dateTimeRangeChange"/>
    </div>
    <div class="cn-panel">
      <chart v-for="(chart, index) in chartList" :key="index" :chart="chart"></chart>
      <!--    <grid-layout v-model:layout="chartList"
                       :col-num="12"
                       :row-height="30"
                       :is-draggable="draggable"
                       :is-resizable="resizable"
                       :vertical-compact="compact"
                       :use-css-transforms="true"
          >
            <grid-item v-for="item in chartList" :key="item.i"
                       :x="item.x"
                       :y="item.y"
                       :w="item.w"
                       :h="item.h"
                       :i="item.i"
            >
              <span class="text">{{ item.i }}</span>
            </grid-item>
          </grid-layout>-->
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { panelTypeAndRouteMapping } from '@/utils/constants'
import { api, getPanelList, getChartList } from '@/utils/api'
import { getNowTime } from '@/utils/date-util'
import Chart from './Chart'
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'

export default {
  name: 'Panel',
  components: {
    Chart,
    DateTimeRange
  },
  data () {
    return {

    }
  },
  methods: {
  },
  async mounted () {
    const panels = await getPanelList({ type: this.panelType })
    if (panels && panels.length > 0) {
      this.panel = panels[0]
    }
    if (this.panel.id) {
      this.chartList = (await getChartList({ panelId: this.panel.id })).map(chart => {
        chart.i = chart.id
        return chart
      })
    }
  },
  setup (props, ctx) {
    // data
    const chartList = ref([])
    const dateRangeValue = ref(60)
    const now = getNowTime(dateRangeValue.value)
    const startTime = ref(now.startTime)
    const endTime = ref(now.endTime)
    const panel = ref({})
    let panelType = 1 // 取得panel的type
    const { params } = useRoute()
    // refs
    const dateTimeRange = ref(null)

    panelTypeAndRouteMapping[params.typeName] && (panelType = panelTypeAndRouteMapping[params.typeName])
    // onMounted
    onMounted(() => {
      dateTimeRange.value.isCustom = false
      dateTimeRange.value.dateRangeValue = dateRangeValue
    })
    // methods
    const dateTimeRangeChange = (s, e, v) => {
      startTime.value = s
      endTime.value = e
      dateRangeValue.value = v
    }
    return {
      panelType,
      chartList,
      panel,
      startTime,
      endTime,
      dateRangeValue,
      dateTimeRange,
      api,
      dateTimeRangeChange
    }
  }
}
</script>
<style lang="scss">
@import '~@/components/charts/panel.scss';
  .panel-header{
    display: flex;
    justify-content: flex-end;
  }
</style>
