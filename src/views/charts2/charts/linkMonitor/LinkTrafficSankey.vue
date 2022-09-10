<template>
  <div class="link-traffic-sankey">
    <el-tabs v-model="tab">
      <el-tab-pane :label="$t('linkMonitor.ingress')" :name="0"></el-tab-pane>
      <el-tab-pane :label="$t('linkMonitor.egress')" :name="1"></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ChartNoData from '@/views/charts/charts/ChartNoData'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'LinksTrafficSankey',
  mixins: [chartMixin],
  components: {
    ChartNoData
  },
  data () {
    return {
      tab: 0
    }
  },
  mounted () {
    this.toggleLoading(false)
  }
}
</script>
