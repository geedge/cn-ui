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
            <el-input v-model="meta.value.value" size="mini" @blur="valueBlur(meta)" ref="valueInput"></el-input>
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
import SqlParser, { stringInQuot } from '@/components/advancedSearch/meta/sql-parser'
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
  methods: {
    // 新增条件
    addCondition (meta) {
      this.metaList.forEach(m => {
        console.info(m)
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
          this.metaList = this.metaList.slice(0, 2)
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
      this.$nextTick(() => {
        this.$refs.valueInput.focus()
      })
    },
    operatorClick (meta) {
      meta.operator.isEditing = true
    },
    valueBlur (meta) {
      meta.value.value = meta.value.value.replace(/"/g, "'")
      meta.value.label = meta.value.value // label是显示，value是实际值；目前的需求label和value是相等的，
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
    search () {
      const parser = new SqlParser(this.metaList, this.columnList)
      const { metaList, formatSql } = parser.formatMetaList()
      this.metaList = metaList
      this.$emit('search', this.metaList, formatSql)
    },
    changeMode () {
      const parser = new SqlParser(this.metaList, this.columnList)
      const { metaList, formatSql } = parser.formatMetaList()
      this.metaList = metaList
      this.$emit('changeMode', 'text', formatSql)
    },
    addParams (params) {
      Object.keys(params).forEach(key => {
        const column = this.columnList.find(column => {
          return column.name === key
        })
        const meta = new Meta()
        meta.column.name = key
        meta.column.type = column ? column.type : columnType.string
        meta.column.label = column ? column.label : key
        meta.operator.value = '='
        meta.operator.show = true
        meta.value.value = meta.column.type === columnType.string ? stringInQuot(params[key]) : params[key]
        meta.value.show = true
        meta.value.label = meta.value.value
        this.addCondition(meta)
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
        }
      }
    }
  }
}
</script>
