<template>
  <div class="chart-list" style="display:grid;height:calc(100vh - 90px);width:100%;grid-template-columns:repeat(30,1fr);grid-template-rows:repeat(19,1fr);grid-gap:10px;padding-left: 10px;padding-right: 10px;">
    <div v-for="item in dnsScreenDataList"
          :key="item.id"
          :ref="'grid-item' + item.id"
          class="dns-screen"
          :style="'grid-area: '+(item.y+1+30) +'/ '+(item.x+1) +' / '+(item.y+item.h+1+30) +'/ '+(item.x+item.w+1)+';'"
      >
        <panel-chart
                :ref="'chart' + item.id"
                :chart-info="item"
                :time-filter="timeFilter"
                :entity="entity"
        ></panel-chart>
    </div>
  </div>
</template>

<script>
import PanelChart from '@/views/charts/PanelChart'

export default {
  name: 'DnsScreen',
  components: {
    PanelChart
  },
  props: {
    timeFilter: Object, // 时间范围
    copyDataList: Array, // 图表信息
    entity: Object
  },
  methods: {
    reload () {
      this.dnsScreenDataList.forEach(item => {
        if (this.$refs['chart' + item.id]) {
          this.$refs['chart' + item.id].getChartData()
        }
      })
    }
  },
  computed: {
    dnsScreenDataList: function () {
      return this.copyDataList.filter(function (item) {
        return item.y < 0
      })
    }
  }

}
</script>
