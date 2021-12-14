<template>
  <div class="entity-list">
    <div class="entity__loading" v-show="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div class="entity-list__content">
      <!-- 列表式 -->
      <template v-if="listMode === 'list'">
        <div class="entity-list--list">
          <entity-row
              v-for="(data, index) in listData"
              :entity="data"
              :key="index"
          ></entity-row>
        </div>
      </template>
      <!-- 卡片式 -->
      <template v-else-if="listMode === 'block'">
        <div class="entity-list--block">
          <entity-card
              v-for="(data, index) in listData"
              :entity="data"
              :key="index"
          ></entity-card>
        </div>
      </template>
    </div>
    <div class="entity-list__pagination">
<!--      <el-pagination
              @size-change="size"
              @prev-click="prev"
              @next-click="next"
              @current-change="current"
              :currentPage="pageObj.pageNo"
              :page-size="pageObj.pageSize"
              :total="pageObj.total"
              layout="total, prev, pager, next"
      ></el-pagination>-->
    </div>
  </div>
</template>

<script>
import Card from '@/views/entityExplorer/entityList/Card'
import Row from '@/views/entityExplorer/entityList/Row'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import * as echarts from 'echarts'
import { getChartColor, entityListLineOption } from '@/components/charts/chart-options'
import { legendMapping } from '@/components/charts/chart-table-title'
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'

export default {
  name: 'EntityList',
  props: {
    listData: Array,
    from: String,
    pageObj: Object,
    loading: Boolean,
    listMode: String
  },
  components: {
    'entity-card': Card,
    'entity-row': Row
  },
  data () {
    return {
      showDetail: false,
      typeName: '',
      entityList: []
    }
  },
  methods: {
    size (val) {
      this.$emit('pageSize', val)
    },
    // 点击上一页箭头
    prev () {
      this.scrollbarToTop()
    },
    // 点击下一页箭头
    next () {
      this.scrollbarToTop()
    },
    // currentPage 改变时会触发
    current (val) {
      this.$emit('pageNo', val)
      this.scrollbarToTop()
    },
    scrollbarToTop () {
      this.$nextTick(() => {
        const wraps = document.querySelectorAll('.el-table__body-wrapper')
        wraps.scrollTop = 0
      })
    },
    entityDetail (params) {
      this.$emit('showDetail', { ...params, icon: this.iconClass })
    }
  }
}
</script>
