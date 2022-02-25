<template>
  <div class="cn-entity--block">
    <div class="cn-entity__header">
      <div class="header__content" :title="entityData.ipAddr||entityData.domainName||entityData.appName">
        <div class="header__icon"><i :class="iconClass"></i></div>
        <template v-if="entityData.entityType === 'ip'">
          <div class="content__name"  style="top:31px;">
            {{entityData.ipAddr || 'Unknown'}}
          </div>
        </template>
        <template v-else-if="entityData.entityType === 'domain'">
          <div class="content__name" >
            {{entityData.domainName || 'Unknown'}}
          </div>
          <div class="content__desc" >
            <span class="desc__label">{{$t('entities.reputationLevel')}}:&nbsp;</span>
            <span>{{entityData.domainReputationLevel || '-'}}</span>
          </div>
        </template>
        <template v-else-if="entityData.entityType === 'app'">
          <div class="content__name" >
            {{entityData.appName || 'Unknown'}}
          </div>
          <div class="content__desc" >
            <span class="desc__label">{{$t('entities.risk')}}:&nbsp;</span>
            <span>{{appRisk(entityData.appRisk) || '-'}}</span>
          </div>
        </template>
      </div>
      <div class="header__bottom__line"></div>
    </div>
    <div class="cn-entity__body">
      <template v-if="entityData.entityType === 'ip'">
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-country" ></i>{{$t('overall.country')}}：</span>
          <div class="body__row-value" :title="entityData.ipLocationCountry">{{entityData.ipLocationCountry || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-position"></i>{{$t('overall.province')}}：</span>
          <div class="body__row-value" :title="entityData.ipLocationProvince ? (entityData.ipLocationProvince + ', ' + entityData.ipLocationCity) : '-'">{{entityData.ipLocationProvince ? (entityData.ipLocationProvince + ', ' + entityData.ipLocationCity) : '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-cloud"></i>{{$t('entities.asn')}}：</span>
          <div class="body__row-value" :title="entityData.ipAsn">{{entityData.ipAsn || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-entity-alert"></i>{{$t('entities.recentAlert')}}：</span>
          <div class="body__row-value" :title="entityData.alertCount">{{entityData.alertCount || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-safe"></i>{{$t('entities.recentSecurity')}}：</span>
          <div class="body__row-value" :title="entityData.securityCount">{{entityData.securityCount || '-'}}</div>
        </div>
        <!-- 曲线-->
        <div class="body__drawing-box">
          <div class="body__drawing" :id="`entityListChart${entityData.ipAddr}`"></div>
        </div>
        <div class="body__statics">
          <div class="entity-statics-down"><i class="cn-icon cn-icon-fall entity-statics-icon"></i>{{entityData.bytesReceivedRate || 0}} bps</div>
          <div class="entity-statics-up" ><i class="cn-icon cn-icon-rise"></i>{{entityData.bytesSentRate || 0}} bps</div>
          <div class="body__detail" @click="showDetail">{{$t('overall.detail')}}></div>
        </div>
      </template>
      <template v-else-if="entityData.entityType === 'domain'">
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-category"></i>{{$t('entities.group')}}：</span>
          <div class="body__row-value" :title="entityData.domainCategoryGroup">{{entityData.domainCategoryGroup || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-sub-category"></i>{{$t('entities.categoryName')}}：</span>
          <div class="body__row-value" :title="entityData.domainCategory">{{entityData.domainCategory || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-credit"></i>{{$t('entities.credit')}}：</span>
          <div class="body__row-value" :title="entityData.domainReputationScore">{{entityData.domainReputationScore || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-entity-alert"></i>{{$t('entities.recentAlert')}}：</span>
          <div class="body__row-value" :title="entityData.alertCount">{{entityData.alertCount || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-safe"></i>{{$t('entities.recentSecurity')}}：</span>
          <div class="body__row-value" :title="entityData.securityCount">{{entityData.securityCount || '-'}}</div>
        </div>
        <!-- 曲线-->
        <div class="body__drawing-box">
          <div class="body__drawing" :id="`entityListChart${entityData.domainName}`"></div>
        </div>
        <div class="body__statics">
          <div class="entity-statics-down"><i class="cn-icon cn-icon-fall entity-statics-icon"></i>{{entityData.bytesReceivedRate || 0}} bps</div>
          <div class="entity-statics-up" ><i class="cn-icon cn-icon-rise"></i>{{entityData.bytesSentRate || 0}} bps</div>
          <div class="body__detail" @click="showDetail">{{$t('overall.detail')}}></div>
        </div>
      </template>
      <template v-else-if="entityData.entityType === 'app'">
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-id"></i>APP ID：</span>
          <div class="body__row-value" :title="entityData.appId">{{entityData.appId || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-category"></i>{{$t('entities.category')}}：</span>
          <div class="body__row-value" :title="entityData.appCategory">{{entityData.appCategory || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-sub-category"></i>{{$t('entities.subcategory')}}：</span>
          <div class="body__row-value" :title="entityData.appSubcategory">{{entityData.appSubcategory || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-entity-alert"></i>{{$t('entities.recentAlert')}}：</span>
          <div class="body__row-value" :title="entityData.alertCount">{{entityData.alertCount || '-'}}</div>
        </div>
        <div class="body__row">
          <span class="body__row-label"><i class="cn-icon cn-icon-safe"></i>{{$t('entities.recentSecurity')}}：</span>
          <div class="body__row-value" :title="entityData.securityCount">{{entityData.securityCount || '-'}}</div>
        </div>
        <!-- 曲线-->
        <div class="body__drawing-box">
                <div class="body__drawing" :id="`entityListChart${entityData.appName}`"></div>
        </div>
        <div class="body__statics">
          <div class="entity-statics-down"><i class="cn-icon cn-icon-fall entity-statics-icon"></i>{{entityData.bytesReceivedRate ? unitConvert(entityData.bytesReceivedRate, unitTypes.byte).join(' ') + 'ps' : '-'}}</div>
          <div class="entity-statics-up" ><i class="cn-icon cn-icon-rise"></i>{{entityData.bytesSentRate ? unitConvert(entityData.bytesSentRate, unitTypes.byte).join(' ') + 'ps' : '-'}}</div>
          <div class="body__detail" @click="showDetail">{{$t('overall.detail')}}></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import entityListMixin from './entityListMixin'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
export default {
  name: 'Card',
  mixins: [entityListMixin],
  setup () {
    return {
      unitTypes,
      unitConvert
    }
  }
}
</script>
