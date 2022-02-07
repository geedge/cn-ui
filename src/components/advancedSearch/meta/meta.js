import _ from 'lodash'
export const connection = 'connection'
export const condition = 'condition'
export const columnType = {
  fullText: 'fullText',
  string: 'string',
  long: 'long',
  number: 'number',
  array: 'array'
}
export const defaultOperatorList = ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'LIKE', 'NOT LIKE']
export const defaultConnectionList = [
  {
    value: 'AND',
    label: 'AND'
  },
  {
    value: 'OR',
    label: 'OR'
  }
]
export default class Meta {
  // meta元数据有两种，一是condition，表示字段、操作符、值的组合，二是connection，是condition之间的连接符，AND | OR
  constructor (type) {
    switch (type) {
      case connection: {
        this.newConnection()
        break
      }
      default: {
        this.newCondition()
        break
      }
    }
  }

  newConnection () {
    this.meta = connection
    this.value = 'AND'
    this.isEditing = false
  }

  newCondition () {
    this.meta = condition
    this.column = {
      name: '',
      type: '', // fullText | string | long ...
      label: '',
      isEditing: false
    }
    this.operator = {
      value: '',
      isEditing: false,
      show: false
    }
    this.value = {
      value: '',
      label: '',
      isEditing: false,
      show: false
    }
  }

  isEmpty () {
    if (this.meta === condition) {
      return _.isEmpty(this.column.name)
    } else {
      return true
    }
  }

  // 是否是完整的condition
  isCompleteCondition () {
    return (this.column.type === columnType.fullText)
      ? !_.isEmpty(this.column.name)
      : !_.isEmpty(this.column.name) && !_.isEmpty(this.operator.value) && !_.isEmpty(this.value.value)
  }

  // 取消editing状态
  cancelEditing () {
    if (this.meta === condition) {
      this.column.isEditing = false
      this.operator.isEditing = false
      this.value.isEditing = false
    }
    if (this.meta === connection) {
      this.isEditing = false
    }
  }

  resetOperator () {
    this.operator = {
      value: '',
      isEditing: false,
      show: false
    }
  }

  resetValue () {
    this.value = {
      value: '',
      label: '',
      isEditing: false,
      show: false
    }
  }
}

export function cloneMeta (source) {
  if (source instanceof Meta) {
    const m = new Meta(source.meta)
    Object.keys(source).forEach(s => {
      m[s] = _.cloneDeep(source[s])
    })
    return m
  } else if (_.isArray(source)) {
    return source.map(s => {
      return cloneMeta(s)
    })
  }
}
