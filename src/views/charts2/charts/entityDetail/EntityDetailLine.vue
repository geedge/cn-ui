<template>
  <div style="border: 1px solid #ff5500; height: 100%;">{{entity}}</div>
</template>

<script>

import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'EntityDetailLine',
  mixins: [chartMixin],
  mounted () {
    this.toggleLoading(false)
  }
}
</script>
