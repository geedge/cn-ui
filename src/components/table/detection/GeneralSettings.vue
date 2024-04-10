<template>
  <div>
    <div class="form-setting__block margin-b-20" style="display: flex">
      <div class="block-mode">
        <!--todo 图标没有，后期换-->
        <div class="block-mode-left">
          <i class="cn-icon cn-icon-indicator-match block-mode-icon1"></i>
        </div>

        <div class="block-mode-right" style="position:relative;">
          <div class="block-mode-title">{{ $t('detection.policy.indicatorMatch') }}</div>
          <div class="block-mode-content">
            {{ $t('detection.policy.indicatorMatchIntroduce') }}
            <div v-if="language===ZH" style="color: rgba(0,0,0,0)">0</div>
          </div>
          <div :class="settingObj.ruleType===detectionRuleType.indicator?'block-mode-btn-active':'block-mode-btn'"
               @click="selectMode(detectionRuleType.indicator)">{{ $t('overall.select') }}
          </div>
        </div>
      </div>

      <div class="block-mode" style="cursor: no-drop;">
        <div class="block-mode-left">
          <i class="cn-icon cn-icon-threshold block-mode-icon"></i>
        </div>

        <div class="block-mode-right">
          <div class="block-mode-title">{{ $t('detection.policy.threshold') }}</div>
          <div class="block-mode-content">
            {{ $t('detection.policy.thresholdIntroduce') }}
          </div>
          <!--todo 当前版本暂时不可选择-->
          <div style="cursor: no-drop;" :class="settingObj.ruleType===detectionRuleType.threshold?'block-mode-btn-active':'block-mode-btn'">
            {{ $t('overall.select') }}
          </div>
<!--          <div :class="settingObj.ruleType===detectionRuleType.threshold?'block-mode-btn-active':'block-mode-btn'"-->
<!--               @click="selectMode(detectionRuleType.threshold)">select-->
<!--          </div>-->
        </div>
      </div>
    </div>

    <!--category-->
    <el-form ref="form" :model="settingObj" label-position="top" :rules="rules">
      <el-form-item :label="$t('overall.category')" prop="category" class="form-setting__block margin-b-20">
        <el-select :disabled="settingObj.ruleId" v-model="settingObj.category" class="form-setting__select" placeholder=" " @change="changeEditFlag">
          <el-option
              v-for="item in categoryList"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!--type-->
      <el-form-item :label="$t('overall.type')" prop="eventType" class="form-setting__block margin-b-20">
        <el-select v-model="settingObj.eventType" placeholder=" " class="form-setting__select" @change="changeEditFlag">
          <el-option
              v-for="item in eventTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!--name-->
      <el-form-item :label="$t('overall.name')" prop="name" class="form-setting__block margin-b-20">
        <el-input
            maxlength="64"
            show-word-limit
            placeholder=""
            v-model="settingObj.name"
            @blur="changeEditFlag"
            class="form-setting__input" />
      </el-form-item>

      <!--Description-->
      <div class="form-setting__block margin-b-20">
        <div class="block-title">{{ $t('config.dataSet.description') }}</div>
        <el-input
            maxlength="255"
            show-word-limit
            v-model="settingObj.description"
            type="textarea"
            resize='none'
            @blur="changeEditFlag"
            class="form-setting__textarea" />
      </div>
    </el-form>

    <div class="form-setting__block margin-b-20">
      <div class="block-title">{{ $t('detection.create.policyStatus') }}</div>
      <el-switch
          v-model="settingObj.status"
          @change="changeEditFlag"
          :active-value="1"
          :inactive-value="0"
          :active-text="$t(switchStatus(settingObj.status))"/>
    </div>

    <div class="form-setting__btn">
      <el-button @click="onContinue">{{ $t('detection.create.continue') }}</el-button>
    </div>
  </div>
</template>

<script>
import { detectionRuleType, storageKey, detectionUnitList, ZH, EN } from '@/utils/constants'
import { switchStatus } from '@/utils/tools'

export default {
  name: 'GeneralSettings',
  props: {
    editObj: {
      type: Object
    },
    isComplete: {
      type: Boolean
    }
  },
  data () {
    return {
      detectionRuleType,
      categoryList: [],
      eventTypeList: [],
      settingObj: {
        ruleType: detectionRuleType.indicator,
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
      },
      language: EN,
      ZH
    }
  },
  watch: {
    editObj (newVal) {
      if (newVal.ruleId) {
        this.settingObj = JSON.parse(JSON.stringify({ ...newVal }))
        this.settingObj.editFlag = false
        this.settingObj.saveFlag = true
      }
    },
    isComplete (newVal) {
      if (!newVal) {
        this.onContinue()
      }
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    switchStatus,
    initData () {
      this.language = localStorage.getItem(storageKey.language) || EN
      this.categoryList = detectionUnitList.categoryList
      this.eventTypeList = detectionUnitList.eventTypeList
    },
    selectMode (ruleType) {
      this.settingObj.ruleType = ruleType
      this.changeEditFlag()
    },
    changeEditFlag () {
      this.settingObj.editFlag = true
      if (this.settingObj.ruleType && this.settingObj.category && this.settingObj.eventType && this.settingObj.name) {
        this.settingObj.settingNoContinue = true
        this.onContinue()
      } else {
        this.$emit('setSettingForm', this.settingObj)
      }
    },
    /** 点击继续，进行第二步 */
    onContinue (e) {
      if (e) {
        delete this.settingObj.settingNoContinue
      }
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
