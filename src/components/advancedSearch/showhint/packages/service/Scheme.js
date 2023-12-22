export class Scheme {
  constructor (context, params, list) {
    // 先从缓存获取数据
    this.queryparams = params
    this.context = context
    this.columnList = list
    this.schemeData = null
    this.myCacheData = {
      doc: {
        functions: {
          aggregation: [],
          date: [],
          operator: [
            {
              name: '=',
              label: '=',
              function: 'expr = value'
            },
            {
              name: 'has',
              label: 'HAS',
              function: 'has(expr, value)'
            },
            {
              name: 'in',
              label: 'IN',
              function: 'expr in (values)'
            },
            {
              name: 'like',
              label: 'LIKE',
              function: 'expr like value'
            }
          ]
        },
        schema_query: {
          references: {
            aggregation: [
              {
                type: 'int',
                functions: ''
              },
              {
                type: 'string',
                functions: ''
              },
              {
                type: 'array',
                functions: ''
              }
            ],
            operator: [
              {
                type: 'int',
                functions: '=,in,like,has'
              },
              {
                type: 'string',
                functions: '=,in,like,has'
              },
              {
                type: 'array',
                functions: '=,in,like,has'
              }
            ]
          }
        }
      }
    }
  }

  filterQueryData (list) {
    // 仅仅过滤掉 无用的数据 allow_query 为false 的数据  visibility==hidden/disabled  DoS日志补充 start_time
    const denyList = ['recv_time', 'start_time']
    let result
    result = list.filter((item, index) => {
      // return (item.doc && item.doc.allow_query === 'true') && !denyList.includes(item.name)
      // 在前端禁止搜索字段中 或者 接口不允许搜索得字段 过滤掉
      return !(item.doc && item.doc.allow_query === 'false') && !denyList.includes(item.name) && !(item.doc && (item.doc.visibility == 'disabled' || item.doc.visibility == 'hidden'))
    })
    return result || []
  }

  formatSchemaData (data) {
    // 格式化  获取的数据
    const formatedData = {
      operatesList: [
        {
          name: 'AND',
          function: 'A AND B',
          type: 'abstract',
          label: 'AND'
        }
        // {
        //   name: 'OR',
        //   function: 'A OR B',
        //   type: 'abstract',
        //   label: 'OR'
        // }
      ],
      filtersList: data ? this.filterQueryData(data.fields || []) : [],
      // 操作符仓库  用于记录 类型 和 操作符之间的映射关系
      operatesDic: data ? (data.doc.schema_query && data.doc.schema_query.references.operator) || [] : [],

      // 操作符仓库  用于记录 类型 和 聚合函数之间的映射关系
      funcDic: data ? (data.doc.schema_query && data.doc.schema_query.references.aggregation) || [] : [],

      // operator  记录运算符的label 和 value 映射 以及操作符的使用方法
      operatorManual: data ? data.doc.functions.operator || [] : [],

      // 全部附属信息 这些是需要的
      doc: data.doc,

      // 全部字段信息 fields
      fields: data.fields
    }

    // date  和    timestamp 支持的方法  需要特殊处理 ,补充事件函数处理
    const dateFuns = (data?.doc?.functions?.date || []).map(item => {
      return item.name
    })
    formatedData.funcDic.forEach(item => {
      if (['date', 'timestamp'].includes(item.type)) {
        // eslint-disable-next-line no-unused-expressions
        dateFuns.length > 0 ? item.functions = item.functions + ',' + dateFuns.join(',') : ''
      }
    })
    return formatedData
  }

  async getFormatedData (callback) {
    const cacheData = this.myCacheData
    cacheData.fields = this.columnList

    if (this.columnList) {
      this.schemeData = this.formatSchemaData(cacheData)
      // this.getRemoteOptions()
      callback && callback(this.schemeData)
      return
    }
    callback && callback(this.schemeData)
    return this.schemeData
  }

  dispose () {
    this.context = null
    this.schemeData = null
    this.queryparams = null
  }
}
