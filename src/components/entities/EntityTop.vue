<template >
  <div class="entity-pop-custom" style="width: 440px" v-ele-click-outside="esc">
    <div class="pop-title" >
      <div>
        <i :class="item.icon"></i>
        <span>{{item.label}}</span>
      </div>
      <button @click="esc" class="el-dialog__headerbtn" type="button"><i class="el-dialog__close el-icon el-icon-close"></i></button>
    </div>
    <div class="filter-top-box" >
      <div class="filter-top-body">
        <loading :loading="loading"></loading>
        <div class="filter-top-type">{{item.value}}{{$t('overall.operator')}}{{item.label}}</div>
        <el-table
            :data="entityTopTenData"
            :header-cell-style="tableHeaderCellStyle"
            :header-row-style="tableHeaderRowStyle"
            :row-style="rowStyle"
            :cell-style="{'text-align':'left','padding': '1px 0','border':'0px'}"
            class="customer-no-border-table"
            style="width: 100%"
            @row-click="filter"
        >
          <el-table-column label="Top10" type="index" :index="indexMethod" width="81"/>
          <el-table-column prop="name" :label="item.label" width="120">
            <template #default="scope">
              <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" :title="scope.row.name">{{scope.row.name}}</div>
            </template>
          </el-table-column>
            <el-table-column prop="count" :label="$t('overall.number')" width="79" />
            <el-table-column prop="percent" :label="$t('overall.percent')" >
              <template #default="scope">
                <div class="top-table-percent" >
                  <div >{{ scope.row.percent }}%</div>
                  <div class="top-table-progress"><el-progress :percentage="scope.row.percent" :show-text="false" color="#23BF9A"></el-progress></div>
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
    loading: Boolean
  },
  data () {
    return {
      entityTopStyle: {
        top: 0,
        left: 0
      },
      custom: [],
      item: {},
      entityTopTenData: []
    }
  },
  methods: {
    // 悬浮点击空白隐藏
    esc () {
      this.$emit('close')
      this.item = {}
      this.entityTopTenData = []
    },
    filter (row) {
      this.$emit('filter', row.name, this.item)
    },
    initEntityTop (itemVal, data, totalCount) {
      this.item = itemVal
      if (data.length > 0) {
        this.entityTopTenData = data.map(d => {
          return {
            ...d,
            name: this.valueHandle(d.name, this.item.topColumn) || 'unknown',
            percent: (parseFloat(d.count / totalCount) * 100).toFixed(2)
          }
        })
      } else {
        this.entityTopTenData = []
      }
    },
    indexMethod (index) {
      return index + 1
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
  },
  computed: {

  }
}
</script>
<style>
    .entity-pop-custom .el-table::before {
        height: 0px;
    }

</style>
