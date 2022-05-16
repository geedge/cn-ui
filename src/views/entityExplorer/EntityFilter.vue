<template >
  <div class="entity-filter-case">
    <div class="filter-case__header">{{$t('entities.filter')}}</div>
    <div
        class="entity-filter"
        v-for="(filters, index) in filterData"
        :key="index"
    >
      <div class="filter__header">{{filters.title}}</div>
      <div class="filter__body">

        <div class="filter__row" v-for="(item, i) in filters.data" :key="i">
          <el-popover popper-class="filter__row-popover" placement="right" :width="440" trigger="click" v-model:visible="item.showTopTen">
            <template #reference>
              <div class="filter__row-popover" @click="showTopDialog(i, item, filters)">
                <div class="row__label">
                  <i :class="item.icon"></i>
                  <span>{{item.label}}</span>
                </div>
                <div class="row__value">
                  <loading :loading="loadingLeft"></loading>
                  <span>{{item.value}}</span>
                </div>
              </div>
            </template>
            <entity-top
              ref="entityTopTenPop"
              :loading="loading"
              :popover-data="popoverData"
              :item-data="itemData"
              :total-count="totalCount"
              @filter="filter"
              @close="item.showTopTen = false"
            ></entity-top>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EntityTop from '@/components/entities/EntityTop'
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import Loading from '@/components/common/Loading'
export default {
  name: 'EntityFilter',
  components: {
    Loading,
    EntityTop
  },
  props: {
    filterData: Array,
    q: String,
    timeFilter: Object,
    loadingLeft: Boolean
  },
  data () {
    return {
      topList: 'list',
      topData: [],
      entityTopTenData: [],
      showTopTen: false, // 自定义列弹框是否显示
      currentColumn: '',
      loading: false,
      popoverData: [],
      itemData: {},
      totalCount: 0
    }
  },
  methods: {
    showTopDialog (i, item, filter) {
      this.currentColumn = item.column
      item.showTopTen = true
      const queryParams = {
        q: this.q,
        entityType: filter.type,
        column: item.topColumn,
        top: 10,
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000)
      }
      this.loading = true
      this.popoverData = []
      this.itemData = {}
      get(api.filterTop, queryParams).then(response => {
        if (response.code === 200) {
          if (this.currentColumn === item.column) {
            this.popoverData = response.data.result
            this.itemData = item
            this.totalCount = filter.totalCount
          }
        } else {
          this.popoverData = []
          this.itemData = item
          this.totalCount = filter.totalCount
        }
        this.loading = false
      }).catch(e => {
        this.popoverData = []
        this.itemData = item
        this.totalCount = filter.totalCount
        this.loading = false
      })
    },
    filter (name, topData) {
      topData.showTopTen = false
      this.$emit('filter', name, topData)
    }
  }
}
</script>
