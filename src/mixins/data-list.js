import { tableSort } from '@/utils/tools'
import { defaultPageSize, fromRoute, position, storageKey } from '@/utils/constants'
import { get, del } from '@/utils/http'
import { ref } from 'vue'
import pagination from '@/components/common/Pagination'
import axios from 'axios'
import { api } from '@/utils/api'

export default {
  components: {
    pagination
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
        total: ''
      },
      /* 工具参数 */
      tools: {
        loading: true, // 是否显示table加载动画
        customTableTitle: [] // 自定义列工具的数据
      },
      mainTableHeight: position.tableHeight.normal, // 主列表table高度
      batchDeleteObjs: [],
      object: {},
      searchLabel: ref({}),

      tableData: [],
      scrollbarWrap: null,
      delFlag: false,
      operationWidth: '165' // 操作列宽
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
    selectionChange (objs) {
      this.batchDeleteObjs = objs
    },
    getTableData (params) {
      if (params) {
        this.searchLabel = { ...this.searchLabel, ...params }
      }
      this.searchLabel = { ...this.searchLabel, ...this.pageObj }
      this.tools.loading = true
      delete this.searchLabel.total
      let listUrl = this.url
      if (this.listUrl) {
        listUrl = this.listUrl
      }
      get(listUrl, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          if (this.tableId === 'builtinReportTable') {
            this.tableData = response.data.list.map(item => {
              return {
                ...item,
                config: item.config ? JSON.parse(item.config) : {}
              }
            })
          } else {
            this.tableData = response.data.list
          }
          this.pageObj.total = response.data.total
          // TODO 回到顶部
        }
      })
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
      })
    },
    newObject () {
      return JSON.parse(JSON.stringify(this.blankObject))
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getTableData()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
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
    copy (u) {
      this.object = { ...u, name: 'Copy from ' + u.name, id: '' }
      this.rightBox.show = true
    },
    download (u) {
      if (this.$refs.dataTable.loadingTableId === u.id) { // 列表单个下载
        return
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
        this.$refs.dataTable.$refs.dataTable.doLayout()
      })
    },
    tableDataSort (orderBy) {
      this.searchLabel.orderBy = orderBy
      this.getTableData()
    },
    search (params) {
      this.pageObj.pageNo = 1
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
        if (n.length === 0 && this.pageObj.pageNo > 1) {
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
  mounted () {
    const pageSize = localStorage.getItem(storageKey.pageSize + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId)
    if (pageSize && pageSize !== 'undefined') {
      this.pageObj.pageSize = pageSize
    }
    let localStorageTableTitle = localStorage.getItem(storageKey.tableTitle + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId)
    localStorageTableTitle = localStorageTableTitle ? JSON.parse(localStorageTableTitle) : this.$refs.dataTable.tableTitle
    this.tools.customTableTitle = this.$refs.dataTable.tableTitle.map((item, index) => { // 修复切换中英文的问题
      if (localStorageTableTitle[index]) {
        item.show = localStorageTableTitle[index].show
      }
      return item
    })
    if (localStorageTableTitle && (localStorageTableTitle.length > this.$refs.dataTable.tableTitle.length)) {
      const arr = localStorageTableTitle.splice(this.$refs.dataTable.tableTitle.length, localStorageTableTitle.length)
      this.tools.customTableTitle = this.tools.customTableTitle.concat(arr)
    }
    this.getTableData()
  }
}
