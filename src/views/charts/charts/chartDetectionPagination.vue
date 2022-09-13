<template>
  <div>
    <loading :loading="loading"></loading>
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
import { ref, shallowRef } from 'vue'
import { parseInt } from 'lodash'
import Loading from '@/components/common/Loading'
export default {
  name: 'chartDetectionPagination',
  props: {
    pageObj: Object,
  },
  components: {
    Loading
  },
  data() {
    return {
      initNum: -1,
      loading: false,
      timer: null
    }
  },
  setup () {
    const { query } = useRoute()
    const pageNo = ref(query.expandPaginaTionPage || 1)
    return {
      pageNo
    }
  },
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
      this.pageObj.pageNo = val
      this.$emit('pageJump', val)

      let newParam = {
        expandPaginaTionPage: val,
      }
      const { query } = this.$route
      let newUrl = urlParamsHandler(window.location.href, query, newParam)
      overwriteUrl(newUrl)
    },
    initData() {
        let pageNo = this.pageNo;
        this.timer = setTimeout(() => {
          this.currentChange(parseInt(pageNo));
        }, 500);
        
    },
  },
  mounted() {
    this.$el.querySelector('.el-pagination__jump').childNodes[0].nodeValue = ''

    this.initNum = this.initNum+1;
    if(this.initNum === 0) {
      this.$nextTick(()=>{
        this.initData()
      })
    }
  },
  beforeDestroy(to, from, next) {
    clearTimeout(this.timer);
  }
}
</script>
