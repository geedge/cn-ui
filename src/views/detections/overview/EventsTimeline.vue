<template>
  <div class="events-timeline">
    <div class="timeline__circle">
      <div v-for="(item, index) in myTimeData" :key="index">
        <div
            :class="index===activeCircle ? 'circle__item-active' : 'circle__item'"
            :style="`margin-left: ${item.marginLeft};`"
            @click="onChange(item, index)"></div>
      </div>
    </div>
    <div class="timeline__line"></div>
    <div class="timeline-container">
      <div v-for="(item, index) in timeLine" :key="index">
        <div v-if="item.showFlag" style="color: #666;font-size: 12px;">{{ item.time }}</div>
      </div>
    </div>
  </div>
</template>

<!--------------调用-------start-------------->
<!--<events-timeline :timeFilter="timeFilter" @change="onChange"></events-timeline>-->
<!--回调数据：{ startTime: 1709192498339, endTime: 1709192498339 }-->
<!--------------调用-------end-------------->

<script>
import { getMillisecond } from '@/utils/date-util'
import { changeTimestampToTime } from '@/utils/tools'
import { throttle } from 'lodash'

export default {
  name: 'EventsTimeline',
  props: {
    timeFilter: {
      type: Object
    },
    timeData: Array
  },
  data () {
    return {
      timeLine: [],
      myTimeData: [
        { eventId: '1111111', lastTime: 1722391500, startTime: 1722391500 },
        { eventId: '2222222', lastTime: 1722391920, startTime: 1722391920 },
        { eventId: '3333333', lastTime: 1722391920, startTime: 1722391920 },
        { eventId: '444', lastTime: 1722392340, startTime: 1722392340 },
        { eventId: '555', lastTime: 1722392580, startTime: 1722392580 },
        { eventId: '666', lastTime: 1722392880, startTime: 1722392880 }
      ],
      activeCircle: 0
    }
  },
  watch: {
    timeFilter (n) {
      if (n) {
        this.currentTime = 99
        this.getDate()
        this.onChange('change')
      }
    },
    timeData (n) {
      if (n) {
        const timeFilter = {
          startTime: getMillisecond(this.timeFilter.startTime),
          endTime: getMillisecond(this.timeFilter.endTime)
        }
        this.handleTimelineCircle(timeFilter)
      }
    }
  },
  mounted () {
    this.initDate('init')
  },
  methods: {
    initDate (e) {
      // 切换页面进来时，timeFilter时间戳为秒而非毫秒
      const timeFilter = {
        startTime: getMillisecond(this.timeFilter.startTime),
        endTime: getMillisecond(this.timeFilter.endTime)
      }

      const myTimeRange = []
      const timeInterval = this.getTimeInterval(timeFilter) // 时间间隔
      const showTimeInterval = this.showTimeTimeInterval(timeFilter) // 显示时间的时间间隔
      let startTime = timeFilter.startTime // 开始时间
      const firstTime = new Date(timeFilter.startTime).getMinutes() // 开始时间的分钟数，作为计算基础

      // 处理时间轴上红圈事件
      this.$nextTick(() => {
        this.handleTimelineCircle(timeFilter)
      })

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
          myTimeRange.push({ time: obj.time, time1: obj.time1, stamp: new Date(obj.time1).getTime(), lastStamp: new Date(obj.time1).getTime() - showTimeInterval * 60 * 1000, showFlag: obj.showFlag })
        }
      }

      this.timeLine = myTimeRange
      // if (e === 'init') {
      //   this.$emit('change', timeObj)
      // }
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
    // 时间轴红点的点击事件，添加防抖处理
    onChange: throttle(function (e, index) {
      this.activeCircle = index
      this.$emit('change', e.eventId)
    }, 500),
    // onChange (e, index) {
    //   this.activeCircle = index
    //   this.throttleFunc(e)
    // },
    throttleFunc: throttle(function (e) {
      this.$emit('change', e.eventId)
    }, 1000),
    formatTooltip (value) {
      if (this.timeLine.length > 0 && this.timeLine[value]) {
        return this.timeLine[value].time1
      }
    },
    handleTimelineCircle (timeFilter) {
      this.myTimeData = this.$_.cloneDeep(this.timeData)
      this.activeCircle = this.myTimeData.length - 1
      this.myTimeData.forEach((item, index) => {
        item.statTime = getMillisecond(item.statTime)
        item.lastTime = this.$_.cloneDeep(item.statTime)
        let minutes = new Date(item.lastTime).getMinutes()
        let hours = new Date(item.lastTime).getHours()
        minutes = minutes < 10 ? '0' + minutes : minutes
        hours = hours < 10 ? '0' + hours : hours
        item.time = hours + ':' + minutes
        item.diffTime = (timeFilter.endTime - timeFilter.startTime) / 1000
        item.itemDiffTime = (timeFilter.endTime - item.lastTime) / 1000

        if (index === 0) {
          let marginLeft = 500 - ((item.itemDiffTime / item.diffTime) * 500)
          marginLeft = Math.round(marginLeft) + 8 + 'px'
          item.marginLeft = marginLeft
        } else {
          let marginLeft = ((this.myTimeData[index - 1].itemDiffTime - item.itemDiffTime) / item.diffTime) * 500
          marginLeft = (Math.round(marginLeft) - 13) + 'px'
          item.marginLeft = marginLeft
        }
      })
    }
  }
}
</script>

<style lang="scss">
.events-timeline {
  width: 500px;

  .timeline__circle {
    display: flex;

    .circle__item, .circle__item-active {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--el-color-danger-light-3);
      cursor: pointer;
    }

    .circle__item-active {
      background: var(--el-color-danger);
    }
  }

  .timeline__line {
    width: 100%;
    border-bottom: 1px var(--el-border-color-light) solid;
    margin-bottom: 10px;
  }

  .timeline-container {
    width: 100%;
    background-color: rgba(255, 255, 255, 0.50);
    display: flex;
    justify-content: space-between;
  }
}
</style>
