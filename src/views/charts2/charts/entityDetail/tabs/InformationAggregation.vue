<template>
  <div>
    <!--初步方案：error提示替换table。后续若改为table内error提示，记得在此修改-->
    <chart-error v-if="showError" :content="errorMsg" class="entity-detail-event-error"></chart-error>
    <chart-no-data v-if="isNoData && !showError"></chart-no-data>

    <div v-if="!isNoData && !showError" class="information-aggregation__table">
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
            <div class="intelligence-content">
<!--              <div class="information-aggregation-tags">
                <template v-for="ic in scope.row.intelligenceContent" >
                  <template v-if="ic.type === 0" >
                    <div v-if="ic.threatLevel === -1" class="entity-tag entity-tag&#45;&#45;small entity-tag&#45;&#45;level-one-negative margin-r-6">
                      {{ic.value}}
                    </div>
                    <div v-else-if="ic.threatLevel === 0" class="entity-tag entity-tag&#45;&#45;small entity-tag&#45;&#45;level-one-normal margin-r-6">
                      {{ic.value}}
                    </div>
                    <div v-else-if="ic.threatLevel === 1" class="entity-tag entity-tag&#45;&#45;small entity-tag&#45;&#45;level-one-positive margin-r-6">
                      {{ic.value}}
                    </div>
                  </template>
                </template>
              </div>-->
              <div class="information-aggregation-tags">
                <div v-for="ic in scope.row.intelligenceContent" :key="ic.key">
                  <div>
                    <div class="entity-tag entity-tag--small margin-r-6" :class="`entity-tag--level-two-${ic.type}`">
                      {{ic.value}}
                    </div>
                  </div>
                </div>
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
            <div v-if="scope.row.status === 1" class="information-aggregation__valid">
              {{ $t("entity.detail.valid") }}
            </div>
            <div v-else-if="scope.row.status === 0" class="information-aggregation__invalid">
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
import { entityDetailTags } from '@/utils/constants'
import { dateFormatByAppearance } from '@/utils/date-util'
import chartNoData from '@/views/charts/charts/ChartNoData'

export default {
  name: 'InformationAggregation',
  data () {
    return {
      informationAggregationList: []
    }
  },
  mixins: [chartMixin],
  components: { chartNoData },
  methods: {
    dateFormatByAppearance,
    intelligenceContentClass ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 2) {
        return 'padding-0'
      }
    },
    getData () {
      this.toggleLoading(true)
      this.informationAggregationList = []
      axios.get(`${api.entity.informationAggregation}/${this.entity.entityType}?resource=${this.entity.entityName}&pageSize=100&pageNo=1`).then(response => {
        const res = response.data
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.showError = false
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
                    aggregation.intelligenceContent.push({ key: k2, value: r[k][k2], type: find.type })
                  }
                })
              }
              if (aggregation.intelligenceContent.length > 0) {
                this.informationAggregationList.push(aggregation)
              }
            })
          })
        } else {
          this.showError = true
          this.isNoData = false
          this.errorMsg = this.errorMsgHandler(res)
        }
      }).catch(e => {
        console.error(e)
        this.showError = true
        this.isNoData = false
        this.errorMsg = this.errorMsgHandler(e)
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.getData()
  }
}
</script>
