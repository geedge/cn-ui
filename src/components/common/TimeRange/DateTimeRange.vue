<template>
  <div v-ele-click-outside="changeDropdown" style="position: relative;" class="date-range-box">
    <div @click="showDropdown" class="date-range-text" :class="myClass" :style="style">
      <div class="calendar-popover-text"><i class="cn-icon cn-icon-Data"></i></div>
      <div class="calendar-popover-text" style="display: flex" v-if="isCustom" :title="`${dateFormatByAppearance(getMillisecond(startTime))} -${dateFormatByAppearance(getMillisecond(endTime))}`">
        <div class="calendar-popover-text" :style="showPosition === 'left' ? 'width: 90px;text-overflow: ellipsis;overflow: hidden;' : ''" >{{ dateFormatByAppearance(getMillisecond(startTime)) }}</div>
        <div class="calendar-popover-text" :style="showPosition === 'left' ? 'display:none;' : ''"> -</div>
        <div class="calendar-popover-text" :style="showPosition === 'left' ? 'display:none;' : ''">{{ dateFormatByAppearance(getMillisecond(endTime)) }}</div>
      </div>
      <div class="calendar-popover-text" v-else>
        {{ showDetail }}
      </div>
      <div class="calendar-popover-text calendar-popover__small">
        <i class="cn-icon cn-icon-dropdown" :class="dropdownFlag ? 'cn-icon-up' : ''"></i>
      </div>
    </div>
    <transition name="el-zoom-in-top" style="z-index: 100004;">
      <div v-if="dropdownFlag" class="date-range-panel" :style="showPosition === 'left' ? leftStyle : rightStyle">
        <el-row class="date-range-panel-top" style="position: relative">
          <el-col :span="16" class="date-range-panel-content date-range-panel-content-left">
            <div class="date-range-title" style="padding-left: 0">{{$t('dateTime.absoluteTimeRange')}}</div>
            <el-config-provider :locale="locale">
              <el-date-picker
                      v-model="newDateValue"
                      :key="keyValue"
                      ref="newDatePicker"
                      popper-class="my-date-picker"
                      :style="showPosition === 'left' ? datePickerLeftStyle : datePickerRightStyle"
                      :clearable="false"
                      :default-time="defaultTime"
                      :unlink-panels="true"
                      type="datetimerange"
                      @blur="datePickerVisibleChange"
                      @change="timeArrChange"
              />
            </el-config-provider>
            <div class="content-title">{{$t('dateTime.from')}}</div>
            <div @click="myDatePickerShow" tabindex="1" class="content-input">
              {{ dateFormatByAppearance(getMillisecond(myStartTime)) }}
            </div>
            <div class="content-title">{{$t('dateTime.to')}}</div>
            <div @click="myDatePickerShow" tabindex="2" class="content-input">
              {{ dateFormatByAppearance(getMillisecond(myEndTime)) }}
            </div>

            <div class="date-range-title" style="padding-left: 0">{{$t('dateTime.recentlyUsedRanges')}}</div>
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
            <div class="date-range-title">{{$t('dateTime.relativeTimeRanges')}}</div>
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
        <el-row class="date-range-panel-bottom" >
          <el-col :span="12">{{ address }}</el-col>
          <el-col :span="12" class="utc-str">{{ utcStr }}</el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, watch, reactive } from 'vue'
import { EN, storageKey, ZH } from '@/utils/constants'
import { getMillisecond, millTimestampDiffFromTz, timestampToList } from '@/utils/date-util'
import { useStore } from 'vuex'
import ElConfigProvider from 'element-plus'
import cn from 'element-plus/lib/locale/lang/zh-cn'
import en from 'element-plus/lib/locale/lang/en'

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
    },
    class: {
      type: String
    },
    style: {
      type: String
    },
    showPosition: {
      type: String,
      default: 'right'
    }
  },
  emits: ['change'],
  data () {
    return {
      dateRangeArr: [
        { value: 5, name: this.$t('dateTime.last5Mins') }, // 'last 5 mins'
        { value: 15, name: this.$t('dateTime.last15Mins') },
        { value: 30, name: this.$t('dateTime.last30Mins') },
        { value: 60, name: this.$t('dateTime.last1Hour') }, // dateTime.last1Hour
        { value: 180, name: this.$t('dateTime.last3Hours') },
        { value: 360, name: this.$t('dateTime.last6Hours') },
        { value: 720, name: this.$t('dateTime.last12Hours') },
        { value: 1440, name: this.$t('dateTime.last1Day') }, // dateTime.last2Days
        { value: 2880, name: this.$t('dateTime.last2Days') }
      ]
    }
  },
  computed: {
    showDetail () {
      let str = ''
      if (this.dateRangeValue !== -1) {
        const rangeItem = this.dateRangeArr.find(item => item.value === this.dateRangeValue)
        str = rangeItem ? rangeItem.name : this.dateRangeArr[0].name
      }
      return str
    }
  },
  methods: {
    /**
     * 时间选择器失去焦点之后就会隐藏，此时，Left展示类型的，就需要重新设置下拉框的位置
     */
    datePickerVisibleChange () {
      if (this.showPosition === 'left') {
        this.leftStyle = this.leftStyleBefore
        // this.dropdownFlag = true
      }
    }
  },
  setup (props, ctx) {
    // data
    const store = useStore()
    const myStartTime = ref(props.startTime)
    const myEndTime = ref(props.endTime)
    const myClass = ref(props.class)
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
    const dropdownFlag = ref(false)
    // 默认日历选择时间，即开始时间YYYY-MM-DD 00:00:00,结束时间YYYY-MM-DD 59:59:59
    const defaultTime = ref([
      new Date(2023, 1, 1, 0, 0, 0),
      new Date(2023, 1, 2, 23, 59, 59)
    ])
    const rightStyle = 'position: absolute;top: 32px;right: 0px;'
    const leftStyleBefore = 'position: absolute;top: 32px;left: 0px;'
    const leftStyleAfter = 'position: absolute;top: 32px;left: 660px;'
    const datePickerRightStyle = 'position: absolute;top: -53px;left: -536px;'
    const datePickerLeftStyle = 'position: absolute;top: -53px;left: -536px;'
    const leftStyle = ref('position: absolute;top: 32px;left: 0px;')
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
    const rangeHistoryArr = rangeHistory

    // refs
    const newDatePicker = ref(null)

    // echarts框选时间范围
    const rangeEchartsData = reactive({
      value: computed(() => store.state.panel.rangeEchartsData)
    })

    watch(() => rangeEchartsData.value, (newVal) => {
      if (newVal) {
        myStartTime.value = getMillisecond(newVal.startTime)
        myEndTime.value = getMillisecond(newVal.endTime)
        isCustom.value = true
        dateRangeValue.value = -1
        returnValue()
      }
    })

    /**
     * 监测下拉框，一旦隐藏，则设置其位置靠最左边
     * */
    watch(() => dropdownFlag.value, (newVal) => {
      if (!newVal) {
        if (props.showPosition === 'left') {
          leftStyle.value = leftStyleBefore
        }
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
    }
    /**
     * 打开时间选择器，从时间面板的“开始时间”、“结束时间”调用
     */
    const myDatePickerShow = () => {
      if (props.showPosition === 'left') {
        leftStyle.value = leftStyleAfter
      }
      newDateValue.value = [
        new Date(...timestampToList(myStartTime.value)),
        new Date(...timestampToList(myEndTime.value))
      ]
      newDatePicker.value.focus()
    }
    /**
     * 时间选择器，选择时间，点击OK后的回调
     * @param val，开始/结束时间数组
     */
    const timeArrChange = (val) => {
      // 按服务器时区修正时间戳
      myStartTime.value = getMillisecond(val[0]) + millTimestampDiffFromTz()
      myEndTime.value = getMillisecond(val[1]) + millTimestampDiffFromTz()
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
      store.commit('setTimeFilter', { startTime: myStartTime.value, endTime: myEndTime.value, range: dateRangeValue.value })
      cancelHttp()
      if (rangeHistory.value[0]) {
        const d = rangeHistory.value[0]
        if (d.start !== myStartTime.value || d.end !== myEndTime.value) {
          rangeHistory.value.unshift({
            start: myStartTime.value,
            end: myEndTime.value
          })
        }
      }
      if (!rangeHistory.value[0]) {
        rangeHistory.value.unshift({
          start: myStartTime.value,
          end: myEndTime.value
        })
      }

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
    const language = localStorage.getItem(storageKey.language) || EN // 初始未选择默认 en 英文
    let locale = en
    if (language === ZH) {
      locale = cn
    }

    const keyValue = window.$dayJs.tz().valueOf()

    return {
      myStartTime,
      myEndTime,
      myClass,
      dropdownFlag,
      utcStr,
      rangeEchartsData,
      address,
      defaultTime,
      dateRangeValue,
      isCustom,
      newDateValue,
      newDatePicker,
      rangeHistory,
      rangeHistoryArr,
      getMillisecond,
      datePickerLeftStyle,
      datePickerRightStyle,
      leftStyle,
      leftStyleBefore,
      rightStyle,
      keyValue,
      myDatePickerShow,
      showDropdown,
      changeDropdown,
      timeArrChange,
      returnValue,
      quickChange,
      historyChange,
      locale
    }
  }
}
</script>
