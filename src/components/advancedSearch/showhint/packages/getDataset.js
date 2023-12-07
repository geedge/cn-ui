//  改js  用户获取初始化的 SchemaData
import { Scheme } from './service/Scheme'

export class Dataset {
  constructor ({ operatesList, filtersList, operatesDic, funcDic, operatorManual, fields, doc }) {
    this.sourceData = {}
    this.sourceData = this.keepSourcedata(operatesList, funcDic, filtersList, operatesDic, operatorManual, fields, doc)
    // 存储格式化的数据
    this.hintData = {}
    this.hintData.operatesList = this.formatOperates(operatesList)
    this.hintData.filtersList = this.formatFilters(filtersList)
  }

  getHintList (keyword, sqlKeywordsOptions = null, callback, completeFilter) {
    // 获取提示列表
    const operatesList = this.matchFilter(sqlKeywordsOptions || this.hintData.operatesList || [], keyword)
    const filtersList = this.matchFilter(this.hintData.filtersList || [], keyword)

    const hintList = [...operatesList, ...filtersList]
    callback && callback(operatesList, filtersList, hintList)
    return hintList
  }

  getClientwords () {
    // 获取高亮的 可查询的 字段
    const filtersList = this.sourceData.filtersList || []
    const clientwords = []
    filtersList.forEach((item) => {
      // 可以在这里增加  过滤逻辑
      // todo client由name改为label
      // clientwords.push(item.name)
      clientwords.push(item.label)
    })
    return clientwords
  }

  matchFilter (list, keyword) {
    // 用于 匹配过滤器
    const results = list.filter((item) => {
      if (item.type === 'abstract') {
        return true
      }
      let displayTextLow = item.displayText + '' ? (item.displayText + '').toLowerCase() : item.displayText
      let keywordLow = keyword + '' ? (keyword + '').toLowerCase() : keyword

      const reg = /[ '"]/ig
      displayTextLow = (displayTextLow + '').replace(reg, '').toLowerCase()
      keywordLow = (keywordLow + '').replace(reg, '').toLowerCase()

      return displayTextLow && displayTextLow.indexOf(keywordLow) !== -1
    })
    const hasEnable = results.some((item) => {
      return item.type !== 'abstract'
    })
    return hasEnable ? results : []
  }

  formatFilters (list) {
    // 格式化 过滤器
    if (!(list && list.length > 0)) {
      return
    }
    let tempTitle
    let results
    tempTitle = {
      type: 'abstract',
      text: '',
      // displayText: "Filter",
      displayText: 'filter',
      className: 'divider hint-title',
      hint (cm, callback, options) {
      }
    }

    results = list.map((item) => {
      return {
        // text: item.name,
        // displayText: `${item.label}(${item.name})`,
        text: item.label,
        displayText: `${item.name}(${item.label})`,
        className: 'filter-item el-dropdown-menu__item relative-item'
      }
    })
    results.unshift(tempTitle)
    return results
  }

  formatOperates (list) {
    // 格式化 操作符
    if (!(list && list.length > 0)) {
      return
    }
    let tempTitle = {}
    let results = []
    tempTitle = {
      type: 'abstract',
      text: '',
      // displayText: "Operator",
      displayText: 'operator',
      className: 'divider hint-title'
      // hint(cm, callback, options) {}
    }

    results = list.map((item) => {
      return {
        text: item.name,
        displayText: item.name,
        className: 'operates-item el-dropdown-menu__item relative-item'
        // hint(cm, callback, options) {}
      }
    })
    results.unshift(tempTitle)
    return results
  }

  keepSourcedata (operatesList, funcDic, filtersList, operatesDic, operatorManual, fields, doc) {
    // 初始化原始数据  方法(存放的是 全量原始数据)
    const sourceData = {}
    // 支持的逻辑运算符
    sourceData.operatesList = operatesList || []
    // 过滤器列表
    sourceData.filtersList = filtersList || []
    sourceData.operatesDic = operatesDic || []
    sourceData.operatorReference = doc?.functions?.operator || []
    sourceData.operatorManual = operatorManual || []

    // 添加全量数据
    sourceData.fields = fields || []
    sourceData.doc = doc || {}

    // 存储function 的原始变量
    sourceData.funcDic = funcDic || []
    const aggregation = doc?.functions?.aggregation || []
    const dateFuns = doc?.functions?.date || []
    sourceData.funcReference = [...dateFuns, ...aggregation]

    return sourceData
  }

  matchHightlight (keyWord) {
    // 匹配高亮
    // var reg = new RegExp(keyWord, 'i')
    let matchFlag = false
    // reg.test(val)
    matchFlag = this.sourceData.operatesList.some((item) => {
      return keyWord === item.name
    })
    if (matchFlag) {
      return 'keyword'
    }
    if (matchFlag) {
      return 'variable-2'
    }
    matchFlag = this.sourceData.filtersList.some((item) => {
      return keyWord === item.name
    })
    if (matchFlag) {
      return 'comment'
    }
    matchFlag = this.sourceData.specialCharacters.some((item) => {
      return keyWord === item.name
    })
    if (matchFlag) {
      return 'atom'
    }
  }

  getOperates (type, item) {
    // 获取 当前类型支持的操作符
    let operator_functions = ''
    if (item && item.doc && item.doc.constraints && item.doc.constraints.operator_functions) {
      operator_functions = item.doc.constraints.operator_functions
    } else {
      const functions = this.sourceData.operatesDic.find(item => {
        return item.type === type
      })
      operator_functions = functions && functions.functions || ''
    }
    const funList = operator_functions.split(',')
    let result = []
    result = funList.map((item) => {
      return {
        text: item,
        displayText: item,
        className: 'filter-item el-dropdown-menu__item relative-item'
      }
    })
    return result
  }

  getFunctions (type, item) {
    // 获取 当前类型支持的操作符
    let functionsInfo = ''
    // 这里肯定有问题
    if (item && item.doc && item.doc.constraints && item.doc.constraints.aggregation_functions) {
      functionsInfo = item.doc.constraints.aggregation_functions
    } else {
      const functions = this.sourceData.funcDic.find(item => {
        return item.type === type
      })
      functionsInfo = functions && functions.functions || ''
    }

    const funList = functionsInfo.split(',')
    let result = []
    result = funList.map((item) => {
      return {
        text: item,
        displayText: item,
        className: 'filter-item el-dropdown-menu__item relative-item'
      }
    })
    return result
  }

  getFieldInfo (keywords) {
    // 获取字段的相关信息  1.下拉数据是需要获取的 2.支持的运算符 是不是需要呢  ???
    if (!keywords || !keywords.toLowerCase) {
      return
    }
    keywords = (keywords.trim && keywords.trim()) || keywords
    const fieldInfo = {}
    const matchItem = this.sourceData.filtersList.find((item) => {
      const itemName = item.name && item.name.toLowerCase()
      return keywords.toLowerCase() === itemName
    })
    if (!matchItem) {
      return null
    }
    // 存在下拉值 候选项
    if (matchItem && matchItem.doc && matchItem.doc.data) {
      fieldInfo.options = matchItem.doc.data.map(item => {
        return {
          text: matchItem.type === 'string' ? `'${item.code}'` : item.code,
          displayText: item.value,
          className: 'filter-item el-dropdown-menu__item relative-item'
        }
      })
      fieldInfo.operateType = 'select'
    }
    // 这是一个 远程下拉值
    if (matchItem && matchItem.doc && matchItem.doc.dict_location) {
      fieldInfo.operateType = 'remoteSelect'
    }

    fieldInfo._matchItem = matchItem
    fieldInfo.name = matchItem.name
    fieldInfo.type = matchItem.type
    fieldInfo.label = matchItem.label
    return fieldInfo
  }

  getFieldList () {
    // 获取字段列表
    const fieldList = (this.sourceData && this.sourceData.filtersList) || []
    return fieldList
  }

  getOperatorItem (code) {
    const operators = this.sourceData.operatorManual || []
    const matchItem = operators.find(item => {
      return item.name === code.trim()
    })
    if (matchItem && !matchItem.label) {
      matchItem.label = matchItem.name
    }
    return matchItem || null
  }

  dispose () {
    this.sourceData = null
    this.hintData.operatesList = null
    this.hintData.filtersList = null
    this.hintData = null
  }
}

// 获取数据集
export function getDataset (component, params) {
  return new Promise((resolve, reject) => {
    const schemeInstance = new Scheme(component, params)
    schemeInstance.getFormatedData((schemeData) => {
      const dataset = new Dataset(schemeData)
      resolve(dataset, () => {
        schemeInstance.dispose()
        dataset.dispose()
      })
    })
  })
}
