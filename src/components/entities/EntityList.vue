<template>
  <div class="entity-list">
    <div class="entity-list__content">
      <div class="cn-entity" v-for="d in listData" :key="d.id">
        <div class="cn-entity__header">
          <div class="header__icon"><i :class="iconClass"></i></div>
          <div class="header__content" :title="d.ip||d.domainName||d.appName">
            <template v-if="from === 'ip'">{{d.ip || 'Unknown'}}</template>
            <template v-else-if="from === 'domain'">{{d.domainName || 'Unknown'}}</template>
            <template v-else-if="from === 'app'">{{d.appName || 'Unknown'}}</template>
          </div>
        </div>
        <div class="cn-entity__body" style="position: relative;">
          <div class="content__desc" v-if="from !== 'ip'" style="color: #999999; width: 200px; position: absolute; top: 33px;right: -9px ;font-size: 12px;">
            <template v-if="from === 'domain'">
              <span class="desc__label">{{$t('entities.reputationLevel')}}:</span>
              <span>{{d.reputationLevel || '-'}}</span>
            </template>
            <template v-else-if="from === 'app'">
              <span class="desc__label">{{$t('entities.risk')}}:</span>
              <span>{{d.appRisk || '-'}}</span>
            </template>
          </div>
          <template v-if="from === 'ip'">
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-category"></i>&nbsp;{{$t('overall.country')}}:</span>
              <div class="body__row-value" :title="d.country">{{d.country || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-position"></i>&nbsp;{{$t('overall.region')}}:</span>
              <div class="body__row-value" :title="d.region">{{d.region || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-cloud"></i>&nbsp;{{$t('entities.asn')}}:</span>
              <div class="body__row-value" :title="d.asn">{{d.asn || '-'}}</div>
            </div>
            <div class="body__detail"
                 @click="entityDetail({name: d.ip, type: 4})">{{$t('overall.detail')}}></div>
          </template>
          <template v-else-if="from === 'domain'">
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-category"></i>&nbsp;{{$t('entities.Group')}}:</span>
              <div class="body__row-value" :title="d.categoryGroup">{{d.categoryGroup || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-sub-category"></i>&nbsp;{{$t('entities.categoryName')}}:</span>
              <div class="body__row-value" :title="d.categoryName">{{d.categoryName || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-risk"></i>&nbsp;{{$t('entities.credit')}}:</span>
              <div class="body__row-value" :title="d.reputationScore">{{d.reputationScore || '-'}}</div>
            </div>
            <div class="body__detail" @click="entityDetail({name: d.domainName, type: 5})">{{$t('overall.detail')}}></div>
          </template>
          <template v-else-if="from === 'app'">
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-risk"></i>&nbsp;APP ID:</span>
              <div class="body__row-value" :title="d.appId">{{d.appId || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-risk"></i>&nbsp;{{$t('entities.category')}}:</span>
              <div class="body__row-value" :title="d.appCategory">{{d.appCategory || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-risk"></i>&nbsp;{{$t('entities.subcategory')}}:</span>
              <div class="body__row-value" :title="d.appSubategory">{{d.appSubategory || '-'}}</div>
            </div>
            <div class="body__detail" @click="entityDetail({name: d.appId, type: 6})">{{$t('overall.detail')}}></div>
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
          layout="total, prev, pager, next"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EntityList',
  props: {
    listData: Array,
    from: String,
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
      switch (this.from) {
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
      switch (this.from) {
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
        wraps.scrollTop = 0
      })
    },
    entityDetail (params) {
      this.$emit('showDetail', { ...params, icon: this.iconClass })
    }
  }
}
</script>

<style>
</style>
