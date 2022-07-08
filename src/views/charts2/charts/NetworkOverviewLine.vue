<template>
  <div class="line">
    <div id="chart"></div>
    <div class="line-select">
      <div class="line-select-metric">
        <span>{{$t('network.metric')}}:</span>
        <div class="line-select__operation">
          <el-select
              size="mini"
              v-model="options"
              class="option__select select-topn"
              placeholder=""
              popper-class="option-popper"
          >
            <el-option v-for="item in options" :key="item.value" :label="item.label"></el-option>
          </el-select>
        </div>
      </div>
      <div class="line-select-reference-line">
        <span>{{$t('network.referenceLine')}}:</span>
        <div class="line-select__operation">
          <el-select
              size="mini"
              v-model="options"
              class="option__select select-topn"
              placeholder=""
              popper-class="option-popper"
          >
            <el-option v-for="item in options" :key="item.value" :label="item.label"></el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div class="line-value">
      <div class="line-value-mpackets" v-for="item in mpackets" :key="item">
        <span>{{item}} </span><span>mpackets/s</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { stackedLineChartOption } from '@/views/charts2/charts/options/pie'
import unitConvert from '@/utils/unit-convert'
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
      ],
      mpackets: [42, 1, 2, 1, 12],
      unitConvert
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
