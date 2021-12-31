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

export default {
  name: 'EntityFilter',
  components: {
    EntityTop
  },
  props: {
    filterData: Array,
    searchParams: Object,
    timeFilter: Object
  },
  data () {
    return {
      topList: 'list',
      topData: [],
      showTopTen: false, // 自定义列弹框是否显示
      entityTopTenData: []
    }
  },
  methods: {
    showTopDialog (i, item, filter) {
      const type = filter.type
      const width = this.$refs['entityTopTen' + i].offsetWidth
      const offsetLeft = this.$refs['entityTopTen' + i].offsetLeft
      const leftVal = offsetLeft + width

      get(api.filterTop, { entityType: type, q: this.searchParams, column: item.topColumn, top: 10, ...this.timeFilter }).then(response => {
        if (response.code === 200) {
          this.$refs.entityTopTenPop.initEntityTop(leftVal, item, response.data.result, filter.totalCount)
        } else {
          this.$refs.entityTopTenPop.initEntityTop(leftVal, item, [], filter.totalCount)
        }
      }).catch(e => {
        this.$refs.entityTopTenPop.initEntityTop(leftVal, item, [], filter.totalCount)
      }).finally(() => {
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
