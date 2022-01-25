<template >
  <div class="entity-filter-case " >
    <div class="filter-case__header">{{$t('entities.filter')}}</div>
    <div
        class="entity-filter"
        v-for="(filter, index) in filterData"
        :key="index"
    >
      <div class="filter__header">{{filter.title}}</div>
      <div class="filter__body">
        <div class="filter__row" v-for="(item, i) in filter.data" :key="i"  @click="showTopDialog(i, item, filter)"  :ref="`entityTopTen`+i">
          <div class="row__label">
            <i :class="item.icon"></i>
            <span>{{item.label}}</span>
          </div>
          <div class="row__value">{{item.value}}</div>
        </div>
      </div>
    </div>
    <!-- 自定义table列 -->
    <transition name="el-zoom-in-top">
      <entity-top
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
import { objToStr } from '@/utils/tools'
export default {
  name: 'EntityFilter',
  components: {
    EntityTop
  },
  props: {
    filterData: Array,
    q: String,
    timeFilter: Object
  },
  data () {
    return {
      topList: 'list',
      topData: [],
      showTopTen: false, // 自定义列弹框是否显示
      entityTopTenData: [],
      loading: false
    }
  },
  methods: {
    showTopDialog (i, item, filter) {
      const type = filter.type
      const width = this.$refs['entityTopTen' + i].offsetWidth
      const offsetLeft = this.$refs['entityTopTen' + i].offsetLeft
      const leftVal = offsetLeft + width
      const queryParams = {
        q: this.q,
        entityType: type,
        column: item.topColumn,
        top: 10,
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000)
      }
      this.timeout = setTimeout(() => {
        this.loading = true
      }, 500)
      get(api.filterTop, queryParams).then(response => {
        if (response.code === 200) {
          this.$refs.entityTopTenPop.initEntityTop(leftVal, item, response.data.result, filter.totalCount)
        } else {
          this.$refs.entityTopTenPop.initEntityTop(leftVal, item, [], filter.totalCount)
        }
      }).catch(e => {
        this.$refs.entityTopTenPop.initEntityTop(leftVal, item, [], filter.totalCount)
      }).finally(() => {
        clearTimeout(this.timeout)
        this.loading = false
        this.showTopTen = true
      })
    },
    filter (name, topData) {
      this.showTopTen = false
      this.$emit('filter', name, topData)
    }
  },
  mounted () {
  }
}
</script>
