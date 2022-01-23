<template>
  <div
      class="advanced-search"
  >
    <text-mode
        v-if="searchMode === 'text'"
        @changeMode="changeMode"
        @search="search"
    ></text-mode>
    <tag-mode
        v-if="searchMode === 'tag'"
        :column-list="columnList"
        :operator-list="showOperatorList"
        :connection-list="showConnectionList"
        @changeMode="changeMode"
        @search="search"
    ></tag-mode>
  </div>
</template>

<script>
import TagMode from '@/components/advancedSearch/TagMode'
import TextMode from '@/components/advancedSearch/TextMode'
import { defaultOperatorList, defaultConnectionList } from '@/components/advancedSearch/meta/meta'
import _ from 'lodash'
import { ref } from 'vue'
export default {
  name: 'Index',
  components: {
    TagMode,
    TextMode
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
    search () {

    },
    changeMode (mode) {
      this.searchMode = mode
    }
  },
  setup (props) {
    // 默认为文本模式 TODO 改回text
    let searchMode = ref('tag')
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
