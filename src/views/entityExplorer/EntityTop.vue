<template >
  <div class="entity-pop-custom" v-ele-click-outside="esc">
    <div class="pop-title">
      <div>
        <i :class="itemData.icon"></i>
        <span>{{itemData.label}}</span>
      </div>
    </div>
<!--    <button @click="esc" class="el-dialog__headerbtn" type="button"><i class="el-dialog__close el-icon el-icon-close"></i></button>-->
    <div class="filter-top-box">
      <div class="filter-top-body">
        <loading :loading="loading"></loading>
        <div class="filter-top-type">{{itemData.value}}{{$t('overall.operator')}}{{itemData.label}}</div>
        <el-table
            :data="popoverData"
            :header-cell-style="tableHeaderCellStyle"
            :header-row-style="tableHeaderRowStyle"
            :row-style="rowStyle"
            :cell-style="{'text-align':'left','padding': '1px 0','border':'0px'}"
            class="customer-no-border-table"
            style="width: 100%; min-height: 293px;"
            @row-click="filter"
        >
          <el-table-column label="Top10" type="index" :index="indexMethod" width="81"/>
          <el-table-column prop="name" :label="itemData.label" width="120">
            <template #default="scope">
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" :title="scope.row.name">
                {{valueHandle(scope.row.name, topColumn) || 'unknown'}}
              </div>
            </template>
          </el-table-column>
            <el-table-column prop="count" :label="$t('overall.number')" width="79" />
            <el-table-column prop="percent" :label="$t('overall.percent')" >
              <template #default="scope">
                <div class="top-table-percent" >
                  {{(this.totalCount === 0 ? 0 : parseFloat(scope.row.count / this.totalCount) * 100).toFixed(2)}}%
                  <div class="top-table-progress"><el-progress :percentage="(this.totalCount === 0 ? 0 : parseFloat(scope.row.count / this.totalCount) * 100).toFixed(2)" :show-text="false" color="#23BF9A"></el-progress></div>
                </div>
              </template>
            </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { riskLevelMapping } from '@/utils/constants'
import Loading from '@/components/common/Loading'

export default {
  components: { Loading },
  props: {
    loading: Boolean,
    popoverData: Array,
    itemData: Object,
    totalCount: Number,
    topColumn: String
  },
  data () {
    return {
      custom: []
    }
  },
  computed: {
    totalCount2 () {
      return function (row) {
        console.info(this.totalCount, row, (this.totalCount === 0 ? 0 : parseFloat(row.count / this.totalCount) * 100).toFixed(2))
        return (this.totalCount === 0 ? 0 : parseFloat(row.count / this.totalCount) * 100).toFixed(2)
      }
    }
  },
  methods: {
    indexMethod (index) {
      return index + 1
    },
    esc () {
      this.$emit('close')
    },
    filter (row) {
      this.$emit('filter', row.name, this.itemData)
    },
    valueHandle (value, columnName) {
      if (columnName === 'app_risk') {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value === value
        })
        return (m && m.name) || value
      }
      return value
    },
    tableHeaderCellStyle ({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0) {
        return 'padding-bottom:5px;padding-top:14px;'
      }
    },
    tableHeaderRowStyle ({ row, rowIndex }) {
      if (rowIndex === 0) {
        return 'color: #333333;font-weight: 500;font-size: 14px;'
      }
    },
    rowStyle ({ row, rowIndex }) {
      return 'height:21px;font-size: 14px;color: #666666;font-weight: 400;'
    }
  }
}
</script>
<style>
    .entity-pop-custom .el-table::before {
        height: 0px;
    }

</style>
