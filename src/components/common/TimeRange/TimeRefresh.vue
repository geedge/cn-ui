<template>
    <div class="cn-refresh-box" v-ele-click-outside="dropdownShowFalse">
        <span>
            <el-button-group size="mini">
              <el-button size="mini" @click="$emit('change')"><i class="cn-icon cn-icon-refresh1"></i></el-button>
              <el-button class="cn-button" size="mini" @click="showRefreshList">
                  <span class="cn-button-label" v-if="interLabel">{{interLabel}}</span>
                  <i class="cn-icon cn-icon-dropdown" :class="dropdownShow?'active' : ''"></i>
              </el-button>
            </el-button-group>
        </span>
        <transition name="el-zoom-in-top">
            <div v-if="dropdownShow" class="refresh-list">
                <div v-for="(item, index) in refreshArr" :key="index" @click="setRefresh(item)" class="refresh-list-item" :class="item.value==interval ? 'active' : ''">
                  {{item.label}}
                  <i v-if="item.value==interval" class="cn-icon cn-icon-check"></i>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
// import { ref } from 'vue'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { dateFormatToUTC } from '@/utils/date-util'
import { useRoute } from 'vue-router'

export default {
  name: 'TimeRefresh',
  props: {
    endTime: {
      type: Number
    }
  },
  data () {
    return {
      searchTime: [],
      lastRefreshTime: '',
      intervalTimer: null,
      interval: -1,
      unit: 2,
      dropdownShow: false,
      interLabel: ''
      // refreshArr: [
      //   { value: -1, label: 'off' },
      //   { value: 30, label: '30s' },
      //   { value: 60, label: '1m' },
      //   { value: 300, label: '5m' },
      //   { value: 900, label: '15m' },
      //   { value: 1800, label: '30m' }
      // ]
    }
  },
  setup (props, ctx) {
    const { query } = useRoute()
    const refreshArr = [
      { value: -1, label: 'off' },
      { value: 30, label: '30s' },
      { value: 60, label: '1m' },
      { value: 300, label: '5m' },
      { value: 900, label: '15m' },
      { value: 1800, label: '30m' }
    ]
    let refreshObj = {}

    if (query.refreshTime !== undefined) {
      refreshObj = refreshArr.find(item => item.value === Number(query.refreshTime))
    }

    return {
      refreshArr,
      refreshObj
    }
  },
  mounted () {
    if (Object.keys(this.refreshObj).length > 0) {
      this.setRefresh(this.refreshObj)
    }
  },
  methods: {
    setRefresh (val) {
      this.interval = val.value
      this.interLabel = val.value == -1 ? '' : val.label
      this.dropdownShow = false
      const now = window.$dayJs.tz().valueOf()
      if (val && val.value != -1) {
        // 向地址栏添加自动刷新频率
        const dateParam = {
          refreshTime: val.value
        }
        this.reloadUrl(dateParam)

        // 设置定时器
        this.intervalTimer = setInterval(() => {
          this.$emit('change')
        }, val.value * 1000)
        // 设置定时器 比上次刷新间隔大于30s 立马刷新一次
        if ((now - this.endTime) / 1000 > 30) {
          this.$emit('change')
        }
        return
      }
      if (val && val.value == -1) {
        // 清除定时器
        clearInterval(this.intervalTimer)

        // 地址栏中清除自动刷新频率refreshTime
        const routeQuery = this.$route.query
        delete routeQuery.refreshTime
        this.reloadUrl(routeQuery, 'cleanOldParams')
      }
    },
    showRefreshList () {
      this.dropdownShow = !this.dropdownShow
    },
    dropdownShowFalse () {
      this.dropdownShow = false
    },
    /**
     * 向地址栏添加/删除参数
     */
    reloadUrl (newParam, clean) {
      const { query } = this.$route
      let newUrl = urlParamsHandler(window.location.href, query, newParam)
      if (clean) {
        newUrl = urlParamsHandler(window.location.href, query, newParam, clean)
      }
      overwriteUrl(newUrl)
    }
  }
}
</script>
