<template>
  <div class="entity-list">
    <div class="entity-list__content">
      <div class="cn-entity" v-for="d in listData" :key="d.id">
        <div class="cn-entity__header">
          <div class="header__icon"><i :class="iconClass"></i></div>
          <div class="header__content">
            <div class="content__title" :title="d.ip||d.domainName||d.appName">
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
              <span class="body__row-label">{{$t('overall.country')}}:</span>
              <div class="body__row-value" :title="d.country">{{d.country || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('overall.region')}}:</span>
              <div class="body__row-value" :title="d.region">{{d.region || '-'}}</div>
            </div>
            <div class="body__row Select">
              <span class="body__row-label">{{$t('entities.asn')}}:</span>
              <div class="body__row-value" :title="d.asn">{{d.asn || '-'}}</div>
            </div>
            <div class="body__detail" @click="entityDetail">{{$t('overall.detail')}}></div>
          </template>
          <template v-else-if="entityType === 'domain'">
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.categoryGroup')}}:</span>
              <div class="body__row-value" :title="d.categoryGroup">{{d.categoryGroup || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.categoryName')}}:</span>
              <div class="body__row-value" :title="d.categoryName">{{d.categoryName || '-'}}</div>
            </div>
            <div class="body__row Select">
              <span class="body__row-label">{{$t('entities.creditScore')}}:</span>
              <div class="body__row-value" :title="d.reputationScore">{{d.reputationScore || '-'}}</div>
            </div>
            <div class="body__detail" @click="entityDetail({domain: d.domainName})">{{$t('overall.detail')}}></div>
          </template>
          <template v-else-if="entityType === 'app'">
            <div class="body__row">
              <span class="body__row-label">APP ID:</span>
              <div class="body__row-value" :title="d.appId">{{d.appId || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label">{{$t('entities.category')}}:</span>
              <div class="body__row-value" :title="d.appCategory">{{d.appCategory || '-'}}</div>
            </div>
            <div class="body__row Select">
              <span class="body__row-label">{{$t('entities.subcategory')}}:</span>
              <div class="body__row-value" :title="d.appSubategory">{{d.appSubategory || '-'}}</div>
            </div>
            <div class="body__detail" @click="entityDetail({appId: d.appId})">{{$t('overall.detail')}}></div>
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
  data () {
    return {
      showDetail: false,
      typeName: ''
    }
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
    },
    entityDetail (params) {
      this.$emit('showDetail', params)
    }
  }
}
</script>

<style>
</style>
