<template>
  <div class="entity-list">
    <div class="entity__loading" v-show="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div class="entity-list__content">
      <div class="cn-entity" v-for="(d, i) in entityList" :key="i">
        <div class="cn-entity__header">
          <div class="header__content" :title="d.ip||d.domainName||d.appName">
            <div class="header__icon"><i :class="iconClass"></i></div>
            <template v-if="from === 'ip'">
              <div class="content__name"  style="top:31px;">
                {{d.ip || 'Unknown'}}
              </div>
            </template>
            <template v-else-if="from === 'domain'">
              <div class="content__name" >
                {{d.domainName || 'Unknown'}}
              </div>
              <div class="content__desc" >
                <span class="desc__label">{{$t('entities.reputationLevel')}}:&nbsp;</span>
                <span>{{d.reputationLevel || '-'}}</span>
              </div>
            </template>
            <template v-else-if="from === 'app'">
              <div class="content__name" >
                {{d.appName || 'Unknown'}}
              </div>
              <div class="content__desc" >
                <span class="desc__label">{{$t('entities.risk')}}:&nbsp;</span>
                <span>{{d.appRisk || '-'}}</span>
              </div>
            </template>
          </div>
          <div class="header__bottom__line"></div>
        </div>
        <div class="cn-entity__body">
          <template v-if="from === 'ip'">
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-country" ></i>{{$t('overall.country')}}：</span>
              <div class="body__row-value" :title="d.country">{{d.country || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-position"></i>{{$t('overall.region')}}：</span>
              <div class="body__row-value" :title="d.region">{{d.region || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-cloud"></i>{{$t('entities.asn')}}：</span>
              <div class="body__row-value" :title="d.asn">{{d.asn || '-'}}</div>
            </div>
            <!-- 曲线-->
            <div class="body__drawing-box">
              <div class="body__drawing" :id="`entityListChart${d.id}`"></div>
            </div>
            <div class="body__statics">
              <div class="entity-statics-down"><i class="cn-icon cn-icon-fall entity-statics-icon" style=""></i>{{d.latestReceived || 0}} bps</div>
              <div class="entity-statics-up" ><i class="cn-icon cn-icon-rise" style=""></i>{{d.latestSent || 0}} bps</div>
              <div class="body__detail" @click="entityDetail({ip: d.ip, type: 4})">{{$t('overall.detail')}}></div>
            </div>
          </template>
          <template v-else-if="from === 'domain'">
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-category"></i>{{$t('entities.Group')}}：</span>
              <div class="body__row-value" :title="d.categoryGroup">{{d.categoryGroup || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-sub-category"></i>{{$t('entities.categoryName')}}：</span>
              <div class="body__row-value" :title="d.categoryName">{{d.categoryName || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-credit"></i>{{$t('entities.credit')}}：</span>
              <div class="body__row-value" :title="d.reputationScore">{{d.reputationScore || '-'}}</div>
            </div>
            <!-- 曲线-->
            <div class="body__drawing-box">
              <div class="body__drawing" :id="`entityListChart${d.id}`"></div>
            </div>
            <div class="body__statics">
              <div class="entity-statics-down" style=" "><i class="cn-icon cn-icon-fall entity-statics-icon" style=""></i>{{d.latestReceived || 0}} bps</div>
              <div class="entity-statics-up" ><i class="cn-icon cn-icon-rise" style=""></i>{{d.latestSent || 0}} bps</div>
              <div class="body__detail" @click="entityDetail({domain: d.domainName, type: 5})">{{$t('overall.detail')}}></div>
            </div>
          </template>
          <template v-else-if="from === 'app'">
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-id"></i>APP：</span>
              <div class="body__row-value" :title="d.appId">{{d.appId || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-category"></i>{{$t('entities.category')}}：</span>
              <div class="body__row-value" :title="d.appCategory">{{d.appCategory || '-'}}</div>
            </div>
            <div class="body__row">
              <span class="body__row-label"><i class="cn-icon cn-icon-sub-category"></i>{{$t('entities.subcategory')}}：</span>
              <div class="body__row-value" :title="d.appSubategory">{{d.appSubategory || '-'}}</div>
            </div>
            <!-- 曲线-->
            <div class="body__drawing-box">
              <div class="body__drawing" :id="`entityListChart${d.id}`"></div>
            </div>
            <div class="body__statics">
              <div class="entity-statics-down" style=" "><i class="cn-icon cn-icon-fall entity-statics-icon" style=""></i>{{d.latestReceived || 0}} bps</div>
              <div class="entity-statics-up" ><i class="cn-icon cn-icon-rise" style=""></i>{{d.latestSent || 0}} bps</div>
              <div class="body__detail" @click="entityDetail({app: d.appName, type: 6})">{{$t('overall.detail')}}></div>
            </div>
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
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import * as echarts from 'echarts'
import { getChartColor, entityListLineOption } from '@/components/charts/chart-options'
import { legendMapping } from '@/components/charts/chart-table-title'
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'

export default {
  name: 'EntityList',
  props: {
    listData: Array,
    from: String,
    pageObj: Object,
    loading: Boolean
  },
  data () {
    return {
      showDetail: false,
      typeName: '',
      entityList: []
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
  },
  setup () {
    return {
      chartOption: entityListLineOption
    }
  },
  watch: {
    listData: {
      deep: true,
      immediate: true,
      handler (n, o) {
        if (!this.$_.isEmpty(n) && !this.$_.isEqual(n, o)) {
          this.entityList = []
          setTimeout(() => {
            const now = new Date()
            const queryParams = { startTime: Math.floor(now.getTime() / 1000 - 3600), endTime: Math.floor(now.getTime() / 1000) }
            switch (this.from) {
              case ('ip'): {
                n.forEach(data => {
                  const entity = { ...data }
                  let chartOption
                  get(api.ipThroughput, { ...queryParams, ip: entity.ip }).then(response => {
                    if (response.code === 200) {
                      const seriesTemplate = this.chartOption.series[0]
                      const series = response.data.result.filter(r => r.legend !== 'bytes_rate').map((r, i) => {
                        if (r.legend === 'bytes_sent_rate') {
                          entity.latestSent = unitConvert(r.values[r.values.length - 1][1], unitTypes.byte)[0]
                        } else if (r.legend === 'bytes_received_rate') {
                          entity.latestReceived = unitConvert(r.values[r.values.length - 1][1], unitTypes.byte)[0]
                        }
                        return {
                          ...seriesTemplate,
                          name: legendMapping[`ip_${r.legend}`],
                          data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
                          itemStyle: {
                            normal: {
                              color: getChartColor(i),
                              lineStyle: {
                                width: 2
                              }
                            }
                          }
                        }
                      })
                      chartOption = {
                        ...this.chartOption,
                        series
                      }
                    }
                  }).finally(() => {
                    this.entityList.push(entity)
                    this.$nextTick(() => {
                      const myChart = echarts.init(document.getElementById(`entityListChart${entity.id}`))
                      myChart.setOption(chartOption)
                    })
                  })
                })
                break
              }
              case ('domain'): {
                n.forEach(data => {
                  const entity = { ...data }
                  let chartOption
                  get(api.domainThroughput, { ...queryParams, domain: entity.domainName }).then(response => {
                    if (response.code === 200) {
                      const seriesTemplate = this.chartOption.series[0]
                      const series = response.data.result.filter(r => r.legend !== 'bytes_rate').map((r, i) => {
                        if (r.legend === 'bytes_sent_rate') {
                          entity.latestSent = unitConvert(r.values[r.values.length - 1][1], unitTypes.byte)[0]
                        } else if (r.legend === 'bytes_received_rate') {
                          entity.latestReceived = unitConvert(r.values[r.values.length - 1][1], unitTypes.byte)[0]
                        }
                        return {
                          ...seriesTemplate,
                          name: legendMapping[r.legend],
                          data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
                          itemStyle: {
                            normal: {
                              color: getChartColor(i),
                              lineStyle: {
                                width: 2
                              }
                            }
                          }
                        }
                      })
                      chartOption = {
                        ...this.chartOption,
                        series
                      }
                    }
                  }).finally(() => {
                    this.entityList.push(entity)
                    this.$nextTick(() => {
                      const myChart = echarts.init(document.getElementById(`entityListChart${entity.id}`))
                      myChart.setOption(chartOption)
                    })
                  })
                })
                break
              }
              case ('app'): {
                n.forEach(data => {
                  const entity = { ...data }
                  let chartOption
                  get(api.appThroughput, { ...queryParams, app: entity.appName }).then(response => {
                    if (response.code === 200) {
                      const seriesTemplate = this.chartOption.series[0]
                      const series = response.data.result.filter(r => r.legend !== 'bytes_rate').map((r, i) => {
                        if (r.legend === 'bytes_sent_rate') {
                          entity.latestSent = unitConvert(r.values[r.values.length - 1][1], unitTypes.byte)[0]
                        } else if (r.legend === 'bytes_received_rate') {
                          entity.latestReceived = unitConvert(r.values[r.values.length - 1][1], unitTypes.byte)[0]
                        }
                        return {
                          ...seriesTemplate,
                          name: legendMapping[r.legend],
                          data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), unitTypes.byte]),
                          itemStyle: {
                            normal: {
                              color: getChartColor(i),
                              lineStyle: {
                                width: 2
                              }
                            }
                          }
                        }
                      })
                      chartOption = {
                        ...this.chartOption,
                        series
                      }
                    }
                  }).finally(() => {
                    this.entityList.push(entity)
                    this.$nextTick(() => {
                      const myChart = echarts.init(document.getElementById(`entityListChart${entity.id}`))
                      myChart.setOption(chartOption)
                    })
                  })
                })
                break
              }
              default: break
            }
          }, 1000)
        }
      }
    }
  }
}
</script>
