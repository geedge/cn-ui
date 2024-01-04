<template>
  <div>
    <!--初步方案：error提示替换table。后续若改为table内error提示，记得在此修改-->
    <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
    <chart-no-data v-if="isNoData && !showError" test-id="no-data"></chart-no-data>
    <div v-if="!isNoData && !showError && !loading" class="information-aggregation__table">
      <el-table
          style="width: 100%"
          tooltip-effect="light"
          border
          id="informationAggregationTable"
          ref="informationAggregationTable"
          :data="informationAggregationList"
          :cell-class-name="intelligenceContentClass"
      >
        <el-table-column
            key="createTime"
            width="250px"
            :label="$t('entities.tab.informationAggregation.discoveryTime')"
            prop="createTime"
        >
          <template #default="scope">
            {{dateFormatByAppearance(scope.row.createTime)}}
          </template>
        </el-table-column>
        <el-table-column
            key="updateTime"
            width="250px"
            :label="$t('entities.tab.informationAggregation.updateTime')"
            prop="updateTime"
        >
          <template #default="scope">
            {{dateFormatByAppearance(scope.row.updateTime)}}
          </template>
        </el-table-column>
        <el-table-column
            key="intelligenceContent"
            :label="$t('entities.tab.informationAggregation.intelligenceContent')"
            prop="intelligenceContent"
        >
          <template #default="scope">
              <div class="information-aggregation-tags">
                <div  v-for="ic in scope.row.intelligenceContent" :key="ic.key"
                      class="entity-tag entity-tag--small margin-r-6" :test-id="`entity-tag${scope.$index}`" :class="`entity-tag--level-two-${ic.type}`">
                  {{ic.value}}
                </div>
              </div>
          </template>
        </el-table-column>
        <el-table-column
            key="status"
            width="150px"
            :label="$t('entities.tab.informationAggregation.status')"
            prop="status"
        >
          <template #default="scope">
            <div v-if="scope.row.status === 1" :test-id="`entity-status${scope.$index}`" class="information-aggregation__valid">
              {{ $t("entity.detail.valid") }}
            </div>
            <div v-else-if="scope.row.status === 0" :test-id="`entity-status${scope.$index}`" class="information-aggregation__invalid">
              {{ $t("entity.detail.invalid") }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import axios from 'axios'
import { api } from '@/utils/api'
import { entityDetailTabsName } from '@/utils/constants'
import { dateFormatByAppearance, getNowTime } from '@/utils/date-util'
import chartNoData from '@/views/charts/charts/ChartNoData'
import { ref } from 'vue'
import { formatTagsOfDetails } from '@/utils/tools'

export default {
  name: 'InformationAggregation',
  data () {
    return {
      informationAggregationList: [],
      loading: true
    }
  },
  setup (props) {
    // range取 config.js 中配置的值
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.informationAggregation
    const timeFilter = ref({ dateRangeValue })
    const { startTime, endTime } = getNowTime(dateRangeValue)
    timeFilter.value.startTime = startTime
    timeFilter.value.endTime = endTime

    return {
      timeFilter
    }
  },
  mixins: [chartMixin],
  components: { chartNoData },
  methods: {
    dateFormatByAppearance,
    intelligenceContentClass ({ columnIndex }) {
      if (columnIndex === 2) {
        return 'padding-0'
      }
    },
    getData () {
      this.loading = true
      this.showError = false
      this.toggleLoading(true)
      this.informationAggregationList = []
      const params = this.getParams()
      let timeStr = ''
      if (params.startTime && params.endTime) {
        timeStr = '&startTime=' + params.startTime + '&endTime=' + params.endTime
      }
      axios.get(`${api.entity.informationAggregation}/${this.entity.entityType}?resource=${this.entity.entityName}&pageSize=100&pageNo=1${timeStr}`).then(response => {
        const res = response.data
        if (response.status === 200) {
          // this.isNoData = res.data.result.length === 0
          this.showError = false
          if (res.data.result.length > 0) {
            formatTagsOfDetails(res.data.result, this.entity.entityType, this.informationAggregationList)
            this.$emit('checkTag', entityDetailTabsName.informationAggregation, this.informationAggregationList.length)
          } else {
            this.$emit('checkTag', entityDetailTabsName.informationAggregation, 0)
          }
        } else {
          this.showError = true
          this.errorMsg = this.errorMsgHandler(res)
          this.$emit('checkTag', entityDetailTabsName.informationAggregation, 0)
        }
      }).catch(e => {
        console.error(e)
        this.showError = true
        this.errorMsg = this.errorMsgHandler(e)
        this.$emit('checkTag', entityDetailTabsName.informationAggregation, 0)
      }).finally(() => {
        if (this.informationAggregationList.length > 0) {
          this.isNoData = false
        } else {
          this.isNoData = true
        }
        this.loading = false
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.getData()
  }
}
</script>
