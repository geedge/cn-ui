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
        :layout="layout"
        :total="pageObj.total"
        v-bind="bind"
    >
      <el-select v-model="pageSize" :placeholder="pageSize+$t('pageSize')" size="mini"
                 :popper-append-to-body="appendToBody" class="pagination-size-select" @change="size"
                 :popper-class="popClass" @visible-change="popperVisible">
        <el-option v-for="(item, index) in pageSizes" :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>

    </el-pagination>
  </div>
</template>

<script>
import { defaultPageSize, storageKey } from '@/utils/constants'

import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { parseInt } from 'lodash'

export default {
  name: 'pagination',
  // props: ['pageObj', 'tableId', 'postPageSizes'],
  props: {
    pageObj: {},
    tableId: {},
    postPageSizes: {},
    appendToBody: { default: true },
    popClass: {},
    layout: {
      type: String,
      default: 'total, prev, pager, next, slot'
    },
    bind: {
      type: Object,
      default: () => {}
    },
    storePageNoOnUrl: {
      type: Boolean,
      default: true
    }
  },
  /**
   * 添加vue3的setup，目的是添加/获取地址栏的参数
   */
  setup (props) {
    const { query } = useRoute()
    const pageSize = ref(defaultPageSize)
    const currentPageNo = ref(props.storePageNoOnUrl ? (query.pageNo || (props.pageObj.pageNo || 1)) : (props.pageObj.pageNo || 1))

    return {
      pageSize,
      currentPageNo
    }
  },
  data () {
    return {
      // pageSize: defaultPageSize,
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
    /**
     * 向地址栏添加/删除参数
     */
    reloadUrl (newParam, clean) {
      const { query } = this.$route
      let newUrl = urlParamsHandler(window.location.href, query, newParam)
      if (clean) {
        newUrl = urlParamsHandler(window.location.href, query, newParam, clean)
      }
      overwriteUrl(newUrl)
    },
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
      // this.currentPageNo = val;

      const newParam = {
        pageNo: val
      }
      this.reloadUrl(newParam)
    },
    /**
     * 更改页码大小
     */
    size (val) {
      // eslint-disable-next-line vue/no-mutating-props
      // this.pageObj.pageNo = 1
      this.$emit('pageSize', val)
      this.backgroundColor()

      const newParam = {
        pageSize: val
      }
      this.reloadUrl(newParam)
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
          return {
            label: item + this.$t('pageSize'),
            value: item
          }
        })
      }
    },
    // 设置当前页的样式
    backgroundColor () {
      // this.list = this.$refs.page.$el.children[2].children
      // for (let i = 0; i < this.list.length; i++) {
      //   // const element = this.list[i]
      // }
    }
  },
  mounted () {
    if (this.postPageSizes && this.postPageSizes.length > 0) {
      this.pageSize = this.postPageSizes[0]
      this.resetPageSizes()
    } else {
      const pageSize = localStorage.getItem(storageKey.pageSize + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId)
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageSize = parseInt(pageSize)
      }
    }

    this.currentPageNo = parseInt(this.currentPageNo)
    this.current(this.currentPageNo)
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
      }
    },
    tableData: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (n) {
          this.checkbox = n
        }
      }
    }
  }
}
</script>
