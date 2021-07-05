<template>
  <div class="cn-chart cn-chart__single-value" :class="singleValueClass(type)">
    <div class="single-value-icon__box">
      <div class="single-value__icon"><i class="el-icon-apple"></i></div>
    </div>
    <div class="single-value__content" v-if="type === 51">
      <div class="content__data">
        <slot name="data"></slot>
      </div>
      <div class="content__title">
        <slot name="title"></slot>
      </div>
    </div>
    <div class="single-value__content" v-if="type === 53">
      <div class="content__title">嘻嘻</div>
      <div class="content__data">11112</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartSingleValue',
  props: {
    type: Number
  },
  computed: {
    singleValueClass () {
      return function (type) {
        let c
        switch (type) {
          case 51: {
            c = 'cn-chart__single-value--icon-left'
            break
          }
          case 52: {
            c = 'cn-chart__single-value--chart'
            break
          }
          case 53: {
            c = 'cn-chart__single-value--icon-right'
            break
          }
          default: break
        }
        return c
      }
    }
  }
}
</script>

<style>

</style>
