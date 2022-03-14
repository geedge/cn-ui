import { shallowRef } from 'vue'
import * as echarts from 'echarts'
import {
  isEchartsLine,
  isEchartsPie,
  isEchartsWithTable,
  isEchartsWithStatistics,
  isIpHostedDomain,
  isAppRelatedDomain,
  getOption
} from './tools'
export default {
  props: {
    chartInfo: Object,
    chartData: [Object, Array, String] // 数据在父组件查询后传入，本组件内不查询，只根据接传递的数据来渲染
  },
  setup (props) {
    return {
      myChart: shallowRef(null),
      myChart2: shallowRef(null), // 个别有两个图表的chart

      isEchartsLine: isEchartsLine(props.chartInfo.type),
      isEchartsPie: isEchartsPie(props.chartInfo.type),

      isEchartsWithTable: isEchartsWithTable(props.chartInfo.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chartInfo.type),

      isAppRelatedDomain: isAppRelatedDomain(props.chartInfo.type),
      isIpHostedDomain: isIpHostedDomain(props.chartInfo.type)
    }
  },
  data () {
    return {
      chartOption: null
    }
  },
  methods: {
    initDom (id, chartNum) {
      if (chartNum && chartNum == 2) {
        const dom = document.getElementById(id + '-0')
        const dom2 = document.getElementById(id + '-1')
        !this.myChart && (this.myChart = echarts.init(dom))
        !this.myChart2 && (this.myChart2 = echarts.init(dom2))
      } else {
        const dom = document.getElementById(id)
        !this.myChart && (this.myChart = echarts.init(dom))
      }
      this.chartOption = this.$_.cloneDeep(getOption(this.chartInfo.type))
    },
    // 出来y轴相关配置
    handleYaxis () {
      const allZero = this.timeLineIsAllZero(this.chartData)
      if (allZero) {
        this.chartOption.yAxis = {
          ...this.chartOption.yAxis,
          min: 0,
          max: 5,
          interval: 1
        }
      }
    },
    timeLineIsAllZero (data) {
      if (this.resultType === 'matrix') {
        let allZero = true
        try {
          data.forEach(d => {
            d.values.forEach(r => {
              if (r[1] && r[1] !== '0') {
                allZero = false
                throw new Error('break')
              }
            })
          })
        } catch (e) {}
        return allZero
      }
    },
    loadEchart (chartNum) {
      this.$emit('showLoading', true)
      try {
        this.myChart.setOption(this.chartOption)
        this.$store.commit('setChartList', this.$_.cloneDeep(this.myChart))
        if (chartNum && chartNum == 2) {
          this.myChart2.setOption(this.chartOption)
          this.$store.commit('setChartList', this.$_.cloneDeep(this.myChart2))
        }
        let _this = this
        window.addEventListener("resize", function(){
          _this.$store.getters.getChartList.forEach(chart =>{
            if(chart){
              chart.resize()
            }
          })
        });
      } finally {
        setTimeout(() => {
          this.$emit('showLoading', false)
        }, 200)
      }
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler (n) {
        if (this.chartData && this.chartData.length > 0) {
          this.initEcharts(`chart${this.chartInfo.id}`)
        }
      }
    }
  }
}
