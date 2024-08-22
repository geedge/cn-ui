<template>
  <div class="tag-search">
    <div class="tag-search__meta"
         v-for="(meta, index) in metaList"
         :key="index"
         :class="`tag-search__meta--${meta.meta}`"
    >
      <template v-if="meta.meta === condition">
        <!-- 删除按钮 -->
        <div class="condition__delete" @click="removeCondition(index)">
          <el-icon><CircleCloseFilled /></el-icon>
          <!--<i class="el-icon-error"></i>-->
        </div>
        <!-- 字段选择 -->
        <div v-if="meta.column.show" class="condition__column">
<!--          <div>-->
          <div v-show="meta.column.isEditing">
            <el-select
                allow-create
                filterable
                size="small"
                v-model="meta.column.label"
                ref="columnSelect"
                :placeholder="meta.column.label || ' '"
                @blur="columnBlur(meta, index)"
                @change="(value) => selectColumn(value, meta)"
            >
              <el-option
                  v-for="column in columnList"
                  :key="column.label"
                  :label="column.label"
                  :value="column.label"
              ></el-option>
            </el-select>
          </div>
          <span v-if="!meta.column.isEditing && meta.operator.value !== 'has'" @click="columnClick(meta)">
            <span v-if="meta.column.show">{{meta.column.label}}</span>
          </span>
          <!--操作符是has时，has需前置-->
          <span v-if="!meta.column.isEditing && meta.operator.value === 'has'" class="condition__operator">{{ meta.operator.value }}</span>
        </div>
        <!-- 已选操作符显示 -->
        <div class="condition__operator" @click="operatorClick(meta)" v-if="meta.operator.show && meta.operator.value !== 'has'">{{meta.operator.value}}</div>
        <div v-if="meta.operator.value === 'has'" class="condition__operator" style="color: #000C18">({{meta.column.label}},</div>
        <!-- 值 -->
        <div class="condition__value">
          <!--点击=操作符时，单个选择枚举值-->
          <div  v-if="meta.value.isEditing && meta.doc && meta.column.type!==columnType.array">
            <el-select
                allow-create
                filterable
                size="small"
                v-model="meta.value.value"
                ref="columnValue"
                :placeholder="meta.value.value || ' '"
                @blur="valueBlur1(meta, index)"
                @change="(value) => selectValue(value, meta)"
            >
              <el-option
                  v-for="code in meta.doc.data"
                  :key="code.code"
                  :label="code.code"
                  :value="code.code"
              ></el-option>
            </el-select>
          </div>

          <!--点击 in 操作符时，多个选择枚举值-->
          <div v-if="meta.value.isEditing && meta.doc && meta.column.type===columnType.array">
            <el-select
                v-model="myCheckboxList"
                ref="valuesSelect"
                multiple
                size="small"
                collapse-tags
                collapse-tags-tooltip
                :placeholder="meta.value.value || ' '"
                @blur="valuesBlur(meta, index)"
                @focus="valuesFocus(meta)"
                @change="(value) => selectValues(value, meta)"
                @visible-change="(value) => selectVisibleValues(value, meta)"
                popper-class="my-select-class"
            >
              <template #label>
                {{ meta.value.value }}
              </template>
              <template #default>
                <el-option
                    v-for="item in meta.doc.data"
                    :key="item.code"
                    :label="item.code"
                    :value="item.code"
                />
              </template>
            </el-select>
          </div>

          <div v-if="meta.value.isEditing && !meta.doc">
            <!--避免blur事件和keyup.enter重复执行-->
            <el-input
                ref="valueInput"
                v-model="meta.value.value"
                size="small"
                @blur="valueBlur(meta)"
                @focus="valueFocus(meta)"
                @keyup.enter="valueBlur(meta)"></el-input>
          </div>
          <div v-if="!meta.value.isEditing && meta.value.label" @click="valueClick(meta)">
<!--            {{ changeLabel(meta.value.label, meta.column.type) }}-->
            {{ meta.value.label }}
          </div>
        </div>
        <div class="condition__value" style="margin-left: -5px;" v-if="meta.operator.show && meta.operator.value === 'has'">)</div>

        <!-- 操作符选择器 -->
        <div class="condition__operation-select" v-if="meta.operator.show && meta.operator.isEditing">
          <div
              class="condition__operation"
              v-for="operator in operatorList"
              :key="operator"
              @click.stop="selectOperator(operator, meta)"
          >{{operator}}</div>
        </div>
      </template>
      <!-- 条件连接符 -->
      <template v-else-if="meta.meta === connection">
        <div class="connection__value">
<!--          <div v-show="meta.isEditing">-->
<!--            <el-select-->
<!--                :placeholder="meta.value"-->
<!--                v-model="meta.value"-->
<!--                size="small"-->
<!--                @change="(value) => selectConnection(value, meta)"-->
<!--            >-->
<!--              <el-option-->
<!--                  v-for="(connection, index) in connectionList"-->
<!--                  :key="index"-->
<!--                  :label="connection.label"-->
<!--                  :value="connection.value"-->
<!--              ></el-option>-->
<!--            </el-select>-->
<!--          </div>-->
          <span v-show="!meta.isEditing">{{meta.value}}</span>
        </div>
      </template>
    </div>
    <div class="tag-search__add" @click="addCondition">{{$t('entities.advancedSearch.add')}}</div>
    <div class="search__suffixes search__suffixes--tag-mode search__suffixes--tag-mode__block" :class="showList ? '' : 'entity-explorer-home'">
      <span class="search__suffix">
        <el-popover
            popper-class="my-popper-class"
            placement="top"
            trigger="hover"
            :content="$t('overall.switchToText')"
        >
          <template #reference>
            <i class="cn-icon cn-icon-search-normal" @click="changeMode"></i>
          </template>
        </el-popover>
      </span>
      <span v-show="metaList.length>0" class="search__suffix search__suffix-close" @click="cleanMetaList">
        <el-icon><CircleCloseFilled /></el-icon>
        <!--<i class="el-icon-error"></i>-->
      </span>
      <span test-id="tag-search" class="search__suffix" @click="search">
        <el-icon><Search /></el-icon>
        <!--<i class="el-icon-search"></i>-->
      </span>
    </div>
  </div>
</template>

<script>
import Meta, { connection, condition, columnType } from './meta/meta'
import _ from 'lodash'
import { handleErrorTip } from '@/components/advancedSearch/meta/error'
import Parser, { stringInQuot } from '@/components/advancedSearch/meta/parser'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
import { enumerateData } from '@/utils/static-data'
export default {
  name: 'TagMode',
  props: {
    columnList: Array,
    connectionList: Array,
    convertMetaList: Array,
    showList: Boolean,
    unitTestStr: String
  },
  data () {
    return {
      condition,
      connection,
      metaList: [],
      columnType,
      myCheckboxList: [],
      operatorList: [] // 操作符列表，根据所选columnList的label来确定，一般为=,IN，tags操作符为has
    }
  },
  emits: ['changeMode', 'search'],
  inject: ['myHighLight'],
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
          const selectList = this.$refs.columnSelect
          if (selectList && selectList.length > 0) {
            this.$refs.columnSelect[selectList.length - 1].focus() // 在for循环里生成的dom，所以是数组
          }
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

      if (this.metaList.length > 0) {
        const parser = new Parser(this.columnList)
        const errorList = parser.validateMeta(this.metaList)
        if (_.isEmpty(errorList)) {
          this.reloadUrl({ q: encodeURI(parser.parseMeta(this.metaList).q) })
        }
      } else {
        const routeQuery = this.$route.query
        delete routeQuery.q
        this.reloadUrl(routeQuery, 'cleanOldParams')
      }
    },
    // 选择搜索条件的事件
    selectColumn (value, meta) {
      // 处理column。如果是用户自己新增的column，视为全文搜索
      if (this.isCustomized(value)) {
        meta.column.type = columnType.fullText
        meta.column.label = value
        meta.column.isFullText = true
        meta.resetOperator()
        meta.resetValue()
      } else {
        const selectedColumn = this.columnList.find(column => {
          return column.label === value
        })
        meta.column.label = selectedColumn.label
        meta.column.type = selectedColumn.type
        setTimeout(() => {
          meta.column.isEditing = false

          // 处理操作符
          if (!meta.operator.value) {
            meta.operator.isEditing = true
            meta.operator.show = true
          } else {
            // 切换column，清除上次column选择的value，包含枚举的则删除，in操作符的让类型回归array
            meta.value.value = ''
            meta.value.label = ''
            meta.value.isEditing = true
            meta.value.show = true
            const obj = enumerateData.find(d => d.name === meta.column.label)
            if (obj) {
              meta.doc = obj
              if (this.$refs.valuesSelect) {
                // 触发focus后，select弹窗并没有生效
                this.$refs.valuesSelect[0].focus(meta)
              }
            } else {
              delete meta.doc
            }
            if (meta.operator.value.toLowerCase() === 'in') {
              meta.column.type = columnType.array
            }
          }
        }, 200)
      }
    },
    selectValue (value, meta) {
      const isWrapped = this.isSingleQuoteWrapping(value)
      meta.value.value = isWrapped && meta.column.type === columnType.string ? value : `'${value}'`
      meta.value.label = isWrapped && meta.column.type === columnType.string ? value : `'${value}'`
      setTimeout(() => {
        meta.column.isEditing = false
        meta.value.isEditing = false
      }, 100)
    },
    selectVisibleValues (value, meta) {
      if (!value) {
        meta.value.isEditing = false
        this.myCheckboxList = []
      }
    },
    selectValues (value, meta) {
      if (value.length > 0) {
        let str = ''
        value.forEach(item => {
          str += `'${item}',`
        })
        str = str.substring(0, str.length - 1)
        str = `(${str})`
        meta.value.value = value
        meta.value.label = str
      } else {
        meta.value.value = ''
      }
    },
    selectConnection (value, meta) {
      meta.isEditing = false
    },
    columnBlur (meta, index) {
      setTimeout(() => {
        const parser = new Parser(this.columnList)
        meta.column.label = meta.column.label.replace(/"/g, '')
        meta.column.isEditing = false
        if (meta.isEmpty()) {
          if (this.metaList.length > 1) {
            this.metaList.splice(index - 1, 2)
          } else {
            this.metaList.splice(index, 1)
          }
        }
        // 根据所选label在columnList中匹配label来确定操作符，一般为=,IN，tags操作符为has
        const obj = this.columnList.find(t => t.label === meta.column.label)
        this.operatorList = obj ? obj.doc.constraints.operator_functions.split(',') : ['=', 'IN']
        if (meta.column && meta.column.type === columnType.fullText) {
          meta.operator.value = '='
          meta.column.show = false
          meta.column.isFullText = true
          meta.operator.show = false
          const label = JSON.parse(JSON.stringify(meta.column.label))
          meta.column.label = parser.getEntityTypeByValue(meta.column.label)
          meta.value.value = label
          meta.value.label = label

          if (meta.column.label === 'domain') {
            meta.operator.value = 'like'
            meta.value.value = `%${this.delSingleQuote(label)}`
            meta.value.label = `%${this.delSingleQuote(label)}`
          } else if (meta.column.label === 'app') {
            meta.operator.value = 'like'
            meta.value.value = `%${this.delSingleQuote(label)}%`
            meta.value.label = `%${this.delSingleQuote(label)}%`
          }
          meta.column.type = 'string'
        }
      }, 200)
    },
    valueBlur1 (meta) {
      setTimeout(() => {
        meta.value.isEditing = false
      }, 200)
    },
    valuesBlur (meta) {
      this.$nextTick(() => {
      })
    },
    valuesFocus (meta) {
      this.$nextTick(() => {
        meta.value.isEditing = true
        setTimeout(() => {
          if (meta.value.value && this.myCheckboxList.length === 0) {
            let valueArr = []
            if (!_.isArray(meta.value.value)) {
              let value = meta.value.value
              if (value.indexOf('(') === 0 && value.indexOf(')') === value.length - 1) {
                value = value.substring(1, value.length)
                value = value.substring(0, value.length - 1)
              }
              valueArr = value.split(',')
              valueArr.forEach((item, index) => {
                if (item[0] === "'" && item[item.length - 1] === "'") {
                  item = item.substring(1, item.length - 1)
                  this.myCheckboxList.push(item)
                }
              })
            } else if (_.isArray(meta.value.value)) {
              meta.value.value.forEach(item => {
                this.myCheckboxList.push(item)
              })
            }
          }
        }, 100)
      })
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
      const obj = enumerateData.find(d => d.name === meta.column.label)
      if (obj) {
        meta.doc = obj
      }
      // 若是in或not in，column的type要改成array，否则是string
      if (operator.toLowerCase().indexOf('in') > -1) {
        meta.column.type = columnType.array
      } else if (['>', '<', '>=', '<='].indexOf(operator) > -1) {
        meta.column.type = columnType.number
      } else {
        meta.column.type = columnType.string
        if (_.isArray(meta.value.value)) {
          meta.value.value = ''
        }
      }
      this.$nextTick(() => {
        if (meta.doc) {
          const selectList = this.$refs.columnValue
          if (selectList && selectList.length > 0) {
            this.$refs.columnValue[selectList.length - 1].focus() // 在for循环里生成的dom，所以是数组
          }
        } else {
          const selectList = this.$refs.valueInput
          if (selectList && selectList.length > 0) {
            this.$refs.valueInput[selectList.length - 1].focus() // 在for循环里生成的dom，所以是数组
          }
        }
      })
    },
    operatorClick (meta) {
      meta.operator.isEditing = true
      if (!this.operatorList.length) {
        const obj = this.columnList.find(t => t.label === meta.column.label)
        this.operatorList = obj ? obj.doc.constraints.operator_functions.split(',') : ['=', 'IN']
      }
    },
    valueFocus (meta) {
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
          // 如果此时参数为xi'an，处理为xi''an，后一个条件避免若参数为xi''an,则不处理
          if (str.indexOf("'") > -1 && str.indexOf("''") === -1) {
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
          // let str = meta.value.value.trim().replace(/"/g, "'")
          // if (str[0] === "'" && str[str.length - 1] === "'") {
          //   str = str.substring(1, str.length)
          //   str = str.substring(0, str.length - 1)
          // }
          // // 如果此时参数为xi'an，处理为xi''an，后一个条件避免若参数为xi''an,则不处理
          // if (str.indexOf("'") > -1 && str.indexOf("''") === -1) {
          //   str = str.replace(/'/g, "''")
          // }
          // if (str[0] === '%') {
          //   str = str.substring(1, str.length)
          // }
          // if (str[str.length - 1] === '%') {
          //   str = str.substring(0, str.length - 1)
          // }
          // meta.value.value = str
        }
        // meta.value.label = meta.value.value // label是显示，value是实际值
      }
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
          // 如果此时参数为xi'an，处理为xi''an，后一个条件避免若参数为xi''an,则不处理
          if (str.indexOf("'") > -1 && str.indexOf("''") === -1) {
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
        if (!_.isNumber(meta.value.value) && meta.value.value !== '') {
          // 判断是否被单引号包裹
          const regex = /^'[^']*'$/
          const isWrapped = regex.test(meta.value.value)

          let str = meta.value.value.trim().replace(/"/g, "'")
          if (str[0] === "'" && str[str.length - 1] === "'") {
            str = str.substring(1, str.length)
            str = str.substring(0, str.length - 1)
          }
          // 如果此时参数为xi'an，处理为xi''an，后一个条件避免若参数为xi''an,则不处理
          if (str.indexOf("'") > -1 && str.indexOf("''") === -1) {
            str = str.replace(/'/g, "''")
          }

          // domain和app选择like时，添加%
          if (meta.operator.value.toLowerCase() === 'like') {
            if (meta.column.label.toLowerCase() === 'domain') {
              if (meta.value.label1) {
                if (str[0] !== '%') {
                  meta.value.label1 = `%${str}`
                } else {
                  meta.value.label1 = `${str}`
                }
              }
            }

            if (meta.column.label.toLowerCase() === 'app') {
              if (meta.value.label1) {
                if (str[0] !== '%' && str[str.length - 1] !== '%') {
                  meta.value.label1 = `%${str}%`
                } else {
                  meta.value.label1 = `${str}`
                }
              }
            }
          }

          if (isWrapped) {
            meta.value.value = `'${str}'`
            if (meta.value.label1) {
              meta.value.label1 = `'${meta.value.label1}'`
            }
          }
        }
        meta.value.label = meta.value.value // label是显示，value是实际值
      }
      meta.value.isEditing = !meta.isCompleteCondition()
    },
    columnClick (meta) {
      meta.column.isEditing = true
      this.$nextTick(() => {
        this.$refs.columnSelect[this.$refs.columnSelect.length - 1].focus()
      })
    },
    valueClick (meta) {
      meta.value.isEditing = true
      const obj = enumerateData.find(d => d.name === meta.column.label)
      if (obj) {
        meta.doc = obj
      }
      this.$nextTick(() => {
        if (this.$refs.valueInput) {
          this.$refs.valueInput[0].focus()
        }
        if (this.$refs.valuesSelect.length > 0) {
          // 触发focus后，select弹窗并没有生效
          this.$refs.valuesSelect[0].focus(meta)
        }
      })
    },
    // 判断是否是用户自己添加的内容，用于判断是否是全局搜索
    isCustomized (value) {
      return !this.columnList.some(meta => {
        return meta.label === value
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
        let errorList = parser.validateMeta(this.metaList)
        // 测试的metaList并不是由new Meta()生成，所以instanceof时，meta并不在Meta原型链上导致报错，故直接略过
        if (this.isUnitTesting) {
          errorList = []
        }
        const keywordList = this.myHighLight ? parser.getKeywordList(this.metaList) : [] // 搜索高亮的关键字
        if (_.isEmpty(errorList)) {
          const strObj = parser.handleMetaListToStr(this.metaList)
          const str = strObj.str ? strObj.str : strObj
          const str2 = strObj.str2 ? strObj.str2 : strObj
          // str为将metaList转成字符串的值，str2为地址栏展示的值
          let key = parser.handleEntityTypeByStr(str)
          key = parser.conversionEnum(key)
          this.$emit('search', { ...parser.parseStr(key), str: str2, keywordList: keywordList })
        } else {
          this.$message.error(handleErrorTip(errorList[0]))
        }
      } else {
        this.$emit('search', { q: '', str: '', metaList: [] })
      }
    },
    changeMode () {
      if (this.metaList.length > 0) {
        const parser = new Parser(this.columnList)
        const errorList = parser.validateMeta(this.metaList)
        if (_.isEmpty(errorList)) {
          this.reloadUrl({ mode: 'text' })
          const strObj = parser.handleMetaListToStr(this.metaList)
          const str2 = strObj.str2 ? strObj.str2 : strObj
          this.$emit('changeMode', 'text', { str: str2 })
        } else {
          this.reloadUrl({ mode: 'text' })
          this.$emit('changeMode', 'text', { metaList: [], str: '' })
        }
      } else {
        this.reloadUrl({ mode: 'text' })
        this.$emit('changeMode', 'text', { metaList: [], str: '' })
      }
    },
    // 处理value，例如转换IN的值
    handleValue (value, column, operator, flag) {
      const isArray = ['IN', 'NOT IN'].indexOf(operator) > -1
      if (isArray) {
        if (_.isArray(value)) {
          value = value.map(v => column.type === columnType.string ? stringInQuot(v) : v)
          return `(${value.join(',')})`
        } else {
          return value
        }
      } else {
        let newValue = (column.type.items ? column.type.items : column.type) === columnType.string ? stringInQuot(value) : value
        if (flag) {
          newValue = newValue.slice(1)
          newValue = newValue.slice(0, newValue.length - 1)
          return newValue
        } else {
          return newValue
        }
      }
    },
    addParams (params) {
      params.forEach(param => {
        const column = this.columnList.find(column => {
          return column.label === param.column
        })
        const meta = new Meta()
        meta.column.label = param.column
        meta.column.type = column ? (column.type.items ? column.type.items : column.type) : columnType.string
        meta.column.label = column ? column.label : param.column
        meta.operator.value = param.operator
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
          return column.label === param.oldParam.column
        })
        const newColumn = this.columnList.find(column => {
          return column.label === param.newParam.column
        })
        const meta = this.metaList.find(m => m.column && m.column.label === oldColumn.label && m.operator.value === param.oldParam.operator && m.value.value === this.handleValue(param.oldParam.value, oldColumn, param.oldParam.operator))
        if (meta) {
          meta.column.label = newColumn.label
          meta.column.type = newColumn.type
          meta.column.label = newColumn.label ? newColumn.label : newColumn.label
          meta.operator.value = param.newParam.operator
          meta.value.value = this.handleValue(param.newParam.value, newColumn, param.newParam.operator)
          meta.value.label = meta.value.value
        }
      })
    },
    removeParams (params) {
      params.forEach(param => {
        const column = this.columnList.find(c => {
          return c.label === param.column
        })
        const obj = this.metaList.find(d => d.column && d.column.label === param.column && d.value && (d.value.value === `'${param.value[0]}'` || d.value.value === param.value[0]))
        if (obj) {
          const metaIndex = this.metaList.findIndex(m => m.column && m.column.label === param.column && m.operator.value === param.operator && m.value.value === this.handleValue(param.value, column, param.operator))
          // 不是在首位，则删除时顺带删除前一个index（and或or），否则顺带删除后一个index
          if (metaIndex > 0) {
            this.metaList.splice(metaIndex - 1, 2)
          } else if (this.metaList.length === 1) {
            this.metaList.splice(metaIndex, 1)
          } else {
            this.metaList.splice(metaIndex, 2)
          }
        }
      })
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
    cleanMetaList () {
      this.metaList = []
      const routeQuery = this.$route.query
      delete routeQuery.q
      this.reloadUrl(routeQuery, 'cleanOldParams')
    },
    isSingleQuoteWrapping (str) {
      const regex = /^'[^']*'$/
      return regex.test(str)
    },
    delSingleQuote (str) {
      if (str[0] === "'" && str[str.length - 1] === "'") {
        str = str.substring(1, str.length)
        str = str.substring(0, str.length - 1)
      }
      return str
    },
    changeLabel (label, type) {
      // 用户输入'baidu'，实际搜索的值为app like '%baidu%'
      // 此时展示的值为'%baidu%'，为展示用户输入的值，则将添加的%删除
      let str = JSON.parse(JSON.stringify(label))
      if (str[0] === "'" && str[str.length - 1] === "'") {
        str = str.substring(1, str.length)
        str = str.substring(0, str.length - 1)
      }
      if (str[0] === '%') {
        str = str.substring(1, str.length)
      }
      if (str[str.length - 1] === '%') {
        str = str.substring(0, str.length - 1)
      }

      if (type === 'string') {
        return `'${str}'`
      } else {
        return str
      }
    }
  },
  mounted () {
    const vm = this
    // 如果地址栏包含参数q，则匹配出metaList到搜索栏回显使用
    let { q } = this.$route.query
    if (q && !this.convertMetaList) {
      const parser = new Parser(this.columnList)
      if (q.indexOf('+') > -1) {
        q = q.replace('+', '')
      }
      if (q.indexOf('%') === 0 || q.indexOf('%20') > -1 || q.indexOf('%25') > -1) {
        q = decodeURI(q)
      } else {
        const str1 = q.substring(q.indexOf('%'), q.indexOf('%') + 3)
        if (q.indexOf('%') > 0 && (str1 === '%20' || str1 === '%25')) {
          q = decodeURI(q)
        }
      }
      this.metaList = parser.parseStr(q).metaList
    }

    if (!this.isUnitTesting) {
      this.emitter.on('advanced-search', function () {
        vm.search()
      })
    }
  },
  watch: {
    convertMetaList: {
      immediate: true,
      deep: true,
      handler (n) {
        if (!_.isEmpty(n)) {
          this.metaList = n
          // 从text模式的模糊搜索转换过来时，需要添加属性
          const parser = new Parser(this.columnList)
          this.metaList.forEach(item => {
            if (item.column && item.column.type === 'fullText') {
              item.operator.value = '='
              item.column.show = false
              item.column.isFullText = true
              item.operator.show = false
              const label = JSON.parse(JSON.stringify(item.column.label))
              item.column.label = parser.getEntityTypeByValue(item.column.label)
              item.value.value = label
              item.value.label = label

              const isWrapped = this.isSingleQuoteWrapping(label)
              if (item.column.label === 'domain') {
                item.operator.value = 'like'
                item.value.value = isWrapped ? `'${this.delSingleQuote(label)}'` : `${this.delSingleQuote(label)}`
                item.value.label = isWrapped ? `'${this.delSingleQuote(label)}'` : `${this.delSingleQuote(label)}`
                item.value.label1 = isWrapped ? `'%${this.delSingleQuote(label)}'` : `%${this.delSingleQuote(label)}`
              } else if (item.column.label === 'app') {
                item.operator.value = 'like'
                item.value.value = isWrapped ? `'${this.delSingleQuote(label)}'` : `${this.delSingleQuote(label)}`
                item.value.label = isWrapped ? `'${this.delSingleQuote(label)}'` : `${this.delSingleQuote(label)}`
                item.value.label1 = isWrapped ? `'%${this.delSingleQuote(label)}%'` : `%${this.delSingleQuote(label)}%`
              }
              item.column.type = 'string'
            }
          })
        }
      }
    }
  }
}
</script>
