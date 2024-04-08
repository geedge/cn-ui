<template>
  <div :class="from" class="list-page">
    <!-- 主页面 -->
    <div class="main-list">
      <div class="main-container">
        <!-- 顶部工具栏 -->
        <div class="top-tools">
          <div class="top-tool-left">
            <slot name="top-tool-left"></slot>
            <div v-if="showLayout.indexOf('search') > -1" class="top-tool-search margin-r-20">
              <div class="top-tool-search__display">
                <el-input v-model="keyWord"  size="small" @keyup.enter="onSearch"></el-input>
                <button class="top-tool-btn top-tool-btn--search top-tool-btn__border" @click="onSearch">
                  <el-icon><Search /></el-icon>
                </button>
              </div>
            </div>
          </div>
          <div class="top-tool-right">
            <slot name="top-tool-right"></slot>
            <div  v-if="showLayout.indexOf('elementSet') > -1" class="btn-customize"  @click="tools.showCustomTableTitle = true">
              <i class="cn-icon-gear cn-icon icon-gear"></i> <span> {{$t('network.customize')}}</span>
            </div>
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
      keyWord: '',
      fromRoute: fromRoute,
      tools: {
        showCustomTableTitle: false // 自定义列弹框是否显示
      },
      showLayout: [],
      loading: true
    }
  },
  methods: {
    updateCustomTableTitle (custom) {
      this.$emit('update:customTableTitle', custom)
    },
    onSearch () {
      const params = {
        q: this.keyWord
      }
      this.$emit('search', params)
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
