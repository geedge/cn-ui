<template>
  <div>
    <div class="filter-title">
      {{ $t('knowledge.filters') }}
    </div>
    <template v-for="(filter, index) in filterData" :key="index">
      <div class="knowledge-filter" v-show="filter.data.length > 0">
        <div class="filter__header" @click="filter.collapse = !filter.collapse">
          <span class="new-knowledge-filter-header-title">{{filter.title}}</span>
          <i class="el-icon-arrow-right new-knowledge-filter-icon" :class="{ 'arrow-rotate': !filter.collapse }"></i>
        </div>
        <el-collapse-transition>
          <div class="filter__body" v-show="!filter.collapse">
            <el-checkbox style="padding-bottom: 5px;" label="all" v-if="index === 0" key="all" @change="handleCheckedAllChange" v-model="checkAll" :indeterminate="isIndeterminateModel">
              <div class="filter__checkbox-label">
                <div class="filter-label" style="">
                  <span>All</span>
                </div>
                <div class="filter-count">{{allCount}}</div>
              </div>
            </el-checkbox>
            <el-checkbox-group v-if="index === 0" v-model="filter.value" @change="handleCheckedItemChange">
              <el-checkbox checked="true"  v-for="(d, i) in filter.data"  :label="d.value" :key="d.value" >
                <div class="filter__checkbox-label">
                  <div class="filter-label" style="">
                    <span>{{d.label}}</span>
                  </div>
                  <div class="filter-count" v-if="d.count || d.count === 0">{{d.count}}</div>
                </div>
              </el-checkbox>
            </el-checkbox-group>
            <el-checkbox-group v-else v-model="filter.value" >
              <el-checkbox checked="true" v-for="(d, i) in filter.data" :label="d.value" :key="d.value" >
                <div class="filter__checkbox-label">
                  <div class="filter-label" style="">
                    <span>{{d.label}}</span>
                  </div>
                  <div class="filter-count" v-if="d.count || d.count === 0">{{d.count}}</div>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-collapse-transition>
      </div>
    </template>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import { get } from '@/utils/http'

export default {
  name: 'KnowledgeFilter',
  props: {
  },
  data () {
    return {
      url: api.knowledgeBase,
      checkAll: true,
      isIndeterminateModel: false,
      filterData: [
        {
          title: this.$t('knowledge.type'),
          collapse: false,
          value: [],
          data: []
        },
        {
          title: this.$t('knowledge.status'),
          collapse: false,
          value: [],
          data: []
        }
      ],
      allTableData: [],
      allCount: 0
    }
  },
  watch: {
  },
  methods: {
    handleCheckedAllChange (item) {
      const values = []
      this.filterData[0].data.forEach(d => {
        values.push(d.value)
      })
      this.filterData[0].value = item ? values : []
      this.isIndeterminateModel = false
      if (item) {
        this.$emit('reload', null, true)
      } else {
        this.$emit('clearList')
      }
    },
    handleCheckedItemChange (values) {
      const len = values.length
      const allTypeLen = this.filterData[0].data.length
      let params = {}
      if (len === 0) {
        this.isIndeterminateModel = false
        this.checkAll = false
        // this.$emit('reload',null,true)
        this.$emit('clearList')
      } else if (len > 0 && len < allTypeLen) {
        this.checkAll = true
        this.isIndeterminateModel = true
        const types = []
        values.forEach(val => {
          types.push(val)
        })
        params = {
          tagType: types.toString()
        }
        this.$emit('reload', params, true)
      } else if (len === allTypeLen) {
        this.isIndeterminateModel = false
        this.checkAll = true
        this.$emit('reload', null, true)
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
          this.initAllData()
          this.initStatusData()
        } else {
          console.error(response)
        }
      })
    },
    initAllData () {
      this.allCount = this.allTableData.length
      let ipCount = 0
      let domainCount = 0
      let appCount = 0
      let builtInCount = 0
      this.allTableData.forEach(data => {
        if (data.tagType === 'ip') {
          ipCount++
        } else if (data.tagType === 'domain') {
          domainCount++
        } else if (data.tagType === 'app') {
          appCount++
        } else if (data.tagType === 'builtIn') {
          builtInCount++
        }
      })
      this.filterData[0].data = [
        // { label: 'All', value: 'all', count: 18 },
        { label: 'IP', value: 'ip', count: ipCount },
        { label: 'Domain', value: 'domain', count: domainCount },
        { label: 'Application', value: 'app', count: appCount },
        { label: 'Built-in', value: 'builtIn', count: builtInCount }
      ]
    },
    initStatusData () {
      let enableCount = 0
      let disableCount = 0
      this.allTableData.forEach(data => {
        if (data.status === 'disable') {
          disableCount++
        } else {
          enableCount++
        }
      })
      this.filterData[1].data = [
        { label: 'enabled', value: 'enabled', count: enableCount },
        { label: 'disable', value: 'ip', count: disableCount }
      ]
    },
    reloadFilter () {
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
