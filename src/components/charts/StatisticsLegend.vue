<template>
  <div class="chart__legend"></div>
</template>

<script>
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
        // console.info(n)
      }
    }
  }
}
</script>

<style scoped>

</style>