<template>
  <el-pagination
      small
      layout="prev,jumper,slot,next"
      class="chart-table-pagination"
      :total="total"
      :page-size="pageSize"
      @current-change="current"
  >
    <span>/&nbsp;{{totalPage}}</span>
  </el-pagination>
</template>

<script>
import { chartTableDefaultPageSize } from '@/utils/constants'
export default {
  name: 'ChartTablePagination',
  props: {
    total: Number
  },
  data () {
    return {
      pageSize: chartTableDefaultPageSize
    }
  },
  computed: {
    totalPage () {
      const remainder = this.total % this.pageSize
      if (remainder) {
        return parseInt(this.total / this.pageSize) + 1
      } else {
        return parseInt(this.total / this.pageSize)
      }
    }
  },
  methods: {
    current (val) {
      this.$emit('pageJump', val)
    }
  },
  mounted () {
    this.$el.querySelector('.el-pagination__jump').childNodes[0].nodeValue = ''
  }
}
</script>

<style lang="scss">
.chart-table-pagination.el-pagination {
  padding: 12px 0 9px 0;
  text-align: center;

  .el-pagination__jump {
    margin-left: 10px;
  }
}
</style>
