<template>
  <div :class="from" class="list-page">
    <!-- 主页面 -->
    <div class="main-list">
      <!-- 顶部工具栏 -->
      <div class="main-container">
        <div class="top-tools">
          <div class="top-tool-left" style="min-width: 300px">
            <slot name="top-tool-left"></slot>
          </div>
          <div class="top-tool-right">
            <div v-if="showLayout.indexOf('searchInput') > -1" class="top-tool-search margin-r-20"></div>
            <slot name="top-tool-right"></slot>
            <button v-if="showLayout.indexOf('elementSet') > -1"  class="top-tool-btn"
                    type="button" @click="tools.showCustomTableTitle = true">
              <i class="cn-icon-gear cn-icon"></i>
            </button>
          </div>
        </div>
        <div class="cn-table">
          <slot></slot>
        </div>
        <div class="cn-pagination">
          <slot name="pagination"></slot>
        </div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <column-customize
          v-if="tools.showCustomTableTitle"
          :tableId="tableId"
          ref="customTableTitle"
          :custom-table-title="customTableTitle"
          :original-table-title="tableTitle"
          @close="tools.showCustomTableTitle = false"
          @update="updateCustomTableTitle"
        ></column-customize>
      </transition>
    </div>
  </div>
</template>

<script>
import columnCustomize from '@/components/table/ColumnCustomize'
import { fromRoute } from '@/utils/constants'

export default {
  name: 'cnDataList',
  components: {
    columnCustomize
  },
  props: {
    from: {
      type: String,
      default: ''
    },
    tableId: {
      type: String
    },
    tableTitle: {
      type: Array
    },
    customTableTitle: {
      type: Array
    },
    layout: {
      type: Array,
      default () { return [] }
    }
  },
  data () {
    return {
      fromRoute: fromRoute,
      tools: {
        showCustomTableTitle: false // 自定义列弹框是否显示
      },
      showLayout: [],
      value1: 1623997984000
    }
  },
  methods: {
    updateCustomTableTitle (custom) {
      this.$emit('update:customTableTitle', custom)
    }
  },
  watch: {
    layout: {
      immediate: true,
      deep: true,
      handler (n) {
        this.showLayout = [...n]
      }
    }
  }
}
</script>
