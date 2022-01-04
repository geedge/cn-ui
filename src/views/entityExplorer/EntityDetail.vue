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
      <div class="entity-detail__content">
        <cn-panel
            ref="cnPanel"
            :entity="entityData"
            :is-entity-detail="true"
            @chartLoaded="chartLoaded"
            @scroll="scroll"
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
      top: 0
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
      this.anchorPoints = []
      let anchorPoints = []
      chartList.forEach(chart => {
        if (chart.params.anchorPoint) {
          const dom = document.querySelector(`#${chart.params.anchorPoint}`)
          anchorPoints.push({
            id: chart.params.anchorPoint,
            label: chart.i18n ? this.$t(chart.i18n) : chart.name,
            top: dom.offsetTop/* ,
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
    scroll ({ top }) {
      this.top = top || 0
    },
    jumpToAnchor (anchor) {
      this.top = anchor.top
      this.$refs.cnPanel.jumpToTop(anchor.top)
    }
  },
  computed: {
    iconClass () {
      let className
      switch (this.entityData.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app'
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
      this.anchorPoints.forEach(anchor => {
        if (anchor.top <= this.top) {
          currentAnchor = anchor
        }
      })
      return currentAnchor
    }
  }
}
</script>
