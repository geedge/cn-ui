<template>
 <div class="link-traffic-line">
  <link-traffic-drill-down-list
    :chart="chart"
    :time-filter="timeFilter">
  </link-traffic-drill-down-list>
  <link-traffic-drill-down-line
    :chart="chart"
    :time-filter="timeFilter"
  >
  </link-traffic-drill-down-line>
 </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import linkTrafficDrillDownLine from '@/views/charts2/charts/linkMonitor/localComponents/LinkTrafficDrillDownLine'
import LinkTrafficDrillDownList from '@/views/charts2/charts/linkMonitor/localComponents/LinkTrafficDrillDownList'

export default {
  name: 'LinkTrafficLine',
  mixins: [chartMixin],
  components: {
    linkTrafficDrillDownLine,
    LinkTrafficDrillDownList
  },
  data () {
    return {
    }
  }
}
</script>
