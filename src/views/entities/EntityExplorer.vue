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
          @showMore="showMore"
          @loadFilter="loadFilter"
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
    async showMore (key) {
      let index = 0
      switch (key) {
        case 'country':
        case 'categoryGroup':
        case 'appCategory': {
          this.pageObjLeftTop.pageNo++
          break
        }
        case 'asn':
        case 'reputationLevel':
        case 'appRisk': {
          this.pageObjLeftBottom.pageNo++
          index = 1
          break
        }
        default: break
      }
      const data = await this.loadFilterData(this.filterType, key)
      this.filterData[index].data = this.$_.concat(this.filterData[index].data, data)
      this.filterData[index].hasnotMore = this.$_.isEmpty(data) || data.length < 10
    },
    async loadFilterData (filterType, key) {
      let data
      let params = { type: key }
      switch (key) {
        case 'country':
        case 'categoryGroup':
        case 'appCategory': {
          params = { ...params, ...this.pageObjLeftTop }
          break
        }
        case 'asn':
        case 'reputationLevel':
        case 'appRisk': {
          params = { ...params, ...this.pageObjLeftBottom }
          break
        }
        default: break
      }
      switch (filterType) {
        case 'ip': {
          data = await getEntityIpFilterList(params)
          break
        }
        case 'domain': {
          data = await getEntityDomainFilterList(params)
          break
        }
        case 'app': {
          data = await getEntityAppFilterList(params)
          break
        }
        default: break
      }
      return data
    },
    handleData (n) {
      this.listData = []
      this.filterData = []
      const requests = []
      const data = []
      switch (n) {
        case 'ip': {
          requests.push(this.loadFilterData(n, 'country'))
          requests.push(this.loadFilterData(n, 'asn'))
          data.push({ filterType: n, title: this.$t('entities.countryOrRegion'), key: 'country', childrenKey: 'region', type: 'country', childrenType: 'region' })
          data.push({ filterType: n, title: this.$t('entities.asn'), key: 'asn', type: 'asn' })
          getEntityIpList({ ...this.pageObjRight }).then(res => {
            this.listData = res.data.result
            this.pageObjRight = { ...this.pageObjRight, total: res.statistics.result_size }
          })
          break
        }
        case 'domain': {
          requests.push(this.loadFilterData(n, 'categoryGroup'))
          requests.push(this.loadFilterData(n, 'reputationLevel'))
          data.push({ filterType: n, title: this.$t('entities.groupAndName'), key: 'categoryGroup', childrenKey: 'categoryName' })
          data.push({ filterType: n, title: this.$t('entities.creditLevel'), key: 'reputationLevel' })
          getEntityDomainList({ ...this.pageObjRight }).then(res => {
            this.listData = res.data.result
            this.pageObjRight = { ...this.pageObjRight, total: res.statistics.result_size }
          })
          break
        }
        case 'app': {
          requests.push(this.loadFilterData(n, 'appCategory'))
          requests.push(this.loadFilterData(n, 'appRisk'))
          data.push({ filterType: n, title: this.$t('entities.categoryAndSub'), key: 'appCategory', childrenKey: 'appSubcategory' })
          data.push({ filterType: n, title: this.$t('entities.riskLevel'), key: 'appRisk' })
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
          d.hasnotMore = this.$_.isEmpty(responses[i]) || responses[i].length < 10
        })
        this.filterData = data
      })
    },
    async select (data, node, index) {
      const pageObjRight = { ...this.pageObjRight, ...data }
      this.$_.forIn(data, (value, key) => {
        if (value === this.pageObjRight[key]) {
          delete pageObjRight[key]
        }
      })
      this.pageObjRight = JSON.parse(JSON.stringify(pageObjRight))
      const res = await loadList(node, this.filterType, this.pageObjRight)
      this.listData = res.data.result
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
    },
    loadFilter (node, resolve, filterType, key, parentKey) {
      if (node.level === 0) {
        resolve(node.data)
      } else {
        const param = { type: key }
        param[parentKey] = (node.data)[parentKey]
        let req = null
        switch (filterType) {
          case 'ip': {
            req = getEntityIpFilterList(param)
            break
          }
          case 'domain': {
            req = getEntityDomainFilterList(param)
            break
          }
          case 'app': {
            req = getEntityAppFilterList(param)
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
    const country = await this.loadFilterData(this.filterType, 'country')
    const asn = await this.loadFilterData(this.filterType, 'asn')
    const res = await getEntityIpList({ ...this.pageObjRight })
    this.listData = res.data.result
    this.pageObjRight = { ...this.pageObjRight, total: res.statistics.result_size }
    this.filterData.push({
      title: this.$t('entities.countryOrRegion'),
      key: 'country',
      childrenKey: 'region',
      data: country,
      hasnotMore: this.$_.isEmpty(country) || country.length < 10,
      filterType: this.filterType
    })
    this.filterData.push({
      title: this.$t('entities.asn'),
      key: 'asn',
      data: asn,
      hasnotMore: this.$_.isEmpty(asn) || asn.length < 10,
      filterType: this.filterType
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
const loadList = async (node, filterType, pageObj) => {
  let res
  const param = { ...pageObj }
  switch (filterType) {
    case 'ip': {
      res = await getEntityIpList(param)
      break
    }
    case 'domain': {
      res = await getEntityDomainList(param)
      break
    }
    case 'app': {
      res = await getEntityAppList(param)
      break
    }
    default: break
  }
  return res
}
</script>

<style lang="scss">
@import '~@/components/entities/entities.scss';
</style>
