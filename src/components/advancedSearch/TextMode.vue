<template>
  <div @click="handleClick" v-ele-click-outside="handleBlur">
    <textarea
        style="text-indent: 65px;"
        cols="40"
        ref="textSearch"
    ></textarea>
    <div class="search__suffixes search__suffixes--text-mode" :class="showList ? '' : 'entity-explorer-home'" style="padding-left: 1px">
      <span class="search__suffix">
        <el-popover
            popper-class="my-popper-class"
            placement="top"
            trigger="hover"
            :content="$t('entity.switchToAdvancedSearch')"
        >
          <template #reference>
            <i class="cn-icon cn-icon-filter" @click="changeMode"></i>
          </template>
        </el-popover>
      </span>
      <span v-show="isCloseIcon" class="search__suffix search__suffix-close" @click="cleanParams">
        <i class="el-icon-error"></i>
      </span>
      <span class="search__suffix" @click.stop="search">
        <i class="el-icon-search"></i>
      </span>
    </div>

    <el-popover
        placement="bottom"
        width="100%"
        ref="popoverRef"
        :visible="hintVisible"
        popper-class="search-show-hint-popover"
        trigger="click">
      <template #reference>
        <div>
          <hint v-if="hintVisible" :hintList="hintList"
                @load="handleHintLoad"
                @select="handleSelect"
                :hintParams="hintParams"
                :hintSearch="searchStr"></hint>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script>
import Parser, { stringInQuot, handleOperatorSpace } from '@/components/advancedSearch/meta/parser'
import CodeMirror from 'codemirror'
import { toRaw } from 'vue'
import _ from 'lodash'
import { columnType } from '@/components/advancedSearch/meta/meta'
import { handleErrorTip } from '@/components/advancedSearch/meta/error'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import Hint from '@/components/advancedSearch/showhint/Hint/Hint'
import { getDataset } from '@/components/advancedSearch/showhint/packages/getDataset'
import codeMirrorMixins from '@/components/advancedSearch/showhint/myCodeMirror.js'

export default {
  name: 'TextMode',
  mixins: [codeMirrorMixins],
  props: {
    columnList: Array,
    str: String,
    showList: Boolean,
    showCloseIcon: Boolean,
    isShowHint: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      codeMirror: null,
      isCloseIcon: this.showCloseIcon,
      isEdit: false,
      hintVisible: false,
      dataset: null,
      CodeMirror
    }
  },
  emits: ['changeMode', 'search'],
  created () {
    if (this.isShowHint) {
      this._initComponent()
    }
  },
  provide () {
    return {
      getDataset: () => {
        // provide() 写成方法之后,保证this的指向
        return this.dataset || null
      }
    }
  },
  components: {
    Hint
  },
  computed: {
    searchStr () {
      const { wholeTokenStr } = this.getWholeToken() || ''
      if (['not in', 'not like', 'order by', 'group by'].includes(wholeTokenStr?.toLowerCase())) {
        return wholeTokenStr
      }
      if (['operator', 'keyword', 'builtin'].includes(this.hintParams?.token?.type)) {
        return this.hintParams?.token?.string
      }
      return this.hintParams.leftpart || this.hintSearch || ''
    }
  },
  methods: {
    cleanParams () {
      toRaw(this.codeMirror).setValue('')
      this.isEdit = false
      this.isCloseIcon = false
      const routeQuery = this.$route.query
      delete routeQuery.q
      this.reloadUrl(routeQuery, 'cleanOldParams')
    },
    initCodeMirror () {
      let option = {
        mode: 'sql',
        placeholder: '',
        lineNumbers: false
      }
      if (this.isShowHint) {
        option = {
          keyMap: 'sublime',
          tabSize: 2, // 缩进格式
          theme: 'eclipse', // 主题，对应主题库 JS 需要提前引入
          line: true,
          lineNumbers: false, // 显示行数
          indentUnit: 4, // 缩进单位为4
          styleActiveLine: true, // 当前行背景高亮
          mode: 'text/x-filter', // HMTL混合模式
          foldGutter: true,
          lint: true,
          auto: 'auto', // 自动换行
          autoCloseBrackets: true, // 自动闭合符号
          matchBrackets: true, // 是否添加匹配括号高亮
          spellcheck: true, // 启用拼写检查
          autocorrect: true, // 启用自动更正
          lineWrapping: true, // 滚动或换行以显示长行
          // 提示配置
          hintOptions: {
            completeSingle: false, // 自动匹配唯一值
            // 匹配 t_test_login.col_a  用. 来连接的
            tables: {
              filter_table: ['recv_time']
            },
            alignWithWord: false
          }
        }
      }
      this.codeMirror = CodeMirror.fromTextArea(this.$refs.textSearch, option)
      this.codeMirror.setOption('extraKeys', {
        Enter: (cm) => {}
      })
      this.setCodemirrorValue()
      this.initEvent()
      this.initHint()
    },
    search () {
      this.handleBlur()
      const str = this.codeMirror.getValue().trim()
      if (str) {
        const parser = new Parser(this.columnList)
        const keyInfo = parser.comparedEntityKey(parser.handleEntityTypeByStr(str))
        const metaList = parser.parseStr(_.cloneDeep(str)).metaList
        const keywordList = []
        metaList.forEach(item => {
          if (item.column && item.column.type === columnType.fullText) {
            keywordList.push({ type: item.column.type, value: item.column.label })
          } else if (item.column && item.column.type === columnType.string) {
            keywordList.push({ type: item.column.type, value: item.value.value })
          }
        })
        if (keyInfo.isKey) {
          const errorList = parser.validateStr(keyInfo.key)
          if (_.isEmpty(errorList)) {
            this.$emit('search', { ...parser.parseStr(keyInfo.key), str: str, keywordList: keywordList })
          } else {
            this.$message.error(handleErrorTip(errorList[0]))
          }
        } else {
          this.$message.error(this.$t('tip.invalidQueryField') + ' ' + keyInfo.key)
        }
      } else {
        this.$emit('search', { q: '', str: '', metaList: [] })
      }
    },
    focus () {
      this.codeMirror.focus()
    },
    changeMode () {
      const str = this.codeMirror.getValue().trim()
      if (str) {
        const parser = new Parser(this.columnList)
        const errorList = parser.validateStr(str)
        if (_.isEmpty(errorList)) {
          const metaList = parser.parseStr(str)
          this.reloadUrl({ mode: 'tag' })
          this.$emit('changeMode', 'tag', metaList)
        } else {
          this.reloadUrl({ mode: 'tag' })
          this.$emit('changeMode', 'tag', { metaList: [], str: '' })
        }
      } else {
        this.reloadUrl({ mode: 'tag' })
        this.$emit('changeMode', 'tag', { str: '', metaList: [] })
      }
    },
    // 处理value，例如转换IN的值
    handleValue (value, column, operator) {
      const isArray = ['IN', 'NOT IN'].indexOf(operator) > -1
      if (isArray) {
        if (_.isArray(value)) {
          value = value.map(v => column.type === columnType.string ? stringInQuot(v) : v)
          return `(${value.join(',')})`
        } else {
          return value
        }
      } else {
        return (column.type.items ? column.type.items : column.type) === columnType.string ? stringInQuot(value) : value
      }
    },
    addParams (params) {
      let current = this.codeMirror.getValue()
      params.forEach(param => {
        const column = this.columnList.find(c => c.label === param.column)
        if (param.operator === 'has') {
          current = `${current ? current + ' AND ' : ''}${param.operator}(${param.column},${this.handleValue(param.value, column, param.operator)})`
        } else {
          current = `${current ? current + ' AND ' : ''}${param.column}${handleOperatorSpace(param.operator)}${this.handleValue(param.value, column, param.operator)}`
        }
      })
      toRaw(this.codeMirror).setValue(current.trim())
    },
    removeParams (params) {
      let current = this.codeMirror.getValue()
      params.forEach(param => {
        const column = this.columnList.find(c => c.label === param.column)
        // 将对应内容替换为空串
        const sqlPiece = `${param.column}${handleOperatorSpace(param.operator)}${this.handleValue(param.value, column, param.operator)}`.trim()
        const sqlPieceWithConnection = [` AND ${sqlPiece}`, ` OR ${sqlPiece}`, `${sqlPiece} AND `, `${sqlPiece} OR `, sqlPiece]
        sqlPieceWithConnection.forEach(piece => {
          current = current.replace(piece, '')
        })
      })
      toRaw(this.codeMirror).setValue(current.trim())
    },
    changeParams (params) {
      let current = this.codeMirror.getValue()
      params.forEach(param => {
        const oldColumn = this.columnList.find(c => c.label === param.oldParam.column)
        const newColumn = this.columnList.find(c => c.label === param.newParam.column)
        // 将oldParam内容替换为newParam
        const oldSqlPiece = `${param.oldParam.column}${handleOperatorSpace(param.oldParam.operator)}${this.handleValue(param.oldParam.value, oldColumn, param.oldParam.operator)}`.trim()
        const newSqlPiece = `${param.newParam.column}${handleOperatorSpace(param.newParam.operator)}${this.handleValue(param.newParam.value, newColumn, param.newParam.operator)}`.trim()
        current = current.replace(oldSqlPiece, newSqlPiece)
      })
      toRaw(this.codeMirror).setValue(current.trim())
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
    },
    initEvent () {
      this.codeMirror.on('focus', (coder) => {
        if (this.codeMirror.getValue().trim() !== '') {
          this.isEdit = true
          this.isCloseIcon = true
        }
        if (this.isShowHint && this.$emit) {
          this.$emit('focus', coder.getValue())
        }
      })
      this.codeMirror.on('blur', (coder) => {
        const timer = setTimeout(() => {
          this.isEdit = false
          this.isCloseIcon = false
          if (this.isShowHint && this.$emit) {
            this.$emit('blur', coder.getValue())
          }
          clearTimeout(timer)
        }, 200)
      })
      this.codeMirror.on('update', () => {
        this.isEdit = true
        this.isCloseIcon = true
      })

      if (this.isShowHint) {
        // 支持双向绑定
        this.codeMirror.on('change', (coder) => {
          if (this.$emit) {
            this.$emit('input', coder.getValue())
          }
        })

        this.codeMirror.on('startCompletion', () => {
          // 展开自动提示的 事件回调
          this.hintVisible = true
          this.hintVm?.hintDeactive()
        })
        this.codeMirror.on('endCompletion', () => {
          // 自动提示关闭
          this.hintVisible = false
          this.hintParams = {}
          this.hintList = []
        })
        this.$emit('load', this.codeMirror)
      }
    },
    _initComponent () {
      getDataset(this, this.queryParams || {}, this.columnList).then((dataset, dataDisposeFun) => {
        this.dataset = Object.freeze(dataset)
      }).catch(err => {
        console.error(err)
      })
    },
    initHint () {
      this.codeMirror.on('inputRead', () => {
        setTimeout(() => {
          this.codeMirror.showHint()
        })
      })
    },
    handleBlur () {
      if (this.isShowHint) {
        this.hintVisible = false
        this.hintParams = {}
        this.hintList = []
      }
    },
    handleClick () {
      if (this.isShowHint) {
        this.hintVisible = true
        this.codeMirror.showHint()
      }
    },
    getWholeToken () {
      // 获取 前一个token
      const editor = this.hintParams.editor
      const Pos = this.CodeMirror.Pos
      const cur = this.hintParams.cur
      const token = this.hintParams.token
      if (!editor) {
        return
      }
      const spaceToken = editor.getTokenAt(Pos(cur.line, token.start))
      let preToken = ''
      if (spaceToken && spaceToken?.string === ' ') {
        preToken = editor.getTokenAt(Pos(cur.line, spaceToken.start))
      }
      const searchKey = `${preToken?.string} ${token?.string}`

      return {
        wholeTokenStr: searchKey,
        spaceToken,
        preToken,
        token
      }
    },
    handleHintLoad ({ vm }) {
      this.hintVm = vm
    },
    handleSelect (item, index, hintList) {
      if (index === 0) {
        // 不可能选中0  第0项是标题, 选中0 说明没选中
        this.hintParams?.editor?.closeHint()
        this.$emit('query', CodeMirror)
        return
      }

      const data = {
        from: this.hintParams.from,
        to: this.hintParams.to,
        list: hintList
      }

      const { wholeTokenStr, preToken, token } = this.getWholeToken() || ''
      let cur = null
      cur = this.hintParams?.cur

      // 上一个字段 是存在空格的关键字,整体删除上一个关键字
      if (['not in', 'not like', 'order by', 'group by'].includes(wholeTokenStr?.toLowerCase())) {
        this.hintParams?.editor?.replaceRange('', { line: cur.line, ch: preToken.start }, {
          line: cur.line,
          ch: token.end
        })
      }

      this.completion && this.completion.pick(data, index)
    },
    setCodemirrorValue () {
      // 如果地址栏包含参数q，则将参数q回显到搜索栏内
      let { q } = this.$route.query

      if (this.str) {
        toRaw(this.codeMirror).setValue(this.str)
      }
      if (q) {
        if (q.indexOf('+') > -1) {
          q = q.replace('+', ' ')
        }
        if (q.indexOf('%') === 0 || q.indexOf('%20') > -1 || q.indexOf('%25') > -1) {
          q = decodeURI(q)
        } else {
          const str1 = q.substring(q.indexOf('%'), q.indexOf('%') + 3)
          if (q.indexOf('%') > 0 && (str1 === '%20' || str1 === '%25')) {
            q = decodeURI(q)
          }
        }
        // 为避免地址栏任意输入导致全查询的q带QUERY，解析时不识别导致的语法错误
        // 如地址栏输入116.178.222.171，此时的q很长，刷新界面时需要把q里的116.178.222.171拿出来进行搜索
        if (q.indexOf('QUERY') > -1) {
          const strList = q.split(' ')
          if (strList.length > 0) {
            // 此时strList[1]为ip_addr:116.178.222.171，获取116.178.222.171
            q = strList[1].slice(8)
          }
        }
        if (this.codeMirror) {
          toRaw(this.codeMirror).setValue(q)
        }
      } else {
        this.isCloseIcon = false
      }

      const vm = this
      this.emitter.on('advanced-search', function () {
        vm.search()
      })
    }
  },
  watch: {
    str: {
      immediate: true,
      handler (n) {
        if (n) {
          setTimeout(() => {
            toRaw(this.codeMirror).setValue(n)
          })
        }
      }
    },
    showCloseIcon (n) {
      if (!this.isEdit) {
        const str = this.codeMirror.getValue().trim()
        if (str !== '') {
          this.isCloseIcon = n
        }
      }
    }
  },
  mounted () {
    if (this.isShowHint) {
      this.$nextTick(() => {
        // dataset是避免数据未初始化完成注册失败，ref是因为组件加载2次，避免第二次时dom丢失导致数据挂载失败
        if (this.dataset && this.$refs.textSearch) {
          this.initShowHint()
          this.initCodeMirror()
        }
      })
    } else {
      this.initCodeMirror()
    }
  }
}
</script>

<style>
.el-popper.search-show-hint-popover {
  visibility: hidden !important;
}
</style>
