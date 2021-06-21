<template>
    <div v-click-outside="{object: {a:1}, func: changeDropdown}">
        <el-row @click="showDropdown">
            <el-col :span="10" class="calendar-popover-text">{{dayJs.tz(startTime).format('YYYY-MM-DD HH:mm:ss')}}</el-col>
            <el-col :span="4"> = </el-col>
            <el-col :span="10" class="calendar-popover-text">{{dayJs.tz(endTime).format('YYYY-MM-DD HH:mm:ss')}}</el-col>
        </el-row>
        <div v-if="dropdownFlag" >
            123123123123123123
        </div>
    </div>
</template>

<script>
import { ref, watch } from 'vue'
import MyDatePicker from '../MyDatePicker'
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
    }
  },
  emits: ['change'],
  components: {
    MyDatePicker
  },
  setup (props, ctx) {
    // data
    const myStartTime = ref(props.startTime)
    const dropdownFlag = ref(false)
    // methods
    const showDropdown = () => {
      dropdownFlag.value = !dropdownFlag.value
    }
    const changeDropdown = () => {
      console.log(123123123)
      if (dropdownFlag.value){
        dropdownFlag.value = false
      }
    }
    watch(myStartTime, (newValue, oldValue) => {
      console.log('The new counter value is: ' + myStartTime.value)
    })
    return {
      myStartTime,
      dropdownFlag,
      showDropdown,
      changeDropdown
    }
  }
}
</script>

<style scoped>

</style>
