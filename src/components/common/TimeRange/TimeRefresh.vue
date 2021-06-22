<template>
    <div class="cn-refresh-box" v-ele-click-outside="dropdownShowFalse">
        <span>
            <el-button-group size="mini">
              <el-button size="mini" @click="$emit('change')"><i class="cn-icon cn-icon-refresh"></i></el-button>
              <el-button size="mini" @click="showRefreshList">
                  {{interLabel}}
                  <i class="cn-icon cn-icon-dropdown" :class="dropdownShow?'active' : ''"></i>
              </el-button>
            </el-button-group>
        </span>
        <transition name="el-zoom-in-top">
            <div v-if="dropdownShow" class="refresh-list">
                <div v-for="(item, index) in refreshArr" :key="index" @click="setRefresh(item)" class="refresh-list-item" :class="item.value==interval ? 'active' : ''">
                    {{item.label}}
                    <i v-if="item.value==interval" class="cn-icon cn-icon-check"></i>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
// import { ref } from 'vue'
export default {
  name: 'TimeRefresh',
  props: {
    endTime: {
      type: Number
    }
  },
  data () {
    return {
      searchTime: [],
      lastRefreshTime: '',
      intervalTimer: null,
      interval: -1,
      unit: 2,
      dropdownShow: false,
      interLabel: '',
      refreshArr: [
        { value: -1, label: 'off' },
        { value: 30, label: '30s' },
        { value: 60, label: '1m' },
        { value: 300, label: '5m' },
        { value: 900, label: '15m' },
        { value: 1800, label: '30m' }
      ]
    }
  },
  setup (props, ctx) {

  },
  methods: {
    setRefresh (val) {
      this.interval = val.value
      this.interLabel = val.value == -1 ? '' : val.label
      this.dropdownShow = false
      const now = window.$dayJs.tz().valueOf()
      if (val && val.value != -1) {
        // 设置定时器
        this.intervalTimer = setInterval(() => {
          this.$emit('change')
        }, val.value * 1000)
        // 设置定时器 比上次刷新间隔大于30s 立马刷新一次
        if ((now - this.endTime) / 1000 > 30) {
          this.$emit('change')
        }
        return
      }
      if (val && val.value == -1) {
        // 清除定时器
        clearInterval(this.intervalTimer)
      }
    },
    showRefreshList () {
      this.dropdownShow = !this.dropdownShow
    },
    dropdownShowFalse () {
      this.dropdownShow = false
    }
  }
}
</script>

<style scoped lang="scss">
.cn-refresh-box{
    position: relative;
    font-size: 14px;
    .cn-icon-refresh{
        font-size: 14px;
    }
    .cn-icon-dropdown{
        font-size: 14px;
        transition: all .3s;
        display: inline-block;
    }
    .cn-icon-dropdown.active{
       transform: rotate(180deg);
    }
    .refresh-list{
        position: absolute;
        z-index: 1;
        background: #FFFFFF;
        box-shadow: -1px 1px 10px -1px rgba(205,205,205,0.77);
        border-radius: 2px;
        top: 30px;
        right: 0;
        .refresh-list-item{
            width: 82px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: #333333;
            font-weight: 400;
            font-family: Roboto-Regular;
            padding: 0 10px;
            cursor: pointer;
            position: relative;
            padding: 8px 0 8px 12px;
        }
        .refresh-list-item.active{
            background: #F2F9FF;
            color: #0091FF;
            font-weight: 400;
            .cn-icon-check{
                color: #0091FF;
                position: absolute;
                right: 7px;
            }
        }
        .refresh-list-item:hover{
            background: #F2F9FF;
            color: #0091FF;
        }
    }
}
/deep/ .el-button--mini{
    padding: 4px 6px !important;
    min-height: 26px !important;
}
</style>
