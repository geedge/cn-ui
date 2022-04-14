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
        <template v-if="item.prop === 'roles'">
          <template v-if="scope.row[item.prop]">
            {{scope.row[item.prop].map(t=>t.name).join(',')}}
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
                  :disabled="(scope.row.username === loginName) || (scope.row.username==='admin' && scope.row.id==1) "
                  inactive-value="0"
                  @change="()=>{statusChange(scope.row)}">
          </el-switch>
        </template>
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
          <button class="table-operation-item" @click="tableOperation(['edit', scope.row])"><i class="cn-icon cn-icon-edit"></i></button>
          <el-dropdown size="medium" trigger="hover" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more">
              <i class="cn-icon cn-icon-more-arrow-down"></i>
            </div>
            <template #dropdown>
              <el-dropdown-menu >
                <el-dropdown-item :command="['delete', scope.row]" :disabled="scope.row.id === 1"><i class="cn-icon cn-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/mixins/table'
import { put } from '@/utils/http'
import { storageKey } from '@/utils/constants'

export default {
  name: 'userTable',
  mixins: [table],
  data () {
    return {
      loginName: localStorage.getItem(storageKey.username),
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
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
    }
  }
}
</script>
