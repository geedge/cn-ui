<template>
  <div class="pop-custom" v-ele-click-outside="esc">
    <transition-group name="dragTabs" class="drag-list" tag="ul" ref="tabs">
      <li v-for="(item, index) in custom"
          :key="item.label"
          class="list-item"
          @dragenter="dragenter($event, index)"
          @dragover="dragover($event, index)"
          @dragstart="dragstart(index)"
          :draggable="!item.sortable"
      >
        <i class="cn-icon-sort cn-icon icon-drag" :key="item.label"></i>
        <el-checkbox
            @change="tabChange(index)"
            :disabled="item.disabled"
            v-model="item.show"
            :label="$t(item.label) "
            size="small"
            :key="item.label"/>
      </li>
    </transition-group>
    <!--暂时保留之前代码-->
    <!--    <div class="pop-title">{{$t('overall.select')}}</div>-->
    <!--    <div class="pop-box custom-labels">-->
    <!--      <div style="height: 100%; border-radius:2%; border:1px solid #DCDFE6; overflow: auto;">-->
    <!--        &lt;!&ndash;NotSet 为true不可设置&ndash;&gt;-->
    <!--        <div-->
    <!--          v-for="(item,index) in custom"-->
    <!--          :key="index"-->
    <!--          class="custom-label"-->
    <!--          @click="handler(item,index)"-->
    <!--          :id="'element-set-el-'+index"-->
    <!--        >-->
    <!--          <i class="cn-icon cn-icon-check" v-if="!allowedAll && !item.allowed && (index === 0 || index === 1 || item.visibility === 'disabled')"></i>-->
    <!--          <i v-else class="cn-icon cn-icon-check" v-show="item.show"></i>-->
    <!--          <span>{{item.label}}</span>-->
    <!--        </div>-->

    <!--      </div>-->
    <!--    </div>-->
    <!--    <div class="custom-bottom-btns">-->
    <!--      <el-button size="small" v-if="isCancel" :id="tableId+'-element-set-none'" class="cn-btn cn-btn-size-small-new cn-btn-style-light-new is-cancel" @click="batchHandler(false)">-->
    <!--        <span class="top-tool-btn-txt">{{$t('overall.clear')}}</span>-->
    <!--      </el-button>-->
    <!--      <el-button size="small" v-if="!isCancel" :id="tableId+'-element-set-all'" class="cn-btn cn-btn-size-small-new cn-btn-style-light-new" @click="batchHandler(true)">-->
    <!--        <span class="top-tool-btn-txt">{{$t('overall.all')}}</span>-->
    <!--      </el-button>-->
    <!--      <div class="custom-bottom-btns-right">-->
    <!--        <el-button size="small" :id="tableId+'-element-set-esc'" class="cn-btn cn-btn-size-small-new cn-btn-style-light-new" @click="esc">-->
    <!--          <span class="top-tool-btn-txt">{{$t('overall.cancel')}}</span>-->
    <!--        </el-button>-->
    <!--        <el-button size="small" :id="tableId+'-element-set-save'" class="cn-btn cn-btn-size-small-new cn-btn-style-normal-new" @click="save" style="background-color: #0091ff;color:#DCDFE6">-->
    <!--          <span class="top-tool-btn-txt top-tool-btn-save">{{$t('overall.save')}}</span>-->
    <!--        </el-button>-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<script>
import indexedDBUtils from '@/indexedDB'
import { storageKey, dbTableColumnCustomizeConfigPre,dbTableColumnCustomizeConfig } from '@/utils/constants'
export default {
  props: {
    customTableTitle: Array, // 自定义的title
    originalTableTitle: Array, // 原始title
    tableId: String,
    allowedAll: { default: false }
  },
  data () {
    return {
      custom: [],
      dragIndex: -1,
      selectList: []
    }
  },
  created () {
    /*
    const localStorageTitle = JSON.parse(localStorage.getItem(storageKey.tableTitle + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId))
    if (localStorageTitle) {
      localStorage.setItem(storageKey.tableTitle + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId, JSON.stringify(localStorageTitle))
    } */
  },
  watch: {
    customTableTitle: {
      immediate: true,
      deep: true,
      handler (n) {
        this.custom = JSON.parse(JSON.stringify(n))
        this.selectList = this.custom.filter(item => item.show)
      }
    }
  },
  methods: {
    tabChange () {
      this.selectList = this.custom.filter(item => item.show)
      // 最少保留一个选项
      if (this.selectList.length === 1) {
        const obj = this.custom.find(item => item.prop === this.selectList[0].prop)
        obj.disabled = true
      } else if (this.selectList.length > 1) {
        this.custom.forEach(item => {
          // 该方案仅用于原始table列表无禁用的情况，目前无原始列表禁用的情况，后续有原始列表禁用的情况再修改
          item.disabled = false
        })
      }
      this.save()
    },
    /** 开始拖拽，获取键值 */
    dragstart (index) {
      this.dragIndex = index
    },
    /** 获取拖拽键值，修改数组，将数组保存到本地 */
    dragenter (e, index) {
      e.preventDefault()
      if (this.dragIndex !== index) {
        const moving = this.custom[this.dragIndex]
        this.custom.splice(this.dragIndex, 1)
        this.custom.splice(index, 0, moving)
        this.dragIndex = index
        this.save()
      }
    },
    dragover (e) {
      e.preventDefault()
    },
    // 悬浮点击空白隐藏
    esc () {
      this.$emit('close')
    },
    // 全选all true 或者全取消cancel false按钮
    batchHandler (state) {
      for (let index = 0; index < this.custom.length; index++) {
        if (this.custom[index].type !== 'title') {
          if ((index === 0 || index === 1 || this.custom[index].NotSet)) {
            this.custom[index].show = true
          } else {
            this.custom[index].show = state
          }
        }
      }
    },
    // 单选
    handler (val, index) {
      if (!this.allowedAll && !val.allowed && (index === 0 || index === 1 || val.NotSet)) {
        //
      } else {
        this.custom[index].show = !this.custom[index].show
      }
    },
    // 点击第二个cancel
    async save () {
      this.$emit('update', this.custom)
      const userId = localStorage.getItem(storageKey.userId)
      const tableName = dbTableColumnCustomizeConfigPre + '-' + this.tableId
/*
      const defaultConfigInDb = await indexedDBUtils.selectTable(tableName).get({ id: userId })
      let fullVersion = ''
      if (defaultConfigInDb && defaultConfigInDb.version) {
        const oldVersion = defaultConfigInDb.version
        if (oldVersion.startsWith(BASE_CONFIG.version)) {
          const realVersion = Number(oldVersion.substring(BASE_CONFIG.version.length + 1))
          fullVersion = BASE_CONFIG.version + '.' + (realVersion + 1)
        } else {
          fullVersion = BASE_CONFIG.version + '.1'
        }
      } else {
        fullVersion = BASE_CONFIG.version + '.1'
      }
*/
      let curTableConfig = dbTableColumnCustomizeConfig.find(item => item.tableName === tableName)
      if(curTableConfig) {
        await indexedDBUtils.selectTable(tableName).put({
          id: userId,
          version: curTableConfig.version,
          config: _.cloneDeep(this.custom)
        })
      }
    }
  },
  computed: {
    // 点击all是否是全部取消选中，true为是
    isCancel () {
      let isCancel = true
      for (let i = 0; i < this.custom.length; i++) {
        if (!this.custom[i].show && this.custom[i].type !== 'title') {
          isCancel = false
          break
        }
      }
      return isCancel
    }
  }
}
</script>
