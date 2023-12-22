<template>
  <div
      class="advanced-search"
      @mouseenter="showCloseIcon = true"
      @mouseleave="showCloseIcon = false"
  >
    <text-mode
        test-id="text-mode"
        v-if="searchMode === 'text'"
        ref="textMode"
        :column-list="columnList"
        :str="str"
        :show-list="showList"
        :is-show-hint="showHint"
        :unit-test-str="unitTestStr"
        @changeMode="changeMode"
        @search="search"
        :show-close-icon="showCloseIcon"
    ></text-mode>
    <tag-mode
        test-id="tag-mode"
        v-if="searchMode === 'tag'"
        ref="tagMode"
        :column-list="columnList"
        :connection-list="showConnectionList"
        :convert-meta-list="metaList"
        :show-list="showList"
        @changeMode="changeMode"
        @search="search"
    ></tag-mode>
  </div>
</template>

<script>
import TagMode from '@/components/advancedSearch/TagMode'
import TextMode from '@/components/advancedSearch/TextMode'
import { defaultConnectionList } from '@/components/advancedSearch/meta/meta'
import _ from 'lodash'
import { ref } from 'vue'
import Parser from '@/components/advancedSearch/meta/parser'
export default {
  name: 'Index',
  components: {
    TagMode,
    TextMode
  },
  data () {
    return {
      str: null,
      metaList: null,
      showCloseIcon: false
    }
  },
  provide () {
    return {
      myHighLight: !this.noHighlight
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
    showList: {
      type: Boolean
    },
    // 条件字段列表
    columnList: {
      type: Array,
      required: true
    },
    // 连接符列表
    connectionList: Array,
    showHint: {
      type: Boolean,
      default: false
    },
    noHighlight: {
      type: Boolean,
      default: false
    }
  },
  emits: ['search'],
  methods: {
    search (parseData) {
      if (this.isUnitTesting) {
        this.unitTestParam = parseData
      }
      this.$emit('search', parseData)
    },
    changeMode (mode, { str, metaList }) {
      this.searchMode = mode
      if (mode === 'text') {
        this.str = str
      } else if (mode === 'tag') {
        this.metaList = metaList
      }
    },
    // params: [{column, operator, value}, ...]
    addParams (params) {
      this.$refs.tagMode && this.$refs.tagMode.addParams(params)
      this.$refs.textMode && this.$refs.textMode.addParams(params)
    },
    // params: [{column, operator, value}, ...]
    removeParams (params) {
      this.$refs.tagMode && this.$refs.tagMode.removeParams(params)
      this.$refs.textMode && this.$refs.textMode.removeParams(params)
    },
    // params: [{ newParam: {column, operator, value }, oldParam: { column, operator, value }], ...]
    changeParams (params) {
      this.$refs.tagMode && this.$refs.tagMode.changeParams(params)
      this.$refs.textMode && this.$refs.textMode.changeParams(params)
    },
    setStr (str) {
      if (this.searchMode === 'text') {
        this.str = str
      } else if (this.searchMode === 'tag') {
        const parser = new Parser(this.columnList)
        const errorList = parser.validateStr(str)
        if (_.isEmpty(errorList)) {
          const { metaList } = parser.parseStr(str)
          this.metaList = metaList
        }
      }
    },
    enterListener (event) {
      if (event.keyCode === 13) {
        this.$refs.tagMode && this.$refs.tagMode.enterSearch()
        this.$refs.textMode && this.$refs.textMode.search()
      }
    }
  },
  mounted () {
    document.addEventListener('keydown', this.enterListener)
  },
  unmounted () {
    document.removeEventListener('keydown', this.enterListener)
  },
  setup (props) {
    // 默认为文本模式
    const searchMode = ref('text')
    if (props.defaultMode) {
      switch (props.defaultMode) {
        case 'tag': {
          searchMode.value = 'tag'
          break
        }
      }
    }
    // 如果参数中的connectionList为空，使用默认值
    const showConnectionList = _.isEmpty(props.connectionList) ? defaultConnectionList : [...props.connectionList]
    return {
      searchMode,
      showConnectionList
    }
  }
}
</script>
