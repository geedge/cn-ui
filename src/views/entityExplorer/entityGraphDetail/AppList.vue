<template>
  <div>
    <loading :loading="entity.loading" size="small"></loading>
    <div class="graph-list-header">
      <div>
        <div class="graph-list-header-title">
          <i class="graph-list-header-icon cn-icon cn-icon-app-name"></i>
          <span>{{ $t('entities.tab.relatedApp') }}</span>
        </div>
        <div class="graph-list-header-number">
          {{ $t('entity.graph.associatedQuantity') }}:&nbsp;<span>{{entity.count}}</span>
        </div>
      </div>

      <i class="cn-icon cn-icon-close graph-close" @click="closeBlock"></i>
    </div>
    <div class="graph-list-expand-btn-block">
      <div class="graph-list-expand-btn" :class="{ 'graph-list-expand-btn--disabled': expandBtnDisable }" style="display: inline-flex;" @click="expandList">
        <i class="cn-icon cn-icon-expand-continue graph-expand-continue"></i>
        {{ $t('entity.graph.continueToExpand') }}
      </div>
    </div>
    <div>
      <div class="digital-certificate">
        <div class="digital-certificate-header padding-b-12">
          <div class="digital-certificate-header__icon graph-header__icon"></div>
          <div class="graph-list-content-header ">
            {{ $t('entity.graph.expandedEntityQuantity') }}:&nbsp;&nbsp;
            <span>{{ entity.listData ? entity.listData.length : 0 }}</span>
          </div>
        </div>

        <div class="graph-list-content">
          <div v-for="(item, index) in entity.listData" :key="index" @mouseenter="onMouseenter(item)">
            <div class="graph-list-item-ip" @click="expandDetail">{{ item.vertex }}</div>
            <div class="graph-list-item-block">
              <div class="graph-list-item__app">
                <div class="graph-list-item-label__app">APP ID:</div>
                <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.appId', '-') }}</div>
              </div>
              <div class="graph-list-item__app">
                <div class="graph-list-item-label__app">{{$t('entities.category')}}:</div>
                <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.appCategory', '-') }}</div>
              </div>
              <div class="graph-list-item__app">
                <div class="graph-list-item-label__app">{{$t('entities.subcategory')}}:</div>
                <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.appSubcategory', '-') }}</div>
              </div>
              <div class="graph-list-item__app">
                <div class="graph-list-item-label__app">{{$t('entities.riskLevel')}}:</div>
                <div class="graph-list-item-value">{{ appRisk($_.get(item.detail, 'category.appRisk', '-')) }}</div>
              </div>
              <div class="graph-list-item__app">
                <div class="graph-list-item-label__app">{{$t('config.dataSource.description')}}:</div>
                <div class="graph-list-item-value">{{ $_.get(item.detail, 'category.appDescription', '-') }}</div>
              </div>
            </div>
            <div class="graph-list-dividing-line" v-if="index !== entity.listData.length - 1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { riskLevelMapping } from '@/utils/constants'
import Loading from '@/components/common/Loading'
import { scrollToTop } from '@/utils/tools'
export default {
  name: 'AppList',
  props: {
    entity: {
      type: Object
    }
  },
  components: {
    Loading
  },
  computed: {
    appRisk () {
      return function (level) {
        const m = riskLevelMapping.find(mapping => {
          return mapping.value == level
        })
        return (m && m.name) || level
      }
    },
    expandBtnDisable () {
      return !((this.entity.listData ? this.entity.listData.length : 0) < this.entity.count && this.entity.count > 10 && (this.entity.listData && this.entity.listData.length < 50))
    }
  },
  methods: {
    closeBlock () {
      this.$emit('closeBlock')
    },
    expandDetail () {
      if (this.entity.entityType === 'app') {
        this.$emit('expandDetail', 'appDetail')
      } else if (this.entity.entityType === 'domain') {
        this.$emit('expandDetail', 'domainDetail')
      }
    },
    onMouseenter (val) {
      // 鼠标移动过graph列表名称时，graph图的分支图形会变大一点
      this.$emit('mouseenter', val)
    },
    expandList () {
      // 继续拓展ip列表，传递信息，调用接口
      if (!this.expandBtnDisable) {
        this.$emit('expandList', this.entity.sourceName, this.entity.nodeId)
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      scrollToTop()
    })
  }
}
</script>
