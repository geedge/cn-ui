<template >
    <div class="entity-pop-custom" v-ele-click-outside="esc"  v-bind:style="entityTopStyle">
        <div class="pop-title" >
            <div>
                <i :class="item.icon"></i>
                <span>{{item.label}}</span>
            </div>
            <button @click="esc" class="el-dialog__headerbtn" type="button"><i class="el-dialog__close el-icon el-icon-close"></i></button>
        </div>
        <div class="filter-top-box" >
            <div class="filter-top-body">
                <div class="filter-top-type">{{item.value}}{{$t('overall.operator')}}{{item.label}}</div>
                <el-table :data="entityTopTenData" style="width: 100%"
                          :header-cell-style="tableHeaderCellStyle"
                          :header-row-style="tableHeaderRowStyle"
                          :row-style="rowStyle"
                          class="customer-no-border-table"
                          :cell-style="{'text-align':'left','padding': '1px 0','border':'0px'}">
                    <el-table-column label="Top10" type="index" :index="indexMethod" width="81"/>
                    <el-table-column prop="name" :label="$t('overall.country')" width="100" />
                    <el-table-column prop="value" :label="$t('overall.number')" width="79" />
                    <el-table-column prop="rate" :label="$t('overall.percent')" >
                        <template #default="scope">
                            <div class="top-table-percent">
                                <div >{{ scope.row.percent }}%</div>
                                <div class="top-table-progress"><el-progress :percentage="scope.row.percent" :show-text="false" color="#23BF9A" ></el-progress></div>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

    </div>
</template>

<script>
export default {
  props: {
  },
  data () {
    return {
      entityTopStyle: {
        // top:'300px',
        left: '580px'
      },
      custom: [],
      item: {},
      entityTopTenData: [
        {
          name: '中国',
          value: '376',
          percent: 20
        },
        {
          name: '美国',
          value: '298',
          percent: 18
        },
        {
          name: '英国',
          value: '268',
          percent: 16
        }, {
          name: '意大利',
          value: '230',
          percent: 15
        },
        {
          name: '泰国',
          value: '210',
          percent: 13
        },
        {
          name: '越南',
          value: '190',
          percent: 10
        }, {
          name: '马尔代夫',
          value: '172',
          percent: 9
        }, {
          name: '马来西亚',
          value: '156',
          percent: 6
        },
        {
          name: '新加坡',
          value: '140',
          percent: 5
        },
        {
          name: '缅甸',
          value: '120',
          percent: 4
        }
      ]
    }
  },
  created () {

  },
  watch: {
  },
  methods: {
    // 悬浮点击空白隐藏
    esc () {
      this.$emit('close')
    },
    initEntityTop (leftVal, itemVal, data) {
      // this.entityTopStyle.top = topVal+'px'
      this.entityTopStyle.left = leftVal + 'px'
      this.item = itemVal
      if (data.length > 0) {
        this.entityTopTenData = data
      }
    },
    indexMethod (index) {
      return index + 1
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
