<template>
  <div v-click-outside="{object: editRole, func: esc}" class="right-box right-box-role">
    <div class="right-box__header">
      <div class="header__title">{{editRole.id ? $t('config.roles.editRole') : $t('config.roles.createRole')}}</div>
      <div class="header__operation">
        <span v-cancel="{object: editRole, func: esc}"><i class="cn-icon cn-icon-close"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form :disabled="detail" :model="editRole" :rules="rules" class="right-box-form right-box-form-left" label-position = "top" label-width="120px" ref="roleForm">
          <!--name-->
          <el-form-item :label="$t('config.roles.name')" prop="name">
            <el-input  maxlength="64" placeholder="" id="role-box-input-name"
                       show-word-limit size="small" type="text" v-model="editRole.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('overall.remark')">
            <el-input maxlength="256" show-word-limit :rows="2" size='mini' type="textarea" v-model="editRole.remark" id="role-box-input-remark"/>
          </el-form-item>

          <el-form-item :label="$t('config.roles.permission')">
            <!--<div class="tree-option">
              <button type="button" class="cn-btn cn-btn-size-small-new cn-btn-style-light-new option-btn" style="margin-left: 0px;" @click="expandAllOrNone" :class="{'btn-active':expandAllFlag}">展开/收缩</button>
              <button type="button" class="cn-btn cn-btn-size-small-new cn-btn-style-light-new option-btn" @click="selectAllOrNone" :class="{'btn-active':selectAllFlag}"><span ><i class="cn-icon cn-icon-delete"></i></span></button>
            </div>-->
            <el-tree :data="menus" :default-expand-all="expandAllFlag" :props="{label:labelFormatter}"  @check-change="selectChange" class="tree-border" node-key="id" ref="menuTree" show-checkbox id="role-box-input-menus">
              <template #default="{ data }">
              <span>
                <i v-if="data.type == '1'" class="el-icon-menu"></i>
                <i v-if="data.type == '2'" class="el-icon-edit"></i>
              </span>
                {{$t(data.i18n)}}
              </template>
            </el-tree>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{object: editRole, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import rightBoxMixin from '@/mixins/right-box'
import { get, post, put } from '@/utils/http'
export default {
  name: 'userBox',
  mixins: [rightBoxMixin],
  components: {
  },
  props: {
    object: {
      type: Object
    },
    detail: Boolean
  },
  data () {
    return {
      editRole: {},
      url: 'sys/role',
      rightBox: { model: { show: false } },
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      menus: [],
      selectedIds: [],
      selectAllFlag: false,
      expandAllFlag: true
    }
  },
  watch: {
    object: {
      deep: true,
      immediate: true,
      handler (n) {
        this.editRole = JSON.parse(JSON.stringify(n))
        if (this.editRole.roles && this.editRole.roles.length > 0) {
          this.editRole.roleIds = this.editRole.roles.map(t => t.id)
        }
      }
    }
  },
  mounted () {
    this.getMenus().then(() => {
      if (this.$refs.menuTree && this.selectedIds && this.selectedIds.length > 0) {
        this.$refs.menuTree.setCheckedKeys(this.selectedIds, true)
      }
    })
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    getMenus: function () {
      const self = this
      return new Promise(resolve => {
        self.menus = []
        if (self.editRole.id) {
          get('/sys/role/menu/' + self.editRole.id).then(response => {
            if (response.code == 200) {
              self.menus = response.data.menus
              self.selectedIds = response.data.selectedIds
            } else {
              self.$message.error('load menu faild')
            }
            resolve()
          })
        } else {
          get('/sys/menu').then(response => {
            if (response.code == 200) {
              self.menus = response.data.list
            } else {
              self.$message.error('load menu faild')
            }
            resolve()
          })
        }
      })
    },
    labelFormatter: function (data, node) {
      return data && data.i18n ? this.$t(data.i18n) : data.name
    },
    selectChange: function (data, isCheck, childIsCheck) {
      if (this.$refs.menuTree) {
        this.editRole.menuIds = this.$refs.menuTree.getCheckedKeys(true)
      }
    },
    selectAllOrNone: function () {
      if (this.$refs.menuTree) {
        if (!this.selectAllFlag) {
          this.$refs.menuTree.setCheckedNodes(this.menus)
        } else {
          this.$refs.menuTree.setCheckedNodes([])
        }
        this.selectAllFlag = !this.selectAllFlag
      }
    },
    expandAllOrNone: function () {
      this.expandAllFlag = !this.expandAllFlag
      const $self = this
      if (this.$refs.menuTree) {
        this.menus.forEach(t => {
          $self.$refs.menuTree.store.nodesMap[t.id].expanded = $self.expandAllFlag
        })
      }
    },
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true

      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.editRole.id) {
            put(this.url, this.editRole).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            post(this.url, this.editRole).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    }
  }
}
</script>
