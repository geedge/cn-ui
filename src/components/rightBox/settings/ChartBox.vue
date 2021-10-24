<template>
  <div v-click-outside="{object: editObject, func: esc}" class="right-box right-box-user">
    <div class="right-box__header">
      <div class="header__title">{{editObject.id ? $t('config.chart.edit') : $t('config.chart.add')}}</div>
      <div class="header__operation">
        <span v-cancel="{object: editObject, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="chartForm" :model="editObject" :rules="editObject.id ? rules2 : rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input id="chart-input-name" v-model="editObject.name" :disabled="editObject.name==='admin' && editObject.id === 1"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--i18n-->
          <el-form-item :label="$t('config.chart.i18n')" prop="i18n">
            <el-input id="chart-input-i18n" v-model="editObject.i18n"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--type-->
          <el-form-item :label="$t('config.chart.type')" prop="type">
            <el-select id="chart-type"
                       v-model="editObject.type"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small"
                       @change="()=>{ this.$forceUpdate() }">

              <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                <span style="float: left">{{ item.label }}</span><span style="float: right;color: #909399;font-size: 13px;">{{ item.remark }}</span>
              </el-option>

            </el-select>
          </el-form-item>
          <!--panel-->
          <el-form-item :label="$t('config.chart.panel')" prop="panelId">
            <el-select id="chart-input-panelId"
                       v-model="editObject.panelId"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       :disabled="editObject.id?true:false"
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small"
                       @change="getChartData">

                <el-option :key="panelTypeAndRouteMapping.trafficSummary" :label="$t('trafficSummary.trafficSummary')" :value="panelTypeAndRouteMapping.trafficSummary"></el-option>
                <el-option :key="panelTypeAndRouteMapping.networkAppPerformance" :label="$t('networkAppPerformance.networkAppPerformance')" :value="panelTypeAndRouteMapping.networkAppPerformance"></el-option>
                <el-option :key="panelTypeAndRouteMapping.dnsServiceInsights" :label="$t('dnsServiceInsights.dnsServiceInsights')" :value="panelTypeAndRouteMapping.dnsServiceInsights"></el-option>
                <el-option :key="panelTypeAndRouteMapping.ipEntityDetail" :label="$t('entities.ipEntityDetail')" :value="panelTypeAndRouteMapping.ipEntityDetail"></el-option>
                <el-option :key="panelTypeAndRouteMapping.domainEntityDetail" :label="$t('entities.domainEntityDetail')" :value="panelTypeAndRouteMapping.domainEntityDetail"></el-option>
                <el-option :key="panelTypeAndRouteMapping.appEntityDetail" :label="$t('entities.appEntityDetail')" :value="panelTypeAndRouteMapping.appEntityDetail"></el-option>

            </el-select>
          </el-form-item>
          <!--pid-->
          <el-form-item :label="$t('config.chart.pid')" prop="pid">
            <el-select id="chart-pid"
                       v-model="editObject.pid"
                       class="right-box__select"
                       clearable
                       collapse-tags
                       placeholder=""
                       :disabled="editObject.id?true:false"
                       popper-class="right-box-select-dropdown prevent-clickoutside"
                       size="small"
                       @change="()=>{ this.$forceUpdate() }">

              <template v-for="chart in chartData" :key="chart.id">
                <el-option :label="chart.name" :value="chart.id"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <!--x-->
          <el-form-item :label="$t('config.chart.x')" prop="x">
            <el-input id="chart-input-x" v-model="editObject.x"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--y-->
          <el-form-item :label="$t('config.chart.y')" prop="y">
            <el-input id="chart-input-y" v-model="editObject.y"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--w-->
          <el-form-item :label="$t('config.chart.w')" prop="w">
            <el-input id="chart-input-x" v-model="editObject.w"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--h-->
          <el-form-item :label="$t('config.chart.h')" prop="h">
            <el-input id="chart-input-y" v-model="editObject.h"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>

          <!--params-->
          <el-form-item :label="$t('config.chart.params')" prop="params">
            <v-ace-editor
                    v-model:value="editObject.params"
                    lang="json"
                    theme="chrome"
                    style="height: 300px" />
          </el-form-item>
          <!--remark-->
          <el-form-item :label="$t('config.chart.remark')">
            <el-input maxlength="1024" show-word-limit :rows="2" size='mini' type="textarea" v-model="editObject.remark" id="chart-box-remark"/>
          </el-form-item>

        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="chart-edit-cancel" v-cancel="{object: editObject, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="chart-edit-save" :class="{'footer__btn--disabled': blockOperation.save}" :disabled="blockOperation.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import rightBoxMixin from '@/mixins/rightBox'
import { get, post, put } from '@/utils/http'
import { panelTypeAndRouteMapping } from '@/utils/constants'
import { api } from '@/utils/api'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-chrome'

export default {
  name: 'ChartBox',
  mixins: [rightBoxMixin],
  components: {
    VAceEditor
  },
  data () {
    return {
      url: api.chart,
      loginName: localStorage.getItem('cn-username'),
      panelTypeAndRouteMapping: panelTypeAndRouteMapping,
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        panel_id: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        x: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        y: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        w: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        h: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      rules2: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        panel_id: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        x: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        y: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        w: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        h: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      chartData: [],
      options: [
        {
          value: 1,
          label: 'map-1',
          remark: '流量流向地图-连线'
        },
        {
          value: 2,
          label: 'map-2',
          remark: '地图-色块'
        }, {
          value: 3,
          label: 'map-3',
          remark: '地图-点'
        },
        {
          value: 4,
          label: 'map-4',
          remark: '地图-点'
        }, {
          value: 11,
          label: 'line-1',
          remark: '折线图-常规'
        },
        {
          value: 61,
          label: 'table-1',
          remark: '表格'
        }, {
          value: 62,
          label: 'table-2',
          remark: 'DNS记录'
        },
        {
          value: 31,
          label: 'pie-1',
          remark: '饼图-带联动表格'
        }, {
          value: 51,
          label: 'singleValue-1',
          remark: '单值图'
        },
        {
          value: 91,
          label: 'tab-container',
          remark: 'tab标签(容器)'
        }, {
          value: 92,
          label: 'tab-item',
          remark: 'tab标签(标签页)'
        },
        {
          value: 93,
          label: 'title',
          remark: '标题'
        }, {
          value: 94,
          label: 'group',
          remark: '组'
        },
        {
          value: 12,
          label: 'line-2',
          remark: '折线图-带统计'
        }, {
          value: 52,
          label: 'singleValue-2',
          remark: '详情单值图'
        },
        {
          value: 53,
          label: 'singleValue-3',
          remark: '单值图'
        }, {
          value: 13,
          label: 'line-3',
          remark: '折线图-堆叠面积'
        },
        {
          value: 21,
          label: 'bar-1',
          remark: '柱状图'
        }, {
          value: 22,
          label: 'bar-2',
          remark: '开放端口'
        },
        {
          value: 32,
          label: 'pie-2',
          remark: '饼图-常规'
        }, {
          value: 33,
          label: 'pie-3',
          remark: '托管域名'
        },
        {
          value: 34,
          label: 'pie-4',
          remark: '相关域名'
        }, {
          value: 42,
          label: 'relation-2',
          remark: '关系图谱'
        },
        {
          value: 43,
          label: 'relation-3',
          remark: '访问链路图'
        },
        {
          value: 82,
          label: 'base-2',
          remark: 'APP基本信息'
        }, {
          value: 83,
          label: 'list-1',
          remark: 'Whois'
        },
        {
          value: 84,
          label: 'list-2',
          remark: 'DNS记录'
        }
      ]
    }
  },
  setup () {
  },
  mounted () {
    if (this.editObject.id) {
      this.getChartData(this.editObject.panelId)
    }
  },
  watch: {
    'editObject.panelId': function (newValue, oldValue) {
      this.editObject.pid = ''
    }
  },
  methods: {
    isCurrentUser (username) {
      return localStorage.getItem('cn-username') === username
    },
    /* 密码失去焦点 检验确认密码 */
    pinBlur () {
      if (this.editObject.pin && this.editObject.pinChange) {
        this.$refs.chartForm.validateField('pinChange')
      }
    },
    save () {
      if (this.blockOperation.save) { return }
      this.blockOperation.save = true

      this.$refs.chartForm.validate((valid) => {
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
    async getChartData (value) {
      await get('/visual/chart?panelId=' + value).then(response => {
        if (response.code === 200) {
          this.chartData = response.data.list
        }
      })

      // this.$set(this.editObject, 'pid', '')
    }
  }
}
</script>
<style lang="scss">
  .my-editor {
    margin-top: 4px;
    border: 1px solid $--right-box-border-color;

    .prism-editor__textarea {
      outline: none;
    }
  }
</style>