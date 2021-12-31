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
        <div class="search__suffix" @click="search">
          <i class="el-icon-search"></i>
        </div>
      </div>
      <div class="search__suffixes--show-list" v-else>
        <div class="search__suffix">
          <i class="cn-icon cn-icon-search-advance"></i>
        </div>
        <div class="search__suffix" @click="search">
          <i class="el-icon-search"></i>
        </div>
      </div>
    </template>
  </el-input>
<!--  <div class="advanced-search"></div>-->
</template>

<script>
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
        this.searchContentTemp = this.objToStr(newParams)
        this.enter()
      }
    },
    strToObj (n) {
      const paramsArr = n.split(/\s[aA][nN][dD]\s/)
      const paramsObj = {}
      paramsArr.forEach(string => {
        const param = string.split('=')
        if (param.length > 1) {
          let value = param[1].trim()
          const valueArr = value.split('"')
          if (valueArr.length > 2) {
            value = valueArr[1].trim()
          }
          paramsObj[param[0].trim()] = value
        }
      })
      return paramsObj
    },
    objToStr (obj) {
      return Object.keys(obj).map(k => {
        return `${k}="${obj[k]}"`
      }).join(' AND ')
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
        this.searchParams = this.strToObj(n)
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
