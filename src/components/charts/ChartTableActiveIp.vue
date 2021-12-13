<template>
  <div class="cn-chart cn-chart__table">
    <div class="cn-chart__header chart-header-position" >
      <slot name="chartErrorInfo"></slot>
      <div class="header__title">
        <slot name="title"></slot>
      </div>
      <div class="header__operations">
        <slot name="operations"></slot>
      </div>
    </div>
    <div class="chart__loading" v-show="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div class="cn-chart__body" v-no-data="noData">
      <el-table
          style="width: 100%"
          tooltip-effect="light"
          :data="tableData"
          :show-header="false"
          :cell-style="{padding:'7px 0'}"
      >
        <el-table-column>
          <template #default="{ row }">
              <div class="active-ip__icon"><i class="cn-icon cn-icon-ip ip-green"></i></div>
             <div class="active-ip__content" >
               {{row['name']}}
             </div>
          </template>
        </el-table-column>
        <el-table-column align="center">
          <template #default="{ row }">
            <span>
                {{row['num']}}
            </span>
          </template>
        </el-table-column>

        <el-table-column
            v-for="(c, i) in tableColumns"
            show-overflow-tooltip
            :key="i"
            :label="c.label"
            :prop="c.prop"
        >
          <template #default="{ row }">
            <span v-if="c.prop === 'bytes'">
                {{unitConvert(row[c.prop], unitTypes.byte).join(' ')}}
            </span>
            <span v-else-if="c.prop === 'packets' || c.prop === 'sessions'">
                {{unitConvert(row[c.prop], unitTypes.number).join(' ')}}
            </span>
            <span v-else>
                {{row[c.prop]}}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="cn-chart__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
export default {
  name: 'ChartTableActiveIp',
  props: {
    tableColumns: Array,
    tableData: Array,
    loading: Boolean,
    noData: Boolean
  },
  setup () {
    return {
      unitTypes,
      unitConvert
    }
  }
}
</script>

<style>

  .active-ip__icon {
    overflow: hidden;
    position: absolute;
    top: 8px;
    left: 6px;
    display: flex;
    justify-content: center;
    justify-items: center;
    align-items: center;
    width: 23px;
    height: 23px;
    border-radius: 50%;
    background: #e8fbf9;
    border: 2px solid #e8fbf9;
  }
  .ip-green {
    color: #23BF9A;
  }
  .active-ip__content {
    position: absolute;
    top: 7px;
    left: 35px;
    overflow: hidden;
  }
</style>
