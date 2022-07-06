<template>
  <div class="cn-chart" style="background-color: lightgray;height: 100%;">
    <loading :loading="loading"></loading>
    <chart-no-data v-if="isNoData"></chart-no-data>
    <network-overview-line
      v-if="chart.type === typeMapping.networkOverview.line"
    ></network-overview-line>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { typeMapping } from '@/views/charts2/chart-tools'
import NetworkOverviewLine from '@/views/charts2/charts/NetworkOverviewLine';
export default {
  name: 'Chart',
  components: {
    Loading,
    ChartNoData,
    NetworkOverviewLine
  },
  props: {
    chart: Object
  },
  data () {
    return {
      typeMapping,
      loading: false,
      isNoData: false
    }
  }
}
</script>
