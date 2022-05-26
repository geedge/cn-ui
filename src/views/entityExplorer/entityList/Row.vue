<template>
  <div class="cn-entity--list" :style="{ zIndex: !isCollapse ? 1 : 'unset' }">
    <!-- 左侧下拉按钮 -->
    <div class="cn-entity__collapse">
      <span @click="switchCollapse" :class="{ 'reg-down': !isCollapse }"
        ><i class="cn-icon cn-icon-arrow-right"></i
      ></span>
    </div>
    <div class="cn-entity__case">
      <div class="cn-entity__icon"><i :class="iconClass"></i></div>
      <div class="cn-entity__row">
        <div class="cn-entity__header">
          {{
            entityData.ipAddr ||
            entityData.domainName ||
            entityData.appName ||
            'Unknown'
          }}
        </div>
        <div class="cn-entity__body">
          <div class="body__basic-info">
            <div class="basic-info">
              <template v-if="entityData.entityType === 'ip'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-country"></i>
                  <span>{{ $t('overall.country') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{ entityData.ipLocationCountry || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-position"></i>
                  <span>{{ $t('overall.region') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{ ipLocationRegion(entityData) }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-cloud"></i>
                  <span>{{ $t('entities.asn') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{ entityData.ipAsn || '-' }}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'domain'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-category"></i>
                  <span
                    >{{
                      $t('entities.domainDetail.categoryGroup')
                    }}&nbsp;:&nbsp;&nbsp;</span
                  >
                  <span>{{ entityData.domainCategoryGroup || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-sub-category"></i>
                  <span>{{ $t('entities.category') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{ entityData.domainCategory || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-credit"></i>
                  <span
                    >{{
                      $t('entities.reputationLevel')
                    }}&nbsp;:&nbsp;&nbsp;</span
                  >
                  <span>{{ entityData.domainReputationScore || '-' }}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'app'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-id"></i>
                  <span>{{ $t('entities.category') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{ entityData.appCategory || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-category"></i>
                  <span
                    >{{ $t('entities.subcategory') }}&nbsp;:&nbsp;&nbsp;</span
                  >
                  <span>{{ entityData.appSubcategory || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-sub-category"></i>
                  <span>{{ $t('entities.risk') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span>{{ appRisk(entityData.appRisk) || '-' }}</span>
                </div>
              </template>
              <!-- 通用字段 -->
              <div class="basic-info__item">
                <div class="item__box">
                  <i class="cn-icon cn-icon-rise"></i>
                  <span
                    >{{
                      $t('entities.sentThroughput')
                    }}&nbsp;:&nbsp;&nbsp;</span
                  >
                  <span>{{
                    entityData.bytesSentRate
                      ? unitConvert(
                          entityData.bytesSentRate,
                          unitTypes.byte,
                        ).join(' ') + 'ps'
                      : '-'
                  }}</span>
                  <!-- 曲线-->
                  <div class="item-box-loading">
                    <loading :loading="loading" size="small"></loading>
                    <div
                        class="row__charts"
                        :id="`entityDetailSend${entityType}${listMode}`"
                        v-if="entityData.entityType === 'domain'"
                    ></div>
                    <div
                        class="row__charts"
                        :id="`entityDetailSend${entityType}${listMode}`"
                        v-if="entityData.entityType === 'app'"
                    ></div>
                    <div
                        class="row__charts"
                        :id="`entityDetailSend${entityType}${listMode}`"
                        v-if="entityData.entityType === 'ip'"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="basic-info__item">
                <div class="item__box">
                  <i class="cn-icon cn-icon-fall"></i>
                  <span
                    >{{
                      $t('entities.receivedThroughput')
                    }}&nbsp;:&nbsp;&nbsp;</span
                  >
                  <span>{{
                    entityData.bytesReceivedRate
                      ? unitConvert(
                          entityData.bytesReceivedRate,
                          unitTypes.byte,
                        ).join(' ') + 'ps'
                      : '-'
                  }}</span>

                  <div class="item-box-loading">
                    <loading :loading="loading" size="small"></loading>
                    <div
                      class="row__charts"
                      :id="`entityDetailReceived${entityType}${listMode}`"
                      v-if="entityData.entityType === 'domain'"
                    ></div>
                    <div
                      class="row__charts"
                      :id="`entityDetailReceived${entityType}${listMode}`"
                      v-if="entityData.entityType === 'app'"
                    ></div>
                    <div
                      class="row__charts"
                      :id="`entityDetailReceived${entityType}${listMode}`"
                      v-if="entityData.entityType === 'ip'"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-entity-alert"></i>
                <span>{{ $t('entities.recentAlert') }}&nbsp;:&nbsp;&nbsp;</span>
                <span>{{ entityData.performanceCount}}</span>
              </div>
              <div class="basic-info__item">
                <i class="cn-icon cn-icon-safe"></i>
                <span
                  >{{ $t('entities.recentSecurity') }}&nbsp;:&nbsp;&nbsp;</span
                >
                <span>{{ entityData.securityCount}}</span>
              </div>
            </div>
            <div
              class="show-detail"
              @click="showDetail"
            >
              {{ $t('overall.detail') }}>
            </div>
          </div>
        </div>
      </div>
      <el-collapse-transition>
        <div class="cn-entity__detail-overview" v-if="!isCollapse">
          <el-divider></el-divider>
          <detail-overview
            :entity="entityData"
            :time-filter="timeFilter"
          ></detail-overview>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import DetailOverview from '@/views/entityExplorer/entityList/detailOverview/DetailOverview'
import entityListMixin from './entityListMixin'
import relatedServer from '@/mixins/relatedServer'
import Loading from '@/components/common/Loading'

export default {
  name: 'Row',
  props: {
    index: Number,
    timeFilter: Object,
    listMode: String
  },
  components: {
    Loading,
    DetailOverview
  },
  mixins: [entityListMixin, relatedServer],
  data () {
    return {
      loading: false,
      isCollapse: true // 是否是折叠状态
    }
  },
  computed: {
    ipLocationRegion () {
      return function (entityData) {
        const hasProvinceAndCity =
          entityData.ipLocationProvince &&
          entityData.ipLocationCity &&
          entityData.ipLocationProvince !== 'null' &&
          entityData.ipLocationCity !== 'null'
        const hasProvince =
          entityData.ipLocationProvince &&
          entityData.ipLocationProvince !== 'null'
        const hasCity =
          entityData.ipLocationCity && entityData.ipLocationCity !== 'null'
        if (hasProvinceAndCity) {
          return `${entityData.ipLocationProvince}, ${entityData.ipLocationCity}`
        } else if (hasProvince) {
          return entityData.ipLocationProvince
        } else if (hasCity) {
          return entityData.ipLocationCity
        } else {
          return '-'
        }
      }
    }
  },
  methods: {
    /* 切换折叠状态 */
    switchCollapse () {
      this.isCollapse = !this.isCollapse
      this.$emit('switchCollapse', this.isCollapse, this.index)
    },
    /* 设为折叠状态 */
    collapse () {
      this.isCollapse = true
    }
  }
}
</script>
