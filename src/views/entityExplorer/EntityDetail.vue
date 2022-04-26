<template>
  <div class="cn-home entity-detail">
    <div class="entity-detail__header">
      <div class="cn-entity__icon"><i :class="iconClass"></i></div>
      <div class="cn-entity__name">{{entityData.ip || entityData.domain || entityData.appName }}</div>
    </div>
    <main class="cn-body entity-detail__body">
      <div class="entity-detail__menu">
        <template v-for="anchor in anchorPoints" :key="anchor.id">
          <div class="menu-item" :class="{'menu-item--active': menuIsActive(anchor)}" @click="jumpToAnchor(anchor)">
            <span>{{anchor.label}}</span>
          </div>
        </template>
      </div>
      <div class="entity-detail__content" @scroll="scroll" id="detailWrapper">
        <cn-panel
            ref="cnPanel"
            :entity="entityData"
            :is-entity-detail="true"
            @chartLoaded="chartLoaded"
        ></cn-panel>
      </div>
    </main>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import Panel from '@/views/charts/Panel'
export default {
  name: 'EntityDetail',
  components: {
    cnPanel: Panel
  },
  data () {
    return {
      anchorPoints: [], // { id, label, top, height }
      top: 0,
      scrollHeight: 0,
      clientHeight: 0
    }
  },
  setup (props, ctx) {
    const { query } = useRoute()
    let panelType
    const entityData = { entityType: query.entityType }
    switch (query.entityType) {
      case 'ip': {
        panelType = 4
        entityData.ip = query.name
        break
      }
      case 'domain': {
        panelType = 5
        entityData.domain = query.name
        break
      }
      case 'app': {
        panelType = 6
        entityData.appName = query.name
        break
      }
      default: {
        panelType = 4
        break
      }
    }
    entityData.type = panelType
    return {
      entityData
    }
  },
  methods: {
    chartLoaded (chartList) {
      this.chartList = chartList
      this.anchorPoints = []
      let anchorPoints = []
      const panelDom = document.querySelector('#detailWrapper')
      this.scrollHeight = panelDom.scrollHeight
      this.clientHeight = panelDom.clientHeight
      chartList.forEach(chart => {
        if (chart.params.anchorPoint) {
          const dom = document.querySelector(`[anchor-point='${chart.params.anchorPoint}']`)
          dom && anchorPoints.push({
            id: chart.params.anchorPoint,
            label: chart.i18n ? this.$t(chart.i18n) : chart.name,
            top: dom.offsetTop + 10/* ,
            height: document.querySelector(`#${chart.params.anchorPoint}}`).scrollHeight */
          })
        }
      })
      // 从小到大排序
      anchorPoints = anchorPoints.sort((a, b) => {
        return a.top - b.top
      })
      if (!this.$_.isEmpty(anchorPoints)) {
        anchorPoints[0].top = 0
      }
      this.anchorPoints = anchorPoints
    },
    scroll (e) {
      this.top = (e.target.scrollTop + 10) || 0
    },
    jumpToAnchor (anchor) {
      this.top = anchor.top
      document.querySelector('#detailWrapper').scrollTop = this.top
    },
    resize () {
      this.chartLoaded(this.chartList)
    }
  },
  mounted () {
    this.debounceFunc = this.$_.debounce(this.resize, 400)
    window.addEventListener('resize', this.debounceFunc)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.debounceFunc)
  },
  computed: {
    iconClass () {
      let className
      switch (this.entityData.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip2'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain2'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app2'
          break
        }
        default: break
      }
      return className
    },
    menuIsActive () {
      return function (anchor) {
        return this.currentAnchor ? this.currentAnchor.id === anchor.id : false
      }
    },
    currentAnchor () {
      let currentAnchor = null
      if (this.top + this.clientHeight - 10 === this.scrollHeight) {
        currentAnchor = this.anchorPoints[this.anchorPoints.length - 1]
      } else {
        this.anchorPoints.forEach(anchor => {
          if (anchor.top <= this.top) {
            currentAnchor = anchor
          }
        })
      }
      return currentAnchor
    }
  }
}
</script>
