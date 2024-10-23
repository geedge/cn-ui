<template>
  <el-table
    id="myFollowTable"
    ref="dataTable"
    :data="tableData"
    tooltip-effect="light"
    empty-text=" "
    @selection-change="selectionChange"
  >
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      :selectable="(row) => { return row.isFollowed === 1 }"
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
        <template v-if="item.prop === 'active'">
          <template v-if="scope.row[item.prop] === 1">
            {{$t('location.active')}}
          </template>
          <template v-else>
            <span>{{$t('location.inactive')}}</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'ctime'">
          <template v-if="scope.row[item.prop]">
            {{dateFormatByAppearance(scope.row[item.prop]) || '-'}}
          </template>
          <template v-else>
            <span>-</span>
          </template>
        </template>
        <template v-else-if="item.prop === 'subscriberDto.phoneNumber'">
          {{scope.row.subscriberDto ? scope.row.subscriberDto.phoneNumber : '-'}}
        </template>
        <template v-else-if="item.prop === 'isFollowed'" >
          <span class="follow-cursor" v-if="scope.row[item.prop] === 1" @click="cancelFollow(scope.row)"><i class="cn-icon cn-icon-follow-fill"></i></span>
          <span class="follow-cursor" v-else @click="follow(scope.row)"><i class="cn-icon cn-icon-follow"></i></span>
        </template>
        <span v-else>{{scope.row[item.prop] || '-'}}</span>
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
import axios from 'axios'
import { api } from '@/utils/api'

export default {
  name: 'myFollowTable',
  props: {
    isNoData: {
      type: Boolean,
      default: false
    }
  },
  mixins: [table],
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'subscriberId',
          show: true,
          minWidth: 100
        }, {
          label: 'MSISDN',
          prop: 'subscriberDto.phoneNumber',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('overall.status'),
          prop: 'active',
          show: true,
          minWidth: 80
        }, {
          label: this.$t('location.followTime'),
          prop: 'ctime',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('overall.option'),
          prop: 'isFollowed',
          show: true,
          minWidth: 100
        }
      ]
    }
  },
  methods: {
    cancelFollow(item) {
      axios.delete(api.location.follow + '?subscriberIds=' + item.subscriberId).then(res => {
        if (res.status === 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('location.cancelFollow.success') })
          /* 刷新列表 */
          item.isFollowed = 0
          this.$refs.dataTable.toggleRowSelection(item, false)
          this.$emit('handleFollow', item)
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(e => {
        this.$message.error(this.errorMsgHandler(e))
      })

    },
    follow(item) {
      axios.post(api.location.follow, { subscriberIds: item.subscriberId }).then(async res => {
        if (res.status === 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('location.follow.success') })
          /* 刷新列表 */
          item.isFollowed = 1
          this.$emit('handleFollow', item)
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(e => {
        this.$message.error(this.errorMsgHandler(e))
      })
    }
  }
}
</script>
