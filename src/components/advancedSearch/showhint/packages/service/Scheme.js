// import vm from '@/main.js'
import { getSchemaInfo } from '@/utils/timeQueryApi'
import { cacheData } from '@/components/advancedSearch/showhint/packages/service/mockData'
// import {cacheData} from "@/components/common/search/packages/service/oldMockData";

export class Scheme {
  constructor (context, params) {
    // 先从缓存获取数据
    this.queryparams = params
    this.context = context
    this.schemeData = null
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

  async getSchemaDataFromRemote () {
    const schemaData = await getSchemaInfo(this.queryparams?.logType)
    this.context.initDataReadyCb && this.context.initDataReadyCb(schemaData || null)
    return schemaData
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

  getRemoteOptions () {
    // query   查询地址  key 关键字(唯一标识)  value 值就是label 用于展示
    this.schemeData.filtersList.forEach((item) => {
      if (item.doc && item.doc.data) {
        return
      }
      if (item.doc && item.doc.dict_location) {
        const { path, key, value } = item.doc.dict_location
        return vm.$get(path, { pageSize: 500, pageNo: 1 }).then((res) => {
          if (res.code === 200) {
            const dataList = res.data.list
            if (res.data.total > 500) {
              // 超出500条 直接不处理了 ,没缓存
              return
            }
            localStorage.setItem(`${this.context.$route.path}_${item.name}`, JSON.stringify(res.data.list))
            const data = dataList.map(item => {
              return {
                code: item[key],
                value: item[value]
              }
            })
            item.doc.data = data
          }
        }).catch((err) => {
          console.error(err)
        })
      }
    })
  }

  async getFormatedData (callback) {
    const cacheDat = cacheData
    if (cacheDat) {
      this.schemeData = this.formatSchemaData(cacheDat)
      // this.getRemoteOptions()
      callback && callback(this.schemeData)
      return
    }
    this.getSchemaDataFromRemote().then(data => {
      this.schemeData = this.formatSchemaData(data)
      // 获取schemaData的时候 查询映射字段
      // this.getRemoteOptions()
      callback && callback(this.schemeData)
    })
    callback && callback(this.schemeData)
    return this.schemeData
  }

  dispose () {
    this.context = null
    this.schemeData = null
    this.queryparams = null
  }
}
