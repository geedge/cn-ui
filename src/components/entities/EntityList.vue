<template>
  <div class="entity-list">
    <div class="entity-list__content">
      <div class="cn-entity" v-for="d in listData" :key="d.id">
        <div class="cn-entity__header">
          <div class="header__icon" :style="{backgroundColor: circleColor}"><i :class="iconClass"></i></div>
          <div class="header__content">
            <div class="content__title">
              <template v-if="entityType === 'ip'">{{d.ip || 'Unknown'}}</template>
              <template v-else-if="entityType === 'domain'">{{d.domainName || 'Unknown'}}</template>
              <template v-else-if="entityType === 'app'">{{d.appName || 'Unknown'}}</template>
            </div>
            <div class="content__desc" v-if="entityType !== 'ip'">
              <template v-if="entityType === 'domain'">
                <span class="desc__label">{{$t('entities.reputationLevel')}}:</span>
                <span>{{d.reputationLevel || '-'}}</span>
              </template>
              <template v-else-if="entityType === 'app'">
                <span class="desc__label">{{$t('entities.risk')}}:</span>
                <span>{{d.appRisk || '-'}}</span>
              </template>
            </div>
          </div>
        </div>
        <div class="cn-entity__body">
          <template v-if="entityType === 'ip'">
            <div class="body__row">
              <span class="body__row-label">{{$t('common.country')}}:</span>
              <span class="body__row-value">{{d.country || '-'}}</span>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('common.region')}}:</span>
              <span class="body__row-value">{{d.region || '-'}}</span>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.asn')}}:</span>
              <span class="body__row-value">{{d.asn || '-'}}</span>
            </div>
            <div class="body__detail">{{$t('common.detail')}}</div>
          </template>
          <template v-else-if="entityType === 'domain'">
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.categoryGroup')}}:</span>
              <span class="body__row-value">{{d.categoryGroup || '-'}}</span>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.categoryName')}}:</span>
              <span class="body__row-value">{{d.categoryName || '-'}}</span>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.creditScore')}}:</span>
              <span class="body__row-value">{{d.reputationScore || '-'}}</span>
            </div>
            <div class="body__detail">{{$t('common.detail')}}</div>
          </template>
          <template v-else-if="entityType === 'app'">
            <div class="body__row">
              <span class="body__row-label">APP ID:</span>
              <span class="body__row-value">{{d.appId || '-'}}</span>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.category')}}:</span>
              <span class="body__row-value">{{d.appCategory || '-'}}</span>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.subcategory')}}:</span>
              <span class="body__row-value">{{d.appSubategory || '-'}}</span>
            </div>
            <div class="body__detail">{{$t('common.detail')}}</div>
          </template>
        </div>
      </div>
    </div>
    <div class="entity-list__pagination">
      <el-pagination
          @size-change="size"
          @prev-click="prev"
          @next-click="next"
          @current-change="current"
          :currentPage="pageObj.pageNo"
          :page-size="pageObj.pageSize"
          :total="pageObj.total"
          :page-sizes="[30, 50, 100]"
          layout="total, prev, pager, next, sizes"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EntityList',
  props: {
    listData: Array,
    entityType: String,
    pageObj: Object
  },
  computed: {
    circleColor () {
      let color
      switch (this.entityType) {
        case ('ip'): {
          color = '#E8FBF9'
          break
        }
        case ('domain'): {
          color = '#EEF6FE'
          break
        }
        case ('app'): {
          color = '#FEF7E7'
          break
        }
        default: break
      }
      return color
    },
    iconClass () {
      let className
      switch (this.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip ip-green'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain domain-blue'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app app-orange'
          break
        }
        default: break
      }
      return className
    }
  },
  methods: {
    size (val) {
      this.$emit('pageSize', val)
    },
    // 点击上一页箭头
    prev () {
      this.scrollbarToTop()
    },
    // 点击下一页箭头
    next () {
      this.scrollbarToTop()
    },
    // currentPage 改变时会触发
    current (val) {
      this.$emit('pageNo', val)
      this.scrollbarToTop()
    },
    scrollbarToTop () {
      this.$nextTick(() => {
        const wraps = document.querySelectorAll('.el-table__body-wrapper')
        wraps.forEach(wrap => {
          if (wrap._ps_) {
            wrap.scrollTop = 0
          }
        })
      })
    }
  }
}
</script>

<style>
</style>
