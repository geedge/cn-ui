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
          :input-width="'100%'"
          @search="search"
      >
        <template #top-tool-left>
          <button id="account-add" class="business-button tag__btn margin-r-10" @click="add">
            <i class="cn-icon-xinjian cn-icon"></i>
            <span>{{ $t('overall.create') }}</span>
          </button>
          <button id="tag-edit" class="business-button business-button--light tag__btn margin-r-10"
                  :disabled="disableEdit"
                  @click="editSource">
            <i class="cn-icon-edit cn-icon"></i>
            <span>{{ $t('overall.edit') }}</span>
          </button>
          <button id="tag-delete" class="business-button business-button--light tag__btn margin-r-10"
                  :disabled="disableDelete"
                  @click="delBatch">
            <i class="cn-icon-delete cn-icon"></i>
            <span>{{ $t('overall.delete') }}</span>
          </button>
        </template>
        <template #default>
          <loading :loading="loading"></loading>
          <sources-table
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
          <pagination ref="pagination" :page-obj="pageObj" :tableData="tableData" :table-id="tableId" @pageNo='pageNo'
                      @pageSize='pageSize'></pagination>
        </template>
      </cn-data-list>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SourcesTable from '@/components/table/setting/SourcesTable'
import cnDataList from '@/components/table/CnDataList'
import dataListMixin from '@/mixins/data-list'
import { api } from '@/utils/api'
import { tagIntentOptions, tagCategoryOptions, tagSourceOptions } from '@/utils/constants'
import Loading from '@/components/common/Loading'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Sources',
  data () {
    return {
      builtinColor: false,
      url: api.setting.source.source,
      tagIntentOptions,
      tagCategoryOptions,
      tagSourceOptions,
      tableId: 'sourcesTable',
      builtinLeftLoading: false,
      isInit: true,
      intent: '',
      category: '',
      source: '',
      name: ''
    }
  },
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
    SourcesTable
  },
  mounted () {
    this.$nextTick(() => {
      this.getTableData()
    })
  },
  methods: {
    search (params) {
      this.name = params.q
      params = { name: this.name }
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
        }).catch(() => {
        })
      } else {
        this.$confirm(this.$t('tip.confirmDelete'), {
          confirmButtonText: this.$t('tip.yes'),
          cancelButtonText: this.$t('tip.no'),
          customClass: 'del-model-message-box',
          type: 'warning'
        }).then(() => {
          this.toggleLoading(true)
          axios.delete(this.url + '?ids=' + ids).then(response => {
            if (response.status === 200) {
              this.delFlag = true
              this.$message({
                duration: 2000,
                type: 'success',
                message: this.$t('tip.deleteSuccess')
              })
              this.getTableData()
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
        }).catch(() => {})
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
        path: '/setting/source/create',
        query: {
          t: +new Date()
        }
      })
    },
    edit (u) {
      this.object = u
      this.rightBox.show = true
    },
    editSource () {
      if (this.batchDeleteObjs.length === 0) {
        this.$alert(this.$t('tip.pleaseSelectForEdit'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {
        })
      } else {
        this.jumpToEditPage(this.batchDeleteObjs[0].id)
      }
    },
    jumpToEditPage (id) {
      const pageNo = this.$router.currentRoute.value.query.pageNo
      this.$router.push({
        path: '/setting/source/edit',
        query: {
          t: +new Date(),
          pageNoForTable: pageNo || 1,
          id: id
        }
      })
    }
  }
}
</script>
