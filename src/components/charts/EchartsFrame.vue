<template>
  <div class="cn-chart cn-chart__echarts" :class="{'cn-chart__echarts--statistics': isEchartsWithStatistics}">
    <div class="cn-chart__header" v-if="layout.indexOf(layoutConstant.HEADER) > -1">
      <div class="header__title">
        <slot name="title"></slot>
      </div>
      <div class="header__operations">
        <slot name="operations"></slot>
      </div>
    </div>
    <div class="cn-chart__body" :class="{'pie-with-table': isPieWithTable}" v-loading="loading" v-no-data="noData">
      <slot></slot>
    </div>
    <div class="cn-chart__footer" v-if="layout.indexOf(layoutConstant.FOOTER) > -1 && !noData" :class="{'pie-with-table': isPieWithTable}" v-loading="loading">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import { layoutConstant, isEchartsWithTable, isEchartsWithStatistics } from '@/components/charts/chart-options'
export default {
  name: 'EchartsFrame',
  props: {
    layout: Array,
    chartInfo: Object,
    loading: Boolean,
    noData: Boolean
  },
  setup (props) {
    return {
      layoutConstant,
      isPieWithTable: isEchartsWithTable(props.chartInfo.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chartInfo.type)
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss" scoped>
.cn-panel .cn-chart__echarts {
  .cn-chart__body.pie-with-table {
    flex-basis: 40%;
  }
  .cn-chart__footer.pie-with-table {
    flex-basis: 60%;
    padding: 10px 30px 30px;
  }
}
</style>
