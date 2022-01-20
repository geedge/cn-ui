<template>
    <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
</template>

<script>
import * as echarts from 'echarts'
import loadsh from 'lodash'
import { relationShip } from './options/sankey'
export default {
  name: 'ChartRelationShip',
  data () {
    return {
      myChart: null,
      chartOption: null
    }
  },
  props: {
    chartInfo: Object,
    chartData: [Array, Object],
    resultType: Object,
    queryParams: Object
  },
  methods: {
    init (id) {
      const chartParams = this.chartInfo.params
      const dom = document.getElementById(id)
      !this.myChart && (this.myChart = echarts.init(dom))
      this.chartOption = this.$_.cloneDeep(relationShip)
      const data = []
      const links = []
      handleData(data, links, this.chartData)
      this.chartOption.series[0].data = data
      this.chartOption.series[0].links = links
      this.myChart.setOption(this.chartOption)
      function handleData (data, links, item) {
        if (!data.some(d => d.name === item.name)) {
          data.push({ name: item.name, ...handleStyle(item) })
        }
        if (!loadsh.isEmpty(item.from) && !loadsh.isEmpty(item.to)) {
          links.push({ target: item.to, source: item.from })
        }
        if (!loadsh.isEmpty(item.leaf)) {
          item.leaf.forEach(i => {
            handleData(data, links, i)
          })
        }
      }

      function handleStyle (item) {
        const style = {}
        switch (item.type) {
          case 'app_id': {
            style.itemStyle = { color: '#73DEB3' }
            style.symbol = 'circle'
            break
          }
          case 'domain': {
            style.itemStyle = { color: '#73A0FA' }
            style.symbol = 'circle'
            break
          }
          case 'client_ip': {
            style.itemStyle = { color: '#E8F6FF', borderColor: '#C9C9C9' }
            style.symbol = 'roundRect'
            style.symbolSize = [80, 25]
            break
          }
          case 'server_ip': {
            style.itemStyle = { color: '#E2FCEF', borderColor: '#C9C9C9' }
            style.symbol = 'roundRect'
            style.symbolSize = [80, 25]
            break
          }
        }
        return style
      }
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        this.init(`chart${this.chartInfo.id}`)
      }
    }
  }
}
</script>

<style scoped>

</style>
