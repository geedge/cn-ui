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
          <div class="filter__row" v-for="(item, i) in filter.data" :key="i"  @click="showTopDailog(i,item,filter.type)"  :ref="`entityTopTen`+i">
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
    filterData: Array
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
    showTopDailog (i, item, type) {
      const width = this.$refs['entityTopTen' + i].offsetWidth
      const offsetLeft = this.$refs['entityTopTen' + i].offsetLeft
      const leftVal = offsetLeft + width

      get(api.filterTop, { entityType: type, column: item.column, top: 10 }).then(response => {
        if (response.code === 200) {
          const rlt = response.data.result

          let sum = 0
          rlt.forEach(item => {
            sum = sum + item.value
          })

          let curSumPercent = 0
          rlt.forEach((item, i) => {
            const per = Number(item.value * 100 / sum).toFixed(0)
            if ((i + 1) === rlt.length) {
              item.percent = 100 - curSumPercent
            } else {
              item.percent = per
              curSumPercent = Number(curSumPercent) + Number(per)
            }
          })
          this.$refs.entityTopTenPop.initEntityTop(leftVal, item, rlt)
        } else {
          this.$refs.entityTopTenPop.initEntityTop(leftVal, item, [])
        }
      }).catch(e => {
        this.$refs.entityTopTenPop.initEntityTop(leftVal, item, [])
      }).finally(() => {
        this.showTopTen = true
      })
    }
  },
  mounted () {

  }

}
</script>
