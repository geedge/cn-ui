<template>
  <div>
    <div class="filter-title">
      {{ $t('knowledge.filters') }}
    </div>
    <template v-for="(filter, index) in filterData" :key="index">
      <div class="knowledge-filter">
        <div class="filter__header" @click="filter.collapse = !filter.collapse">
          <span class="new-knowledge-filter-header-title">{{filter.title}}</span>
          <i class="el-icon-arrow-right new-knowledge-filter-icon" :class="{ 'arrow-rotate': !filter.collapse }"></i>
        </div>
        <el-collapse-transition>
          <div class="filter__body">
            <el-tree
                    :ref="`knowledgeTree${filter.id}`"
                    v-if="!filter.collapse"
                    :data="filter.data"
                    show-checkbox
                    node-key="id"
                    default-expand-all
                    :default-checked-keys="[1,2,3]"
                    :render-content="renderContent"
                    @check="(data,checkinfo)=>handleCheckedItemChange(data,checkinfo,index)"
                    >
            </el-tree>
          </div>
        </el-collapse-transition>
      </div>
    </template>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import { get } from '@/utils/http'
import { knowledgeCategoryValue, knowledgeSourceValue } from '@/utils/constants'

export default {
  name: 'KnowledgeFilter',
  props: {
    keyWord: String
  },
  data () {
    return {
      url: api.knowledgeBaseList,
      checkAll: true,
      isIndeterminateModel: false,
      filterData: [
        {
          id:0,
          title: this.$t('knowledge.type'),
          collapse: false,
          value: [],
          data: []
        },
        {
          id:1,
          title: this.$t('knowledge.status'),
          collapse: false,
          value: [],
          data: []
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      allTableData: []
    }
  },
  watch: {
  },
  methods: {
    renderContent (h, { node, data, store }) {
      return h('span', { class: 'custom-tree-node' }, [
        h('span', {}, data.label),
        h('span', { class: 'count-tree-node' }, data.count)
      ])
    },
    handleCheckedItemChange (data, checkinfo, index) {
      let typeCheckedNodes = this.$refs.knowledgeTree0.getCheckedNodes()
      const typeHalfCheckedNodes = checkinfo.halfCheckedNodes
      typeCheckedNodes = typeCheckedNodes.concat(typeHalfCheckedNodes)
      const statusCheckedNodes = this.$refs.knowledgeTree1.getCheckedNodes()
      const typeCheckedLen = typeCheckedNodes.length
      const statusCheckedLen = statusCheckedNodes.length
      let params = {}
      let allSourceNum = 0
      this.filterData[0].data.forEach(item => {
        allSourceNum = allSourceNum + item.children.length
      })
      if (typeCheckedLen === 0 || statusCheckedLen === 0) {
        this.$emit('clearList')
      } else {
        const categorys = []
        const sources = []
        typeCheckedNodes.forEach(val => {
          if (val.type === 0) {
            categorys.push(val.value)
          } else if (val.type === 1) {
            sources.push(val.value)
          }
        })
        if (!(categorys.length === this.filterData[0].data.length && sources.length === allSourceNum)) {
          params = {
            category: categorys.toString(),
            source: sources.toString()
          }
        }
        if (statusCheckedLen === 1) {
          params = {
            ...params,
            status: statusCheckedNodes[0].value
          }
        }
        this.$emit('reload', params, true)
      }
    },
    getAllTableData (params) {
      let searchParams = { pageSize: -1 }
      if (params) {
        searchParams = { ...searchParams, ...params }
      }
      get(this.url, searchParams).then(response => {
        if (response.code === 200) {
          this.allTableData = response.data.list
        } else {
          console.error(response)
        }
      }).finally(() => {
        this.initAllData()
        this.initStatusData()
      })
    },
    initAllData () {
      let webSketchCount = 0
      let fqdnCategoryCount = 0
      let iocMalwareCount = 0
      let iocDarkwebCount = 0
      let ipLocationCount = 0
      let asnCount = 0

      let aiTaggingCount = 0
      let psiphon3Count = 0

      let userDefinedCount = 0
      let ipCount = 0
      let domainCount = 0
      let appCount = 0

      const builtInCount = 0
      this.allTableData.forEach(data => {
        if (data.category === knowledgeCategoryValue.webSketch) {
          webSketchCount++
        } else if (data.category === knowledgeCategoryValue.aiTagging) {
          aiTaggingCount++
        } else if (data.category === knowledgeCategoryValue.userDefined) {
          userDefinedCount++
        }

        if (data.source === knowledgeSourceValue.fqdnCategory) {
          fqdnCategoryCount++
        } else if (data.source === knowledgeSourceValue.iocMalware) {
          iocMalwareCount++
        } else if (data.source === knowledgeSourceValue.iocDarkweb) {
          iocDarkwebCount++
        } else if (data.source === knowledgeSourceValue.ipLocation) {
          ipLocationCount++
        } else if (data.source === knowledgeSourceValue.asn) {
          asnCount++
        } else if (data.source === knowledgeSourceValue.psiphon3) {
          psiphon3Count++
        } else if (data.source === knowledgeSourceValue.ipTag) {
          ipCount++
        } else if (data.source === knowledgeSourceValue.domainTag) {
          domainCount++
        } else if (data.source === knowledgeSourceValue.appTag) {
          appCount++
        }
      })
      this.filterData[0].data = [
        {
          id: 1,
          label: 'WebSketch',
          value: knowledgeCategoryValue.webSketch,
          count: webSketchCount,
          type: 0,
          children: [{
            id: 11,
            label: 'FQDN Category',
            value: knowledgeSourceValue.fqdnCategory,
            count: fqdnCategoryCount,
            type: 1
          }, {
            id: 12,
            label: 'Ioc Malware',
            value: knowledgeSourceValue.iocMalware,
            count: iocMalwareCount,
            type: 1
          }, {
            id: 13,
            label: 'Ioc Darkweb',
            value: knowledgeSourceValue.iocDarkweb,
            count: iocDarkwebCount,
            type: 1
          }, {
            id: 14,
            label: 'IP Location',
            value: knowledgeSourceValue.ipLocation,
            count: ipLocationCount,
            type: 1
          }, {
            id: 15,
            label: 'ASN',
            value: knowledgeSourceValue.asn,
            count: asnCount,
            type: 1
          }
          ]
        },
        {
          id: 2,
          label: 'AI Tagging',
          value: knowledgeCategoryValue.aiTagging,
          count: aiTaggingCount,
          type: 0,
          children: [
            {
              id: 21,
              label: 'Psiphon3',
              value: knowledgeSourceValue.psiphon3,
              count: psiphon3Count,
              type: 1
            }
          ]
        },
        {
          id: 3,
          label: 'User-defined',
          value: knowledgeCategoryValue.userDefined,
          count: userDefinedCount,
          type: 0,
          children: [
            {
              id: 31,
              label: 'IP Tag',
              value: knowledgeSourceValue.ipTag,
              count: ipCount,
              type: 1
            }, {
              id: 32,
              label: 'Domain Tag',
              value: knowledgeSourceValue.domainTag,
              count: domainCount,
              type: 1
            }, {
              id: 33,
              label: 'APP Tag',
              value: knowledgeSourceValue.appTag,
              count: appCount,
              type: 1
            }
          ]
        }
      ]
    },
    initStatusData () {
      let enableCount = 0
      let disableCount = 0
      this.allTableData.forEach(data => {
        if (data.status === 0) {
          disableCount++
        } else {
          enableCount++
        }
      })
      this.filterData[1].data = [
        { id: 1, label: 'enabled', value: 1, count: enableCount, type: 0 },
        { id: 2, label: 'disable', value: 0, count: disableCount, type: 0 }
      ]
    },
    reloadFilter (params) {
      this.getAllTableData(params)
    }
  },
  mounted () {
    let params = {}
    params = {
      name: this.keyWord
    }
    this.getAllTableData(params)
  },
  computed: {
  }
}
</script>
