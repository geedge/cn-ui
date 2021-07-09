<template>
  <div class="chart__legend">
    <div class="charts__table-top">
      <p class="location">Average</p>
      <p class="locations">Maximum</p>
    </div>
    <div class="legend__table">
      <table>
        <tr v-for="(d, i) in data" :key="i" class="legend__row">
          <td><div :style="{backgroundColor: getChartColor(i)}" class="legend__row-top" :title="getChartColor(i)"></div></td>
          <td><div class="text__show" :title="d.legend">{{d.legend}}</div></td>
          <td><div :title="d.aggregation.avg" class="legend__row-left">{{d.aggregation.avg}}</div></td>
          <td><div :title="d.aggregation.max" class="legend__row-right">{{d.aggregation.max}}</div></td>
        </tr>
      </table>
    </div>
  </div>

</template>

<script>
import { getChartColor } from '@/components/charts/chart-options'
import {chartColor} from "./chart-options";
export default {
  name: 'StatisticsLegend',
  props: {
    data: Array
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler (n) {
        console.log(n)
      }
    }
  },
  setup () {
    return {
      getChartColor,
      chartColor }
  }
}

</script>
<style scoped>
.chart__legend{
  width: 455px;
  height: 111px;
  border: 1px solid #E7EAED;
  font-size: 10px;
  color:#5f6368;
  margin: auto;
}
.text__show{
  width: 50px;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.charts__table-top{
  position: relative;
  width: 455px;
  height: 30px;
  border-bottom: #E7EAED 0.96px solid;
}
.location{
  position: absolute;
  right: 138px;
  top: -9px;
  font-family: Roboto-Regular;
  font-size: 14px;
  color: #0091FF;
  font-weight: 400;
}
.locations{
  position: absolute;
  right: 29px;
  top: -8px;
  font-family: Roboto-Regular;
  font-size: 14px;
  color: #0091FF;
  font-weight: 400;
}
.legend__row-top{
  width: 17px;
  height: 7px;
  border-radius: 24%;
  margin-left: 15px;
}
.legend__table {
  overflow: auto;
  height: calc(100% - 30px)
}
.legend__row{
  font-size: 12px;
  box-sizing: border-box;
}
.legend__row:hover {
  background-color: #f9f9f9;
  border: 0px;
  color: #383838;
}
.legend__row-right{
margin-left: 60px;
}
.legend__row-left{
  margin-left: 178px;
}
</style>
