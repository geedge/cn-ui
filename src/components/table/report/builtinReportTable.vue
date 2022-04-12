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
  <div class="pagination-all">
    <el-checkbox v-model="checkbox" @change="builtinReportCheckbox"></el-checkbox>
    <div class="pagination-all-span">
      <span>{{ $t('overall.all') }}</span>
      <span :disabled="downloadAgentFlag" @click="batchDownload">{{$t('report.batchDow')}}</span>
    </div>
  </div>
</template>

<script>
import table from '@/mixins/table'
import { get } from '@/utils/http'
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
      checkbox: false,
      downloadAgentFlag: false,
      checkboxIds: '',
      builtinId: ''
    }
  },
  methods: {
    select (objs) {
      this.checkboxIds = objs.map(item => { return item.id }).join(',')
      if (objs.length > 0) {
        this.checkbox = true
      } else {
        this.checkbox = false
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
      this.downloadAgentFlag = true
      get('/report/export', { id: this.checkboxIds }).then(data => {
        this.downloadAgentFlag = false
        let fileName = 'confagent'
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
    }
  }
}
</script>
