<template>
  <div
      class="entity-explorer"
      :class="{'entity-explorer--show-list': showList}">
    <!-- 顶部工具栏，在列表页显示 -->
    <div class="explorer-top-tools" v-show="showList">
      <DateTimeRange class="date-time-range" :start-time="timeFilter.startTime" :end-time="timeFilter.endTime" ref="dateTimeRange" @change="reload"/>
      <TimeRefresh class="date-time-range" @change="timeRefreshChange" :end-time="timeFilter.endTime"/>
      <el-button-group size="mini">
        <el-button size="mini" @click="listMode = 'list'" :class="{'active': listMode === 'list'}"><i class="cn-icon cn-icon-list"></i></el-button>
        <el-button size="mini" @click="listMode = 'block'" :class="{'active': listMode === 'block'}"><i class="cn-icon cn-icon-blocks"></i></el-button>
      </el-button-group>
    </div>
    <!-- 搜索组件 -->
    <explorer-search
        :class="{'explorer-search--show-list': showList}"
        :show-list="showList"
        @search="search"
    ></explorer-search>
    <!-- 内容区 -->
    <div class="explorer-container" v-if="showList">
      <entity-filter
        :filter-data="filterData"
      ></entity-filter>
      <entity-list
        :list-data="listData"
        :list-mode="listMode"
      ></entity-list>
    </div>
    <div class="explorer-foot" v-else>
      <div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span>86</span>
            <span>APP</span>
          </div>
          <div class="overview-right">
            <div class="right-row">
              <i class="cn-icon cn-icon-increase"></i>
              <div class="right-label">New</div>
              <div class="right-value">51</div>
            </div>
            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">Active</div>
              <div class="right-value">56</div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span>186</span>
            <span>DOMAIN</span>
          </div>
          <div class="overview-right">
            <div class="right-row">
              <i class="cn-icon cn-icon-increase"></i>
              <div class="right-label">New</div>
              <div class="right-value">40</div>
            </div>
            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">Active</div>
              <div class="right-value">18</div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="entity-overview">
          <div class="overview-left">
            <span>861</span>
            <span>IP</span>
          </div>
          <div class="overview-right">
            <div class="right-row">
              <i class="cn-icon cn-icon-increase"></i>
              <div class="right-label">New</div>
              <div class="right-value">99</div>
            </div>
            <div class="right-row">
              <i class="cn-icon cn-icon-active"></i>
              <div class="right-label">Active</div>
              <div class="right-value">37</div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
      </div>
    </div>
  </div>
</template>

<script>
import ExplorerSearch from '@/views/entityExplorer/search/ExplorerSearch'
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'
import TimeRefresh from '@/components/common/TimeRange/TimeRefresh'
import EntityFilter from '@/views/entityExplorer/EntityFilter'
import EntityList from '@/views/entityExplorer/entityList/EntityList'
import { entityType, entityFilterType } from '@/utils/constants'

export default {
  name: 'entity-explorer',
  components: {
    ExplorerSearch,
    DateTimeRange,
    TimeRefresh,
    EntityFilter,
    EntityList
  },
  data () {
    return {
      showList: false,
      listMode: 'block', // entity列表的模式，list|block
      timeFilter: {},

      filterData: [
        {
          type: 'ip',
          title: entityType.ip,
          data: [
            {
              label: this.$t('overall.country'),
              column: 'country_distinct_count',
              icon: entityFilterType.ip[0].icon,
              value: 15
            },
            {
              label: this.$t('overall.province'),
              column: 'province_distinct_count',
              icon: entityFilterType.ip[1].icon,
              value: 201
            },
            {
              label: this.$t('overall.city'),
              column: 'city_distinct_count',
              icon: entityFilterType.ip[2].icon,
              value: 1052
            },
            {
              label: this.$t('entities.asn'),
              column: 'asn_distinct_count',
              icon: entityFilterType.ip[3].icon,
              value: 76
            }
          ]
        },
        {
          type: 'app',
          title: entityType.app,
          data: [
            {
              label: this.$t('entities.category'),
              column: 'category_distinct_count',
              icon: entityFilterType.app[0].icon,
              value: 15
            },
            {
              label: this.$t('entities.subcategory'),
              column: 'subcategory_distinct_count',
              icon: entityFilterType.app[1].icon,
              value: 201
            },
            {
              label: this.$t('entities.risk'),
              column: 'risk_distinct_count',
              icon: entityFilterType.app[2].icon,
              value: 1052
            }
          ]
        },
        {
          type: 'domain',
          title: entityType.domain,
          data: [
            {
              label: this.$t('entities.domainDetail.categoryGroup'),
              column: 'category_group_distinct_count',
              icon: entityFilterType.domain[0].icon,
              value: 31
            },
            {
              label: this.$t('entities.category'),
              column: 'category_distinct_count',
              icon: entityFilterType.domain[1].icon,
              value: 82
            },
            {
              label: this.$t('entities.reputationLevel'),
              column: 'reputation_level_distinct_count',
              icon: entityFilterType.domain[2].icon,
              value: 8
            }
          ]
        }
      ],
      listData: JSON.parse(`[
        {
          "entityType": "app",
          "appName": "360cn",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "suning",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "dianping",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "youku",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "qqmusic",
          "appCategory": "media",
          "appId": "",
          "appRisk": "3",
          "appSubcategory": "multimedia-streaming"
        },
        {
          "entityType": "app",
          "appName": "meituan",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "sohu",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "mqtt",
          "appCategory": "networking",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "remote-access"
        },
        {
          "entityType": "app",
          "appName": "adjust",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "tiktok",
          "appCategory": "media",
          "appId": "",
          "appRisk": "2",
          "appSubcategory": "photo-video"
        },
        {
          "entityType": "app",
          "appName": "4399com",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "ixigua",
          "appCategory": "media",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "Multimedia-streaming"
        },
        {
          "entityType": "app",
          "appName": "oicq",
          "appCategory": "collaboration",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "instant-messaging"
        },
        {
          "entityType": "app",
          "appName": "digicert",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "rdp",
          "appCategory": "networking",
          "appId": "",
          "appRisk": "4",
          "appSubcategory": "remote-access"
        },
        {
          "entityType": "app",
          "appName": "163com",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "meitu",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "gitv_tv",
          "appCategory": "media",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "Multimedia-streaming"
        },
        {
          "entityType": "app",
          "appName": "tencent",
          "appCategory": "general-internet",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "internet-utility"
        },
        {
          "entityType": "app",
          "appName": "thunder",
          "appCategory": "networking",
          "appId": "",
          "appRisk": "1",
          "appSubcategory": "infrastructure"
        }
      ]`)
    }
  },
  methods: {
    timeRefreshChange () {

    },
    reload () {

    },
    search (param) {
      if (!this.showList) {
        this.showList = true
      }
      // 带参数时，只查询对应类型的entity；不带参数时，3种entity都查
      if (param) {
        return '1'
      } else {
        return ''
      }
    },
    queryFilter () {

    },
    queryList () {

    }
  }
}
</script>
