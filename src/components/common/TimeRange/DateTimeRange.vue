<template>
  <div v-ele-click-outside="changeDropdown" style="position: relative" class="date-range-box">
    <div @click="showDropdown" class="date-range-text">
      <div class="calendar-popover-text"><i class="cn-icon cn-icon-time"></i></div>
      <div class="calendar-popover-text" style="display: flex" v-if="isCustom">
        <div class="calendar-popover-text">{{ dayJs.tz(startTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
        <div class="calendar-popover-text"> -</div>
        <div class="calendar-popover-text">{{ dayJs.tz(endTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
      </div>
      <div class="calendar-popover-text" v-else>
        {{ showDetail }}
      </div>
      <div class="calendar-popover-text"><i class="cn-icon cn-icon-arrow-down"
                                            :class="dropdownFlag ? 'cn-icon-arrow-down-active' : ''"></i></div>
    </div>
    <transition name="el-zoom-in-top">
      <div v-if="dropdownFlag" class="date-range-panel">
        <el-row class="date-range-panel-top" style="position: relative">
          <el-col :span="16" class="date-range-panel-content date-range-panel-content-left">
            <div class="date-range-title" style="padding-left: 0">Absolute time range</div>
            <MyDatePicker
                :clearable='false'
                :editable='false'
                v-model="timeArr"
                type="datetimerange"
                ref="myDatePicker"
                :popper-class="'myDatePicker'"
                class="panel-time-picker-hidden"
                :size="'small'"
                placement="left-start"
                style="position: absolute"
                @change="timeArrChange"
            />
            <div class="content-title">From</div>
            <div @click="myDatePickerShow" tabindex="1" class="content-input">
              {{ dayJs.tz(myStartTime).format('YYYY-MM-DD HH:mm:ss') }}
            </div>
            <div class="content-title">To</div>
            <div @click="myDatePickerShow" tabindex="2" class="content-input">
              {{ dayJs.tz(myEndTime).format('YYYY-MM-DD HH:mm:ss') }}
            </div>
            <div>
              <el-button @click="timeRange" type="primary" size="mini">Apply time range</el-button>
            </div>
            <div class="date-range-title" style="padding-left: 0">Recently used absolute ranges</div>
            <div class="date-range-history">
              <div v-for="(item, index) in rangeHistoryArr" :key="index" class="date-range-history-item"
                   @click="historyChange(item)">
                {{ dayJs.tz(item.start).format('YYYY-MM-DD HH:mm:ss') }}
                —
                {{ dayJs.tz(item.end).format('YYYY-MM-DD HH:mm:ss') }}
              </div>
            </div>
          </el-col>
          <el-col :span="8" class="date-range-panel-content date-range-panel-content-right"
                  style="border-left: 1px solid rgba(0,0,0,0.09);">
            <div class="date-range-title">Relatime time ranges</div>
            <ul class="date-range-item">
              <li v-for="item in dateRangeArr" @click="quickChange(item.value)"
                  :class="(item.value==dateRangeValue.value || item.value==dateRangeValue)?'active':''"
                  :key="item.value">
                            <span style="position: relative">
                                {{ item.name }}
                                <i v-if="(item.value==dateRangeValue.value || item.value==dateRangeValue)"
                                   class="cn-icon cn-icon-check"></i>
                            </span>
              </li>
            </ul>
          </el-col>
        </el-row>
        <el-row class="date-range-panel-bottom" style="">
          <el-col :span="12">{{ address }}</el-col>
          <el-col :span="12" class="utc-str">{{ utcStr }}</el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import MyDatePicker from '../MyDatePicker'

export default {
  name: 'DateTimeRange',
  props: {
    startTime: {
      type: Number,
      default: window.$dayJs.tz().valueOf() - 1 * 60 * 60 * 1000
    },
    endTime: {
      type: Number,
      default: window.$dayJs.tz().valueOf()
    }
    /* useRefresh: {
      type: Boolean,
      default: true
    },
    useDateRange: {
      type: Boolean,
      default: true
    } */
  },
  emits: ['change'],
  components: {
    MyDatePicker
  },
  setup (props, ctx) {
    // data
    const myStartTime = ref(props.startTime)
    const myEndTime = ref(props.endTime)
    const timeArr = ref([myStartTime.value, myEndTime.value])
    const address = localStorage.getItem('cn-sys-timezone')
    const utc = localStorage.getItem('cn-timezone-offset')
    const rangeHistory = ref(localStorage.getItem('date-range-history') ? JSON.parse(localStorage.getItem('date-range-history')) : [])
    const dateRangeValue = ref(60)
    dateRangeValue.value = 60
    const isCustom = ref(false)
    const dateRangeArr = [
      {
        value: 5,
        name: 'last 5 Min'
      },
      {
        value: 15,
        name: 'last 15 Min'
      },
      {
        value: 30,
        name: 'last 30 Min'
      },
      {
        value: 60,
        name: 'last 1 hour'
      },
      {
        value: 180,
        name: 'last 3 hour'
      },
      {
        value: 360,
        name: 'last 6 hour'
      },
      {
        value: 720,
        name: 'last 12 hour'
      },
      {
        value: 1440,
        name: 'last 1 days'
      },
      {
        value: 2880,
        name: 'last 2 days'
      }
    ]
    const dropdownFlag = ref(false)
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
    const rangeHistoryArr = computed(() => {
      return rangeHistory.value.slice(0, 4)
    })
    // refs
    const myDatePicker = ref(null)
    // methods
    const showDropdown = () => {
      dropdownFlag.value = !dropdownFlag.value
      if (dropdownFlag.value) {
        myStartTime.value = props.startTime
        myEndTime.value = props.endTime
        timeArr.value = [myStartTime.value, myEndTime.value]
      }
    }
    const changeDropdown = () => {
      if (dropdownFlag.value) {
        dropdownFlag.value = false
      }
      if (dropdownFlag.value) {
        dropdownFlag.value = false
      }
    }
    const myDatePickerShow = () => {
      myDatePicker.value.focus()
      myDatePicker.value.pickerVisible = true
    }
    const timeArrChange = (val) => {
      myStartTime.value = val[0]
      myEndTime.value = val[1]
    }
    const timeRange = () => {
      isCustom.value = true
      dateRangeValue.value = -1
      returnValue()
    }
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
    const returnValue = () => {
      rangeHistory.value.unshift({
        start: myStartTime.value,
        end: myEndTime.value
      })
      localStorage.setItem('date-range-history', JSON.stringify(rangeHistory.value))
      ctx.emit('change', myStartTime.value, myEndTime.value, dateRangeValue)
      dropdownFlag.value = false
    }
    return {
      myStartTime,
      myEndTime,
      dropdownFlag,
      utcStr,
      address,
      dateRangeArr,
      dateRangeValue,
      isCustom,
      timeArr,
      myDatePicker,
      showDetail,
      rangeHistory,
      rangeHistoryArr,
      myDatePickerShow,
      showDropdown,
      changeDropdown,
      timeArrChange,
      returnValue,
      quickChange,
      timeRange,
      historyChange
    }
  }
}
</script>

<style scoped lang="scss">
.date-range-box {
  font-size: 14px;
  border-radius: 2px;
  display: flex;

  .date-range-refresh {
    margin-left: 10px;
  }
}

.date-time-range {
  margin-right: 10px;
}

.date-range-item {
  list-style-type: none;
}

/deep/ .panel-time-picker-hidden {
  visibility: hidden !important;
  position: absolute;
  top: 0;
  left: 0;
}

.date-range-text {
  font-size: 14px;
  min-width: 150px;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: 0 10px;
  display: flex;
  justify-content: space-around;
  height: 26px;
  background: #FFFFFF;
  border: 1px solid #E7EAED;
  box-shadow: 0 2px 4px 0 rgba(51, 51, 51, 0.02);
  border-radius: 2px;
  line-height: 26px;
  transition: width .3s;

  .cn-icon {
    font-size: 14px;
  }

  .cn-icon-arrow-down {
    transition: all .3s;
    display: inline-block;
  }

  .cn-icon-arrow-down-active {
    transform: rotate(180deg);
  }
}

.date-range-title {
  font-size: 14px;
  color: #666666;
  font-weight: 600;
  padding: 14px 0px 7px 8px;
}

.calendar-popover-text {
  white-space: nowrap;
  display: inline-block;
  margin: 0 5px;
}

.calendar-popover-text:first-of-type {
  margin-left: 0;
}

.calendar-popover-text:last-of-type {
  margin-right: 0;
}

.date-range-panel {
  height: 410px;
  width: 500px;
  background: #FFFFFF;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  position: absolute;
  right: 0;
  top: 34px;
  z-index: 1;

  .date-range-panel-content-left {
    padding-left: 10px;
    display: flex;
    flex-direction: column;

    .content-title {
      font-size: 14px;
      color: #666666;
      font-weight: 400;
      margin-bottom: 12px;
    }

    .content-input {
      border: 1px solid #E7EAED;
      border-radius: 2px;
      width: 230px;
      padding: 0 8px;
      height: 30px;
      line-height: 30px;
      margin-bottom: 12px;
      outline: #169AFF;
    }

    .content-input:focus {
      border: 1px solid #169AFF;
    }

    .date-range-history {
      flex: 1;
      overflow-y: auto;

      .date-range-history-item {
        padding: 5px 0;
        cursor: pointer;
      }

      .date-range-history-item:hover {
        /*font-weight: 600;*/
        background: #f9f9f9;
      }
    }
  }

  .date-range-panel-content-right {
    display: flex;
    flex-direction: column;

    ul {
      flex: 1;
      padding: 0;
      display: flex;
      flex-direction: column;
      margin: 0;

      li {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: #333333;
        font-weight: 400;
        padding: 0 10px;
        cursor: pointer;
      }

      li.active {
        background: #F2F9FF;
        color: #0091FF;
        font-weight: 400;

        .cn-icon-check {
          color: #0091FF;
          position: absolute;
          right: 7px;
        }
      }

      li:hover {
        background: #F2F9FF;
        color: #0091FF;
      }
    }
  }
}

.date-range-panel-top {
  height: 364px;
}

.date-range-panel-bottom {
  height: 44px;
  line-height: 44px;
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;

  .utc-str {
    text-align: right;
  }
}
</style>
