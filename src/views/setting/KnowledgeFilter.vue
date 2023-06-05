<template>
  <div>
    <div class="filter-title">
      {{ $t('knowledge.filters') }}
    </div>
    <div class="knowledge-filter">
      <div class="filter__header" @click="filterCategoryData.collapse = !filterCategoryData.collapse">
        <span class="new-knowledge-filter-header-title">{{filterCategoryData.title}}</span>
        <i class="el-icon-arrow-right new-knowledge-filter-icon" :class="{ 'arrow-rotate': !filterCategoryData.collapse }"></i>
      </div>
      <el-collapse-transition>
        <div class="filter__body"  v-if="!filterCategoryData.collapse">
          <el-tree
                  ref="knowledgeTreeTypeFilter"
                  :data="filterCategoryData.data"
                  show-checkbox
                  node-key="id"
                  default-expand-all
                  :render-content="renderContent"
                  @check="(data,checkinfo)=>handleCheckedItemChange(data,checkinfo)"
                  >
          </el-tree>
        </div>
      </el-collapse-transition>
    </div>
    <div class="knowledge-filter">
      <div class="filter__header" @click="filterStatusData.collapse = !filterStatusData.collapse">
        <span class="new-knowledge-filter-header-title">{{filterStatusData.title}}</span>
        <i class="el-icon-arrow-right new-knowledge-filter-icon" :class="{ 'arrow-rotate': !filterStatusData.collapse }"></i>
      </div>
      <el-collapse-transition>
        <div class="filter__body"   v-if="!filterStatusData.collapse">
          <el-tree
                  ref="knowledgeTreeStatusFilter"
                  :data="filterStatusData.data"
                  show-checkbox
                  node-key="id"
                  default-expand-all
                  :render-content="renderContent"
                  @check="(data,checkinfo)=>handleCheckedItemChange(data,checkinfo)"
          >
          </el-tree>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import { get } from '@/utils/http'
import { knowledgeBaseCategory, knowledgeBaseSource } from '@/utils/constants'

export default {
  name: 'KnowledgeFilter',
  props: {
    keyWord: String
  },
  data () {
    return {
      url: api.knowledgeBaseStatistics,
      checkAll: true,
      isIndeterminateModel: false,
      filterCategoryData: {
        id: 0,
        title: this.$t('knowledge.type'),
        collapse: false,
        data: []
      },
      filterStatusData: {
        id: 1,
        title: this.$t('knowledge.status'),
        collapse: false,
        data: []
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      typeData: [],
      statusData: [],
      defaultCheckedCategory: []
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
    handleCheckedItemChange (data, checkinfo) {
      let typeCheckedNodes = []
      if (this.$refs.knowledgeTreeTypeFilter instanceof Array) {
        typeCheckedNodes = this.$refs.knowledgeTreeTypeFilter[0].getCheckedNodes()
      } else {
        typeCheckedNodes = this.$refs.knowledgeTreeTypeFilter.getCheckedNodes()
      }
      const typeHalfCheckedNodes = checkinfo.halfCheckedNodes
      typeCheckedNodes = typeCheckedNodes.concat(typeHalfCheckedNodes)
      let statusCheckedNodes = []
      if (this.$refs.knowledgeTreeStatusFilter instanceof Array) {
        statusCheckedNodes = this.$refs.knowledgeTreeStatusFilter[0].getCheckedNodes()
      } else {
        statusCheckedNodes = this.$refs.knowledgeTreeStatusFilter.getCheckedNodes()
      }
      const typeCheckedLen = typeCheckedNodes.length
      const statusCheckedLen = statusCheckedNodes.length
      let params = {}
      let allSourceNum = 0
      this.filterCategoryData.data.forEach(item => {
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
        if (!(categorys.length === this.filterCategoryData.data.length && sources.length === allSourceNum)) {
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
          this.typeData = response.data.categoryList
          this.statusData = response.data.statusList
        } else {
          console.error(response)
        }
      }).finally(() => {
        this.initTypeData()
        this.initStatusData()
        const self = this
        this.$nextTick(() => {
          self.$refs.knowledgeTreeTypeFilter.setCheckedKeys(this.defaultCheckedCategory)
        })
        this.$nextTick(() => {
          self.$refs.knowledgeTreeStatusFilter.setCheckedKeys([0, 1])
        })
      })
    },
    initTypeData () {
      this.typeData.forEach((type, typeIndex) => {
        const categoryLabel = knowledgeBaseCategory.find(t => t.value === type.name)
        const categoryId = typeIndex
        const category = {
          id: categoryId,
          label: categoryLabel ? categoryLabel.name : type.name,
          value: type.name,
          count: type.count,
          type: 0,
          children: []
        }
        this.defaultCheckedCategory.push(categoryId)
        this.filterCategoryData.data.push(category)
        const sourceList = type.sourceList
        sourceList.forEach((item, sourceIndex) => {
          const sourceLabel = knowledgeBaseSource.find(t => t.value === item.name)
          const source = {
            id: Number(typeIndex + '' + sourceIndex),
            label: sourceLabel ? sourceLabel.name : item.name,
            value: item.name,
            count: item.count,
            type: 1
          }
          category.children.push(source)
        })
      })
    },
    initStatusData () {
      const enableCount = 0
      const disableCount = 0
      this.statusData.forEach((data, index) => {
        this.filterStatusData.data.push({
          id: index,
          label: data.status === 1 ? 'enabled' : 'disable',
          value: data.status,
          count: data.count,
          type: 0
        })
      })
    },
    reloadFilter (params) {
      this.getAllTableData(params)
    }
  },
  mounted () {
    this.getAllTableData()
  },
  computed: {
  }
}
</script>
