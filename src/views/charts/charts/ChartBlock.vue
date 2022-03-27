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

export default {
  name: 'ChartBlock',
  mixins: [chartMixin],
  data () {
    return {
      time: {},
      firstShow: false
    }
  },
  mounted () {
    this.firstShow = true
  },
  methods: {
    reload () {
      this.dataList = _.cloneDeep(this.dataList)
    }
  },
  setup (props) {
    const copyAndSort = dataList => {
      const list = _.cloneDeep(dataList)
      return list.sort((data1, data2) => {
        return data1.x - data2.x
      })
    }
    const dataList = copyAndSort(props.chartInfo.children)
    return {
      copyAndSort,
      dataList
    }
  }
}
</script>
