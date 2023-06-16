<template>
  <el-table
    id="userTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    empty-text=" "
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
  >
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      :selectable="checkSelectable"
      width="55">
    </el-table-column>
    <el-table-column
      v-for="(item, index) in customTableTitles"
      :key="item.prop+index"
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
        <template v-if="item.prop === 'roles'">
          <template v-if="scope.row[item.prop]">
            {{scope.row[item.prop].map(t=>t.name).join(',')}}
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'lastLoginTime'">
          <template v-if="scope.row[item.prop]">
            {{dateFormatByAppearance(scope.row[item.prop])}}
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'status'">
          <el-switch
              v-if="scope.row.id"
              v-model="scope.row.status"
              active-value="1"
              :disabled="(scope.row.username === loginName) || (scope.row.username==='admin' && scope.row.id===1) || scope.row.buildIn === 1"
              inactive-value="0"
              @change="()=>{statusChange(scope.row)}">
          </el-switch>
        </template>
        <span v-else>{{scope.row[item.prop]}}</span>
      </template>
    </el-table-column>
    <template v-slot:empty >
      <div class="table-no-data" v-if="isNoData">
        <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
      </div>
    </template>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { put } from '@/utils/http'
import { storageKey } from '@/utils/constants'

export default {
  name: 'userTable',
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  mixins: [table],
  data () {
    return {
      loginName: localStorage.getItem(storageKey.username),
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 100,
          sortable: 'custom'
        }, {
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.user.username'),
          prop: 'username',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.roles'),
          prop: 'roles',
          show: true,
          width: 150
        }, {
          label: 'E-mail',
          prop: 'email',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('config.user.lastLoginTime'),
          prop: 'lastLoginTime',
          show: true,
          width: 200
        }, {
          label: this.$t('config.user.lastLoginIp'),
          prop: 'lastLoginIp',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.source'),
          prop: 'source',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.enable'),
          prop: 'status',
          show: true,
          width: 100
        }
      ]
    }
  },
  methods: {
    statusChange (user) {
      if (user.roles) {
        user.roleIds = user.roles.map(t => t.id).join(',')
      }
      // if (!user.id){
      //   return
      // }
      put('sys/user', user).then(response => {
        if (response.code === 200) {
          // this.rightBox.show = false
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.$emit('reload')
      })
    },
    // 禁止勾选buildIn为1的项，即禁止修改、删除admin的账号
    checkSelectable (row) {
      return row.buildIn !== 1
    }
  }
}
</script>
