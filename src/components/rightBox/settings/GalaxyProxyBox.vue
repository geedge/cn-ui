<template>
  <div v-click-outside="{object: editObject, func: esc}" class="right-box">
    <div class="right-box__header">
      <div class="header__title">{{editObject.id ? $t('overall.edit') : $t('overall.new')}}</div>
      <div class="header__operation">
        <span v-cancel="{object: editObject, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="userForm" :model="editObject" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input id="proxy-name" v-model="editObject.name"
                      maxlength="64" placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--path-->
          <el-form-item :label="$t('overall.path')" prop="path">
            <el-input id="proxy-path" v-model="editObject.path"
                      placeholder="" show-word-limit size="small" type="text"></el-input>
          </el-form-item>
          <!--method-->
          <el-form-item :label="$t('overall.method')" prop="method">
            <el-select id="proxy-method"
                       v-model="editObject.method"
                       placeholder=" "
                       size="small"
                       class="right-box__select"
                       popper-class="right-box-select-dropdown prevent-clickoutside"
            >
              <el-option value="get"></el-option>
              <el-option value="post"></el-option>
              <el-option value="put"></el-option>
              <el-option value="fetch"></el-option>
            </el-select>
          </el-form-item>
          <!--version-->
          <el-form-item :label="$t('overall.version')" prop="version">
            <el-input id="proxy-version" v-model="editObject.version" placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--target-->
          <el-form-item :label="$t('galaxyProxy.targetUrl')" prop="targetUrl">
            <el-input id="proxy-targetUrl" v-model="editObject.targetUrl" placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--target param-->
          <el-form-item :label="$t('galaxyProxy.targetParam')" prop="targetParam">
<!--            <prism-editor class="my-editor" v-model="editObject.targetParam" :highlight="jsonHl" line-numbers></prism-editor>-->
            <v-ace-editor
                v-model:value="editObject.targetParam"
                lang="json"
                theme="chrome"
                style="height: 300px" />
          </el-form-item>
          <!--target header-->
          <el-form-item :label="$t('galaxyProxy.targetHeader')" prop="targetHeader">
            <v-ace-editor
                v-model:value="editObject.targetHeader"
                lang="json"
                theme="chrome"
                style="height: 300px" />
          </el-form-item>
          <!--pre handle-->
          <el-form-item label="Pre handle" prop="preHandle">
            <v-ace-editor
                v-model:value="editObject.preHandle"
                lang="javascript"
                theme="chrome"
                style="height: 300px" />
          </el-form-item>
          <!--post handle-->
          <el-form-item label="Post handle" prop="postHandle">
            <v-ace-editor
                v-model:value="editObject.postHandle"
                lang="javascript"
                theme="chrome"
                style="height: 300px" />
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
import rightBoxMixin from '@/mixins/rightBox'
import { api } from '@/utils/api'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-chrome'

export default {
  name: 'GalaxyProxyBox',
  mixins: [rightBoxMixin],
  components: {
    VAceEditor
  },
  data () {
    return {
      url: api.galaxyProxy,
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      }
    }
  }
}
</script>
