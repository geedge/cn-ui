import { tableSort } from '@/utils/tools'
import { defaultPageSize, fromRoute, position } from '@/utils/constants'
import { get, del } from '@/utils/http'
import { ref } from 'vue'
import pagination from '@/components/common/Pagination'
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
          this.tableData = response.data.list
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
      localStorage.setItem('cn-pageSize-' + localStorage.getItem('cn-username') + '-' + this.tableId, val)
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
      get('/report/job/downloadPdf', { id: u.id }).then(data => {
        this.downloadAgentFlag = false
        let fileName = 'confBuiltin'
        const disposition = data.headers['content-disposition']
        if (disposition) {
          fileName = disposition.split(';')[1].split('filename=')[1]
        }
        // 由于ie不支持download属性，故需要做兼容判断
        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
          // ie独有的msSaveBlob属性，data.data为Blob文件流
          window.navigator.msSaveBlob(data.data, fileName)
        } else {
          // 以下流程即为文章开始的下载流程
          const url = window.URL.createObjectURL(data.data)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
        }
      }).catch(() => {
        this.downloadAgentFlag = false
      })
    },
    preview (u) {
      get('/report/job/view', { id: u.id }).then(res => {
        if (res.code === 200) {
          console.log(res)
        }
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
    const pageSize = localStorage.getItem('cn-pageSize-' + localStorage.getItem('cn-username') + '-' + this.tableId)
    if (pageSize && pageSize !== 'undefined') {
      this.pageObj.pageSize = pageSize
    }
    let localStorageTableTitle = localStorage.getItem('cn-tableTitle-' + localStorage.getItem('cn-username') + '-' + this.tableId)
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
