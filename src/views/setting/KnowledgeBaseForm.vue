<template>
  <el-form :model="editObject" label-position="left" label-width="120px" ref="form">
    <!--name-->
    <el-form-item :label="$t('config.roles.name')" prop="name">
      <el-input  maxlength="64" placeholder="" id="role-box-input-name"
                 show-word-limit size="small" type="text" v-model="editObject.tagName"></el-input>
    </el-form-item>
    <el-form-item :label="$t('config.roles.name')" prop="name">
      <el-input  maxlength="64" placeholder="" id="role-box-input-name"
                 show-word-limit size="small" type="text" v-model="editObject.tagName"></el-input>
    </el-form-item>
    <el-form-item :label="$t('overall.remark')">
      <el-input maxlength="256" show-word-limit :rows="2" size='mini' type="textarea" v-model="editObject.remark" id="role-box-input-remark"/>
    </el-form-item>
  </el-form>
</template>

<script>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import _ from 'lodash'
export default {
  name: 'CreateKnowledgeBase',
  methods: {

  },
  setup () {
    const { query } = useRoute()
    const knowledgeBaseId = ref(query.id || '')
    // 空白对象
    const blankObject = {
      tagName: '',
      buildIn: '',
      id: '',
      tagType: '',
      remark: '',
      updateTime: ''
    }
    const editObject = ref(_.cloneDeep(blankObject))
    return {
      knowledgeBaseId,
      editObject,
      blankObject
    }
  }
}
</script>

<style scoped>

</style>
