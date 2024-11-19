import { handleSpecialCode, tableSort } from '@/utils/tools'
import { defaultPageSize, fromRoute, position, storageKey, dbTableColumnCustomizeConfigPre, dbTableColumnCustomizeConfig } from '@/utils/constants'
import _ from 'lodash'
import { ref } from 'vue'
import pagination from '@/components/common/Pagination'
import axios from 'axios'
import { api } from '@/utils/api'
import Loading from '@/components/common/Loading'
import indexedDBUtils from '@/indexedDB'

export default {
  components: {
    pagination,
    Loading
  },
  data () {
    return {
      fromRoute: fromRoute,
      // 侧滑
      rightBox: {
        show: false
      },
      pageObj: { // 分页对象
        pageNo: 1,
        pageSize: defaultPageSize,
        total: null// total为0时，elment分页组件pagination,修改当前页无效。修改为null即可解决此问题
      },
      /* 工具参数 */
      tools: {
        // loading: true, // 是否显示table加载动画
        customTableTitle: [] // 自定义列工具的数据
      },
      mainTableHeight: position.tableHeight.normal, // 主列表table高度
      batchDeleteObjs: [],
      object: {},
      searchLabel: ref({}),

      isFirstQuery: true,

      tableData: [],
      scrollbarWrap: null,
      delFlag: false,
      disableEdit: true, // 编辑按钮是否不可用，当选择多条记录的时候，编辑按钮不可用
      disableDelete: true,
      operationWidth: '165', // 操作列宽
      loading: true,
      isNoData: false
    }
  },
  methods: {
    sortableShow: tableSort.sortableShow,
    propTitle: tableSort.propTitle,
    asce: tableSort.asce,
    desc: tableSort.desc,
    strToDate: tableSort.strToDate,
    tableOperation ([command, row]) {
      switch (command) {
        case 'edit': {
          this.edit(row)
          break
        }
        case 'delete': {
          this.del(row)
          break
        }
        case 'copy': {
          this.copy(row)
          break
        }
        case 'download': {
          this.download(row)
          break
        }
        case 'preview': {
          this.preview(row)
          break
        }
        default:
          break
      }
    },
    toggleLoading (loading) {
      this.loading = loading
    },
    selectionChange (objs) {
      this.batchDeleteObjs = []
      objs.forEach(obj => {
        const delObj = this.batchDeleteObjs.find(item => item.id === obj.id)
        if (delObj === undefined) {
          this.batchDeleteObjs.push(obj)
        }
      })
      this.disableEdit = this.batchDeleteObjs.length !== 1
      // todo 该字段后续会修改
      this.disableEdit = !!objs.flag
      this.disableDelete = this.batchDeleteObjs.length < 1
    },
    getTableData (params, isAll, isClearType) {
      if (isAll) {
        this.searchLabel = null
      } else if (isClearType) {
        this.searchLabel.type = ''// 换新接口需要修改的属性名称
      }
      this.searchLabel = { ...this.searchLabel, ...this.pageObj }
      if (params) {
        this.searchLabel = { ...this.searchLabel, ...params }
      }
      this.isNoData = false
      this.toggleLoading(true)
      delete this.searchLabel.total
      let listUrl = this.url
      if (this.listUrl) {
        listUrl = this.listUrl
      }
      axios.get(listUrl, { params: this.searchLabel }).then(response => {
        if (response.status === 200) {
          this.tableData = _.get(response, 'data.data.list', [])
          this.pageObj.total = _.get(response, 'data.data.total', 0)
          this.isNoData = !this.tableData || this.tableData.length === 0
        } else {
          console.error(response)
          this.isNoData = true
          if (response.data.message) {
            this.$message.error(response.data.message)
          } else {
            this.$message.error(this.$t('tip.somethingWentWrong'))
          }
        }
      }).catch(() => {
        this.isNoData = true
      }).finally(() => {
        this.toggleLoading(false)
        this.loading = false
      })
    },
    del (row) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        axios.delete(this.url + '?ids=' + row.id).then(response => {
          if (response.status === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.data.message)
          }
        }).catch(e => {
          // 表格内无删除，只是顶部工具栏有
          this.$message.error(e.response.data.message)
        })
      }).catch(e => {})
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
          axios.delete(this.url + '?ids=' + ids).then(response => {
            if (response.status === 200) {
              this.delFlag = true
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
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
          }
        })
      }
    },
    newObject () {
      return JSON.parse(JSON.stringify(this.blankObject))
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      if (this.isFirstQuery) {
        this.isFirstQuery = false
        setTimeout(() => {
          this.getTableData()
        }, 300)
      } else {
        this.getTableData()
      }
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.pageObj.pageNo = 1
      localStorage.setItem(storageKey.pageSize + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId, val)
      this.getTableData()
    },
    add () {
      this.object = this.newObject()
      this.rightBox.show = true
    },
    closeRightBox (refresh) {
      this.rightBox.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    edit (u) {
      axios.get(`${this.url}/${u.id}`).then(response => {
        if (response.status === 200) {
          this.object = response.data.data
          this.rightBox.show = true
        }
      })
    },
    editSelectRecord () {
      if (this.batchDeleteObjs.length === 0) {
        this.$alert(this.$t('tip.pleaseSelectForEdit'), {
          confirmButtonText: this.$t('tip.yes'),
          type: 'warning'
        }).catch(() => {})
      } else {
        axios.get(`${this.url}/${this.batchDeleteObjs[0].id}`).then(response => {
          if (response.status === 200) {
            this.object = response.data.data
            if (this.url === '/sys/i18n') {
              this.object.value = handleSpecialCode(this.object.value)
            }
            this.rightBox.show = true
          }
        })
      }
    },
    copy (u) {
      this.object = { ...u, name: 'Copy from ' + u.name, id: '' }
      this.rightBox.show = true
    },
    download (u) {
      if (this.$refs.dataTable.loadingTableId === u.id) { // 列表单个下载
        return
      }
      if (localStorage.getItem(storageKey.s3Enable) == 1) {
        if (u.state !== 1 || u.upload !== 1) {
          return
        }
      } else {
        if (u.state !== 1) {
          return
        }
      }
      let fileName = ''
      let url = ''
      let params = {}
      fileName = u.name + '.pdf' // 文件名称
      url = api.reportDownloadPdf // 单个 pdf 下载
      params = {
        id: u.id
      }
      this.$refs.dataTable.loadingTableId = u.id // 列表单个下载
      if (!u) { // 列表单个下载
        this.$refs.dataTable.loadingTableId = u.id
        return
      }
      // 判断是否成功登陆成功
      if (!localStorage.getItem(storageKey.token)) {
        return window.location.replace('/')
      }
      axios.get(api.reportTemp).then(res => {
        if (res.status === 200) {
          axios.get(url, { responseType: 'blob', params: params }).then(res => {
            if (window.navigator.msSaveOrOpenBlob) {
              // 兼容ie11
              const blobObject = new Blob([res.data])
              window.navigator.msSaveOrOpenBlob(blobObject, fileName)
            } else {
              const url = URL.createObjectURL(new Blob([res.data]))
              const a = document.createElement('a')
              document.body.appendChild(a) // 此处增加了将创建的添加到body当中
              a.href = url
              a.download = fileName
              a.target = '_blank'
              a.click()
              a.remove() // 将a标签移除
            }
            this.$refs.dataTable.loadingTableId = !u.id
          }, error => {
            const $self = this
            const reader = new FileReader()
            reader.onload = function (event) {
              const responseText = reader.result
              const exception = JSON.parse(responseText)
              if (exception.message) {
                $self.$message.error(exception.message)
              } else {
                console.error(error)
              }
            }
            reader.readAsText(error.response.data)
            this.$refs.dataTable.loadingTableId = !u.id
          }).catch(() => {
            this.$refs.dataTable.loadingTableId = !u.id
          })
        }
      })
    },
    preview (u) {
      if (this.$refs.dataTable.loadingPreviewId === u.id) { // 列表单个下载
        return
      }
      if (localStorage.getItem(storageKey.s3Enable) == 1) {
        if (u.state !== 1 || u.upload !== 1) {
          return
        }
      } else {
        if (u.state !== 1) {
          return
        }
      }
      const params = {
        id: u.id
      }
      this.$refs.dataTable.loadingPreviewId = u.id
      axios.get(api.reportView, { params: params }).then(res => {
        if (!localStorage.getItem(storageKey.token)) {
          this.$refs.dataTable.loadingPreviewId = !u.id
          return
        }
        const prevWindow = window.open('', '')
        prevWindow.document.write(res.data)
        prevWindow.focus()
        this.$refs.dataTable.loadingPreviewId = !u.id
      }).catch(() => {
        this.$refs.dataTable.loadingPreviewId = !u.id
      })
    },
    esc () {
      this.rightBox.show = false
    },
    dragend () {
      this.$nextTick(() => {
        if (this.$refs.dataTable && this.$refs.dataTable.$refs &&
            this.$refs.dataTable.$refs.dataTable
        ) {
          this.$refs.dataTable.$refs.dataTable.doLayout()
        }
      })
    },
    tableDataSort (orderBy) {
      this.searchLabel.orderBy = orderBy
      this.getTableData()
    },
    search (params, flag, list) {
      this.pageObj.pageNo = 1
      if (flag !== 'detection') {
        delete this.searchLabel.category
        delete this.searchLabel.source
      }
      if (list && list.length > 0) {
        if (list.indexOf('status') > -1) {
          delete this.searchLabel.status
        }
        if (list.indexOf('category') > -1) {
          delete this.searchLabel.category
        }
        if (list.indexOf('eventType') > -1) {
          delete this.searchLabel.eventType
        }
      }
      this.getTableData(params)
    },
    getTimeString () {
      const split = '-'
      const date = new Date()
      const year = date.getFullYear()
      const month = this.formatNum(date.getMonth() + 1)
      const day = this.formatNum(date.getDate())
      const hours = this.formatNum(date.getHours())
      const minutes = this.formatNum(date.getMinutes())
      const seconds = this.formatNum(date.getSeconds())
      return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds
    },
    formatNum (num) {
      return num > 9 ? num : '0' + num
    }
  },
  watch: {
    tableData: {
      deep: true,
      handler (n) {
        if (n && n.length === 0 && this.pageObj.pageNo > 1) {
          this.pageNo(this.pageObj.pageNo - 1)
        }
        // TODO 不是删除时回到顶部
      }
    },
    'tools.customTableTitle': {
      deep: true,
      handler (n) {
        this.dragend()
      }
    }
  },
  async mounted () {
    const pageSize = localStorage.getItem(storageKey.pageSize + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId)
    if (pageSize && pageSize !== 'undefined') {
      this.pageObj.pageSize = pageSize
    }
    const userId = localStorage.getItem(storageKey.userId)
    const tableName = dbTableColumnCustomizeConfigPre + '-' + this.tableId
    let localStorageTableTitle = []
    if (indexedDBUtils.selectTable(tableName)) {
      localStorageTableTitle = await indexedDBUtils.selectTable(tableName).get({ id: userId })
    }

    const curTableTitles = this.$refs.dataTable && this.$refs.dataTable.tableTitle ? this.$refs.dataTable.tableTitle : []
    const curTableConfig = dbTableColumnCustomizeConfig.find(item => item.tableName === tableName)
    if (localStorageTableTitle && curTableConfig &&
          localStorageTableTitle.version !== curTableConfig.version && curTableTitles) {
      if (this.$refs.dataList) {
        this.$refs.dataList.updateCustomTableTitle(curTableTitles)
      }
      await indexedDBUtils.selectTable(tableName).put({
        id: userId,
        version: curTableConfig.version,
        config: _.cloneDeep(curTableTitles)
      })
    }

    localStorageTableTitle = localStorageTableTitle && localStorageTableTitle.config ? localStorageTableTitle.config : curTableTitles
    // this.tools.customTableTitle = this.$refs.dataTable.tableTitle.map((item, index) => { // 修复切换中英文的问题
    //   if (localStorageTableTitle[index]) {
    //     item.show = localStorageTableTitle[index].show
    //   }
    //   return item
    // })

    // 不够优美，后续修改
    // 为了避免缓存里的label在切换中英文时不一致，因为在拖拽后，键值不一致了，故根据prop匹配来修改label
    for (let i = 0; i < localStorageTableTitle.length; i++) {
      for (let j = 0; j < this.tools.customTableTitle.length; j++) {
        if (localStorageTableTitle[i].prop === this.tools.customTableTitle.prop) {
          localStorageTableTitle[i].label = this.tools.customTableTitle.label
          break
        }
      }
    }
    this.tools.customTableTitle = localStorageTableTitle
    if (localStorageTableTitle && this.$refs.dataTable && this.$refs.dataTable.tableTitle && (localStorageTableTitle.length > this.$refs.dataTable.tableTitle.length)) {
      const arr = localStorageTableTitle.splice(this.$refs.dataTable.tableTitle.length, localStorageTableTitle.length)
      this.tools.customTableTitle = this.tools.customTableTitle.concat(arr)
    }
    // this.getTableData()
  },
  unmounted () {
    this.isNoData = false
  }
}
