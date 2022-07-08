<template>
  <div class="line">
    <div id="chart"></div>
    <div>
      <div>
        <span>{{$t('network.metric')}}:</span>
        <el-select v-model="value" class="m-2" placeholder="Select" size="small">
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select></div>
      <div>
        <span>{{$t('network.referenceLine')}}:</span>
        <el-select v-model="value" class="m-2" placeholder="Select" size="small">
          <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { stackedLineChartOption } from '@/views/charts2/charts/options/pie'

export default {
  name: 'NetworkOverviewLine',
  props: {
    chart: Object
  },
  data () {
    return {
      options: [
        {
          value: 'Option1',
          label: 'Option1'
        },
        {
          value: 'Option2',
          label: 'Option2'
        },
        {
          value: 'Option3',
          label: 'Option3'
        },
        {
          value: 'Option4',
          label: 'Option4'
        },
        {
          value: 'Option5',
          label: 'Option5'
        }
      ]
    }
  },
  methods: {
    init () {
      const dom = document.getElementById('chart')
      const myChart = echarts.init(dom)
      myChart.setOption(stackedLineChartOption)
    }
  },
  mounted () {
    this.init()
  }
}
</script>
