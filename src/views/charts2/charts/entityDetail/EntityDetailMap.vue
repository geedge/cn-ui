<template>
  <div class="subscriber-map">
    <div class="subscriber-map-header">
      <div class="subscriber-map-title">{{$t('subscriber.locationTrack')}}</div>
      <date-time-range
          class="entity-detail-date-time-range"
          :start-time="timeFilter.startTime"
          :end-time="timeFilter.endTime"
          :date-range="timeFilter.dateRangeValue"
          ref="dateTimeRange"
          @change="reload"
      />
    </div>

    <div class="subscriber-map-body">
      <chart-no-data v-if="isNoData" test-id="noData" style="width: calc(100% - 312px)"></chart-no-data>
      <chart-error v-if="showError" :content="errorMsg" style="width: calc(100% - 312px)" />
      <div id="subscriberMap" class="subscriber-map" style="width: calc(100% - 310px)"></div>

      <!-- 右侧数据栏-trace -->
      <div class="analysis-statistics" id="subscribersBlock" style="position: absolute;right: 0;top: 0;">
        <div class="analysis-statistics__subscribers">
          <div class="analysis-statistics__subscriber" style="height: 664px;">
            <chart-no-data v-if="trackingNoData" test-id="trackingNoData" style="width: calc(100% - 20px);height: 100%;"></chart-no-data>
            <chart-error v-if="showTrackingError" :content="trackingErrorMsg" style="width: calc(100% - 20px);margin-left: 20px;" />
            <div v-if="!trackingNoData && !showTrackingError" class="subscriber__body">
              <div class="body-item-record">
                <div class="item-record__header">{{ $t('location.trackRecord') }}</div>
                <div class="item-record__info">
                  <div class="circle"></div>
                </div>
                <div class="item-record__timeline">

                  <div class="scroll-view" @scroll="onScroll" :id="trackingSubscriber.subscriberId">
                    <!-- 虚拟列表 -->
                    <div class="virtual-scroller" :style="`height: ${trackingSubscriber.listHeight}px`"></div>
                    <div class="scroll-list" :style="`transform: translateY(${trackingSubscriber.startOffset}px)`">
                      <div class="scroll__item"
                           v-for="(record, index) in trackingSubscriber.trackRecords.slice(trackingSubscriber.scrollStartIndex, trackingSubscriber.scrollEndIndex)"
                           :key="index"
                           @mouseenter="timelineMouseEnter(trackingSubscriber, record)"
                           @mouseleave="timelineMouseLeave(trackingSubscriber, record)"
                      >
                        <div class="item-circle">
                          <div class="circle-circle"></div>
                          <div class="circle-line"></div>
                        </div>
                        <div class="item-content">
                          <div>
                            <span>{{$t('overall.location')}}: </span><span class="item__value">{{record.subscriberLongitude}},&nbsp;{{record.subscriberLatitude}}</span>
                          </div>
                          <div>
                            <span>{{ $t('location.timeOfArrival') }}: </span><span class="item__value">{{dateFormatByAppearance(Number(record.time))}}</span>
                          </div>
                          <div>
                            <span>{{ $t('location.residenceTime') }}: </span><span class="item__value">{{record.stayTime}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图point悬浮框 -->
<!--    <div class="subscriber-map-point-tooltip" v-if="tooltip.showTooltip" :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}">-->
<!--      <div class="subscriber-map-point-tooltip__time">{{dateFormatByAppearance(currentPoint.stat_time)}}</div>-->
<!--      <div class="subscriber-map-point-tooltip__coordinates">-->
<!--        <div class="subscriber-map-point-tooltip__coordinate">-->
<!--          <div class="coordinate__label">{{$t('overall.longitude')}}</div>-->
<!--          <div class="coordinate__value">{{currentPoint.longitude}}</div>-->
<!--        </div>-->
<!--        <div class="subscriber-map-point-tooltip__coordinate">-->
<!--          <div class="coordinate__label">{{$t('overall.latitude')}}</div>-->
<!--          <div class="coordinate__value">{{currentPoint.latitude}}</div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

    <div class="geo-analysis__hexagon-tooltip" id="tooltip" :class="`geo-analysis__hexagon-tooltip--${tooltip.type}`" v-if="tooltip.showMarkerTooltip || tooltip.showPolygonTooltip" :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}" @mouseenter="tooltipMouseEnter" @mouseleave="tooltipMouseLeave">
      <div class="hexagon-tooltip__header" :style="`background-color: ${tooltipHeaderColor}`">
        <div class="header__icon">
          <svg v-if="tooltip.type === tooltipType.hexagon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="36" height="36"><path d="M747.52 921.088H277.504L42.496 514.048l235.008-407.04H747.52l235.008 407.04-235.008 407.04z m-425.472-76.8h381.44l190.464-330.24-190.464-330.24h-381.44l-190.464 330.24 190.464 330.24z"></path></svg>
          <template v-else-if="tooltip.type === tooltipType.human">
            <div class="icon__box">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z"></path></svg>
            </div>
          </template>
          <template v-else-if="tooltip.type === tooltipType.baseStation">
            <div class="icon__box">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M164.901926 519.585185a391.35763 391.35763 0 0 1-30.151111-152.38637c0-52.527407 10.05037-105.054815 30.151111-152.348445 15.094519-47.29363 45.283556-89.353481 80.516741-126.103703L174.990222 15.17037C129.706667 62.464 94.511407 114.991407 69.328593 178.062222 44.183704 241.095111 34.133333 304.165926 34.133333 367.198815c0 63.070815 10.05037 131.375407 35.19526 189.174518 25.182815 57.799111 60.378074 115.598222 105.661629 162.891852l70.428445-73.576296c-35.233185-36.788148-65.422222-78.810074-80.516741-126.103704z" p-id="8786"></path><path d="M255.469037 477.563259c15.094519 36.788148 35.195259 68.266667 60.340148 94.549334l70.428445-73.576297a233.168593 233.168593 0 0 1-40.201482-57.761185c-5.044148-26.282667-10.088296-47.29363-10.088296-73.576296 0-26.244741 5.044148-47.29363 15.094518-68.266667 5.006222-26.282667 20.100741-42.097778 35.19526-63.070815l-70.428445-73.576296c-25.144889 26.282667-45.24563 57.799111-60.340148 94.587259-15.094519 36.788148-20.100741 73.576296-20.100741 110.364445 0 36.788148 5.006222 73.53837 20.100741 110.326518zM436.527407 367.198815c0 43.538963 33.792 78.810074 75.472593 78.810074s75.472593-35.271111 75.472593-78.810074c0-43.501037-33.792-78.810074-75.472593-78.810074s-75.472593 35.271111-75.472593 78.810074zM637.76237 498.574222l70.428445 73.576297c25.144889-26.282667 45.24563-57.837037 60.340148-94.58726 15.094519-36.788148 20.100741-73.576296 20.100741-110.364444 0-36.788148-5.006222-73.576296-20.100741-110.364445-15.094519-36.750222-35.195259-68.266667-60.340148-94.549333l-70.428445 73.576296c15.094519 15.739259 30.189037 36.788148 40.201482 57.799111 10.088296 21.010963 15.132444 47.29363 15.132444 68.266667 0 26.282667-5.044148 47.331556-15.094518 68.342519-10.05037 31.516444-25.144889 47.29363-40.239408 68.266666z" p-id="8787"></path><path d="M954.671407 178.062222C929.488593 114.991407 894.293333 62.464 849.009778 15.17037L778.619259 88.746667c35.233185 36.788148 60.378074 78.810074 80.516741 126.103703 20.100741 47.255704 30.151111 99.821037 30.151111 152.348445 0 52.565333-10.05037 105.092741-30.151111 152.38637-20.100741 47.29363-45.283556 89.315556-80.516741 126.103704l70.428445 73.576296c45.283556-47.29363 80.478815-99.858963 105.661629-162.891852 25.144889-63.070815 35.195259-126.103704 35.19526-189.174518 0-63.032889-10.05037-131.337481-35.19526-189.136593zM210.185481 1024h603.629038L512 551.10163 210.185481 1024z m186.102519-105.054815L512 740.238222l115.674074 178.631111h-231.348148z"></path></svg>
            </div>
          </template>
        </div>
        <div class="header__title">
          <template v-if="tooltip.type === tooltipType.hexagon">HEX</template>
          <template v-else-if="tooltip.type === tooltipType.human">MSISDN</template>
          <template v-else-if="tooltip.type === tooltipType.baseStation">CID</template>
        </div>
        <div class="header__content">
          <template v-if="tooltip.type === tooltipType.hexagon">{{currentPolygon.hexId}}</template>
          <template v-else-if="tooltip.type === tooltipType.human">{{currentSubscriber.subscriberDto.phoneNumber}}</template>
          <template v-else-if="tooltip.type === tooltipType.baseStation">0xxa8805</template>
        </div>
      </div>
      <div class="hexagon-tooltip__body">
        <template v-if="tooltip.type === tooltipType.hexagon">
          <template v-if="activeTab === 'locationMap'">
            <div class="body__item">
              <div class="item__label">{{ $t('location.number') }}</div>
              <div class="item__value">{{currentPolygon.number}}</div>
            </div>
            <div class="body__item">
              <div class="item__label">{{ $t('location.locals') }}</div>
              <div class="item__value">{{currentPolygon.number}}</div>
            </div>
            <div class="body__item">
              <div class="item__label">{{ $t('location.visitors') }}</div>
              <div class="item__value">{{currentPolygon.number}}</div>
            </div>
            <div class="body__item">
              <div class="item__label">{{ $t('location.roamers') }}</div>
              <div class="item__value">{{currentPolygon.number}}</div>
            </div>
          </template>
          <template v-else>
            <template v-for="(item, i) in JSON.parse(currentPolygon.locations)" :key="item.hexId">
              <div class="body__timeline" v-if="i < 5">
                <div class="timeline-symbol"></div>
                <div>
                  <div class="body__item">
                    <div class="item__label">{{ $t('location.location') }}</div>
                    <div class="item__value">{{item.longitude}},&nbsp;{{item.latitude}}</div>
                  </div>
                  <div class="body__item">
                    <div class="item__label">Time</div>
                    <div class="item__value">{{dateFormatByAppearance(Number(item.time))}}</div>
                  </div>
                </div>
              </div>
            </template>
            <div class="body__timeline" v-if="JSON.parse(currentPolygon.locations).length > 5">...</div>
          </template>
        </template>
        <template v-else-if="tooltip.type === tooltipType.human">
          <div class="body__item">
            <div class="item__label">ID</div>
            <div class="item__value">{{currentSubscriber.subscriberId}}</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{$t('entities.group')}}</div>
            <div class="item__value">Terrorist</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{$t('overall.info')}}</div>
            <div class="item__value">Leader</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{$t('overall.location')}}</div>
            <div class="item__value">China, Shanghai</div>
          </div>
          <div class="body__tracking" @click="trackSubscriber(currentSubscriber)">{{$t('location.traceTracking')}}</div>
        </template>
        <template v-else-if="tooltip.type === tooltipType.baseStation">
          <div class="body__item">
            <div class="item__label">{{ $t('location.locationAreaCode') }}</div>
            <div class="item__value">12</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{ $t('location.mobileNetworkCode') }}</div>
            <div class="item__value">1</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{ $t('location.communicationType') }}</div>
            <div class="item__value">4G</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{$t('overall.location')}}</div>
            <div class="item__value">China, Shanghai</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import maplibregl from 'maplibre-gl'
import mapStyle from './mapStyle'
import axios from 'axios'
import { api } from '@/utils/api'
import 'maplibre-gl/dist/maplibre-gl.css'
import _ from 'lodash'
import { ref, shallowRef } from 'vue'
import { getNowTime, getSecond, dateFormatByAppearance } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
import { defaultMapConfig, storageKey, unitTypes } from '@/utils/constants'
import { h3ToGeo, h3ToGeoBoundary } from 'h3-js'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'
const humanSvg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z"></path></svg>'
const baseStationSvg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M164.901926 519.585185a391.35763 391.35763 0 0 1-30.151111-152.38637c0-52.527407 10.05037-105.054815 30.151111-152.348445 15.094519-47.29363 45.283556-89.353481 80.516741-126.103703L174.990222 15.17037C129.706667 62.464 94.511407 114.991407 69.328593 178.062222 44.183704 241.095111 34.133333 304.165926 34.133333 367.198815c0 63.070815 10.05037 131.375407 35.19526 189.174518 25.182815 57.799111 60.378074 115.598222 105.661629 162.891852l70.428445-73.576296c-35.233185-36.788148-65.422222-78.810074-80.516741-126.103704z" p-id="8786"></path><path d="M255.469037 477.563259c15.094519 36.788148 35.195259 68.266667 60.340148 94.549334l70.428445-73.576297a233.168593 233.168593 0 0 1-40.201482-57.761185c-5.044148-26.282667-10.088296-47.29363-10.088296-73.576296 0-26.244741 5.044148-47.29363 15.094518-68.266667 5.006222-26.282667 20.100741-42.097778 35.19526-63.070815l-70.428445-73.576296c-25.144889 26.282667-45.24563 57.799111-60.340148 94.587259-15.094519 36.788148-20.100741 73.576296-20.100741 110.364445 0 36.788148 5.006222 73.53837 20.100741 110.326518zM436.527407 367.198815c0 43.538963 33.792 78.810074 75.472593 78.810074s75.472593-35.271111 75.472593-78.810074c0-43.501037-33.792-78.810074-75.472593-78.810074s-75.472593 35.271111-75.472593 78.810074zM637.76237 498.574222l70.428445 73.576297c25.144889-26.282667 45.24563-57.837037 60.340148-94.58726 15.094519-36.788148 20.100741-73.576296 20.100741-110.364444 0-36.788148-5.006222-73.576296-20.100741-110.364445-15.094519-36.750222-35.195259-68.266667-60.340148-94.549333l-70.428445 73.576296c15.094519 15.739259 30.189037 36.788148 40.201482 57.799111 10.088296 21.010963 15.132444 47.29363 15.132444 68.266667 0 26.282667-5.044148 47.331556-15.094518 68.342519-10.05037 31.516444-25.144889 47.29363-40.239408 68.266666z" p-id="8787"></path><path d="M954.671407 178.062222C929.488593 114.991407 894.293333 62.464 849.009778 15.17037L778.619259 88.746667c35.233185 36.788148 60.378074 78.810074 80.516741 126.103703 20.100741 47.255704 30.151111 99.821037 30.151111 152.348445 0 52.565333-10.05037 105.092741-30.151111 152.38637-20.100741 47.29363-45.283556 89.315556-80.516741 126.103704l70.428445 73.576296c45.283556-47.29363 80.478815-99.858963 105.661629-162.891852 25.144889-63.070815 35.195259-126.103704 35.19526-189.174518 0-63.032889-10.05037-131.337481-35.19526-189.136593zM210.185481 1024h603.629038L512 551.10163 210.185481 1024z m186.102519-105.054815L512 740.238222l115.674074 178.631111h-231.348148z"></path></svg>'

export default {
  name: 'EntityDetailMap',
  mixins: [chartMixin],
  components: {
    ChartError,
    ChartNoData
  },
  data () {
    return {
      tooltipType: {
        hexagon: 'hexagon',
        baseStation: 'base-station',
        human: 'human'
      }
    }
  },
  mounted () {
    this.initMap()
  },
  unmounted () {
    this.mapChart && this.mapChart?.remove?.()
    this.mapChart = null
  },
  computed: {
    tooltipHeaderColor () {
      if (this.tooltip.type === this.tooltipType.hexagon) {
        const color = this.currentPolygon.color.split(',')
        color[0] = color[0].split('[')[1]
        color[2] = color[2].split(']')[0]
        return `rgba(${color.join(',')},.8)`
      } else if (this.tooltip.type === this.tooltipType.human) {
        return '#38ACD2'
      } else if (this.tooltip.type === this.tooltipType.baseStation) {
        return '#233447'
      }
      return ''
    }
  },
  watch: {
    // 切换追踪的用户
    currentShowSubscriber (n) {
      this.mapChart.getLayer('trackingHexagon') && this.mapChart.removeLayer('trackingHexagon')
      this.mapChart.getLayer('trackingLine') && this.mapChart.removeLayer('trackingLine')
      this.mapChart.getSource('trackingHexGrid') && this.mapChart.removeSource('trackingHexGrid')
      this.mapChart.getSource('trackingLineSource') && this.mapChart.removeSource('trackingLineSource')
      this.trackingHumanMarker.remove && this.trackingHumanMarker.remove()
      this.trackingHumanMarker = {}
      if (n) {
        this.renderTrackingHexagon()
      }
    },
    timeFilter (n) {
      this.unbindTrackingHexagonEvents()
      this.mapChart.getLayer('trackingHexagon') && this.mapChart.removeLayer('trackingHexagon')
      this.mapChart.getLayer('trackingLine') && this.mapChart.removeLayer('trackingLine')
      this.mapChart.getSource('trackingHexGrid') && this.mapChart.removeSource('trackingHexGrid')
      this.mapChart.getSource('trackingLineSource') && this.mapChart.removeSource('trackingLineSource')
      this.trackingHumanMarker.remove && this.trackingHumanMarker.remove()
      this.trackingHumanMarker = {}
      this.changeTimeFilterToInitList()
      this.initTraceTrackingTab()
    }
  },
  methods: {
    dateFormatByAppearance,
    async initMap () {
      const _this = this
      this.toggleLoading(false)
      this.mapChart = new maplibregl.Map({
        container: 'subscriberMap',
        style: mapStyle,
        center: this.center,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        zoom: this.defaultZoom
      })
      maplibregl.addProtocol('cn', (params, callback) => { // 切片显示接口 防止跨域的问题
        fetch(`${params.url.split('://')[1]}`)
          .then(t => {
            if (t.status == 200) {
              t.arrayBuffer().then(arr => {
                callback(null, arr, null, null)
              })
            } else {
              callback(new Error(`Tile fetch error: ${t.statusText}`))
            }
          })
          .catch(e => {
            callback(new Error(e))
          })
        return { cancel: () => { } }
      })
      this.mapChart.on('load', async () => {
        // 加载地图上的基站，基站不随tab的切换而改变
        const baseStationData = await _this.queryBaseStation()
        _this.renderMarker(baseStationData, _this.tooltipType.baseStation)

        _this.initTraceTrackingTab()
      })
    },
    async initTraceTrackingTab () {
      await this.queryTraceTracking()
      if (!this.currentShowSubscriber && this.trackingSubscriber) {
        this.currentShowSubscriber = this.trackingSubscriber
      }
      this.renderTrackingHexagon()
    },
    async queryBaseStation () {
      // this.loading.baseStationLoading = true
      try {
        // const response = await axios.get(api.location.baseStation)
        const response = [
          {
            longitude: 116.38,
            latitude: 39.9
          },
          {
            longitude: 116.39,
            latitude: 39.9
          },
          {
            longitude: 116.383,
            latitude: 39.886
          },
          {
            longitude: 116.378,
            latitude: 39.902
          },
          {
            longitude: 116.369,
            latitude: 39.91
          },
          {
            longitude: 116.38,
            latitude: 39.91
          }
        ]
        return response // response.data.data.list
      } catch (e) {
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        // this.loading.baseStationLoading = false
      }
      return []
    },
    queryData () {
      /* return new Promise((resolve, reject) => {
        resolve({
          status: 200,
          data: {
            data: {
              result: [
                {
                  stat_time: 1701259999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.29,
                  subscriber_latitude: 39.8
                },
                {
                  stat_time: 1701269999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.34,
                  subscriber_latitude: 39.85
                },
                {
                  stat_time: 1701279999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.29,
                  subscriber_latitude: 39.9
                },
                {
                  stat_time: 1701299999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.39,
                  subscriber_latitude: 39.9
                },
                {
                  stat_time: 1701289999,
                  subscriber_id: '883849',
                  subscriber_longitude: 116.3,
                  subscriber_latitude: 39.97
                }
              ]
            }
          }
        })
      }) */
      const params = {
        resource: `'${this.entity.entityName}'`,
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        dateRangeValue: this.timeFilter.dateRangeValue
      }
      return axios.get(`${api.entity.locationTrack}`, { params })
    },
    generateRouteGEOJSON (result) {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: result.map(r => [r.subscriber_longitude, r.subscriber_latitude])
            }
          }
        ]
      }
    },
    generatePointsGEOJSON (result) {
      return {
        type: 'FeatureCollection',
        features: result.map((r, index) => {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [r.subscriber_longitude, r.subscriber_latitude]
            },
            properties: {
              index: index + 1,
              stat_time: r.stat_time,
              longitude: r.subscriber_longitude,
              latitude: r.subscriber_latitude
            }
          }
        })
      }
    },
    generateRouteLayer () {
      return {
        id: 'route',
        source: 'route',
        type: 'line',
        paint: {
          'line-color': '#E26154',
          'line-width': 4,
          'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0,
            '#F4B32F',
            1,
            '#E26154'
          ]
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        }
      }
    },
    generatePointsLayer () {
      return {
        id: 'points',
        type: 'symbol',
        source: 'points',
        layout: {
          'icon-image': 'trace-point',
          'icon-size': 0.7,
          'icon-offset': [0, -20],
          'text-field': ['get', 'index'],
          'text-font': ['Noto Sans Bold'],
          'text-offset': [0, -1.1],
          'text-size': 13
        },
        paint: {
          'text-color': '#FFF'
        }
      }
    },
    computeMapCenter (result) {
      const longitude = result.map(r => r.subscriber_longitude)
      const latitude = result.map(r => r.subscriber_latitude)
      return [
        _.floor((_.max(longitude) + _.min(longitude)) / 2, 6),
        _.floor((_.max(latitude) + _.min(latitude)) / 2, 6)
      ]
    },
    computeMapZoom (result) {
      const longitude = result.map(r => r.subscriber_longitude)
      const latitude = result.map(r => r.subscriber_latitude)
      const longitudeRange = _.max(longitude) - _.min(longitude)
      const latitudeRange = _.max(latitude) - _.min(latitude)
      const max = _.max([this.minZoom, 7 - Math.log2(_.max([longitudeRange, latitudeRange]))])
      return _.min([max, this.maxZoom])
    },
    reload (startTime, endTime, dateRangeValue) {
      this.timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime), dateRangeValue: dateRangeValue }
      const { query } = this.$route
      this.$store.commit('setTimeRangeArray', [this.timeFilter.startTime, this.timeFilter.endTime])
      this.$store.commit('setTimeRangeFlag', dateRangeValue.value)

      const newUrl = urlParamsHandler(window.location.href, query, {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        range: dateRangeValue.value
      })
      overwriteUrl(newUrl)
      // this.toggleLoading(true)
      // this.timeFilter = { startTime: getSecond(startTime), endTime: getSecond(endTime), dateRangeValue: dateRangeValue }
      // this.queryData().then(res => {
      //   this.showError = false
      //   const result = _.get(res, 'data.data.result', []).sort((a, b) => a.stat_time - b.stat_time)
      //   console.info(result)
      //   const route = this.generateRouteGEOJSON(result)
      //   const points = this.generatePointsGEOJSON(result)
      //   this.mapChart.getSource('route').setData(route)
      //   this.mapChart.getSource('points').setData(points)
      //   if (result.length > 0) {
      //     this.mapChart.jumpTo({ center: this.computeMapCenter(result) })
      //     this.mapChart.zoomTo(this.computeMapZoom(result))
      //   }
      // }).catch(e => {
      //   this.showError = true
      //   console.error(e)
      //   this.errorMsg = this.errorMsgHandler(e)
      // }).finally(() => {
      //   this.toggleLoading(false)
      // })
    },
    async queryTraceTracking () {
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        dateRangeValue: this.timeFilter.dateRangeValue,
        subscriberIds: `'${this.entity.entityName}'`,
        level: this.mapLevel
      }
      this.trackingSubscriber.subscriberId = this.entity.entityName
      try {
        const response = await axios.get(api.location.tracking, { params })
        if (response.data.data.result) {
          this.trackingNoData = false
          this.showTrackingError = false
          const find = response.data.data.result.find(item => item.subscriberId === this.trackingSubscriber.subscriberId)
          if (find) {
            this.trackingSubscriber.trackRecords = find.trackRecords
          } else {
            this.trackingSubscriber.trackRecords = []
          }
          this.trackingSubscriber.show = false
        } else {
          this.trackingSubscriber.trackRecords = []
        }

        // 计算停留时间
        if (this.trackingSubscriber.trackRecords.length > 0) {
          const trackRecords = this.trackingSubscriber.trackRecords
          // 初始化时间线可视范围角标
          if (trackRecords.length < 11) {
            this.trackingSubscriber.scrollStartIndex = 0
            this.trackingSubscriber.scrollEndIndex = trackRecords.length
          } else {
            this.trackingSubscriber.scrollStartIndex = 0
            this.trackingSubscriber.scrollEndIndex = 11
          }

          if (trackRecords && trackRecords.length > 0) {
            for (let i = 0; i < trackRecords.length; i++) {
              if (i > 0) {
                if ((trackRecords[i - 1].subscriberLongitude === trackRecords[i].subscriberLongitude) && (trackRecords[i - 1].subscriberLatitude === trackRecords[i].subscriberLatitude)) {
                  // 如果连续两条地址重复，则将时间累加，并将上一条删除，键值-1继续循环
                  if (i > 1 && trackRecords[i - 2]) {
                    const stayTime = unitConvert(trackRecords[i - 2].time - trackRecords[i].time, unitTypes.time, 's')
                    if (Number(stayTime[0]) === Number(Number(stayTime[0]).toFixed(0))) {
                      stayTime[0] = Number(stayTime[0]).toFixed(0)
                    }
                    trackRecords[i].stayTime = stayTime.join(' ')
                  } else {
                    // 数据只有2条，或者第1条和第2条地点重复，删除1，合并时间
                    const stayTime = unitConvert(trackRecords[i - 1].time - trackRecords[i].time, unitTypes.time, 's')
                    if (Number(stayTime[0]) === Number(Number(stayTime[0]).toFixed(0))) {
                      stayTime[0] = Number(stayTime[0]).toFixed(0)
                    }
                    trackRecords[i].stayTime = stayTime.join(' ')
                  }
                  trackRecords.splice(i - 1, 1)
                  i = i - 1
                } else {
                  const stayTime = unitConvert(trackRecords[i - 1].time - trackRecords[i].time, unitTypes.time, 's')
                  if (Number(stayTime[0]) === Number(Number(stayTime[0]).toFixed(0))) {
                    stayTime[0] = Number(stayTime[0]).toFixed(0)
                  }
                  trackRecords[i].stayTime = stayTime.join(' ')
                }
                if (i === trackRecords.length - 1) {
                  // 初始化数据时，重置偏移量和列表高度
                  this.trackingSubscriber.startOffset = 0
                  this.trackingSubscriber.listHeight = i * this.scrollInfo.itemSize
                }
              } else {
                trackRecords[i].stayTime = '-'
              }
            }
          }
          this.trackingSubscriber.trackRecords = trackRecords
        } else {
          this.trackingNoData = true
        }
      } catch (e) {
        this.showTrackingError = true
        this.trackingErrorMsg = this.errorMsgHandler(e)
        console.error(e)
      } finally {
        // this.loading.trackingMapLoading = false
      }
    },
    onScroll (e) {
      // 当前滚动位置
      const scrollTop = e.target.scrollTop
      // 列表开始索引
      const startIndex = Math.floor(scrollTop / this.scrollInfo.itemSize) || 0
      // 列表结束索引
      const endIndex = Math.ceil((scrollTop + this.scrollInfo.containerHeight) / this.scrollInfo.itemSize)
      this.trackingSubscriber.scrollStartIndex = startIndex
      this.trackingSubscriber.scrollEndIndex = endIndex
      // 列表距离顶部距离
      this.trackingSubscriber.startOffset = scrollTop - (scrollTop % this.scrollInfo.itemSize)
    },
    tooltipMouseEnter () {
      this.tooltip.mouseInMarkerOrTooltip = true
    },
    tooltipMouseLeave (event) {
      if (this.currentMarkerDom && !this.currentMarkerDom.contains(event.relatedTarget)) {
        this.tooltip.mouseInMarkerOrTooltip = false
        this.tooltip.showMarkerTooltip = false
        this.currentMarkerDom.classList.remove('map-marker--hover')
      }
    },
    trackingHexagonMouseEnter () {
      this.tooltip.mouseIsInPolygon = true
    },
    trackingHexagonMouseLeave () {
      this.tooltip.showPolygonTooltip = false
      this.tooltip.mouseIsInPolygon = false
      // 去掉上一块的高亮
      this.hoverTrigger('trackingHexGrid', this.currentPolygon.id, false)
    },
    trackingHexagonMouseMove (e) {
      const { originalEvent, features } = e
      if (!this.tooltip.mouseInMarkerOrTooltip) {
        this.tooltip.showPolygonTooltip = true
        this.tooltip.type = this.tooltipType.hexagon
        if (this.tooltip.type === this.tooltipType.hexagon && this.currentPolygon.id && this.currentPolygon.id !== features[0].id) {
          // 去掉上一块的高亮
          this.hoverTrigger('trackingHexGrid', this.currentPolygon.id, false)
        }
        this.currentPolygon = features[0].properties
        this.currentPolygon.id = features[0].id
        this.currentPolygon.location = `${h3ToGeo(this.currentPolygon.hexId)[1]}, ${h3ToGeo(this.currentPolygon.hexId)[0]}`
        this.tooltip.x = originalEvent.clientX + 15
        this.tooltip.y = originalEvent.clientY + 5

        // 鼠标滑过高亮
        this.hoverTrigger('trackingHexGrid', this.currentPolygon.id, true)
      }
    },
    bindMarkerEvent (el, markerData, type) {
      el.addEventListener('mouseenter', e => {
        this.currentMarkerDom = el
        if (type === this.tooltipType.human) {
          this.currentSubscriber = markerData
          if (!this.tooltip.mouseInMarkerOrTooltip) {
            this.tooltip.x = e.clientX + 15 - e.offsetX
            this.tooltip.y = (e.clientY + 15 - e.offsetY + this.tooltipDomHeight.human) > this.mapDomHeight ? (this.mapDomHeight - this.tooltipDomHeight.human) : (e.clientY + 15 - e.offsetY)
          }
        } else if (type === this.tooltipType.baseStation) {
          this.currentBaseStation = markerData
          if (!this.tooltip.mouseInMarkerOrTooltip) {
            this.tooltip.x = e.clientX + 15 - e.offsetX
            this.tooltip.y = (e.clientY + 15 - e.offsetY + this.tooltipDomHeight.baseStation) > this.mapDomHeight ? (this.mapDomHeight - this.tooltipDomHeight.baseStation) : (e.clientY + 15 - e.offsetY)
          }
        }

        this.tooltip.mouseInMarkerOrTooltip = true
        this.tooltip.type = type
        this.tooltip.showMarkerTooltip = true
        el.classList.add('map-marker--hover')
      })
      el.addEventListener('mouseleave', event => {
        const tooltipDom = document.getElementById('tooltip')
        if (!tooltipDom.contains(event.relatedTarget)) {
          el.classList.remove('map-marker--hover')
          this.tooltip.mouseInMarkerOrTooltip = false
          this.tooltip.showMarkerTooltip = false
        }
      })
      if (type === this.tooltipType.human) {
        el.addEventListener('click', e => {
          this.humanMarkers.forEach(m => {
            m.getElement().classList.remove('map-marker--highlight')
          })
          if (this.highlightSubscriber.subscriberId !== markerData.subscriberId) {
            el.classList.add('map-marker--highlight')
            this.highlightSubscriber = markerData
            // 将滚动条跳转到对应位置
            document.querySelector(`#locationMap-subscriberId-${markerData.subscriberId}`).scrollIntoView({ behavior: 'smooth', block: 'center' })
          } else {
            this.highlightSubscriber = {}
          }
        })
      }
    },
    // 地图上人图标鼠标悬浮框中点击追踪事件
    trackSubscriber (subscriber) {
      const find = this.trackingSubscribers.find(s => s.subscriberId === subscriber.subscriberId)
      if (!find) {
        this.trackingSubscribers.push({ ...subscriber, show: false, showLine: false, scrollStartIndex: 0, scrollEndIndex: 11, startOffset: 0, listHeight: 0 })
      }
      this.currentShowSubscriber = subscriber
      this.activeTab = 'traceTracking'
      this.tooltip.showMarkerTooltip = false
    },
    unbindTrackingHexagonEvents () {
      this.mapChart.off('mouseenter', this.trackingHexagonMouseEnter)
      this.mapChart.off('mouseleave', this.trackingHexagonMouseLeave)
      this.mapChart.off('mousemove', this.trackingHexagonMouseMove)
    },
    renderTrackingMarker (coordinates) {
      const el = document.createElement('div')
      el.className = 'map-tracking-marker'
      el.innerHTML = `<div class="tracking-marker__inner-circle">${humanSvg}</div>`
      this.trackingHumanMarker = new maplibregl.Marker({ element: el }).setLngLat(coordinates).addTo(this.mapChart)
    },
    renderTrackingHexagon () {
      if (!this.currentShowSubscriber) {
        return true
      }
      const currentShowSubscriberRecords = this.currentShowSubscriber.trackRecords
      if (currentShowSubscriberRecords && currentShowSubscriberRecords.length > 0) {
        // 六边形
        this.trackingPolygonSourceData = this.hexagonDataConverter(this.currentShowSubscriber.trackRecords)
        this.mapChart.addSource('trackingHexGrid', {
          type: 'geojson',
          data: this.trackingPolygonSourceData
        })
        this.mapChart.addLayer({
          id: 'trackingHexagon',
          type: 'fill',
          source: 'trackingHexGrid',
          layout: {},
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.75, 0.5]
          }
        })
        // 轨迹线
        const mapLineSourceData = this.mapLineDataConverter()
        this.mapChart.addSource('trackingLineSource', {
          type: 'geojson',
          data: mapLineSourceData
        })
        this.mapChart.addLayer({
          id: 'trackingLine',
          type: 'line',
          source: 'trackingLineSource',
          paint: {
            'line-color': 'rgba(222, 52, 52, .8)',
            'line-width': 3
          }
        })
        // 最后所在地的图标
        const coordinate = h3ToGeo(currentShowSubscriberRecords[0].hexId)
        this.renderTrackingMarker([coordinate[1], coordinate[0]])
        this.bindTrackingHexagonEvents()
      }
    },
    mapLineDataConverter () {
      const records = this.currentShowSubscriber.trackRecords
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: records.map(d => {
            const cs = h3ToGeo(d.hexId)
            return [cs[1], cs[0]]
          })
        }
      }
      return {
        type: 'FeatureCollection',
        features: [feature]
      }
    },
    renderMarker (data, type) {
      let svg
      if (type === this.tooltipType.baseStation) {
        svg = baseStationSvg
      } else if (type === this.tooltipType.human) {
        svg = humanSvg
      }
      try {
        data.forEach(marker => {
          if (type === this.tooltipType.human && marker.subscriberDto) {
            const el = document.createElement('div')
            el.className = `map-marker map-marker--${type}`
            if (marker.subscriberId === this.highlightSubscriber.subscriberId) {
              el.classList.add('map-marker--highlight')
            }
            el.innerHTML = svg
            // 鼠标事件，控制tooltip显示和marker尺寸
            this.bindMarkerEvent(el, marker, type)
            const mapMarker = new maplibregl.Marker({ element: el }).setLngLat([marker.subscriberDto.subscriberLongitude, marker.subscriberDto.subscriberLatitude]).addTo(this.mapChart)
            mapMarker.subscriberId = marker.subscriberId
            this.humanMarkers.push(mapMarker)
          } else if (type === this.tooltipType.baseStation) {
            const el = document.createElement('div')
            el.className = `map-marker map-marker--${type}`
            el.innerHTML = svg
            // 鼠标事件，控制tooltip显示和marker尺寸
            this.bindMarkerEvent(el, marker, type)
            const mapMarker = new maplibregl.Marker({ element: el }).setLngLat([marker.longitude, marker.latitude]).addTo(this.mapChart)
            this.baseStationMarkers.push(mapMarker)
          }
        })
      } catch (e) {
        console.error(e)
      }
    },
    hexagonDataConverter (data) {
      const featureCollection = { type: 'FeatureCollection' }
      // 对hexId去重，将重复的hexId的时间合并
      const hexagons = []
      data.forEach(d => {
        const find = hexagons.find(h => h.hexId === d.hexId)
        if (!find) {
          hexagons.push({ hexId: d.hexId, locations: [{ time: d.time, longitude: d.subscriberLongitude, latitude: d.subscriberLatitude }] })
        } else {
          if (find.locations.length < 6) {
            find.locations.push({ time: d.time, longitude: d.subscriberLongitude, latitude: d.subscriberLatitude })
          }
        }
      })
      featureCollection.features = hexagons.map((d, i) => ({
        id: i + 100000,
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            h3ToGeoBoundary(d.hexId, true)
          ]
        },
        properties: {
          hexId: d.hexId,
          number: d.number,
          locations: d.locations,
          color: [37, 55, 128]
        }
      }))
      return featureCollection
    },
    bindTrackingHexagonEvents () {
      this.mapChart.on('mouseenter', 'trackingHexagon', this.trackingHexagonMouseEnter)
      this.mapChart.on('mouseleave', 'trackingHexagon', this.trackingHexagonMouseLeave)
      this.mapChart.on('mousemove', 'trackingHexagon', this.trackingHexagonMouseMove)
    },
    hoverTrigger (source, id, hover) {
      this.mapChart.setFeatureState({ source, id }, { hover })
    },
    timelineMouseEnter (subscriber, record) {
      this.trackingPolygonSourceData.features.forEach(f => {
        this.hoverTrigger('trackingHexGrid', f.id, false)
      })
      if (this.currentShowSubscriber.subscriberId === subscriber.subscriberId) {
        const find = this.trackingPolygonSourceData.features.find(d => d.properties.hexId === record.hexId)
        if (find) {
          this.hoverTrigger('trackingHexGrid', find.id, true)
        }
      }
    },
    timelineMouseLeave (subscriber, record) {
      if (this.currentShowSubscriber.subscriberId === subscriber.subscriberId) {
        const find = this.trackingPolygonSourceData.features.find(d => d.properties.hexId === record.hexId)
        if (find) {
          this.hoverTrigger('trackingHexGrid', find.id, false)
        }
      }
    },
    changeTimeFilterToInitList () {
      this.trackingSubscriber.scrollStartIndex = 0
      this.trackingSubscriber.scrollEndIndex = 11
      this.trackingSubscriber.startOffset = 0
      this.trackingSubscriber.listHeight = 0
      // 高度置为0，是为了切换时间后再打开时间线，让滚动条置顶
      // const timer = setTimeout(() => {
      //   this.trackingSubscriber.listHeight = this.trackingSubscriber.trackRecords.length * this.scrollInfo.itemSize
      //   clearTimeout(timer)
      // }, 100)
    }
  },
  setup () {
    const dateRangeValue = DEFAULT_TIME_FILTER_RANGE.entity.subscriberMap || 60
    const timeFilter = ref({ dateRangeValue })
    const { startTime, endTime } = getNowTime(dateRangeValue)
    timeFilter.value.startTime = startTime
    timeFilter.value.endTime = endTime

    const currentPoint = ref({})
    const tooltip = ref({
      showTooltip: false,
      type: ''
    })
    const myChart = shallowRef({})
    const trackingSubscriber = ref({
      subscriberId: '',
      show: false,
      showLine: false,
      scrollStartIndex: 0,
      scrollEndIndex: 11,
      startOffset: 0,
      listHeight: 0,
      trackRecords: []
    })
    const trackingSubscriberList = ref([])
    const scrollInfo = ref({
      itemSize: 50,
      containerHeight: 660
    })
    const trackingNoData = ref(true)
    const showTrackingError = ref(false)
    const trackingErrorMsg = ref('')
    const tooltipDomHeight = {
      hexagon: 153,
      baseStation: 153,
      human: 167
    }
    const currentPolygon = ref({})
    const currentSubscriber = ref({})
    const trackingHumanMarker = shallowRef({})
    const mapChart = shallowRef(null)
    const baseStationMarkers = shallowRef([])

    const mapConfig = localStorage.getItem(storageKey.mapConfig) ? JSON.parse(localStorage.getItem(storageKey.mapConfig)) : defaultMapConfig
    return {
      timeFilter,
      currentPoint,
      tooltip,
      myChart,
      maxZoom: mapConfig.maxZoom, // 地图最小缩放比例
      minZoom: mapConfig.minZoom, // 地图最大缩放比例
      mapLevel: mapConfig.mapLevel, // 地图精度  1、2、3
      defaultZoom: mapConfig.defaultZoom, // 地图默认缩放比例
      center: mapConfig.center, // 地图默认中心点。北京：[116.38, 39.9] 纽约：[-73.94539, 40.841843]
      trackingSubscriber,
      trackingSubscriberList,
      scrollInfo,
      trackingNoData,
      showTrackingError,
      trackingErrorMsg,
      tooltipDomHeight,
      currentPolygon,
      currentSubscriber,
      trackingHumanMarker,
      trackingPolygonSourceData: shallowRef({}),
      mapChart,
      baseStationMarkers
    }
  }
}
</script>

<style lang="scss">
.map-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: default;
  padding: 0;
  transition: height .1s linear, width .1s linear;

  svg {
    transition: height .1s linear, width .1s linear;
    fill: #fff;
  }

  &.map-marker--human {
    background-color: #233447;
    cursor: pointer;

    svg {
      width: 14px;
      height: 14px;
    }
  }
  &.map-marker--base-station {
    background-color: #585B5F;

    svg {
      width: 12px;
      height: 12px;
    }
  }
  &.map-marker--hover {
    width: 30px;
    height: 30px;
    border: 2px solid rgba(255,255,255,1);
    z-index: 2;

    &.map-marker--human svg {
      width: 21px;
      height: 21px;
    }
    &.map-marker--base-station svg {
      width: 18px;
      height: 18px;
    }
  }
  &.map-marker--highlight {
    width: 30px;
    height: 30px;
    border: 2px solid #fff;
    background-color: rgb(204,68,68);
    z-index: 3;

    svg {
      width: 21px;
      height: 21px;
    }
  }
}
.map-tracking-marker {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
  background-color: rgba(204,68,68,0.50);
  border-radius: 50%;

  .tracking-marker__inner-circle {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(204,68,68,0.80);
    border-radius: 50%;

    svg {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
