<template>
  <div class="time-line">
    <div class="time-line-slider">
      <el-slider v-model="currentTime" @change="onChange" :step="1" :max="timeLine.length" :format-tooltip="formatTooltip"/>
    </div>
    <div style="height: 10px"></div>
    <div class="time-line-container">
      <div v-for="(item, index) in timeLine" :key="index">
        <div v-if="item.showFlag" style="color: #666;">{{ item.time }}</div>
      </div>
    </div>
  </div>
</template>

<!--------------调用-------start-------------->
<!--<time-line :timeFilter="timeFilter" @change="onChange"></time-line>-->
<!--回调数据：{ startTime: 1709192498339, endTime: 1709192498339 }-->
<!--------------调用-------end-------------->

<script>
import { getMillisecond } from '../../utils/date-util'
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
      // 切换页面进来时，timeFilter时间戳为秒而非毫秒
      const timeFilter = {
        startTime: getMillisecond(this.timeFilter.startTime),
        endTime: getMillisecond(this.timeFilter.endTime)
      }

      // 给倒三角滑块添加竖线
      const blockDom = document.getElementsByClassName('el-slider__button-wrapper')[0]
      if (blockDom) {
        this.$nextTick(() => {
          blockDom.style.cssText += 'left: calc(99% - 6px);'
          const markDom = document.getElementsByClassName('time-line-mark')[0]
          if (!markDom) {
            const childDiv = document.createElement('div')
            childDiv.className = 'time-line-mark'
            childDiv.style.cssText += 'width: 0.5px;height: 40px;background: #000;margin-left: 18px;margin-top: -7px;'
            blockDom.appendChild(childDiv)
          }
        })
      }

      const myTimeRange = []
      const timeInterval = this.getTimeInterval(timeFilter) // 时间间隔
      const showTimeInterval = this.showTimeTimeInterval(timeFilter) // 显示时间的时间间隔
      let startTime = timeFilter.startTime // 开始时间
      const firstTime = new Date(timeFilter.startTime).getMinutes() // 开始时间的分钟数，作为计算基础

      // 根据显示时间间隔计算所需开始时间，如获取3小时的时间，开始时间为第31分钟，则按30分钟开始计算
      if (showTimeInterval % 5 === 0) {
        if (firstTime % 5 !== 0) {
          startTime = startTime - (firstTime % showTimeInterval) * 60 * 1000
        }
      } else if (firstTime % 2 !== 0) {
        startTime = startTime - 60 * 1000
      }

      for (let i = startTime; i <= timeFilter.endTime; i += showTimeInterval * 60 * 1000) {
        const obj = this.formatTime(i, showTimeInterval, timeInterval)
        if (obj) {
          myTimeRange.push({ time: obj.time, time1: obj.time1, stamp: i, showFlag: obj.showFlag })
        }
      }

      this.timeLine = myTimeRange
    },
    // 按时间间隔格式化时间
    formatTime (timestamp, showTimeInterval, timeInterval) {
      const date = new Date(timestamp)
      const minute = date.getMinutes()
      // const remainder = minute % showTimeInterval
      const remainder1 = minute % timeInterval
      // if (remainder === 0) {
      // 零点，显示年月日
      if (date.getHours() === 0 && minute === 0) {
        const month = date.getMonth() + 1
        const day = date.getDate()
        const obj = {
          time: `${date.getFullYear()}-${month < 10 ? ('0' + month) : month}-${day < 10 ? ('0' + day) : day}`,
          time1: changeTimestampToTime(timestamp).substring(0, changeTimestampToTime(timestamp).length - 3),
          showFlag: false
        }
        if (remainder1 === 0) {
          obj.showFlag = true
        }
        return obj
      } else {
        // 非零点显示时分
        const obj = {
          time: `${date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours()}:${minute < 10 ? ('0' + minute) : minute}`,
          time1: changeTimestampToTime(timestamp).substring(0, changeTimestampToTime(timestamp).length - 3),
          showFlag: false
        }
        if (remainder1 === 0) {
          obj.showFlag = true
        }
        return obj
      }
      // }
    },
    // 获取间隔时间，如一小时最小间隔时间1分钟，3小时间隔2分钟
    getTimeInterval (timeFilter) {
      const step = (timeFilter.endTime - timeFilter.startTime) / (1000 * 60)
      switch (true) {
        case step < 30: {
          return 1
        }
        case step >= 30 && step < 60: {
          return 2
        }
        case step === 60: {
          return 5
        }
        case step <= 3 * 60: {
          return 20
        }
        case step <= 6 * 60: {
          return 30
        }
        case step <= 12 * 60: {
          return 60
        }
        case step <= 24 * 60: {
          return 2 * 60
        }
        case step <= 2 * 24 * 60: {
          return 4 * 60
        }
        case step <= 7 * 24 * 60: {
          return 12 * 60
        }
        case step <= 30 * 24 * 60: {
          return 48 * 60
        }
        case step <= 90 * 24 * 60: {
          return 6 * 24 * 60
        }
        case step <= 24 * 30 * 24 * 60: {
          return 30 * 24 * 60
        }
      }
    },
    // 时间轴显示时间的间隔时间，
    showTimeTimeInterval (timeFilter) {
      const step = (timeFilter.endTime - timeFilter.startTime) / (1000 * 60)
      switch (true) {
        case step <= 60: {
          return 1
        }
        case step <= 3 * 60: {
          return 2
        }
        case step <= 6 * 60: {
          return 5
        }
        case step <= 12 * 60: {
          return 10
        }
        case step <= 24 * 60: {
          return 20
        }
        case step <= 2 * 24 * 60: {
          return 40
        }
        case step <= 7 * 24 * 60: {
          return 360
        }
        case step <= 30 * 24 * 60: {
          return 24 * 60
        }
        case step <= 90 * 24 * 60: {
          return 6 * 24 * 60
        }
        case step <= 24 * 30 * 24 * 60: {
          return 30 * 24 * 60
        }
      }
    },
    onChange (e) {
      if (this.timeLine[e]) {
        // 返回所选时间后一分钟
        const timeObj = {
          startTime: this.timeLine[e].stamp - 60 * 1000,
          endTime: this.timeLine[e].stamp
        }
        this.$emit('change', timeObj)
      }
    },
    formatTooltip (value) {
      if (this.timeLine.length > 0 && this.timeLine[value]) {
        return this.timeLine[value].time1
      }
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
    top: -6px;

    :deep .el-slider__runway {
      //width: calc(100% - 18px);
      padding: 0 6px;
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
        border-width: 8px 8px 0 8px;
        background-color: rgba(0, 0, 0, 0);
        border-radius: 0;
      }
    }
  }

  .time-line-container {
    height: 40px;
    line-height: 40px;
    background-color: rgba(255, 255, 255, 0.50);
    //background-color: rgb(89, 173, 201);
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
