<template>
    <div v-ele-click-outside="changeDropdown" style="position: relative" class="date-range-box">
        <div @click="showDropdown" class="date-range-text">
            <div class="calendar-popover-text"><i class="cn-icon cn-icon-add"></i></div>
            <div class="calendar-popover-text" style="display: flex" v-if="isCustom">
                <div class="calendar-popover-text">{{dayJs.tz(startTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
                <div class="calendar-popover-text"> - </div>
                <div class="calendar-popover-text">{{dayJs.tz(endTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
            </div>
            <div class="calendar-popover-text" v-else>
                {{dateRangeArr.find(item=>item.value === dateRangeValue).name}}
            </div>
            <div class="calendar-popover-text"><i class="cn-icon cn-icon-add"></i></div>
        </div>
        <transition name="el-zoom-in-top">
            <div v-if="dropdownFlag" class="date-range-panel">
            <el-row class="date-range-panel-top" style="position: relative">
                <el-col :span="16">
                    <MyDatePicker
                            :clearable='false'
                            :editable='false'
                            v-model="timeArr"
                            type="datetimerange"
                            ref="myDatePicker"
                            :popper-class="'myDatePicker'"
                            class="panel-time-picker-hidden"
                            :size="'small'"
                            :align="'left'"
                            placement="left-start"
                            style="position: absolute"
                            @change="timeArrChange"
                    />
                    From
                    <div @click="myDatePickerShow">{{dayJs.tz(myStartTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
                    To
                    <div @click="myDatePickerShow">{{dayJs.tz(myEndTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
                    <el-button @click="timeRange" type="primary">Apply time range</el-button>
                </el-col>
                <el-col :span="8">
                    <div>
                        <div>Relatime time ranges</div>
                        <ul class="date-range-item">
                            <li v-for="item in dateRangeArr" @click="quickChange(item.value)" :class="item.value==dateRangeValue?'active':''" :key="item.value">{{item.name}}</li>
                        </ul>
                    </div>
                </el-col>
            </el-row>
            <el-row class="date-range-panel-bottom">
                <el-col :span="12">{{address}}</el-col>
                <el-col :span="12">{{utcStr}}</el-col>
            </el-row>
        </div>
        </transition>
    </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
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
    const utc = localStorage.getItem('timezone-offset')
    const dateRangeValue = ref(60)
    const isCustom = ref(false)
    const dateRangeArr = ref([
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
    ])
    console.log(utc)
    const dropdownFlag = ref(false)
    // computed
    const utcStr = computed(() => {
      let str = 'UTC'
      if (utc < 0) {
        str += '-'
      } else {
        str += '+'
      }
      const abs = Math.abs(utc)
      if (abs > 10) {
        str += abs + ''
      } else {
        str += '0' + (abs + '')
      }
      str += ':00'
      return str
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
      console.log(123123123)
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
      console.log(val)
      myStartTime.value = val[0]
      myEndTime.value = val[1]
    }
    const timeRange = () => {
      isCustom.value = true
      returnValue()
    }
    const quickChange = (value) => {
      isCustom.value = false
      myEndTime.value = window.$dayJs.tz().valueOf()
      myStartTime.value = myEndTime.value - value * 60 * 1000
      dateRangeValue.value = value
      returnValue()
    }
    const returnValue = () => {
      ctx.emit('change', myStartTime.value, myEndTime.value, dateRangeValue)
      dropdownFlag.value = false
    }
    // watch
    watch(myStartTime, (newValue, oldValue) => {
      console.log('The new counter value is: ' + myStartTime.value)
      console.log('The new counter value is: ' + myEndTime.value)
    })
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
      myDatePickerShow,
      showDropdown,
      changeDropdown,
      timeArrChange,
      returnValue,
      quickChange,
      timeRange
    }
  }
}
</script>

<style scoped lang="scss">
.date-range-box{
    font-size: 14px;
}
.date-range-item{
    list-style-type:none;
}
/deep/ .panel-time-picker-hidden{
    visibility: hidden !important;
    position: absolute;
    top: 0;
    left: 0;
}
.date-range-text{
    font-size: 14px;
    min-width:150px;
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 0 10px;
    display: flex;
    justify-content: space-around;
    height: 26px;
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    box-shadow: 0 2px 4px 0 rgba(51,51,51,0.02);
    border-radius: 2px;
    line-height: 26px;
    .cn-icon{
        font-size: 14px;
    }
}
.calendar-popover-text{
    white-space: nowrap;
    display: inline-block;
    margin: 0 5px;
}
.calendar-popover-text:first-of-type{
    margin-left: 0;
}
.calendar-popover-text:last-of-type{
    margin-right: 0;
}
.date-range-panel{
    height: 410px;
    width: 476px;
    background: #FFFFFF;
    box-shadow: 0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05);
    position: absolute;
    right: 0;
    z-index: 1;
}
.date-range-panel-top{
    height: 364px;
}
.date-range-panel-bottom{
    height: 44px;
    line-height: 44px;
}
</style>
