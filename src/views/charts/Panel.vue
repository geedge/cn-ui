<template>
  <div id="panelList" style="padding: 10px 10px 20px 10px; overflow: auto" v-if="!isEntityDetail" >  <!--  @scroll="wholeScreenScroll" -->
    <div id="cn-panel" class="cn-panel2">
      <div class="panel__time">
        <date-time-range class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" :date-range="timeFilter.dateRangeValue" ref="dateTimeRange" @change="reload"/>
        <time-refresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
      </div>
      <!--
      <div v-if="panelType===3" class="nav">
        <input type="radio" class="wholeScreenChekck" name="radio-set" checked id="nav1">
        <input type="radio" class="wholeScreenChekck" name="radio-set"  id="nav2">
        <div class="scroll">
          <section class="panel" id="panel1">
            <dns-screen id="dnsScreen" :copy-data-list="chartList"
                        ref="dnsScreen"
                        :time-filter="timeFilter"
                        :entity="entity">
            </dns-screen>
          </section>
          <section class="panel" id="panel2">
            <dns-screen id="dnsScreen2" :copy-data-list="chartList"
                        ref="dnsScreen"
                        :time-filter="timeFilter"
                        :entity="entity">
            </dns-screen>
            <div  style="width:100%;height:500px;border:solid 1px red;padding:10px 10px 20px;">
              qqq
            </div>
          </section>

        </div>

      </div> -->

      <panel-chart-list
              ref="panelChartList"
              :time-filter="timeFilter"
              :data-list="chartList"
              :panel-lock="panelLock"
              :entity="entity"
              :whole-screen-scroll="panel.params && panel.params.wholeScreenScroll"
              @finish="finish"
      >
      </panel-chart-list>
    </div>
  </div>
  <div class="cn-entity-detail" id="cn-entity-detail" v-else>
    <div class="entity-detail__body">
      <div class="cn-panel2" id="cn-panel">
        <panel-chart-list
                ref="panelChartList"
                :time-filter="timeFilter"
                :data-list="chartList"
                :panel-lock="panelLock"
                :entity="entity"
        >
        </panel-chart-list>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { panelTypeAndRouteMapping, wholeScreenRouterMapping } from '@/utils/constants'
import { api, getPanelList, getChartList } from '@/utils/api'
import { getNowTime } from '@/utils/date-util'
import { scrollToTop } from '@/utils/tools'
import {
  isGroup,
  isBlock,
  getGroupHeight
} from './charts/tools'
  
import DnsScreen from '@/views/charts/wholeScreenScroll/DnsScreen'

export default {
  name: 'Panel',
  components: {
    DnsScreen
  },
  props: {
    entity: Object,
    isEntityDetail: Boolean,
    typeName: String
  },
  data () {
    return {
      chartList: [], // 普通panel的chart
      panelLock: true,
      // entity详情的chart
      detailTabs: [],
      detailChartList: [],
      currentTab: '',
      isCryptocurrency: false, // 是否为挖矿列表
      scroll: {
        prevent: false, // 阻止滚动
        prevScrollTop: 0 // 前一次滚动条位置
      },
      wholeScreenRouterMapping,
      isFullScreen: true, // 当前是否为全屏滚动页面
      // isSecondScreen:false,//当前是否为全屏滚动页面下面的页面
      screenNum: 1, // 当前屏幕编号
      wheel: null, // 鼠标滚动事件
      allDone: false,
      isReachSecond: false
    }
  },
  async mounted () {
    this.emitter.on('groupParentCalcHeight', this.groupParentCalcHeight)
    this.isCryptocurrency = this.$route.path.indexOf('cryptocurrency') > -1
    await this.init()
    if (!this.$_.isEmpty(this.detailTabs)) {
      this.currentTab = this.detailTabs[0].id + ''
    }

    this.$nextTick(() => {
      if (this.panelType === 3) {
        const self = this
        const panelList = document.getElementById('panelList')// ie不兼容，换成id会成功
        self.wheel = function (event) {
          event.stopPropagation()// 阻止冒泡事件
          if (!self.allDone) {
            if (event && event.preventDefault) {
              event.preventDefault()
            } else {
              event.returnValue = false
            }
            return false
          }
          let delta = 0
          if (!event)// for ie
          { event = window.event }
          if (event.wheelDelta) { // ie,opera
            delta = event.wheelDelta / 120
          } else if (event.detail) {
            delta = -event.detail / 3
          }
          if (delta) {
            self.handle(delta, self, event)
          }
        }
        if (panelList.addEventListener) {
          panelList.addEventListener('DOMMouseScroll', self.wheel, { passive: false })
        }
        panelList.onmousewheel = self.wheel
      }
    })
  },
  setup (props, ctx) {
    const panel = ref({})
    let panelType = 1 // 取得panel的type
    const { params } = useRoute()
    panelType = props.entity ? props.entity.type : panelTypeAndRouteMapping[params.typeName]

    function isEntityDetail (t) {
      return [4, 5, 6].indexOf(t) > -1
    }
    // date
    const dateRangeValue = isEntityDetail(panelType) ? 60 * 24 : 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const timeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      panelType,
      panel,
      timeFilter,
      api
    }
  },
  methods: {
    async init () {
      const panels = await getPanelList({ type: this.panelType })
      if (panels && panels.length > 0) {
        this.panel = panels[0]
      }
      if (this.panel.id) {
        if (this.panel.params) {
          this.panel.params = JSON.parse(this.panel.params)
        } else {
          this.panel.params = {}
        }
        const allCharts = (await getChartList({ panelId: this.panel.id, pageSize: -1 })).map(chart => {
          chart.i = chart.id
          this.recursionParamsConvert(chart)
          return chart
        })
        // allCharts = allCharts.filter(chart => chart.type === 24)
        this.chartList = allCharts
        setTimeout(() => {
          this.$emit('chartLoaded', allCharts)
        }, 1000)
      }
    },
    changeTab ({ index }) {
      this.currentTab = this.detailTabs[index].id + ''
      this.detailChartList = this.detailTabs[index].children
    },
    finish () {
      this.allDone = true
    },
    preventWheel (event) {
      if (event && event.preventDefault) {
        event.preventDefault()
      } else {
        event.returnValue = false
      }
    },
    recursionParamsConvert (chart) {
      chart.params = chart.params ? JSON.parse(chart.params) : {}
      chart.firstShow = false
      if (isGroup(chart.type)) {
        chart.oldH = chart.h
        /* chart.params = {
            collapse: false
          } */
        chart.h = getGroupHeight(chart.children) + 1.5
        if (chart.params.collapse) {
          chart.h = 1
        }
      }
      if (isBlock(chart.type)) {
        let sumGroup = 0
        chart.children.forEach(item => {
          if (isGroup(item.type)) {
            sumGroup++
          }
        })
        chart.h += sumGroup * 0.5
      }
      if (!this.$_.isEmpty(chart.children)) {
        chart.children.forEach(c => {
          this.recursionParamsConvert(c)
        })
      }
    },
    getCurrentTimeRange (callback) {
      const myEndTime = window.$dayJs.tz().valueOf()
      const myStartTime = myEndTime - this.timeFilter.dateRangeValue * 60 * 1000
      callback({ startTime: myStartTime, endTime: myEndTime })
    },
    timeRefreshChange () {
      // 不是自选时间
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.timeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      } else {
        this.$refs.panelChartList.reload()
      }
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
    },
    // methods
    dateTimeRangeChange (s, e, v) {
      this.timeFilter = { startTime: s, endTime: e, dateRangeValue: v }
      // this.chartList = [...this.chartList]
      this.$nextTick(() => {
        this.$refs.panelChartList.reload()
      })
    },
    reloadCharts () {
      this.chartList.forEach(chart => {
        this.$refs[`chart-${chart.id}`] && this.$refs[`chart-${chart.id}`].reloadChart()
      })
    },
    groupParentCalcHeight (params) {
      this.$refs.panelChartList.groupParentCalcHeight(params.chart, params.childrenList)
    },
    wholeScreenScroll (e) {
      if (this.scroll.prevent) {
        return
      }
      this.scroll.prevent = true
      const clientHeight = e.target.clientHeight
      const currentScrollTop = e.target.scrollTop
      if (currentScrollTop > this.scroll.prevScrollTop) {
        // 向下滚动，若top在clientHeight内，则整屏滚动下去
        this.scroll.prevScrollTop = currentScrollTop
        if (currentScrollTop < clientHeight) {
          scrollToTop(e.target, clientHeight, 200, 'down')
          setTimeout(() => {
            this.scroll.prevScrollTop = e.target.scrollTop
          }, 210)
        }
      } else if (currentScrollTop < this.scroll.prevScrollTop) {
        // 向上滚动，若top在clientHeight内，则滚动到最顶部
        this.scroll.prevScrollTop = currentScrollTop
        if (currentScrollTop < clientHeight) {
          scrollToTop(e.target, 0, 200, 'up')
          setTimeout(() => {
            this.scroll.prevScrollTop = e.target.scrollTop
          }, 210)
        }
      }
      const vm = this
      setTimeout(() => {
        vm.scroll.prevent = false
      }, 210)
    },
    scrollIntoDown () {
      const anchorEle = document.getElementById('gridLayout')
      console.log('down....')
      if (anchorEle) {
        console.log('down')
        anchorEle.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    },
    scrollIntoUp (id) {
      const anchorEle = document.getElementById(id)
      if (anchorEle) {
        anchorEle.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    },
    scrollInto (id, event) {
      const anchorEle = document.getElementById(id)
      if (anchorEle) {
        const panelList = document.getElementById('panelList')// ie不兼容，换成id会成功
        panelList.onmousewheel = null
        panelList.removeEventListener('DOMMouseScroll', this.wheel)
        anchorEle.scrollIntoView({ block: 'start', behavior: 'smooth' })
        this.preventWheel(event)
        console.log('scrolling。。。。')

        setTimeout(() => {
          const panelList = document.getElementById('panelList')// ie不兼容，换成id会成功
          if (panelList.addEventListener) {
            panelList.addEventListener('DOMMouseScroll', this.wheel, { passive: false })
          }
          panelList.onmousewheel = this.wheel
          console.log('add event。。。。')
        }, 200)
      }
    },
    preventDefault (event) {
      if (event && event.preventDefault) {
        event.preventDefault()
      } else {
        event.returnValue = false
      }
    },
    handle (delta, self, event) {
      const panelList = document.getElementById('panelList')// ie不兼容，换成id会成功
      const currentScrollTop = panelList.scrollTop
      console.log('****************开始******************')
      console.log('self.screenNum=' + self.screenNum)
      console.log('panelList.offsetHeight=' + panelList.offsetHeight)
      console.log('self.isFullScreen=' + self.isFullScreen)
      console.log('self.isReachSecond =' + self.isReachSecond)
      console.log('currentScrollTop=' + currentScrollTop)
      if (delta < 0) {
        if (self.isFullScreen || self.screenNum === 1 || currentScrollTop < panelList.offsetHeight - 15) {
          console.log('1下')
          self.isFullScreen = false
          self.screenNum = 2
          self.scrollIntoDown()
          self.preventWheel(event)
          self.isReachSecond = true
          // panelList.removeEventListener('DOMMouseScroll',self.wheel)
          // panelList.onmousewheel=null
        } else if (!self.isFullScreen || self.screenNum === 2 || currentScrollTop > panelList.offsetHeight - 10) {
          console.log('else下')
          self.screenNum = 3
          self.isFullScreen = false
          self.isReachSecond = false
          // self.scrollIntoDown()
        } else {
          self.isReachSecond = false
        }
      } else if (delta > 0) {
        if (self.screenNum === 3 || (currentScrollTop < panelList.offsetHeight + 100 && currentScrollTop > panelList.offsetHeight - 10)) {
          console.log('上1')
          self.isReachSecond = true
          self.scrollIntoUp('gridLayout')
          self.screenNum = 2
          self.isFullScreen = false
          self.preventWheel(event)
        } else if (self.isFullScreen || self.screenNum === 2 || self.screenNum === 1 || currentScrollTop <= panelList.offsetHeight + 100) {
          console.log('上2')
          self.scrollIntoUp('dnsScreenAnchor')
          self.screenNum = 1
          self.isFullScreen = true
          self.isReachSecond = false
          self.preventWheel(event)
        } else {
          console.log('上3')
          self.isFullScreen = false
          self.isReachSecond = false
        }
      }
    }
  }
}
</script>

<style scoped >
  body{
    -webkit-font-smoothing:antialiased;
  }
  .nav{
    width:100%;
    position:absolute;
    left:0;
    bottom:0;
  }
  .nav input{
    opacity:0;
    z-index:1000;
  }
  #nav1,#nav1 + a{
    left:0%;
  }
  #nav2,#nav2 + a{
    left:20%;
  }
  .nav input:checked + a:after{
    content:"";
    width:0;
    height:0;
    overflow:hidden;
    border:20px solid transparent;
    border-bottom-color:#821134;
    position:absolute;
    bottom:100%;
    left:50%;
    margin-left:-20px;
  }
  .scroll,.panel{
    width:100%;
    height:100%;
    position:relative;
    text-align:center;
    padding-top:0px;
  }
  .scroll{
    left:0;
    top:0;
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    -ms-transform: translate3d(0, 0, 0);
    -o-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transition: all 0.6s ease-in-out;
    -moz-transition: all 0.6s ease-in-out;
    -o-transition: all 0.6s ease-in-out;
    transition: all 0.6s ease-in-out;
    color:#e23a6e;
    font-weight:bold;
  }
  .panel{
    overflow: hidden;
  }
  #nav1:checked ~ .scroll{
    -webkit-transform: translateY(100%);
    -moz-transform: translateY(100%);
    -ms-transform: translateY(100%);
    -o-transform: translateY(100%);
    transform: translateY(100%);
  }
  #nav2:checked ~ .scroll{
    -webkit-transform: translateY(-20%);
    -moz-transform: translateY(-20%);
    -ms-transform: translateY(-20%);
    -o-transform: translateY(-20%);
    transform: translateY(-20%);
  }
  [data-icon]:after{
    content:attr(data-icon);
    width:200px;
    height:200px;
    color:#fff;
    font-size:90px;
    text-align:center;
    line-height:200px;
    position:absolute;
    left:18%;
    top:18%;
    -webkit-transform: rotate(-45deg);
    -moz-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    -o-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
  @media screen and (max-device-width: 520px){

  }

</style>
