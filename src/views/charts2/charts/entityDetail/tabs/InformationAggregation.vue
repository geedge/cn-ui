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
            key="discoveryTime"
            width="150px"
            :label="$t('entities.tab.informationAggregation.discoveryTime')"
            prop="discoveryTime"
        ></el-table-column>
        <el-table-column
            key="updateTime"
            width="150px"
            :label="$t('entities.tab.informationAggregation.updateTime')"
            prop="updateTime"
        ></el-table-column>
        <el-table-column
            key="intelligenceContent"
            :label="$t('entities.tab.informationAggregation.intelligenceContent')"
            prop="intelligenceContent"
        >
          <template #default="scope">
            <div class="intelligence-content">
              <div class="information-aggregation-tags">
                <template v-for="ic in scope.row.intelligenceContent" >
                  <template v-if="ic.type === 0" >
                    <div v-if="ic.threatLevel === -1" class="entity-tag entity-tag--small entity-tag--level-one-negative margin-r-6">
                      {{ic.value}}
                    </div>
                    <div v-else-if="ic.threatLevel === 0" class="entity-tag entity-tag--small entity-tag--level-one-normal margin-r-6">
                      {{ic.value}}
                    </div>
                    <div v-else-if="ic.threatLevel === 1" class="entity-tag entity-tag--small entity-tag--level-one-positive margin-r-6">
                      {{ic.value}}
                    </div>
                  </template>
                </template>
              </div>
              <div class="information-aggregation-tags">
                <div v-for="ic in scope.row.intelligenceContent" >
                  <div v-if="ic.type === 1">
                    <div v-if="ic.threatLevel === -1" class="entity-tag entity-tag--small entity-tag--level-two-negative margin-r-6">
                      {{ic.value}}
                    </div>
                    <div v-else-if="ic.threatLevel === 0" class="entity-tag entity-tag--small entity-tag--level-two-normal margin-r-6">
                      {{ic.value}}
                    </div>
                    <div v-else-if="ic.threatLevel === 1" class="entity-tag entity-tag--small entity-tag--level-two-positive margin-r-6">
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
              有效
            </div>
            <div v-else-if="scope.row.status === 0" class="information-aggregation__invalid">
              无效
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'InformationAggregation',
  data () {
    return {
      informationAggregationList: [],
      errorMsg: '',
      showError: false
    }
  },
  mixins: [chartMixin],
  methods: {
    intelligenceContentClass ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 2) {
        return 'padding-0'
      }
    }
  },
  mounted () {
    this.toggleLoading(true)
    // 模拟loading，后续添加post请求时记得删除
    const timer = setTimeout(() => {
      this.toggleLoading(false)
      clearTimeout(timer)
    }, 150)
    this.informationAggregationList = [
      {
        discoveryTime: '2022-04-12',
        updateTime: '2022-04-13',
        intelligenceContent: [
          {
            type: 0,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '安全'
          },
          {
            type: 0,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '工具'
          },
          {
            type: 1,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '信息技术'
          },
          {
            type: 1,
            threatLevel: 0, // 红色：-1；灰色：0；绿色：1；
            value: '互联网'
          }
        ],
        status: 1// 1有效；0无效；
      },
      {
        discoveryTime: '2022-04-11',
        updateTime: '2022-04-14',
        intelligenceContent: [
          {
            type: 0,
            threatLevel: -1, // 红色：-1；灰色：0；绿色：1；
            value: '恶意软件'
          },
          {
            type: 0,
            threatLevel: -1, // 红色：-1；灰色：0；绿色：1；
            value: '垃圾软件'
          },
          {
            type: 1,
            threatLevel: -1, // 红色：-1；灰色：0；绿色：1；
            value: '病毒软件'
          },
          {
            type: 1,
            threatLevel: -1, // 红色：-1；灰色：0；绿色：1；
            value: '病毒软件'
          },
          {
            type: 1,
            threatLevel: 0, // 红色：-1；灰色：0；绿色：1；
            value: '互联网'
          }
        ],
        status: 1// 1有效；0无效；
      },
      {
        discoveryTime: '2022-04-12',
        updateTime: '2022-04-12',
        intelligenceContent: [
          {
            type: 0,
            threatLevel: -1, // 红色：-1；灰色：0；绿色：1；
            value: '恶意软件'
          },
          {
            type: 1,
            threatLevel: -1, // 红色：-1；灰色：0；绿色：1；
            value: '病毒软件'
          },
          {
            type: 1,
            threatLevel: 0, // 红色：-1；灰色：0；绿色：1；
            value: '互联网'
          }
        ],
        status: 0// 1有效；0无效；
      },
      {
        discoveryTime: '2022-04-12',
        updateTime: '2022-04-12',
        intelligenceContent: [
          {
            type: 0,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '安全'
          },
          {
            type: 0,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '工具'
          },
          {
            type: 1,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '信息技术'
          },
          {
            type: 1,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '信息技术'
          },
          {
            type: 1,
            threatLevel: 0, // 红色：-1；灰色：0；绿色：1；
            value: '互联网'
          }
        ],
        status: 1// 1有效；0无效；
      },
      {
        discoveryTime: '2022-04-12',
        updateTime: '2022-04-12',
        intelligenceContent: [
          {
            type: 0,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '安全'
          },
          {
            type: 0,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '工具'
          },
          {
            type: 1,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '信息技术'
          },
          {
            type: 1,
            threatLevel: 1, // 红色：-1；灰色：0；绿色：1；
            value: '信息技术'
          },
          {
            type: 1,
            threatLevel: 0, // 红色：-1；灰色：0；绿色：1；
            value: '互联网'
          }
        ],
        status: 0// 1有效；0无效；
      }
    ]
  }
}
</script>
