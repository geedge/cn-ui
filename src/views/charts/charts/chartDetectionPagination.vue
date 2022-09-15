<template>
  <div>
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
  </div>  
</template>

<script>
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { parseInt } from 'lodash'
export default {
  name: 'chartDetectionPagination',
  props: {
    pageObj: Object
  },
  data () {
    return {
      initFlag: false,
      timer: null
    }
  },
  setup () {
    const { query } = useRoute()
    const pageNo = ref(query.expandPage || 1)
    return {
      pageNo
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
    /**
     * 当前页改变
     */
    currentChange: function (val) {
      if (this.pageObj.pageNo === 1) {
        this.initFlag = true
      }
      if (this.initFlag) {
        this.pageObj.pageNo = val
        this.$emit('pageJump', val)

        const newParam = {
          expandPage: val
        }
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, newParam)
        overwriteUrl(newUrl)
      }
      this.initFlag = true
    }
  },
  mounted () {
    this.$el.querySelector('.el-pagination__jump').childNodes[0].nodeValue = ''
  }
}
</script>
