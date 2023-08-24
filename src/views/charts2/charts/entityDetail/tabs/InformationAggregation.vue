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
import { entityDetailTabsName, entityDetailTags, psiphon3IpType } from '@/utils/constants'
import { dateFormatByAppearance } from '@/utils/date-util'
import chartNoData from '@/views/charts/charts/ChartNoData'

export default {
  name: 'InformationAggregation',
  data () {
    return {
      informationAggregationList: [],
      loading: true
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
    tagValueHandler (k, k2, value) {
      if (k === 'psiphon3Ip') {
        if (k2 === 'type') {
          const find = psiphon3IpType.find(t => t.value === value)
          if (find) {
            return find.name
          }
        }
      }
      return value
    },
    getData () {
      this.loading = true
      this.showError = false
      this.toggleLoading(true)
      this.informationAggregationList = []
      axios.get(`${api.entity.informationAggregation}/${this.entity.entityType}?resource=${this.entity.entityName}&pageSize=100&pageNo=1`).then(response => {
        const res = response.data
        if (response.status === 200) {
          // this.isNoData = res.data.result.length === 0
          this.showError = false
          if (res.data.result.length > 0) {
            res.data.result.forEach(r => {
              Object.keys(r).forEach(k => {
                const aggregation = {
                  createTime: r[k].createTime,
                  updateTime: r[k].updateTime,
                  status: r[k].isValid,
                  intelligenceContent: []
                }
                if (k === 'userDefinedTag') {
                  aggregation.intelligenceContent.push({ key: k, value: r[k].tagValue, type: 'normal' })
                } else {
                  Object.keys(r[k]).forEach(k2 => {
                    const find = entityDetailTags[this.entity.entityType].find(t => t.name === k2)
                    if (find) {
                      aggregation.intelligenceContent.push({ key: k2, value: this.tagValueHandler(k, k2, r[k][k2]), type: find.type })
                    }
                  })
                }
                if (aggregation.intelligenceContent.length > 0) {
                  this.informationAggregationList.push(aggregation)
                }
              })
            })
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
