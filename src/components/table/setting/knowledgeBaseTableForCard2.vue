<template>
  <template v-if="!isNoData">
    <div class="card-type-title" style="margin-top:4px;"  v-if="websketchList.length > 0">{{$t('knowledgeBase.websketchIntegration')}}</div>
    <el-checkbox-group v-model="checkList" >
      <div class="card-box" v-for="data in websketchList" :key="data.knowledgeId">
        <div @click="isSelectedStatus && data.isBuiltIn !== 1 && clickCard(data,$event)"  @mouseenter="mouseenter(data)" @mouseleave="mouseleave(data)" class="card-item"  :class="data.isSelected ? 'card-selected' : ''">
        <div class="card-content">
          <div class="card-icon">
            <img :src="data.iconUrl"/>
          </div>
          <div class="card-title">
            <div class="card-title-name" :title="$t(data.label)">{{$t(data.label)}}</div>
          </div>
          <div class="card-desc" :title="data.desc ? $t(data.desc) : '—'">{{data.desc ? $t(data.desc) : '—'}}</div>
        </div>
        <div class="card-operate__footer">
          <button v-if="data.showUpdate && hasPermission('editBuiltInKnowledgeBase')" :title="$t('overall.update')" class="top-tool-btn--update"
                  @click="jumpToUpdatePage(data,false)">
            <i class="cn-icon-update-knowledge-base cn-icon"></i>
            <span>{{$t('overall.update')}}</span>
          </button>
        </div>
      </div>
      </div>
    </el-checkbox-group>
  </template>

  <div class="table-no-data" v-else>
    <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
  </div>

  <div class="center-dialog">
    <el-dialog v-model="showUpdateDialog"
               :destroy-on-close="true"
               :custom-class="showAddUpdateDialog ? 'update-knowledge update-knowledge--upload' : 'update-knowledge'"
               :before-close="beforeClose"
               :after-close="handleClose">
      <div class="knowledge-update__top" >
        <div class="update-left__icon">
          <img width="60" height="60" :src="updateKnowledge.iconUrl"/>
        </div>
        <div class="update-right">
          <div class="knowledge-enable">
            <div class="update-title">
              <div class="card-title-name" :title="$t(updateKnowledge.label)">{{$t(updateKnowledge.label)}}</div>
            </div>
            <el-switch v-model="updateKnowledge.status"
                       active-color="#38ACD2"
                       inactive-color="#C0CEDB"
                       :active-value="1"
                       :inactive-value="0"
                       :before-change="(knowledgeId) => confirmSwitchLearning(updateKnowledge.knowledgeId)"
                       v-if="updateKnowledge.source === 'cn_psiphon3_ip' && hasPermission('editBuiltInKnowledgeBase')"
            >
            </el-switch>
          </div>
          <div class="knowledge-desc" :title="updateKnowledge.desc ? $t(updateKnowledge.desc) : '-'">{{updateKnowledge.desc ? $t(updateKnowledge.desc) : '-'}}</div>
        </div>
      </div>
      <template v-if="!showAddUpdateDialog">
        <div class="knowledge-update__tab" v-if="showEnable">
          <el-tabs  v-model="activeTab"
                   class="update-log-tab"
                   @tab-click="handleClick"
          >
            <el-tab-pane  :label="$t('knowledgeBase.updateRecord')"
                          name="updateRecord"
                          key="updateRecord"
                          ref="knowledgeUpdateRecordTab">
            </el-tab-pane>
            <el-tab-pane  :label="$t('knowledgeBase.learningEngineLogs')"
                          name="intelligenceLearning"
                          key="intelligenceLearning"
                          ref="knowledgeIntelligenceLearningTab">
            </el-tab-pane>
          </el-tabs>
          <div class="update-operate">
            <button :title="$t('overall.update')" class="top-tool-btn--update"
                    @click="uploadRecord"><!--:disabled="hasUpdatingRecord"-->
              <i class="cn-icon-update-knowledge-base cn-icon"></i>
              <span>{{$t('overall.update')}}</span>
            </button>
          </div>
        </div>
        <div class="knowledge-update" v-else>
          <div class="update-title" >
            <div class="card-title-name">{{$t('knowledgeBase.updateRecord')}}</div>
          </div>
          <div class="update-operate">
            <button :title="$t('overall.update')" class="top-tool-btn--update"
                    @click="uploadRecord"><!--   :disabled="hasUpdatingRecord" -->
              <i class="cn-icon-update-knowledge-base cn-icon"></i>
              <span>{{$t('overall.update')}}</span>
            </button>
          </div>
        </div>
        <div :style="{height: updateKnowledge.source === 'cn_psiphon3_ip' && activeTab === 'intelligenceLearning' ? 'calc(90vh - 190px - 200px - 50px - 42px)' : 'calc(100% - 242px)',  marginTop: '42px', position: 'absolute', width: 'calc(100% - 60px)'}">
          <loading :loading="updateLogLoading"></loading>
        </div>
        <el-table ref="updateDataTable"
                  border
                  :data="updateHistoryList"
                  @selection-change="secondSelectionChange"
                  width="100%"
                  class="update-dialog__table"
                  :class="{
                    'update-dialog__table--psiphon3': updateKnowledge.source === 'cn_psiphon3_ip' && activeTab === 'intelligenceLearning',
                    'update-dialog__table--system-user': updateKnowledge.source === 'cn_psiphon3_ip' && activeTab !== 'intelligenceLearning'
                  }"
                  :header-cell-style="{background:'#f5f7fa',color:'#353636',fontWeight: '400',fontSize: '12px',borderRight: 'none',borderBottom: 'none'}"
                  cell-style="padding:6px 0px;font-size: 12px;color: #353636;font-weight: 400;line-height: 20px;border-right:none;"
                  header-cell-style="padding:8px 0px;font-size: 12px;color: #353636;font-weight: 500;border-right:none;">
          <el-table-column prop="opTime" :label="$t('entities.tab.informationAggregation.updateTime')" width="150" >
            <template #default="scope" :column="item">
              <span>{{scope.row.opTime ? dateFormatByAppearance(scope.row.opTime) : '-'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="user" :label="$t('knowledgeBase.operator')" width="150" v-if="updateKnowledge.source !== 'cn_psiphon3_ip' || activeTab === 'updateRecord'">
            <template #default="scope" :column="item">
              <span>{{$_.get(scope.row, 'user.name', '-')}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="commitVersion" :label="$t('overall.version')" width="150"  ></el-table-column>
          <el-table-column prop="description" :label="$t('overall.remark')"></el-table-column>
          <template v-slot:empty >
            <div class="table-no-data" v-if="updateHistoryList.length === 0 && !updateLogLoading">
              <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
            </div>
            <div v-else></div>
          </template>
        </el-table>

        <div class="psiphon3" v-if="updateKnowledge.source === 'cn_psiphon3_ip' && activeTab === 'intelligenceLearning'">
          <div class="psiphon3-title">{{$t('knowledgeBase.psiphon3IpCount')}}</div>
          <div class="psiphon3-bar">
            <chart-error v-if="showErrorForPsiphon3" :content="errorMsgForPsiphon3"/>
            <div class="bar-header" v-else>
              <div class="bar-header-left">
                <div class="bar-value-active" ></div>
                <div class="bar-value">
                  <template v-for="item in tabs" :key="item.name">
                    <div class="bar-value-tabs"
                         :class=" {'is-active': tabType === item.class, 'mousemove-cursor': mousemoveCursor === item.class}"
                         @mouseenter="mouseenterTab(item)"
                         @mouseleave="mouseleaveTab(item)"
                         @click="activeChange(item)"
                    >
                      <div class="bar-value-tabs-name">
                        <div :class="item.class"></div>
                        <div class="tabs-name" >{{ $t(item.name) }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <div class="bar-select bar-header-right">
                <div class="bar-select-time">
                  <div class="bar-select__operation">
                    <el-select
                            size="mini"
                            v-model="selectTime"
                            placeholder=" "
                            popper-class="common-select"
                            :popper-append-to-body="false"
                            @change="timeChange"
                    >
                      <template #prefix>
                        <div class="calendar-popover-text"><i class="cn-icon cn-icon-Data"></i></div>
                      </template>
                      <el-option v-for="item in dateRangeArr" :key="item.value" :label="item.name" :value="item.value"></el-option>
                    </el-select>
                  </div>
                </div>
              </div>
            </div>
            <div style="height: calc(100% - 24px); position: relative">
              <chart-no-data v-if="isNoDataForPsiphon3 && !showErrorForPsiphon3 && !psiphon3Loading"></chart-no-data>
              <loading :loading="psiphon3Loading"></loading>
              <div class="chart-drawing" v-show="!isNoDataForPsiphon3 && !showErrorForPsiphon3" id="psiphonBarChart"></div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="showAddUpdateDialog">
        <div class="update-knowledge-form">
          <loading :loading="uploadLoading"></loading>
          <el-form :model="updateObject" label-position="top" ref="form" :rules="rules">
            <!--name-->
            <el-form-item :label="$t('overall.name')" prop="name">
              <el-input class="form-input" maxlength="64" placeholder="" disabled show-word-limit
                        size="mini" type="text" v-model="updateObject.label"></el-input>
            </el-form-item>
            <el-form-item :label="$t('knowledge.upload')" prop="file">
              <el-upload :action="`${baseUrl}${apiVersion}/knowledgeBase/items/batch`"
                         :headers="uploadHeaders"
                         :multiple="false"
                         :file-list="fileList"
                         :data="uploadParams"
                         :on-change="fileChange"
                         :on-success="uploadSuccess"
                         :before-upload="beforeUpload"
                         :on-error="uploadError"
                         :class="uploadErrorTip ? 'el-upload--error' : ''"
                         :accept="fileTypeLimit"
                         :auto-upload="false"
                         ref="knowledgeUpload"
                         id="knowledgeUpload"
              >
                <el-button type="primary" class="uploadBtn"><i class="cn-icon cn-icon-a-1"></i></el-button>
              </el-upload>
            </el-form-item>

            <el-form-item :label="$t('knowledge.version')" prop="version">
              <el-input class="form-input" maxlength="64" placeholder="" disabled show-word-limit
                        size="mini" type="text" v-model="currentVersion"></el-input>
            </el-form-item>
            <el-form-item :label="$t('overall.remark')" prop="description" class="knowledge-remark">
              <el-input  maxlength="255" show-word-limit :rows="4" size='mini' type="textarea" resize='none'
                         v-model="updateObject.description" id="role-box-input-remark"/>
            </el-form-item>
          </el-form>
        </div>
        <div class="dialog-footer">
          <el-button @click="cancle">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="submitConfirm">{{ $t('tip.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="showConfirmDialog"
               :title="$t('overall.tips')"
               custom-class="update-knowledge-tip"
               :width="480"
               :before-close="handleConfirmClose">
      <div class="dialog-message">{{$t('knowledge.updateTips')}}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmDialog = false">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="submit">{{ $t('tip.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import table from '@/mixins/table'
import Loading from '@/components/common/Loading'
import { getSecond, getMillisecond, xAxisTimeFormatter, xAxisTimeRich } from '@/utils/date-util'
import { knowledgeCategoryValue, unitTypes, storageKey, builtInKnowledgeBaseBasicInfo, knowledgeCardUpdateRecordType } from '@/utils/constants'
import { ref, shallowRef } from 'vue'
import { api } from '@/utils/api'
import { detectionTooltipFormatter } from '@/views/charts/charts/tools'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import axios from 'axios'
import _ from 'lodash'
import * as echarts from 'echarts'
import unitConvert from '@/utils/unit-convert'

export default {
  name: 'knowledgeBaseTableForCard',
  mixins: [table],
  props: {
    isNoData: {
      type: Boolean,
      default: false
    },
    isSelectedStatus: {
      type: Boolean
    }
  },
  components: {
    Loading,
    ChartNoData
  },
  data () {
    return {
      tableTitle: [],
      checkList: [],
      websketchList: [],
      showUpdateDialog: false,
      showConfirmDialog: false,
      showAddUpdateDialog: false,
      updateKnowledge: {},
      showEnable: false,
      updateHistoryList: [],
      updateObject: {},
      currentVersion: 0,
      uploadLoading: false,
      psiphon3Loading: false,
      updateLogLoading: false,
      showConfirmSwitch: false,
      // timer: null,
      switchKnowledgeId: '',
      activeTab: 'updateRecord',
      isNoDataForPsiphon3: false,
      showErrorForPsiphon3: false,
      errorMsgForPsiphon3: '',
      leftOffset: 0,
      tabType: 'total',
      mousemoveCursor: '',
      selectTime: 1440,
      // hasUpdatingRecord: false,
      tabs: [
        {
          name: 'knowledgeBase.total',
          class: 'total',
          color: '#00A7AB',
          data: []
        },
        {
          name: 'knowledgeBase.active',
          class: 'active',
          color: '#7FA054',
          data: []
        },
        {
          name: 'knowledgeBase.new',
          class: 'new',
          color: '#98709B',
          data: []
        }
      ],
      dateRangeArr: [
        { value: 1440, name: this.$t('dateTime.last1Day') },
        { value: 2880, name: this.$t('dateTime.last2Days') },
        { value: 10080, name: this.$t('dateTime.last7Days') },
        { value: 21600, name: this.$t('dateTime.last15Days') },
        { value: 43200, name: this.$t('dateTime.last30Days') }
      ]
    }
  },
  setup () {
    // 没上传过文件的提示
    const uploadErrorTip = ref('')
    return {
      baseUrl: BASE_CONFIG.baseUrl,
      apiVersion: BASE_CONFIG.apiVersion,
      uploadHeaders: {
        'Cn-Authorization': localStorage.getItem(storageKey.token)
      },
      uploadErrorTip,
      fileTypeLimit: '.csv',
      fileList: ref([]),
      uploadFileSizeLimit: 1024 * 1024 * 1024,
      myChart: shallowRef(null),
      chartOption: shallowRef(null)
    }
  },
  methods: {
    echartsInit (echartsData) {
      const _this = this
      const curTab = this.tabs.find(item => item.class === _this.tabType)
      this.chartOption = {
        color: curTab.color,
        legend: {
          show: false
        },
        tooltip: {
          show: true,
          formatter: (params) => {
            params.seriesName = this.$t(params.seriesName)
            params.borderColor = params.color
            return detectionTooltipFormatter(params)
          }
        },
        grid: {
          top: '12%',
          left: '2%',
          right: '2%',
          bottom: 24,
          containLabel: true
        },
        xAxis: {
          type: 'time',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            formatter: xAxisTimeFormatter,
            rich: xAxisTimeRich
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: '#ECECEC'
            }
          },
          axisLabel: {
            margin: 20
          },
          minInterval: 1
        },
        series: [
          {
            name: curTab.name,
            data: echartsData,
            type: 'bar',
            barWidth: 26
          }
        ]
      }

      this.$nextTick(() => {
        if (!this.myChart) {
          this.myChart = echarts.init(document.getElementById('psiphonBarChart'))
        }
        this.myChart.setOption(this.chartOption)
      })
    },
    init () {
      this.psiphon3Loading = true
      const endTime = window.$dayJs.tz().valueOf()
      const params = {
        startTime: getSecond(endTime - this.selectTime * 60 * 1000),
        endTime: getSecond(endTime)
      }
      const url = api.knowledgeBaseTimedistribution.replace('{{knowledgeId}}', this.updateKnowledge.knowledgeId).replace('{{type}}', this.tabType)
      axios.get(url, { params: params }).then(response => {
        const res = response.data

        if (response.status === 200) {
          this.isNoDataForPsiphon3 = res.data.result.length === 0
          this.showErrorForPsiphon3 = false
          if (!this.isNoDataForPsiphon3) {
            const chartsData = res.data.result.map(item => {
              return [getMillisecond(item.statTime), item.count]
            })
            if (this.activeTab === knowledgeCardUpdateRecordType.intelligenceLearning) {
              this.echartsInit(chartsData)
            }
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.psiphon3Loading = false
      })
    },
    httpError (e) {
      this.isNoDataForPsiphon3 = false
      this.showErrorForPsiphon3 = true
      this.errorMsgForPsiphon3 = this.errorMsgHandler(e)
    },
    handleActiveBar () {
      if (document.querySelector('.psiphon3-bar .bar-value-tabs.is-active')) {
        const {
          offsetLeft,
          clientWidth,
          clientLeft
        } = document.querySelector('.psiphon3-bar .bar-value-tabs.is-active')
        const activeBar = document.querySelector('.psiphon3-bar .bar-value-active')
        activeBar.style.cssText += `width: ${clientWidth}px; left: ${offsetLeft + this.leftOffset + clientLeft}px;`
      }
    },
    resize () {
      if (this.myChart) {
        this.myChart.resize()
      }
    },
    dispatchSelectAction (type, name) {
      this.myChart && this.myChart.dispatchAction({
        type: type,
        name: name
      })
    },
    legendSelectChange (item) {
      this.dispatchSelectAction('legendSelect', item.name)
      this.tabs.forEach((t) => {
        if (t.name !== item.name) {
          this.dispatchSelectAction('legendUnSelect', t.name)
        }
      })
    },
    timeChange () {
      if (this.updateKnowledge.source === 'cn_psiphon3_ip') {
        this.init()
      }
      if (this.activeTab === knowledgeCardUpdateRecordType.intelligenceLearning) {
        this.$nextTick(() => {
          this.handleActiveBar()
        })
      }
    },
    activeChange (item) { // isClick:代表是通过点击操作来的
      if (item) {
        this.tabType = item.class
      }
      this.legendSelectChange(item)
      if (this.updateKnowledge.source === 'cn_psiphon3_ip') {
        this.init()
      }
    },
    mouseenterTab (item) {
      if (this.isNoDataForPsiphon3) return
      this.mousemoveCursor = item.class
      if (this.activeTab === knowledgeCardUpdateRecordType.intelligenceLearning) {
        this.$nextTick(() => {
          this.handleActiveBar()
        })
      }
    },
    mouseleaveTab () {
      this.mousemoveCursor = ''
    },
    fileChange (file, fileList) {
      // 判断后缀，仅支持.csv
      if (!_.endsWith(file.name, '.csv')) {
        this.fileList = []
        this.$message.error(this.$t('validate.fileTypeLimit', { types: this.fileTypeLimit }))
      } else if (file.size > this.uploadFileSizeLimit) { // 判断文件大小
        this.$message.error(this.$t('validate.fileSizeLimit', { size: unitConvert(this.uploadFileSizeLimit, unitTypes.byte).join('') }))
        this.fileList = []
      } else {
        this.fileList = fileList.slice(-1)
      }
    },
    uploadError (error) {
      let errorMsg
      if (error.message) {
        errorMsg = JSON.parse(error.message).message
      } else {
        errorMsg = 'error'
      }
      this.uploadLoading = false
      this.$message.error(this.$t('tip.uploadFailed', { msg: errorMsg }))
    },
    uploadSuccess (response) {
      this.uploadLoading = false
      this.uploaded = true
      this.$message.success(this.$t('tip.success'))
      this.showAddUpdateDialog = false
      this.getCurTabData()
    },
    beforeUpload (file) {
      this.uploadLoading = true
      this.showConfirmDialog = false
    },
    submitConfirm () {
      this.showConfirmDialog = true
    },
    submit () {
      this.$refs.knowledgeUpload.submit()
    },
    cancle () {
      this.showAddUpdateDialog = false
    },
    clickCard (data, event) {
      if (data.isSelected) { // 原来为选中，当前点击后未选中
        const index = this.checkList.indexOf(data)
        if (index > -1) {
          this.checkList.splice(index, 1)
        }
      } else {
        const index = this.checkList.indexOf(data)
        if (index === -1) {
          this.checkList.push(data)
        }
      }
      const val = !data.isSelected
      data.isSelected = val
      this.$emit('checkboxStatusChange', val, data)
    },
    checkboxStatusChange (val, data) {
      data.isSelected = val
      this.$emit('checkboxStatusChange', val, data)
    },
    beforeClose (done) {
      if (this.myChart) {
        this.myChart.dispose()
        this.myChart = null
      }
      done()
    },
    handleClose () {
      this.showUpdateDialog = false
      this.showAddUpdateDialog = false
      this.uploadLoading = false
    },
    handleConfirmClose () {
      this.showConfirmDialog = false
    },
    handleUpdateClose () {
      this.showAddUpdateDialog = false
    },
    showUpdate () {
      this.showUpdateDialog = true
      this.showAddUpdateDialog = false
    },
    async jumpToUpdatePage (data, showEnable) {
      this.updateKnowledge = data
      this.showEnable = showEnable
      await this.getCurTabData()
      if (data.source === 'cn_psiphon3_ip') {
        await this.init()
      }
      this.showUpdate()
      if (this.activeTab === knowledgeCardUpdateRecordType.intelligenceLearning) {
        this.$nextTick(() => {
          this.handleActiveBar()
        })
      }
    },
    uploadRecord () {
      this.showAddUpdateDialog = true
      this.updateObject.name = this.updateKnowledge.name
      this.updateObject.label = this.updateKnowledge.label
      this.updateObject.description = ''
    },
    getCurTabData () { // showEnable:true 为psiphon3的知识库，false为其它知识库
      let params = {
        pageSize: -1
      }
      if (this.showEnable) {
        if (this.activeTab === knowledgeCardUpdateRecordType.updateRecord) {
          params = {
            ...params,
            opUser: -1
          }
        } else if (this.activeTab === knowledgeCardUpdateRecordType.intelligenceLearning) {
          params = {
            ...params,
            opUser: 0
          }
        }
      }
      this.updateLogLoading = true
      this.updateHistoryList = []
      axios.get(api.knowledgeBaseLog + '/' + this.updateKnowledge.knowledgeId, { params: params }).then(res => {
        this.updateHistoryList = res.data.data.list
        if (this.updateHistoryList[0]) {
          this.currentVersion = this.updateHistoryList[0].commitVersion + 1
        }
        /*
        this.hasUpdatingRecord = false
        this.updateHistoryList.forEach(item => {
          if (item.isUpdating) { // if(item.isUpdating){//????????
            this.hasUpdatingRecord = true
          }
        })

 */
      }).catch(e => {
        console.error(e)
      }).finally(() => {
        this.updateLogLoading = false
      })
    },
    // 切换tab
    handleClick (tab) {
      this.getCurTabData()
      if (tab.index === '1') {
        this.timeChange()
      }
    },
    clearSelect () {
      this.$nextTick(() => {
        this.checkList = []
        if (this.tableData && this.tableData.length > 0) {
          this.tableData.forEach(data => {
            data.isSelected = false
          })
        }
      })
    },
    mouseenter (card) {
      card.showUpdate = true
    },
    mouseleave (card) {
      card.showUpdate = false
    },
    del (data) {
      this.$emit('delete', data)
    },
    edit (id) {
      const pageNo = this.$router.currentRoute.value.query.pageNo
      const dataType = this.$router.currentRoute.value.query.dataType
      this.$router.push({
        path: '/knowledgeBase/edit',
        query: {
          t: +new Date(),
          pageNoForTable: pageNo || 1,
          id: id,
          dataType: dataType
        }
      })
    },
    confirmSwitchLearning (id) {
      this.showConfirmSwitch = true
      this.switchKnowledgeId = id
      return false
    },
    cancleSwitch () {
      this.showConfirmSwitch = false
    },
    switchLearning () {
      const hint = this.aiTaggingList.find(d => d.knowledgeId === this.switchKnowledgeId)
      const toStatus = hint.status === 0 ? 1 : 0
      const url = toStatus === 0 ? api.knowledgeBaseLearningStop : api.knowledgeBaseLearningStart
      axios.post(`${url}?knowledgeId=${hint.knowledgeId}`).then(res => {
        if (res.status === 200) {
          hint.status = toStatus
          this.$message.success(this.$t('tip.success'))
        } else {
          console.error(res.message)
          this.$message.error(this.errorMsgHandler(res))
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
      }).finally(() => {
        this.showConfirmSwitch = false
      })
    }
  },
  watch: {
    tabType (n) {
      this.timeChange()
    },
    /*
    hasUpdatingRecord (n) {
      if (n) { // update record页存在“正在更新”的记录时，每20秒自动请求一次接口
        this.timer = setTimeout(() => {
          this.getCurTabData()
        }, 20000)
      } else { // 直到出现新的记录,出现新记录后（失败或者成功）,取消定时请求接口，右上角"update"按钮恢复可用。"正在更新"和"失败”都会有对应的强调样式。
        clearTimeout(this.timer)
      }
    },
    */
    tableData: {
      handler (n) {
        if (this.tableData && this.tableData.length > 0) {
          this.websketchList = []
          this.tableData.forEach(item => {
            item.showUpdate = false
            const basicInfo = builtInKnowledgeBaseBasicInfo.find(bi => bi.knowledgeId === item.knowledgeId)
            if (basicInfo) {
              item = {
                ...item,
                ...basicInfo
              }
              if (item.category === knowledgeCategoryValue.webSketch) {
                this.websketchList.push(item)
              }
            }
          })
        }
      }
    },
    activeTab (n) {
      if (n === 'updateRecord') {
        if (this.myChart) {
          this.myChart.dispose()
          this.myChart = null
        }
      }
    },
    showAddUpdateDialog: {
      handler (n) {
        if (!n) {
          this.fileList = []
          this.timeChange()
        } else {
          if (this.myChart) {
            this.myChart.dispose()
            this.myChart = null
          }
        }
      }
    }
  },
  mounted () {
    this.myChart = null
    this.chartOption = null
    window.addEventListener('resize', this.resize)

    this.websketchList = []
    this.tableData.forEach(item => {
      item.showUpdate = false
      if (item.category === knowledgeCategoryValue.webSketch) {
        this.websketchList.push(item)
      }
    })
  },
  beforeUnmount () {
    // clearTimeout(this.timer)
    window.removeEventListener('resize', this.resize)
    const dom = document.getElementById('psiphonBarChart')
    if (dom) {
      let myChart = echarts.getInstanceByDom(document.getElementById('psiphonBarChart'))
      if (myChart) {
        echarts.dispose(myChart)
      }
      myChart = null
    }

    if (this.myChart) {
      echarts.dispose(this.myChart)
    }
  },
  computed: {
    uploadParams () {
      return {
        knowledgeId: this.updateKnowledge.knowledgeId,
        action: 'overwrite',
        description: this.updateObject.description
      }
    }
  }
}
</script>
