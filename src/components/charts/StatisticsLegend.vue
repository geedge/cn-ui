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
        <div class="table__below-color"><div :style="{backgroundColor: getChartColor(index)}"></div></div>
        <div class="table__below-title" :title="item.legend">{{item.legend}}</div>
        <div class="table__below-statistics" :title="item.aggregation.max">{{item.aggregation.max}}</div>
        <div class="table__below-statistics table__below-statistics-2" :title="item.aggregation.avg">{{item.aggregation.avg}}</div>
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
.chart__legend {
  width: 455px;
  height: 95px;
  border: 1px solid #E7EAED;
  color:#5f6368;
  margin: auto;
}
.chart__table-top {
  width: 455px;
  height: 30px;
  border-bottom: #E7EAED 0.96px solid;
  display: flex;
  flex-direction:row-reverse;
  .chart__table-box {
    width: 185px;
    height: 30px;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #0091FF;
    font-weight: 400;
    justify-content: space-around;
  }
}
.chart__table-below {
  width: 455px;
  height: calc(100% - 30px);
  overflow: auto;
  font-size: 13px;

  .table-below-box {
    width: 100%;
    display: flex;
    align-items: center;
    line-height: 24px;
  }
  .table-below-box:hover {
    background-color: #f9f9f9;
    border: 0;
    color: #383838;
  }
  .table__below-color {
    width: 27px;
    height: 7px;
    flex-shrink: 0;
    padding-left: 10px;

    div {
      height: 100%;
      width: 100%;
      border-radius: 24%;
    }
  }
  .table__below-title {
    padding: 0 6px;
    flex-shrink: 1;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .table__below-statistics {
    width: 86px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .table__below-statistics-2 {
    width: 70px;
  }
}
</style>
