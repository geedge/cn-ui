<template>
  <el-input
      class="advanced-search"
      :class="{'advanced-search--show-list': showList}"
      v-model="searchContentTemp"
      @keyup.enter="enter"
  >
    <template #suffix>
      <div class="search__suffixes" v-if="!showList">
        <div class="search__suffix">
          <i class="cn-icon cn-icon-search-advance"></i>
        </div>
        <div class="search__suffix" @click="enter">
          <i class="el-icon-search"></i>
        </div>
      </div>
      <div class="search__suffixes--show-list" v-else>
        <div class="search__suffix">
          <i class="cn-icon cn-icon-search-advance"></i>
        </div>
        <div class="search__suffix" @click="enter">
          <i class="el-icon-search"></i>
        </div>
      </div>
    </template>
  </el-input>
<!--  <div class="advanced-search"></div>-->
</template>

<script>
import { objToStr, strToObj } from '@/utils/tools'
export default {
  name: 'AdvancedSearch',
  props: {
    showList: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      searchContentTemp: '', // 搜索框内的文本内容，按回车键后为searchContent赋值
      searchContent: '', // 查询语句
      searchParams: null // 搜索参数，格式为[{ name: xxx, value: xxx }, ...]
    }
  },
  methods: {
    search () {
      this.$emit('search', this.searchParams)
    },
    reset () {
      this.searchParams = null
      this.searchParams = []
    },
    addParams (params) {
      if (params) {
        const newParams = { ...this.searchParams, ...params }
        this.searchContentTemp = objToStr(newParams)
        this.enter()
      }
    },
    enter () {
      if (!this.searchContentTemp) {
        this.reset()
      } else {
        this.searchContent = this.searchContentTemp
      }
    }
  },
  watch: {
    searchContent (n) {
      if (n) {
        this.searchParams = strToObj(n)
      } else {
        this.reset()
      }
      this.searchContentTemp !== n && (this.searchContentTemp = n)
    },
    searchParams: {
      deep: true,
      handler (n) {
        if (n) {
          // 请求接口，获取左侧过滤条件和右侧entity列表
          this.search()
        }
      }
    }
  }
}
</script>
