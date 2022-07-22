<template>
  <panel-chart-list
      :time-filter="timeFilter"
      :query-params="queryParams"
      :data-list="dataList"
      :panel-lock="true"
      :entity="entity"
      :need-timeout="true"
  >
  </panel-chart-list>
</template>

<script>
import chartMixin from '@/views/charts/charts/chart-mixin'
import _ from 'lodash'
import { ref } from 'vue'

export default {
  name: 'ChartGroup',
  mixins: [chartMixin],
  props: {
    timeFilter: Object,
    queryParams: Object
  },
  methods: {
    reload () {
      const t = _.cloneDeep(this.dataList)
      this.dataList = []
      this.$nextTick(() => {
        this.dataList = t
      })
    }
  },
  setup (props) {
    const dataList = ref([...props.chartInfo.children])
    return {
      dataList
    }
  }
}
</script>
