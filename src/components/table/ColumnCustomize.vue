<template>
  <div class="pop-custom">
    <div class="pop-title">{{$t('overall.select')}}</div>
    <div class="pop-box custom-labels">
      <div style="height: 100%; overflow: auto;">
        <!--NotSet 为true不可设置-->
        <div
          v-for="(item,index) in custom"
          :key="index"
          class="custom-label"
          @click="handler(item,index)"
          :id="'element-set-el-'+index"
        >
          <i class="nz-icon nz-icon-check" v-if="!allowedAll && !item.allowed && (index === 0 || index === 1 || item.visibility === 'disabled')"></i>
          <i v-else class="nz-icon nz-icon-check" v-show="item.show"></i>
          <span>{{item.label}}</span>
        </div>

      </div>
    </div>
    <div class="custom-bottom-btns">
      <button v-if="isCancel" :id="tableId+'-element-set-none'" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new is-cancel" type="button" @click="batchHandler(false)">
        <span class="top-tool-btn-txt">{{$t('overall.clear')}}</span>
      </button>
      <button v-if="!isCancel" :id="tableId+'-element-set-all'" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new" type="button" @click="batchHandler(true)">
        <span class="top-tool-btn-txt">{{$t('overall.all')}}</span>
      </button>
      <div>
        <button :id="tableId+'-element-set-esc'" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new" type="button" @click="esc">
          <span class="top-tool-btn-txt">{{$t('overall.esc')}}</span>
        </button>
        <button :id="tableId+'-element-set-save'" class="nz-btn nz-btn-size-small-new nz-btn-style-normal-new" type="button" @click="save">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
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
    const localStorageTitle = JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId))
    if (localStorageTitle) {
      localStorage.setItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId, JSON.stringify(localStorageTitle))
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
      } else {
        this.custom[index].show = !this.custom[index].show
      }
    },
    // 点击第二个cancel
    save () {
      this.$emit('update', this.custom)
      localStorage.setItem(
        'nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId,
        JSON.stringify(this.custom)
      )
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

<style lang="scss">
.pop-custom {
  padding: 0 12px 12px 12px;
  border: 1px solid #EBEEF5;
  position: absolute;
  top: 55px;
  right: 20px;
  width: 200px;
  color: #606266;
  background: #fff;
  border-radius: 4px;
  z-index: 999999;
}
.pop-custom-explore {
  top: 33px;
}
.relative-position .pop-custom {
  top: 33px;
}
.custom-labels {
  margin-top: 12px;
  width: 100%;
  height: 300px;
}
.custom-labels i {
  color: #04b330;
  font-size: 14px;
  position: absolute;
  left: 5px;
  top: 6px;
}
.custom-label {
  padding: 2px 0 2px 25px;
  position: relative;
  cursor: default;
  font-size: 14px;
}
.custom-title{
  padding: 2px 0 2px 2px;
}
.custom-label-disabled {
  cursor: not-allowed;
  background: #f1f3f4;
  opacity: 0.7;
}
.custom-bottom-btns {
  margin-top: 7px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.unshow {
  display: none;
}
</style>
