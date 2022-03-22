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
                  <div
                    class="row__charts"
                    :id="`entityDetailSend${entityType}`"
                    v-if="entityData.entityType === 'domain'"
                  ></div>
                  <div
                    class="row__charts"
                    :id="`entityDetailSend${entityType}`"
                    v-if="entityData.entityType === 'app'"
                  ></div>
                  <div
                    class="row__charts"
                    :id="`entityDetailSend${entityType}`"
                    v-if="entityData.entityType === 'ip'"
                  ></div>
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

                  <div
                    class="row__charts"
                    :id="`entityDetailReceived${entityType}`"
                    v-if="entityData.entityType === 'domain'"
                  ></div>
                  <div
                    class="row__charts"
                    :id="`entityDetailReceived${entityType}`"
                    v-if="entityData.entityType === 'app'"
                  ></div>
                  <div
                    class="row__charts"
                    :id="`entityDetailReceived${entityType}`"
                    v-if="entityData.entityType === 'ip'"
                  ></div>
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
              :style="{ visibility: !isCollapse ? 'visible' : 'hidden' }"
              @click="showDetail"
            >
              {{ $t('overall.detail') }}>>
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
import entityListMixin from './entityListMixin'
import DetailOverview from '@/views/entityExplorer/entityList/detailOverview/DetailOverview'
import { unitTypes } from '@/utils/constants'
import unitConvert from '@/utils/unit-convert'
import entityDetailMixin from './detailOverview/entityDetailMixin'
import relatedServer from '@/mixins/relatedServer'
import { api } from '@/utils/api'

export default {
  name: 'Row',
  props: {
    index: Number,
    timeFilter: Object
  },
  components: {
    DetailOverview
  },
  mixins: [entityListMixin, entityDetailMixin, relatedServer],
  data () {
    return {
      isCollapse: true, // 是否是折叠状态
      trafficUrl: '',
      entityType: ''
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
    },
    entityType () {
      let type
      switch (this.entityData.entityType) {
        case 'ip': {
          type = this.entityData.ipAddr
          break
        }
        case 'domain': {
          type = this.entityData.domainName
          break
        }
        case 'app': {
          type = this.entityData.appName
          break
        }
        default:
          break
      }
      this.entityType = type
      return type
    }
  },
  watch: {
    entityData: {
      deep: true,
      handler (n) {
        if (n.entityType) {
          switch (n.entityType) {
            case 'ip': {
              this.trafficUrl = api.entityIpDetailTraffic
              break
            }
            case 'domain': {
              this.trafficUrl = api.entityDomainDetailTraffic
              break
            }
            case 'app': {
              this.trafficUrl = api.entityAppDetailTraffic
              break
            }
            default:
              break
          }
        }
      }
    }
  },
  setup () {
    return {
      unitConvert,
      unitTypes
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
    },
    getQueryParams () {
      const queryParams = {
        startTime: parseInt(this.timeFilter.startTime / 1000),
        endTime: parseInt(this.timeFilter.endTime / 1000),
        appName: this.entityType,
        domain: this.entityType,
        ip: this.entityType
      }
      return queryParams
    }
  }
}
</script>
