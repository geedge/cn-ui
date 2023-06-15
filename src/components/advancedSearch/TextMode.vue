<template>
  <textarea
      ref="textSearch"
  ></textarea>
  <div class="search__suffixes search__suffixes--text-mode">
    <div class="search__suffix" @click="changeMode">
      <i class="cn-icon cn-icon-filter"></i>
    </div>
    <div class="search__suffix-close" @click="cleanParams">
      <i class="el-icon-error"></i>
    </div>
    <div class="search__suffix new-search__suffix" @click="search">
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

export default {
  name: 'TextMode',
  props: {
    columnList: Array,
    str: String
  },
  data () {
    return {
      codeMirror: null
    }
  },
  emits: ['changeMode', 'search'],
  methods: {
    cleanParams () {
      toRaw(this.codeMirror).setValue('')
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
    },
    search () {
      const str = this.codeMirror.getValue().trim()
      if (str) {
        const parser = new Parser(this.columnList)
        const errorList = parser.validateStr(str)
        if (_.isEmpty(errorList)) {
          this.$emit('search', parser.parseStr(str))
        } else {
          this.$message.error(handleErrorTip(errorList[0]))
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
          this.$emit('changeMode', 'tag', metaList)
        } else {
          this.$emit('changeMode', 'tag', { metaList: [], str: '' })
        }
      } else {
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
        return column.type === columnType.string ? stringInQuot(value) : value
      }
    },
    addParams (params) {
      let current = this.codeMirror.getValue()
      params.forEach(param => {
        const column = this.columnList.find(c => c.name === param.column)
        current = `${current ? current + ' AND ' : ''}${param.column}${handleOperatorSpace(param.operator)}${this.handleValue(param.value, column, param.operator)}`
      })
      toRaw(this.codeMirror).setValue(current.trim())
    },
    removeParams (params) {
      let current = this.codeMirror.getValue()
      params.forEach(param => {
        const column = this.columnList.find(c => c.name === param.column)
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
        const oldColumn = this.columnList.find(c => c.name === param.oldParam.column)
        const newColumn = this.columnList.find(c => c.name === param.newParam.column)
        // 将oldParam内容替换为newParam
        const oldSqlPiece = `${param.oldParam.column}${handleOperatorSpace(param.oldParam.operator)}${this.handleValue(param.oldParam.value, oldColumn, param.oldParam.operator)}`.trim()
        const newSqlPiece = `${param.newParam.column}${handleOperatorSpace(param.newParam.operator)}${this.handleValue(param.newParam.value, newColumn, param.newParam.operator)}`.trim()
        current = current.replace(oldSqlPiece, newSqlPiece)
      })
      toRaw(this.codeMirror).setValue(current.trim())
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
    }
  },
  mounted () {
    this.initCodeMirror()
    const vm = this
    this.emitter.on('advanced-search', function () {
      vm.search()
    })
  }
}
</script>

<style lang="scss">
.search__suffix-close {
  .el-icon-error {
    font-size: 17px;
    color: #C4C4C4;
    margin: 0 12px;
    cursor: pointer;
  }
}

.new-search__suffix {
  width: 41px;
  height: 41px;
  line-height: 41px;
  background: #38ACD2;
  text-align: center;
  margin-top: -10px;
  margin-right: -10px;

  .el-icon-search {
    color: #fff !important;
    margin-top: 9px !important;
  }
}
</style>
