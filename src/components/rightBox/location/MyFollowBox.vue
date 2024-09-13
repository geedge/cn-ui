<template>
  <div class="right-box">
    <div class="right-box__header">
      <div class="header__title">{{ $t('location.myFollow')}}</div>
      <div class="header__operation">
        <span @click="esc"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <cn-data-list
            ref="dataList"
            :tableId="tableId"
            v-model:custom-table-title="tools.customTableTitle"
            :api="url"
    >
      <template #top-tool-left>
        <button id="cancelFollows" class="business-button business-button--light margin-r-10"
                :disabled="disableCancel" @click="cancelFollowBatch">
          <span>{{ $t('location.cancelFollow') }}</span>
        </button>
      </template>
      <template #default>
        <loading :loading="loading"></loading>
        <my-follow-table
                ref="dataTable"
                :api="url"
                :isNoData="isNoData"
                :custom-table-title="tools.customTableTitle"
                :table-data="tableData"
                @reload="getTableData"
                @selectionChange="selectionChange"
                @handleFollow="handleFollow"
        />
      </template>
      <template #pagination>
        <pagination ref="pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></pagination>
      </template>
    </cn-data-list>
  </div>
</template>

<script>
import axios from 'axios'
import { api } from '@/utils/api'
import cnDataList from '@/components/table/CnDataList'
import myFollowTable from '@/components/table/location/MyFollowTable'
import dataListMixin from '@/mixins/data-list'

export default {
  name: 'MyFollowBox',
  mixins: [dataListMixin],
  props: {
    timeFilter: {
      type: Object
    },
    level: {
      type: Number
    }
  },
  components: {
    cnDataList,
    myFollowTable
  },
  data () {
    return {
      url:  api.location.followedSubscriber,
      tableId: 'myFollowTable',
      disableCancel: true
    }
  },
  mounted () {
  },
  methods: {
    handleFollow(item) {
      this.$emit('handleFollow', item)
    },
    getTableData () {
      this.searchLabel = {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        level: this.level,
        ...this.pageObj
      }
      this.isNoData = false
      this.toggleLoading(true)
      delete this.searchLabel.total

      axios.get(this.url, { params: this.searchLabel }).then(response => {
        if (response.status === 200) {
          for (let i = 0; i < response.data.data.list.length; i++) {
            response.data.data.list[i].isFollowed = 1
          }
          this.tableData = response.data.data.list
          this.pageObj.total = response.data.data.total
        } else {
          console.error(response.data)
          this.isNoData = true
          if (response.data.message) {
            this.$message.error(response.data.message)
          } else {
            this.$message.error(this.$t('tip.somethingWentWrong'))
          }
        }
      }).finally(() => {
        this.toggleLoading(false)
        this.isNoData = !this.tableData || this.tableData.length === 0
      })
    },
    selectionChange (objs) {
      this.batchDeleteObjs = []
      objs.forEach(obj => {
        const delObj = this.batchDeleteObjs.find(item => item.subscriberId === obj.subscriberId)
        if (delObj === undefined) {// && obj.isFollowed === 1
          this.batchDeleteObjs.push(obj)
        }
      })
      this.disableCancel = this.batchDeleteObjs.length < 1
    },
    cancelFollowBatch() {
      const ids = []
      if (this.batchDeleteObjs && this.batchDeleteObjs.length > 0) {
        this.batchDeleteObjs.forEach(item => {
          ids.push(item.subscriberId)
        })
      }
      this.toggleLoading(true)
      axios.delete(api.location.follow + '?subscriberIds=' + ids.join(',')).then(response => {
        if (response.status === 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('location.cancelFollow.success') })
          this.batchDeleteObjs.forEach(item => {
            item.isFollowed = 0
          })
        } else {
          this.$message.error(response.data.message)
        }
      }).catch(e => {
        this.$message.error(e.response.data.message)
      }).finally(() => {
        this.toggleLoading(false)
        this.$emit('handleCancelFollowBatch', this.batchDeleteObjs)
      })
    },
    /* 关闭弹框 */
    esc () {
      this.$emit('close')
    }
  }
}
</script>
