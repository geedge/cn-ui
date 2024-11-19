<template>
  <div class="es-form">
    <loading :loading="myLoading"></loading>

    <div class="es-form-header">
<!--      {{ ruleId ? $t('detection.editEventPolicies') : $t('overall.entitySetting') }}-->
      {{ $t('overall.entitySetting') }}
    </div>

    <div class="es-form-content">
      <!--第一步：General Settings-->
      <div class="es-form-collapse">
        <el-collapse v-model="activeNames">
          <el-collapse-item name="1">
            <template #title>
              <div class="form-collapse-header">
                <div :class="activeNames[0]==='1' ? 'form-collapse-header-no-active' : 'form-collapse-header-no'">1</div>
                <div class="form-collapse-header-title">{{ $t('detection.create.generalSettings') }}</div>
              </div>
            </template>
            <div class="form-collapse-content">
              <el-form ref="sourceForm" :model="editObj" label-position="top" :rules="sourceRules">
                <el-form-item :label="$t('setting.source')" prop="sourceId" class="form-setting__block margin-b-20">
                  <el-select v-model="editObj.sourceId" class="form-setting__select" placeholder="" @change="onChangeSource" @visible-change="visibleSource($event)">
                    <el-option
                        v-for="item in sourceOption"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                        :disabled="item.disabled"
                    />
                  </el-select>
                </el-form-item>
              </el-form>

              <div class="form-content__title"><span class="from-dot">*</span>{{ $t('setting.schemaMapping') }}</div>
              <el-form :model="editObj.schemaMappingData" ref="mappingForm">
                <div class="form-content__block" v-for="(item, index) in editObj.schemaMappingData.data" :key="index">
                  <div class="block-header">
                    <div>{{ item.name }}</div>
                    <div class="block-header__menu">
                      <div>{{ $t('setting.entityField') }}</div>
                      <div>{{ $t('setting.sourceField') }}</div>
                    </div>
                  </div>
                  <div class="block-body" v-for="(ite, ind) in item.list" :key="index+'-'+ind">
                    <el-form-item :prop="`data.${index}.list.${ind}.entityField`" :rules="mappingRules.entityField">
                      <el-select
                          v-model="ite.entityField"
                          class="block-body__select"
                          placeholder=""
                          @visible-change="visibleEntityFiled($event, index, ind)"
                          :disabled="ind===0">
                        <el-option
                            v-for="obj in settingFields[item.type]"
                            :key="obj.fieldName"
                            :label="obj.fieldName"
                            :value="obj.fieldName"
                            :disabled="obj.disabled"
                        />
                      </el-select>
                    </el-form-item>
                    <div class="block-body-equal">=</div>
                    <el-form-item :prop="`data.${index}.list.${ind}.sourceField`" :rules="mappingRules.sourceField">
                      <el-select v-model="ite.sourceField" class="block-body__select" placeholder="">
                        <el-option
                            v-for="obj in mappingFieldOption"
                            :key="obj.name"
                            :label="obj.name"
                            :value="obj.name"
                        />
                      </el-select>
                    </el-form-item>
                    <i class="cn-icon cn-icon-add mapping-item-add" @click="addMappingListItem(index, ind)"></i>
                    <i class="cn-icon cn-icon-close mapping-item-close" @click="deleteMappingItem(index, ind)"></i>
                  </div>
                </div>
              </el-form>

              <div class="form-setting-type" v-if="showMappingType">
                <div class="setting-type__header">
                  <div>{{ $t('setting.selectMappingType') }}</div>
                  <i class="cn-icon cn-icon-close" @click="showMappingType=false"></i>
                </div>
                <el-select v-model="mappingItemType" placeholder="" @change="changeMappingType">
                  <el-option
                      v-for="obj in typeList"
                      :key="obj.value"
                      :label="obj.label"
                      :value="obj.value"
                  />
                </el-select>
              </div>

              <div class="block__footer">
                <!--新增mapping类型按钮-->
                <el-button class="addFieldBtn" @click="addSchemaMappingItem">
                  <i class="cn-icon cn-icon-add add-field-btn"></i>
                  {{ $t('overall.add') }}
                </el-button>
              </div>
            </div>

            <div class="form-setting__btn">
              <button @click="onContinue" class="business-button">{{ $t('detection.create.continue') }}</button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!--第二步：Relation-->
      <div class="es-form-collapse">
        <el-collapse v-model="activeNames">
          <el-collapse-item name="2">
            <template #title>
              <div class="form-collapse-header">
                <div :class="activeNames[0]==='2' ? 'form-collapse-header-no-active' : 'form-collapse-header-no'">2
                </div>
                <div class="form-collapse-header-title">{{ $t('setting.relation') }}</div>
              </div>
            </template>

            <div class="form-collapse-content">
              <el-form :model="editObj.relationData" ref="relationForm">
                <div class="form-content__block">
                  <div class="block-body1" v-for="(item, index) in editObj.relationData.data" :key="index">
                    <el-form-item :prop="`data.${index}.from_entity_index`" :rules="relationRules">
                      <el-select
                          v-model="item.from_entity_index"
                          class="relation-field__select"
                          placeholder=""
                          @visible-change="visibleFromEntity($event, index)"
                          @change="changeFromEntity(index)">
                        <el-option
                            v-for="obj in editObj.schemaMappingData.data"
                            :key="obj.index"
                            :label="obj.name"
                            :value="obj.index"
                            :disabled="obj.disabled"
                        />
                      </el-select>
                    </el-form-item>
                    <div class="block-body-equal">
                      <i class="cn-icon cn-icon-mutual"></i>
                    </div>
                    <el-form-item :prop="`data.${index}.to_entity_index`" :rules="relationRules">
                      <el-select
                          v-model="item.to_entity_index"
                          class="relation-field__select"
                          placeholder=""
                          @visible-change="visibleToEntity($event, index)"
                          @change="changeToEntity(index)">
                        <el-option
                            v-for="obj in editObj.schemaMappingData.data"
                            :key="obj.index"
                            :label="obj.name"
                            :value="obj.index"
                            :disabled="obj.disabled"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item :prop="`data.${index}.type`" :rules="relationRules">
                      <el-select v-model="item.type" class="relation-type__select" :placeholder="$t('setting.relationType')">
                        <el-option
                            v-for="obj in relationTypeOption"
                            :key="obj.value"
                            :label="obj.label"
                            :value="obj.value"
                        />
                      </el-select>
                    </el-form-item>
                    <i class="cn-icon cn-icon-close mapping-item-close" @click="deleteRelationItem(index)"></i>
                  </div>
                </div>
              </el-form>

              <div class="block__footer">
                <!--新增按钮-->
                <el-button class="addFieldBtn" @click="addRelationItem">
                  <i class="cn-icon cn-icon-add add-field-btn"></i>
                  {{ $t('overall.add') }}
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="switch__block margin-20">
        <div class="block-title"><span class="from-dot">*</span>{{ $t('overall.status') }}</div>
        <el-switch
            v-model="editObj.enable"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t(switchStatus(editObj.enable))"/>
      </div>
    </div>

    <div class="es-form__footer">
      <button class="business-button business-button--light tag__btn" @click="cancel">
        <span>{{ $t('overall.cancel') }}</span>
      </button>
      <button style="position: relative;" class="business-button tag__btn" @click="saveEntity">
<!--        <loading :loading="blockOperation.save"></loading>-->
        <span>{{ $t('overall.save') }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import Loading from '@/components/common/Loading'
import { ElMessageBox } from 'element-plus'
import { toUpperCaseByString, switchStatus } from '@/utils/tools'
import { settingFields } from '@/utils/constants'

export default {
  name: 'EntitySettingForm',
  data () {
    return {
      activeNames: ['1'],
      intervalList: [],
      sourceRules: {
        sourceId: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }]
      },
      mappingRules: {
        entityField: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        sourceField: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }]
      },
      relationRules: { required: true, message: this.$t('validate.required'), trigger: 'change' },
      sourceOption: [],
      mappingFieldOption: [],
      mappingSourceOption: [
        { value: 'dns_server_role', label: 'dns_server_role' },
        { value: 'ip_addr', label: 'ip_addr' },
        { value: 'category_name', label: 'category_name' }
      ],
      typeOption: [
        { label: 'IP', value: 'IP' },
        { label: 'Domain', value: 'Domain' },
        { label: 'APP', value: 'APP' }
      ],
      isCloseMappingItem: false, // 删除mapping标识
      showMappingType: false,
      mappingItemType: '', // 添加mapping映射类型
      typeList: [
        { value: 'ip', label: 'ip' },
        { value: 'domain', label: 'domain' },
        { value: 'app', label: 'app' },
        { value: 'subscriber_id', label: 'subscriber' },
        { value: 'cell_id', label: 'cell' }
      ],
      relationTypeOption: [
        { value: 'RESOLVE_DOMAIN_IP', label: 'RESOLVE_DOMAIN_IP' },
        { value: 'CARRY_APP_IP', label: 'CARRY_APP_IP' },
        { value: 'CARRY_APP_DOMAIN', label: 'CARRY_APP_DOMAIN' },
        { value: 'VISIT_SUBSCRIBER_APP', label: 'VISIT_SUBSCRIBER_APP' },
        { value: 'CALL_SUBSCRIBER_SUBSCRIBER', label: 'CALL_SUBSCRIBER_SUBSCRIBER' }
      ],
      settingFields
    }
  },
  components: {
    Loading
  },
  mounted () {
    this.initSourceData()
    if (this.ruleId) {
      this.getDetailInfo()
    }
  },
  setup () {
    const { query } = useRoute()
    const ruleId = ref(query.id || '')
    const pageNoForTable = ref(query.pageNoForTable || 1)
    const myLoading = ref(!!ruleId.value)
    // 第二步的form表单信息
    const ruleObj = ref({})

    const editObj = ref({
      id: '',
      sourceId: '',
      entities: [],
      schemaMappingData: {
        data: [
          {
            index: 1,
            type: 'ip',
            name: 'IP',
            list: [
              { entityField: 'ip', sourceField: '', delFlag: false }
            ],
            mapping: {}
          }
        ]
      },
      relations: [],
      relationData: {
        data: [{ from_entity_index: '', to_entity_index: '', type: '', fromDisabled: false, toDisabled: false }]
      },
      enable: 1
    })

    return {
      ruleId,
      myLoading,
      pageNoForTable,
      editObj,
      ruleObj
    }
  },
  methods: {
    switchStatus,
    initSourceData () {
      axios.get(api.setting.source.source).then(response => {
        if (response.status === 200) {
          if (!response.data.data) {
            throw new Error('No data found, id: ' + this.ruleId)
          }
          this.sourceOption = response.data.data.list
          if (this.sourceOption && this.sourceOption.length > 0) {
            this.sourceOption.forEach((item, index) => {
              if (typeof item.fields === 'string') {
                this.sourceOption[index].fieldsList = JSON.parse(item.fields)
              }
              if (typeof item.lookups === 'string') {
                this.sourceOption[index].lookupsList = JSON.parse(item.lookups)
              }
            })
          }
        } else {
          console.error(response.data)
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
        this.$router.push({
          path: '/setting/entitySetting',
          query: {
            pageNo: this.pageNoForTable ? Number(this.pageNoForTable) : 1,
            t: +new Date()
          }
        })
      })
    },
    /** 编辑时获取详情 */
    getDetailInfo () {
      axios.get(`${api.setting.profiles.profiles}/${this.ruleId}`).then(response => {
        if (response.status === 200) {
          if (!response.data.data) {
            throw new Error('No data found, id: ' + this.ruleId)
          }
          this.myLoading = false
          this.editObj = { ...this.editObj, ...response.data.data, ruleId: this.ruleId }

          if (this.editObj.entities && typeof this.editObj.entities === 'string') {
            const entities = JSON.parse(this.editObj.entities)
            entities.forEach(item => {
              const list = []
              for (const [key, value] of Object.entries(item.mapping)) {
                list.push({ entityField: key, sourceField: value.toString(), delFlag: true })
              }
              list[0].delFlag = false
              item.list = list
            })
            this.editObj.schemaMappingData.data = entities
          }
          if (this.editObj.relations && typeof this.editObj.relations === 'string') {
            this.editObj.relationData.data = JSON.parse(this.editObj.relations)
          }
          this.onChangeSource(this.editObj.sourceId)
          this.activeNames = ['1', '2']
        } else {
          console.error(response.data)
        }
      }).catch(e => {
        console.error(e)
        this.$message.error(this.errorMsgHandler(e))
        this.$router.push({
          path: '/setting/entitySetting',
          query: {
            pageNo: this.pageNoForTable ? Number(this.pageNoForTable) : 1,
            t: +new Date()
          }
        })
      })
    },
    onContinue () {
      this.$refs.mappingForm.validate(valid => {
        if (valid) {
          this.activeNames = ['1', '2']
        }
      })
    },
    addSchemaMappingItem () {
      this.showMappingType = true
    },
    changeMappingType () {
      const mappingList = this.editObj.schemaMappingData.data.filter(d => d.type === this.mappingItemType)
      let name = ''
      // 添加item后，按顺序给name添加名字
      if (mappingList.length === 0) {
        name = this.handleMappingName(this.mappingItemType)
      } else if (mappingList.length === 1) {
        mappingList[0].name = mappingList[0].name + 1
        name = this.handleMappingName(this.mappingItemType, mappingList.length)
      } else {
        name = this.handleMappingName(this.mappingItemType, mappingList.length)
      }

      this.editObj.schemaMappingData.data.push({
        index: this.editObj.schemaMappingData.data.length + 1,
        type: this.mappingItemType,
        name: name,
        list: [{ entityField: settingFields[this.mappingItemType][0].fieldName, sourceField: '', delFlag: false }],
        mapping: {}
      })
      this.isCloseMappingItem = true
      this.showMappingType = false
      this.mappingItemType = ''
    },
    /** 添加relation **/
    addRelationItem () {
      this.$refs.relationForm.validate(valid => {
        if (valid) {
          this.editObj.relationData.data.push({ from_entity_index: '', to_entity_index: '', type: '', fromDisabled: false, toDisabled: false })
        }
      })
    },
    /** 添加schema mapping某一类型下的字段 **/
    async addMappingListItem (index, ind) {
      const valid1 = await this.$refs.mappingForm.validateField(`data.${index}.list.${ind}.entityField`, (valid) => {
        return valid
      })
      const valid2 = await this.$refs.mappingForm.validateField(`data.${index}.list.${ind}.sourceField`, (valid) => {
        return valid
      })
      if (valid1 && valid2) {
        this.editObj.schemaMappingData.data[index].list.push({ entityField: '', sourceField: '', delFlag: true })
        this.isCloseMappingItem = true
      }
    },
    /** 删除mapping下的子项 **/
    deleteMappingItem (index, ind) {
      const currentIndex = this.editObj.schemaMappingData.data[index].index
      const obj = this.editObj.relationData.data.find(d => d.from_entity_index === currentIndex || d.to_entity_index === currentIndex)
      if (obj && this.editObj.schemaMappingData.data[index].list.length === 1) {
        const name = this.editObj.schemaMappingData.data[index].name
        ElMessageBox.alert(`${name}  ${this.$t('setting.deleteMappingTip')}`, this.$t('overall.tip'), {
          confirmButtonText: 'OK',
          callback: () => {}
        })
      } else {
        const type = this.editObj.schemaMappingData.data[index].type
        if (this.editObj.schemaMappingData.data[index].list.length > 1) {
          this.editObj.schemaMappingData.data[index].list.splice(ind, 1)
        } else {
          this.editObj.schemaMappingData.data.splice(index, 1)
        }

        this.editObj.schemaMappingData.data.forEach((item, index) => {
          item.index = index + 1
        })

        // 删除同类型的，name需要重新排序
        const list = this.editObj.schemaMappingData.data.filter(d => d.type === type)
        if (list && list.length > 0) {
          if (list.length === 1) {
            list[0].name = this.handleMappingName(list[0].type)
          } else {
            list.forEach((item, i) => {
              item.name = this.handleMappingName(item.type, i)
            })
          }
        }
        let usedFlag = false
        if (this.editObj.schemaMappingData.data.length > 0) {
          this.editObj.schemaMappingData.data.forEach(item => {
            const obj1 = item.list.find(d => d.sourceField)
            if (obj1 && !usedFlag) {
              usedFlag = true
            }
          })
        } else {
          usedFlag = false
        }

        if (usedFlag && this.editObj.sourceId) {
          this.sourceOption.forEach(item => {
            item.disabled = item.id !== this.editObj.sourceId
          })
        } else if (!usedFlag) {
          this.sourceOption.forEach(item => {
            item.disabled = false
          })
        }
      }
    },
    /** 删除relation的子项 **/
    deleteRelationItem (index) {
      this.editObj.relationData.data.splice(index, 1)
    },
    /** 修改mapping的模块名 **/
    handleMappingName (type, index) {
      let name = ''
      if (type === 'ip' || type === 'app') {
        name = index >= 0 ? type.toUpperCase() + (index + 1) : type.toUpperCase()
      } else {
        name = index >= 0 ? toUpperCaseByString(type) + (index + 1) : toUpperCaseByString(type)
      }
      return name
    },
    /** relation第一个下拉框出现时的操作 */
    visibleFromEntity (callback, index) {
      if (callback) {
        // true出现下拉框，false隐藏下拉框
        const item = this.editObj.relationData.data[index]
        if (!item.from_entity_index && !item.to_entity_index) {
          // from和to都为空的话，不禁选
          this.editObj.schemaMappingData.data.forEach(ite => {
            ite.disabled = false
          })
        } else if (item.to_entity_index) {
          // to已经选择，则禁选to本身的index和to相关联的index
          const obj = this.editObj.schemaMappingData.data.find(d => d.index === item.to_entity_index)
          obj.disabled = true
          const filterList = this.editObj.relationData.data.filter(d => d.from_entity_index === item.to_entity_index || d.to_entity_index === item.to_entity_index)
          filterList.forEach(ite => {
            const obj1 = this.editObj.schemaMappingData.data.find(d => d.index === ite.to_entity_index)
            const obj2 = this.editObj.schemaMappingData.data.find(d => d.index === ite.from_entity_index)
            if (obj1) {
              obj1.disabled = true
            }
            if (obj2) {
              obj2.disabled = true
            }
          })
        }
      } else {
        this.editObj.schemaMappingData.data.forEach(ite => {
          ite.disabled = false
        })
      }
    },
    /** relation第二个下拉框出现时的操作 */
    visibleToEntity (callback, index) {
      if (callback) {
        // true出现下拉框，false隐藏下拉框
        const item = this.editObj.relationData.data[index]
        if (!item.from_entity_index && !item.to_entity_index) {
          // from和to都为空的话，不禁选
          this.editObj.schemaMappingData.data.forEach(ite => {
            ite.disabled = false
          })
        } else if (item.from_entity_index) {
          // from已经选择，则禁选from本身的index和from相关联的index
          const obj = this.editObj.schemaMappingData.data.find(d => d.index === item.from_entity_index)
          obj.disabled = true
          const filterList = this.editObj.relationData.data.filter(d => d.from_entity_index === item.from_entity_index || d.to_entity_index === item.from_entity_index)
          filterList.forEach(ite => {
            const obj1 = this.editObj.schemaMappingData.data.find(d => d.index === ite.from_entity_index)
            const obj2 = this.editObj.schemaMappingData.data.find(d => d.index === ite.to_entity_index)
            if (obj1) {
              obj1.disabled = true
            }
            if (obj2) {
              obj2.disabled = true
            }
          })
        }
      } else {
        this.editObj.schemaMappingData.data.forEach(ite => {
          ite.disabled = false
        })
      }
    },
    changeFromEntity (index) {
      this.editObj.relationData.data[index].fromDisabled = true
    },
    changeToEntity (index) {
      this.editObj.relationData.data[index].toDisabled = true
    },
    /** 获取Rule Definition折叠板form数据 */
    getRuleObj (data) {
      if (data.dataSource && data.knowledgeId && data.level) {
        data.editFlag = false
        data.saveFlag = true
        this.handleActiveNames('2', this.activeNames, data.ruleNoContinue)
      }
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
    /** 创建entity */
    async saveEntity () {
      const valid1 = await this.$refs.sourceForm.validate((valid) => {
        return valid
      })
      const valid2 = await this.$refs.mappingForm.validate((valid) => {
        return valid
      })
      const valid3 = await this.$refs.relationForm.validate((valid) => {
        return valid
      })
      if (valid1 && valid2 && valid3) {
        const formObj = this.$_.cloneDeep(this.editObj)
        formObj.schemaMappingData.data.forEach((item) => {
          const obj = {}
          item.list.forEach(ite => {
            obj[ite.entityField] = ite.sourceField
          })
          item.mapping = this.$_.cloneDeep(obj)
        })
        formObj.entities = JSON.stringify(formObj.schemaMappingData.data)
        formObj.relations = JSON.stringify(formObj.relationData.data)
        if (formObj.schemaMappingData.data.length === 0 && formObj.relationData.data.length === 0) {
          ElMessageBox.alert(this.$t('detection.create.informationFilled'), this.$t('overall.tip'), {
            confirmButtonText: 'OK',
            callback: () => {}
          })
          return true
        }
        this.myLoading = true
        if (!this.ruleId) {
          // post调用是新增，put是编辑
          axios.post(api.setting.profiles.profiles, formObj).then(response => {
            if (response.status === 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })

              this.$router.push({
                path: '/setting/entitySetting',
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
          axios.put(api.setting.profiles.profiles, formObj).then(response => {
            if (response.status === 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })

              const { query } = this.$route
              const queryInfo = {
                pageNo: self.pageNoForTable ? Number(self.pageNoForTable) : 1,
                t: +new Date()
              }
              if (query.name && query.id) {
                queryInfo.ruleId = query.id
                queryInfo.name = this.settingObj.name
              }
              this.$router.push({
                path: '/setting/entitySetting',
                query: queryInfo
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
      }
    },
    /** 底部返回按钮 */
    cancel () {
      const { query } = this.$route
      const queryInfo = {
        pageNo: this.pageNoForTable ? Number(this.pageNoForTable) : 1,
        t: +new Date()
      }
      if (query.name && query.id) {
        queryInfo.ruleId = query.id
        queryInfo.name = this.settingObj.name
      }

      // if (this.settingObj.editFlag || this.ruleObj.editFlag) {
      //   this.confirmMessage(queryInfo)
      // } else {
      // }
      this.$router.push({
        path: '/setting/entitySetting',
        query: queryInfo
      })
    },
    confirmMessage (queryInfo) {
      ElMessageBox.confirm(this.$t('tip.leavePage'), {
        confirmButtonText: this.$t('tip.confirm'),
        cancelButtonText: this.$t('overall.cancel'),
        message: this.$t('tip.leavePageTips'),
        title: this.$t('tip.leavePage'),
        // type: 'warning',
        iconClass: 'width:0px;height:0px;',
        customClass: 'del-model'
      }).then(() => {
        this.$router.push({
          path: '/setting/entitySetting',
          query: queryInfo
        })
      }).catch(() => {
      })
    },
    /** 切换source数据源 */
    onChangeSource (id) {
      const obj = this.sourceOption.find(d => d.id === id)
      if (obj) {
        const fieldList = obj.fieldsList
        const myLookupsList = []
        obj.lookupsList.forEach(item => {
          myLookupsList.push({ name: item.output_field })
        })
        this.mappingFieldOption = fieldList.concat(myLookupsList)
      } else {
        this.mappingFieldOption = []
      }
    },
    visibleSource (callback) {
      if (callback) {
        // 如果relation中有数据，则禁选source
        const obj = this.editObj.relationData.data.find(d => d.from_entity_index || d.to_entity_index)
        if (obj && this.editObj.sourceId) {
          this.sourceOption.forEach(item => {
            item.disabled = item.id !== this.editObj.sourceId
          })
        }
        let usedFlag = false
        if (this.editObj.schemaMappingData.data.length > 0) {
          this.editObj.schemaMappingData.data.forEach(item => {
            const obj1 = item.list.find(d => d.sourceField)
            if (obj1 && !usedFlag) {
              usedFlag = true
            }
          })
        } else {
          usedFlag = false
        }
        if (usedFlag && this.editObj.sourceId) {
          this.sourceOption.forEach(item => {
            item.disabled = item.id !== this.editObj.sourceId
          })
        } else if (!usedFlag) {
          this.sourceOption.forEach(item => {
            item.disabled = false
          })
        }
      }
    },
    visibleEntityFiled (callback, index, i) {
      const item = this.editObj.schemaMappingData.data[index]
      if (callback) {
        const fieldNameList = []
        item.list.forEach(ite => {
          fieldNameList.push(ite.entityField)
        })
        this.settingFields[item.type].forEach(obj => {
          if (fieldNameList.indexOf(obj.fieldName) > -1) {
            obj.disabled = true
          }
        })
      } else {
        this.settingFields[item.type].forEach(obj => {
          obj.disabled = false
        })
      }
    }
  }
}
</script>
