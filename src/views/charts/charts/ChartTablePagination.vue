<template>
  <el-pagination
      small
      ref="pagination"
      layout="prev,jumper,slot,next"
      class="chart-table-pagination"
      :total="total"
      :page-size="pageSize"
      v-model:currentPage="pageNo"
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
    total: Number,
    pageSizeForAlarm: Number
  },
  data () {
    return {
      pageSize: this.pageSizeForAlarm ? this.pageSizeForAlarm : chartTableDefaultPageSize,
      pageNo: 1
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
  watch:{
    pageSizeForAlarm:{
      deep:true,
    },
    total:{
      deep:true,
    }
  },
  methods: {
    current (val) {
      this.$emit('pageJump', val)
    },
    resetPageNo () {
      this.pageNo = 1
    }
  },
  mounted () {
    const _this = this
    this.emitter.on('chart-pageNo', function () {
      _this.resetPageNo()
    })
    this.$el.querySelector('.el-pagination__jump').childNodes[0].nodeValue = ''
  }
}
</script>
