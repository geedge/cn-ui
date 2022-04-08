<template>
  <panel-chart-list
      :time-filter="timeFilter"
      :query-params="queryParams"
      :data-list="dataList"
      :panel-lock="true"
      :entity="entity"
  >
  </panel-chart-list>
</template>

<script>
import chartMixin from '@/views/charts/charts/chart-mixin'
import _ from 'lodash'

export default {
  name: 'ChartGroup',
  mixins: [chartMixin],
  props: {
    timeFilter: Object,
    queryParams: Object
  },
  methods: {
    reload () {
      this.dataList = _.cloneDeep(this.dataList)
    }
  },
  setup (props) {
    const dataList = [...props.chartInfo.children]
    return {
      dataList
    }
  }
}
</script>
