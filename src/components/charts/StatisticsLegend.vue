<template>
  <div class="chart__legend">
    <div class="chart__table-top table-below-box">
      <div class="table__below-color"></div>
      <div class="table__below-title">Name</div>
      <div class="table__below-statistics">Avg</div>
      <div class="table__below-statistics">Max</div>
    </div>
    <div class="chart__table-below">
      <div v-for="(item, index) in data" :key="index" class="table-below-box" :class="{'table-below-box--inactivated': !item.active}" @click="toggleLegend(index)">
        <div class="table__below-color"><div :style="{backgroundColor: getChartColor(index)}"></div></div>
        <div class="table__below-title" :title="item.legend">{{item.legend}}</div>
        <div class="table__below-statistics" :title="item.aggregation.avg">{{unitConvert(item.aggregation.avg, chartInfo.params.unitType).join(' ')}}</div>
        <div class="table__below-statistics" :title="item.aggregation.max">{{unitConvert(item.aggregation.max, chartInfo.params.unitType).join(' ')}}</div>
      </div>
    </div>
  </div>

</template>

<script>
import { getChartColor } from '@/components/charts/chart-options'
import unitConvert from '@/utils/unit-convert'
export default {
  name: 'StatisticsLegend',
  props: {
    data: Array,
    chartInfo: Object
  },
  methods: {
    toggleLegend (index) {
      this.$emit('toggleLegend', index)
    }
  },
  setup () {
    return {
      getChartColor,
      unitConvert
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

  div {
    font-size: 13px;
    line-height: 28px;
    color: $--color-primary;
  }
}
.chart__table-below {
  width: 100%;
  font-size: 13px;
}
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
.table-below-box:not(.chart__table-top) {
  cursor: pointer;
}
.table-below-box.table-below-box--inactivated {
  color: #ccc;
  .table__below-color div {
    background-color: #ccc !important;
  }
}
</style>
