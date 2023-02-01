<template>
  <div v-ele-click-outside="changeDropdown" style="position: relative;z-index: 1" class="date-range-box">
    <div @click="showDropdown" class="date-range-text">
      <div class="calendar-popover-text"><i class="cn-icon cn-icon-Data"></i></div>
      <div class="calendar-popover-text" style="display: flex" v-if="isCustom">
        <div class="calendar-popover-text">{{ dateFormatByAppearance(getMillisecond(startTime)) }}</div>
        <div class="calendar-popover-text"> -</div>
        <div class="calendar-popover-text">{{ dateFormatByAppearance(getMillisecond(endTime)) }}</div>
      </div>
      <div class="calendar-popover-text" v-else>
        {{ showDetail }}
      </div>
      <div class="calendar-popover-text calendar-popover__small">
        <i class="cn-icon cn-icon-dropdown" :class="dropdownFlag ? 'cn-icon-up' : ''"></i>
      </div>
    </div>
    <transition name="el-zoom-in-top">
      <div v-if="dropdownFlag" class="date-range-panel">
        <el-row class="date-range-panel-top" style="position: relative">
          <el-col :span="16" class="date-range-panel-content date-range-panel-content-left">
            <div class="date-range-title" style="padding-left: 0">Absolute time range</div>
            <el-date-picker
                v-model="newDateValue"
                ref="newDatePicker"
                class="date_style"
                style="position: absolute;top: -53px;left: -536px;"
                :clearable="false"
                :default-time="defaultTime"
                type="datetimerange"
                @change="timeArrChange"
            />
            <div class="content-title">From</div>
            <div @click="myDatePickerShow" tabindex="1" class="content-input">
              {{ dateFormatByAppearance(getMillisecond(myStartTime)) }}
            </div>
            <div class="content-title">To</div>
            <div @click="myDatePickerShow" tabindex="2" class="content-input">
              {{ dateFormatByAppearance(getMillisecond(myEndTime)) }}
            </div>

            <div class="date-range-title" style="padding-left: 0">Recently used absolute ranges</div>
            <div class="date-range-history">
              <div v-for="(item, index) in rangeHistoryArr" :key="index" class="date-range-history-item"
                   @click="historyChange(item)">
                {{ dateFormatByAppearance(item.start) }}
                —
                {{ dateFormatByAppearance(item.end) }}
              </div>
            </div>
          </el-col>
          <el-col
              :span="8"
              class="date-range-panel-content date-range-panel-content-right"
              style="border-left: 1px solid rgba(0,0,0,0.09);">
            <div class="date-range-title">Relatime time ranges</div>
            <ul class="date-range-item">
              <li v-for="item in dateRangeArr"
                  @click="quickChange(item.value)"
                  :class="(item.value===dateRangeValue.value || item.value===dateRangeValue)?'active':''"
                  :key="item.value">
                <span style="position: relative">
                    {{ item.name }}
                    <i v-if="(item.value===dateRangeValue.value || item.value===dateRangeValue)"
                       class="cn-icon cn-icon-check"></i>
                </span>
              </li>
            </ul>
          </el-col>
        </el-row>
        <el-row class="date-range-panel-bottom">
          <el-col :span="12">{{ address }}</el-col>
          <el-col :span="12" class="utc-str">{{ utcStr }}</el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, watch, reactive } from 'vue'
import { storageKey } from '@/utils/constants'
import { getMillisecond, timestampToList } from '@/utils/date-util'
import { useStore } from 'vuex'

export default {
  name: 'DateTimeRange',
  props: {
    startTime: {
      type: Number,
      default: window.$dayJs.tz().valueOf() - 60 * 60 * 1000
    },
    endTime: {
      type: Number,
      default: window.$dayJs.tz().valueOf()
    },
    dateRange: {
      type: Number
    }
  },
  emits: ['change'],
  setup (props, ctx) {
    // data
    const store = useStore()
    const myStartTime = ref(props.startTime)
    const myEndTime = ref(props.endTime)
    // 时间选择器绑定的值
    const newDateValue = ref([
      new Date(...timestampToList(myStartTime.value)),
      new Date(...timestampToList(myEndTime.value))
    ])
    // 时区地址
    const address = localStorage.getItem(storageKey.sysTimezone)
    // 当前所在时区
    const utc = localStorage.getItem(storageKey.timezoneOffset)
    // 历史选择时间
    const rangeHistory = ref(localStorage.getItem(storageKey.dataRangeHistory) ? JSON.parse(localStorage.getItem(storageKey.dataRangeHistory)) : [])
    const dateRangeValue = props.dateRange ? ref(props.dateRange) : ref(60)
    const isCustom = ref(dateRangeValue.value === -1)
    const dateRangeArr = [
      { value: 5, name: 'last 5 Min' },
      { value: 15, name: 'last 15 Min' },
      { value: 30, name: 'last 30 Min' },
      { value: 60, name: 'last 1 hour' },
      { value: 180, name: 'last 3 hour' },
      { value: 360, name: 'last 6 hour' },
      { value: 720, name: 'last 12 hour' },
      { value: 1440, name: 'last 1 days' },
      { value: 2880, name: 'last 2 days' }
    ]
    const dropdownFlag = ref(false)
    // 默认日历选择时间，即开始时间YYYY-MM-DD 00:00:00,结束时间YYYY-MM-DD 59:59:59
    const defaultTime = ref([
      new Date(2023, 1, 1, 0, 0, 0),
      new Date(2023, 1, 2, 23, 59, 59)
    ])

    // computed
    const utcStr = computed(() => {
      let str = 'UTC '
      if (utc < 0) {
        str += '- '
      } else {
        str += '+ '
      }
      const abs = Math.abs(utc)
      if (abs > 10) {
        str += abs + ''
      } else {
        str += '0' + (abs + '')
      }
      str += ':00 '
      return str
    })
    const showDetail = computed(() => {
      let str = ''
      if (dateRangeValue.value !== -1) {
        str = dateRangeArr.find(item => item.value === dateRangeValue.value).name
      }
      return str
    })
    const rangeHistoryArr = rangeHistory

    // refs
    const newDatePicker = ref(null)

    // echarts框选时间范围
    const rangeEchartsData = reactive({
      value: computed(() => store.state.panel.rangeEchartsData)
    })

    watch(() => rangeEchartsData.value, (newVal, oldVal) => {
      if (newVal) {
        myStartTime.value = getMillisecond(newVal.startTime)
        myEndTime.value = getMillisecond(newVal.endTime)
        isCustom.value = true
        dateRangeValue.value = -1
        returnValue()
      }
    })

    // methods
    /**
     * 打开/关闭时间面板
     */
    const showDropdown = () => {
      dropdownFlag.value = !dropdownFlag.value
      if (dropdownFlag.value) {
        myStartTime.value = props.startTime
        myEndTime.value = props.endTime
      }
    }
    /**
     * 点击空白处隐藏时间面板
     */
    const changeDropdown = () => {
      if (dropdownFlag.value) {
        dropdownFlag.value = false
      }
      if (dropdownFlag.value) {
        dropdownFlag.value = false
      }
    }
    /**
     * 打开时间选择器，从时间面板的“开始时间”、“结束时间”调用
     */
    const myDatePickerShow = () => {
      newDateValue.value = [
        new Date(...timestampToList(myStartTime.value)),
        new Date(...timestampToList(myEndTime.value))
      ]
      newDatePicker.value.focus()

      // todo 此处为弹窗打开的方向标识，控制css的position修改其left与top属性未生效，只好隐藏，后续有更好的处理办法再修改
      const dom = document.getElementsByClassName('el-picker__popper el-popper is-light is-pure')
      const dom1 = dom[0].getElementsByClassName('el-popper__arrow')
      dom1[0].style.display = 'none'
    }
    /**
     * 时间选择器，选择时间，点击OK后的回调
     * @param val，开始/结束时间数组
     */
    const timeArrChange = (val) => {
      myStartTime.value = getMillisecond(val[0])
      myEndTime.value = getMillisecond(val[1])
      isCustom.value = true
      dateRangeValue.value = -1
      returnValue()
    }
    /**
     * 历史时间列表中点击一项，对时间进行赋值
     * @param item
     */
    const historyChange = (item) => {
      myStartTime.value = item.start
      myEndTime.value = item.end
      isCustom.value = true
      dateRangeValue.value = -1
      returnValue()
    }
    const quickChange = (value) => {
      dateRangeValue.value = value
      isCustom.value = false
      myEndTime.value = window.$dayJs.tz().valueOf()
      myStartTime.value = myEndTime.value - value * 60 * 1000
      returnValue()
    }
    /**
     * 重置时间，将时间存入缓存，并触发方法请求接口刷新界面
     */
    const returnValue = () => {
      cancelHttp()
      rangeHistory.value.unshift({
        start: myStartTime.value,
        end: myEndTime.value
      })
      if (rangeHistory.value.length > 4) {
        rangeHistory.value.splice(4, rangeHistory.value.length - 1)
      }
      localStorage.setItem(storageKey.dataRangeHistory, JSON.stringify(rangeHistory.value))
      ctx.emit('change', myStartTime.value, myEndTime.value, dateRangeValue)
      dropdownFlag.value = false
    }
    /**
     * 终止http请求
     */
    const cancelHttp = () => {
      const cancelList = store.state.panel.httpCancel
      if (cancelList.length > 0) {
        cancelList.forEach((cancel, index) => {
          cancel()
          delete cancelList[index]
        })
      }
    }
    return {
      myStartTime,
      myEndTime,
      dropdownFlag,
      utcStr,
      rangeEchartsData,
      address,
      dateRangeArr,
      defaultTime,
      dateRangeValue,
      isCustom,
      newDateValue,
      newDatePicker,
      showDetail,
      rangeHistory,
      rangeHistoryArr,
      getMillisecond,
      myDatePickerShow,
      showDropdown,
      changeDropdown,
      timeArrChange,
      returnValue,
      quickChange,
      historyChange
    }
  }
}
</script>
