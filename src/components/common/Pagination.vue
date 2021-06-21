<style lang="scss" scoped>
    .pagination {
        padding-top: 8px;
        text-align: center;
        max-height: 42px;
    }
    .pagination-top .pagination {
        padding-top: 0;
    }
    .pagination  :deep(.el-pagination) {
        max-height: 42px;
        padding-right: 0;
    }
    .pagination-size-select :deep(.el-input--mini .el-input__inner){
        height: 20px;
        line-height: 20px;
        margin: 5px 0 5px 5px;
    }
    .pagination-size-select input{

    }
    :deep(.el-pager li), :deep(.el-pagination .btn-next),:deep( .el-pagination .btn-prev ){
        margin:5px 5px 0px 5px;
        padding: 0 4px;
        font-size: 13px;
        min-width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        border: 1px solid rgba(154,154,154,0.20);
        border-radius: 2px;
    }
    :deep(.el-pagination .el-pager li.btn-quicknext), :deep( .el-pager li.btn-quickprev) {
        line-height: 20px;
    }
    :deep(.el-pagination .el-pager .more::before ){
        line-height: 20px;
    }
    :deep( .el-pagination .el-pager .more) {
        background-color: $--content-right-background-color;
    }
    .btn-next, .btn-prev {
        background-color: $--content-right-background-color !important;
    }
    .pagination input {
        background-color: $--content-right-background-color !important;
    }
    :deep(.el-pager li.number){
        font-family: NotoSansSC-Regular;
        color: #666666;
        letter-spacing: 0;
        font-weight:normal;
        background-color: $--content-right-background-color;
    }
    :deep( .el-pager li.number.active){
        font-family: NotoSansSC-Regular;
        color: #FFFFFF;
        letter-spacing: 0;
    }

    :deep( .el-pagination .el-pager li.active) {
        background-color: $--color-primary;
        border-radius: 2px;
        border-radius: 2px;
    }
    :deep( .el-pager li:hover, .el-pagination .btn-next:hover, .el-pagination .btn-prev:hover) {
        font-family: NotoSansSC-Regular;
        color: #666666;
        letter-spacing: 0;
        font-weight:normal;
    }
    :deep( .el-pagination__sizes .el-input .el-input__inner),:deep( .el-pagination__editor.el-input .el-input__inner){
        height: 20px;
        border-color: rgba(154,154,154,0.20);
    }
    :deep(.el-pagination__sizes .el-input .el-input__inner:hover){
        border-color: rgba(154,154,154,0.20);
    }
</style>

<template>
  <div class="pagination">
      <el-pagination
        ref="page"
        @size-change="size"
        @prev-click="prev"
        @next-click="next"
        @current-change="current"
        :current-page="pageObj.pageNo"
        :page-sizes="pageSizes?pageSizes:[20, 50, 100]"
        :page-size="Number(pageObj.pageSize)"
        layout="total, prev, pager, next, slot"
        :total="pageObj.total"
      >
        <el-select v-model="pageSize" :placeholder="pageSize+$t('pageSize')" size="mini"  :popper-append-to-body="appendToBody" class="pagination-size-select" @change="size" :popper-class="popClass" @visible-change="popperVisible">
          <el-option v-for="(item, index) in pageSizes" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>

      </el-pagination>
  </div>
</template>

<script>
import { defaultPageSize } from '@/utils/constants'

export default {
  name: 'pagination',
  // props: ['pageObj', 'tableId', 'postPageSizes'],
  props: {
    pageObj: {},
    tableId: {},
    postPageSizes: {},
    appendToBody: { default: true },
    popClass: {}
  },
  data () {
    return {
      pageSize: defaultPageSize,
      pageSizes: [
        {
          label: '20' + this.$t('pageSize'),
          value: 20
        },
        {
          label: '50' + this.$t('pageSize'),
          value: 50
        },
        {
          label: '100' + this.$t('pageSize'),
          value: 100
        }
      ]
    }
  },
  methods: {
    popperVisible: function (visible) {
      if (visible == true) {
        this.$nextTick(() => {
          if (this.popClass && this.popClass === 'out-popper-fix') {
            const popDoms = document.querySelectorAll('.out-popper-fix')
            popDoms.forEach(item => {
              item.style.bottom = item.style.top
              item.style.top = 'unset'

              const icon = item.querySelector('.popper__arrow')
              if (icon) {
                icon.style.bottom = icon.style.top
                icon.style.top = 'unset'
                icon.style.transform = 'rotate(180deg)'
              }
            })
          }
        })
      }
    },
    background () {
      this.backgroundColor()
    },
    // 点击上一页箭头
    prev () {
      this.backgroundColor()
      this.scrollbarToTop()
    },
    // 点击下一页箭头
    next (val) {
      this.backgroundColor()
      this.scrollbarToTop()
    },
    // currentPage 改变时会触发
    current (val) {
      this.$emit('pageNo', val)
      this.backgroundColor()
      this.scrollbarToTop()
    },
    size (val) {
      // eslint-disable-next-line vue/no-mutating-props
      this.pageObj.pageNo = 1
      this.$emit('pageSize', val)
      this.backgroundColor()
    },
    scrollbarToTop () {
      this.$nextTick(() => {
        const wraps = document.querySelectorAll('.el-table__body-wrapper')
        wraps.forEach(wrap => {
          if (wrap._ps_) {
            wrap.scrollTop = 0
          }
        })
      })
    },
    resetPageSizes: function () {
      if (this.postPageSizes) {
        this.pageSizes = this.postPageSizes.map((item) => {
          return { label: item + this.$t('pageSize'), value: item }
        })
      }
    },
    // 设置当前页的样式
    backgroundColor () {
      this.list = this.$refs.page.$el.children[2].children
      for (let i = 0; i < this.list.length; i++) {
        // const element = this.list[i]
      }
    }
  },
  mounted () {
    if (this.postPageSizes && this.postPageSizes.length > 0) {
      this.pageSize = this.postPageSizes[0]
      this.resetPageSizes()
    } else {
      const pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId)
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageSize = parseInt(pageSize)
      }
    }
  },
  watch: {
    postPageSizes: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.resetPageSizes()
      }
    },
    popClass: {
      immediate: true,
      handler (n, o) {
      }
    },
    pageObj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        // console.log(n)
      }
    }
  }
}
</script>
