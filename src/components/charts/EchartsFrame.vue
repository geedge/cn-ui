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
    <div class="cn-chart__body">
      <slot></slot>
    </div>
    <div class="cn-chart__footer" v-if="layout.indexOf(layoutConstant.FOOTER) > -1">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import { layoutConstant } from '@/components/charts/chart-options'

export default {
  name: 'EchartsFrame',
  props: {
    layout: Array
  },
  setup () {
    return {
      layoutConstant
    }
  },
  mounted () {
  }
}
</script>

<style>

</style>