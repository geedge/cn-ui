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
      ></left-filter>
      <!-- 内容区域 -->
      <div style="background-color: lightcyan"></div>
    </div>
  </div>
</template>

<script>
import { entityType } from '@/utils/constants'
import { ref } from 'vue'
import LeftFilter from '@/components/entities/LeftFilter'
import { getEntityIpFilterList, getEntityDomainFilterList, getEntityAppFilterList } from '@/utils/api'
export default {
  name: 'EntityExplorer',
  data () {
    return {
      searchContent: '',
      filterData: []
    }
  },
  components: {
    LeftFilter
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
    }
  },
  watch: {
    filterType (n) {
      const requests = []
      const data = []
      switch (n) {
        case 'ip': {
          requests.push(this.loadData(n, 'country'))
          requests.push(this.loadData(n, 'asn'))
          data.push({ title: this.$t('entities.countryOrRegion'), key: 'country' })
          data.push({ title: this.$t('entities.systemNumber'), key: 'asn' })
          break
        }
        case 'domain': {
          requests.push(this.loadData(n, 'group'))
          requests.push(this.loadData(n, 'level'))
          data.push({ title: this.$t('entities.group'), key: 'group' })
          data.push({ title: this.$t('entities.level'), key: 'level' })
          break
        }
        case 'app': {
          requests.push(this.loadData(n, 'category'))
          requests.push(this.loadData(n, 'risk'))
          data.push({ title: this.$t('entities.category'), key: 'category' })
          data.push({ title: this.$t('entities.risk'), key: 'risk' })
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
    this.filterData.push({
      title: this.$t('entities.countryOrRegion'),
      key: 'country',
      data: country
    })
    this.filterData.push({
      title: this.$t('entities.systemNumber'),
      key: 'asn',
      data: asn
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
</script>

<style lang="scss">
@import '~@/components/entities/entities.scss';
</style>
