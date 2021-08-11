<template>
  <div class="outer-box" v-if="!showDetail">
    <el-select
        size="small"
        v-model="from"
        style="position: fixed; top: 9px; width: 130px; left:260px;"
    >
      <el-option v-for="(value, key) in entityType" :key="key" :label="value" :value="key"></el-option>
    </el-select>
    <div class="cn-entities">
      <el-input
          v-model="searchContentTemp"
          style="width: 100%; grid-area: 1 / 1 / 1 / 3;"
          type="text"
          @keyup.enter="enter"
      >
        <template #prefix>
          <span style="padding-left: 4px"><i class="el-icon-search"></i></span>
        </template>
      </el-input>
      <!-- 筛选区域 -->
      <left-filter
          :top-filter-data="topFilterData"
          :bottom-filter-data="bottomFilterData"
          @select="select"
          @showMore="showMore"
          @loadFilter="loadFilter"
          style="grid-area: 2 / 1 / 3 / 2;"
      ></left-filter>
      <!-- 内容区域 -->
      <entity-list
          :list-data="listData"
          :entity-type="from"
          :page-obj="pageObjRight"
          @showDetail="entityDetail"
          @pageSize="pageSizeRight"
          @pageNo="pageNoRight"
          style="grid-area: 2 / 2 / 3 / 3;"
      ></entity-list>
    </div>
  </div>
  <cn-panel v-else :entity="currentEntity" :type-name="typeName" :tabs="panelTabs" @goBack="showDetail = false"></cn-panel>
</template>

<script>
import { entityType, entityFilterType } from '@/utils/constants'
import { ref } from 'vue'
import LeftFilter from '@/components/entities/LeftFilter'
import EntityList from '@/components/entities/EntityList'
import { getEntityFilter, getEntityList, getEntityCount } from '@/utils/api'
import Panel from '@/views/charts/Panel'
export default {
  name: 'EntityExplorer',
  data () {
    return {
      searchContentTemp: '', // 搜索框内的文本内容，按回车键后为searchContent赋值
      searchContent: '', // 查询语句
      searchParams: null, // 搜索参数，格式为[{ name: xxx, value: xxx }, ...]
      filterObj: {}, // 被选中的左侧过滤条件
      topFilterData: {}, // 左侧上方的过滤列表数据
      bottomFilterData: {}, // 左侧下方的过滤列表数据
      listData: [], // 右侧实体列表数据
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
      showDetail: false,
      typeName: '',
      currentEntity: {},
      panelTabs: []
    }
  },
  components: {
    LeftFilter,
    EntityList,
    'cn-panel': Panel
  },
  methods: {
    enter () {
      if (!this.searchContentTemp) {
        this.reset()
      } else {
        this.searchContent = this.searchContentTemp
      }
    },
    async showMore (column) {
      let index = 0
      switch (column) {
        case entityFilterType.ip.country:
        case entityFilterType.domain.categoryGroup:
        case entityFilterType.app.appCategory: {
          this.pageObjLeftTop.pageNo++
          break
        }
        case entityFilterType.ip.asn:
        case entityFilterType.domain.reputationLevel:
        case entityFilterType.app.appRisk: {
          index = 1
          this.pageObjLeftBottom.pageNo++
          break
        }
        default: break
      }
      const { topFilterData, bottomFilterData } = await this.queryFilterData({ column, q: this.searchContent, from: this.from })
      if (index === 1) {
        this.bottomFilterData = {
          ...this.bottomFilterData,
          data: this.$_.concat(this.bottomFilterData.data, bottomFilterData),
          hasnotMore: bottomFilterData.length < 10
        }
      } else {
        this.topFilterData = {
          ...this.topFilterData,
          data: this.$_.concat(this.topFilterData.data, topFilterData),
          hasnotMore: topFilterData.length < 10
        }
      }
    },
    async search () {
      const params = { from: this.from, q: this.searchContent }
      this.listData = await getEntityList({ ...this.pageObjRight, ...params })
      this.pageObjRight.total = await getEntityCount(params)
      const { topFilterData, bottomFilterData } = await this.queryFilterData(params)
      this.topFilterData = topFilterData
      this.bottomFilterData = bottomFilterData
    },
    /* 重置条件 */
    reset () {
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
      this.searchParams = null
      this.searchParams = []
    },
    async queryFilterData (params) {
      let topFilterParams = { ...params, ...this.pageObjLeftTop }
      let bottomFilterParams = { ...params, ...this.pageObjLeftBottom }
      const keys = Object.keys(this.filterObj)
      let topLevel = 1 // 左上过滤条件默认是tree的第一层
      if (!this.$_.isEmpty(keys)) {
        let hasTopColumn = false
        let hasBottomColumn = false
        keys.forEach(key => {
          switch (key) {
            case entityFilterType.ip.country:
            case entityFilterType.domain.categoryGroup:
            case entityFilterType.app.appCategory: {
              hasTopColumn = true
              topFilterParams = { ...topFilterParams, column: key }
              break
            }
            case entityFilterType.ip.region:
            case entityFilterType.domain.categoryName:
            case entityFilterType.app.appSubcategory: {
              topLevel = 2
              hasTopColumn = true
              topFilterParams = { ...topFilterParams, column: key }
              break
            }
            case entityFilterType.ip.asn:
            case entityFilterType.domain.reputationLevel:
            case entityFilterType.app.appRisk: {
              hasBottomColumn = true
              bottomFilterParams = { ...bottomFilterParams, column: key }
              break
            }
            default: break
          }
        })
        if (!hasTopColumn) {
          topFilterParams = { ...topFilterParams, column: this.getDefaultTopColumn(this.from) }
        }
        if (!hasBottomColumn) {
          bottomFilterParams = { ...bottomFilterParams, column: this.getDefaultBottomColumn(this.from) }
        }
      } else {
        topFilterParams = { ...topFilterParams, column: this.getDefaultTopColumn(this.from) }
        bottomFilterParams = { ...bottomFilterParams, column: this.getDefaultBottomColumn(this.from) }
      }
      const topFilterListData = await getEntityFilter(topFilterParams) || []
      const bottomFilterListData = await getEntityFilter(bottomFilterParams) || []
      let topFilterData = { data: topFilterListData, hasnotMore: topFilterListData.length < 10, column: topFilterParams.column }
      let bottomFilterData = { data: bottomFilterListData, hasnotMore: bottomFilterListData.length < 10, column: bottomFilterParams.column }
      switch (this.from) {
        case 'ip': {
          topFilterData = { ...topFilterData, icon: 'cn-icon cn-icon-country', title: this.$t('entities.countryOrRegion'), leaf: topLevel === 2 }
          bottomFilterData = { ...bottomFilterData, icon: 'cn-icon cn-icon-cloud', title: this.$t('entities.asn') }
          break
        }
        case 'domain': {
          topFilterData = { ...topFilterData, icon: 'cn-icon cn-icon-category', title: this.$t('entities.groupAndName'), leaf: topLevel === 2 }
          bottomFilterData = { ...bottomFilterData, icon: 'cn-icon cn-icon-risk', title: this.$t('entities.creditLevel') }
          break
        }
        case 'app': {
          topFilterData = { ...topFilterData, icon: 'cn-icon cn-icon-category', title: this.$t('entities.categoryAndSub'), leaf: topLevel === 2 }
          bottomFilterData = { ...bottomFilterData, icon: 'cn-icon cn-icon-risk', title: this.$t('entities.riskLevel') }
          break
        }
        default: break
      }
      return { topFilterData, bottomFilterData }
    },
    getDefaultTopColumn (from) {
      let column = ''
      switch (from) {
        case 'ip': {
          column = entityFilterType.ip.country
          break
        }
        case 'domain': {
          column = entityFilterType.domain.categoryGroup
          break
        }
        case 'app': {
          column = entityFilterType.app.appCategory
          break
        }
        default: break
      }
      return column
    },
    getDefaultBottomColumn (from) {
      let column = ''
      switch (from) {
        case 'ip': {
          column = entityFilterType.ip.asn
          break
        }
        case 'domain': {
          column = entityFilterType.domain.reputationLevel
          break
        }
        case 'app': {
          column = entityFilterType.app.appRisk
          break
        }
        default: break
      }
      return column
    },
    async select (data, node, index, column) {
      this.filterObj[column] = data.name
    },
    async loadLevel2FilterData (node, parentColumn) {
      let column
      switch (parentColumn) {
        case entityFilterType.ip.country: {
          column = entityFilterType.ip.region
          break
        }
        case entityFilterType.domain.categoryGroup: {
          column = entityFilterType.domain.categoryName
          break
        }
        case entityFilterType.app.appCategory: {
          column = entityFilterType.app.appSubcategory
          break
        }
        default: break
      }
      const params = {
        q: this.searchContent,
        from: this.from,
        pageSize: -1,
        pageNo: 1,
        column
      }
      return await getEntityFilter(params)
    },
    pageSizeRight (val) {
      this.pageObjRight.pageSize = val
    },
    pageNoRight (val) {
      this.pageObjRight.pageNo = val
    },
    loadFilter (node, resolve, filterType, key, parentKey) {
      if (node.level === 0) {
        resolve(node.data)
      } else {
        const param = { column: key, from: filterType, q: this.searchContent }
        const req = getEntityFilter(param)
        if (req) {
          req.then(res => {
            res = res.map(r => {
              return { ...r, leaf: true }
            })
            resolve(res)
          })
        }
      }
    },
    entityDetail (entity, tabs) {
      this.typeName = `${this.from.toLowerCase()}EntityDetail`
      this.currentEntity = entity
      this.panelTabs = tabs
      this.showDetail = true
    }
  },
  watch: {
    /* entity类型切换时，分页、搜索信息重置 */
    from (n) {
      this.reset()
    },
    /* 搜索框searchContent、左侧过滤条件filterObj互相联动
    * 监听filterObj改动，将改动同步给searchParams
    * 监听searchContent改动，将改动同步给searchParams
    * 监听searchParams，将改动同步给filterObj、searchContent之一，并重新请求接口，获取左侧过滤条件和右侧entity列表
    *  */
    filterObj: {
      deep: true,
      handler (n) {
        if (n) {
          const searchParams = this.$_.cloneDeep(this.searchParams)
          let change = false
          Object.keys(n).forEach(key => {
            let containKey = false
            searchParams.forEach(item => {
              if (item.name === key) {
                containKey = true
                if (item.value !== n[key]) {
                  change = true
                  item.value !== n[key] && (item.value = n[key])
                }
              }
            })
            if (!containKey) {
              change = true
              const name = key
              const value = n[key]
              const param = { name, value }
              searchParams.push(param)
            }
          })
          if (change) {
            this.searchParams = searchParams
          }
        }
      }
    },
    searchContent (n) {
      if (n) {
        const paramsArr = n.split(/\s[aA][nN][dD]\s/)
        const paramsObj = {}
        let change = false
        paramsArr.forEach(string => {
          const param = string.split('=')
          if (param.length > 1) {
            let value = param[1].trim()
            const valueArr = value.split('"')
            if (valueArr.length > 2) {
              value = valueArr[1].trim()
            }
            paramsObj[param[0].trim()] = value
          }
        })
        const searchParams = this.$_.cloneDeep(this.searchParams)
        Object.keys(paramsObj).forEach(key => {
          let containKey = false
          searchParams.forEach(item => {
            if (item.name === key) {
              containKey = true
              if (item.value !== paramsObj[key]) {
                change = true
                item.value = paramsObj[key]
              }
            }
          })
          if (!containKey) {
            change = true
            searchParams.push({ name: key, value: paramsObj[key] })
          }
        })
        if (change) {
          this.searchParams = searchParams
        }
      } else {
        this.reset()
      }
      this.searchContentTemp !== n && (this.searchContentTemp = n)
    },
    searchParams: {
      deep: true,
      handler (n) {
        if (n) {
          let fromInput = false // input内容改变导致的变化
          let fromFilter = false // 左侧filter过滤条件改变导致的变化
          const filterKeys = Object.keys(this.filterObj)
          if (n.length === 0) {
            this.searchContentTemp = ''
            this.searchContent = ''
            this.filterObj = {}
          } else if (filterKeys.length !== n.length) {
            fromInput = true
          } else {
            fromFilter = true
          }
          if (fromInput) { // 是input导致的改变，则同步给filter
            const filterObj = {}
            n.forEach(item => {
              filterObj[item.name] = item.value
            })
            this.filterObj = filterObj
          }
          if (fromFilter) { // 是filter导致的改变，则同步给input
            let searchContent = ''
            n.forEach(item => {
              if (searchContent) {
                searchContent += ' AND '
              }
              searchContent += `${item.name}="${item.value}"`
            })
            this.searchContent = searchContent
          }
          // 请求接口，获取左侧过滤条件和右侧entity列表
          this.search()
        }
      }
    }
  },
  async mounted () {
    this.searchParams = []
  },
  setup () {
    const from = ref(Object.keys(entityType)[0])
    return {
      entityType, // 所有entity类型，用于header下拉框选择
      from // 当前entity类型，ip/domain/app
    }
  }
}
</script>

<style lang="scss">
@import '~@/components/entities/entities.scss';
</style>
