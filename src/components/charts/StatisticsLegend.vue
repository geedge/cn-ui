<template>
  <div class="chart__legend">
    <div class="chart__table-top">
    <div class="chart__table-box">
      <div>Average</div>
      <div>Maximum</div>
    </div>
    </div>
    <div class="chart__table-below">
      <div v-for="(item,index) in data" :key="index" class="table-below-box">
        <div class="table-below-account">
        <div :style="{backgroundColor: getChartColor(index)}" class="table__below-color" :title="getChartColor(index)"></div>
        <div class="table__below-title" :title="item.legend">{{item.legend}}</div>
        </div>
        <div class="table__below-flashback">
          <div class="table__below-max qq"  :title="item.aggregation.max">{{item.aggregation.max}}</div>
          <div class="table__below-avg qq" :title="item.aggregation.avg">{{item.aggregation.avg}}</div>
        </div>
      </div>
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
      }
    }
  },
  setup () {
    return {
      getChartColor,
      chartColor
    }
  }
}

</script>
<style lang="scss" scoped>
.chart__legend{
  width: 455px;
  height: 111px;
  border: 1px solid #E7EAED;
  font-size: 10px;
  color:#5f6368;
  margin: auto;
}
.chart__table-top{
  width: 455px;
  height: 30px;
  border-bottom: #E7EAED 0.96px solid;
  display: flex;
  flex-direction:row-reverse;
  .chart__table-box{
    width: 185px;
    height: 30px;
    display: flex;
    align-items: center;
    font-family: Roboto-Regular;
    font-size: 14px;
    color: #0091FF;
    font-weight: 400;
    justify-content: space-around;
  }
}
.chart__table-below{
  width: 455px;
  height: calc(100% - 30px);
  overflow: auto;
  .table-below-box{
    width: 100%;
    display: flex;
    font-size: 15px;
    align-items: center;
    .table-below-account{
      width: 310px;
      display: flex;
      align-items: center;
      padding-left: 16px;
    }
    .table__below-flashback{
      width: 211px;
      display: flex;
      flex-direction:row-reverse;
      align-items: center;
      justify-content: space-around;
    }
  }
  .table-below-box:hover{
    background-color: #f9f9f9;
    border: 0;
    color: #383838;
  }
  .table__below-color{
    width: 17px;
    height: 7px;
    border-radius: 24%;
  }
  .table__below-title{
    max-width: 226px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .qq{
    width: 39px;
  }
}
</style>
