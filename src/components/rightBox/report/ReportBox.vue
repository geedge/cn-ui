<template>
  <div class="right-box right-box-report">
    <div class="right-box__header">
      <div class="header__title">{{editObject.id ? $t('report.editReport') : $t('report.createReport')}}</div>
      <div class="header__operation">
        <span v-cancel="{object: editObject, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="reportForm" :model="editObject" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('report.name')" prop="name">
            <el-input id="account-input-name" v-model="editObject.name" maxlength="64" placeholder=" " show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--time limit-->
          <el-form-item :label="$t('report.timeLimit')" prop="timeLimit">
            <el-select id="account-input-roleIds"
                       v-model="editObject.config.timeConfig.type"
                       class="right-box__select"
                       collapse-tags
                       placeholder=" "
                       popper-class="right-box-select-dropdown right-box-select-report "
                       size="small"
                       @change="timeConfigTypeChange"
            >
              <template v-for="time in timeRuleList" :key="time.value">
                <el-option :label="time.name" :value="time.value"></el-option>
              </template>
            </el-select>
            <template v-if="editObject.config.timeConfig.type === 'this'">
              <el-select id="reportBoxTimeUnitSelect"
                         v-model="editObject.config.timeConfig.unit"
                         class="right-box__select"
                         collapse-tags
                         placeholder=" "
                         popper-class="right-box-select-dropdown right-box-select-report "
                         size="small"
                         @change="()=>{ this.$forceUpdate() }">
                <template v-for="time in timeUnitList" :key="time.value">
                  <el-option :label="time.name" :value="time.value"></el-option>
                </template>
              </el-select>
            </template>
            <div v-else-if="editObject.config.timeConfig.type === 'last' || editObject.config.timeConfig.type === 'previous'" style="display: flex;">
              <el-input v-model.number="editObject.config.timeConfig.offset" size="small" class="el-input-single" placeholder=" ">
                <template #prepend><i @click="timeOffsetHandle('m')" class="cn-icon cn-icon-a-"></i></template>
                <template #append><i @click="timeOffsetHandle('p')" class="cn-icon cn-icon-a-1"></i></template>
              </el-input>
              <el-select id="reportBoxTimeUnitSelect"
                         v-model="editObject.config.timeConfig.unit"
                         class="right-box__select right-box__select-single"
                         collapse-tags
                         placeholder=" "
                         popper-class="right-box-select-dropdown  el-select-last"
                         size="small"
                         @change="()=>{ this.$forceUpdate() }">
                <template v-for="time in timeUnitList" :key="time.value">
                  <el-option :label="time.name" :value="time.value"></el-option>
                </template>
              </el-select>
            </div>
          </el-form-item>
          <!--startTime-->
          <el-form-item :label="$t('report.dataStartTime')" prop="config.startTime" v-if="editObject.config.timeConfig.type === 'customize'">
            <div class="demo-datetime-picker">
              <div class="block">
                <el-date-picker
                    style="width: 100%"
                    v-model="editObject.config.startTime"
                    size="small"
                    :format="dateFormat"
                    :disabled-date="startDisabledDate"
                    @change="startTimeChang"
                    prefix-icon="cn-icon cn-icon-shijian"
                    type="datetime"
                    placeholder=" "
                />
              </div>
            </div>
          </el-form-item>
          <!--endTime-->
          <el-form-item :label="$t('report.dataEndTime')" prop="config.endTime" v-if="editObject.config.timeConfig.type === 'customize'">
            <div class="demo-datetime-picker">
              <div class="block">
                <el-date-picker
                    style="width: 100%"
                    v-model="editObject.config.endTime"
                    size="small"
                    :format="dateFormat"
                    :disabled-date="endDisabledDate"
                    @change="endTimeChange"
                    prefix-icon="cn-icon cn-icon-shijian"
                    type="datetime"
                    placeholder=" "
                />
              </div>
            </div>
          </el-form-item >
          <el-form-item class="el-height">
            <el-checkbox v-model="scheduleChecked" :disabled="editObject.config.timeConfig.type === 'customize'" :label="$t('report.enableTimeSchedule')" size="large" />
          </el-form-item>
          <!--Enable time schedule-->
          <el-form-item prop="enableTimeSchedule" v-if="scheduleChecked">
            <div class="enable-tab">
              <div class="enable-tabs" @click="scheduleTypeChange(type.value)" v-for="type in scheduleTypeList" :key="type.value" :class="{'active': scheduleType === type.value}">{{$t(type.name)}}</div>
            </div>
            <div class="enable-tabs-daily" v-if="scheduleType === scheduleTypeList[0].value">
              <div class="enable-tabs-custom">{{$t('report.customEvery')}}</div>
              <el-input v-model.number="editObject.config.schedulerConfig.interval" size="small" placeholder=" " style="margin-top: 0.3125rem;">
                <template #append>{{$t('report.day')}}</template>
              </el-input>
            </div>
            <div class="enable-tabs-weekly" v-else-if="scheduleType === scheduleTypeList[1].value">
              <!-- 每隔几周暂时隐藏 -->
              <!-- <div class="enable-tabs-custom">{{$t('report.customEvery')}}</div>
              <el-input v-model="editObject.config.schedulerConfig.interval" size="small" placeholder="Please input">
                <template #append>{{$t('report.week')}}</template>
              </el-input>-->
              <el-checkbox-group v-model="editObject.config.schedulerConfig.weekDates" style="margin-top: 0.3125rem">
                <el-checkbox v-for="(item, index) in weekdayList" :key="index" :label="item.value">{{$t(item.name)}}</el-checkbox>
              </el-checkbox-group>
            </div>
            <!-- 月 -->
            <div class="enable-tabs-per-month" v-else-if="scheduleType === scheduleTypeList[2].value">
              <div class="enable-month-tab">
                <div class="enable-month-tabs" @click="monthScheduleType = 'daily'" :class="{'active': monthScheduleType === 'daily'}">{{$t('report.date')}}</div>
                <div class="enable-month-tabs" @click="monthScheduleType = 'weekly'" :class="{'active': monthScheduleType === 'weekly'}">{{$t('report.week')}}</div>
                <el-checkbox v-model="monthIsCycle" :label="$t('report.cycle')" size="large"/>
              </div>
              <div class="enable-month-data-tab">
                <!-- 自定义月，循环 -->
                <template v-if="monthIsCycle">
                  <div class="enable-tabs-custom">{{$t('report.customEvery')}}</div>
                  <el-input v-model="editObject.config.schedulerConfig.interval" size="small" placeholder=" " style="margin-top: 0.3125rem;">
                    <template #append>{{$t('report.month')}}</template>
                  </el-input>
                </template>
                <!-- 自定义月，非循环 -->
                <template v-else>
                  <div class="enable-month-moon-custom">{{$t('report.custom')}}</div>
                  <div class="enable-month-all">
                    <el-checkbox v-model="monthCheckedAll" class="enable-month-all-months" :indeterminate="monthIsIndeterminate" @change="monthCheckAllChange" :label="$t('report.allMonths')"/>
                    <el-checkbox-group v-model="editObject.config.schedulerConfig.months" @change="monthCheckChange">
                      <el-checkbox v-for="(item, index) in monthList" :key="index" :label="item.value">{{$t(item.name)}}</el-checkbox>
                    </el-checkbox-group>
                  </div>
                </template>
                <!-- 按日期 -->
                <template v-if="monthScheduleType === 'daily'">
                  <div class="enable-month-data-tabs">
                    <el-checkbox v-model="dateCheckedAll" :indeterminate="dateIsIndeterminate" @change="dateCheckAllChange" :label="$t('report.all')" size="large"/>
                    <el-checkbox-group v-model="editObject.config.schedulerConfig.monthDates" @change="dateCheckChange">
                      <el-checkbox v-for="item in dateList" :key="item" :label="item"/>
                    </el-checkbox-group>
                  </div>
                  <div class="enable-month-value">*一月，三月，五月，七月，八月，十月和12月含31天;闰年二月含29天*</div>
                </template>
                <!-- 按周 -->
                <template v-else-if="monthScheduleType === 'weekly'">
                  <el-select id="account-input-roleIds"
                             v-model="editObject.config.schedulerConfig.monthWeekDates"
                             class="right-box__select"
                             multiple
                             placeholder=" "
                             popper-class="right-box-select-dropdown right-box-select-report"
                             size="small"
                             @change="()=>{ this.$forceUpdate() }">
                    <template v-for="time in weekOptions" :key="time.value">
                      <el-option :label="$t(time.name)" :value="time.value"></el-option>
                    </template>
                  </el-select>
                  <div class="enable-month-week">
                    <el-checkbox v-model="monthWeekdayCheckedAll" class="enable-month-week-all" :label="$t('report.all')" :indeterminate="monthWeekdayIsIndeterminate" @change="monthWeekdayCheckAllChange" size="large"/>
                    <el-checkbox-group v-model="editObject.config.schedulerConfig.weekDates" @change="monthWeekdayCheckChange">
                      <el-checkbox v-for="(item, index) in weekdayList" :key="index" :label="item.value">{{$t(item.name)}}</el-checkbox>
                    </el-checkbox-group>
                  </div>
                </template>
              </div>
            </div>
          </el-form-item>
          <!--生效时间-->
          <el-form-item :label="$t('report.effectiveTime')" prop="schedulerStart" v-if="scheduleChecked">
            <div class="demo-datetime-picker">
              <div class="block">
                <el-date-picker
                    style="width: 100%"
                    v-model="editObject.schedulerStart"
                    size="small"
                    :format="dateFormat"
                    prefix-icon="cn-icon cn-icon-shijian"
                    type="datetime"
                    placeholder=" "
                />
              </div>
            </div>
          </el-form-item>
          <!--失效时间-->
          <el-form-item :label="$t('report.expiryTime')" prop="schedulerEnd" v-if="scheduleChecked">
            <div class="demo-datetime-picker">
              <div class="block">
                <el-date-picker
                    style="width: 100%"
                    v-model="editObject.schedulerEnd"
                    size="small"
                    :format="dateFormat"
                    prefix-icon="cn-icon cn-icon-shijian"
                    type="datetime"
                    placeholder=" "
                />
              </div>
            </div>
          </el-form-item>
          <!--categoryType-->
          <el-form-item :label="$t('report.categoryType')" prop="categoryId">
            <el-select id="account-input-roleIds"
                       v-model="editObject.categoryId"
                       class="right-box__select"
                       collapse-tags
                       placeholder=" "
                       :disabled="!!editObject.id"
                       popper-class="right-box-select-dropdown right-box-select-report"
                       size="small"
            >
              <template v-for="category in categoryList" :key="category.id">
                <el-option :label="category.name" :value="category.id"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!-- 参数 -->
          <el-form-item :label="$t('config.operationlog.params')" prop="categoryParams" v-if="editObject.categoryParams && editObject.categoryParams.length > 0">
<!--            <el-input v-model="param.value" placeholder=" " v-for="(param, index) in editObject.categoryParams" :key="index" size="small" style="vertical-align: unset;" :disabled="!!editObject.id">
              <template #prepend>{{param.key}}</template>
            </el-input>-->
            <el-select v-model="param.value"
                       v-for="(param, index) in editObject.categoryParams"
                       :key="index"
                       class="right-box__select right-box__select--param"
                       placeholder=" "
                       filterable
                       :disabled="!!editObject.id"
                       popper-class="right-box-select-dropdown right-box-select-report "
                       size="small"
            >
              <template #prefix>
                {{$t(param.i18n)}}
              </template>
              <template v-for="paramOption in paramsOptions">
                <template v-if="paramOption.key === param.key">
                    <el-option :key="p" :value="p" v-for="p in paramOption.options"></el-option>
                  </template>
                </template>

            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{object: editObject, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': blockOperation.save}" :disabled="blockOperation.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import rightBoxMixin from '@/mixins/right-box'
import { storageKey, report } from '@/utils/constants'
import { api } from '@/utils/api'
import _ from 'lodash'
import { get, post, put } from '@/utils/http'
import { dateFormat, getMillisecond } from '@/utils/date-util'
import { ref, getCurrentInstance } from 'vue'
import i18n from '@/i18n'
export default {
  name: 'ReportBox',
  mixins: [rightBoxMixin],
  props: {
    categoryList: Array,
    currentCategoryId: Number
  },
  setup () {
    const { proxy } = getCurrentInstance()

    const startTime = ref('')
    const endTime = ref('')
    function endTimeChange (val) {
      endTime.value = val
    }
    function startTimeChang (val) {
      startTime.value = val
    }
    const endDisabledDate = (time) => {
      if (time.getTime() > new Date()) {
        return true
      }
      if (startTime.value !== '' && startTime.value > time) {
        return true
      }
    }
    const startDisabledDate = (time) => {
      if (time.getTime() > new Date()) {
        return true
      }
      if (endTime.value !== '' && endTime.value < time) {
        return true
      }
    }

    const paramValidator = (rule, value, callback) => {
      let validate = true
      if (value && value.length > 0) {
        const hasEmpty = value.some(v => {
          return !v.value && v.value !== 0
        })
        validate = !hasEmpty
      }
      return validate
    }
    const nameValidator = (rule, value, callback) => {
      let validate = true
      const reg = /^[\u4e00-\u9fa5A-Za-z0-9\-\_]*$/
      validate = reg.test(value)
      return validate
    }
    const startTimeValidator = (rule, value, callback) => {
      const form = proxy.$refs.reportForm
      if (form.model.config.endTime) {
        form.validateField('config.endTime', () => null)
      }
      callback()
    }
    const endTimeValidator = (rule, value, callback) => {
      let validate = true
      if (startTime.value !== '' && value <= startTime.value) {
        validate = false
      }
      return validate
    }
    const rules = { // 表单校验规则
      name: [
        { required: true, message: i18n.global.t('validate.required'), trigger: 'blur' },
        { validator: nameValidator, message: i18n.global.t('validate.onlyAllowNumberLetterChinese-_'), trigger: 'blur' }
      ],
      categoryId: [
        { required: true, message: i18n.global.t('validate.required'), trigger: 'change' }
      ],
      schedulerStart: [
        { required: true, message: i18n.global.t('validate.required'), trigger: 'change' }
      ],
      'config.startTime': [
        { required: true, message: i18n.global.t('validate.required'), trigger: 'change' },
        { validator: startTimeValidator, trigger: 'change' }
      ],
      'config.endTime': [
        { required: true, message: i18n.global.t('validate.required'), trigger: 'change' },
        { validator: endTimeValidator, message: i18n.global.t('validate.endTimeGreaterThanStart'), trigger: 'change' }
      ],
      categoryParams: [
        { required: true, message: i18n.global.t('validate.required'), trigger: 'blur' },
        { validator: paramValidator, message: i18n.global.t('validate.required'), trigger: 'blur' }
      ]
    }
    return {
      endDisabledDate,
      startDisabledDate,
      startTimeChang,
      endTimeChange,
      rules
    }
  },
  data () {
    return {
      url: api.reportTemp,

      storageKey,
      timeRuleList: report.timeRuleList,
      timeUnitList: report.timeUnitList,
      scheduleTypeList: report.scheduleTypeList,
      weekdayList: report.weekdayList,
      monthList: report.monthList,
      weekOptions: report.weekOptions,
      dateList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],

      dateFormat: localStorage.getItem(storageKey.dateFormat),

      scheduleChecked: false,
      scheduleType: '',
      monthScheduleType: 'daily', // daily  weekly

      monthIsCycle: true,
      dateCheckedAll: false,
      dateIsIndeterminate: false,
      monthCheckedAll: false,
      monthIsIndeterminate: false,
      monthWeekdayCheckedAll: false,
      monthWeekdayIsIndeterminate: false,

      paramsOptions: []
    }
  },
  watch: {
    scheduleType (n, o) {
      this.editObject.config.schedulerConfig.type = n
      this.cleanScheduleConfig()
    },
    scheduleChecked (n) {
      this.editObject.config.isScheduler = n ? 1 : 0
      this.cleanScheduleConfig()
    },
    monthScheduleType (n) {
      this.cleanScheduleConfig()
    },
    monthIsCycle (n) {
      if (!this.editObject.id) {
        if (n) {
          this.editObject.config.schedulerConfig.months = []
          this.monthCheckedAll = false
          this.monthIsIndeterminate = false
        } else {
          this.editObject.config.schedulerConfig.interval = 1
        }
      }
    },
    'editObject.config.schedulerConfig.interval': {
      handler (n) {
        if (!_.isNumber(n)) {
          if (n) {
            if (!_.isNumber(parseInt(n)) || _.isNaN(parseInt(n))) {
              this.editObject.config.schedulerConfig.interval = 1
            } else {
              this.editObject.config.schedulerConfig.interval = parseInt(n)
            }
          }
        }
      }
    },
    'editObject.config.timeConfig.offset': {
      handler (n) {
        if (!_.isNumber(n)) {
          if (n) {
            if (!_.isNumber(parseInt(n)) || _.isNaN(parseInt(n))) {
              this.editObject.config.timeConfig.offset = 1
            } else {
              this.editObject.config.timeConfig.offset = parseInt(n)
            }
          } else {
            this.editObject.config.timeConfig.offset = 1
          }
        }
      }
    },
    'editObject.categoryId': {
      handler (n) {
        const category = this.categoryList.find(c => c.id === n)
        if (category && category.config && category.config.queryParam) {
          this.editObject.categoryParams = []
          this.$nextTick(() => {
            this.editObject.categoryParams = category.config.queryParam
            if (!this.editObject.id) {
              this.editObject.categoryParams.forEach(t => { t.value = '' })
            }
            this.loadParamOptions()
          })
        } else {
          this.editObject.categoryParams = []
        }
      }
    },
    object: {
      deep: true,
      immediate: true,
      handler (n) {
        this.editObject = JSON.parse(JSON.stringify(n))
        this.scheduleChecked = this.editObject.config.isScheduler === 1
        if (n.config.schedulerConfig) {
          if (n.config.schedulerConfig.type) {
            this.scheduleType = n.config.schedulerConfig.type
            // 初始化每月下面的tab、循环
            if (this.scheduleType === 'month') {
              if (n.config.schedulerConfig.monthDates && n.config.schedulerConfig.monthDates.length > 0) {
                this.monthScheduleType = 'daily'
              } else if (n.config.schedulerConfig.monthDates && n.config.schedulerConfig.weekDates.length > 0) {
                this.monthScheduleType = 'weekly'
              }
              this.monthIsCycle = !(n.config.schedulerConfig.months && n.config.schedulerConfig.months.length > 0)
            }
          }
        }

        if (n.schedulerStart) {
          this.editObject.schedulerStart = dateFormat(this.editObject.schedulerStart, this.dateFormat)
        }
        if (n.schedulerEnd) {
          this.editObject.schedulerEnd = dateFormat(this.editObject.schedulerEnd, this.dateFormat)
        }
        if (n.id) {
          if (n.config.queryParam && n.config.queryParam.length > 0) {
            this.editObject.categoryParams = n.config.queryParam
          }
        } else if (this.currentCategoryId) {
          this.editObject.categoryId = this.currentCategoryId
          const category = this.categoryList.find(c => c.id === this.currentCategoryId)
          if (category && category.config && category.config.queryParam) {
            this.editObject.categoryParams = category.config.queryParam
            if (!this.editObject.id) {
              this.editObject.categoryParams.forEach(t => { t.value = '' })
            }
            this.loadParamOptions()
          } else {
            this.editObject.categoryParams = []
          }
        }
      }
    }
  },
  methods: {
    loadParamOptions () {
      if (_.isArray(this.editObject.categoryParams) && !_.isEmpty(this.editObject.categoryParams)) {
        this.editObject.categoryParams.forEach(param => {
          if (!this.paramsOptions.some(p => p.key === param.key)) {
            get(api.dict, { type: param.key, pageSize: -1 }).then(response => {
              if (response.code === 200) {
                this.paramsOptions.push({
                  key: param.key,
                  options: response.data.list.map(d => d.value)
                })
              }
            })
          }
        })
      }
    },
    timeOffsetHandle (type) {
      if (type === 'p') {
        if (_.isNumber(this.editObject.config.timeConfig.offset)) {
          this.editObject.config.timeConfig.offset++
        } else {
          this.editObject.config.timeConfig.offset = 1
        }
      } else if (type === 'm') {
        if (_.isNumber(this.editObject.config.timeConfig.offset)) {
          this.editObject.config.timeConfig.offset--
        }
      }
    },
    cleanScheduleConfig () {
      this.editObject.config.schedulerConfig.monthDates = []
      this.editObject.config.schedulerConfig.weekDates = []
      this.editObject.config.schedulerConfig.months = []
      this.editObject.config.schedulerConfig.monthWeekDates = []
      this.editObject.config.schedulerConfig.interval = 1
      this.monthIsCycle = true
      this.dateCheckedAll = false
      this.dateIsIndeterminate = false
      this.monthCheckedAll = false
      this.monthIsIndeterminate = false
      this.monthWeekdayCheckedAll = false
      this.monthWeekdayIsIndeterminate = false
    },
    timeConfigTypeChange (val) {
      if (val === 'customize') {
        this.scheduleChecked = false
      }
    },
    scheduleTypeChange (val) {
      this.scheduleType = val
    },
    save () {
      if (this.blockOperation.save) { return }
      this.blockOperation.save = true

      this.$refs.reportForm.validate((valid) => {
        if (valid) {
          let startTime = ''
          let endTime = ''
          let schedulerStart = ''
          let schedulerEnd = ''
          if (this.editObject.config && this.editObject.config.startTime) {
            startTime = getMillisecond(this.editObject.config.startTime)
          }
          if (this.editObject.config && this.editObject.config.endTime) {
            endTime = getMillisecond(this.editObject.config.endTime)
          }
          if (this.editObject.config && this.editObject.config.schedulerConfig) {
            if (['day', 'week', 'month'].indexOf(this.editObject.config.schedulerConfig.type) > -1) {
              this.editObject.config.isRepeat = 1
            } else {
              this.editObject.config.isRepeat = 0
            }
          }
          if (this.editObject.schedulerStart) {
            schedulerStart = getMillisecond(this.editObject.schedulerStart)
          }
          if (this.editObject.schedulerEnd) {
            schedulerEnd = getMillisecond(this.editObject.schedulerEnd)
          }

          const copyObject = _.cloneDeep(this.editObject)
          if (startTime) {
            copyObject.config.startTime = startTime
          }
          if (endTime) {
            copyObject.config.endTime = endTime
          }
          if (schedulerStart) {
            copyObject.schedulerStart = schedulerStart
          }
          if (schedulerEnd) {
            copyObject.schedulerEnd = schedulerEnd
          }
          if (this.editObject.categoryParams && this.editObject.categoryParams.length > 0) {
            copyObject.config.queryParam = this.editObject.categoryParams
          } else {
            copyObject.config.queryParam = []
          }

          // 校验scheduleConfig
          if (this.validateScheduleConfig(copyObject)) {
            copyObject.config = JSON.stringify(copyObject.config)
            if (copyObject.id) {
              put(this.url, copyObject).then(res => {
                this.blockOperation.save = false
                if (res.code === 200) {
                  this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                  this.esc(true)
                } else {
                  this.$message.error(res.msg)
                }
              })
            } else {
              post(this.url, copyObject).then(res => {
                this.blockOperation.save = false
                if (res.code === 200) {
                  this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                  this.esc(true)
                } else {
                  this.$message.error(res.msg)
                }
              })
            }
          } else {
            this.blockOperation.save = false
            this.$message.error('Schedule config is required')
          }
        } else {
          this.blockOperation.save = false
          return false
        }
      })
    },
    validateScheduleConfig (obj) {
      let validate = true
      if (obj.config) {
        if (obj.config.schedulerConfig) {
          if (obj.config.schedulerConfig.type === 'day') {
            if (!obj.config.schedulerConfig.interval) {
              validate = false
            }
          } else if (obj.config.schedulerConfig.type === 'week') {
            if (!obj.config.schedulerConfig.weekDates || obj.config.schedulerConfig.weekDates.length === 0) {
              validate = false
            }
          } else if (obj.config.schedulerConfig.type === 'month') {
            if (this.monthIsCycle) {
              if (!obj.config.schedulerConfig.interval) {
                validate = false
              }
            } else {
              if (!obj.config.schedulerConfig.months || obj.config.schedulerConfig.months.length === 0) {
                validate = false
              }
            }
            if (this.monthScheduleType === 'daily') {
              if (!obj.config.schedulerConfig.monthDates || obj.config.schedulerConfig.monthDates.length === 0) {
                validate = false
              }
            } else if (this.monthScheduleType === 'weekly') {
              if (!obj.config.schedulerConfig.weekDates || obj.config.schedulerConfig.weekDates.length === 0) {
                validate = false
              }
              if (!obj.config.schedulerConfig.monthWeekDates || obj.config.schedulerConfig.monthWeekDates.length === 0) {
                validate = false
              }
            }
          }
        }
      }
      return validate
    },
    dateCheckAllChange (checked) {
      this.editObject.config.schedulerConfig.monthDates = checked ? this.dateList : []
      this.dateIsIndeterminate = false
    },
    monthCheckAllChange (checked) {
      this.editObject.config.schedulerConfig.months = checked ? this.monthList.map(m => m.value) : []
      this.monthIsIndeterminate = false
    },
    monthWeekdayCheckAllChange (checked) {
      this.editObject.config.schedulerConfig.weekDates = checked ? this.weekdayList.map(m => m.value) : []
      this.monthWeekdayIsIndeterminate = false
    },
    dateCheckChange (val) {
      const checkedCount = val.length
      this.dateCheckedAll = checkedCount === this.dateList.length
      this.dateIsIndeterminate = checkedCount > 0 && checkedCount < this.dateList.length
    },
    monthCheckChange (val) {
      const checkedCount = val.length
      this.monthCheckedAll = checkedCount === this.monthList.length
      this.monthIsIndeterminate = checkedCount > 0 && checkedCount < this.monthList.length
    },
    monthWeekdayCheckChange (val) {
      const checkedCount = val.length
      this.monthWeekdayCheckedAll = checkedCount === this.weekdayList.length
      this.monthWeekdayIsIndeterminate = checkedCount > 0 && checkedCount < this.weekdayList.length
    }
  }
}
</script>
