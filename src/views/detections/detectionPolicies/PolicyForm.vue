<template>
  <div class="detection-form">
    <loading :loading="myLoading"></loading>

    <div class="detection-form-header">
      {{ ruleId ? $t('detection.editEventPolicies') : $t('detection.createEventPolicies') }}
    </div>

    <!--第一步：General Settings-->
    <div class="detection-form-content">
      <div class="detection-form-collapse">
        <el-collapse v-model="activeNames">
          <el-collapse-item name="1">
            <template #title>
              <div class="form-collapse-header">
                <div :class="activeNames[0]==='1' ? 'form-collapse-header-no-active' : 'form-collapse-header-no'">1</div>
                <div class="form-collapse-header-title">{{ $t('detection.create.generalSettings') }}</div>
              </div>
            </template>
            <div class="form-collapse-content">
              <general-settings ref="form" :editObj="editObj" :isComplete="isComplete" @setSettingForm="getFormSetting" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!--第二步：Rule Definition-->
      <div class="detection-form-collapse">
        <el-collapse v-model="activeNames" style="position: relative;">
          <el-collapse-item name="2">
            <template #title>
              <div class="form-collapse-header">
                <div :class="activeNames[0]==='2' ? 'form-collapse-header-no-active' : 'form-collapse-header-no'">2</div>
                <div class="form-collapse-header-title">{{ $t('detection.create.ruleDefinition') }}</div>
              </div>
            </template>
            <div class="form-collapse-content">
              <rule-definition :settingObj="settingObj" :editObj="editObj" :isComplete="isComplete" @setRuleObj="getRuleObj" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!--第三步：Trigger-->
      <div class="detection-form-collapse">
        <el-collapse v-model="activeNames">
          <el-collapse-item name="3">
            <template #title>
              <div class="form-collapse-header">
                <div :class="activeNames[0]==='3' ? 'form-collapse-header-no-active' : 'form-collapse-header-no'">3</div>
                <div class="form-collapse-header-title">{{ $t('detection.create.trigger') }}</div>
              </div>
            </template>

            <div class="form-collapse-content margin-t-18">
              <el-form class="trigger-block margin-b-20" ref="form3" :model="triggerObj" :rules="rules">
                <div class="trigger-block-item margin-b-10">
                  <div>At least</div>
                  <el-form-item prop="atLeast">
                    <el-input size="mini" v-model="triggerObj.atLeast" oninput="value=value.replace(/[^\d]/g,'')"></el-input>
                  </el-form-item>
                  <div>times within</div>

                  <el-form-item prop="interval">
                    <el-input size="mini" v-model="triggerObj.interval" oninput="value=value.replace(/[^\d]/g,'')"></el-input>
                  </el-form-item>

                  <el-form-item prop="intervalVal">
                    <el-select v-model="triggerObj.intervalVal" class="form-trigger__select" placeholder=" " size="mini">
                      <el-option
                          v-for="item in intervalList"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </div>

                <div class="trigger-block-item">
                  <div>With the counter resetting after no activity for</div>
                  <el-form-item prop="resetInterval">
                    <el-input size="mini" v-model="triggerObj.resetInterval" oninput="value=value.replace(/[^\d]/g,'')"></el-input>
                  </el-form-item>
                  <el-form-item prop="resetIntervalVal">
                    <el-select v-model="triggerObj.resetIntervalVal" class="form-trigger__select" placeholder=" " size="mini">
                      <el-option
                          v-for="item in intervalList"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </div>
              </el-form>

              <div class="form-setting__btn1">
                <div class="btn1">
                  <el-button @click="createPolicy('')">{{ $t('overall.save') }}</el-button>
                </div>
                <el-button @click="createPolicy('enabled')">{{ $t('overall.save') }} & {{ $t('detection.create.enablePolicy') }}</el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import GeneralSettings from '@/components/table/detection/GeneralSettings'
import RuleDefinition from '@/components/table/detection/RuleDefinition'
import { api } from '@/utils/api'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { detectionUnitList } from '@/utils/static-data'
import { ref } from 'vue'
import { getDurationsTimeByType, getTimeByDurations } from '@/utils/date-util'
import Loading from '@/components/common/Loading'

export default {
  name: 'DetectionForm',
  data () {
    return {
      activeNames: ['1'],
      rules: {
        atLeast: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          }
        ],
        interval: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          }
        ],
        intervalVal: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        resetInterval: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          }
        ],
        resetIntervalVal: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ]
      },
      intervalList: detectionUnitList.intervalList || [],
      editObj: {},
      isComplete: true // 参数完整标识，默认完整（照顾编辑模式），false即不完整
    }
  },
  components: {
    GeneralSettings,
    RuleDefinition,
    Loading
  },
  mounted () {
    this.getDetailInfo()
  },
  setup () {
    const { query } = useRoute()
    const ruleId = ref(query.id || '')
    const pageNoForTable = ref(query.pageNoForTable || 1)
    const myLoading = ref(!!ruleId.value)
    // General Settings，即第一步的form表单信息
    const settingObj = ref({})
    // 第二步的form表单信息
    const ruleObj = ref({})
    // 第三步的form表单信息
    const triggerObj = ref({
      atLeast: '',
      interval: '',
      intervalVal: '',
      resetInterval: '',
      resetIntervalVal: '',
      finishFlag: false
    })

    return {
      ruleId,
      myLoading,
      pageNoForTable,
      settingObj,
      ruleObj,
      triggerObj
    }
  },
  methods: {
    /** 编辑时获取详情 */
    getDetailInfo () {
      if (this.ruleId) {
        axios.get(`${api.detection.detail}/${this.ruleId}`).then(response => {
          if (response.status === 200) {
            if (!response.data.data) {
              throw new Error('No data found, id: ' + this.ruleId)
            }
            this.myLoading = false
            this.editObj = { ...response.data.data, ruleId: this.ruleId }
            this.settingObj = this.$_.cloneDeep(this.editObj)
            this.settingObj.editFlag = false
            this.settingObj.saveFlag = true
            this.ruleObj = this.$_.cloneDeep(this.editObj.ruleConfigObj)
            this.triggerObj = this.$_.cloneDeep(this.editObj.ruleTriggerObj)
            this.triggerObj.intervalVal = getTimeByDurations(this.triggerObj.interval).type
            this.triggerObj.interval = getTimeByDurations(this.triggerObj.interval).value
            this.triggerObj.resetIntervalVal = getTimeByDurations(this.triggerObj.resetInterval).type
            this.triggerObj.resetInterval = getTimeByDurations(this.triggerObj.resetInterval).value
            this.activeNames = ['1', '2', '3']
          } else {
            console.error(response.data)
          }
        }).catch(e => {
          console.error(e)
          this.$message.error(this.errorMsgHandler(e))
          this.$router.push({
            path: '/detectionPolicy',
            query: {
              pageNo: this.pageNoForTable ? Number(this.pageNoForTable) : 1,
              t: +new Date()
            }
          })
        })
      }
    },
    /** 获取General Settings折叠板form数据 */
    getFormSetting (data) {
      this.handleActiveNames('1', this.activeNames, data.settingNoContinue)
      this.settingObj = JSON.parse(JSON.stringify(data))
    },
    /** 获取Rule Definition折叠板form数据 */
    getRuleObj (data) {
      this.handleActiveNames('2', this.activeNames, data.ruleNoContinue)
      this.ruleObj = JSON.parse(JSON.stringify(data))
    },
    /** 自动展开收起折叠板 */
    handleActiveNames (name, arr, flag) {
      if (!flag) {
        const list = arr
        list.splice(list.indexOf(name), 1)
        if (name === '1' && list.indexOf('2') < 0) {
          list.push('2')
        }
        if (name === '2' && list.indexOf('3') < 0) {
          list.push('3')
        }
        this.activeNames = []
        list.forEach(t => {
          this.activeNames.push(t)
        })
      }
    },
    /** 创建policy */
    createPolicy (flag) {
      const settingLen = Object.keys(this.settingObj).length
      const ruleLen = Object.keys(this.ruleObj).length

      if (settingLen > 0 && ruleLen > 0) {
        this.$refs.form3.validate(valid => {
          if (valid) {
            // 最终提交form
            const formObj = this.$_.cloneDeep({ ...this.settingObj, ruleConfig: JSON.stringify(this.ruleObj), ruleTrigger: this.triggerObj })
            if (flag) {
              formObj.status = 1
            }
            // 将时间转为参数所需，如5分钟转为PT5M
            formObj.ruleTrigger.resetInterval = getDurationsTimeByType(formObj.ruleTrigger.resetInterval, formObj.ruleTrigger.resetIntervalVal)
            formObj.ruleTrigger.interval = getDurationsTimeByType(formObj.ruleTrigger.interval, formObj.ruleTrigger.intervalVal)
            formObj.ruleTrigger.atLeast = parseInt(formObj.ruleTrigger.atLeast)
            formObj.ruleTrigger = JSON.stringify(formObj.ruleTrigger)
            // 删除多余参数
            delete formObj.ruleConfigObj
            delete formObj.ruleTriggerObj
            delete formObj.editFlag
            delete formObj.saveFlag

            if (!this.ruleId) {
              // post调用是新增，put是编辑
              this.myLoading = true
              axios.post(api.detection.create.create, formObj).then(response => {
                if (response.status === 200) {
                  this.$message({
                    duration: 2000,
                    type: 'success',
                    message: this.$t('tip.saveSuccess')
                  })

                  this.$router.push({
                    path: '/detectionPolicy',
                    query: {
                      t: +new Date()
                    }
                  })
                } else {
                  console.error(response.data.message)
                  this.$message.error(this.errorMsgHandler(response))
                }
              }).catch(e => {
                console.error(e)
                this.$message.error(this.errorMsgHandler(e))
              }).finally(() => {
                this.myLoading = false
              })
            } else {
              this.myLoading = true
              axios.put(api.detection.create.create, formObj).then(response => {
                if (response.status === 200) {
                  this.$message({
                    duration: 2000,
                    type: 'success',
                    message: this.$t('tip.saveSuccess')
                  })

                  this.$router.push({
                    path: '/detectionPolicy',
                    query: {
                      pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
                      t: +new Date()
                    }
                  })
                } else {
                  console.error(response.data.message)
                  this.$message.error(this.errorMsgHandler(response))
                }
              }).catch(e => {
                console.error(e)
                this.$message.error(this.errorMsgHandler(e))
              }).finally(() => {
                this.myLoading = false
              })
            }
          } else {
            this.isComplete = false
          }
        })
      } else if (settingLen === 0) {
        this.isComplete = false
        this.handleFormError('1')
      } else if (ruleLen === 0) {
        this.isComplete = false
        this.handleFormError('2')
      }
    },
    handleFormError (name) {
      const list = this.activeNames
      if (list.indexOf(name) < 0) {
        list.push(name)
        this.activeNames = []
        list.forEach(t => {
          this.activeNames.push(t)
        })
      }
      this.$message.error(this.$t('detection.create.informationFilled'))
    }
  }
}
</script>
