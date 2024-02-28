<template>
  <div class="time-line">
    <div class="time-line-slider">
      <el-slider v-model="currentTime" @change="onChange" :show-tooltip="false" />
    </div>
    <div style="height: 10px"></div>
    <div class="time-line-container">
      <div v-for="(item, index) in timeLine" :key="index">
        <div v-if="item.showFlag">{{ item.date }}</div>
      </div>
      <div class="test-line" id="myLine" :style="`position: absolute;top: 9px;left: calc(${currentTime}% + 5.5px);`"></div>
    </div>
  </div>
</template>

<!--------------调用-------start-------------->
<!--<time-line :timeFilter="timeFilter" @change="onChange"></time-line>-->
<!--------------调用-------end-------------->

<script>
import { changeTimestampToTime } from '../../utils/tools'

export default {
  name: 'TimeLine',
  props: {
    timeFilter: {
      type: Object
    }
  },
  data () {
    return {
      currentTime: 99,
      timeLine: []
    }
  },
  watch: {
    timeFilter (n) {
      if (n) {
        this.getDate()
      }
    }
  },
  mounted () {
    this.getDate()
  },
  methods: {
    getDate () {
      const diff = (this.timeFilter.endTime - this.timeFilter.startTime) / 100
      const timeStep = (this.timeFilter.endTime - this.timeFilter.startTime) / 1000
      // const timeStep1 = (this.timeFilter.endTime - this.timeFilter.startTime) / (1000 * 60)

      const timeList = []
      let startTime = this.timeFilter.startTime
      for (let i = 0; i < 100; i++) {
        let time1 = changeTimestampToTime(startTime)
        time1 = time1.substring(0, time1.length - 3)
        const obj = { date: time1, timeStamp: new Date(time1).getTime(), showFlag: false }
        if (i > 0) {
          this.getTimeTamp(obj, timeList[timeList.length - 1], timeStep)
        }
        timeList.push(obj)
        startTime += diff
      }
      this.timeLine = timeList

      // const timeRange = []
      // for (let i = this.timeFilter.startTime; i <= this.timeFilter.endTime; i += 5 * 60 * 1000) {
      //   const time = this.formatTime(i)
      //   timeRange.push({ date: time, stamp: this.timeFilter.startTime + i, showFlag: true })
      // }
      //
      // this.timeLine = timeRange
    },
    formatTime (timestamp) {
      const date = new Date(timestamp)
      const minute = date.getMinutes()
      const remainder = minute % 5
      if (remainder === 0) {
        return `${date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours()}:${minute < 10 ? ('0' + minute) : minute}`
      } else {
        let roundedMinute = minute - remainder + 5
        let roundedHour = date.getHours()
        if (roundedMinute === 60) {
          roundedMinute = 0
          roundedHour = roundedHour + 1
        }
        return `${roundedHour < 10 ? ('0' + roundedHour) : roundedHour}:${roundedMinute < 10 ? ('0' + roundedMinute) : roundedMinute}`
      }
    },
    getTimeTamp (obj, obj1, step) {
      // 时间间隔（基本保证时间轴上显示12个间隔）：
      // 15分钟以下1分钟，30分钟--2分钟，1小时--5分钟，3小时--20分钟，6小时--30分钟，1天--1小时，2天--4小时
      // 一周--12小时，一月--2天，三月--6天，一年--1个月
      const date = new Date(obj.timeStamp)
      const minute = date.getMinutes()
      switch (true) {
        case step < 1800: {
          if (obj.timeStamp !== obj1.timeStamp) {
            obj.showFlag = true
            obj.date = this.substringShowTime(obj.date)
          }
          break
        }
        case (step >= 1800 && step < 3600): {
          if (obj.timeStamp !== obj1.timeStamp && minute % 2 === 0) {
            obj.showFlag = true
            obj.date = this.substringShowTime(obj.date)
          }
          break
        }
        case (step === 3600): {
          if (obj.timeStamp !== obj1.timeStamp && minute % 5 === 0) {
            obj.showFlag = true
            obj.date = this.substringShowTime(obj.date)
          }
          // if((parameter.endTime.asLong() - parameter.startTime.asLong())<=3600){1小时
          //   parameter.step =  60;1分钟
          // }else if((parameter.endTime.asLong() - parameter.startTime.asLong())<=3*3600){3小时
          //   parameter.step =  120;2分钟
          // }else if((parameter.endTime.asLong() - parameter.startTime.asLong())<=6*3600){6小时
          //   parameter.step =  300;5分钟
          // }else if((parameter.endTime.asLong() - parameter.startTime.asLong())<=24*3600){1天
          //   parameter.step =  600;1小时
          // }else if((parameter.endTime.asLong() - parameter.startTime.asLong())<=48*3600){2天
          //   parameter.step =  1200;2小时
          // }else if((parameter.endTime.asLong() - parameter.startTime.asLong())<=168*3600){一周
          //   parameter.step =  3600;6小时
          // }else if((parameter.endTime.asLong() - parameter.startTime.asLong())<=720*3600){一个月
          //   parameter.step =  3600*6;6小时
          // }else if((parameter.endTime.asLong() - parameter.startTime.asLong())<=2160*3600){三个月
          //   parameter.step =  3600*12;12小时
          // }else if((parameter.endTime.asLong() - parameter.startTime.asLong())<=12*30*24*3600){一年
          //   parameter.step =  3600*24;1天
          // }
          break
        }
        case step <= 3 * 3600: {
          if (obj.timeStamp !== obj1.timeStamp && minute % 20 === 0) {
            obj.showFlag = true
            obj.date = this.substringShowTime(obj.date)
          }
          break
        }
      }
    },
    substringShowTime (time) {
      if (time.slice(-5) === '00:00') {
        time = time.substring(0, time.length - 6)
      } else {
        time = time.slice(-5)
      }
      return time
    },
    onChange (e) {
      const dom = document.getElementById('myLine')
      if (dom) {
        dom.style.cssText += `left: calc(${e}% + 5.5px)`
      }
      this.$emit('change', this.timeLine[e].timeStamp)
    }
  }
}
</script>

<style scoped lang="scss">
.time-line {
  width: 100%;
  height: 50px !important;
  padding: 0 6px;
  position: relative;

  .time-line-slider {
    position: absolute;
    width: 100%;
    top: -14px;

    :deep .el-slider__runway {
      height: 40px;
      background-color: rgba(0, 0, 0, 0);

      .el-slider__bar {
        background-color: rgba(0, 0, 0, 0);
      }

      .el-slider__button {
        width: 0;
        height: 0;
        border-color: #000 rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);
        border-style: solid;
        border-width: 10px 10px 0 10px;
        background-color: rgba(0, 0, 0, 0);
        border-radius: 0;
      }
    }
  }

  .time-line-container {
    height: 40px;
    line-height: 40px;
    background-color: rgba(255,255,255,0.60);
    display: flex;
    justify-content: space-between;
    padding: 0 6px;

    .test-line {
      width: 1px;
      height: 40px;
      background-color: #000;
    }
  }
}
</style>
