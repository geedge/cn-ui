import { tableSort } from '@/utils/tools'
import { defaultPageSize, fromRoute, position, storageKey, dbTableColumnCustomizeConfigPre } from '@/utils/constants'
import { get, del } from '@/utils/http'
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
      if (this.batchDeleteObjs.length == 1) {
        this.disableEdit = false
      } else {
        this.disableEdit = true
      }
      if (this.batchDeleteObjs.length >= 1) {
        this.disableDelete = false
      } else {
        this.disableDelete = true
      }
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
      // todo 此段是为了避免mock没开启，打开detection界面报错提示，后续再开发detection时删除
      if (listUrl === api.detection.list) {
        const list = []
        for (let i = 0; i < 20; i++) {
          const obj = {
            ruleId: 100000 + i,
            ruleType: 'indicator_match',
            status: 1,
            name: 'name123',
            category: 'Security Event',
            eventType: 'C&C',
            description: 'Built-in darkweb IoC',
            ruleConfig: {
              knowledge: {
                name: 'VPN Server IP',
                category: 'user_defined'
              }
            }
          }
          if (i % 2 === 0) {
            obj.ruleType = 'threshold'
            obj.ruleConfig = {
              dimensions: 'Destination IP/CIDR'
            }
            obj.description = 'abuse.ch is providing community driven threat intelligence on \n' +
              'cyber threats. It is the home of a couple of projects that are \n' +
              'helping internet service providers and network operators protect …'
          } else {
            obj.status = 0
          }
          list.push(obj)
        }

        this.tableData = list
        this.pageObj.total = list.length
        this.loading = false
      } else {
        get(listUrl, this.searchLabel).then(response => {
          if (response.code === 200) {
            this.tableData = response.data.list
            this.pageObj.total = response.data.total
            if (!this.tableData || this.tableData.length === 0) {
              this.isNoData = true
            } else {
              this.isNoData = false
            }
          } else {
            console.error(response)
            this.isNoData = true
            if (response.message) {
              this.$message.error(response.message)
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
      }
    },
    del (row) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        del(this.url + '?ids=' + row.id).then(response => {
          if (response.code === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(e => {})
    },
    delSelectionChange () {
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
          type: 'warning'
        }).then(() => {
          this.toggleLoading(true)
          axios.delete(this.url + '?ids=' + ids).then(response => {
            if (response.data.code === 200) {
              this.delFlag = true
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
              this.getTableData()
            } else {
              this.$message.error(response.data.message)
            }
          }).finally(() => {
            this.toggleLoading(false)
          })
        }).catch(() => {})
          .finally(() => {
            if (this.isSelectedStatus != undefined) {
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
      get(`${this.url}/${u.id}`).then(response => {
        if (response.code === 200) {
          this.object = response.data
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
        get(`${this.url}/${this.batchDeleteObjs[0].id}`).then(response => {
          if (response.code === 200) {
            this.object = response.data
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
      get(api.reportTemp).then(res => {
        if (res.code === 200) {
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
        if (this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
          this.$refs.dataTable.$refs.dataTable.doLayout()
        }
      })
    },
    tableDataSort (orderBy) {
      this.searchLabel.orderBy = orderBy
      this.getTableData()
    },
    search (params) {
      this.pageObj.pageNo = 1
      delete this.searchLabel.category
      delete this.searchLabel.source
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

    localStorageTableTitle = localStorageTableTitle && localStorageTableTitle.config
      ? localStorageTableTitle.config
      : (this.$refs.dataTable && this.$refs.dataTable.tableTitle ? this.$refs.dataTable.tableTitle : [])
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
