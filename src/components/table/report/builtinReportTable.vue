<template>
  <el-table
      id="userTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @select-all="selectionChangeAll"
      @select="select"
  >
    <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        width="55">
    </el-table-column>
    <el-table-column
        v-for="(item, index) in customTableTitles"
        :key="`col-${index}`"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
        :sort-orders="['ascending', 'descending']"
        :sortable="item.sortable"
        :width="`${item.width}`"
    >
      <template #header>
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template #default="scope" :column="item">
        <span v-if="item.prop === 'dataRange'">
          <template v-if="scope.row.startTime && scope.row.endTime">
            {{scope.row.startTime}}-{{scope.row.endTime}}
          </template>
        </span>
        <span v-else>{{scope.row[item.prop]}}</span>
      </template>

    </el-table-column>
    <el-table-column
        :resizable="false"
        :width="operationWidth"
        fixed="right">
      <template #header>
        <div class="table-operation-title">{{$t('overall.option')}}</div>
      </template>
      <template #default="scope">
        <div class="table-operation-items">
          <div class="table-operation-item--down" @click="tableOperation(['download', scope.row])"><i class="cn-icon cn-icon-download2"></i></div>
          <div class="table-operation-item--preview" @click="tableOperation(['preview', scope.row])"><i class="cn-icon cn-icon-preview"></i></div>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <div class="table-operation-all">
    <el-checkbox v-model="checkboxAll" @change="builtinReportCheckbox"></el-checkbox>
    <div class="table-operation-all-span">
      <span>{{ $t('overall.all') }}</span>
      <span :class="{'table-operation-all-checkbox': checkboxAll}" @click="batchDownload">{{$t('report.batchDow')}}</span>
    </div>
  </div>
</template>

<script>
import table from '@/mixins/table'
import { get } from '@/utils/http'
import axios from 'axios'
export default {
  name: 'builtinReportTable',
  mixins: [table],
  props: {
    builtinReportLeftMenu: Number
  },
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.chart.remark'),
          prop: 'remark',
          show: true
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('report.dataRange'),
          prop: 'dataRange',
          show: true
        }
      ],
      checkboxAll: false,
      checkboxIds: '',
      builtinId: ''
    }
  },
  methods: {
    select (objs) {
      this.checkboxIds = objs.map(item => { return item.id }).join(',')
      if (objs.length > 0) {
        this.checkboxAll = true
      } else {
        this.checkboxAll = false
      }
    },
    builtinReportCheckbox (objs) {
      if (objs) {
        this.selectionChangeAll(this.tableData)
      }
    },
    selectionChangeAll (objs) {
      console.log(objs)
    },
    batchDownload: function () {
      const fileName = 'builtinReport' + '-' + this.getTimeString() + '.zip'
      const params = {
        ids: this.checkboxIds
      }
      axios.get('/report/job/batchDownloadPdf', { responseType: 'blob', params: params }).then(res => {
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
      })
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
  }
}
</script>
