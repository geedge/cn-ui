<template>
  <div class="tag-search">
    <div class="tag-search__meta"
         v-for="(meta, index) in metaList"
         :key="index"
         :class="`tag-search__meta--${meta.meta}`"
    >
      <template v-if="meta.meta === condition">
        <!-- 删除按钮 -->
        <div class="condition__delete" @click="removeCondition(index)"><i class="el-icon-error"></i></div>
        <!-- 字段选择 -->
        <div class="condition__column">
          <div v-show="meta.column.isEditing">
            <el-select
                allow-create
                filterable
                size="mini"
                v-model="meta.column.name"
                ref="columnSelect"
                :placeholder="meta.column.name || ''"
                @blur="columnBlur(meta, index)"
                @change="(value) => selectColumn(value, meta)"
            >
              <el-option
                  v-for="(column, index) in columnList"
                  :key="index"
                  :label="column.label"
                  :value="column.name"
              ></el-option>
            </el-select>
          </div>
          <span v-show="!meta.column.isEditing" @click="columnClick(meta)">{{meta.column.label}}</span>
        </div>
        <!-- 已选操作符显示 -->
        <div class="condition__operator" @click="operatorClick(meta)" v-if="meta.operator.show">{{meta.operator.value}}</div>
        <!-- 值 -->
        <div class="condition__value">
          <div v-if="meta.value.isEditing">
            <el-input v-model="meta.value.value" size="mini" @blur="valueBlur(meta)" ref="valueInput" @keyup.enter="valueBlur(meta)"></el-input>
          </div>
          <span v-else @click="valueClick(meta)">{{meta.value.label}}</span>
        </div>
        <!-- 操作符选择器 -->
        <div class="condition__operation-select" v-if="meta.operator.show && meta.operator.isEditing">
          <div
              class="condition__operation"
              v-for="(operator, index) in operatorList"
              :key="index"
              @click.stop="selectOperator(operator, meta)"
          >{{operator}}</div>
        </div>
      </template>
      <!-- 条件连接符 -->
      <template v-else-if="meta.meta === connection">
        <div class="connection__value">
          <div v-show="meta.isEditing">
            <el-select
                :placeholder="meta.value"
                v-model="meta.value"
                size="mini"
                @change="(value) => selectConnection(value, meta)"
            >
              <el-option
                  v-for="(connection, index) in connectionList"
                  :key="index"
                  :label="connection.label"
                  :value="connection.value"
              ></el-option>
            </el-select>
          </div>
          <span v-show="!meta.isEditing" @click="connectionClick(meta)">{{meta.value}}</span>
        </div>
      </template>
    </div>
    <div class="tag-search__add" @click="addCondition">{{$t('entities.advancedSearch.add')}}</div>
    <div class="search__suffixes search__suffixes--tag-mode">
      <div class="search__suffix" @click="changeMode">
        <i class="cn-icon cn-icon-search-normal"></i>
      </div>
      <div class="search__suffix" @click="search">
        <i class="el-icon-search"></i>
      </div>
    </div>
  </div>
</template>

<script>
import Meta, { connection, condition, columnType } from './meta/meta'
import _ from 'lodash'
import { handleErrorTip } from '@/components/advancedSearch/meta/error'
import Parser, { stringInQuot } from '@/components/advancedSearch/meta/parser'
export default {
  name: 'TagMode',
  props: {
    columnList: Array,
    operatorList: Array,
    connectionList: Array,
    convertMetaList: Array
  },
  data () {
    return {
      condition,
      connection,
      metaList: []
    }
  },
  emits: ['changeMode', 'search'],
  methods: {
    // 新增条件
    addCondition (meta) {
      this.metaList.forEach(m => {
        m.cancelEditing()
      })
      // 先判断上一个condition是否已填写完整，没有则删除；之后将当前所有meta的内容的isEditing置为false
      if (this.metaList.length > 0) {
        const prevMeta = this.metaList[this.metaList.length - 1]
        if (!prevMeta.isCompleteCondition()) {
          this.metaList.splice(this.metaList.length - (this.metaList.length === 1 ? 1 : 2), this.metaList.length === 1 ? 1 : 2)
        }
      }
      // 不是首个condition时，先增加一个connection，再增加一个新condition
      if (!_.isEmpty(this.metaList)) {
        this.addConnection()
      }
      if (meta instanceof Meta) {
        this.metaList.push(meta)
      } else {
        const newCondition = new Meta(condition)
        newCondition.isEditing = true
        newCondition.column.isEditing = true
        this.metaList.push(newCondition)

        this.$nextTick(() => {
          this.$refs.columnSelect.focus()
        })
      }
    },
    addConnection () {
      this.metaList.push(new Meta(connection))
    },
    removeCondition (index) {
      // 删除首个条件时，连带删除之后的第一个连接符；否则删除之前的第一个连接符
      if (index === 0) {
        if (this.metaList.length > 2) {
          this.metaList.splice(0, 2)
        } else {
          this.metaList = []
        }
      } else {
        this.metaList.splice(index - 1, 2)
      }
    },
    // 选择搜索条件的事件
    selectColumn (value, meta) {
      // 处理column。如果是用户自己新增的column，视为全文搜索
      if (this.isCustomized(value)) {
        meta.column.type = columnType.fullText
        meta.column.label = value
        meta.resetOperator()
        meta.resetValue()
      } else {
        const selectedColumn = this.columnList.find(column => {
          return column.name === value
        })
        meta.column.label = selectedColumn.label
        meta.column.type = selectedColumn.type
        setTimeout(() => {
          meta.column.isEditing = false

          // 处理操作符
          if (!meta.operator.value) {
            meta.operator.isEditing = true
            meta.operator.show = true
          }
        }, 200)
      }
    },
    selectConnection (value, meta) {
      meta.isEditing = false
    },
    columnClick (meta) {
      meta.column.isEditing = true
      this.$nextTick(() => {
        this.$refs.columnSelect.focus()
      })
    },
    columnBlur (meta, index) {
      setTimeout(() => {
        meta.column.name = meta.column.name.replace(/"/g, '')
        meta.column.isEditing = false
        if (meta.isEmpty()) {
          if (this.metaList.length > 1) {
            this.metaList.splice(index - 1, 2)
          } else {
            this.metaList.splice(index, 1)
          }
        }
      }, 200)
    },
    connectionClick (meta) {
      meta.isEditing = true
    },
    // 选择操作符的事件
    selectOperator (operator, meta) {
      meta.operator.value = operator
      meta.operator.isEditing = false
      // 处理搜索值
      meta.value.isEditing = true
      meta.value.show = true
      // 若是in或not in，column的type要改成array，否则是string
      if (operator.toLowerCase().indexOf('in') > -1) {
        meta.column.type = columnType.array
        meta.value.value = []
      } else if (['>', '<', '>=', '<='].indexOf(operator) > -1) {
        meta.column.type = columnType.number
      } else {
        meta.column.type = columnType.string
        if (_.isArray(meta.value.value)) {
          meta.value.value = ''
        }
      }
      this.$nextTick(() => {
        this.$refs.valueInput.focus()
      })
    },
    operatorClick (meta) {
      meta.operator.isEditing = true
    },
    valueBlur (meta) {
      if (meta.column.type === columnType.array) {
        let valueArr = []
        if (!_.isArray(meta.value.value)) {
          let value = meta.value.value.trim().replace(/"/g, "'")
          if (value.indexOf('(') === 0 && value.indexOf(')') === value.length - 1) {
            value = value.substring(1, value.length)
            value = value.substring(0, value.length - 1)
          }
          valueArr = value.split(',')
        } else {
          valueArr = meta.value.value
        }
        meta.value.value = valueArr.map(v => {
          let str = v.trim().replace(/"/g, "'")
          if (str[0] === "'" && str[str.length - 1] === "'") {
            str = str.substring(1, str.length)
            str = str.substring(0, str.length - 1)
          }
          if (str.indexOf("'") > -1) {
            str = str.replace(/'/g, "''")
          }
          return str
        })
        let label = '('
        meta.value.value.forEach(v => {
          label += `'${v}',`
        })
        label = label.substring(0, label.length - 1)
        label += ')'
        meta.value.label = label
      } else {
        if (!_.isNumber(meta.value.value)) {
          let str = meta.value.value.trim().replace(/"/g, "'")
          if (str[0] === "'" && str[str.length - 1] === "'") {
            str = str.substring(1, str.length)
            str = str.substring(0, str.length - 1)
          }
          if (str.indexOf("'") > -1) {
            str = str.replace(/'/g, "''")
          }
          meta.value.value = str
        }
        meta.value.label = meta.value.value // label是显示，value是实际值
      }
      meta.value.isEditing = !meta.isCompleteCondition()
    },
    valueClick (meta) {
      meta.value.isEditing = true
      this.$nextTick(() => {
        this.$refs.valueInput.focus()
      })
    },
    // 判断是否是用户自己添加的内容，用于判断是否是全局搜索
    isCustomized (value) {
      return !this.columnList.some(meta => {
        return meta.name === value
      })
    },
    enterSearch () {
      const isEditing = this.metaList.some(meta => meta.value.isEditing)
      if (!isEditing) {
        this.search()
      }
    },
    search () {
      if (this.metaList.length > 0) {
        const parser = new Parser(this.columnList)
        const errorList = parser.validateMeta(this.metaList)
        if (_.isEmpty(errorList)) {
          this.$emit('search', parser.parseMeta(this.metaList))
        } else {
          this.$message.error(handleErrorTip(errorList[0]))
        }
      } else {
        this.$emit('search', { q: '', str: '', metaList: [] })
      }
    },
    changeMode () {
      const parser = new Parser(this.columnList)
      const errorList = parser.validateMeta(this.metaList)
      if (_.isEmpty(errorList)) {
        this.$emit('changeMode', 'text', parser.parseMeta(this.metaList))
      } else {
        this.$emit('changeMode', 'text', { metaList: [], str: '' })
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
      params.forEach(param => {
        const column = this.columnList.find(column => {
          return column.name === param.column
        })
        const meta = new Meta()
        meta.column.name = param.column
        meta.column.type = column ? column.type : columnType.string
        meta.column.label = column ? column.label : param.column
        meta.operator.value = '='
        meta.operator.show = true
        meta.value.value = this.handleValue(param.value, column, column.operator)
        meta.value.show = true
        meta.value.label = meta.value.value
        this.addCondition(meta)
      })
    },
    changeParams (params) {
      params.forEach(param => {
        const oldColumn = this.columnList.find(column => {
          return column.name === param.oldParam.column
        })
        const newColumn = this.columnList.find(column => {
          return column.name === param.newParam.column
        })
        const meta = this.metaList.find(m => m.column && m.column.name === oldColumn.name && m.operator.value === param.oldParam.operator && m.value.value === this.handleValue(param.oldParam.value, oldColumn, param.oldParam.operator))
        if (meta) {
          meta.column.name = newColumn.name
          meta.column.type = newColumn.type
          meta.column.label = newColumn.label ? newColumn.label : newColumn.name
          meta.operator.value = param.newParam.operator
          meta.value.value = this.handleValue(param.newParam.value, newColumn, param.newParam.operator)
          meta.value.label = meta.value.value
        }
      })
    },
    removeParams (params) {
      params.forEach(param => {
        const column = this.columnList.find(c => {
          return c.name === param.column
        })
        const metaIndex = this.metaList.findIndex(m => m.column && m.column.name === param.column && m.operator.value === param.operator && m.value.value === this.handleValue(param.value, column, param.operator))
        // 不是在首位，则删除时顺带删除前一个index（and或or），否则顺带删除后一个index
        if (metaIndex > 0) {
          this.metaList.splice(metaIndex - 1, 2)
        } else if (this.metaList.length === 1) {
          this.metaList.splice(metaIndex, 1)
        } else {
          this.metaList.splice(metaIndex, 2)
        }
      })
    }
  },
  mounted () {
    const vm = this
    this.emitter.on('advanced-search', function () {
      vm.search()
    })
  },
  watch: {
    convertMetaList: {
      immediate: true,
      deep: true,
      handler (n) {
        if (!_.isEmpty(n)) {
          this.metaList = n
        }
      }
    }
  }
}
</script>
