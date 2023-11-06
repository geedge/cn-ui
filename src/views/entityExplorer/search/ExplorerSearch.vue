<template>
  <div class="explorer-search">
    <div class="explorer-search__title" v-show="!showList">{{$t('search.title')}}</div>
    <div class="explorer-search__input-case" :class="{'explorer-search__input-case--question-mark-in-line': showList}">
      <div class="explorer-search__input explorer-search__input__border">
        <advanced-search
          ref="search"
          :column-list="columnList"
          :connection-list="connectionList"
          :default-mode="defaultMode"
          :full-text="true"
          :show-list="showList"
          :class="{'advanced-search--show-list': showList}"
          @search="search"
        ></advanced-search>
      </div>
<!--      <div class="search-symbol-inline" v-if="showList">-->
<!--        <i class="cn-icon cn-icon-help"></i>-->
<!--      </div>-->
      <div v-if="!showList" class="explorer-search__foot" v-ele-click-outside="esc">
        <div class="foot__item" @click="triggerHistory">
          <i class="el-icon-arrow-right" :class="{ 'arrow-rotate': showHistory }" style="padding-right: 5px;"></i>
          <span>{{$t('search.searchHistory')}}</span>
        </div>
        <div class="foot__item">
          <!-- <span @click="search">{{$t('overall.explore')}}</span>
          <el-divider direction="vertical"></el-divider>
          <span>{{$t('overall.help')}}</span>-->
        </div>
        <transition name="el-zoom-in-top">
          <div class="search__history" v-show="showHistory">
            <div class="history__items">
              <div class="history__item" v-for="(h, i) in history" :key="i" @click="selectHistory(h.str)">
                <span class="item-date">{{h.date}}</span>
                <div class="item-value" :title="h.str">{{h.str}}</div>
              </div>
            </div>
            <div class="clear-all">
              <span @click="clearHistory" v-if="!$_.isEmpty(history)">{{$t('overall.clear')}}</span>
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
    search ({ str, q, metaList, keywordList }) {
      if (str) {
        // 加入搜索记录，将记录数量控制在30以内
        const oldHistory = localStorage.getItem(storageKey.entitySearchHistory)
        let arr = []
        const newItem = { str, date: this.dateFormatByAppearance(new Date()) }
        if (!_.isEmpty(oldHistory)) {
          const oldArr = JSON.parse(oldHistory)
          const obj = oldArr.find(d => d.str === str)
          if (obj) {
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
    selectHistory (str) {
      this.$refs.search.setStr(str)
      this.showHistory = false
      this.$nextTick(() => {
        if (this.$refs.search.$refs.textMode) {
          this.$refs.search.$refs.textMode.focus()
        }
      })
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
      this.showHistory = false
    }
  }
}
</script>
