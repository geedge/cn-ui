<template>
  <div class="explorer-search">
    <div class="explorer-search__title" v-show="!showList">{{$t('search.title')}}</div>
    <div class="explorer-search__input-case" :class="{'explorer-search__input-case--question-mark-in-line': showList}">
      <div class="explorer-search__input explorer-search__input--border entity__search">
        <advanced-search
          ref="search"
          :column-list="columnList"
          :connection-list="connectionList"
          :default-mode="defaultMode"
          :full-text="true"
          :show-list="showList"
          showHint
          :class="{'advanced-search--show-list': showList}"
          @search="search"
        ></advanced-search>
      </div>
<!--      <div class="search-symbol-inline" v-if="showList">-->
<!--        <i class="cn-icon cn-icon-help"></i>-->
<!--      </div>-->
      <div :class="showList ? 'explorer-search__foot-list' : 'explorer-search__foot'" v-ele-click-outside="esc">
        <div style="position: absolute;" class="explorer-search__block" @click="triggerHistory">
          <i class="cn-icon cn-icon-time"></i>
          <div class="search-dividing-line"></div>
        </div>
        <transition name="el-zoom-in-top">
          <div class="search__history" v-if="showHistory">
            <div class="history__items-new">
              <el-table
                  :data="history"
                  scrollbar-always-on="false"
                  @row-click="selectHistory"
                  style="overflow-x: unset"
                  empty-text=" "
              >
                <el-table-column prop="str" :label="$t('overall.expression')" min-width="560" />
                <el-table-column prop="date" :label="$t('overall.time')" sortable width="200">
                  <template #default="scope">
                    <span>{{ changeTimeByDate(scope.row.date) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="clear-all">
              <span @click="clearHistory" v-if="!$_.isEmpty(history)">{{$t('entity.clearAll')}}</span>
              <div v-else>{{$t('overall.noRecords')}}</div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import AdvancedSearch from '@/components/advancedSearch/Index'
import _ from 'lodash'
import { storageKey } from '@/utils/constants'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { columnList } from '@/utils/static-data'
import { changeTimeByDate } from '@/utils/tools'
export default {
  name: 'CnSearch',
  components: {
    AdvancedSearch
  },
  props: {
    showList: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      columnList: columnList,
      connectionList: [
        {
          value: 'AND',
          label: 'AND'
        }
        // {
        //   value: 'OR',
        //   label: 'OR'
        // }
      ],
      showHistory: false,
      history: []
    }
  },
  setup () {
    // 根据地址栏添加mode，即text和tag模式，默认text
    const { query } = useRoute()
    const defaultMode = ref(query.mode || 'text')
    return {
      defaultMode
    }
  },
  methods: {
    changeTimeByDate,
    search ({ str, q, metaList, keywordList }) {
      if (str) {
        // 加入搜索记录，将记录数量控制在30以内
        const oldHistory = localStorage.getItem(storageKey.entitySearchHistory)
        let arr = []
        const newItem = { str, date: this.dateFormatByAppearance(new Date()) }
        if (!_.isEmpty(oldHistory)) {
          const oldArr = JSON.parse(oldHistory)
          if (str === oldArr[0].str) {
            oldArr[0].date = this.dateFormatByAppearance(new Date())
          } else {
            oldArr.unshift(newItem)
          }
          arr = [...oldArr]
          if (arr.length > 30) {
            arr = arr.slice(0, 30)
          }
        } else {
          arr.push(newItem)
        }
        localStorage.setItem(storageKey.entitySearchHistory, JSON.stringify(arr))
      }
      this.$emit('search', { str, q, metaList, keywordList })
    },
    addParams (params) {
      this.$refs.search.addParams(params)
    },
    selectHistory (row) {
      this.$refs.search.setStr(row.str)
      this.showHistory = false
      this.$nextTick(() => {
        if (this.$refs.search.$refs.textMode) {
          this.$refs.search.$refs.textMode.focus(row)
        }
      })
      if (this.showList) {
        this.$nextTick(() => {
          this.emitter.emit('advanced-search')
        })
      }
    },
    clearHistory () {
      localStorage.setItem(storageKey.entitySearchHistory, '')
      this.history = []
    },
    triggerHistory () {
      this.showHistory = !this.showHistory
      if (this.showHistory) {
        const history = localStorage.getItem(storageKey.entitySearchHistory)
        if (!_.isEmpty(history)) {
          this.history = JSON.parse(history)
        }
      }
    },
    esc () {
      const timer = setTimeout(() => {
        this.showHistory = false
        clearTimeout(timer)
      }, 100)
    }
  }
}
</script>
