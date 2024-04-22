<template>
  <div class="cn-tag">
    <div class="cn-tag-right">
      <cn-data-list
              ref="dataList"
              :tableId="tableId"
              v-model:custom-table-title="tools.customTableTitle"
              :api="url"
              :from="fromRoute.tag"
              :layout="['search']"
              @search="search"
      >
        <template #top-tool-left>
          <button id="account-add"  class="business-button tag__btn margin-r-10"
                  @click="add">
            <i class="cn-icon-xinjian cn-icon"></i>
            <span>{{$t('overall.create')}}</span>
          </button>
          <button id="tag-edit"  class="business-button business-button--light tag__btn margin-r-10" :disabled="disableEdit"
                  @click="editTag">
            <i class="cn-icon-edit cn-icon"></i>
            <span>{{$t('overall.edit')}}</span>
          </button>
          <button id="tag-delete"  class="business-button business-button--light tag__btn margin-r-10" :disabled="disableDelete"
                  @click="delBatch">
            <i class="cn-icon-delete cn-icon"></i>
            <span>{{$t('overall.delete')}}</span>
          </button>
          <el-select
                  key="categorySelect"
                  v-model="category"
                  :teleported="false"
                  style="width: 210px; margin-right:10px;"
                  clearable
                  placeholder="All"
                  @change="categoryChange"
          >
            <template #prefix>
              <span class="select-prefix">{{$t('tag.category')}}:</span>
            </template>
            <el-option v-for="item in tagCategoryOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
          </el-select>
          <el-select
              key="intentSelect"
              v-model="intent"
              :teleported="false"
              style="width: 180px; margin-right:10px;"
              clearable
              placeholder="All"
              @change="intentChange"
          >
            <template #prefix>
              <span class="select-prefix">{{$t('tag.intention')}}:</span>
            </template>
            <el-option v-for="item in tagIntentOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
          </el-select>
          <el-select
                  key="sourceSelect"
                  v-model="source"
                  :teleported="false"
                  style="width: 190px; margin-right:10px;"
                  clearable
                  placeholder="All"
                  @change="sourceChange"
          >
            <template #prefix>
              <span class="select-prefix">{{$t('tag.source')}}:</span>
            </template>
            <el-option v-for="item in tagSourceOptions" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
          </el-select>
        </template>
        <template #default>
          <loading :loading="loading"></loading>
          <tag-table
                  ref="dataTable"
                  :api="url"
                  :isNoData="isNoData"
                  :custom-table-title="tools.customTableTitle"
                  :height="mainTableHeight"
                  :table-data="tableData"
                  @delete="del"
                  @edit="edit"
                  @download="download"
                  @preview="preview"
                  @reload="getTableData"
                  @selectionChange="selectionChange"
          />
        </template>
        <template #pagination>
          <pagination ref="pagination" :page-obj="pageObj" :tableData="tableData" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
        </template>
      </cn-data-list>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import TagTable from '@/components/table/tag/TagTable'
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import { api } from '@/utils/api'
import { tagIntentOptions, tagCategoryOptions, tagSourceOptions } from '@/utils/constants'
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import Loading from '@/components/common/Loading'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Tag',
  data () {
    return {
      builtinColor: false,
      url: api.tagList,
      tagIntentOptions,
      tagCategoryOptions,
      tagSourceOptions,
      tableId: 'tagTable',
      builtinLeftLoading: false,
      isInit: true,
      intent: '',
      category: '',
      source: '',
      name: ''
    }
  },
  /**
     * 添加vue3的setup，目的是添加/获取地址栏的参数
     */
  setup () {
    const { query } = useRoute()
    const urlPageNo = ref(parseInt(query.pageNo) || 1)

    return {
      urlPageNo
    }
  },
  mixins: [dataListMixin],
  components: {
    Loading,
    cnDataList,
    TagTable
  },
  mounted () {
    this.$nextTick(() => {
      this.getTableData()
    })
  },
  watch: {
  },
  methods: {
    intentChange (value) {
      let params = {}
      if (value) {
        params = { intent: value }
      }
      if (this.category) {
        params = { ...params, category: this.category }
      }
      if (this.name) {
        params = { ...params, name: this.name }
      }
      if (this.source || this.source === 0) {
        params = { ...params, name: this.source }
      }
      this.getTableData(params)
      this.$refs.dataTable.expandedIds = []
    },
    categoryChange (value) {
      let params = {}
      if (value) {
        params = { category: value }
      }
      if (this.intent) {
        params = { ...params, intent: this.intent }
      }
      if (this.name) {
        params = { ...params, name: this.name }
      }
      if (this.source || this.source === 0) {
        params = { ...params, name: this.source }
      }
      this.getTableData(params)
      this.$refs.dataTable.expandedIds = []
    },
    sourceChange (value) {
      let params = {}
      if (value || value === 0) {
        params = { isBuiltIn: value }
      }
      if (this.category) {
        params = { ...params, category: this.category }
      }
      if (this.intent) {
        params = { ...params, intent: this.intent }
      }
      if (this.name) {
        params = { ...params, name: this.name }
      }
      this.getTableData(params)
      this.$refs.dataTable.expandedIds = []
    },
    search (params) {
      this.name = params.q
      params = { name: this.name }
      if (this.intent) {
        params = { ...params, intent: this.intent }
      }
      if (this.category) {
        params = { ...params, category: this.category }
      }
      this.pageObj.pageNo = 1
      this.getTableData(params)
      this.$refs.dataTable.expandedIds = []
    },
    delBatch () {
      const ids = []
      if (this.batchDeleteObjs && this.batchDeleteObjs.length > 0) {
        this.batchDeleteObjs.forEach(item => {
          ids.push(item.id)
        })
      }
      if (ids.length === 0) {
        this.$alert(this.$t('tip.pleaseSelect'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {})
      } else {
        this.$confirm(this.$t('tip.confirmDelete'), {
          confirmButtonText: this.$t('tip.yes'),
          cancelButtonText: this.$t('tip.no'),
          customClass: 'del-model-message-box',
          type: 'warning'
        }).then(() => {
          this.toggleLoading(true)
          axios.delete(api.tag + '?id=' + ids).then(response => {
            if (response.status === 200) {
              this.delFlag = true
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
              let params = null
              if (this.intent) {
                params = { intent: this.intent }
              }
              if (this.category) {
                params = { ...params, category: this.category }
              }
              if (this.name) {
                params = { ...params, name: this.name }
              }
              this.getTableData(params)
            } else {
              this.$message.error(response.data.message)
            }
          }).catch(e => {
            this.$message.error(e.response.data.message)
          }).finally(() => {
            this.toggleLoading(false)
          })
        }).finally(() => {
          if (this.isSelectedStatus !== undefined) {
            this.isSelectedStatus = false
            this.disableDelete = true
            this.batchDeleteObjs = []
            this.$refs.dataTable.expandedIds = []
          }
        })
      }
    },
    getTableData (params) {
      this.searchLabel = null
      if (params) {
        this.searchLabel = { ...this.searchLabel, ...params }
      }
      this.searchLabel = { ...this.searchLabel, ...this.pageObj }
      this.isNoData = false
      this.toggleLoading(true)
      // delete this.searchLabel.total
      let listUrl = this.url
      if (this.listUrl) {
        listUrl = this.listUrl
      }

      if (!this.isInit) {
        axios.get(listUrl, { params: this.searchLabel }).then(response => {
          if (response.status === 200) {
            this.$nextTick(() => {
              this.tableData = response.data.data.list.map(item => {
                return {
                  ...item,
                  config: item.config ? JSON.parse(item.config) : {}
                }
              })
              this.pageObj.total = response.data.data.total
              this.isNoData = !this.tableData || this.tableData.length === 0
            })
            // TODO 回到顶部
          } else {
            this.isNoData = true
          }
        }).finally(() => {
          this.toggleLoading(false)
          this.$refs.dataTable.expandedIds = []
        })
      }
      this.isInit = false
    },
    add () {
      this.$router.push({
        path: '/tag/create',
        query: {
          t: +new Date()
        }
      })
    },
    edit (u) {
      this.initConfig(u)
      this.object = u
      this.rightBox.show = true
    },
    editTag () {
      if (this.batchDeleteObjs.length === 0) {
        this.$alert(this.$t('tip.pleaseSelectForEdit'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {})
      } else {
        this.jumpToEditPage(this.batchDeleteObjs[0].id)
      }
    },
    jumpToEditPage (id) {
      const pageNo = this.$router.currentRoute.value.query.pageNo
      this.$router.push({
        path: '/tag/edit',
        query: {
          t: +new Date(),
          pageNoForTable: pageNo || 1,
          id: id
        }
      })
    },
    initConfig (u) {
      if (!u.config) {
        u.config = {
          isRepeat: 0,
          cronExpression: '',
          startTime: '',
          endTime: '',
          queryParam: {},
          schedulerConfig: {
            type: 'day',
            weekDates: [],
            months: [],
            monthDates: [],
            monthWeekDates: [],
            interval: 1
          },
          timeConfig: {
            type: 'yesterday',
            offset: 1,
            unit: ''
          }
        }
      } else if (!u.config.schedulerConfig) {
        u.config.schedulerConfig = {
          type: 'day',
          weekDates: [],
          months: [],
          monthDates: [],
          monthWeekDates: [],
          interval: 1
        }
      } else if (!u.config.timeConfig) {
        u.config.timeConfig = {
          type: 'yesterday',
          offset: 1,
          unit: ''
        }
      }
    }
  }
}
</script>
