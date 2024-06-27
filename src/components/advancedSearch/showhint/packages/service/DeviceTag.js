import { dataTemplate, fieldTemplate } from './template'

export class DeviceTag {
  constructor (context, params) {
    // 先从缓存获取数据
    this.queryparams = params
    this.context = context
  }

  filterQueryData (list) {
    return list
  }

  getDataFromRemote () {
    // 从 远程,也就是请求接口获取数据
    return this.context.$get('/deviceTag', this.queryparams).then((res) => {
      this.context.initDataReadyCb && this.context.initDataReadyCb(res.data || null) // 组件 请求 文件成功回调
      if (res.code === 200) {
        const data = res.data && res.data.list
        return data
      } else {
        // this.context.$message({
        //   message: '请求 DeviceTag数据失败',
        //   type: 'error',
        //   showClose: true
        // });
      }
      return null
    }).catch((err) => {
      console.error(err)
    })
  }

  formatData (data) {
    // 格式化  获取的数据
    const resultData = {
      operatesList: [
        {
          name: 'AND',
          function: 'A AND B',
          type: 'abstract',
          label: 'AND'
        }
      ],
      filtersList: data ? this.filterQueryData(data.fields || []) : [],
      // 操作符仓库  用于记录 类型 和 操作符之间的映射关系
      operatesDic: data ? data.doc.schema_query.references.operator || [] : [],
      // operator  记录运算符的label 和 value 映射 以及操作符的使用方法
      operatorManual: data ? data.doc.functions.operator || [] : []
    }
    return resultData
  }

  organizeData (data = []) {
    const fields = []
    const res = JSON.parse(JSON.stringify(dataTemplate))
    if (!data) {
      return
    }
    data.forEach((item, index) => {
      const fieldItem = JSON.parse(JSON.stringify(fieldTemplate))
      fieldItem.name = item.tagValue
      fieldItem.type = 'Array'
      fieldItem.label = item.tagName
      fieldItem.doc.data = (item.subTags || []).map(tagItem => {
        return {
          code: `'${tagItem.tagValue}'`, // 匹配SQL 的时候,这个Code 要加 ''
          value: tagItem.tagName,
          type: tagItem.tagType
        }
      })
      fields.push(fieldItem)
    })
    res.fields = fields
    return res
  }

  getFormatedData (callback) {
    this.getDataFromRemote().then(data => {
      // 组织数据 模拟scama
      const organizedData = this.organizeData(data)
      // 格式化数据
      this.data = this.formatData(organizedData)
      // 获取scameData的时候 查询映射字段
      callback && callback(this.data)
    })
  }

  dispose () {
    this.context = null
    this.queryparams = null
    this.data = null
  }
}
