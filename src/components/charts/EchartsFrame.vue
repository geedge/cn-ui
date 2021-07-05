<template>
  <div class="cn-chart cn-chart__echarts">
    <div class="cn-chart__header" v-if="layout.indexOf(layoutConstant.HEADER) > -1">
      <div class="header__title">
        <slot name="title"></slot>
      </div>
      <div class="header__operations">
        <slot name="operations"></slot>
      </div>
    </div>
    <div class="cn-chart__body" :class="{'pie-with-table': isPieWithTable}">
      <slot></slot>
    </div>
    <div class="cn-chart__footer" v-if="layout.indexOf(layoutConstant.FOOTER) > -1" :class="{'pie-with-table': isPieWithTable}">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import { layoutConstant, isEchartsWithTable } from '@/components/charts/chart-options'
export default {
  name: 'EchartsFrame',
  props: {
    layout: Array,
    chartInfo: Object
  },
  setup (props) {
    return {
      layoutConstant,
      isPieWithTable: isEchartsWithTable(props.chartInfo.type)
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
.cn-panel .cn-chart__echarts .pie-with-table{
  flex: 1;
  padding: 10px 40px 30px;
}
</style>
