<template>
  <div class="cn-chart cn-chart__single-value" :class="singleValueClass(type)">
    <div class="single-value-icon__box">
      <div class="single-value__icon"><i :class="icon"></i></div>
    </div>
    <div class="single-value__content" v-if="type === 51">
      <div class="content__data">
        <slot name="data"></slot>
      </div>
      <div class="content__title">
        <slot name="title"></slot>
      </div>
    </div>
    <div class="single-value__content" v-if="type === 52">
      <div class="content__title">
        <slot name="title"></slot>
      </div>
      <div class="content__data">
        <slot name="data"></slot>
      </div>
      <div class="content__chart">
        <slot name="chart"></slot>
      </div>
    </div>
    <div class="single-value__content" v-if="type === 53">
      <div class="content__title"></div>
      <div class="content__data"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartSingleValue',
  props: {
    type: Number,
    icon: String
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
