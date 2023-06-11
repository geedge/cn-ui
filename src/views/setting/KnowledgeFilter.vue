<template>
  <div>
    <div class="filter-title">
      {{ $t('knowledge.filters') }}
    </div>
    <div class="knowledge-filter">
      <div class="filter__header" @click="collapseCategory">
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
      <div class="filter__header" @click="collapseStatus">
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
      defaultCheckedCategory: [],
      defaultCheckedStatus: [],
      filterParams: {}
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
    collapseCategory () {
      this.filterCategoryData.collapse = !this.filterCategoryData.collapse
      const self = this
      if (!this.filterCategoryData.collapse) {
        this.$nextTick(() => {
          if (self.$refs.knowledgeTreeTypeFilter instanceof Array) {
            self.$refs.knowledgeTreeTypeFilter[0].setCheckedKeys(this.defaultCheckedCategory)
          } else {
            self.$refs.knowledgeTreeTypeFilter.setCheckedKeys(this.defaultCheckedCategory)
          }
        })
      }
    },
    collapseStatus () {
      this.filterStatusData.collapse = !this.filterStatusData.collapse
      const self = this
      if (!this.filterStatusData.collapse) {
        this.$nextTick(() => {
          if (self.$refs.knowledgeTreeStatusFilter instanceof Array) {
            self.$refs.knowledgeTreeStatusFilter[0].setCheckedKeys(this.defaultCheckedStatus)
          } else {
            self.$refs.knowledgeTreeStatusFilter.setCheckedKeys(this.defaultCheckedStatus)
          }
        })
      }
    },
    handleCheckedItemChange (data, checkinfo) {
      let typeCheckedNodes = []
      let typeHalfCheckedNodes = []
      if (this.$refs.knowledgeTreeTypeFilter) {
        if (this.$refs.knowledgeTreeTypeFilter instanceof Array) {
          typeCheckedNodes = this.$refs.knowledgeTreeTypeFilter[0].getCheckedNodes()
          typeHalfCheckedNodes = this.$refs.knowledgeTreeTypeFilter[0].getHalfCheckedNodes()
        } else {
          typeCheckedNodes = this.$refs.knowledgeTreeTypeFilter.getCheckedNodes()
          typeHalfCheckedNodes = this.$refs.knowledgeTreeTypeFilter.getHalfCheckedNodes()
        }
        const categoryIds = []
        typeCheckedNodes.forEach(item => {
          categoryIds.push(item.id)
        })
        this.defaultCheckedCategory = categoryIds
        typeCheckedNodes = typeCheckedNodes.concat(typeHalfCheckedNodes)
      }
      let statusCheckedNodes = []
      if (this.$refs.knowledgeTreeStatusFilter) {
        if (this.$refs.knowledgeTreeStatusFilter instanceof Array) {
          statusCheckedNodes = this.$refs.knowledgeTreeStatusFilter[0].getCheckedNodes()
        } else {
          statusCheckedNodes = this.$refs.knowledgeTreeStatusFilter.getCheckedNodes()
        }
        const sourceIds = []
        statusCheckedNodes.forEach(item => {
          sourceIds.push(item.id)
        })
        this.defaultCheckedStatus = sourceIds
      }
      const typeCheckedLen = typeCheckedNodes.length
      const statusCheckedLen = statusCheckedNodes.length
      let params = {}
      let allSourceNum = 0
      this.filterCategoryData.data.forEach(item => {
        allSourceNum = allSourceNum + item.children.length
      })
      if (this.defaultCheckedCategory.length === 0 || this.defaultCheckedStatus.length === 0) {
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
          if (this.filterCategoryData.collapse) {
            params = {
              category: categorys.toString() ? categorys.toString() : this.filterParams.category,
              source: sources.toString() ? sources.toString() : this.filterParams.source
            }
          } else {
            params = {
              category: categorys.toString(),
              source: sources.toString()
            }
          }
        }
        if (this.defaultCheckedStatus.length === 1) {
          if (this.filterStatusData.collapse) {
            params = {
              ...params,
              status: statusCheckedNodes[0].value ? statusCheckedNodes[0].value : this.filterParams.status
            }
          } else {
            params = {
              ...params,
              status: statusCheckedNodes[0].value
            }
          }
        }
        this.filterParams = params
        this.$emit('reload', params, true,false,this.defaultCheckedCategory,this.defaultCheckedStatus)
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
          if (self.$refs.knowledgeTreeTypeFilter) {
            self.$refs.knowledgeTreeTypeFilter.setCheckedKeys(this.defaultCheckedCategory)
          }
          if (self.$refs.knowledgeTreeStatusFilter) {
            self.$refs.knowledgeTreeStatusFilter.setCheckedKeys(this.defaultCheckedStatus)
          }
        })
      })
    },
    initTypeData () {
      this.filterCategoryData.data = []
      let categoryIds = []
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
        categoryIds.push(categoryId)
        this.filterCategoryData.data.push(category)
        const sourceList = type.sourceList
        sourceList.forEach((item, sourceIndex) => {
          const sourceLabel = knowledgeBaseSource.find(t => t.value === item.name)
          const source = {
            id: typeIndex + '' + sourceIndex,
            label: sourceLabel ? sourceLabel.name : item.name,
            value: item.name,
            count: item.count,
            type: 1
          }
          category.children.push(source)
        })
      })
      if(this.defaultCheckedCategory.length === 0){
        this.defaultCheckedCategory = categoryIds
      }
    },
    initStatusData () {
      const enableCount = 0
      const disableCount = 0
      this.filterStatusData.data = []
      let statusIds = []
      this.statusData.forEach((data, index) => {
        this.filterStatusData.data.push({
          id: index,
          label: data.status === 1 ? 'enabled' : 'disable',
          value: data.status,
          count: data.count,
          type: 0
        })
        statusIds.push(index)
      })
      if(this.defaultCheckedStatus.length === 0){
        this.defaultCheckedStatus = statusIds
      }
    },
    reloadFilter (checkedCategoryIds ,checkedStatusIds) {
      if(checkedCategoryIds && checkedCategoryIds.length > 0){
        this.defaultCheckedCategory = checkedCategoryIds
      }
      if(checkedStatusIds && checkedStatusIds.length > 0){
        this.defaultCheckedStatus = checkedStatusIds
      }
      this.getAllTableData()
    }
  },
  mounted () {
    this.getAllTableData()
  },
  computed: {
  }
}
</script>
