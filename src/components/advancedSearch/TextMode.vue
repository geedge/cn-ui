<template>
  <textarea
      ref="textSearch"
  ></textarea>
  <div class="search__suffixes search__suffixes--text-mode">
    <div class="search__suffix">
      <el-popover
          popper-class="my-popper-class"
          placement="top"
          trigger="hover"
          :content="$t('entity.switchToAdvancedSearch')"
      >
        <template #reference>
          <i class="cn-icon cn-icon-filter margin-r-12" @click="changeMode"></i>
        </template>
      </el-popover>
    </div>
    <div v-show="isCloseIcon" class="search__suffix-close" @click="cleanParams">
      <i class="el-icon-error"></i>
    </div>
    <div class="search__suffix" :class="showList ? 'new-search__suffix' : 'entity-explorer-search'" @click="search">
      <i class="el-icon-search"></i>
    </div>
  </div>
</template>

<script>
import 'codemirror/theme/ambiance.css'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/display/placeholder'
import 'codemirror/mode/sql/sql'
import Parser, { stringInQuot, handleOperatorSpace } from '@/components/advancedSearch/meta/parser'
import CodeMirror from 'codemirror'
import { toRaw } from 'vue'
import _ from 'lodash'
import { columnType } from '@/components/advancedSearch/meta/meta'
import { handleErrorTip } from '@/components/advancedSearch/meta/error'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'

export default {
  name: 'TextMode',
  props: {
    columnList: Array,
    str: String,
    showList: Boolean,
    showCloseIcon: Boolean
  },
  data () {
    return {
      codeMirror: null,
      isCloseIcon: this.showCloseIcon,
      isEdit: false
    }
  },
  emits: ['changeMode', 'search'],
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
      this.codeMirror = CodeMirror.fromTextArea(this.$refs.textSearch, {
        mode: {
          name: 'sql'
        },
        placeholder: 'Enter...',
        lineNumbers: false
      })
      this.codeMirror.setOption('extraKeys', {
        Enter: (cm) => {}
      })
      this.codeMirror.on('focus', () => {
        if (this.codeMirror.getValue().trim() !== '') {
          this.isEdit = true
          this.isCloseIcon = true
        }
      })
      this.codeMirror.on('blur', () => {
        const timer = setTimeout(() => {
          this.isEdit = false
          this.isCloseIcon = false
          clearTimeout(timer)
        }, 200)
      })
      this.codeMirror.on('update', () => {
        this.isEdit = true
        this.isCloseIcon = true
      })
    },
    search () {
      const str = this.codeMirror.getValue().trim()
      if (str) {
        const parser = new Parser(this.columnList)
        const keyInfo = parser.comparedEntityKey(parser.handleEntityTypeByStr(str))
        if (keyInfo.isKey) {
          const errorList = parser.validateStr(keyInfo.key)
          if (_.isEmpty(errorList)) {
            this.$emit('search', { ...parser.parseStr(keyInfo.key), str: str })
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
    // 如果地址栏包含参数q，则将参数q回显到搜索栏内
    let { q } = this.$route.query
    this.initCodeMirror()
    if (this.str) {
      toRaw(this.codeMirror).setValue(this.str)
    }
    if (q) {
      if (q.indexOf('%') === 0 || q.indexOf('%20') > -1 || q.indexOf('%25') > -1) {
        q = decodeURI(q)
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
      toRaw(this.codeMirror).setValue(q)
    } else {
      this.isCloseIcon = false
    }

    const vm = this
    this.emitter.on('advanced-search', function () {
      vm.search()
    })
  }
}
</script>
