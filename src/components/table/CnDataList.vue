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
<!--           <el-input v-model="keyWord" value="keyWord"></el-input>
            <el-button @click="onsearch" icon="el-icon-search" type="info" size="mini" style="margin-right: 10px"></el-button>-->
            <div v-if="showLayout.indexOf('search') > -1" class="top-tool-search" :class="{'margin-r-20': from !== fromRoute.builtinReport}">
              <div style="display: flex">
                <el-input
                    v-model="keyWord"  size="small" @keyup.enter="onsearch"></el-input>
<!--                <el-button icon="el-icon-search" @click="onsearch" size="small"></el-button>-->
                <button   class="top-tool-btn" style="border-radius: 0px"
                        type="button" @click="onsearch">
                  <i class="el-icon-search"></i>
                </button>
              </div>
            </div>
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
      keyWord: '',
      fromRoute: fromRoute,
      tools: {
        showCustomTableTitle: false // 自定义列弹框是否显示
      },
      showLayout: []
    }
  },
  methods: {
    updateCustomTableTitle (custom) {
      this.$emit('update:customTableTitle', custom)
    },
    onsearch () {
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
