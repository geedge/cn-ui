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
                  {{ item.label }}
                  <i v-if="item.value===interval" class="cn-icon cn-icon-check"></i>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
// import { ref } from 'vue'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

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
    }
  },
  setup () {
    const { query } = useRoute()
    const store = useStore()
    const refreshArr = [
      { value: -1, label: 'off' },
      { value: 30, label: '30s' },
      { value: 60, label: '1m' },
      { value: 300, label: '5m' },
      { value: 900, label: '15m' },
      { value: 1800, label: '30m' }
    ]
    let refreshObj = {}

    // 是否关闭refreshTime标志，
    // 即时间选择30s后再off，下钻再返回时，地址栏会带着refreshTime，
    // 此时通过refreshFlag判断已经off，再清除地址栏地址栏会带着refreshTime
    const refreshFlag = store.state.panel.refreshFlag
    const refreshTime = store.state.panel.refreshTime

    if (refreshFlag) {
      if (refreshTime !== null) {
        // 此处是避免下钻后浏览器返回，获取不到url的refreshTime情况
        // 以及重新加载后改变时间但url回退仍保留上次数据的情况
        refreshObj = refreshArr.find(item => item.value === refreshTime) || refreshArr[0]
      } else if (query.refreshTime !== undefined) {
        // 若地址栏的refreshTime不是数组里的值，直接关闭刷新
        refreshObj = refreshArr.find(item => item.value === Number(query.refreshTime)) || refreshArr[0]
      }
    } else {
      // 浏览器回退时，清除掉地址栏的refreshTime
      const newQuery = JSON.parse(JSON.stringify(query))
      delete newQuery.refreshTime
      const newUrl = urlParamsHandler(window.location.href, query, newQuery, 'clean')
      overwriteUrl(newUrl)
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
      this.interLabel = val.value === -1 ? '' : val.label
      this.dropdownShow = false
      const now = window.$dayJs.tz().valueOf()
      if (val && val.value !== -1) {
        // 切换轮询请求时间频率时，发现有未结束的请求，终止请求
        const cancelList = this.$store.state.panel.httpCancel
        if (cancelList.length > 0) {
          cancelList.forEach((cancel, index) => {
            cancel()
            delete cancelList[index]
          })
        }
        // 向地址栏添加自动刷新频率
        const dateParam = {
          refreshTime: val.value
        }
        this.reloadUrl(dateParam)
        this.$store.commit('setRefreshTime', val.value)
        this.$store.commit('setRefreshFlag', true)

        // 在新的轮询开始前清除掉已经可能存在的定时器，避免新的刷新时间不生效
        clearInterval(this.intervalTimer)
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
      if (val && val.value === -1) {
        // 清除定时器
        clearInterval(this.intervalTimer)

        // 地址栏中清除自动刷新频率refreshTime
        const routeQuery = this.$route.query
        delete routeQuery.refreshTime
        this.reloadUrl(routeQuery, 'cleanOldParams')
        this.$store.commit('setRefreshTime', null)
        this.$store.commit('setRefreshFlag', false)
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
