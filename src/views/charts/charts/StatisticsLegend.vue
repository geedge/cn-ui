<template>
  <div class="chart__legend">
    <div class="chart__table-top table-below-box">
      <div class="table__below-color"></div>
      <div class="table__below-title">Name</div>
      <div class="table__below-statistics">Avg</div>
      <div class="table__below-statistics">Max</div>
      <div class="table__below-statistics">P50</div>
      <div class="table__below-statistics">P90</div>
    </div>
    <div class="chart__table-below">
      <div v-for="(item, index) in data" :key="index" class="table-below-box" :class="{'table-below-box--inactivated': !item.active}" @click="toggleLegend(index)">
        <div class="table__below-color"><div :style="{backgroundColor: getChartColor(index)}"></div></div>
        <div class="table__below-title" :title="item.legend">{{item.legend}}</div>
        <div class="table__below-statistics" :title="item.aggregation.avg">{{valueToRangeValue(item.aggregation.avg, chartInfo.params.unitType).join(' ')}}</div>
        <div class="table__below-statistics" :title="item.aggregation.max">{{valueToRangeValue(item.aggregation.max, chartInfo.params.unitType).join(' ')}}</div>
        <div class="table__below-statistics" :title="item.aggregation.p50">{{valueToRangeValue(item.aggregation.p50, chartInfo.params.unitType).join(' ')}}</div>
        <div class="table__below-statistics" :title="item.aggregation.p90">{{valueToRangeValue(item.aggregation.p90, chartInfo.params.unitType).join(' ')}}</div>
      </div>
    </div>
  </div>

</template>

<script>
import { getChartColor } from '@/views/charts/charts/tools'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
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
      unitConvert,
      valueToRangeValue
    }
  }
}

</script>
