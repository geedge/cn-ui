<template>
  <div class="geo-analysis">
    <el-tabs v-model="activeTab"  class="location-tabs">
      <el-tab-pane :label="$t('location.locationMap')" name="locationMap"></el-tab-pane>
      <el-tab-pane :label="$t('location.traceTracking')" name="traceTracking">
        <template #label>
          <div class="traceTracking-tabs_label">
            {{$t('location.traceTracking')}}
            <div class="traceTracking-num" :style="`opacity:${opacity};`">
              {{trackingSubscribers.length}}
            </div>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 右上角工具栏 -->
    <div class="geo-tools">
      <div class="panel__time">
        <date-time-range
            class="date-time-range"
            :start-time="timeFilter.startTime"
            :end-time="timeFilter.endTime"
            :date-range="timeFilter.dateRangeValue"
            ref="dateTimeRange"
            @change="reload"
        />
        <time-refresh
            class="date-time-range"
            @change="timeRefreshChange"
            :end-time="timeFilter.endTime"
        />
        <div class="divider"><el-divider direction="vertical"></el-divider></div>
        <el-button class="follow"  @click="add" ><i class="cn-icon cn-icon-follow"></i></el-button>
      </div>
    </div>
    <div class="geo-analysis__container">
      <!-- 左侧地图 -->
      <div class="analysis-map">
        <simple-loading size="small" placement="top-end" :loading="loading.mapLoading" v-if="activeTab === 'locationMap'"></simple-loading>
        <simple-loading size="small" placement="top-end" :loading="loading.trackingMapLoading" v-else-if="activeTab === 'traceTracking'"></simple-loading>
        <div id="analysisMap"></div>
      </div>
      <!-- locationMap地图底部的时间轴 -->
      <div class="map-time-line">
        <time-line v-if="activeTab === 'locationMap'" :timeFilter="timeFilter" @change="mapTimeLineChange"></time-line>
      </div>
      <!-- 右侧数据栏-map -->
      <div class="analysis-statistics" id="locationMap-subscriber-scroll" v-show="activeTab === 'locationMap'"
           @scroll="scrollList" >
        <!-- 饼图 -->
        <div class="analysis-statistics__chart">
          <simple-loading size="small" placement="top-end" :loading="loading.pieLoading"></simple-loading>
          <div class="chart__header">{{$t('location.populationDensity')}}</div>
          <div class="chart__body">
            <div class="chart__drawing" id="populationDensityChart"></div>
            <div class="chart__legend">
              <div v-for="legend in pieValueRamp" class="legend-item" :key="legend.color">
                <div class="legend-icon" :style="`background:rgba(${legend.color},.7);`"></div>
                <div class="legend-range" >{{legend.name}}</div>
                <div class="legend-count">{{legend.count}}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 折线图 -->
        <div class="analysis-statistics__chart">
          <simple-loading size="small" placement="top-end" :loading="loading.lineLoading"></simple-loading>
          <div class="chart__header">{{$t('location.activeSubscribers')}}</div>
          <div class="chart__statistics">
            <div class="statistics-number">{{activeCount}}</div>
            <div class="statistics-trend">{{activeCountChain === '-' ? '-' : (activeCountChain < 0 ? '-'+valueToRangeValue(Math.abs(activeCountChain), unitTypes.percent).join(' '): valueToRangeValue(activeCountChain, unitTypes.percent).join(' '))}}</div>
          </div>
          <div class="chart-line__drawing" id="activeSubscribersChart"></div>
        </div>
        <!-- subscriber list -->
        <div class="analysis-statistics__title">
          <span>{{$t('location.subscribers')}}&nbsp;&nbsp;{{subscribersTotalCount}}</span>
          <simple-loading :loading="loading.subscriberLoading" placement="right" size="small"></simple-loading>
        </div>
        <div class="analysis-statistics__search">
          <el-input id="searchValue2"
                    ref="searchValue2"
                    size="small"
                    :placeholder="$t('location.searchSubscriberTip')"
                    v-model="curSearchValue"
                    v-show="activeTab === 'locationMap'"
                    @input="debounceSearch"></el-input>
        </div>
        <div class="analysis-statistics__condition">
          <el-input id="searchValue3"
                    ref="searchValue3"
                    size="small"
                    placeholder="HexId"
                    v-model="curHexId"
                    v-show="activeTab === 'locationMap'"
                    style="width: 140px"
                    @input="debounceSearch"
          ></el-input>
<!--          <div class="hexId-tag">
            <el-tag v-if="curHexId !== ''" key="hexId" closable type="info" @close="clearHexId" disable-transitions>
              HexId:{{ curHexId }}
            </el-tag>
          </div>-->
          <el-checkbox v-model="onlyShowFollowed" @change="showFollowedSubscribers" :label="$t('location.onlyFollowed')" size="small" />
        </div>
        <div class="analysis-statistics__subscribers">
          <template v-for="item in subscribersList" :key="item.subscriberId">
            <div class="analysis-statistics__subscriber"
                 @click="subscriberListClick(item)"
                 @mouseenter="subscriberListMouseEnter(item)"
                 @mouseleave="subscriberListMouseLeave(item)"
                 :id="`locationMap-subscriberId-${item.subscriberId}`"
                 :class="highlightSubscriber.subscriberId === item.subscriberId ? 'analysis-statistics__subscriber--active' : ''"
            >
              <div class="subscriber__header" :class="item.active === 1 ? '' : 'subscriber__header-inactive'" >
                <div class="header__icon">
                  <div class="icon__box">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z"></path></svg>
                  </div>
                </div>
                <div class="header__right">
                  <div class="header-msisdn">
                    <div class="header__title">
                      <span>ID</span>
                      <el-tooltip
                          effect="light"
                          trigger="hover"
                          :content="$t('entity.jumpToEntityDetails')"
                          placement="right"
                          popper-class="panel-tooltip"
                      >
                        <i class="cn-icon cn-icon-jump-to" @click="jumpEntityDetail(item)" v-show="item.showJumpToEntity"></i>
                      </el-tooltip>
                    </div>
                    <div class="header__content">{{$_.get(item, 'subscriberId', '-') || '-'}}</div>
                  </div>
                  <div class="header__operation">
                    <div class="trajectory-text" @click.stop="addOrRemoveTrackingSubscriber(item)">
                        <i class="cn-icon" :class="symbolClass(item)"></i>{{$t('location.track')}}
                    </div>
                    <div class="cancel-follow">
                      <i class="cn-icon-follow-fill cn-icon" v-if="item.isFollowed === 1"  @click.stop="cancelFollowSubscribers(item)"></i>
                      <i class="cn-icon-follow cn-icon" v-else @click.stop="followSubscribers(item)"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div class="subscriber__body">
                <div class="body__item">
                  <div class="item__label">MSISDN</div>
                  <div class="item__value">{{item.phoneNumber}}</div>
                </div>
                <div class="body__item">
                  <div class="item__label">IMEI</div>
                  <div class="item__value">{{item.imei || '-'}}</div>
                </div>
                <div class="body__item">
                  <div class="item__label">IMSI</div>
                  <div class="item__value">{{item.imsi || '-'}}</div>
                </div>
                <div class="body__item">
                  <div class="item__label">APN</div>
                  <div class="item__value">{{item.apn || '-'}}</div>
                </div>
                <div class="body__item">
                  <div class="item__label">{{$t('location.group')}}</div>
                  <div class="item__value">Terrorist</div>
                </div>
                <div class="body__item">
                  <div class="item__label">{{$t('overall.info')}}</div>
                  <div class="item__value">Leader</div>
                </div>
                <div class="body__item">
                  <div class="item__label">{{$t('location.location')}}</div>
                  <div class="item__value">{{locationHandler(item)}}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- 右侧数据栏-trace -->
      <div class="analysis-statistics" id="subscribersBlock" v-show="activeTab === 'traceTracking'">
        <div class="analysis-statistics__no-tracking-tip" v-if="trackingSubscribers.length === 0" @click="activeTab = 'locationMap'">{{$t('location.noTrackingYet')}}</div>
        <div class="analysis-statistics__subscribers">
          <template v-for="(subscriber, index) in trackingSubscribers" :key="subscriber.subscriberId">
            <div
                class="analysis-statistics__subscriber"
                :class="currentShowSubscriber && currentShowSubscriber.subscriberId === subscriber.subscriberId ? 'analysis-statistics__subscriber--active' : ''"
                @click="changeCurrentShowSubscriber(subscriber)">
              <div class="subscriber__header" :class="trackingSubscriberRecordMap[subscriber.subscriberId] && trackingSubscriberRecordMap[subscriber.subscriberId].length > 0 ? '' : 'subscriber__header-inactive'">
                <div class="header__icon">
                  <div class="icon__box">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z"></path></svg>
                  </div>
                </div>
                <div class="header__right">
                  <div class="header-msisdn">
                    <div class="header__title">ID</div>
                    <div class="header__content">{{$_.get(subscriber, 'subscriberId', '-') || '-'}}</div>
                  </div>
                  <div class="header__operation">
                    <div class="cancel-follow" @click.stop="removeTrackingSubscriber(subscriber)">
                      <i class="cn-icon-close cn-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div class="subscriber__body">
                <div class="body__item">
                  <div class="item__label">MSISDN</div>
                  <div class="item__value">{{subscriber.phoneNumber}}</div>
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
                  <div class="item__value">{{locationHandler(subscriber)}}</div>
                </div>
                <div class="body-item-record">
                  <div class="item-record__header">{{ $t('location.trackRecord') }}</div>
                  <template v-if="trackingSubscriberRecordMap[subscriber.subscriberId] && trackingSubscriberRecordMap[subscriber.subscriberId].length > 0">
                    <div class="item-record__info">
                      <div class="circle"></div>
                    </div>
                    <div class="item-record__timeline">
                      <div class="timeline__info">
                        <div class="timeline__info--circle">
                          <div class="info__circle"></div>
                          <div class="info__line" v-show="subscriber.showLine"></div>
                        </div>
                        <div class="timeline__info--item" @mouseenter="timelineMouseEnter(subscriber, trackingSubscriberRecordMap[subscriber.subscriberId][0])" @mouseleave="timelineMouseLeave(subscriber, trackingSubscriberRecordMap[subscriber.subscriberId][0])">
                          <div>
                            <span>{{$t('overall.location')}}: </span><span class="info--item__value">{{locationHandler(trackingSubscriberRecordMap[subscriber.subscriberId][0])}}</span>
                          </div>
                          <div>
                            <span>{{ $t('location.timeOfArrival') }}: </span><span class="info--item__value">{{dateFormatByAppearance(Number(trackingSubscriberRecordMap[subscriber.subscriberId][0].time))}}</span>
                          </div>
                          <div>
                            <span>{{ $t('location.residenceTime') }}: </span><span class="info--item__value">-</span>
                          </div>
                        </div>
                      </div>

                      <div class="scroll-view" @scroll="onScroll" :id="subscriber.subscriberId" v-show="subscriber.show">
                        <!-- 虚拟列表 -->
                        <div class="virtual-scroller" :style="`height: ${subscriber.listHeight}px`"></div>
                        <div class="scroll-list" :style="`transform: translateY(${subscriber.startOffset}px)`">
                          <div class="scroll__item"
                               v-for="(record, index) in trackingSubscriberRecordMap[subscriber.subscriberId].slice(subscriber.scrollStartIndex, subscriber.scrollEndIndex)"
                               :key="index"
                               @mouseenter="timelineMouseEnter(subscriber, record)"
                               @mouseleave="timelineMouseLeave(subscriber, record)">
                            <div class="item-circle">
                              <div class="circle-circle"></div>
                              <div class="circle-line"></div>
                            </div>
                            <div class="item-content">
                              <div style="width: 217px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden">
                                <span>{{$t('overall.location')}}: </span><span class="item__value" :title="locationHandler(record)">{{locationHandler(record)}}</span>
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

                      <div :class="trackingSubscriberRecordMap[subscriber.subscriberId].length === 1 ? 'item-record__btn-disabled' : 'item-record__btn'" @click.stop="clickTrackBlock(index)">
                        <span v-if="!subscriber.show"><i class="cn-icon cn-icon-down2" :style="trackingSubscriberRecordMap[subscriber.subscriberId].length === 1 ? 'color: var(var(--el-color-info-light-5))' : ''"></i></span>
                        <span v-if="subscriber.show"><i class="cn-icon cn-icon-up2" :style="trackingSubscriberRecordMap[subscriber.subscriberId].length === 1 ? 'color: var(var(--el-color-info-light-5)' : ''"></i></span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- tooltip -->
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
          <template v-else-if="tooltip.type === tooltipType.human">ID</template>
          <template v-else-if="tooltip.type === tooltipType.baseStation">CID</template>
        </div>
        <div class="header__content">
          <template v-if="tooltip.type === tooltipType.hexagon">{{currentPolygon.hexId}}</template>
          <template v-else-if="tooltip.type === tooltipType.human">{{currentSubscriber.subscriberId || '-'}}</template>
          <template v-else-if="tooltip.type === tooltipType.baseStation">{{currentBaseStation.cid}}</template>
        </div>
      </div>
      <div class="hexagon-tooltip__body">
        <template v-if="tooltip.type === tooltipType.hexagon">
          <template v-if="activeTab === 'locationMap'">
            <div class="body__item">
              <div class="item__label">{{ $t('location.number') }}</div>
              <div class="item__value">{{currentPolygon.number}}</div>
            </div>
          </template>
          <template v-else>
            <span class="body__header">{{locationHandler(JSON.parse(currentPolygon.locations)[0])}}</span>
            <template v-for="(item, i) in JSON.parse(currentPolygon.locations)" :key="item.hexId">
              <div class="body__timeline" v-if="i < 5">
                <div class="timeline-symbol"></div>
                <div>
                  <div class="body__item">
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
            <div class="item__label">MSISDN</div>
            <div class="item__value">{{currentSubscriber.phoneNumber}}</div>
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
            <div class="item__value">{{locationHandler(currentSubscriber.subscriberDto)}}</div>
          </div>
          <div class="body__tracking" @click="trackSubscriber(currentSubscriber)">{{$t('location.traceTracking')}}</div>
        </template>
        <template v-else-if="tooltip.type === tooltipType.baseStation">
          <div class="body__item">
            <div class="item__label">{{ $t('location.locationAreaCode') }}</div>
            <div class="item__value">{{currentBaseStation.areaCode}}</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{ $t('location.mobileNetworkCode') }}</div>
            <div class="item__value">{{currentBaseStation.networkCode}}</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{ $t('location.communicationType') }}</div>
            <div class="item__value">{{currentBaseStation.communicationType}}</div>
          </div>
          <div class="body__item">
            <div class="item__label">{{$t('overall.location')}}</div>
            <div class="item__value">{{currentBaseStation.location}}</div>
          </div>
        </template>
      </div>
    </div>
    <el-drawer
            v-model="rightBox.show"
            direction="rtl"
            class="common-right-box"
            :size="700"
            :with-header="false"
            destroy-on-close
    >
      <my-follow-box :timeFilter="timeFilter" :level="mapLevel" @close="closeRightBox" @handleFollow="handleFollow" @handleCancelFollowBatch="handleCancelFollowBatch"/>
    </el-drawer>
  </div>
</template>

<script>
import { ref, shallowRef } from 'vue'
import { dateFormatByAppearance, getNowTime, getSecond } from '@/utils/date-util'
import maplibregl from 'maplibre-gl'
import mapStyle from '@/views/charts2/charts/entityDetail/mapStyle'
import 'maplibre-gl/dist/maplibre-gl.css'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import { unitTypes, storageKey, defaultMapConfig, mapLevelField } from '@/utils/constants'
import * as echarts from 'echarts'
import { appListChartOption } from '@/views/charts2/charts/options/echartOption'
import { pieOption } from '@/views/location/chartOption'
import _ from 'lodash'
import { useRoute, useRouter } from 'vue-router'
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import axios from 'axios'
import { api } from '@/utils/api'
import { h3ToGeo, h3ToGeoBoundary, geoToH3 } from 'h3-js'
import TimeLine from '@/components/common/TimeLine.vue'
import SimpleLoading from '@/components/common/SimpleLoading.vue'
import MyFollowBox from '@/components/rightBox/location/MyFollowBox'
import dataListMixin from '@/mixins/data-list'
import * as turf from '@turf/turf'
import { generateRectanglePolygon } from '@/utils/geo-utils'

// import testData from './test'

const humanSvg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z"></path></svg>'
const baseStationSvg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M164.901926 519.585185a391.35763 391.35763 0 0 1-30.151111-152.38637c0-52.527407 10.05037-105.054815 30.151111-152.348445 15.094519-47.29363 45.283556-89.353481 80.516741-126.103703L174.990222 15.17037C129.706667 62.464 94.511407 114.991407 69.328593 178.062222 44.183704 241.095111 34.133333 304.165926 34.133333 367.198815c0 63.070815 10.05037 131.375407 35.19526 189.174518 25.182815 57.799111 60.378074 115.598222 105.661629 162.891852l70.428445-73.576296c-35.233185-36.788148-65.422222-78.810074-80.516741-126.103704z" p-id="8786"></path><path d="M255.469037 477.563259c15.094519 36.788148 35.195259 68.266667 60.340148 94.549334l70.428445-73.576297a233.168593 233.168593 0 0 1-40.201482-57.761185c-5.044148-26.282667-10.088296-47.29363-10.088296-73.576296 0-26.244741 5.044148-47.29363 15.094518-68.266667 5.006222-26.282667 20.100741-42.097778 35.19526-63.070815l-70.428445-73.576296c-25.144889 26.282667-45.24563 57.799111-60.340148 94.587259-15.094519 36.788148-20.100741 73.576296-20.100741 110.364445 0 36.788148 5.006222 73.53837 20.100741 110.326518zM436.527407 367.198815c0 43.538963 33.792 78.810074 75.472593 78.810074s75.472593-35.271111 75.472593-78.810074c0-43.501037-33.792-78.810074-75.472593-78.810074s-75.472593 35.271111-75.472593 78.810074zM637.76237 498.574222l70.428445 73.576297c25.144889-26.282667 45.24563-57.837037 60.340148-94.58726 15.094519-36.788148 20.100741-73.576296 20.100741-110.364444 0-36.788148-5.006222-73.576296-20.100741-110.364445-15.094519-36.750222-35.195259-68.266667-60.340148-94.549333l-70.428445 73.576296c15.094519 15.739259 30.189037 36.788148 40.201482 57.799111 10.088296 21.010963 15.132444 47.29363 15.132444 68.266667 0 26.282667-5.044148 47.331556-15.094518 68.342519-10.05037 31.516444-25.144889 47.29363-40.239408 68.266666z" p-id="8787"></path><path d="M954.671407 178.062222C929.488593 114.991407 894.293333 62.464 849.009778 15.17037L778.619259 88.746667c35.233185 36.788148 60.378074 78.810074 80.516741 126.103703 20.100741 47.255704 30.151111 99.821037 30.151111 152.348445 0 52.565333-10.05037 105.092741-30.151111 152.38637-20.100741 47.29363-45.283556 89.315556-80.516741 126.103704l70.428445 73.576296c45.283556-47.29363 80.478815-99.858963 105.661629-162.891852 25.144889-63.070815 35.195259-126.103704 35.19526-189.174518 0-63.032889-10.05037-131.337481-35.19526-189.136593zM210.185481 1024h603.629038L512 551.10163 210.185481 1024z m186.102519-105.054815L512 740.238222l115.674074 178.631111h-231.348148z"></path></svg>'

export default {
  name: 'Location',
  data () {
    return {
      url: api.location.followedSubscriber,
      blankObject: { // 空白对象
        id: ''
      },
      tooltipType: {
        hexagon: 'hexagon',
        baseStation: 'base-station',
        human: 'human'
      },
      activeCount: '',
      activeCountChain: '',
      curPageNum: 1,
      activeNames: '',
      initFlag: true,
      emptyTip: '',
      opacity: 1,
      scrollInfo: {
        itemSize: 50, // 一个滚动item高度
        containerHeight: 300 // 滚动列表
      },
      onlyShowFollowed: false,
      curHexId: '',
      busy: false,
      preScrollTop: 0
    }
  },
  mixins: [dataListMixin],
  components: {
    TimeLine,
    SimpleLoading,
    MyFollowBox
  },
  methods: {
    dateFormatByAppearance,
    valueToRangeValue,
    async initMap () {
      const _this = this
      if (!this.mapChart) {
        this.mapChart = new maplibregl.Map({
          container: 'analysisMap',
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
      }

      this.mapChart.on('load', async function () {
        // 加载地图上的基站，基站不随tab的切换而改变
        const baseStationData = await _this.queryBaseStation()
        _this.renderMarker(baseStationData, _this.tooltipType.baseStation)

        if (_this.activeTab === 'locationMap') {
          await _this.initLocationMapTab()
        } else if (_this.activeTab === 'traceTracking') {
          await _this.initTraceTrackingTab()
        }
      })
    },
    async initLocationMapTab () {
      // 最先渲染右上角饼图
      await this.renderDensityPie()
      // 然后渲染地图的色块、基站、人（包括右侧关注列表），最后渲染右上角折线图
      /* 地图色块 */
      this.updateBoundaryBox()
      const hexagonData = await this.queryHexagon()
      // 将查到的h3hexagon数据转为geojson
      const polygonSourceData = this.hexagonDataConverter(hexagonData, 'locationMap')
      this.mapChart.addSource('hexGrid', {
        type: 'geojson',
        data: polygonSourceData
      })
      // TODO 六边形边框，考虑加一层line layer
      this.mapChart.addLayer({
        id: 'hexagon',
        type: 'fill',
        source: 'hexGrid',
        layout: {},
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.7, 0.4]
        }
      })
      // 六边形的鼠标事件
      this.unbindHexagonEvents()
      this.bindHexagonEvents()

      /* 右侧默认显示普通列表 */
      await this.initSubscriberList()

      /* 地图上的人 */
      // const mapFollowedSubscriberData = await this.queryMapFollowedSubscriber()
      // this.renderMarker(mapFollowedSubscriberData, this.tooltipType.human)
      // this.renderMarker(this.subscribersList, this.tooltipType.human)

      /* 右上角折线图 */
      await this.renderActiveSubscribersLine()
    },
    async initTraceTrackingTab () {
      await this.queryTraceTracking()
      // 如果未指定展示谁的轨迹，则默认取追踪用户中的第一个
      if (!this.currentShowSubscriber && this.trackingSubscribers.length > 0) {
        this.currentShowSubscriber = this.trackingSubscribers[0]
      }
      const find = this.trackingSubscribers.find(s => s.subscriberId === this.currentShowSubscriber.subscriberId)
      if (find) {
        // 滚动条定位到id所在的dom
        const findIndex = this.trackingSubscribers.findIndex(s => s.subscriberId === this.currentShowSubscriber.subscriberId)
        const dom = document.getElementById('subscribersBlock')
        if (findIndex && dom) {
          await this.$nextTick(() => {
            dom.scrollTop = 207 * findIndex
          })
        }
      }
      this.renderTrackingHexagon()
    },
    async renderDensityPie () {
      const params = {
        ...this.timeFilter,
        level: this.mapLevel
      }
      this.loading.pieLoading = true
      try {
        const response = await axios.get(api.location.density, { params })
        const densityData = response.data.data.filter(d => d.hexId)
        // const densityData = testData
        // 按值的大小分组，并计算各组数量和颜色
        this.pieValueRamp = this.calculateValueRamp(densityData)
        const option = _.cloneDeep(pieOption)
        option.color = this.pieColorRamp.map(c => `rgb(${c},.7)`)
        option.series[0].name = this.$t('location.populationDensity')
        option.series[0].data = this.pieValueRamp.map((r, i) => ({
          value: r.count
        }))
        this.pieOption = option
        if (!this.pieChart) {
          this.pieChart = echarts.init(document.getElementById('populationDensityChart'))
        }
        this.$nextTick(() => {
          this.pieChart.setOption(this.pieOption)
        })
      } catch (e) {
        this.$message.error(this.errorMsgHandler(e))
        if (this.pieChart && this.pieChart.clear) {
          this.pieChart.clear()
        }
        this.pieValueRamp = []
        console.error(e)
      } finally {
        this.loading.pieLoading = false
      }
    },
    async renderActiveSubscribersLine () {
      const params = {
        ...this.timeFilter,
        level: this.mapLevel
      }
      this.loading.lineLoading = true
      try {
        const curCountResponse = await axios.get(api.location.count, { params: { ...params, cycle: 0 } })// 当前周期活跃用户总数
        const preCountResponse = await axios.get(api.location.count, { params: { ...params, cycle: 1 } })// 上一周期活跃用户总数
        this.activeCount = curCountResponse.data.data.total
        const preActiveCount = preCountResponse.data.data.total
        if (preActiveCount !== 0) {
          this.activeCountChain = (this.activeCount - preActiveCount) / preActiveCount
        } else {
          this.activeCountChain = '-'
        }
        const trendResponse = await axios.get(api.location.trend, { params })
        const activeSubscribersData = trendResponse.data.data.result
        const option = _.cloneDeep(appListChartOption)
        option.series[0].data = activeSubscribersData.map(d => {
          return [d[0], d[1], unitTypes.number]
        })
        this.lineOption = option
        if (!this.lineChart) {
          this.lineChart = echarts.init(document.getElementById('activeSubscribersChart'))
        }
        this.lineChart.setOption(this.lineOption)
      } catch (e) {
        this.$message.error(this.errorMsgHandler(e))
        if (this.lineChart && this.lineChart.clear) {
          this.lineChart.clear()
        }
        this.activeCount = ''
        this.activeCountChain = ''
        console.error(e)
      } finally {
        this.loading.lineLoading = false
      }
    },
    /*
    async queryFollowedList () {
      let params = {
        ...this.timeFilter,
        pageSize: -1,
        level: this.mapLevel
      }
      if (this.curSearchValue && this.curSearchValue !== '') {
        params = {
          ...params,
          params: "  subscriber_id like '%" + this.curSearchValue + "%'"
        }
      }
      this.loading.subscriberLoading = true
      try {
        const response = await axios.get(api.location.followedSubscriber, { params })
        this.subscribersList = response.data.data.list
      } catch (e) {
        this.$message.error(this.errorMsgHandler(e))
        console.error(e)
      } finally {
        this.loading.subscriberLoading = false
      }
    }, */
    async queryHexagon () {
      const params = {
        ...this.boundaryBox,
        ...this.timeFilter,
        level: this.mapLevel
      }
      this.loading.hexagonLoading = true
      try {
        const response = await axios.get(api.location.map, { params })
        return response.data.data
        // return testData
      } catch (e) {
        this.$message.error(this.errorMsgHandler(e))
        console.error(e)
      } finally {
        this.loading.hexagonLoading = false
      }
      return []
    },
    async queryBaseStation () {
      this.loading.baseStationLoading = true
      try {
        // const response = await axios.get(api.location.baseStation)
        const response = [{ cid: '414-06-15261-3', latitude: 17.182549, longitude: 95.972018, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11755-1', latitude: 17.182845, longitude: 95.969483, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12955-2', latitude: 17.181968, longitude: 95.96975, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13698-6', latitude: 17.181413, longitude: 95.969861, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11553-2', latitude: 17.183569, longitude: 95.971931, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-15971-1', latitude: 17.183807, longitude: 95.972561, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13287-2', latitude: 17.184677124023, longitude: 95.97038269043, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11755-3', latitude: 17.18879699707, longitude: 95.97038269043, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13651-1', latitude: 17.180557250977, longitude: 95.977249145508, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11421-2', latitude: 17.179871, longitude: 95.979309, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12504-1', latitude: 17.173573, longitude: 95.978783, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13651-3', latitude: 17.173690795898, longitude: 95.989608764648, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13518-1', latitude: 17.170944213867, longitude: 95.990982055664, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11646-1', latitude: 17.169570922852, longitude: 95.99235534668, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11643-2', latitude: 17.165451049805, longitude: 95.995101928711, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11709-1', latitude: 17.143478393555, longitude: 95.999221801758, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11553-3', latitude: 17.135239, longitude: 96.001511, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12955-3', latitude: 17.126575, longitude: 96.00721, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13287-1', latitude: 17.120132446289, longitude: 96.010208129883, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12503-1', latitude: 17.120132446289, longitude: 96.007461547852, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11588-1', latitude: 17.120132446289, longitude: 96.008834838867, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11835-1', latitude: 17.118759155273, longitude: 96.008834838867, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11452-2', latitude: 17.117385864258, longitude: 96.010208129883, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12962-2', latitude: 17.114639282227, longitude: 96.012954711914, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11769-4', latitude: 17.11051940918, longitude: 96.015701293945, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11758-3', latitude: 17.109146118164, longitude: 96.015701293945, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11253-2', latitude: 17.111206, longitude: 96.019822, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12823-2', latitude: 17.106399536133, longitude: 96.019821166992, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-15277-4', latitude: 17.105026245117, longitude: 96.019821166992, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11704-2', latitude: 17.103652954102, longitude: 96.021194458008, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13908-1', latitude: 17.103652954102, longitude: 96.022567749023, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11385-1', latitude: 17.103652954102, longitude: 96.023941040039, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12496-1', latitude: 17.102279663086, longitude: 96.025314331055, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-15984-3', latitude: 17.102279663086, longitude: 96.02668762207, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11904-1', latitude: 17.10090637207, longitude: 96.029434204102, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-15984-2', latitude: 17.102279663086, longitude: 96.033554077148, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11385-2', latitude: 17.099533081055, longitude: 96.033554077148, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11714-1', latitude: 17.10090637207, longitude: 96.039047241211, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12462-2', latitude: 17.10090637207, longitude: 96.040420532227, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13908-4', latitude: 17.10090637207, longitude: 96.041793823242, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11103-5', latitude: 17.10090637207, longitude: 96.043167114258, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13213-3', latitude: 17.10090637207, longitude: 96.044540405273, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-13213-1', latitude: 17.10090637207, longitude: 96.045913696289, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11253-1', latitude: 17.10090637207, longitude: 96.047286987305, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12823-3', latitude: 17.103922, longitude: 96.053436, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11769-1', latitude: 17.106399536133, longitude: 96.055526733398, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-11758-2', latitude: 17.106399536133, longitude: 96.059646606445, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-15277-3', latitude: 17.106399536133, longitude: 96.063766479492, areaCode: 100027, networkCode: 1574, communicationType: '4G', location: 'Myanmar, Yangon, Yangon' }, { cid: '414-06-12962-3', latitude: 17.10604, longitude: 96.064735 }]
        return response // response.data.data.list
      } catch (e) {
        this.$message.error(this.errorMsgHandler(e))
        console.error(e)
      } finally {
        this.loading.baseStationLoading = false
      }
      return []
    },
    async queryMapFollowedSubscriber () {
      this.loading.timeBarLoading = true
      const params = {
        ...this.minuteTimeFilter,
        level: this.mapLevel,
        pageSize: -1
      }
      try {
        if (this.subscribersList.length > 0) {
          await this.setSubscriberActiveStatus(this.subscribersList)
        }
        const response = await axios.get(api.location.followedSubscriber, { params })
        response.data.data.list.forEach(d => {
          d.isFollowed = 1
        })
        return response.data.data.list
      } catch (e) {
        this.$message.error(this.errorMsgHandler(e))
        console.error(e)
      } finally {
        this.loading.timeBarLoading = false
      }
      return []
    },
    jumpEntityDetail (subscriber) {
      const { href } = this.$router.resolve({
        path: '/entity/detail',
        query: {
          entityType: 'subscriber',
          entityName: subscriber.subscriberId,
          startTime: this.timeFilter.startTime,
          endTime: this.timeFilter.endTime,
          range: this.timeFilter.dateRangeValue
        }
      })
      window.open(href, '_blank')
    },
    async queryTraceTracking () {
      if (this.trackingSubscribers.length > 0) {
        this.loading.trackingMapLoading = true
        const params = {
          ...this.timeFilter,
          subscriberIds: this.trackingSubscribers.map(item => `'${item.subscriberId}'`).join(','),
          level: this.mapLevel
        }
        try {
          const response = await axios.get(api.location.tracking, { params })
          const trackingSubscribers = _.cloneDeep(this.trackingSubscribers)
          if (response.data.data.result) {
            // 过滤掉无位置的无效数据
            response.data.data.result.forEach(item => {
              item.trackRecords = item.trackRecords.filter(t => t.hexId)
            })
            trackingSubscribers.forEach(s => {
              const find = response.data.data.result.find(item => item.subscriberId === s.subscriberId)
              if (find) {
                this.trackingSubscriberRecordMap[s.subscriberId] = find.trackRecords
              } else {
                this.trackingSubscriberRecordMap[s.subscriberId] = []
              }
              s.show = false // 切换到track tracking时就收起时间线
            })
            this.trackingSubscribers = trackingSubscribers
          } else {
            Object.keys(this.trackingSubscriberRecordMap).forEach(k => {
              this.trackingSubscriberRecordMap[k] = []
            })
          }
          // 计算停留时间
          this.trackingSubscribers.forEach((s, index) => {
            const trackRecords = this.trackingSubscriberRecordMap[s.subscriberId]
            // 初始化时间线可视范围角标
            if (trackRecords.length < 6) {
              s.scrollStartIndex = 1
              s.scrollEndIndex = trackRecords.length
            } else {
              s.scrollStartIndex = 1
              s.scrollEndIndex = 6
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
                    s.startOffset = 0
                    s.listHeight = i * this.scrollInfo.itemSize
                  }
                }
              }
            }
          })
        } catch (e) {
          this.$message.error(this.errorMsgHandler(e))
          console.error(e)
        } finally {
          this.loading.trackingMapLoading = false
        }
      } else {
        this.loading.trackingMapLoading = false
      }
    },
    moveToCenter (records) {
      const maxLongitude = _.maxBy(records, d => Number(d.subscriberLongitude))
      const maxLatitude = _.maxBy(records, d => Number(d.subscriberLatitude))
      const minLongitude = _.minBy(records, d => Number(d.subscriberLongitude))
      const minLatitude = _.minBy(records, d => Number(d.subscriberLatitude))
      const center = [(maxLongitude.subscriberLongitude + minLongitude.subscriberLongitude) / 2, (maxLatitude.subscriberLatitude + minLatitude.subscriberLatitude) / 2]
      this.mapChart.panTo(center, { duration: 500 })
    },
    renderTrackingHexagon () {
      this.bindTrackingHexagonEvents()
      if (!this.currentShowSubscriber) {
        return true
      }
      const currentShowSubscriberRecords = this.trackingSubscriberRecordMap[this.currentShowSubscriber.subscriberId]
      if (currentShowSubscriberRecords && currentShowSubscriberRecords.length > 0) {
        // 六边形
        this.trackingPolygonSourceData = this.hexagonDataConverter(this.trackingSubscriberRecordMap[this.currentShowSubscriber.subscriberId], 'traceTracking')
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
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.7, 0.4]
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
        this.moveToCenter(currentShowSubscriberRecords)
        // 最后所在地的图标
        const coordinate = h3ToGeo(currentShowSubscriberRecords[0].hexId)
        this.renderTrackingMarker([coordinate[1], coordinate[0]])
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
          if (type === this.tooltipType.human && (marker.subscriberDto || marker.subscriberLatitude)) {

            const el = document.createElement('div')
            el.className = `map-marker map-marker--${type}`
            if (marker.subscriberId === this.highlightSubscriber.subscriberId) {
              el.classList.add('map-marker--highlight')
            }
            // 非关注的用户，默认隐藏图标，鼠标移到列表后才显示
            if (this.currentZoom && this.currentZoom < 11) {
              el.classList.add('map-marker--hidden')
            }
            if (!marker.isFollowed && this.onlyShowFollowed) {
              el.classList.add('map-marker--unfollowed')
            }
            el.innerHTML = svg
            // 鼠标事件，控制tooltip显示和marker尺寸
            this.bindMarkerEvent(el, marker, type)
            const position = marker.subscriberDto
              ? [marker.subscriberDto.subscriberLongitude, marker.subscriberDto.subscriberLatitude]
              : [marker.subscriberLongitude, marker.subscriberLatitude]
            const mapMarker = new maplibregl.Marker({ element: el })
              .setLngLat(position)
              .addTo(this.mapChart)
            mapMarker.subscriberId = marker.subscriberId
            mapMarker.isFollowed = marker.isFollowed
            mapMarker.active = marker.active
            this.humanMarkers.push(mapMarker)
          } else if (type === this.tooltipType.baseStation) {
            const el = document.createElement('div')
            el.className = `map-marker map-marker--${type}`
            if (this.currentZoom && this.currentZoom < 11) {
              el.classList.add('map-marker--hidden')
            }
            el.innerHTML = svg
            // 鼠标事件，控制tooltip显示和marker尺寸
            this.bindMarkerEvent(el, marker, type)
            const mapMarker = new maplibregl.Marker({ element: el })
              .setLngLat([marker.longitude, marker.latitude])
              .addTo(this.mapChart)
            this.baseStationMarkers.push(mapMarker)
          }
        })
      } catch (e) {
        console.error(e)
      }
    },
    renderTrackingMarker (coordinates) {
      const el = document.createElement('div')
      el.className = 'map-tracking-marker'
      el.innerHTML = `<div class="tracking-marker__inner-circle">${humanSvg}</div>`
      this.trackingHumanMarker = new maplibregl.Marker({ element: el })
        .setLngLat(coordinates)
        .addTo(this.mapChart)
    },
    updateBoundaryBox () {
      const boundaryBox = this.mapChart.getBounds()
      this.boundaryBox = {
        maxLongitude: boundaryBox.getEast(),
        maxLatitude: boundaryBox.getNorth(),
        minLongitude: boundaryBox.getWest(),
        minLatitude: boundaryBox.getSouth()
      }
      let needUpdateData = false
      if (!this.boundaryBoxExtreme) {
        this.boundaryBoxExtreme = generateRectanglePolygon(this.boundaryBox.minLongitude, this.boundaryBox.minLatitude, this.boundaryBox.maxLongitude, this.boundaryBox.maxLatitude)
        needUpdateData = true
      } else {
        const polygon = generateRectanglePolygon(this.boundaryBox.minLongitude, this.boundaryBox.minLatitude, this.boundaryBox.maxLongitude, this.boundaryBox.maxLatitude)
        const union = turf.union(turf.featureCollection([this.boundaryBoxExtreme, polygon]))
        // 如果合并后面积变大了，说明有新的区域，需要渲染
        if (turf.area(union) > turf.area(this.boundaryBoxExtreme)) {
          this.boundaryBoxExtreme = union
          needUpdateData = true
        }
      }
      return needUpdateData
      /* if (Object.keys(this.boundaryBoxExtreme).length === 0) {
        this.boundaryBoxExtreme = _.cloneDeep(this.boundaryBox)
        return true
      } else {
        let needUpdateData = false
        if (this.boundaryBox.maxLongitude > this.boundaryBoxExtreme.maxLongitude) {
          needUpdateData = true
          this.boundaryBoxExtreme.maxLongitude = this.boundaryBox.maxLongitude
        }
        if (this.boundaryBox.maxLatitude > this.boundaryBoxExtreme.maxLatitude) {
          needUpdateData = true
          this.boundaryBoxExtreme.maxLatitude = this.boundaryBox.maxLatitude
        }
        if (this.boundaryBox.minLongitude < this.boundaryBoxExtreme.minLongitude) {
          needUpdateData = true
          this.boundaryBoxExtreme.minLongitude = this.boundaryBox.minLongitude
        }
        if (this.boundaryBox.minLatitude < this.boundaryBoxExtreme.minLatitude) {
          needUpdateData = true
          this.boundaryBoxExtreme.minLatitude = this.boundaryBox.minLatitude
        }
        return needUpdateData
      } */
    },
    // 先使用min=0的等宽分组法，若后续出现特大或特小的异常值导致等宽分组效果不理想，考虑用分位数分组法
    calculateValueRamp (data) {
      const max = _.maxBy(data, d => Number(d.number))
      const result = []
      if (max) {
        let step
        if (max.number <= 1000) {
          step = 20
        } else {
          step = 100
        }
        const maxLegend = Math.ceil((max.number) / step) * step
        for (let i = 1; i <= this.pieColorRamp.length; i++) {
          const item = {
            start: maxLegend * (i - 1) / this.pieColorRamp.length + 1,
            end: maxLegend * i / this.pieColorRamp.length,
            color: this.pieColorRamp[i - 1]
          }
          item.count = data.filter(d => d.number >= item.start && d.number <= item.end).length
          if (i === this.pieColorRamp.length) {
            item.name = `>${item.start - 1}`
          } else {
            item.name = `${item.start}~${item.end}`
          }
          result.push(item)
        }
      }
      return result
    },
    hexagonDataConverter (data, tab) {
      const featureCollection = { type: 'FeatureCollection' }
      if (tab === 'locationMap') {
        featureCollection.features = data.map((d, i) => ({
          id: parseInt(d.hexId, 16),
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
            color: this.getHexagonFillColor(d.number)
          }
        }))
      } else if (tab === 'traceTracking') {
        // 对hexId去重，将重复的hexId的时间合并
        const hexagons = []
        data.forEach(d => {
          const find = hexagons.find(h => h.hexId === d.hexId)
          if (!find) {
            hexagons.push({ hexId: d.hexId, locations: [{ time: d.time, longitude: d.subscriberLongitude, latitude: d.subscriberLatitude, country: d.country, superAdministrativeArea: d.superAdministrativeArea, administrativeArea: d.administrativeArea }] })
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
      }
      return featureCollection
    },
    getHexagonFillColor (number) {
      const ramp = this.pieValueRamp.filter((r, i) => {
        if (i < this.pieValueRamp.length - 1) {
          return Number(number) >= r.start && Number(number) <= r.end
        } else {
          return Number(number) >= r.start
        }
      })
      if (ramp.length > 0) {
        return ramp[0].color.split(',').map(n => Number(n))
      }
      return [229, 229, 229]
    },
    mapLineDataConverter () {
      const records = this.trackingSubscriberRecordMap[this.currentShowSubscriber.subscriberId]
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
    hoverTrigger (source, id, hover) {
      this.mapChart.setFeatureState({ source, id }, { hover })
    },
    bindHexagonEvents () {
      // 地图可视范围变化（move和zoom）的时候，获取新的地图边界，加载新数据
      this.mapChart.on('mouseenter', 'hexagon', this.hexagonMouseEnter)
      this.mapChart.on('mouseleave', 'hexagon', this.hexagonMouseLeave)
      this.mapChart.on('mousemove', 'hexagon', this.hexagonMouseMove)
      this.mapChart.on('moveend', this.debounceVisualChange)
      this.mapChart.on('zoomend', this.debounceVisualChange)
      this.mapChart.on('click', 'hexagon', this.hexagonClick)
    },
    unbindHexagonEvents () {
      this.mapChart.off('mouseenter', 'hexagon', this.hexagonMouseEnter)
      this.mapChart.off('mouseleave', 'hexagon', this.hexagonMouseLeave)
      this.mapChart.off('mousemove', 'hexagon', this.hexagonMouseMove)
      this.mapChart.off('moveend', this.debounceVisualChange)
      this.mapChart.off('zoomend', this.debounceVisualChange)
      this.mapChart.off('click', 'hexagon', this.hexagonClick)
    },
    bindTrackingHexagonEvents () {
      this.mapChart.on('mouseenter', 'trackingHexagon', this.trackingHexagonMouseEnter)
      this.mapChart.on('mouseleave', 'trackingHexagon', this.trackingHexagonMouseLeave)
      this.mapChart.on('mousemove', 'trackingHexagon', this.trackingHexagonMouseMove)
      this.mapChart.on('zoomend', this.trackingHexagonZoomEnd)
    },
    unbindTrackingHexagonEvents () {
      this.mapChart.off('mouseenter', 'trackingHexagon', this.trackingHexagonMouseEnter)
      this.mapChart.off('mouseleave', 'trackingHexagon', this.trackingHexagonMouseLeave)
      this.mapChart.off('mousemove', 'trackingHexagon', this.trackingHexagonMouseMove)
      this.mapChart.off('zoomend', this.trackingHexagonZoomEnd)
    },
    hexagonMouseEnter () {
      this.tooltip.mouseIsInPolygon = true
    },
    hexagonMouseLeave () {
      this.tooltip.showPolygonTooltip = false
      this.tooltip.mouseIsInPolygon = false
      // 去掉上一块的高亮
      this.hoverTrigger('hexGrid', this.currentPolygon.id, false)
    },
    hexagonMouseMove (e) {
      const { originalEvent, features } = e
      if (!this.tooltip.mouseInMarkerOrTooltip) {
        this.tooltip.showPolygonTooltip = true
        this.tooltip.type = this.tooltipType.hexagon
        if (this.tooltip.type === this.tooltipType.hexagon && this.currentPolygon.id && this.currentPolygon.id !== features[0].id) {
          // 去掉上一块的高亮
          this.hoverTrigger('hexGrid', this.currentPolygon.id, false)
        }
        this.currentPolygon = features[0].properties
        this.currentPolygon.id = features[0].id
        this.tooltip.x = originalEvent.clientX + 15
        this.tooltip.y = (originalEvent.clientY + 5 + this.tooltipDomHeight.hexagon) > this.mapDomHeight ? (this.mapDomHeight - this.tooltipDomHeight.hexagon) : (originalEvent.clientY + 5)

        // 鼠标滑过高亮
        this.hoverTrigger('hexGrid', this.currentPolygon.id, true)
      }
    },
    async hexagonVisualRangeChange (e) {
      this.currentZoom = this.mapChart.getZoom()
      console.info(`current zoom: ${this.currentZoom}`)

      if (this.updateBoundaryBox()) {
        const oldSourceData = this.mapChart.getSource('hexGrid')._data
        const hexagonData = await this.queryHexagon()
        // 将查到的h3hexagon数据转为geojson
        const polygonSourceData = this.hexagonDataConverter(hexagonData, 'locationMap')
        // 对比新旧数据，同个hexId新数据number大于旧数据的，将旧数据覆盖；新hexId直接添加；
        const newSourceData = this.compareSourceData(oldSourceData, polygonSourceData)
        this.mapChart.getSource('hexGrid').setData(newSourceData)
      }
    },
    compareSourceData (oldData, newData) {
      // 创建一个哈希表来存储oldData中每个feature的hexId和它的索引位置
      const oldDataMap = new Map()
      oldData.features.forEach((feature, index) => {
        oldDataMap.set(feature.properties.hexId, { feature, index })
      })

      newData.features.forEach(n => {
        const hexId = n.properties.hexId
        if (oldDataMap.has(hexId)) {
          // 如果在oldData中找到匹配的hexId
          const { feature: oldFeature } = oldDataMap.get(hexId)
          if (Number(n.properties.number) > Number(oldFeature.properties.number)) {
            // 更新number和color属性
            oldFeature.properties.number = n.properties.number
            oldFeature.properties.color = n.properties.color
          }
        } else {
          // 如果没有找到，添加新的feature到oldData
          oldData.features.push({ ...n })
        }
      })

      return oldData
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
    trackingHexagonZoomEnd () {
      this.currentZoom = this.mapChart.getZoom()
      console.info(`current zoom: ${this.currentZoom}`)
      if (this.currentZoom && this.currentZoom < 11) {
        this.hideBaseStation()
      } else {
        this.showBaseStation()
      }
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
        // this.tooltip.x = originalEvent.clientX + 15
        // this.tooltip.y = originalEvent.clientY + 5
        this.$nextTick(() => {
          const tooltipDom = document.getElementById('tooltip')
          const tooltipDomHeight = tooltipDom.offsetHeight
          this.tooltip.x = originalEvent.clientX + 15
          this.tooltip.y = originalEvent.clientY + 5
          this.tooltip.y = (originalEvent.clientY + 5 + tooltipDomHeight) > this.mapDomHeight ? (this.mapDomHeight - tooltipDomHeight) : (originalEvent.clientY + 5)
        })

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
    reload (startTime, endTime, dateRangeValue) {
      this.curPageNum = 1
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
    // subscriber列表点击后将地图上的人图标保持特殊高亮，并移动地图中心至图标点
    subscriberListClick (subscriber) {
      // 先删除当前所有高亮的
      this.humanMarkers.forEach(m => {
        m.getElement().classList.remove('map-marker--highlight')
      })
      if (this.highlightSubscriber.subscriberId === subscriber.subscriberId) {
        this.highlightSubscriber = {}
      } else {
        this.highlightSubscriber = subscriber
        const target = this.humanMarkers.find(m => subscriber.subscriberId === m.subscriberId)
        if (target) {
          target.getElement().classList.add('map-marker--highlight')
          this.mapChart.panTo(target.getLngLat(), { duration: 500 })
        }
      }
    },
    subscriberListMouseEnter (subscriber) {
      subscriber.showJumpToEntity = true
      const target = this.humanMarkers.find(m => subscriber.subscriberId === m.subscriberId)
      if (target) {
        target.addClassName && target.addClassName('map-marker--hover')
      }
    },
    subscriberListMouseLeave (subscriber) {
      subscriber.showJumpToEntity = false
      const target = this.humanMarkers.find(m => subscriber.subscriberId === m.subscriberId)
      if (target) {
        target.removeClassName && target.removeClassName('map-marker--hover')
      }
    },
    async scrollList (e) {
      if (!this.onlyShowFollowed) {
        const dom = document.getElementById('locationMap-subscriber-scroll')
        if (dom.scrollTop + dom.clientHeight >= dom.scrollHeight && !this.loading.subscriberLoading) {
          this.curPageNum++
          await this.initSubscriberList()
        }
        /* const scrollTop = obj.scrollTop
        const scroll = scrollTop - this.preScrollTop
        this.preScrollTop = scrollTop
        // 向下滚动才进行加载数据
        if (scroll >= 0 && (obj.scrollHeight - obj.scrollTop - obj.clientHeight <= 10) &&
            (obj.scrollHeight - obj.scrollTop - obj.clientHeight > 1) &&
            obj.scrollHeight !== 0 &&
            !this.loading.subscriberLoading) {
          await this.initSubscriberList()
        } */
      }
    },
    timeRefreshChange () {
      this.curPageNum = 1
      // 不是自选时间
      if (this.$refs.dateTimeRange) {
        if (!this.$refs.dateTimeRange.isCustom) {
          const value = this.timeFilter.dateRangeValue
          this.$refs.dateTimeRange.quickChange(value)
        } else {
          this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
        }
      } else {
        this.timeFilter = JSON.parse(JSON.stringify(this.timeFilter))
      }
    },
    clickTrackBlock (i) {
      const length = this.trackingSubscriberRecordMap[this.trackingSubscribers[i].subscriberId].length
      if (length > 1) {
        this.trackingSubscribers[i].show = !this.trackingSubscribers[i].show
        if (this.trackingSubscribers[i].show) {
          this.trackingSubscribers[i].showLine = true
          this.trackingSubscribers[i].scrollStartIndex = 1
          this.trackingSubscribers[i].scrollEndIndex = 6
          this.trackingSubscribers[i].startOffset = 0
          this.trackingSubscribers[i].listHeight = 0
          // 高度置为0，是为了切换时间后再打开时间线，让滚动条置顶
          const timer = setTimeout(() => {
            this.trackingSubscribers[i].listHeight = this.trackingSubscriberRecordMap[this.trackingSubscribers[i].subscriberId].length * this.scrollInfo.itemSize
            clearTimeout(timer)
          }, 100)
        } else {
          const timer = setTimeout(() => {
            this.trackingSubscribers[i].showLine = false
            clearTimeout(timer)
          }, 200)
        }
      }
    },
    changeCurrentShowSubscriber (subscriber) {
      if (subscriber.subscriberId !== this.currentShowSubscriber.subscriberId) {
        this.currentShowSubscriber = subscriber
      }
    },
    hideBaseStation () {
      this.baseStationMarkers.forEach(bs => {
        bs.addClassName && bs.addClassName('map-marker--hidden')
      })
    },
    showBaseStation () {
      this.baseStationMarkers.forEach(bs => {
        bs.removeClassName && bs.removeClassName('map-marker--hidden')
      })
    },
    hideFollowed () {
      this.humanMarkers.forEach(human => {
        human.addClassName && human.addClassName('map-marker--hidden')
      })
    },
    showFollowed () {
      this.humanMarkers.forEach(human => {
        human.removeClassName && human.removeClassName('map-marker--hidden')
      })
    },
    // 关注列表的添加、删除追踪
    addOrRemoveTrackingSubscriber (subscriber) {
      const find = this.trackingSubscribers.find(s => s.subscriberId === subscriber.subscriberId)
      if (find) {
        const index = this.trackingSubscribers.findIndex(s => s.subscriberId === subscriber.subscriberId)
        this.trackingSubscribers.splice(index, 1)
      } else {
        this.trackingSubscribers.push({ ...subscriber, show: false, showLine: false, scrollStartIndex: 1, scrollEndIndex: 6, startOffset: 0, listHeight: 0 })
      }
      this.opacity = 0
      setInterval(() => {
        this.opacity += 0.05
        if (this.opacity >= 1) {
          this.opacity = 1
        }
      }, 16)
    },
    // 追踪页删除追踪
    removeTrackingSubscriber (subscriber) {
      const find = this.trackingSubscribers.find(s => s.subscriberId === subscriber.subscriberId)
      if (find) {
        const index = this.trackingSubscribers.findIndex(s => s.subscriberId === subscriber.subscriberId)
        this.trackingSubscribers.splice(index, 1)
        if (subscriber.subscriberId === this.currentShowSubscriber.subscriberId) {
          // 如果删除的是当前正在地图上展示的，那么切换为展示第一个；如果删除后追踪列表清空了，则置为空
          if (this.trackingSubscribers.length === 0) {
            this.currentShowSubscriber = null
          } else {
            this.currentShowSubscriber = this.trackingSubscribers[0]
          }
        }
      }
    },
    // 关注列表追踪图标class
    symbolClass (subscriber) {
      const find = this.trackingSubscribers.find(s => s.subscriberId === subscriber.subscriberId)
      return find ? 'cn-icon-a-' : 'cn-icon-a-1'
    },
    // 地图上人图标鼠标悬浮框中点击追踪事件
    trackSubscriber (subscriber) {
      const find = this.trackingSubscribers.find(s => s.subscriberId === subscriber.subscriberId)
      if (!find) {
        this.trackingSubscribers.push({ ...subscriber, show: false, showLine: false, scrollStartIndex: 1, scrollEndIndex: 6, startOffset: 0, listHeight: 0 })
      }
      this.currentShowSubscriber = subscriber
      this.activeTab = 'traceTracking'
      this.tooltip.showMarkerTooltip = false
    },
    // 地图上点击多边形
    hexagonClick (e) {
      /*if (this.tooltip.type === this.tooltipType.hexagon) {
        this.removeHighlightHexagon()
        // 点击时已经高亮的话，取消过滤条件
        if (this.curHexId === this.currentPolygon.hexId) {
          this.curHexId = ''
        } else {
          this.curHexId = this.currentPolygon.hexId
        }
        // 单独生成一块色块，模拟高亮
        this.addHighlightHexagon()
        this.curPageNum = 1
        this.subscribersList = []
        this.initSubscriberList()
      }*/
      // 点击时已经高亮的话，取消过滤条件
      if (this.curHexId === this.currentPolygon.hexId) {
        this.curHexId = ''
      } else {
        this.curHexId = this.currentPolygon.hexId
      }
    },
    addHighlightHexagon () {
      // 先在地图上找是否存在色块，存在则创建高亮色块
      const sourceData = this.mapChart.getSource('hexGrid')._data
      const find = sourceData.features.find(d => d.properties.hexId === this.curHexId)
      console.info(find)
      if (find) {
        const featureCollection = { type: 'FeatureCollection' }
        featureCollection.features = [{
          id: 9920447175, // 随便写个数
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              h3ToGeoBoundary(this.curHexId, true)
            ]
          }
        }]
        this.mapChart.addSource('highlightHexGrid', {
          type: 'geojson',
          data: featureCollection
        })
        this.mapChart.addLayer({
          id: 'highlightHexagon',
          type: 'line',
          source: 'highlightHexGrid',
          layout: {},
          paint: {
            'line-color': 'rgb(255,255,255)',
            'line-width': 3
          }
        })
      }
    },
    removeHighlightHexagon () {
      this.mapChart.getLayer('highlightHexagon') && this.mapChart.removeLayer('highlightHexagon')
      this.mapChart.getSource('highlightHexGrid') && this.mapChart.removeSource('highlightHexGrid')
    },
    async initSubscriberList () {
      const params = {
        startTime: this.timeFilter.startTime,
        endTime: this.timeFilter.endTime,
        pageNo: this.curPageNum,
        pageSize: 20,
        params: '',
        isFollowed: this.onlyShowFollowed ? 1 : 0
      }
      const paramArray = []
      if (this.curHexId) {
        const levelField = this.mapLevelField.find(item => item.level === this.mapLevel)
        paramArray.push(levelField ? levelField.field + "='" + this.curHexId + "'" : '')
      }
      if (this.curSearchValue) {
        paramArray.push(" (subscriber_id like '%" + this.curSearchValue + "%' or phone_number like '%" + this.curSearchValue + "%') ")
      }
      if (paramArray.length > 0) {
        params.params = paramArray.join(' and ')
      }
      try {
        this.loading.subscriberLoading = true
        // 根据顶部的时间条件查列表，再根据底部时间轴的时间时间来查列表里的subscriber是否在线
        // 加载新数据、时间轴变化时，重新查在线状态
        await axios.get(api.location.totalCount, { params }).then(async response => {
          if (response.status === 200) {
            this.subscribersTotalCount = response.data.data[0].count
          }
        })
        await axios.get(api.location.list, { params }).then(async response => {
          if (response.status === 200) {
            if (response.data.data.length === 0 && this.curPageNum > 1) {
              this.loading.timeBarLoading = false
            } else if (response.data.data.length === 0 && this.curPageNum === 1) {
              this.loading.timeBarLoading = false
              this.subscribersList = []
            } else {
              await this.setSubscriberActiveStatus(response.data.data)
              if (params.pageNo === 1) {
                this.subscribersList = response.data.data
              } else {
                response.data.data.forEach(d => {
                  this.subscribersList.push(d)
                })
              }
              this.renderMarker(response.data.data, this.tooltipType.human)
              /*// 给所有active的subscriber添加marker
              const toRenderMarkerSubscribers = response.data.data.filter(r => {
                return !this.humanMarkers.some(m => m.subscriberId === r.subscriberId)
              })
              this.renderMarker(toRenderMarkerSubscribers, this.tooltipType.human)*/
            }
          }
        })
      } catch (e) {
        this.$message.error(this.errorMsgHandler(e))
        console.error(e)
      } finally {
        this.loading.subscriberLoading = false
      }
    },
    async setSubscriberActiveStatus (subscriberList) {
      this.loading.timeBarLoading = true
      const subscriberIds = subscriberList.map(d => d.subscriberId)
      const timelineParams = {
        startTime: this.minuteTimeFilter.startTime,
        endTime: this.minuteTimeFilter.endTime,
        level: this.mapLevel,
        subscriberIds: subscriberIds.map(id => `'${id}'`).join(',')
      }
      await axios.get(api.location.tracking, { params: timelineParams }).then(async response => {
        subscriberList.forEach(item => {
          const find = response.data.data.result.find(d => {
            if (d.subscriberId === item.subscriberId) {
              const hasHexIdArr = d.trackRecords.filter(t => t.hexId)
              if (hasHexIdArr.length > 0) {
                item.subscriberLatitude = hasHexIdArr[0].subscriberLatitude
                item.subscriberLongitude = hasHexIdArr[0].subscriberLongitude
                item.hexId = hasHexIdArr[0].hexId
                return true
              } else {
                item.subscriberLatitude = null
                item.subscriberLongitude = null
                item.hexId = null
              }
            }
            return false
          })
          item.active = find ? 1 : 0
        })
      }).finally(() => {
        this.loading.timeBarLoading = false
      })
    },
    // 针对我的关注列表的单条记录的关注和取消关注
    async handleFollow (item) {
      const subscriber = this.subscribersList.find(subscriber => subscriber.subscriberId === item.subscriberId)
      if (subscriber) {
        if (item.isFollowed === 1) {
          /* 刷新右侧列表 */
          subscriber.isFollowed = 1
          // 刷新地图上的人
          const find = this.humanMarkers.find(m => m.subscriberId === subscriber.subscriberId)
          if (find) {
            find.removeClassName && find.removeClassName('map-marker--unfollowed')
          }
          // 变更地图上图标的class
          if (this.currentZoom && this.currentZoom < 11) {
            this.hideBaseStation()
            this.hideFollowed()
          } else {
            this.showBaseStation()
            this.showFollowed()
          }
        } else {
          subscriber.isFollowed = 0
          // 刷新地图上的人
          const find = this.humanMarkers.find(m => m.subscriberId === subscriber.subscriberId)
          if (find) {
            find.addClassName && find.addClassName('map-marker--unfollowed')
          }
          // 变更地图上图标的class
          if (this.currentZoom && this.currentZoom < 11) {
            this.hideBaseStation()
            this.hideFollowed()
          } else {
            this.showBaseStation()
            this.showFollowed()
          }
        }
      }
    },
    // 针对我的关注列表的批量取消关注操作
    async handleCancelFollowBatch (items) {
      this.closeRightBox()
      items.forEach(item => {
        this.handleFollow(item)
      })
    },
    cancelFollowSubscribers (item) {
      axios.delete(api.location.follow + '?subscriberIds=' + item.subscriberId).then(res => {
        if (res.status === 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('location.cancelFollow.success') })
          /* 刷新右侧列表 */
          item.isFollowed = 0
          // 删除地图中对应的人
          this.humanMarkers.forEach(marker => {
            if (marker.subscriberId === item.subscriberId) {
              marker.isFollowed = null
              marker.addClassName && marker.addClassName('map-marker--unfollowed')
            }
          })
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(e => {
        this.$message.error(this.errorMsgHandler(e))
      })
    },
    followSubscribers (item) {
      if (item.isFollowed === 1) {
        axios.delete(api.location.follow + '?subscriberIds=' + item.subscriberId).then(res => {
          if (res.status === 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('location.cancelFollow.success') })
            /* 刷新右侧列表 */
            item.isFollowed = 0
            // 变更地图上图标的class
            const find = this.humanMarkers.find(m => m.subscriberId === item.subscriberId)
            if (find) {
              find.addClassName && find.addClassName('map-marker--unfollowed')
            }
            if (this.currentZoom && this.currentZoom < 11) {
              this.hideBaseStation()
              this.hideFollowed()
            } else {
              this.showBaseStation()
              this.showFollowed()
            }
          } else {
            this.$message.error(res.data.message)
          }
        }).catch(e => {
          this.$message.error(this.errorMsgHandler(e))
        })
      } else {
        axios.post(api.location.follow, { subscriberIds: item.subscriberId }).then(async res => {
          if (res.status === 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('location.follow.success') })
            /* 刷新右侧列表 */
            item.isFollowed = 1
            // 变更地图上图标的class
            const find = this.humanMarkers.find(m => m.subscriberId === item.subscriberId)
            if (find) {
              find.removeClassName && find.removeClassName('map-marker--unfollowed')
            }
            if (this.currentZoom && this.currentZoom < 11) {
              this.hideBaseStation()
              this.hideFollowed()
            } else {
              this.showBaseStation()
              this.showFollowed()
            }
          } else {
            this.$message.error(res.data.message)
          }
        }).catch(e => {
          this.$message.error(this.errorMsgHandler(e))
        })
      }
    },
    async clearHexId () {
      this.curHexId = ''
      this.curPageNum = 1
      this.subscribersList = []
      await this.initSubscriberList()
      this.removeHighlightHexagon()
    },
    async showFollowedSubscribers () {
      this.curPageNum = 1
      this.subscribersList = []
      await this.initSubscriberList()
    },
    async searchSubscribers () {
      this.curPageNum = 1
      this.subscribersList = []
      // 根据输入字符串，查找用户信息
      await this.initSubscriberList()
    },
    mapTimeLineChange (timeFilter) {
      this.minuteTimeFilter = {
        startTime: getSecond(timeFilter.startTime),
        endTime: getSecond(timeFilter.endTime)
      }
    },
    async minuteTimeFilterChange () {
      this.humanMarkers.forEach(marker => {
        marker.remove && marker.remove()
      })
      this.humanMarkers = []
      await this.setSubscriberActiveStatus(this.subscribersList)
      this.renderMarker(this.subscribersList, this.tooltipType.human)
    },
    onResize () {
      this.$nextTick(() => {
        this.mapDomHeight = document.getElementById('analysisMap').offsetHeight + 150
      })
    },
    onScroll (e) {
      const find = this.trackingSubscribers.find(d => d.subscriberId === e.target.id)
      // 当前滚动位置
      const scrollTop = e.target.scrollTop
      // 列表开始索引
      const startIndex = Math.floor(scrollTop / this.scrollInfo.itemSize) || 1
      // 列表结束索引
      const endIndex = Math.ceil((scrollTop + this.scrollInfo.containerHeight) / this.scrollInfo.itemSize)
      find.scrollStartIndex = startIndex
      find.scrollEndIndex = endIndex
      // 列表距离顶部距离
      find.startOffset = scrollTop - (scrollTop % this.scrollInfo.itemSize)
    }
  },
  watch: {
    async activeTab (n) {
      this.initFlag = true
      this.$store.state.headerMenuByTab = n
      if (n === 'traceTracking') {
        // 切换到轨迹追踪tab时，先移除地图上已有的图层和事件绑定、人型图标。基站予以保留
        this.unbindHexagonEvents()
        this.mapChart.getLayer('hexagon') && this.mapChart.removeLayer('hexagon')
        this.mapChart.getSource('hexGrid') && this.mapChart.removeSource('hexGrid')
        this.removeHighlightHexagon()
        this.curHexId = ''
        this.humanMarkers.forEach(marker => {
          marker.remove && marker.remove()
        })
        this.humanMarkers = []
        const newUrl = urlParamsHandler(`${window.location.protocol}//${window.location.host}/#/location/tracking`, {}, this.$route.query)
        overwriteUrl(newUrl)
        this.timeRefreshChange()
      } else if (n === 'locationMap') {
        this.unbindTrackingHexagonEvents()
        this.mapChart.getLayer('trackingHexagon') && this.mapChart.removeLayer('trackingHexagon')
        this.mapChart.getLayer('trackingLine') && this.mapChart.removeLayer('trackingLine')
        this.mapChart.getSource('trackingHexGrid') && this.mapChart.removeSource('trackingHexGrid')
        this.mapChart.getSource('trackingLineSource') && this.mapChart.removeSource('trackingLineSource')
        this.trackingHumanMarker.remove && this.trackingHumanMarker.remove()
        this.trackingHumanMarker = {}

        const newUrl = urlParamsHandler(`${window.location.protocol}//${window.location.host}/#/location/map`, {}, this.$route.query)
        overwriteUrl(newUrl)
        this.timeRefreshChange()
      }
    },
    // 时间轴改变时，重新查询人marker
    async minuteTimeFilter (n) {
      // 避免初始化时请求，造成人的图标会闪一下
      if (this.initFlag) {
        this.initFlag = false
        return
      }
      this.debounceMinuteChange?.()
    },
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
    async timeFilter (n) {
      this.boundaryBoxExtreme = null
      if (this.activeTab === 'locationMap') {
        this.initFlag = true
        this.unbindHexagonEvents()
        this.mapChart.getLayer('hexagon') && this.mapChart.removeLayer('hexagon')
        this.mapChart.getSource('hexGrid') && this.mapChart.removeSource('hexGrid')
        this.removeHighlightHexagon()
        this.humanMarkers.forEach(marker => {
          marker.remove && marker.remove()
        })
        this.humanMarkers = []
        await this.initLocationMapTab()
        if (this.curHexId) {
          this.addHighlightHexagon()
        }
      } else if (this.activeTab === 'traceTracking') {
        this.unbindTrackingHexagonEvents()
        this.mapChart.getLayer('trackingHexagon') && this.mapChart.removeLayer('trackingHexagon')
        this.mapChart.getLayer('trackingLine') && this.mapChart.removeLayer('trackingLine')
        this.mapChart.getSource('trackingHexGrid') && this.mapChart.removeSource('trackingHexGrid')
        this.mapChart.getSource('trackingLineSource') && this.mapChart.removeSource('trackingLineSource')
        this.trackingHumanMarker.remove && this.trackingHumanMarker.remove()
        this.trackingHumanMarker = {}
        await this.initTraceTrackingTab()
      }
    },
    trackingSubscribers: {
      deep: true,
      handler (n) {
        sessionStorage.setItem(storageKey.trackingSubscribers, JSON.stringify(n.map(item => ({ subscriberId: item.subscriberId, phoneNumber: item.phoneNumber, country: item.country, superAdministrativeArea: item.superAdministrativeArea, administrativeArea: item.administrativeArea }))))
      }
    },
    // 控制map loading
    'loading.hexagonLoading': {
      handler (n) {
        this.loading.mapLoading = n || this.loading.timeBarLoading || this.loading.baseStationLoading
      }
    },
    'loading.timeBarLoading': {
      handler (n) {
        this.loading.mapLoading = n || this.loading.hexagonLoading || this.loading.baseStationLoading
      }
    },
    'loading.baseStationLoading': {
      handler (n) {
        this.loading.mapLoading = n || this.loading.timeBarLoading || this.loading.hexagonLoading
      }
    },
    currentZoom (n, o) {
      if (o && n < 11) {
        this.hideBaseStation()
        this.hideFollowed()
      } else {
        this.showBaseStation()
        this.showFollowed()
      }
    },
    async curHexId (n, o) {
      this.removeHighlightHexagon()
      // 如果值不为空，寻找对应色块并高亮
      if (n) {
        this.addHighlightHexagon()
      }
      this.curPageNum = 1
      this.subscribersList = []
      await this.initSubscriberList()
    }
  },
  computed: {
    tooltipHeaderColor () {
      if (this.tooltip.type === this.tooltipType.hexagon) {
        const color = this.currentPolygon.color.split(',')
        color[0] = color[0].split('[')[1]
        color[2] = color[2].split(']')[0]
        return `rgba(${color.join(',')},.7)`
      } else if (this.tooltip.type === this.tooltipType.human) {
        return 'var(--el-color-business)'
      } else if (this.tooltip.type === this.tooltipType.baseStation) {
        return '#233447'
      }
      return ''
    },
    locationHandler () {
      return function (item) {
        const result = []
        if (item) {
          if (item.country) {
            result.push(item.country)
          }
          if (item.superAdministrativeArea) {
            result.push(item.superAdministrativeArea)
          }
          if (item.administrativeArea) {
            result.push(item.administrativeArea)
          }
        }
        return result.length > 0 ? result.join(', ') : '-'
      }
    }
  },
  async mounted () {
    /* const result = []
    const startLat = 39.5
    const startLng = 115.8
    const endLat = 40.3
    const endLng = 116.8
    const latStep = 0.0028
    const lngStep = 0.00435
    for (let i = startLat; i < endLat; i += latStep) {
      for (let j = startLng; j < endLng; j += lngStep) {
        const r = Math.random()
        let number = Math.round(r * r * r * 1000)
        if (number > 1000) {
          number = 1000
        }
        if (number < 1) {
          number = 1
        }
        result.push({ hexId: geoToH3(i, j, 8), number })
      }
    }
    const uniqueData = removeDuplicateHexIds(result)
    console.info(JSON.stringify(uniqueData))
    function removeDuplicateHexIds (array) {
      // 创建一个Map来存储唯一的hexId和对应的对象
      const uniqueObjects = new Map()

      // 遍历数组，如果Map中没有这个hexId，则将其加入Map
      array.forEach(item => {
        if (!uniqueObjects.has(item.hexId)) {
          uniqueObjects.set(item.hexId, item)
        }
      })

      // 将Map中的值（即对象）转换回数组
      return Array.from(uniqueObjects.values())
    } */
    await this.initMap()
    this.debounceMinuteChange = _.debounce(this.minuteTimeFilterChange, 500)
    this.debounceOnResize = _.debounce(this.onResize, 500)
    this.debounceVisualChange = _.debounce(this.hexagonVisualRangeChange, 500)
    this.debounceSearch = _.debounce(this.searchSubscribers, 500)
    this.onResize()
  },
  setup () {
    const { currentRoute } = useRouter()
    const currentPath = currentRoute.value.path
    const activeTab = ref('')
    const dropDownValue = ref('')
    const curSearchValue = ref('')
    switch (currentPath) {
      case ('/location/map'): {
        activeTab.value = 'locationMap'
        break
      }
      case ('/location/tracking'): {
        activeTab.value = 'traceTracking'
        break
      }
    }
    const { query } = useRoute()
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime

    // 优先级：url > config.js > 默认值。
    const dateRangeValue = rangeParam ? parseInt(rangeParam) : (DEFAULT_TIME_FILTER_RANGE.dashboard || 60)
    const timeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam || dateRangeValue > -1) {
      const { startTime, endTime } = getNowTime(dateRangeValue)
      timeFilter.value.startTime = getSecond(startTime)
      timeFilter.value.endTime = getSecond(endTime)
      // 将参数写入url
      const newUrl = urlParamsHandler(window.location.href, useRoute().query, { startTime: timeFilter.value.startTime, endTime: timeFilter.value.endTime, range: dateRangeValue })
      overwriteUrl(newUrl)
    } else {
      timeFilter.value.startTime = parseInt(startTimeParam)
      timeFilter.value.endTime = parseInt(endTimeParam)
    }
    const minuteTimeFilter = ref({})
    const tooltip = ref({
      type: ''
    })
    // const pieColorRamp = ['186,224,255', '105,177,255', '22,119,255', '0,62,179', '0,29,102']
    // const pieColorRamp = ['156,174,29', '241,198,0', '89,202,242', '63,133,186', '37,55,128']
    // const pieColorRamp = ['196,214,59', '190,230,255', '135,206,250', '63,133,186', '37,55,128']
    // const pieColorRamp = ['196,214,59', '135,206,250', '63,133,186', '45,65,135', '34,7,90']
    const pieColorRamp = ['135,206,250', '63,133,186', '45,65,135', '34,7,90']
    const pieValueRamp = ref([])
    const subscribersList = ref([])
    const subscribersTotalCount = ref(0)
    const searchValueListShow = ref([])
    const boundaryBox = ref({}) // minLongitude、maxLongitude、minLatitude、maxLatitude
    const boundaryBoxExtreme = ref(null) // minLongitude、maxLongitude、minLatitude、maxLatitude
    const mapChart = shallowRef(null)
    const currentMarkerDom = shallowRef(null)
    const humanMarkers = shallowRef([])
    const baseStationMarkers = shallowRef([])
    const trackingHumanMarker = shallowRef({})
    const pieChart = shallowRef(null)
    const pieOption = ref({})
    const lineChart = shallowRef(null)
    const lineOption = ref({})
    const currentBaseStation = ref({})
    const currentSubscriber = ref({})
    const currentPolygon = ref({})
    const highlightSubscriber = ref({})

    // 从localStorage中获取数据
    const trackingSubscribers = ref([])
    sessionStorage.getItem(storageKey.trackingSubscribers) && (trackingSubscribers.value = JSON.parse(sessionStorage.getItem(storageKey.trackingSubscribers)).map(item => ({ ...item, show: false, showLine: false, scrollStartIndex: 1, scrollEndIndex: 6, startOffset: 0, listHeight: 0 })))
    /* const test = ['gary6411', 'test6431', 'test6430', 'test6422']
    test.forEach(id => {
      trackingSubscribers.value.push({ subscriberId: id, show: false, showLine: false })
    }) */

    const currentShowSubscriber = ref(null)
    const loading = ref({
      mapLoading: true, // mapLoading控制location地图的loading，它状态同时受hexagonLoading、timeBarLoading、baseStationLoading影响
      hexagonLoading: true, // 六边形加载状态
      timeBarLoading: true, // 时间轴和地图上的人型图标的加载状态
      baseStationLoading: true, // 基站加载状态

      subscriberLoading: true, // 控制右侧关注用户列表加载状态
      pieLoading: true, // 控制饼图加载状态
      lineLoading: true, // 控制折线图加载状态
      searchLoading: false, // 搜索框加载状态
      trackingMapLoading: true // 控制追踪地图加载状态
    })

    const mapDomHeight = ref(0)
    const tooltipDomHeight = {
      hexagon: 153,
      baseStation: 153,
      human: 167
    }

    const mapConfig = localStorage.getItem(storageKey.mapConfig) ? JSON.parse(localStorage.getItem(storageKey.mapConfig)) : defaultMapConfig
    return {
      activeTab,
      dropDownValue,
      curSearchValue,
      timeFilter,
      minuteTimeFilter, // 底下时间轴的时间
      searchValueListShow, // 搜索框下拉列表
      tooltip, // 控制鼠标悬浮框
      pieColorRamp, // 六边形颜色坡度
      pieValueRamp, // 饼图数值坡度，动态获取
      subscribersList, // Location用户列表
      subscribersTotalCount, // Location用户总数
      boundaryBox, // 查六边形数据的经纬度范围，minLongitude、maxLongitude、minLatitude、maxLatitude
      boundaryBoxExtreme, // boundaryBox的历史极值，用来判断当前boundaryBox下是否需要查数据
      mapChart, // 地图对象
      currentMarkerDom, // 记录当前鼠标悬停的marker的dom
      humanMarkers, // 储存人marker的引用
      baseStationMarkers, // 储存基站marker的引用
      trackingHumanMarker, // 追踪页的人marker
      pieChart, // 饼图对象
      pieOption,
      lineChart, // 折线图对象
      lineOption,
      mapPolygonSourceData: shallowRef({}), // locationMap 的 maplibre sourceData
      trackingPolygonSourceData: shallowRef({}), // traceTracking 的 maplibre sourceData
      currentBaseStation, // 鼠标当前悬浮的基站
      currentSubscriber, // 鼠标当前悬浮的Subscriber
      currentPolygon, // 鼠标当前悬浮的六边形
      highlightSubscriber, // locationMap页保持高亮的subscriber
      trackingSubscribers, // 存放当前追踪的Subscriber列表
      currentShowSubscriber, // 当前在地图上展示轨迹的Subscriber
      trackingSubscriberRecordMap: [], // record数据量大时，vue监听性能开销太大，所以单独用非监听的数组来维护subscriberId与record的关系
      loading, // 控制组件内各处loading图标
      maxZoom: mapConfig.maxZoom, // 地图最小缩放比例
      minZoom: mapConfig.minZoom, // 地图最大缩放比例
      currentZoom: ref(null),
      mapLevel: mapConfig.mapLevel, // 地图精度  1、2、3
      unitTypes,
      defaultZoom: mapConfig.defaultZoom, // 地图默认缩放比例
      center: mapConfig.center, // 地图默认中心点。北京：[116.38, 39.9] 纽约：[-73.94539, 40.841843]
      debounceMinuteChange: shallowRef(null),
      debounceOnResize: shallowRef(null),
      debounceVisualChange: shallowRef(null),
      debounceSearch: shallowRef(null),
      mapLevelField,
      mapDomHeight, // 地图dom的高度，用来计算悬浮框的位置
      tooltipDomHeight // 计算悬浮框位置时默认的悬浮框高度
    }
  },
  unmounted () {
    if (this.mapChart && this.mapChart.remove) {
      this.mapChart && this.mapChart.remove()
    }
    if (this.pieChart && this.pieChart.dispose) {
      this.pieChart && this.pieChart.dispose()
    }
    if (this.lineChart && this.lineChart.dispose) {
      this.lineChart && this.lineChart.dispose()
    }
  }
}
</script>
