<template>
  <div>
    <div v-if="mySettingObj.ruleType===detectionRuleType.threshold" style="display: flex;justify-content: space-between;">
      <div>
        <el-form ref="form" :model="thresholdRuleObj" label-position="top" :rules="rules">
          <!--source-->
          <el-form-item :label="$t('config.user.source')" prop="dataSource" class="form-setting__block margin-b-20">
            <el-select v-model="thresholdRuleObj.dataSource" placeholder=" " size="mini" class="form-setting__select">
              <el-option
                  v-for="item in sourceList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <!--Dimensions-->
        <div class="form-setting__block margin-b-20">
          <div class="block-title">{{ $t('detection.create.dimensions') }}</div>
          <div class="block-dimension">
            <div class="block-dimension-tag" v-for="(ite, ind) in dimensionList" :key="ind">{{ ite.label }}</div>
          </div>
        </div>

        <div class="form-setting__block form-setting__block-key">
          <div>Key Selection</div>
          <div class="block-key">
            <!--todo 图标暂无，需要更换-->
            <i class="cn-icon cn-icon-shijianjihua"></i>
            <span @click="showDrawer=true">History Top Keys</span>
          </div>
        </div>

        <!--Filters模块-->
        <div class="form-setting__block margin-b-20">
          <div class="block-title1">{{ $t('detections.filters') }}</div>
          <div class="definition-filter-block" v-if="showFilter">
            <div class="definition-filter-item" v-for="(item, index) in thresholdRuleObj.filterList" :key="index">
              <el-select class="filter-item__select margin-r-8" v-model="item.filter" placeholder=" " size="mini">
                <el-option
                    v-for="item in selectList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
              <el-input class="filter-item__input margin-r-8" size="mini" disabled placeholder="equal"></el-input>
              <el-input
                  class="filter-item__input margin-r-8"
                  size="mini"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="item.value"></el-input>
              <i class="cn-icon cn-icon-close" @click="delFilterItem(index, item)"></i>
            </div>

            <div style="height: 10px;"></div>
            <div class="filter-block-footer">
              <i class="cn-icon cn-icon-add" @click="addFilter"></i>
            </div>
          </div>
          <div v-else class="block-filter-add" @click="addFilter">+</div>
        </div>

        <!--Condition模块-->
        <div class="form-setting__block margin-b-20">
          <div class="block-title">{{ $t('detection.create.condition') }}</div>

          <el-form ref="form2" :model="thresholdRuleObj" label-position="top">
          <div class="definition-condition-block" v-for="(item, index) in thresholdRuleObj.conditionData" :key="index">
            <el-form-item :label="$t('detection.level')" :prop="`conditionData.${index}.level`" :rules="rules.level">
              <el-select class="condition__select margin-b-20" v-model="item.level" placeholder=" " size="mini">
                <template #prefix>
                  <div
                      class="condition__select__icon"
                      :style="{background: eventSeverityColor[item.level]}"></div>
                </template>

                <el-option
                    v-for="item in levelList"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled"
                />
              </el-select>
            </el-form-item>

            <div class="condition-metric" v-for="(data, i) in item.list" :key="i">
              <div class="condition-metric-item1">
                <div class="metric-item1__text">
                  <span style="margin-right: 9px;">If</span>
                  <el-form-item :prop="`conditionData.${index}.list.${i}.metric`" :rules="rules.metric">
                    <el-select v-model="data.metric" placeholder=" " size="mini">
                      <el-option
                          v-for="item in metricList"
                          :key="item.label"
                          :label="item.label"
                          :value="item.label"
                      />
                    </el-select>
                  </el-form-item>
                  <span style="margin-left: 9px;">of keys</span>
                </div>
                <div>
                  <i class="cn-icon cn-icon-add" @click="addConditionItem(index)"></i>
                  <i
                      class="cn-icon cn-icon-close"
                      :class="delConditionDisabled ? 'metric-item1-close-disable' : 'metric-item1-close'"
                      @click="delConditionItem(index, i)">
                  </i>
                </div>
              </div>

              <div class="condition-metric-item2">
                <div style="height: 24px;line-height: 24px;display: flex;">
                  <el-form-item :prop="`conditionData.${index}.list.${i}.condition`" :rules="rules.condition">
                    <el-select class="metric-item2__select" v-model="data.condition" placeholder=" " size="mini">
                      <el-option
                          v-for="item in conditionList"
                          :key="item.label"
                          :label="item.label"
                          :value="item.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item :prop="`conditionData.${index}.list.${i}.value`" :rules="rules.value">
                    <!--todo 应当添加长度限制-->
                    <el-input
                        class="metric-item2__input"
                        v-model.number="data.value"
                        oninput="value=value.replace(/[^\d]/g,'')"
                        size="mini"></el-input>
                  </el-form-item>
                </div>

                <span>{{ data.metric }}</span>
              </div>
              <el-divider v-if="item.list.length - 1 > i" class="condition-divider">and</el-divider>
            </div>
          </div>
          </el-form>

          <div class="condition-add" @click="addCondition">
            <i class="cn-icon cn-icon-add"></i>{{ $t('detection.create.addCondition') }}
          </div>
        </div>
      </div>

      <!--History Top Keys弹窗-->
      <div class="key-drawer">
        <history-top-keys
            v-if="showDrawer"
            :showDrawer="showDrawer"
            :delKeyId="delKeyId"
            @closeDrawer="onCloseDrawer"
            @keyRowClick="getRowClick"
        ></history-top-keys>
      </div>
    </div>

    <div v-if="mySettingObj.ruleType===detectionRuleType.indicator">
      <el-form ref="form" :model="indicatorRuleObj" label-position="top" :rules="rules">
        <!--Source-->
        <el-form-item :label="$t('config.user.source')" prop="dataSource" class="form-setting__block margin-b-20">
          <el-select v-model="indicatorRuleObj.dataSource" class="form-setting__select" placeholder=" " size="mini">
            <el-option
                v-for="item in sourceList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!--Library-->
        <el-form-item :label="$t('detection.library')" prop="knowledgeId" class="form-setting__block margin-b-20">
          <el-select v-model="indicatorRuleObj.knowledgeId" class="form-setting__select" placeholder=" " size="mini">
            <el-option
                v-for="item in libraryList"
                :key="item.knowledgeId"
                :label="item.name"
                :value="item.knowledgeId"
            />
          </el-select>
        </el-form-item>

        <!--Level-->
        <el-form-item :label="$t('detection.level')" prop="level" class="form-setting__block">
          <el-select v-model="indicatorRuleObj.level" class="condition__select form-setting__select" placeholder=" " size="mini">
            <template #prefix>
              <div
                  class="condition__select__icon"
                  :style="{background: eventSeverityColor[indicatorRuleObj.level]}"></div>
            </template>

            <el-option
                v-for="item in levelList"
                :key="item.label"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="form-setting__btn">
      <el-button @click="onContinue">{{ $t('detection.create.continue') }}</el-button>
    </div>
  </div>
</template>

<script>
import HistoryTopKeys from '@/components/table/detection/HistoryTopKeys'
import { eventSeverityColor, detectionRuleType } from '@/utils/constants'
import { detectionUnitList } from '@/utils/static-data'
import axios from 'axios'
import _ from 'lodash'
import { api } from '@/utils/api'

export default {
  name: 'RuleDefinition',
  props: {
    settingObj: {
      type: Object
    },
    editObj: {
      type: Object
    }
  },
  components: {
    HistoryTopKeys
  },
  watch: {
    settingObj: {
      immediate: true,
      deep: true,
      handler (newVal) {
        if (!newVal.editFlag && newVal.saveFlag) {
          this.mySettingObj = JSON.parse(JSON.stringify(newVal))
        }
      }
    },
    editObj: {
      immediate: true,
      deep: true,
      handler (newVal) {
        if (newVal) {
          if (newVal.ruleType === detectionRuleType.indicator) {
            this.indicatorRuleObj = this.$_.cloneDeep(newVal.ruleConfigObj)
            this.indicatorRuleObj.knowledgeId = newVal.ruleConfigObj.knowledgeBase.knowledgeId
          }
          if (newVal.ruleType === detectionRuleType.threshold) {
            this.thresholdRuleObj = this.$_.cloneDeep(newVal.ruleConfigObj)
          }
        }
      }
    }
  },
  data () {
    return {
      eventSeverityColor,
      detectionRuleType,
      mySettingObj: {
        ruleType: detectionRuleType.indicator
      },
      dimensionList: [], // Dimensions数据
      // ruleType为Indicator时表单数据
      indicatorRuleObj: {
        dataSource: '',
        knowledgeId: '',
        level: ''
      },
      // ruleType为Threshold时表单数据
      thresholdRuleObj: {
        dataSource: '',
        dimensionKeys: '',
        filterList: [],
        filters: '', // filter提交到接口的数据，即filterList转化为字符串
        conditionData: [
          {
            level: '',
            list: [
              { metric: '', condition: '', value: '' }
            ]
          }
        ],
        conditions: {} // filter提交到接口的数据，即filterList转化为字符串
      },
      rules: {
        dataSource: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        level: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        metric: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        condition: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        value: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          }
        ],
        knowledgeId: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          }
        ]
      },
      sourceList: [], // source下拉列表数据
      // rule的policy创建信息
      showDrawer: false, // 显示History Top Keys抽屉弹框
      showFilter: false, // 显示filter筛选框，点击add显示
      selectList: [], // filter的第一个下拉列表
      levelList: [], // condition的level下拉列表
      metricList: [],
      conditionList: [],
      libraryList: [],
      delConditionDisabled: true, // condition删除标识，true表示禁止删除，即只有一个condition时
      unitObj: {
        than: '>',
        less: '<',
        equal: '='
      },
      delKeyId: '' // 删除的keyId
    }
  },
  mounted () {
    this.initData()

    // todo 调用接口进行赋值
    this.dimensionList = [
      { label: 'Destination IP/CIDR', value: 'Destination IP/CIDR' },
      { label: 'Source Port Number', value: 'Source Port Number' }
    ]
  },
  methods: {
    initData () {
      this.sourceList = detectionUnitList.sourceList || []
      this.levelList = detectionUnitList.levelList || []
      // threshold模式还没确定，所以数据暂时静态数据，后续根据需要修改
      this.conditionList = detectionUnitList.conditionList || []
      this.metricList = detectionUnitList.metricList || []

      if (this.mySettingObj.ruleType === this.detectionRuleType.indicator) {
        axios.get(api.knowledgeBaseList, { params: this.searchLabel, pageSize: -1 }).then(response => {
          if (response.status === 200) {
            this.libraryList = _.get(response, 'data.data.list', []).filter(l => l.isBuiltIn === 0)
          } else {
            this.libraryList = []
            if (response.data.message) {
              this.$message.error(response.data.message)
            } else {
              this.$message.error(this.$t('tip.somethingWentWrong'))
            }
          }
        }).catch(e => {
          console.error(e)
          this.libraryList = []
          this.$message.error(this.errorMsgHandler(e))
        })
      }
    },
    /** 单击History Top Keys列表某行，filter添加数据 */
    getRowClick (data) {
      this.addFilter(data)
    },
    /** 关闭History Top Keys弹框 */
    onCloseDrawer () {
      this.showDrawer = false
    },
    /** filter模块点击add按钮 */
    addFilter (data) {
      this.delKeyId = ''
      this.showFilter = true
      if (this.selectList.length === 0) {
        this.getFilterList()
      }

      // 添加数据前，先删除空白项
      const delIndex = this.thresholdRuleObj.filterList.findIndex(t => t.filter === '')
      if (delIndex > -1) {
        this.thresholdRuleObj.filterList.splice(delIndex, 1)
      }

      if (data.metric) {
        // 从key弹框添加数据
        const obj = this.thresholdRuleObj.filterList.find(t => t.keyId === data.keyId)
        if (!obj) {
          this.thresholdRuleObj.filterList.push({ keyId: data.keyId, filter: this.selectList[0].label, value: data.metric })
        }
      } else {
        // 手动添加
        this.thresholdRuleObj.filterList.push({ filter: '', value: '' })
      }
    },
    /** 添加condition大模块 */
    addCondition () {
      this.$refs.form2.validate(valid => {
        if (valid) {
          // 如果选择了level，则禁用这一条level，不允许再选择，除非删除才能选择
          this.levelList.forEach(item => {
            const obj = this.thresholdRuleObj.conditionData.find(t => t.level === item.value)
            if (obj) {
              item.disabled = true
            }
          })
          this.thresholdRuleObj.conditionData.push({ level: '', list: [{ metric: '', condition: '', value: '' }] })
          this.delConditionDisabled = false
        }
      })
    },
    /** 添加condition小模块 */
    addConditionItem (index) {
      this.$refs.form2.validate(valid => {
        if (valid) {
          this.thresholdRuleObj.conditionData[index].list.push({ metric: '', condition: '', value: '' })
          this.delConditionDisabled = false
        }
      })
    },
    /**
     * 删除condition，小模块只剩一个时点击删除，则删除大模块
     * 只有一个大模块时，只剩一个小模块则不可删除
     * */
    delConditionItem (index, i) {
      if (!this.delConditionDisabled) {
        const dataLen = this.thresholdRuleObj.conditionData.length
        const listLen = this.thresholdRuleObj.conditionData[index].list.length
        if (dataLen === 1) {
          if (listLen >= 2) {
            this.thresholdRuleObj.conditionData[index].list.splice(i, 1)
          }

          if (this.thresholdRuleObj.conditionData[index].list.length === 1) {
            this.delConditionDisabled = true
          }
        } else {
          if (listLen === 1) {
            this.thresholdRuleObj.conditionData.splice(index, 1)
          } else {
            this.thresholdRuleObj.conditionData[index].list.splice(i, 1)
          }
        }
      }
    },
    /** 获取filter模块下拉列表 */
    getFilterList () {
      // todo 请求接口
      this.selectList = [
        { value: 'Destination As Number', label: 'Destination As Number' },
        { value: 'Destination As String', label: 'Destination As String' }
      ]
    },
    /** 删除filter某一项 */
    delFilterItem (i, item) {
      this.delKeyId = item.keyId
      this.thresholdRuleObj.filterList.splice(i, 1)
    },
    /** 点击继续，展开第三步 */
    onContinue () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.mySettingObj.ruleType === detectionRuleType.indicator) {
            // 第一步模式选择Indicator Match
            this.$emit('setRuleObj', this.indicatorRuleObj)
          } else {
            // 第一步模式选择Threshold
            this.$refs.form2.validate(valid2 => {
              if (valid2) {
                this.getConditions()
                this.$emit('setRuleObj', this.thresholdRuleObj)
              }
            })
          }
        }
      })
    },
    /** 将condition的数组转换为入参需要的字符串 */
    getConditions () {
      const conditionData = this.thresholdRuleObj.conditionData
      const obj = {}

      conditionData.forEach(item => {
        obj[item.level] = ''
        let str = ''
        item.list.forEach(t => {
          str = str + t.metric + ' ' + this.unitObj[t.condition] + ' ' + t.value + ' && '
        })
        str = str.substring(0, str.length - 4)
        obj[item.level] = str
      })
      this.thresholdRuleObj.conditions = obj
    }
  }
}
</script>
