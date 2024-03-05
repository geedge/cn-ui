<template>
  <div class="geo-analysis">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('location.locationMap')" name="locationMap"></el-tab-pane>
      <el-tab-pane :label="$t('location.traceTracking')" name="traceTracking"></el-tab-pane>
    </el-tabs>
    <!-- 右上角工具栏 -->
    <div class="geo-tools">
      <el-select
              id="searchValue"
              ref="searchValue"
              v-model="dropDownValue"
              v-show="activeTab === 'locationMap'"
              size="mini"
              clearable
              filterable
              remote
              :placeholder="$t('location.enterPhoneNumberToSearch')"
              popper-class="search-select"
              placement="bottom"
              @blur="searchBlur"
              @focus="searchFocus"
              @change="changeSearchValue"
              @clear="clearSearchValue"
              @visible-change="visibleChange"
              :remote-method="dropDownSearch"
              v-select-load-more="onLoadMore"
              style="margin-right: 10px;"
      >
        <el-option
                v-for="item in searchValueListShow"
                :key="item.subscriberId"
                :value="item.phoneNumber"
                @click="changeValue(item)"
        >
          <span class="search-active" :class="item.active === 1 ? 'active-icon' : 'inactive-icon'"></span>
          <span class="search-value" >{{ item.phoneNumber }}</span>
          <span class="search-follow__icon" @click.stop="followSubscribers(item)">
            <i class="cn-icon-a- cn-icon" v-if="item.follow === 1"></i>
            <i class="cn-icon-a-1 cn-icon" v-else></i>
          </span>
        </el-option>
      </el-select>
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
      <div class="analysis-statistics" v-show="activeTab === 'locationMap'">
        <div class="analysis-statistics__chart">
          <simple-loading size="small" placement="top-end" :loading="loading.pieLoading"></simple-loading>
          <div class="chart__header">{{$t('location.populationDensity')}}</div>
          <div class="chart__body">
            <div class="chart__drawing" id="populationDensityChart"></div>
            <div class="chart__legend">
              <div v-for="legend in pieValueRamp" class="legend-item" :key="legend.color">
                <div class="legend-icon" :style="`background:rgb(${legend.color});`"></div>
                <div class="legend-range" >{{legend.start}}~{{legend.end}}</div>
                <div class="legend-count">{{legend.count}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="analysis-statistics__chart">
          <simple-loading size="small" placement="top-end" :loading="loading.lineLoading"></simple-loading>
          <div class="chart__header">{{$t('location.activeSubscribers')}}</div>
          <div class="chart__statistics">
            <div class="statistics-number">{{activeCount}}</div>
            <div class="statistics-trend">{{activeCountChain === '-' ? '-' : (activeCountChain < 0 ? '-'+valueToRangeValue(Math.abs(activeCountChain), unitTypes.percent).join(' '): valueToRangeValue(activeCountChain, unitTypes.percent).join(' '))}}</div>
          </div>
          <div class="chart-line__drawing" id="activeSubscribersChart"></div>
        </div>
        <div class="analysis-statistics__title">{{$t('location.followedSubscribers')}}</div>
        <div class="analysis-statistics__subscribers">
          <template v-for="item in followedSubscribersList" :key="item.subscriberId">
            <div class="analysis-statistics__subscriber">
              <div class="subscriber__header" :class="item.active === 1 ? '' : 'subscriber__header-inactive'" >
                <div class="header__icon">
                  <div class="icon__box">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z" fill="#ffffff"></path></svg>
                  </div>
                </div>
                <div class="header__right">
                  <div class="header-msisdn">
                    <div class="header__title">MSISDN</div>
                    <div class="header__content">{{$_.get(item, 'subscriberDto.phoneNumber', '-')}}</div>
                  </div>
                  <div class="header__operation">
                    <div class="trajectory-text" @click="addOrRemoveTrackingSubscriber(item)">
                        <i class="cn-icon" :class="symbolClass(item)"></i>{{$t('location.track')}}
                    </div>
                    <div class="cancel-follow" @click.stop="cancelFollowSubscribers(item)">
                      <i class="cn-icon-close cn-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div class="subscriber__body">
                <div class="body__item">
                  <div class="item__label">ID</div>
                  <div class="item__value">{{item.subscriberId}}</div>
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
                  <div class="item__value">China, Shanghai</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- 右侧数据栏-trace -->
      <div class="analysis-statistics" v-show="activeTab === 'traceTracking'">
        <div class="analysis-statistics__no-tracking-tip" v-if="trackingSubscribers.length === 0" @click="activeTab = 'locationMap'">{{$t('location.noTrackingYet')}}</div>
        <div class="analysis-statistics__subscribers">
          <template v-for="(subscriber, index) in trackingSubscribers" :key="subscriber.subscriberId">
            <div
                class="analysis-statistics__subscriber"
                :class="currentShowSubscriber && currentShowSubscriber.subscriberId === subscriber.subscriberId ? 'analysis-statistics__subscriber--active' : ''"
                @click="changeCurrentShowSubscriber(subscriber)">
              <div class="subscriber__header">
                <div class="header__icon">
                  <div class="icon__box">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z" fill="#ffffff"></path></svg>
                  </div>
                </div>
                <div class="header__right">
                  <div class="header-msisdn">
                    <div class="header__title">MSISDN</div>
                    <div class="header__content">{{$_.get(subscriber, 'subscriberDto.phoneNumber', '-')}}</div>
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
                  <div class="item__label">ID</div>
                  <div class="item__value">{{subscriber.subscriberId}}</div>
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
                <div class="body-item-record">
                  <div class="item-record__header">{{ $t('location.trackRecord') }}</div>
                  <template v-if="subscriber.trackRecords && subscriber.trackRecords.length > 0">
                    <div class="item-record__info">
                      <div class="circle"></div>
                    </div>
                    <div class="item-record__timeline">
                      <div class="timeline__info">
                        <div class="timeline__info--circle">
                          <div class="info__circle"></div>
                          <div class="info__line" v-show="subscriber.showLine"></div>
                        </div>
                        <div class="timeline__info--item">
                          <div>
                            <span>{{$t('overall.location')}}: </span><span class="info--item__value">{{subscriber.trackRecords[0].subscriberLongitude}},{{subscriber.trackRecords[0].subscriberLatitude}}</span>
                          </div>
                          <div>
                            <span>{{ $t('location.timeOfArrival') }}: </span><span class="info--item__value">{{dateFormatByAppearance(Number(subscriber.trackRecords[0].time))}}</span>
                          </div>
                          <div>
                            <span>{{ $t('location.residenceTime') }}: </span><span class="info--item__value">-</span>
                          </div>
                        </div>
                      </div>
                      <el-timeline v-show="subscriber.show" :class="subscriber.show ? '' : 'el-timeline--hide'">
                        <template v-for="(record, index) in subscriber.trackRecords">
                          <el-timeline-item
                              :key="index"
                              v-if="index > 0"
                              color="#de3434"
                          >
                            <div class="timeline__item">
                              <div>
                                <span>{{$t('overall.location')}}: </span><span class="item__value">{{record.subscriberLongitude}},{{record.subscriberLatitude}}</span>
                              </div>
                              <div>
                                <span>{{ $t('location.timeOfArrival') }}: </span><span class="item__value">{{dateFormatByAppearance(Number(record.time))}}</span>
                              </div>
                              <div>
                                <span>{{ $t('location.residenceTime') }}: </span><span class="item__value">{{record.stayTime}}</span>
                              </div>
                            </div>
                          </el-timeline-item>
                        </template>
                      </el-timeline>

                      <div class="item-record__btn" @click.stop="clickTrackBlock(index)">
                        <span v-if="!subscriber.show"><i class="cn-icon cn-icon-down2"></i></span>
                        <span v-if="subscriber.show"><i class="cn-icon cn-icon-up2"></i></span>
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
    <div class="geo-analysis__hexagon-tooltip" id="tooltip" :class="`geo-analysis__hexagon-tooltip--${tooltip.type}`" v-if="tooltip.showMarkerTooltip || tooltip.showPolygonTooltip" :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}" @mouseenter="tooltipMouseEnter" @mouseleave="tooltipMouseLeave">
      <div class="hexagon-tooltip__header" :style="`background-color: ${tooltipHeaderColor}`">
        <div class="header__icon">
          <svg v-if="tooltip.type === tooltipType.hexagon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="36" height="36"><path d="M747.52 921.088H277.504L42.496 514.048l235.008-407.04H747.52l235.008 407.04-235.008 407.04z m-425.472-76.8h381.44l190.464-330.24-190.464-330.24h-381.44l-190.464 330.24 190.464 330.24z" fill="#fff"></path></svg>
          <template v-else-if="tooltip.type === tooltipType.human">
            <div class="icon__box">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z" fill="#ffffff"></path></svg>
            </div>
          </template>
          <template v-else-if="tooltip.type === tooltipType.baseStation">
            <div class="icon__box">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M164.901926 519.585185a391.35763 391.35763 0 0 1-30.151111-152.38637c0-52.527407 10.05037-105.054815 30.151111-152.348445 15.094519-47.29363 45.283556-89.353481 80.516741-126.103703L174.990222 15.17037C129.706667 62.464 94.511407 114.991407 69.328593 178.062222 44.183704 241.095111 34.133333 304.165926 34.133333 367.198815c0 63.070815 10.05037 131.375407 35.19526 189.174518 25.182815 57.799111 60.378074 115.598222 105.661629 162.891852l70.428445-73.576296c-35.233185-36.788148-65.422222-78.810074-80.516741-126.103704z" p-id="8786" fill="#ffffff"></path><path d="M255.469037 477.563259c15.094519 36.788148 35.195259 68.266667 60.340148 94.549334l70.428445-73.576297a233.168593 233.168593 0 0 1-40.201482-57.761185c-5.044148-26.282667-10.088296-47.29363-10.088296-73.576296 0-26.244741 5.044148-47.29363 15.094518-68.266667 5.006222-26.282667 20.100741-42.097778 35.19526-63.070815l-70.428445-73.576296c-25.144889 26.282667-45.24563 57.799111-60.340148 94.587259-15.094519 36.788148-20.100741 73.576296-20.100741 110.364445 0 36.788148 5.006222 73.53837 20.100741 110.326518zM436.527407 367.198815c0 43.538963 33.792 78.810074 75.472593 78.810074s75.472593-35.271111 75.472593-78.810074c0-43.501037-33.792-78.810074-75.472593-78.810074s-75.472593 35.271111-75.472593 78.810074zM637.76237 498.574222l70.428445 73.576297c25.144889-26.282667 45.24563-57.837037 60.340148-94.58726 15.094519-36.788148 20.100741-73.576296 20.100741-110.364444 0-36.788148-5.006222-73.576296-20.100741-110.364445-15.094519-36.750222-35.195259-68.266667-60.340148-94.549333l-70.428445 73.576296c15.094519 15.739259 30.189037 36.788148 40.201482 57.799111 10.088296 21.010963 15.132444 47.29363 15.132444 68.266667 0 26.282667-5.044148 47.331556-15.094518 68.342519-10.05037 31.516444-25.144889 47.29363-40.239408 68.266666z" p-id="8787" fill="#ffffff"></path><path d="M954.671407 178.062222C929.488593 114.991407 894.293333 62.464 849.009778 15.17037L778.619259 88.746667c35.233185 36.788148 60.378074 78.810074 80.516741 126.103703 20.100741 47.255704 30.151111 99.821037 30.151111 152.348445 0 52.565333-10.05037 105.092741-30.151111 152.38637-20.100741 47.29363-45.283556 89.315556-80.516741 126.103704l70.428445 73.576296c45.283556-47.29363 80.478815-99.858963 105.661629-162.891852 25.144889-63.070815 35.195259-126.103704 35.19526-189.174518 0-63.032889-10.05037-131.337481-35.19526-189.136593zM210.185481 1024h603.629038L512 551.10163 210.185481 1024z m186.102519-105.054815L512 740.238222l115.674074 178.631111h-231.348148z" fill="#ffffff"></path></svg>
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
            <div class="body__timeline" v-for="item in JSON.parse(currentPolygon.locations)" :key="item.hexId">
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
import { ref, shallowRef } from 'vue'
import { dateFormatByAppearance, getNowTime, getSecond } from '@/utils/date-util'
import maplibregl from 'maplibre-gl'
import mapStyle from '@/views/charts2/charts/entityDetail/mapStyle'
import 'maplibre-gl/dist/maplibre-gl.css'
import unitConvert, { valueToRangeValue } from '@/utils/unit-convert'
import { unitTypes, storageKey } from '@/utils/constants'
import * as echarts from 'echarts'
import { appListChartOption } from '@/views/charts2/charts/options/echartOption'
import { pieOption } from '@/views/location/chartOption'
import _ from 'lodash'
import { useRoute, useRouter } from 'vue-router'
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import axios from 'axios'
import { api } from '@/utils/api'
import { h3ToGeo, h3ToGeoBoundary } from 'h3-js'
import collapse from '../../components/common/collapse'
import TimeLine from '@/components/common/TimeLine.vue'
import SimpleLoading from '@/components/common/SimpleLoading.vue'

const humanSvg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M366.689524 690.468571l87.283809 83.821715-75.434666 195.486476c-10.971429 27.794286-43.105524 42.081524-72.265143 32.036571-29.159619-10.24-44.080762-41.252571-33.450667-69.241904L366.689524 690.468571zM203.824762 476.306286l51.785143-95.183238a162.279619 162.279619 0 0 1 59.245714-59.977143c119.710476-68.266667 134.777905-67.291429 149.942857-66.218667l80.798476 5.168762c24.868571 0.975238 42.081524 7.314286 125.025524 124.14781a21.26019 21.26019 0 0 0 14.092191 8.289523l99.132952 14.482286c12.873143 1.852952 24.478476 8.582095 32.182857 18.67581a45.494857 45.494857 0 0 1 8.825905 35.108571 46.665143 46.665143 0 0 1-19.504762 30.866286 50.468571 50.468571 0 0 1-36.571429 8.435809l-99.181714-14.433524a119.954286 119.954286 0 0 1-79.774476-47.640381c-4.388571-6.241524-7.558095-11.361524-11.849143-16.579047l-63.634286 193.487238 88.405334 84.845714c12.970667 12.385524 23.698286 29.013333 30.232381 45.494857l67.876571 190.366477c5.022476 13.409524 4.193524 28.233143-2.291809 41.057523a54.613333 54.613333 0 0 1-32.182858 27.160381c-5.851429 2.048-12.092952 3.120762-18.383238 3.169524a58.075429 58.075429 0 0 1-53.930666-36.181333l-67.876572-190.366476c-1.024-2.096762-2.096762-3.120762-3.218285-5.168762L365.616762 623.177143a84.894476 84.894476 0 0 1-24.868572-80.700953l34.523429-146.919619c-3.413333 2.340571-7.070476 4.388571-10.776381 6.290286a58.806857 58.806857 0 0 0-22.674286 22.723048L290.133333 519.801905a49.834667 49.834667 0 0 1-43.105523 24.819809 59.977143 59.977143 0 0 1-22.674286-5.12 46.518857 46.518857 0 0 1-20.48-63.146666z m209.67619-360.448C420.08381 58.465524 473.86819 17.066667 533.650286 23.30819 593.383619 29.549714 636.537905 81.13981 630.00381 138.48381c-6.534095 57.392762-60.269714 98.840381-120.05181 92.550095-59.782095-6.241524-102.985143-57.782857-96.451048-115.175619z" fill="#ffffff"></path></svg>'
const baseStationSvg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M164.901926 519.585185a391.35763 391.35763 0 0 1-30.151111-152.38637c0-52.527407 10.05037-105.054815 30.151111-152.348445 15.094519-47.29363 45.283556-89.353481 80.516741-126.103703L174.990222 15.17037C129.706667 62.464 94.511407 114.991407 69.328593 178.062222 44.183704 241.095111 34.133333 304.165926 34.133333 367.198815c0 63.070815 10.05037 131.375407 35.19526 189.174518 25.182815 57.799111 60.378074 115.598222 105.661629 162.891852l70.428445-73.576296c-35.233185-36.788148-65.422222-78.810074-80.516741-126.103704z" p-id="8786" fill="#ffffff"></path><path d="M255.469037 477.563259c15.094519 36.788148 35.195259 68.266667 60.340148 94.549334l70.428445-73.576297a233.168593 233.168593 0 0 1-40.201482-57.761185c-5.044148-26.282667-10.088296-47.29363-10.088296-73.576296 0-26.244741 5.044148-47.29363 15.094518-68.266667 5.006222-26.282667 20.100741-42.097778 35.19526-63.070815l-70.428445-73.576296c-25.144889 26.282667-45.24563 57.799111-60.340148 94.587259-15.094519 36.788148-20.100741 73.576296-20.100741 110.364445 0 36.788148 5.006222 73.53837 20.100741 110.326518zM436.527407 367.198815c0 43.538963 33.792 78.810074 75.472593 78.810074s75.472593-35.271111 75.472593-78.810074c0-43.501037-33.792-78.810074-75.472593-78.810074s-75.472593 35.271111-75.472593 78.810074zM637.76237 498.574222l70.428445 73.576297c25.144889-26.282667 45.24563-57.837037 60.340148-94.58726 15.094519-36.788148 20.100741-73.576296 20.100741-110.364444 0-36.788148-5.006222-73.576296-20.100741-110.364445-15.094519-36.750222-35.195259-68.266667-60.340148-94.549333l-70.428445 73.576296c15.094519 15.739259 30.189037 36.788148 40.201482 57.799111 10.088296 21.010963 15.132444 47.29363 15.132444 68.266667 0 26.282667-5.044148 47.331556-15.094518 68.342519-10.05037 31.516444-25.144889 47.29363-40.239408 68.266666z" p-id="8787" fill="#ffffff"></path><path d="M954.671407 178.062222C929.488593 114.991407 894.293333 62.464 849.009778 15.17037L778.619259 88.746667c35.233185 36.788148 60.378074 78.810074 80.516741 126.103703 20.100741 47.255704 30.151111 99.821037 30.151111 152.348445 0 52.565333-10.05037 105.092741-30.151111 152.38637-20.100741 47.29363-45.283556 89.315556-80.516741 126.103704l70.428445 73.576296c45.283556-47.29363 80.478815-99.858963 105.661629-162.891852 25.144889-63.070815 35.195259-126.103704 35.19526-189.174518 0-63.032889-10.05037-131.337481-35.19526-189.136593zM210.185481 1024h603.629038L512 551.10163 210.185481 1024z m186.102519-105.054815L512 740.238222l115.674074 178.631111h-231.348148z" fill="#ffffff"></path></svg>'

export default {
  name: 'Location',
  data () {
    return {
      tooltipType: {
        hexagon: 'hexagon',
        baseStation: 'base-station',
        human: 'human'
      },
      activeCount: '',
      activeCountChain: '',
      curPageNum: 1,
      activeNames: '',
      isLoadingMore: false
    }
  },
  components: {
    collapse,
    TimeLine,
    SimpleLoading
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
        console.info('map loaded')
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
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.6]
        }
      })
      // 六边形的鼠标事件
      this.bindHexagonEvents()

      /* 地图上的人 */
      const mapFollowedSubscriberData = await this.queryMapFollowedSubscriber()
      this.renderMarker(mapFollowedSubscriberData, this.tooltipType.human)

      /* 右侧关注列表 */
      await this.queryFollowedList()
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
        this.currentShowSubscriber.trackRecords = find.trackRecords
      }
      this.renderTrackingHexagon()
    },
    async renderDensityPie () {
      const params = {
        ...this.timeFilter
      }
      this.loading.pieLoading = true
      try {
        const response = await axios.get(api.location.density, { params })
        const densityData = response.data.data
        // 按值的大小分为5组，并计算各组数量和颜色
        this.pieValueRamp = this.calculateValueRamp(densityData)
        const option = _.cloneDeep(pieOption)
        option.color = this.pieColorRamp.map(c => `rgb(${c})`)
        option.series[0].name = this.$t('location.populationDensity')
        option.series[0].data = this.pieValueRamp.map((r, i) => ({
          name: `${r.start}~${r.end}`,
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
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        this.loading.pieLoading = false
      }
    },
    async renderActiveSubscribersLine () {
      const params = {
        ...this.timeFilter
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
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        this.loading.lineLoading = false
      }
    },
    async queryFollowedList () {
      const params = {
        ...this.timeFilter,
        pageSize: -1
      }
      this.loading.followSubscriberLoading = true
      try {
        const response = await axios.get(api.location.followedSubscriber, { params })
        this.followedSubscribersList = response.data.data.list
      } catch (e) {
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        this.loading.followSubscriberLoading = false
      }
    },
    async queryHexagon () {
      const params = {
        ...this.boundaryBox,
        ...this.timeFilter
      }
      this.loading.hexagonLoading = true
      try {
        const response = await axios.get(api.location.map, { params })
        return response.data.data
      } catch (e) {
        this.errorMsgHandler(e)
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
        this.loading.baseStationLoading = false
      }
      return []
    },
    async queryMapFollowedSubscriber () {
      this.loading.timeBarLoading = true
      try {
        const response = await axios.get(api.location.followedSubscriber, { params: this.minuteTimeFilter })
        return response.data.data.list
      } catch (e) {
        this.errorMsgHandler(e)
        console.error(e)
      } finally {
        this.loading.timeBarLoading = false
      }
      return []
    },
    async queryTraceTracking () {
      if (this.trackingSubscribers.length > 0) {
        this.loading.trackingMapLoading = true
        const params = {
          ...this.timeFilter,
          subscriberIds: this.trackingSubscribers.map(item => `'${item.subscriberId}'`).join(',')
        }
        try {
          const response = await axios.get(api.location.tracking, { params })
          if (response.data.data.result) {
            this.trackingSubscribers.forEach(s => {
              const find = response.data.data.result.find(item => item.subscriberId === s.subscriberId)
              if (find) {
                s.trackRecords = find.trackRecords
              } else {
                s.trackRecords = []
              }
            })
          } else {
            this.trackingSubscribers.forEach(s => {
              s.trackRecords = []
            })
          }
          // 计算停留时间
          this.trackingSubscribers.forEach(s => {
            if (s.trackRecords && s.trackRecords.length > 0) {
              for (let i = 0; i < s.trackRecords.length; i++) {
                // 最新的位置点不计算停留时间
                if (i === 0) {
                  s.trackRecords[i].stayTime = '-'
                } else {
                  const stayTime = unitConvert(s.trackRecords[i - 1].time - s.trackRecords[i].time, unitTypes.time, 's')
                  if (Number(stayTime[0]) === Number(Number(stayTime[0]).toFixed(0))) {
                    stayTime[0] = Number(stayTime[0]).toFixed(0)
                  }
                  s.trackRecords[i].stayTime = stayTime.join(' ')
                }
              }
            }
          })
        } catch (e) {
          this.errorMsgHandler(e)
          console.error(e)
        } finally {
          this.loading.trackingMapLoading = false
        }
      } else {
        this.loading.trackingMapLoading = false
      }
    },
    renderTrackingHexagon () {
      if (this.currentShowSubscriber.trackRecords && this.currentShowSubscriber.trackRecords.length > 0) {
        // 六边形
        const polygonSourceData = this.hexagonDataConverter(this.currentShowSubscriber.trackRecords, 'traceTracking')
        this.mapChart.addSource('trackingHexGrid', {
          type: 'geojson',
          data: polygonSourceData
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
        const mapLineSourceData = this.mapLineDataConverter(polygonSourceData)
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
        const coordinate = h3ToGeo(this.currentShowSubscriber.trackRecords[0].hexId)
        this.renderTrackingMarker([coordinate[1], coordinate[0]])
        this.bindTrackingHexagonEvents()
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
            el.innerHTML = svg
            // 鼠标事件，控制tooltip显示和marker尺寸
            this.bindMarkerEvent(el, marker, type)
            const mapMarker = new maplibregl.Marker({ element: el })
              .setLngLat([marker.subscriberDto.subscriberLongitude, marker.subscriberDto.subscriberLatitude])
              .addTo(this.mapChart)
            mapMarker.subscriberId = marker.subscriberId
            this.humanMarkers.push(mapMarker)
          } else if (type === this.tooltipType.baseStation) {
            const el = document.createElement('div')
            el.className = `map-marker map-marker--${type}`
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
      /* this.boundaryBox = {
        maxLongitude: boundaryBox.getEast(),
        maxLatitude: boundaryBox.getNorth(),
        minLongitude: boundaryBox.getWest(),
        minLatitude: boundaryBox.getSouth()
      } */
      this.boundaryBox = {
        maxLongitude: 140,
        maxLatitude: 50,
        minLongitude: 100,
        minLatitude: 30
      }
    },
    // 先使用min=0的等宽分组法，若后续出现特大或特小的异常值导致等宽分组效果不理想，考虑用分位数分组法
    calculateValueRamp (data) {
      const max = _.maxBy(data, d => Number(d.number))
      const result = []
      if (max) {
        const maxLength = String(max.number).length
        const maxLegend = Math.ceil(max.number / Math.pow(10, maxLength - 1)) * Math.pow(10, maxLength - 1)
        for (let i = 1; i <= 5; i++) {
          const item = {
            start: maxLegend * (i - 1) / 5 + 1,
            end: maxLegend * i / 5,
            color: this.pieColorRamp[i - 1]
          }
          item.count = data.filter(d => d.number >= item.start && d.number < item.end).length
          result.push(item)
        }
      }
      return result
    },
    hexagonDataConverter (data, tab) {
      const featureCollection = { type: 'FeatureCollection' }
      if (tab === 'locationMap') {
        featureCollection.features = data.map((d, i) => ({
          id: i + 1,
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
            hexagons.push({ hexId: d.hexId, locations: [{ time: d.time, longitude: d.subscriberLongitude, latitude: d.subscriberLatitude }] })
          } else {
            find.locations.push({ time: d.time, longitude: d.subscriberLongitude, latitude: d.subscriberLatitude })
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
      const ramp = this.pieValueRamp.filter(r => Number(number) >= r.start && Number(number) <= r.end)
      if (ramp.length > 0) {
        return ramp[0].color.split(',').map(n => Number(n))
      }
      return [229, 229, 229]
    },
    mapLineDataConverter (polygonSourceData) {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: polygonSourceData.features.map(d => {
            const cs = h3ToGeo(d.properties.hexId)
            return [cs[1], cs[0]]
          })
        }
      }
      return {
        type: 'FeatureCollection',
        features: [feature]
      }
    },
    bindHexagonEvents () {
      this.mapChart.on('mouseenter', 'hexagon', this.hexagonMouseEnter)
      this.mapChart.on('mouseleave', 'hexagon', this.hexagonMouseLeave)
      this.mapChart.on('mousemove', 'hexagon', this.hexagonMouseMove)
    },
    unbindHexagonEvents () {
      this.mapChart.off('mouseenter', this.hexagonMouseEnter)
      this.mapChart.off('mouseleave', this.hexagonMouseLeave)
      this.mapChart.off('mousemove', this.hexagonMouseMove)
    },
    bindTrackingHexagonEvents () {
      this.mapChart.on('mouseenter', 'trackingHexagon', this.trackingHexagonMouseEnter)
      this.mapChart.on('mouseleave', 'trackingHexagon', this.trackingHexagonMouseLeave)
      this.mapChart.on('mousemove', 'trackingHexagon', this.trackingHexagonMouseMove)
    },
    unbindTrackingHexagonEvents () {
      this.mapChart.off('mouseenter', this.trackingHexagonMouseEnter)
      this.mapChart.off('mouseleave', this.trackingHexagonMouseLeave)
      this.mapChart.off('mousemove', this.trackingHexagonMouseMove)
    },
    hexagonMouseEnter () {
      this.tooltip.mouseIsInPolygon = true
    },
    hexagonMouseLeave () {
      const _this = this
      this.tooltip.showPolygonTooltip = false
      this.tooltip.mouseIsInPolygon = false
      // 去掉上一块的高亮
      hoverTrigger('hexGrid', this.currentPolygon.id, false)

      function hoverTrigger (source, id, hover) {
        _this.mapChart.setFeatureState({ source, id }, { hover })
      }
    },
    hexagonMouseMove (e) {
      const _this = this
      const { originalEvent, features } = e
      if (!this.tooltip.mouseInMarkerOrTooltip) {
        this.tooltip.showPolygonTooltip = true
        this.tooltip.type = this.tooltipType.hexagon
        if (this.tooltip.type === this.tooltipType.hexagon && this.currentPolygon.id && this.currentPolygon.id !== features[0].id) {
          // 去掉上一块的高亮
          hoverTrigger('hexGrid', this.currentPolygon.id, false)
        }
        this.currentPolygon = features[0].properties
        this.currentPolygon.id = features[0].id
        this.tooltip.x = originalEvent.clientX + 15
        this.tooltip.y = originalEvent.clientY + 5

        // 鼠标滑过高亮
        hoverTrigger('hexGrid', this.currentPolygon.id, true)
      }

      function hoverTrigger (source, id, hover) {
        _this.mapChart.setFeatureState({ source, id }, { hover })
      }
    },
    trackingHexagonMouseEnter () {
      this.tooltip.mouseIsInPolygon = true
    },
    trackingHexagonMouseLeave () {
      const _this = this
      this.tooltip.showPolygonTooltip = false
      this.tooltip.mouseIsInPolygon = false
      // 去掉上一块的高亮
      hoverTrigger('trackingHexGrid', this.currentPolygon.id, false)

      function hoverTrigger (source, id, hover) {
        _this.mapChart.setFeatureState({ source, id }, { hover })
      }
    },
    trackingHexagonMouseMove (e) {
      const _this = this
      const { originalEvent, features } = e
      if (!this.tooltip.mouseInMarkerOrTooltip) {
        this.tooltip.showPolygonTooltip = true
        this.tooltip.type = this.tooltipType.hexagon
        if (this.tooltip.type === this.tooltipType.hexagon && this.currentPolygon.id && this.currentPolygon.id !== features[0].id) {
          // 去掉上一块的高亮
          hoverTrigger('trackingHexGrid', this.currentPolygon.id, false)
        }
        this.currentPolygon = features[0].properties
        this.currentPolygon.id = features[0].id
        this.currentPolygon.location = `${h3ToGeo(this.currentPolygon.hexId)[1]}, ${h3ToGeo(this.currentPolygon.hexId)[0]}`
        this.tooltip.x = originalEvent.clientX + 15
        this.tooltip.y = originalEvent.clientY + 5

        // 鼠标滑过高亮
        hoverTrigger('trackingHexGrid', this.currentPolygon.id, true)
      }

      function hoverTrigger (source, id, hover) {
        _this.mapChart.setFeatureState({ source, id }, { hover })
      }
    },

    bindMarkerEvent (el, markerData, type) {
      el.addEventListener('mouseenter', e => {
        this.currentMarkerDom = el
        if (type === this.tooltipType.human) {
          this.currentSubscriber = markerData
        } else if (type === this.tooltipType.baseStation) {
          this.currentBaseStation = markerData
        }
        if (!this.tooltip.mouseInMarkerOrTooltip) {
          this.tooltip.x = e.clientX + 15 - e.offsetX
          this.tooltip.y = e.clientY + 15 - e.offsetY
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
    timeRefreshChange () {
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
      this.trackingSubscribers[i].show = !this.trackingSubscribers[i].show
      if (this.trackingSubscribers[i].show) {
        this.trackingSubscribers[i].showLine = true
      } else {
        const timer = setTimeout(() => {
          this.trackingSubscribers[i].showLine = false
          clearTimeout(timer)
        }, 200)
      }
    },
    changeCurrentShowSubscriber (subscriber) {
      if (subscriber.subscriberId !== this.currentShowSubscriber.subscriberId) {
        this.currentShowSubscriber = subscriber
      }
    },
    // 关注列表的添加、删除追踪
    addOrRemoveTrackingSubscriber (subscriber) {
      const find = this.trackingSubscribers.find(s => s.subscriberId === subscriber.subscriberId)
      if (find) {
        const index = this.trackingSubscribers.findIndex(s => s.subscriberId === subscriber.subscriberId)
        this.trackingSubscribers.splice(index, 1)
      } else {
        this.trackingSubscribers.push({ ...subscriber, show: false, showLine: false })
      }
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
        this.trackingSubscribers.push({ ...subscriber, show: false, showLine: false })
      }
      this.currentShowSubscriber = subscriber
      this.activeTab = 'traceTracking'
      this.tooltip.showMarkerTooltip = false
    },
    async initDropdownList (curSearchValue) {
      if (curSearchValue !== '') {
        const params = {
          startTime: this.timeFilter.startTime,
          endTime: this.timeFilter.endTime,
          pageNo: this.curPageNum++,
          pageSize: 10,
          params: "phone_number like '%"+ curSearchValue +"%'"
        }
        this.loading.searchLoading = true
        try {
          this.isLoadingMore = true
          await axios.get(api.location.list, { params }).then(async response => {
            if (response.status === 200) {
              if (this.curPageNum === 1) {
                this.searchValueListShow = response.data.data
              } else {
                this.searchValueListShow = this.searchValueListShow.concat(response.data.data)
              }
              if (response.data.data.length === 0 && this.curPageNum > 1) {
                this.curPageNum--
              }
              if (params.pageNo === 1) {
                this.$nextTick(() => {
                  const selectDom = document.getElementsByClassName('el-select-dropdown search-select')
                  if(selectDom) {
                    let dom = selectDom[0].getElementsByClassName('el-scrollbar__thumb')
                    if (dom && dom[1]) {
                      dom[1].style = 'transform: translateY(0%) !important;'
                    }
                  }
                })
              }
            }
          })
        } catch (e) {
          this.errorMsgHandler(e)
          console.error(e)
        } finally {
          this.isLoadingMore = false
          this.loading.searchLoading = false
        }
      }
    },
    changeValue (item) {
    },
    changeSearchValue (value) {
    },
    searchBlur () {

    },
    searchFocus () {
    },
    onLoadMore () {
      if (!this.isLoadingMore) {
        this.initDropdownList(this.curSearchValue)
      }
    },
    cancelFollowSubscribers (item) {
      axios.delete(api.location.follow + '?subscriberId=' + item.subscriberId).then(res => {
        if (res.status === 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('location.cancleFollow.success') })
          /* 刷新右侧关注列表 */
          this.queryFollowedList()
          // 删除地图中对应的人
          this.humanMarkers.forEach(marker => {
            if (marker.subscriberId === item.subscriberId) {
              marker.remove()
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
      if (item.follow === 1) {
        axios.delete(api.location.follow + '?subscriberId=' + item.subscriberId).then(res => {
          if (res.status === 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('location.cancleFollow.success') })
            item.follow = 0
            // 删除地图中对应的人
            this.humanMarkers.forEach(marker => {
              if (marker.subscriberId === item.subscriberId) {
                marker.remove()
              }
            })
            /* 刷新右侧关注列表 */
            this.queryFollowedList()
          } else {
            this.$message.error(res.data.message)
          }
        }).catch(e => {
          this.$message.error(this.errorMsgHandler(e))
        })
      } else {
        axios.post(api.location.follow, { subscriberId: item.subscriberId }).then(async res => {
          if (res.status === 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('location.follow.success') })
            item.follow = 1
            /* 刷新右侧关注列表 */
            await this.queryFollowedList()
            // 刷新地图上的人
            this.humanMarkers.forEach(marker => {
              marker.remove && marker.remove()
            })
            this.humanMarkers = []
            const mapFollowedSubscriberData = await this.queryMapFollowedSubscriber()
            this.renderMarker(mapFollowedSubscriberData, this.tooltipType.human)
          } else {
            this.$message.error(res.data.message)
          }
        }).catch(e => {
          this.$message.error(this.errorMsgHandler(e))
        })
      }
    },
    clearSearchValue () {
    },
    visibleChange (state) {
      this.searchValueListShow = []
    },
    dropDownSearch (curVal) {
      //this.isLoadingMore = false
      this.curSearchValue = curVal
      this.curPageNum = 1
      this.searchValueListShow = []
      this.initDropdownList(curVal)
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

      const mapFollowedSubscriberData = await this.queryMapFollowedSubscriber()
      if (mapFollowedSubscriberData.length > 0) {
        this.renderMarker(mapFollowedSubscriberData, this.tooltipType.human)
      }
    }
  },
  watch: {
    async activeTab (n) {
      if (n === 'traceTracking') {
        // 切换到轨迹追踪tab时，先移除地图上已有的图层和事件绑定、人型图标。基站予以保留
        this.unbindHexagonEvents()
        this.mapChart.getLayer('hexagon') && this.mapChart.removeLayer('hexagon')
        this.mapChart.getSource('hexGrid') && this.mapChart.removeSource('hexGrid')
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
      this.debounceFunc?.()
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
    timeFilter (n) {
      if (this.activeTab === 'locationMap') {
        this.unbindHexagonEvents()
        this.mapChart.getLayer('hexagon') && this.mapChart.removeLayer('hexagon')
        this.mapChart.getSource('hexGrid') && this.mapChart.removeSource('hexGrid')
        this.humanMarkers.forEach(marker => {
          marker.remove && marker.remove()
        })
        this.humanMarkers = []
        this.initLocationMapTab()
      } else if (this.activeTab === 'traceTracking') {
        this.unbindTrackingHexagonEvents()
        this.mapChart.getLayer('trackingHexagon') && this.mapChart.removeLayer('trackingHexagon')
        this.mapChart.getLayer('trackingLine') && this.mapChart.removeLayer('trackingLine')
        this.mapChart.getSource('trackingHexGrid') && this.mapChart.removeSource('trackingHexGrid')
        this.mapChart.getSource('trackingLineSource') && this.mapChart.removeSource('trackingLineSource')
        this.trackingHumanMarker.remove && this.trackingHumanMarker.remove()
        this.trackingHumanMarker = {}
        this.initTraceTrackingTab()
      }
    },
    trackingSubscribers: {
      deep: true,
      handler (n) {
        console.info(n)
        sessionStorage.setItem(storageKey.trackingSubscribers, JSON.stringify(n.map(item => ({ subscriberId: item.subscriberId, subscriberDto: { phoneNumber: item.subscriberDto.phoneNumber } }))))
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
    }
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
  async mounted () {
    await this.initMap()
    this.debounceFunc = _.debounce(this.minuteTimeFilterChange, 500)
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
    const pieColorRamp = ['196,214,59', '190,230,255', '135,206,250', '63,133,186', '37,55,128']
    const pieValueRamp = ref([])
    const followedSubscribersList = ref([])
    const searchValueListShow = ref([])
    const boundaryBox = ref({}) // minLongitude、maxLongitude、minLatitude、maxLatitude
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

    // 从localStorage中获取数据
    const trackingSubscribers = ref([])
    sessionStorage.getItem(storageKey.trackingSubscribers) && (trackingSubscribers.value = JSON.parse(sessionStorage.getItem(storageKey.trackingSubscribers)).map(item => ({ ...item, show: false, showLine: false })))
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

      followSubscriberLoading: true, // 控制右侧关注用户列表加载状态
      pieLoading: true, // 控制饼图加载状态
      lineLoading: true, // 控制折线图加载状态
      searchLoading: false, // 搜索框加载状态
      trackingMapLoading: true // 控制追踪地图加载状态
    })
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
      followedSubscribersList, // Location关注用户列表
      boundaryBox, // 查六边形的范围，minLongitude、maxLongitude、minLatitude、maxLatitude
      mapChart, // 地图对象
      currentMarkerDom, // 记录当前鼠标悬停的marker的dom
      humanMarkers, // 储存人marker的引用
      baseStationMarkers, // 储存基站marker的引用
      trackingHumanMarker, // 追踪页的人marker
      pieChart, // 饼图对象
      pieOption,
      lineChart, // 折线图对象
      lineOption,
      currentBaseStation, // 鼠标当前悬浮的基站
      currentSubscriber, // 鼠标当前悬浮的Subscriber
      currentPolygon, // 鼠标当前悬浮的六边形
      trackingSubscribers, // 存放当前追踪的Subscriber列表
      currentShowSubscriber, // 当前在地图上展示轨迹的Subscriber TODO 从url获取
      loading, // 控制组件内各处loading图标
      maxZoom: 14, // 地图最小缩放比例
      minZoom: 3, // 地图最大缩放比例
      unitTypes,
      defaultZoom: 13, // 地图默认缩放比例
      center: [116.38, 39.9], // 地图默认中心点。北京：[116.38, 39.9] 纽约：[-73.94539, 40.841843]
      debounceFunc: shallowRef(null)
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
<style lang="scss">
.search-active {
  float: left;
  border-radius: 3px;
  width: 6px;
  height: 6px;
  margin-right: 10px;
  position:relative;
  top:50%;
  transform: translateY(-50%);
  text-align:center;
}
.search-value {
  float: left;
  margin-right:20px;
}
.search-follow__icon {
  float: right;
  color: #6f6f6e;
  font-size: 13px;
  width: 10px;
  height: 24px;
  margin-right: 10px;
  text-align: center;
  i {
    font-size: 8px !important;
    font-weight: bold;
  }
}
.active-icon {
  background: #38ACD2;
}
.inactive-icon {
  background: #CCCCCC;
}
.search-select {
  max-height: 150px;
}
.search-select .el-scrollbar__wrap{
  max-height: 150px;
  overflow-y:auto;
}
.geo-analysis {
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
  position: relative;

  .maplibregl-canvas:focus-visible {
    outline: none;
  }
  .geo-tools {
    position: absolute;
    display: flex;
    top: 11px;
    right: 20px;
    .el-select .el-input__inner {
      cursor: text;
    }
    .panel__time {
      display: flex;
    }
  }
  .el-tabs {
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-tabs__nav-wrap::after {
      height: 0;
    }
    .el-tabs__active-bar {
      height: 3px;
      background-color: #046eca;
    }
    .el-tabs__item {
      &.is-active {
        color: #046eca;
      }
      height: 50px;
      line-height: 50px;
      font-size: 20px;
      color: #353636;
    }
  }

  .geo-analysis__container {
    height: calc(100% - 50px);
    display: flex;
    position: relative;

    .analysis-map {
      flex: 1;
      position: relative;

      #analysisMap {
        border-radius: 2px;
        height: 100%;
        width: 100%;
      }
      .maplibregl-ctrl-bottom-right {
        top: 0;
        left: 0;
        bottom: unset;
        right: unset;
      }
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
        }

        &.map-marker--human {
          background-color: #233447;

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

          &.map-marker--human svg {
            width: 21px;
            height: 21px;
          }
          &.map-marker--base-station svg {
            width: 18px;
            height: 18px;
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
    }
    .map-time-line {
      position: absolute;
      bottom: 0;
      left: -6px;
      width: calc(100% - 318px);
    }
    .analysis-statistics {
      width: 330px;
      overflow-y: auto;
      padding-right: 5px;

      .analysis-statistics__chart {
        margin: 0 0 10px 20px;
        height: 148px;
        background: rgba(113,113,113,0.06);
        border: 1px solid rgba(226,229,236,1);
        border-radius: 4px;
        position: relative;

        .chart__header {
          padding: 8px 0 0 10px;
          color: #353636;
          font-size: 16px;
        }
        .chart__body {
          display:flex;
          flex-direction:row;
          width:100%;
          height:calc(100% - 32px);
          .chart__legend {
            width:calc(60% - 22px);
            height: 100%;
            display:flex;
            flex-direction:column;
            justify-content: center;
            .legend-item {
              display:flex;
              flex-direction:row;
              justify-content: left;
              align-items: center;
              padding-top:2px;
              padding-bottom:2px;
              .legend-icon {
                width:16px;
                height:6px;
                border-radius: 2px;
                margin-right:10px;
              }
              .legend-range {
                margin-right:40px;
                width:54px;
                font-family: Helvetica;
                font-size: 12px;
                color: #575757;
                line-height: 12px;
                font-weight: 400;
              }
              .legend-count {
                font-family: Helvetica;
                font-size: 12px;
                color: #353636;
                line-height: 12px;
                font-weight: 400;
              }
            }
          }
        }
        .chart__statistics {
          display: flex;
          height: 20px;
          padding-left: 10px;

          .statistics-number {
            margin-right: 8px;
            color: #353636;
            font-size: 16px;
            line-height: 22px;
          }
          .statistics-trend {
            padding: 0 10px;
            background: #7E9F54;
            border-radius: 10px;
            text-align: center;
            font-size: 12px;
            color: white;
          }
        }
        .chart__drawing {
          height: 100%;
          width:calc(40% + 12px);
          margin-right:10px;
        }
        .chart-line__drawing {
          height: calc(100% - 32px);
        }
        #activeSubscribersChart {
          height: calc(100% - 52px);
        }
      }
      .analysis-statistics__title {
        margin-bottom: 10px;
        padding-left: 20px;
        font-size: 16px;
        color: #353636;
      }
      .analysis-statistics__no-tracking-tip {
        padding: 0 20px;
        cursor: pointer;
        color: #046eca;
        text-decoration: underline;
      }
      .analysis-statistics__subscribers {
        padding-left: 20px;

        .analysis-statistics__subscriber {
          margin-bottom: 10px;

          &:last-of-type {
            margin-bottom: 0;
          }
          &.analysis-statistics__subscriber--active {
            border: 1px solid rgba(0,0,0,0.2);
            box-shadow: 0 1px 5px 0 rgba(0,0,0,0.5);
          }

          background-color: #F7F7F7;
          border: 1px solid rgb(226,229,236);
          border-radius: 2px;

          .subscriber__header {
            background-color: #38ACD2;

            &.subscriber__header-inactive {
              background-color: #CCCCCC;
            }
          }

          .subscriber__header {
            position: relative;
            flex-direction: column;
            padding: 6px 0 0 70px;
            color: white;
            height: 58px;

            .header__icon {
              position: absolute;
              left: 20px;
              top: 14px;

              .icon__box {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 30px;
                width: 30px;
                background-color: #233447;
                border-radius: 50%;
              }
            }
            .header__right {
              display:flex;
              flex-direction: row;
              justify-content: space-between;
              .header-msisdn {
                display:flex;
                flex-direction: column;
                .header__title {
                  font-size: 16px;
                }
                .header__content {
                  font-size: 14px;
                }
              }
              .header__operation {
                display:flex;
                flex-direction: row;
                align-items: center;

                .trajectory-text {
                  margin-right:12px;
                  font-family: Helvetica-Bold;
                  font-size: 12px;
                  color: #233447;
                  font-weight: 700;
                  cursor: pointer;

                  i {
                    font-size: 12px !important;
                    font-weight: bolder;
                    margin-right:3px;
                    color: #233447;
                  }
                }
                .cancel-follow {
                  margin-right:14px;
                  i {
                    cursor: pointer;
                    font-size:8px;
                  }
                }
              }
            }
          }
          .subscriber__body {
            padding: 10px 18px;
            .body__item {
              display: flex;

              .item__label {
                padding-right: 10px;
                text-align: right;
                width: 60px;
                font-size: 12px;
                color: #353636;
              }
              .item__value {
                font-size: 12px;
                font-weight: bold;
                color: #233447;
              }
            }

            .body-item-record {
              margin-top: 10px;

              .item-record__header {
                font-family: Helvetica;
                font-size: 16px;
                color: #353636;
                font-weight: 400;
                height: 38px;
                line-height: 38px;
              }
              .item-record__info {

              }
              .item-record__timeline {
                margin-left: 6px;

                .el-timeline {
                  padding-left: 0;
                  max-height: 300px;
                  overflow: auto;

                  &.el-timeline--hide {
                  }

                  .el-timeline-item {
                    padding-bottom: 4px;
                    .el-timeline-item__tail {
                      border-left: 2px dotted #cccccc;
                      margin-left: 2px;
                    }
                    .el-timeline-item__node--normal {
                      background-image: radial-gradient(#DE3434 20%, transparent);
                      outline: #F7F7F7 solid 6px;
                      margin-left: 2px;
                    }
                  }
                  .el-timeline-item:last-child {
                    padding-bottom: 0;
                  }
                }
                .timeline__info {
                  display: flex;
                  padding-bottom: 13px;

                  .timeline__info--circle {
                    display: flex;
                    flex-direction: column;
                    .info__circle {
                      width: 17px;
                      height: 17px;
                      margin-left: -2px;
                      border-radius: 50%;
                      background-image: radial-gradient(#DE3434 20%, transparent);
                      outline: rgba(222,52,52,0.30) solid 4px;
                      margin-top: 2px;
                    }
                    .info__line {
                      border-left: 2px #cccccc dotted;
                      height: 34px;
                      margin-left: 6px;
                      transition: all 0.2s;
                    }
                  }
                  .timeline__info--item {
                    padding-left: 13px;
                    display: flex;
                    flex-direction: column;
                    font-size: 12px;
                    color: #666666;

                    .info--item__value {
                      color: #333;
                      font-weight: 500;
                      margin-left: 4px;
                    }
                  }
                }
                .timeline__item {
                  display: flex;
                  flex-direction: column;
                  font-size: 12px;
                  color: #666666;

                  .item__value {
                    color: #333;
                    font-weight: 500;
                    margin-left: 4px;
                  }
                }
                .item-record__btn {
                  padding-right: 6px;
                  cursor: pointer;
                  text-align: center;
                }
              }
            }
          }
        }
      }
    }
  }

  .geo-analysis__hexagon-tooltip {
    position: fixed;
    background-color: rgba(255,255,255,0.80);
    box-shadow: 0 1px 10px 0 rgba(0,0,0,0.5);
    border-radius: 2px;
    min-width: 185px;

    /*&.geo-analysis__hexagon-tooltip--hexagon {
    }*/
    &.geo-analysis__hexagon-tooltip--human {
      .icon__box {
        background-color: #233447;
      }
    }
    &.geo-analysis__hexagon-tooltip--base-station {
      .icon__box {
        background-color: #585B5F;
      }
      .hexagon-tooltip__body {
        .body__item .item__label {
          width: 140px;
        }
      }
    }
    .hexagon-tooltip__header {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 10px 0 10px 63px;
      color: white;

      .header__icon {
        position: absolute;
        left: 14px;
        top: 16px;

        .icon__box {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          width: 32px;
          border-radius: 50%;
        }
      }
      .header__title {
        font-size: 16px;
      }
      .header__content {
        font-size: 14px;
      }
    }
    .hexagon-tooltip__body {
      padding: 8px 18px;
      max-height: 230px;
      overflow: auto;

      .body__timeline {
        display: flex;
        flex-direction: row;
        padding: 3px 0;

        .timeline-symbol {
          margin-top: 6px;
          margin-right: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #DE3434;
        }
      }
      .body__item {
        display: flex;

        .item__label {
          padding-right: 10px;
          text-align: right;
          width: 60px;
          font-size: 12px;
          color: #353636;
        }
        .item__value {
          font-size: 12px;
          font-weight: bold;
          color: #233447;
        }
      }
      .body__tracking {
        padding-top: 6px;
        font-size: 12px;
        color: #38ACD2;
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
@keyframes pulse {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
