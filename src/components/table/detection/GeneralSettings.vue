<template>
  <div>
    <div class="form-setting__block margin-b-20" style="display: flex">
      <div class="block-mode">
        <!--todo 图标没有，后期换-->
        <div class="block-mode-left">
          <i class="cn-icon cn-icon-setting2 block-mode-icon"></i>
        </div>

        <div class="block-mode-right">
          <div class="block-mode-title">Indicator Match</div>
          <div class="block-mode-content">
            Use indicators from intelligencesources to detect matchingevents and alerts.
          </div>
          <div :class="settingObj.ruleType===detectionRuleType.indicator?'block-mode-btn-active':'block-mode-btn'"
               @click="selectMode(detectionRuleType.indicator)">select
          </div>
        </div>
      </div>

      <div class="block-mode">
        <!--todo 图标没有，后期换-->
        <div class="block-mode-left">
          <i class="cn-icon cn-icon-setting2 block-mode-icon"></i>
        </div>

        <div class="block-mode-right">
          <div class="block-mode-title">Threshold</div>
          <div class="block-mode-content">
            Aggregate query results to detect when number of matches exceeds threshold.
          </div>
          <div :class="settingObj.ruleType===detectionRuleType.threshold?'block-mode-btn-active':'block-mode-btn'"
               @click="selectMode(detectionRuleType.threshold)">select
          </div>
        </div>
      </div>
    </div>

    <!--category-->
    <el-form ref="form" :model="settingObj" label-position="top" :rules="rules">
      <el-form-item label="Category" prop="category" class="form-setting__block margin-b-20">
        <el-select v-model="settingObj.category" class="form-setting__select" placeholder=" " size="mini" @change="changeEditFlag">
          <el-option
              v-for="item in categoryList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!--type-->
      <el-form-item label="Type" prop="eventType" class="form-setting__block margin-b-20">
        <el-select v-model="settingObj.eventType" placeholder=" " size="mini" class="form-setting__select" @change="changeEditFlag">
          <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!--name-->
      <el-form-item label="Name" prop="name" class="form-setting__block margin-b-20">
        <el-input
            maxlength="64"
            show-word-limit
            placeholder=""
            v-model="settingObj.name"
            @input="changeEditFlag"
            class="form-setting__input" />
      </el-form-item>

      <!--Description-->
      <div class="form-setting__block margin-b-20">
        <div class="block-title">Description</div>
        <el-input
            maxlength="255"
            show-word-limit
            v-model="settingObj.description"
            type="textarea"
            resize='none'
            @input="changeEditFlag"
            class="form-setting__textarea" />
      </div>
    </el-form>

    <div class="form-setting__block margin-b-20">
      <div class="block-title">Policy Status</div>
      <el-switch
          v-model="settingObj.status"
          @change="changeEditFlag"
          active-color="#38ACD2"
          inactive-color="#C0CEDB"
          :active-value="1"
          :inactive-value="0"
          :active-text="switchStatus(settingObj.status)"/>
    </div>

    <div class="form-setting__btn">
      <el-button @click="onContinue">Continue</el-button>
    </div>
  </div>
</template>

<script>
import { detectionRuleType } from '@/utils/constants'
import { switchStatus } from '@/utils/tools'
import { get } from '@/utils/http'
import { api } from '@/utils/api'

export default {
  name: 'GeneralSettings',
  data () {
    return {
      detectionRuleType,
      categoryList: [],
      typeList: [],
      settingObj: {
        ruleType: detectionRuleType.threshold,
        category: '',
        eventType: '',
        name: '',
        description: '',
        status: 1,
        editFlag: false, // 编辑标识，如果保存之后继续编辑且不再点击保存，置为true，则不会将编辑内容提交到最终form
        saveFlag: false // 是否点击保存标识
      },
      rules: {
        category: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        eventType: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        name: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    switchStatus,
    initData () {
      get(api.detection.statistics, { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.categoryList = response.data.categoryList || []
          this.typeList = response.data.typeList || []
        } else {
          console.error(response)
        }
      }).finally(() => {
      })
    },
    selectMode (ruleType) {
      this.settingObj.ruleType = ruleType
      this.changeEditFlag()
    },
    changeEditFlag () {
      this.settingObj.editFlag = true
    },
    /** 点击继续，进行第二步 */
    onContinue () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.settingObj.editFlag = false
          this.settingObj.saveFlag = true
          this.$emit('setSettingForm', this.settingObj)
        }
      })
    }
  }
}
</script>

<style lang="scss">

</style>
