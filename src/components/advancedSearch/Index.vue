<template>
  <div
      class="advanced-search"
  >
    <text-mode
        v-if="searchMode === 'text'"
        ref="textMode"
        :column-list="columnList"
        :sql="sql"
        @changeMode="changeMode"
        @search="search"
    ></text-mode>
    <tag-mode
        v-if="searchMode === 'tag'"
        ref="tagMode"
        :column-list="columnList"
        :operator-list="showOperatorList"
        :connection-list="showConnectionList"
        :convert-meta-list="metaList"
        @changeMode="changeMode"
        @search="search"
    ></tag-mode>
<!--    <div class="search-tip&#45;&#45;error">something error...</div>-->
  </div>
</template>

<script>
import TagMode from '@/components/advancedSearch/TagMode'
import TextMode from '@/components/advancedSearch/TextMode'
import { defaultOperatorList, defaultConnectionList } from '@/components/advancedSearch/meta/meta'
import _ from 'lodash'
import { ref } from 'vue'
import SqlParser from '@/components/advancedSearch/meta/sql-parser'
import { ElMessage } from 'element-plus'
export default {
  name: 'Index',
  components: {
    TagMode,
    TextMode
  },
  data () {
    return {
      sql: null,
      metaList: null
    }
  },
  props: {
    // 默认模式，tag | text
    defaultMode: String,
    // 使用全文检索
    fullText: {
      type: Boolean,
      default: true
    },
    // 条件字段列表
    columnList: {
      type: Array,
      required: true
    },
    // 操作符列表
    operatorList: Array,
    // 连接符列表
    connectionList: Array
  },
  methods: {
    search (metaList, formatSql) {
      this.$emit('search', metaList, formatSql)
    },
    changeMode (mode, data) {
      this.searchMode = mode
      if (mode === 'text') {
        this.sql = data
      } else if (mode === 'tag') {
        this.metaList = data
      }
    },
    addParams (params) {
      this.$refs.tagMode && this.$refs.tagMode.addParams(params)
      this.$refs.textMode && this.$refs.textMode.addParams(params)
    },
    setSql (sql) {
      if (this.searchMode === 'text') {
        this.sql = sql
      } else if (this.searchMode === 'tag') {
        const parser = new SqlParser(sql, this.columnList)
        const errorList = parser.validate()
        if (this.$_.isEmpty(errorList)) {
          const { metaList } = parser.formatSql()
          this.metaList = metaList
        } else {
          ElMessage.error(this.$t('tip.invalidExpression'))
        }
      }
    }
  },
  setup (props) {
    // 默认为文本模式
    let searchMode = ref('text')
    if (props.defaultMode) {
      switch (props.defaultMode) {
        case 'tag': {
          searchMode = 'tag'
          break
        }
      }
    }
    // 如果参数中的operatorList、connectionList为空，使用默认值
    const showOperatorList = _.isEmpty(props.operatorList) ? defaultOperatorList : [...props.operatorList]
    const showConnectionList = _.isEmpty(props.connectionList) ? defaultConnectionList : [...props.connectionList]
    return {
      searchMode,
      showOperatorList,
      showConnectionList
    }
  }
}
</script>
