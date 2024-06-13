<template>
  <div class="cn-entity--list" :style="{ zIndex: !isCollapse ? 1 : 'unset' }">
    <!-- 左侧下拉按钮 -->
    <div class="cn-entity__collapse">
      <span @click="switchCollapse" :class="{ 'reg-down': !isCollapse }">
        <i class="cn-icon cn-icon-arrow-right"></i>
      </span>
    </div>
    <div class="cn-entity__case" ref="rowBlock">
      <div class="cn-entity__icon"><i :class="iconClass"></i></div>
      <div class="cn-entity__row">
        <!--标签-->
        <div class="cn-entity__header my__display1">
          <template v-if="entityData.entityType">
            <span v-if="entityData.entityType==='subscriber_id'" v-high-light="keywordList">{{ entityData.phone_number }}</span>
            <span v-else v-high-light="keywordList">{{ entityData.entityValue || 'Unknown' }}</span>
          </template>
          <span v-show="entityData.isRelated" class="cn-entity__header-icon">
            <el-popover
                popper-class="my-popper-class"
                placement="right"
                trigger="hover"
                :content="$t('entity.relatedEntities')"
            >
              <template #reference>
                <i class="cn-icon cn-icon-related entity-related-entity"></i>
              </template>
            </el-popover>
          </span>
          <span class="entity-detail entity-row-tag" :style="{'margin-top' : entityData.isRelated ? '4px':'1px'}">
            <span v-for="(item, index) in levelTwoTags"
                  :key="index"
                  class="entity-tag entity-tag--small margin-r-10 margin-b-10"
                  :class="`entity-tag--level-two-${item.type}`"
                  :style="getTagColor(item.color)">
              {{ item.value }}
            </span>
          </span>
        </div>

        <div class="cn-entity__body">
          <div class="body__basic-info">
            <div class="basic-info">
              <template v-if="entityData.entityType === 'ip'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-country"></i>
                  <span class="row-item-label">{{ $t('overall.country') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value" v-high-light="keywordList">{{ $_.get(entityData, 'location.country', '-') || '-' }}</span>
                </div>
                <div class="basic-info__item1">
                  <i class="cn-icon cn-icon-position"></i>
                  <span class="row-item-label">{{ $t('overall.city') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value high-location" v-high-light="keywordList">{{ entityData.location ? ipLocationRegion(entityData.location) : '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-cloud"></i>
                  <span class="row-item-label">{{ $t('entities.asn') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value" v-high-light="keywordList">{{ $_.get(entityData, 'asn.asn', '-') || '-' }}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'domain'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-category-group"></i>
                  <span class="row-item-label">{{ $t('entities.category') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value" v-high-light="keywordList">{{ $_.get(entityData, 'category.categoryName', '-') || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-sub-category"></i>
                  <span class="row-item-label">{{ $t('entities.domainDetail.categoryGroup') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value" v-high-light="keywordList">{{ $_.get(entityData, 'category.categoryGroup', '-') || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-credit-rating"></i>
                  <span class="row-item-label">{{ $t('entities.reputationLevel') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ $_.get(entityData, 'category.reputationLevel', '-') || '-' }}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'app'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-category2"></i>
                  <span class="row-item-label">{{ $t('entities.category') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value" v-high-light="keywordList">{{ $_.get(entityData, 'category.appCategory', '-') || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-sub-category"></i>
                  <span class="row-item-label">{{ $t('entities.subcategory') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ $_.get(entityData, 'category.appSubcategory', '-') || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-credit-rating"></i>
                  <span class="row-item-label">{{ $t('entities.risk') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.category ? appRisk(entityData.category.appRisk) : '-' }}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'subscriber_id'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-account-info"></i>
                  <span class="row-item-label">{{ $t('entity.subscriberId') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value" v-high-light="keywordList">{{ $_.get(entityData, 'entityValue', '-') || '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-location"></i>
                  <span class="row-item-label">{{ $t('overall.location') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{$_.get(entityData, 'subscriber_longitude', '-') || '-'}},&nbsp;{{$_.get(entityData, 'subscriber_latitude', '-') || '-'}}</span>
                </div>
              </template>
              <!-- 通用字段 -->
              <div class="basic-info__item">
                <div class="item__box">
                  <i class="cn-icon cn-icon-rise"></i>
                  <span class="row-item-label">{{ $t('entities.sentThroughput') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">
                    {{
                      valueToRangeValue(entityData.bytesSentRate, unitTypes.bps).join(' ') !=='- ' ? valueToRangeValue(entityData.bytesSentRate, unitTypes.bps).join(' ') : '-'
                    }}
                  </span>
                  <!-- 曲线-->
                  <div class="item-box-loading">
                    <loading :loading="loading" size="small"></loading>
                    <div class="row__charts" :id="`entityDetailSend${entityType}${listMode}`"></div>
                  </div>
                </div>
              </div>

              <div class="basic-info__item">
                <div class="item__box">
                  <i class="cn-icon cn-icon-fall"></i>
                  <span class="row-item-label">{{ $t('entities.receivedThroughput') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">
                    {{ valueToRangeValue(entityData.bytesReceivedRate, unitTypes.bps).join(' ') !== '- ' ? valueToRangeValue(entityData.bytesReceivedRate, unitTypes.bps).join(' ') : '-' }}
                  </span>
                  <div class="item-box-loading">
                    <loading :loading="loading" size="small"></loading>
                    <div class="row__charts" :id="`entityDetailReceived${entityType}${listMode}`"></div>
                  </div>
                </div>
              </div>

              <!--score分数-->
              <div class="basic-info__item my__display">
                <i class="cn-icon cn-icon-Score"></i>
                <div class="row-item-label">
                  <span class="row-item-label">{{ $t('network.score') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value" style="position: relative;">
                    <template v-if="!loadingNetworkQuality && score !=='-'">
                      <span v-for="(dot, i) in scoreDot" :key="i" :class="dot.class"></span>
                    </template>
                    <span class="padding-l-4">{{score}}</span>
                    <loading :loading="loadingNetworkQuality" size="small"></loading>
                  </span>
                </div>
              </div>

              <!--事件数量，即Performance和security事件总和-->
              <div class="basic-info__item" style="position: relative">
                <div v-if="eventNum>0 && !loadingEvent" class="my__display">
                  <i class="cn-icon cn-icon-Event1"></i>
                  <div class="row-item-label">
                    <span class="row-item-label">{{ $t('dnsInsight.event') }}&nbsp;:&nbsp;&nbsp;</span>
                    <span class="row-item-value">{{ eventNum }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="show-detail__block">
        <div class="new-show-detail">
          <div @click="showDetail"><i class="cn-icon cn-icon-detail"></i>{{ $t('overall.detail') }} ></div>
          <div @click="showGraph" v-if="entity.entityType !== 'subscriber_id'"><i class="cn-icon cn-icon-graph"></i>{{ $t('entities.graph') }} ></div>
        </div>
      </div>
      <el-collapse-transition>
        <div class="cn-entity__detail-overview" v-if="!isCollapse">
          <el-divider></el-divider>
          <detail-overview :entity="entityData" :time-filter="timeFilter" :keywordList="keywordList" @reloadEntity="getEntity" @eventNum="getEventNum" />
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
import axios from 'axios'
import { api } from '@/utils/api'
import { entityDefaultColor, intentColor } from '@/utils/constants'
import _ from 'lodash'
import { getTagColor, formatTags } from '@/utils/tools'

export default {
  name: 'Row',
  props: {
    index: Number,
    timeFilter: Object,
    listMode: String,
    keywordList: Array
  },
  components: {
    Loading,
    DetailOverview
  },
  mixins: [entityListMixin, relatedServer],
  data () {
    return {
      loading: false,
      isCollapse: true, // 是否是折叠状态
      levelTwoTags: [],
      loadingNetworkQuality: false // 分数的loading
    }
  },
  computed: {
    ipLocationRegion () {
      return function (entityData) {
        const hasProvinceAndCity =
            entityData.province &&
            entityData.city &&
            entityData.province !== 'null' &&
            entityData.city !== 'null'
        const hasProvince =
            entityData.province &&
            entityData.province !== 'null'
        const hasCity =
            entityData.city && entityData.city !== 'null'
        if (hasProvinceAndCity) {
          return `${entityData.province}, ${entityData.city}`
        } else if (hasProvince) {
          return entityData.province
        } else if (hasCity) {
          return entityData.city
        } else {
          return '-'
        }
      }
    }
  },
  mounted () {
    setTimeout(() => {
      this.initData()
    }, 1000)
    setTimeout(() => {
      this.initTagsData()
    })
  },
  methods: {
    getTagColor,
    initData () {
      let url = ''
      switch (this.entity.entityType) {
        case ('domain'): {
          url = api.entity.entityList.domainBasicInfo
          break
        }
        case ('ip'): {
          url = api.entity.entityList.ipBasicInfo
          break
        }
        case ('app'): {
          url = api.entity.entityList.appBasicInfo
          break
        }
        case ('subscriber_id'): {
          url = api.entity.entityList.subscriberBasicInfo
          break
        }
      }
      axios.get(`${url}?resource=${this.entity.entityValue}`).then(response => {
        this.$nextTick(() => {
          this.entityData = { ...this.entityData, ...response.data.data, ...this.entity }
        })
      })
    },
    initTagsData () {
      let url = ''
      switch (this.entity.entityType) {
        case ('domain'): {
          url = api.entity.entityList.domainTags
          break
        }
        case ('ip'): {
          url = api.entity.entityList.ipTags
          break
        }
      }
      if (this.entity.entityType === 'domain' || this.entity.entityType === 'ip') {
        axios.get(`${url}?resource=${this.entity.entityValue}`).then(responese => {
          const res = responese.data
          if (responese.status === 200) {
            formatTags(res.data, this.entity.entityType, this.levelTwoTags)
            if (_.isArray(res.data.tags)) {
              this.levelTwoTags = _.concat(this.levelTwoTags, res.data.tags.map(tag => ({ value: tag.name, color: intentColor[tag.intent] || entityDefaultColor })))
            }
            this.hideTagArea = _.isEmpty(this.levelTwoTags)
          }
        })
      }
    },
    /* 切换折叠状态 */
    switchCollapse () {
      this.isCollapse = !this.isCollapse
      // 因为默认的背景白色会导致showhint的box-shadow被盖住，所以展开详情时才渲染颜色
      if (this.isCollapse) {
        this.$refs.rowBlock.style.cssText = 'background-color: none'
      } else {
        this.$refs.rowBlock.style.cssText = 'background-color: var(--el-fill-color-blank)'
      }
      this.$emit('switchCollapse', this.isCollapse, this.index)
    },
    /* 设为折叠状态 */
    collapse () {
      this.isCollapse = true
    },
    getEntity (data) {
      this.entityData = { ...data }
    },
    getEventNum (data) {
      this.eventNum = data
    }
  }
}
</script>
