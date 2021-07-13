<template>
  <div class="chart__legend">
    <div class="chart__table-top">
      <div>Average</div>
      <div>Maximum</div>
    </div>
    <div class="chart__table-below">
      <div v-for="(item,index) in data" :key="index" class="table-below-box">
        <div class="table__below-color"><div :style="{backgroundColor: getChartColor(index)}"></div></div>
        <div class="table__below-title" :title="item.legend">{{item.legend}}</div>
        <div class="table__below-statistics" :title="item.aggregation.max">{{item.aggregation.max}}</div>
        <div class="table__below-statistics" :title="item.aggregation.avg">{{item.aggregation.avg}}</div>
      </div>
    </div>
  </div>

</template>

<script>
import { getChartColor } from '@/components/charts/chart-options'
import { chartColor } from './chart-options'
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
  width: calc(100% - 40px);
  border: 1px solid #E7EAED;
  color: #5f6368;
  margin: auto;
  margin-bottom: 15px;
}
.chart__table-top {
  width: 100%;
  height: 30px;
  border-bottom: #E7EAED 1px solid;
  display: flex;
  justify-content: flex-end;
  padding-right: 15px;

  div {
    width: 80px;
    font-size: 13px;
    line-height: 28px;
    color: $--color-primary;
  }
}
.chart__table-below {
  width: 100%;
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
    min-width: 200px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .table__below-statistics {
    width: 80px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
