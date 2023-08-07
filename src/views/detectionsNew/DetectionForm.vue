<template>
  <div class="detection-form">

    <div class="detection-form-header">
      Create Alert Policies
    </div>

    <!--第一步：General Settings-->
    <div class="detection-form-content">
      <div class="detection-form-collapse">
        <el-collapse v-model="activeNames">
          <el-collapse-item name="1">
            <template #title>
              <div class="form-collapse-header">
                <div :class="activeNames[0]==='1' ? 'form-collapse-header-no-active' : 'form-collapse-header-no'">1</div>
                <div class="form-collapse-header-title">General Settings</div>
              </div>
            </template>
            <div class="form-collapse-content">
              <general-settings ref="form" @setSettingForm="getFormSetting" />
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
                <div class="form-collapse-header-title">Rule Definition</div>
              </div>
            </template>
            <div class="form-collapse-content">
              <rule-definition :settingObj="settingObj" @setRuleObj="getRuleObj" />
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
                <div class="form-collapse-header-title">Trigger</div>
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
                  <el-form-item prop="minute">
                    <el-input size="mini" v-model="triggerObj.minute" oninput="value=value.replace(/[^\d]/g,'')"></el-input>
                  </el-form-item>
                  <div>minutes</div>
                </div>
              </el-form>

              <div class="form-setting__btn1">
                <el-button @click="createPolicy">Create & enable rule</el-button>
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
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import axios from 'axios'

export default {
  name: 'DetectionForm',
  data () {
    return {
      activeNames: ['1'],
      settingObj: {}, // General Settings，即第一步的form表单信息
      ruleObj: {}, // 第二步的form表单信息
      // 第三步的form表单信息
      triggerObj: {
        atLeast: '',
        interval: '',
        intervalVal: '',
        minute: '',
        finishFlag: false
      },
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
            trigger: 'change'
          }
        ],
        intervalVal: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        minute: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          }
        ]
      },
      intervalList: []
    }
  },
  components: {
    GeneralSettings,
    RuleDefinition
  },
  mounted () {
    this.getStatistics()
  },
  methods: {
    /** 获取下拉列表数据 */
    getStatistics () {
      get(api.detection.statistics, { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.intervalList = response.data.intervalList || []
        } else {
          console.error(response)
        }
      }).finally(() => {
      })
    },
    /** 获取General Settings折叠板form数据 */
    getFormSetting (data) {
      this.handleActiveNames('1', this.activeNames)
      this.settingObj = JSON.parse(JSON.stringify(data))
    },
    /** 获取Rule Definition折叠板form数据 */
    getRuleObj (data) {
      this.handleActiveNames('2', this.activeNames)
      this.ruleObj = JSON.parse(JSON.stringify(data))
    },
    /** 自动展开收起折叠板 */
    handleActiveNames (name, arr) {
      const list = arr
      list.splice(list.indexOf(name), 1)
      this.activeNames = []
      list.forEach(t => {
        this.activeNames.push(t)
      })
    },
    /** 创建policy */
    createPolicy () {
      const self = this
      const settingLen = Object.keys(this.settingObj).length
      const ruleLen = Object.keys(this.ruleObj).length

      if (settingLen > 0 && ruleLen > 0) {
        this.$refs.form3.validate(valid => {
          if (valid) {
            // 最终提交form
            // const formObj = { ...this.settingObj, ...this.ruleObj, ...this.triggerObj }
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t('tip.saveSuccess')
            })

            // axios.post('api', formObj).then(response => {
            //   if (response.data.code === 200) {
            //     this.$message({
            //       duration: 2000,
            //       type: 'success',
            //       message: this.$t('tip.saveSuccess')
            //     })
            //
            //     this.$router.push({
            //       path: '/detectionNew',
            //       query: {
            //         t: +new Date()
            //       }
            //     })
            //   } else {
            //     this.$message.error(this.errorMsgHandler(response))
            //   }
            // }).catch(e => {
            //   console.error(e)
            //   this.$message.error(this.errorMsgHandler(e))
            // }).finally(() => {
            //   //
            // })
          }
        })
      } else if (settingLen === 0) {
        this.handleFormError('1')
      } else if (ruleLen === 0) {
        this.handleFormError('2')
      }
    },
    handleFormError (name) {
      const list = this.activeNames
      list.push(name)
      this.activeNames = []
      list.forEach(t => {
        this.activeNames.push(t)
      })
      this.$message.error('请确保信息填写完整')
    }
  }
}
</script>
