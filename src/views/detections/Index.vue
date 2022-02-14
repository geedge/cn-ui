<template>
  <div
      class="entity-explorer entity-explorer--show-list"
  >
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools">
      <DateTimeRange class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" ref="dateTimeRange" @change="reload"/>
      <TimeRefresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
    </div>
    <!-- 搜索组件 -->
    <detection-search
        ref="search"
        @search="search"
    ></detection-search>
    <!-- 内容区 -->
    <div class="explorer-container" style="height: calc(100% - 20px); flex-direction: column">
      <div class="detection__event-severity-bar"></div>
      <div style="display: flex; height: 100%;">
        <detection-filter
            :filter-data="filterData"
            :q="q"
            :time-filter="timeFilter"
            @filter="filter"
        ></detection-filter>
        <div class="detection__list">
          <div class="detection__list-statistics"></div>
          <detection-list
              :list-data="listData"
              :pageObj="pageObj"
              :time-filter="timeFilter"
              @pageSize="pageSize"
              @pageNo="pageNo"
              :loading="listLoading"
          ></detection-list>
        </div>
      </div>
      <div class="entity__pagination" style="position: absolute; bottom: 0; width: 100%;">
        <Pagination
            ref="pagination"
            :page-obj="pageObj"
            @pageNo='pageNo'
            @pageSize='pageSize'
            @size-change="pageSize"
            @prev-click="prev"
            @next-click="next"
        >
        </Pagination>
      </div>
    </div>
  </div>
</template>

<script>
import DetectionSearch from '@/views/detections/DetectionSearch'
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'
import TimeRefresh from '@/components/common/TimeRange/TimeRefresh'
import DetectionFilter from '@/views/detections/DetectionFilter'
import DetectionList from '@/views/detections/DetectionList'
import Pagination from '@/components/common/Pagination'
import { defaultPageSize } from '@/utils/constants'
import { getNowTime } from '@/utils/date-util'
import { ref } from 'vue'
export default {
  name: 'Index',
  components: {
    DetectionSearch,
    DateTimeRange,
    TimeRefresh,
    DetectionFilter,
    DetectionList,
    Pagination
  },
  data () {
    return {
      pageObj: {
        pageNo: 1,
        pageSize: defaultPageSize,
        total: 0
      },
      q: '',
      filterData: [],
      listData: [],
      listLoading: false
    }
  },
  methods: {
    timeRefreshChange () {
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      }
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
    },
    // methods
    dateTimeRangeChange (s, e, v) {
      this.timeFilter = { startTime: s, endTime: e, dateRangeValue: v }
    },
    search () {

    },
    filter () {

    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.search(this.metaList, this.q)
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.search(this.metaList, this.q)
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
        const wraps = document.querySelector('#detectionList')
        wraps.scrollTop = 0
      })
    }
  },
  watch: {
    timeFilter (n) {
      this.search(this.metaList, this.q)
    }
  },
  setup () {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      timeFilter
    }
  }
}
</script>
