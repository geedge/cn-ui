<template>
  <panel-chart-list
      :time-filter="timeFilter"
      :data-list="dataList"
      :panel-lock="true"
      :entity="entity"
  >
  </panel-chart-list>
</template>

<script>
import chartMixin from '@/views/charts/charts/chart-mixin'
import _ from 'lodash'
import { ref } from 'vue'

export default {
  name: 'ChartBlock',
  mixins: [chartMixin],
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
    const copyAndSort = dataList => {
      const list = _.cloneDeep(dataList)
      return list.sort((data1, data2) => {
        return data1.x - data2.x
      })
    }
    const dataList = ref(copyAndSort(props.chartInfo.children))
    return {
      copyAndSort,
      dataList
    }
  }
}
</script>
