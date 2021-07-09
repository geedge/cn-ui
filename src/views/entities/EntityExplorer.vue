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
        pageSize: 10
      },
      pageObjLeftBottom: {
        pageNo: 1,
        pageSize: 10
      },
      pageObjRight: {
        pageNo: 1,
        pageSize: 50
      },
      listData: []
    }
  },
  components: {
    LeftFilter,
    EntityList
  },
  methods: {
    async loadData (filterType, conditionGroup) {
      let data
      switch (filterType) {
        case 'ip': {
          data = await getEntityIpFilterList({ type: conditionGroup })
          break
        }
        case 'domain': {
          data = await getEntityDomainFilterList({ type: conditionGroup })
          break
        }
        case 'app': {
          data = await getEntityAppFilterList({ type: conditionGroup })
          break
        }
        default: break
      }
      return data
    },
    select (data) {

    },
    getEntityData (param) {

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
      this.listData = []
      const requests = []
      const data = []
      switch (n) {
        case 'ip': {
          requests.push(this.loadData(n, 'country'))
          requests.push(this.loadData(n, 'asn'))
          data.push({ title: this.$t('entities.countryOrRegion'), key: 'country', childrenKey: 'region', load })
          data.push({ title: this.$t('entities.systemNumber'), key: 'asn', load })
          getEntityIpList({ ...this.pageObjRight }).then(res => {
            this.listData = res
          })
          break
        }
        case 'domain': {
          requests.push(this.loadData(n, 'group'))
          requests.push(this.loadData(n, 'level'))
          data.push({ title: this.$t('entities.group'), key: 'group', childrenKey: 'name', load })
          data.push({ title: this.$t('entities.level'), key: 'level', load })
          getEntityDomainList({ ...this.pageObjRight }).then(res => {
            this.listData = res
          })
          break
        }
        case 'app': {
          requests.push(this.loadData(n, 'category'))
          requests.push(this.loadData(n, 'risk'))
          data.push({ title: this.$t('entities.category'), key: 'category', childrenKey: 'subcategory', load })
          data.push({ title: this.$t('entities.risk'), key: 'risk', load })
          getEntityAppList({ ...this.pageObjRight }).then(res => {
            this.listData = res
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
    }
  },
  async mounted () {
    const country = await this.loadData(this.filterType, 'country')
    const asn = await this.loadData(this.filterType, 'asn')
    this.listData = await getEntityIpList({ ...this.pageObjRight })
    this.filterData.push({
      title: this.$t('entities.countryOrRegion'),
      key: 'country',
      childrenKey: 'region',
      data: country,
      filterType: this.filterType,
      load
    })
    this.filterData.push({
      title: this.$t('entities.systemNumber'),
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
