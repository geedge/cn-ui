<template>
  <div v-click-outside="{object: editObject, func: esc}" class="right-box right-box-report">
    <div class="right-box__header">
      <div class="header__title">{{editObject.id ? $t('report.editBuiltin') : $t('report.createBuiltin')}}</div>
      <div class="header__operation">
        <span v-cancel="{object: editObject, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="userForm" :model="editObject" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('report.name')" prop="name">
            <el-input id="account-input-name" v-model="editObject.name" maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--time limit-->
          <el-form-item :label="$t('report.timeLimit')" prop="timeLimit">
            <template v-if="tabNum === 2">
              <el-select id="account-input-roleIds"
                         v-model="editObject.id"
                         class="right-box__select"
                         clearable
                         collapse-tags
                         placeholder="select"
                         popper-class="right-box-select-dropdown prevent-clickoutside"
                         size="small"
                         @change="()=>{ this.$forceUpdate() }">
                <template v-for="time in perMonthList" :key="time.value">
                  <el-option :label="time.name" :value="time.value"></el-option>
                </template>
              </el-select>
            </template>
            <el-select id="account-input-roleIds"
                       v-model="editObject.name"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small"
                       @change="()=>{ this.$forceUpdate() }">
              <template v-for="time in timeLimit" :key="time.value">
                <el-option :label="time.name" :value="time.value"></el-option>
              </template>
            </el-select>
            <template v-if="tabNum === 3">
              <el-input v-model="single" @change="singleChange" size="small" class="el-input-single" placeholder="Please input">
                <template #prepend><i @click="add" class="cn-icon cn-icon-a-1"></i></template>
                <template #append><i @click="piece" class="cn-icon cn-icon-a-"></i></template>
              </el-input>
              <el-select id="account-input-roleIds"
                         v-model="editObject.id"
                         class="right-box__select right-box__select-single"
                         clearable
                         collapse-tags
                         placeholder="1"
                         popper-class="right-box-select-dropdown prevent-clickoutside"
                         size="small"
                         @change="()=>{ this.$forceUpdate() }">
                <template v-for="time in timeLimit" :key="time.value">
                  <el-option :label="time.name" :value="time.value"></el-option>
                </template>
              </el-select>
            </template>
          </el-form-item>
          <!--Enable time schedule-->
          <el-form-item prop="enableTimeSchedule">
            <el-checkbox v-model="scheduleChecked" :label="$t('report.enableTimeSchedule')" size="large" />
            <div class="enable-tab">
              <div class="enable-tabs" @click="enableTabs(0)" :class="{'active': tabNum === 0}">{{$t('report.daily')}}</div>
              <div class="enable-tabs" @click="enableTabs(1)" :class="{'active': tabNum === 1}">{{$t('report.weekly')}}</div>
              <div class="enable-tabs" @click="enableTabs(2)" :class="{'active': tabNum === 2}">{{$t('report.perMonth')}}</div>
              <div class="enable-tabs" @click="enableTabs(3)" :class="{'active': tabNum === 3}">{{$t('report.single')}}</div>
            </div>
            <div class="enable-tabs-daily" v-if="tabNum === 0">
              <div class="enable-tabs-custom">{{$t('report.customEvery')}}</div>
              <el-input v-model="day" size="small" placeholder="Please input">
                <template #append>{{$t('report.day')}}</template>
              </el-input>
            </div>
            <div class="enable-tabs-weekly" v-if="tabNum === 1">
              <div class="enable-tabs-custom">{{$t('report.customEvery')}}</div>
              <el-input v-model="week" size="small" placeholder="Please input">
                <template #append>{{$t('report.week')}}</template>
              </el-input>
              <el-checkbox-group v-model="checkWeeklyList">
                <el-checkbox v-for="(item, index) in citiesWeekly" :key="index" :label="item" />
              </el-checkbox-group>
            </div>
            <div class="enable-tabs-per-month" v-if="tabNum === 2">
              <div class="enable-month-tab">
                <div class="enable-month-tabs" @click="enableMonthTabs(0)" :class="{'active': tabMonthNum === 0}">{{$t('report.date')}}</div>
                <div class="enable-month-tabs" @click="enableMonthTabs(1)" :class="{'active': tabMonthNum === 1}">{{$t('report.week')}}</div>
                <el-checkbox v-model="perMonthChecked" @change="checkboxChange" :label="$t('report.cycle')" size="large" />
              </div>
              <div class="enable-month-data-tab" v-if="tabMonthNum === 0">
                <div class="enable-tabs-custom">{{$t('report.customEvery')}}</div>
                <el-input v-model="moon" size="small" placeholder="Please input">
                  <template #append>{{$t('report.moon')}}</template>
                </el-input>
                <div class="enable-month-data-tabs">
                  <div>
                    <el-checkbox v-model="dateCheckedAll" :indeterminate="isIndeterminateDate" @change="checkAllChange" :label="$t('report.all')" size="large" />
                  </div>
                  <el-checkbox-group v-model="dateList" @change="checkedCitiesChange">
                    <el-checkbox v-for="(item, index) in citiesDate" :key="index" :label="item" />
                  </el-checkbox-group>
                </div>
                <div class="enable-month-value">*一月，三月，五月，七月，八月，十月和12月含31天;闰年二月含29天*</div>
              </div>
              <div class="enable-month-moon" v-if="tabMonthNum === 1">
                <template v-if="perMonthChecked">
                  <div class="enable-month-moon-custom">{{$t('report.custom')}}</div>
                  <div class="enable-month-all">
                    <el-checkbox v-model="allMonthsChecked" class="enable-month-all-months" :indeterminate="isIndeterminateMonths" @change="checkMonthsAllChange" :label="$t('report.allMonths')" size="large" />
                    <el-checkbox-group v-model="checkMonthsList">
                      <el-checkbox v-for="(item, index) in citiesMonths" :key="index" :label="item" @change="checkedMonthsCitiesChange" />
                    </el-checkbox-group>
                  </div>
                </template>
                <template v-else>
                  <div class="enable-tabs-custom">{{$t('report.customEvery')}}</div>
                  <el-input v-model="moon" size="small" placeholder="Please input">
                    <template #append>{{$t('report.moon')}}</template>
                  </el-input>
                </template>
                <el-select id="account-input-roleIds"
                           v-model="editObject.id"
                           class="right-box__select"
                           multiple
                           placeholder="Select"
                           popper-class="right-box-select-dropdown prevent-clickoutside"
                           size="small"
                           @change="()=>{ this.$forceUpdate() }">
                  <template v-for="time in timeLimit" :key="time.value">
                    <el-option :label="time.name" :value="time.value"></el-option>
                  </template>
                </el-select>
                <div class="enable-month-week">
                  <el-checkbox v-model="checkedAll" class="enable-month-week-all" :label="$t('report.all')" :indeterminate="isIndeterminateWeek" @change="checkWeekAllChange" size="large" />
                  <el-checkbox-group v-model="checkWeekList" >
                    <el-checkbox v-for="(item, index) in citiesWeek" @change="checkedWeekCitiesChange" :key="index" :label="item" />
                  </el-checkbox-group>
                </div>

              </div>
            </div>
          </el-form-item>
          <!--startTime-->
          <el-form-item :label="$t('report.startTime')" prop="startTime">
            <div class="demo-datetime-picker">
              <div class="block">
                <el-date-picker
                    style="width: 100%"
                    v-model="editObject.startTime"
                    size="small"
                    :format="format"
                    prefix-icon="cn-icon cn-icon-shijian"
                    type="datetime"
                    placeholder="Select date and time"
                />
              </div>
            </div>
          </el-form-item>
          <!--endTime-->
          <el-form-item :label="$t('report.endTime')" prop="endTime">
            <div class="demo-datetime-picker">
              <div class="block">
                <el-date-picker
                    style="width: 100%"
                    v-model="editObject.endTime"
                    size="small"
                    :format="format"
                    prefix-icon="cn-icon cn-icon-shijian"
                    type="datetime"
                    placeholder="Select date and time"
                />
              </div>
            </div>
          </el-form-item>
          <!--categoryType-->
          <el-form-item :label="$t('report.categoryType')" prop="categoryType">
            <el-select id="account-input-roleIds"
                       v-model="editObject.type"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small"
                       @change="()=>{ this.$forceUpdate() }">
              <template v-for="time in timeLimit" :key="time.value">
                <el-option :label="time.name" :value="time.value"></el-option>
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
import { get, post, put } from '@/utils/http'
import { themeData, langData, storageKey, timeLimit, perMonthList } from '@/utils/constants'
import { api } from '@/utils/api'
import { ref } from 'vue'
export default {
  name: 'builtinReportBox',
  mixins: [rightBoxMixin],
  props: {
    checkMonthsListData: {
      type: Array
    },
    checkWeekListData: {
      type: Array
    }
  },
  data () {
    return {
      url: api.user,
      loginName: localStorage.getItem(storageKey.username),
      format: localStorage.getItem(storageKey.dateFormat),
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      scheduleChecked: false,
      perMonthChecked: false,
      tabNum: '',
      tabMonthNum: '',
      single: 0,
      themeData,
      langData,
      timeLimit,
      perMonthList
    }
  },
  setup (props) {
    // weekly
    const checkWeeklyList = ref([props.checkWeekListData[0]])
    let citiesWeekly = ref([])
    citiesWeekly = props.checkWeekListData
    // week
    const checkWeekList = ref([props.checkWeekListData[0]])
    const checkedAll = ref(false)
    const isIndeterminateWeek = ref(true)
    const citiesWeek = ref([])
    citiesWeek.value = props.checkWeekListData
    const checkWeekAllChange = (val) => {
      checkWeekList.value = val ? citiesWeek.value : []
      isIndeterminateWeek.value = false
    }
    const checkedWeekCitiesChange = (val) => {
      const checkedCount = val.length
      checkedAll.value = checkedCount === citiesWeek.value.length
      isIndeterminateWeek.value = checkedCount > 0 && checkedCount < citiesWeek.value.length
    }
    // date
    const dateList = ref([])
    const dateCheckedAll = ref(false)
    const isIndeterminateDate = ref(true)
    const citiesDate = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
    const checkAllChange = (val) => {
      dateList.value = val ? citiesDate : []
      isIndeterminateDate.value = false
    }
    const checkedCitiesChange = (val) => {
      const checkedCount = val.length
      dateCheckedAll.value = checkedCount === citiesDate.length
      isIndeterminateDate.value = checkedCount > 0 && checkedCount < citiesDate.length
    }
    // months
    const checkMonthsList = ref([props.checkMonthsListData[0]])
    const allMonthsChecked = ref(false)
    const isIndeterminateMonths = ref(true)
    const citiesMonths = ref([])
    citiesMonths.value = props.checkMonthsListData
    const checkMonthsAllChange = (val) => {
      checkMonthsList.value = val ? citiesMonths.value : []
      isIndeterminateMonths.value = false
    }
    const checkedMonthsCitiesChange = (val) => {
      const checkedCount = val.length
      allMonthsChecked.value = checkedCount === citiesMonths.value.length
      isIndeterminateMonths.value = checkedCount > 0 && checkedCount < citiesMonths.value.length
    }
    return {
      // weekly
      checkWeeklyList,
      citiesWeekly,
      // week
      checkWeekList,
      citiesWeek,
      checkedAll,
      isIndeterminateWeek,
      checkWeekAllChange,
      checkedWeekCitiesChange,
      // date
      dateList,
      citiesDate,
      dateCheckedAll,
      isIndeterminateDate,
      checkAllChange,
      checkedCitiesChange,
      // months
      checkMonthsList,
      citiesMonths,
      allMonthsChecked,
      isIndeterminateMonths,
      checkMonthsAllChange,
      checkedMonthsCitiesChange
    }
  },
  mounted () {
  },
  methods: {
    save () {
      if (this.blockOperation.save) { return }
      this.blockOperation.save = true
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          if (this.editObject.id) {
            put(this.url, this.editObject).then(res => {
              this.blockOperation.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            post(this.url, this.editObject).then(res => {
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
          return false
        }
      })
    },
    enableTabs (num) {
      this.tabNum = num
    },
    enableMonthTabs (num) {
      this.tabMonthNum = num
    },
    checkboxChange (val) {
      this.perMonthChecked = val
    },
    singleChange (val) {
      this.single = val
    },
    add () {
      this.single++
    },
    piece () {
      if (this.single <= 0) return
      this.single--
    }
  },
  watch: {
    object: {
      deep: true,
      immediate: true,
      handler (n) {
      }
    }
  }
}
</script>
