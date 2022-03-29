<template>
  <el-pagination
      small
      ref="pagination"
      :current-page="pageObj.pageNo"
      :page-size="pageObj.pageSize"
      layout="total,prev,jumper,slot,next"
      class="chart-table-pagination"
      :total="pageObj.total"
      @current-change="currentChange"
  >
    <span>/&nbsp;{{totalPage}}</span>
  </el-pagination>
</template>

<script>
export default {
  name: 'chartDetectionPagination',
  props: {
    pageObj: Object
  },
  data () {
    return {

    }
  },
  computed: {
    totalPage () {
      const remainder = this.pageObj.total % this.pageObj.pageSize
      if (remainder) {
        return parseInt(this.pageObj.total / this.pageObj.pageSize) + 1
      } else {
        return parseInt(this.pageObj.total / this.pageObj.pageSize)
      }
    }
  },
  methods: {
    currentChange: function (val) {
      this.$emit('pageJump', val)
      this.pageObj.pageNo = val
    }
  },
  mounted () {
    this.$el.querySelector('.el-pagination__jump').childNodes[0].nodeValue = ''
  }
}
</script>
