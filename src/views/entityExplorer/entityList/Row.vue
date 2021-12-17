<template>
  <div class="cn-entity--list" :style="{zIndex: isCollapse ? 1 : 'unset'}">
    <!-- 左侧下拉按钮 -->
    <div class="cn-entity__collapse">
      <span @click="showCollapse" :class="{'reg-down': isCollapse}"><i class="cn-icon cn-icon-arrow-right"></i></span>
    </div>
    <div class="cn-entity__case">
      <div class="cn-entity__icon"><i :class="iconClass"></i></div>
      <div class="cn-entity__row">
        <div class="cn-entity__header">{{entityData.ipAddr || entityData.domainName || entityData.appName || 'Unknown'}}</div>
        <div class="cn-entity__body">
          <div class="body__basic-info">
            <div class="basic-info">
              <template v-if="entityData.entityType === 'ip'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-country">$t('overall.country')&nbsp;:&nbsp;&nbsp;</i>
                  <span>$t('overall.country')&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.ipLocationCountry || '-'}}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-position"></i>
                  <span>$t('overall.region')&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.ipLocationProvince ? (entityData.ipLocationProvince + ', ' + entityData.ipLocationCity) : '-'}}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-cloud"></i>
                  <span>$t('overall.asn')&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.ipAsn || '-'}}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'domain'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-category"></i>
                  <span>{{$t('entities.domainDetail.categoryGroup')}}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.domainCategoryGroup || '-'}}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-sub-category"></i>
                  <span>{{$t('entities.category')}}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.domainCategory || '-'}}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-credit"></i>
                  <span>{{$t('entities.reputationLevel')}}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.domainReputationScore || '-'}}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'app'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-id"></i>
                  <span>{{$t('entities.category')}}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.appId || '-'}}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-category"></i>
                  <span>{{$t('entities.subcategory')}}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.appCategory || '-'}}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-sub-category"></i>
                  <span>{{$t('entities.risk')}}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{entityData.appSubategory || '-'}}</span>
                </div>
              </template>
              <!-- 通用字段 -->
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-rise"></i>
                <span>{{$t('entities.sentThroughput')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{entityData.bytesSentRate || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-fall"></i>
                <span>{{$t('entities.receivedThroughput')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{entityData.bytesReceivedRate || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-entity-alert"></i>
                <span>{{$t('entities.recentAlert')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{entityData.alertCount || '-'}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-safe"></i>
                <span>{{$t('entities.recentSecurity')}}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{entityData.securityCount || '-'}}</span>
              </div>
            </div>
            <div class="show-detail" :style="{visibility: isCollapse ? 'visible' : 'hidden'}">{{$t('overall.detail')}}>></div>
          </div>
          <div class="body__detail"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import entityListMixin from './entityListMixin'
export default {
  name: 'Row',
  props: {
    index: Number
  },
  mixins: [entityListMixin],
  data () {
    return {
      isCollapse: false
    }
  },
  methods: {
    showCollapse () {
      this.isCollapse = !this.isCollapse
      this.$emit('showCollapse', this.isCollapse, this.index)
    },
    cancelCollapse () {
      this.isCollapse = false
    }
  }
}
</script>
