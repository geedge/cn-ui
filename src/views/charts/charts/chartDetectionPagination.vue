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
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import { useRoute } from 'vue-router'
import { ref, shallowRef } from 'vue'
export default {
  name: 'chartDetectionPagination',
  props: {
    pageObj: Object,
  },
  data() {
    return {
      newPageObj: {},
    }
  },
  // setup () {
  //   const { query } = useRoute()
  //   const pagination = ref(query.expandPaginaTionPage || 1)
  //   return {
  //     pagination
  //   }
  // },
  computed: {
    totalPage() {
      const remainder = this.pageObj.total % this.pageObj.pageSize
      if (remainder) {
        return parseInt(this.pageObj.total / this.pageObj.pageSize) + 1
      } else {
        return parseInt(this.pageObj.total / this.pageObj.pageSize)
      }
    },
  },
  methods: {
    /**
     * 当前页改变
     */
    currentChange: function(val) {
      this.$emit('pageJump', val)
      this.pageObj.pageNo = val

      sessionStorage.setItem('report_select_expand_pagination', JSON.stringify(val))

      let newParam = {
        expandPaginaTionPage: val,
      }
      const { query } = this.$route
      let newUrl = urlParamsHandler(window.location.href, query, newParam)
      overwriteUrl(newUrl)
    },
    initData() {
      let pageNo = sessionStorage.getItem('report_select_expand_pagination');
      if (pageNo != null) {
        pageNo = JSON.parse(pageNo)
        this.pageObj.pageNo = pageNo
        this.currentChange(pageNo, 'init')
      }
    },
  },
  mounted() {
    this.$el.querySelector('.el-pagination__jump').childNodes[0].nodeValue = ''

    this.$nextTick(() => {
      setTimeout(() => {
        this.initData()
      }, 100)
    })
  },
}
</script>
