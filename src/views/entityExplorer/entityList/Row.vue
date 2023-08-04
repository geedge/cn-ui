<template>
  <div class="cn-entity--list" :style="{ zIndex: !isCollapse ? 1 : 'unset' }">
    <!-- 左侧下拉按钮 -->
    <div class="cn-entity__collapse">
      <span @click="switchCollapse" :class="{ 'reg-down': !isCollapse }">
        <i class="cn-icon cn-icon-arrow-right"></i>
      </span>
    </div>
    <div class="cn-entity__case">
      <div class="cn-entity__icon"><i :class="iconClass"></i></div>
      <div class="cn-entity__row">
        <!--标签-->
        <div class="cn-entity__header" style="display: flex;align-items: center">
          <span class="cn-entity__header-title">{{ entityData.entityValue || 'Unknown' }}</span>
          <span class="entity-detail" style="display: flex;margin-left: 6px;margin-top: 1px;">
            <span v-for="(item, index) in levelTwoTags" :key="index" class="entity-tag entity-tag--small margin-r-10" :class="`entity-tag--level-two-${item.type}`">
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
                  <span class="row-item-value">{{ entityData.location ? entityData.location.country : '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-position"></i>
                  <span class="row-item-label">{{ $t('overall.region') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.location ? ipLocationRegion(entityData.location) : '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-cloud"></i>
                  <span class="row-item-label">{{ $t('entities.asn') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.asn ? entityData.asn.asn : '-' }}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'domain'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-sub-category"></i>
                  <span class="row-item-label">{{ $t('entities.category') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.category ? entityData.category.name : '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-category"></i>
                  <span class="row-item-label">{{ $t('entities.subcategory') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.category ? entityData.category.group : '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-credit-rating"></i>
                  <span class="row-item-label">{{ $t('entities.reputationLevel') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.category ? entityData.category.reputationLevel : '-' }}</span>
                </div>
              </template>
              <template v-else-if="entityData.entityType === 'app'">
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-id"></i>
                  <span class="row-item-label">{{ $t('entities.category') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.category ? entityData.category.appCategory : '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-category"></i>
                  <span class="row-item-label">{{ $t('entities.subcategory') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.category ? entityData.category.appSubcategory : '-' }}</span>
                </div>
                <div class="basic-info__item">
                  <i class="cn-icon cn-icon-sub-category"></i>
                  <span class="row-item-label">{{ $t('entities.risk') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">{{ entityData.category ? appRisk(entityData.category.appRisk) : '-' }}</span>
                </div>
              </template>
              <!-- 通用字段 -->
              <div class="basic-info__item">
                <div class="item__box">
                  <i class="cn-icon cn-icon-rise"></i>
                  <span class="row-item-label">{{ $t('entities.sentThroughput') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">
                    {{
                      valueToRangeValue(entityData.bytesSentRate, unitTypes.byte).join(' ') !=='- ' ? valueToRangeValue(entityData.bytesSentRate, unitTypes.byte).join(' ') + 'ps' : '-'
                    }}
                  </span>
                  <!-- 曲线-->
                  <div class="item-box-loading">
                    <loading :loading="loading" size="small"></loading>
                    <div
                        class="row__charts"
                        :id="`entityDetailSend${entityType}${listMode}`"
                        v-if="entityData.entityType === 'domain'">
                    </div>
                    <div
                        class="row__charts"
                        :id="`entityDetailSend${entityType}${listMode}`"
                        v-if="entityData.entityType === 'app'">
                    </div>
                    <div
                        class="row__charts"
                        :id="`entityDetailSend${entityType}${listMode}`"
                        v-if="entityData.entityType === 'ip'">
                    </div>
                  </div>
                </div>
              </div>

              <div class="basic-info__item">
                <div class="item__box">
                  <i class="cn-icon cn-icon-fall"></i>
                  <span class="row-item-label">{{ $t('entities.receivedThroughput') }}&nbsp;:&nbsp;&nbsp;</span>
                  <span class="row-item-value">
                    {{ valueToRangeValue(entityData.bytesReceivedRate, unitTypes.byte).join(' ') !== '- ' ? valueToRangeValue(entityData.bytesReceivedRate, unitTypes.byte).join(' ') + 'ps' : '-' }}
                  </span>
                  <div class="item-box-loading">
                    <loading :loading="loading" size="small"></loading>
                    <div
                        class="row__charts"
                        :id="`entityDetailReceived${entityType}${listMode}`"
                        v-if="entityData.entityType === 'domain'">
                    </div>
                    <div
                        class="row__charts"
                        :id="`entityDetailReceived${entityType}${listMode}`"
                        v-if="entityData.entityType === 'app'">
                    </div>
                    <div
                        class="row__charts"
                        :id="`entityDetailReceived${entityType}${listMode}`"
                        v-if="entityData.entityType === 'ip'">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="new-show-detail">
        <div @click="showDetail"><i class="cn-icon cn-icon-detail"></i>{{ $t('overall.detail') }} ></div>
        <div @click="showGraph"><i class="cn-icon cn-icon-graph"></i>{{ $t('entities.graph') }} ></div>
      </div>
      <el-collapse-transition>
        <div class="cn-entity__detail-overview" v-if="!isCollapse">
          <el-divider></el-divider>
          <detail-overview :entity="entityData" :time-filter="timeFilter" @reloadEntity="getEntity" />
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
import { entityDetailTags, psiphon3IpType } from '@/utils/constants'
import _ from 'lodash'

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
      isCollapse: true, // 是否是折叠状态
      levelTwoTags: []
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
    this.initData()
    this.initTagsData()
  },
  methods: {
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
      }
      axios.get(`${url}?resource=${this.entity.entityValue}`).then(response => {
        this.$nextTick(() => {
          this.entityData = { ...response.data.data, ...this.entity }
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
        case ('app'): {
          url = api.entity.entityList.appTags
          break
        }
      }
      axios.get(`${url}?resource=${this.entity.entityValue}`).then(responese => {
        const res = responese.data
        if (res.code === 200) {
          Object.keys(res.data).forEach(k => {
            if (k !== 'userDefinedTags' && res.data[k]) {
              Object.keys(res.data[k]).forEach(k2 => {
                const find = entityDetailTags[this.entity.entityType].find(t => t.name === k2)
                if (find) {
                  this.levelTwoTags.push({ key: k2, value: this.tagValueHandler(k, k2, res.data[k][k2]), type: find.type })
                }
              })
            }
          })
          if (_.isArray(res.data.userDefinedTags)) {
            this.levelTwoTags = _.concat(this.levelTwoTags, res.data.userDefinedTags.map(tag => ({ value: tag.tagValue, type: 'normal' })))
          }
          this.hideTagArea = _.isEmpty(this.levelTwoTags)
        }
      })
    },
    tagValueHandler (k, k2, value) {
      if (k === 'psiphon3Ip') {
        if (k2 === 'type') {
          const find = psiphon3IpType.find(t => t.value === value)
          if (find) {
            return find.name
          }
        }
      }
      return value
    },
    /* 切换折叠状态 */
    switchCollapse () {
      this.isCollapse = !this.isCollapse
      this.$emit('switchCollapse', this.isCollapse, this.index)
    },
    /* 设为折叠状态 */
    collapse () {
      this.isCollapse = true
    },
    getEntity (data) {
      this.entityData = { ...data }
    }
  }
}
</script>
