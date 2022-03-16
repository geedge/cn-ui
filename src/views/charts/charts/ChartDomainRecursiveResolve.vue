<template>
  <div style="overflow-y: auto; height: 100%; color: #555; white-space: pre;">{{linuxLineSymbolConvert}}</div>
</template>

<script>
export default {
  name: 'ChartDomainRecursiveResolve',
  props: {
    chartInfo: Object,
    chartData: String,
    resultType: Object,
    queryParams: Object
  },
  computed: {
    linuxLineSymbolConvert () {
      return this.chartData ? this.chartData.replaceAll(/\n/g, '\r\n') : ''
    }
  }
}
</script>
