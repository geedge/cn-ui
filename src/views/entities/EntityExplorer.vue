<template>
  <div class="outer-box">
    <div class="cn-entities">
      <el-select
          size="small"
          style="width: 100%"
          v-model="filterType"
      >
        <el-option v-for="(value, key) in entityType" :key="key" :label="value" :value="key"></el-option>
      </el-select>
      <el-input
          v-model="searchContent"
          size="small"
          style="width: 100%"
          type="text"
      >
        <template #prefix>
          <span style="padding-left: 4px"><i class="el-icon-search"></i></span>
        </template>
      </el-input>
      <!-- 筛选区域 -->
      <left-filter
          :filter-data="filterData"
          @select="select"
      ></left-filter>
      <!-- 内容区域 -->
      <entity-list
          :list-data="listData"
          :entity-type="filterType"
          :page-obj="pageObjRight"
          @pageSize="pageSizeRight"
          @pageNo="pageNoRight"
      ></entity-list>
    </div>
  </div>
</template>

<script>
import { entityType } from '@/utils/constants'
import { ref } from 'vue'
import LeftFilter from '@/components/entities/LeftFilter'
import EntityList from '@/components/entities/EntityList'
import { getEntityIpFilterList, getEntityDomainFilterList, getEntityAppFilterList, getEntityIpList, getEntityDomainList, getEntityAppList } from '@/utils/api'
export default {
  name: 'EntityExplorer',
  data () {
    return {
      searchContent: '',
      filterData: [],
      pageObjLeftTop: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      pageObjLeftBottom: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      pageObjRight: {
        pageNo: 1,
        pageSize: 50,
        total: 0
      },
      listData: []
    }
  },
  components: {
    LeftFilter,
    EntityList
  },
  methods: {
    async loadData (filterType, key) {
      let data
      switch (filterType) {
        case 'ip': {
          data = await getEntityIpFilterList({ type: key })
          break
        }
        case 'domain': {
          data = await getEntityDomainFilterList({ type: key })
          break
        }
        case 'app': {
          data = await getEntityAppFilterList({ type: key })
          break
        }
        default: break
      }
      return data
    },
    handleData (n) {
      this.listData = []
      const requests = []
      const data = []
      switch (n) {
        case 'ip': {
          requests.push(this.loadData(n, 'country'))
          requests.push(this.loadData(n, 'asn'))
          data.push({ title: this.$t('entities.countryOrRegion'), key: 'country', childrenKey: 'region', type: 'country', childrenType: 'region', load })
          data.push({ title: this.$t('entities.asn'), key: 'asn', type: 'asn', load })
          getEntityIpList({ ...this.pageObjRight }).then(res => {
            this.listData = res.data.result
            this.pageObjRight = { ...this.pageObjRight, total: res.statistics.result_size }
          })
          break
        }
        case 'domain': {
          requests.push(this.loadData(n, 'categoryGroup'))
          requests.push(this.loadData(n, 'reputationLevel'))
          data.push({ title: this.$t('entities.groupAndName'), key: 'categoryGroup', childrenKey: 'categoryName', load })
          data.push({ title: this.$t('entities.creditLevel'), key: 'reputationLevel', load })
          getEntityDomainList({ ...this.pageObjRight }).then(res => {
            this.listData = res.data.result
            this.pageObjRight = { ...this.pageObjRight, total: res.statistics.result_size }
          })
          break
        }
        case 'app': {
          requests.push(this.loadData(n, 'appCategory'))
          requests.push(this.loadData(n, 'appRisk'))
          data.push({ title: this.$t('entities.categoryAndSub'), key: 'appCategory', childrenKey: 'appSubcategory', load })
          data.push({ title: this.$t('entities.riskLevel'), key: 'appRisk', load })
          getEntityAppList({ ...this.pageObjRight }).then(res => {
            this.listData = res.data.result
            this.pageObjRight = { ...this.pageObjRight, total: res.statistics.result_size }
          })
          break
        }
        default: break
      }
      Promise.all(requests).then(responses => {
        data.forEach((d, i) => {
          d.data = responses[i]
        })
        this.filterData = data
      })
    },
    select (data) {

    },
    getEntityData (param) {

    },
    pageSizeRight (val) {
      this.pageObjRight.pageSize = val
      this.handleData(this.filterType)
    },
    pageNoRight (val) {
      this.pageObjRight.pageNo = val
      this.handleData(this.filterType)
    }
  },
  watch: {
    filterType (n) {
      this.pageObjLeftTop = {
        pageNo: 1,
        pageSize: 10
      }
      this.pageObjLeftBottom = {
        pageNo: 1,
        pageSize: 10
      }
      this.pageObjRight = {
        pageNo: 1,
        pageSize: 50
      }
      this.handleData(n)
    }
  },
  async mounted () {
    const country = await this.loadData(this.filterType, 'country')
    const asn = await this.loadData(this.filterType, 'asn')
    const res = await getEntityIpList({ ...this.pageObjRight })
    this.listData = res.data.result
    this.pageObjRight = { ...this.pageObjRight, total: res.statistics.result_size }
    this.filterData.push({
      title: this.$t('entities.countryOrRegion'),
      key: 'country',
      childrenKey: 'region',
      data: country,
      filterType: this.filterType,
      load
    })
    this.filterData.push({
      title: this.$t('entities.asn'),
      key: 'asn',
      data: asn,
      filterType: this.filterType,
      load
    })
  },
  setup () {
    const filterType = ref(Object.keys(entityType)[0])
    return {
      entityType,
      filterType
    }
  }
}
const load = (node, resolve, filterType, key) => {
  if (node.level === 0) {
    resolve(node.data)
  } else {
    let req = null
    switch (filterType) {
      case 'ip': {
        req = getEntityIpFilterList({ type: key })
        break
      }
      case 'domain': {
        req = getEntityDomainFilterList({ type: key })
        break
      }
      case 'app': {
        req = getEntityAppFilterList({ type: key })
        break
      }
      default: break
    }
    if (req !== null) {
      req.then(res => {
        res = res.map(r => {
          return { ...r, leaf: true }
        })
        resolve(res)
      })
    }
  }
}
</script>

<style lang="scss">
@import '~@/components/entities/entities.scss';
</style>
