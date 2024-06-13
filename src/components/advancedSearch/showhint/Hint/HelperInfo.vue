<template>
  <div class="helper-info">
    <div class="tips-container">
      <Renderer ref="renderVm" :renderProps="renderProps" :renderFun="helperDataFun"></Renderer>
    </div>
  </div>
</template>

<script>
import operatorTips from '@/components/advancedSearch/showhint/const/operatorTips'
import defaultTips from '@/components/advancedSearch/showhint/const/defaultTips.js'
import sqlTips from '@/components/advancedSearch/showhint/const/sqlTips.js'
import functionTips from '@/components/advancedSearch/showhint/const/functionTips.js'
import filterTips from '@/components/advancedSearch/showhint/const/filterTips.js'

import { fieldRender } from '@/components/advancedSearch/showhint/const/fieldTips.js'
import { EN, storageKey, ZH } from '@/utils/constants'

export default {
  name: 'HelperInfo',
  inject: ['getDataset'],
  props: {
    hintSearch: {},
    hintParams: {}
  },
  data () {
    return {
      operatorTips,
      sqlTips,
      functionTips,
      renderProps: {},
      isShow: true
    }
  },
  methods: {
    refreshRender () {
      this.$refs?.renderVm.$forceUpdate()
    },
    matchFields (searchKey) {
      const dataset = this.getDataset()
      const fieldInfo = dataset.getFieldInfo(searchKey)
      if (!fieldInfo) {
        return false
      }
      let operates = dataset.getOperates(fieldInfo.type, fieldInfo._matchItem)
      operates = operates.map(item => item.text.toUpperCase())
      let funs = dataset.getFunctions(fieldInfo.type, fieldInfo._matchItem)
      funs = funs.map(item => item.text.toUpperCase())

      let operatorReference = dataset.sourceData.operatorReference
      let funcReference = dataset.sourceData.funcReference

      operatorReference = operatorReference.filter(item => {
        return operates.includes(item.label)
      })
      funcReference = funcReference.filter(item => {
        return funs.includes(item.name)
      })

      this.renderProps = {
        fieldInfo,
        funcReference,
        operatorReference,
        funs,
        operates
      }
      return fieldRender
    }
  },
  computed: {
    helperDataFun () {
      let hintSearch = ''
      if (this.hintSearch) {
        hintSearch = JSON.parse(JSON.stringify(this.hintSearch))
        const fields = this.getDataset().sourceData.fields
        const obj = fields.find(d => d.label === hintSearch)
        if (obj) {
          hintSearch = obj.label
        }
      }

      let searchKey = hintSearch.toUpperCase() || ''
      searchKey = searchKey.trim()
      // if (functionTips[searchKey]) {
      //   return functionTips[searchKey].description
      // }
      if (operatorTips[searchKey]) {
        return operatorTips[searchKey].description
      }
      // if (sqlTips[searchKey]) {
      //   return sqlTips[searchKey].description
      // }
      if (filterTips[searchKey]) {
        return filterTips[searchKey].description
      }
      // if (varTips[searchKey]) {
      //   return varTips[searchKey].description
      // }

      // 完整的匹配关键字
      if (this.getDataset()) {
        const fieldRender = this.matchFields(searchKey)
        if (fieldRender) {
          return fieldRender
        }
      }
      const language = localStorage.getItem(storageKey.language) || EN

      if (language === ZH) {
        return defaultTips.zhDefault.description
      }
      return defaultTips.enDefault.description
    }
  }
}
</script>
