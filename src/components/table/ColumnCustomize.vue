<template>
  <div class="pop-custom" v-ele-click-outside="esc">
    <div class="pop-title">{{$t('overall.select')}}</div>
    <div class="pop-box custom-labels">
      <div style="height: 100%; border-radius:2%; border:1px solid #DCDFE6; overflow: auto;">
        <!--NotSet 为true不可设置-->
        <div
          v-for="(item,index) in custom"
          :key="index"
          class="custom-label"
          @click="handler(item,index)"
          :id="'element-set-el-'+index"
        >
          <i class="cn-icon cn-icon-check" v-if="!allowedAll && !item.allowed && (index === 0 || index === 1 || item.visibility === 'disabled')"></i>
          <i v-else class="cn-icon cn-icon-check" v-show="item.show"></i>
          <span>{{item.label}}</span>
        </div>

      </div>
    </div>
    <div class="custom-bottom-btns">
      <el-button size="mini" v-if="isCancel" :id="tableId+'-element-set-none'" class="cn-btn cn-btn-size-small-new cn-btn-style-light-new is-cancel" @click="batchHandler(false)">
        <span class="top-tool-btn-txt">{{$t('overall.clear')}}</span>
      </el-button>
      <el-button size="mini" v-if="!isCancel" :id="tableId+'-element-set-all'" class="cn-btn cn-btn-size-small-new cn-btn-style-light-new" @click="batchHandler(true)">
        <span class="top-tool-btn-txt">{{$t('overall.all')}}</span>
      </el-button>
      <div class="custom-bottom-btns-right">
        <el-button size="mini" :id="tableId+'-element-set-esc'" class="cn-btn cn-btn-size-small-new cn-btn-style-light-new" @click="esc">
          <span class="top-tool-btn-txt">{{$t('overall.cancel')}}</span>
        </el-button>
        <el-button size="mini" :id="tableId+'-element-set-save'" class="cn-btn cn-btn-size-small-new cn-btn-style-normal-new" @click="save" style="background-color: #0091ff;color:#DCDFE6">
          <span class="top-tool-btn-txt top-tool-btn-save">{{$t('overall.save')}}</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { storageKey } from '@/utils/constants'
export default {
  props: {
    customTableTitle: Array, // 自定义的title
    originalTableTitle: Array, // 原始title
    tableId: String,
    allowedAll: { default: false }
  },
  data () {
    return {
      custom: []
    }
  },
  created () {
    const localStorageTitle = JSON.parse(localStorage.getItem(storageKey.tableTitle + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId))
    if (localStorageTitle) {
      localStorage.setItem(storageKey.tableTitle + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId, JSON.stringify(localStorageTitle))
    }
  },
  watch: {
    customTableTitle: {
      immediate: true,
      deep: true,
      handler (n) {
        this.custom = JSON.parse(JSON.stringify(n))
      }
    }
  },
  methods: {
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
    save () {
      this.$emit('update', this.custom)
      localStorage.setItem(storageKey.tableTitle + '-' + localStorage.getItem(storageKey.username) + '-' + this.tableId,
        JSON.stringify(this.custom))
      this.esc()
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
