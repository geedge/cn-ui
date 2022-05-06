<template >
  <div class="entity-filter-case">
    <div class="filter-case__header">{{$t('entities.filter')}}</div>
    <div
        class="entity-filter"
        v-for="(filter, index) in filterData"
        :key="index"
    >
      <div class="filter__header">{{filter.title}}</div>
      <div class="filter__body">
        <div class="filter__row" v-for="(item, i) in filter.data" :key="i"  @click="showTopDialog(i, item, filter)"  :ref="'entityTopTen' + i + filter.type">
          <div class="row__label">
            <i :class="item.icon"></i>
              <span>{{item.label}}</span>
          </div>
          <div class="row__value">
            <loading :loading="loadingLeft"></loading>
            <span>{{item.value}}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 自定义table列 -->
    <transition name="el-zoom-in-top">
      <entity-top
          :style="location"
          v-show="showTopTen"
          ref="entityTopTenPop"
          :loading="loading"
          @filter="filter"
          @close="showTopTen = false"
      ></entity-top>
    </transition>

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
      showTopTen: false, // 自定义列弹框是否显示
      entityTopTenData: [],
      location: {
        top: 0,
        left: 0
      },
      currentColumn: '',
      loading: false
    }
  },
  methods: {
    showTopDialog (i, item, filter) {
      this.currentColumn = item.column
      const type = filter.type
      this.location.left = '17.5rem'
      const offsetTop = this.$refs['entityTopTen' + i + filter.type].offsetTop
      this.location.top = offsetTop + 'px'
      this.showTopTen = true
      const queryParams = {
        q: this.q,
        entityType: type,
        column: item.topColumn,
        top: 10,
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000)
      }
      this.loading = true
      get(api.filterTop, queryParams).then(response => {
        if (response.code === 200) {
          console.info(this.currentColumn, item.column)
          if (this.currentColumn === item.column) {
            this.$refs.entityTopTenPop.initEntityTop(item, response.data.result, filter.totalCount)
          }
        } else {
          this.$refs.entityTopTenPop.initEntityTop(item, [], filter.totalCount)
        }
        this.loading = false
      }).catch(e => {
        this.$refs.entityTopTenPop.initEntityTop(item, [], filter.totalCount)
        this.loading = false
      })
    },
    filter (name, topData) {
      this.showTopTen = false
      this.$emit('filter', name, topData)
    }
  }
}
</script>
