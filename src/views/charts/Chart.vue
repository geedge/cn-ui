<template>
  <!-- 标题 -->
  <div
    v-if="isTitle"
    class="cn-chart cn-chart__title"
    :style="computePosition">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</div>
  <!-- Tabs -->
  <el-tabs
      class="cn-chart cn-chart__tabs"
      v-else-if="isTabs"
      v-model="activeTab"
      @tab-click="changeTab"
      :style="computePosition"
      :ref="`chart-${chart.id}`"
  >
    <el-tab-pane
      v-for="tab in chartInfo.children"
      :label="tab.i18n ? $t(tab.i18n) : tab.name" :name="`${tab.id}`"
      :key="tab.id"
      :ref="`chart-${chart.id}`"
    >
      <template v-for="chart in tab.children">
        <chart
            v-if="activeTab == tab.id"
            :key="Chart.id"
            :chart="Chart"
            :time-filter="timeFilter"
            :ref="`chart-${Chart.id}`"
            :entity="entity"
            @getCurrentTimeRange="getCurrentTimeRange"
        ></chart>
      </template>
    </el-tab-pane>
  </el-tabs>
  <!-- 地图 -->
  <chart-map
      v-else-if="isMap"
      :style="computePosition"
      :loading="loading"
      :hide-header="hideHeader"
  >
    <template #chartErrorInfo>
      <chart-error
        :isError="isError"
        :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations>
      <span class="header__operation-btn" v-show="showMapBackButton" @click="mapBack"><i class="cn-icon el-icon-back"></i></span>
      <el-popover trigger="hover" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
        <template #reference>
          <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
        </template>
      </el-popover>
      <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
    </template>
    <template #default>
      <template v-if="isIpBasicInfo">
        <el-descriptions :column="1">
          <el-descriptions-item label="ASN:">{{detailData.asn || '-'}}</el-descriptions-item>
          <el-descriptions-item label="AS Org:">{{detailData.asOrganization || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('entities.asSubnet') + ':'">{{detailData.asSubnet || '-'}}</el-descriptions-item>
          <el-descriptions-item label="ISP:">{{detailData.isp || '-'}}</el-descriptions-item>
          <el-descriptions-item label="DNS PTR:">{{detailData.dnsPtr || '-'}}</el-descriptions-item>
        </el-descriptions>
        <div class="chart-location">
          <el-descriptions :column="1">
            <el-descriptions-item :label="$t('overall.location') + ':'">{{location}}</el-descriptions-item>
          </el-descriptions>
          <div class="chart-drawing" style="padding: 0 36px 30px 0;" :id="`chart${chartInfo.id}`"></div>
        </div>
      </template>
      <template v-else>
        <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
      </template>
    </template>
  </chart-map>
  <!-- echarts类的图，如饼图、柱状图、折线图等 -->
  <echarts-frame
    v-else-if="isEcharts"
    :layout="layout"
    :style="computePosition"
    :chartInfo="chartInfo"
    :loading="loading"
    :no-data="noData"
  >
    <template #chartErrorInfo>
      <chart-error
        :isError="isError"
        :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title v-if="layout.indexOf(layoutConstant.HEADER) > -1"  >
      {{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}
    </template>
    <template #operations v-if="layout.indexOf(layoutConstant.HEADER) > -1">
      <div class="header__operation header__operation--echarts" v-if="chart.type === 31">
        <el-select
          size="mini"
          v-model="orderPieTable"
          class="option__select select-column"
          placeholder=""
          popper-class="option-popper is-light"
          @change="orderPieTableChange"
        >
          <el-option v-for="item in chartPieTableTopOptions" :key="item.value" :value="item.value">&nbsp{{item.name}}</el-option>
        </el-select>
      </div>
      <el-popover trigger="hover" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
        <template #reference>
          <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
        </template>
      </el-popover>
      <span class="header__operation-btn" @click="refresh" ><i class="cn-icon cn-icon-refresh"></i></span>
    </template>
    <template #default>
      <!-- IP详情 开放端口 -->
      <template v-if="isIpOpenPort">
        <div class="ip-detail__open-port">
          <div class="open-port__table">
            <div style="height: 100%; overflow: hidden auto;">
              <div class="open-port__table-row open-port__table-row--header">
                <div class="open-port__table-cell" style="min-width: 100px;">Port</div>
                <div class="open-port__table-cell" style="min-width: 130px;">{{$t('overall.protocol')}}</div>
                <div class="open-port__table-cell">Banner</div>
                <div class="open-port__table-cell" style="min-width: 200px;">Update at</div>
              </div>
              <div class="open-port__table-row" v-for="(data, index) in detailData" :key="index">
                <div class="open-port__table-cell">{{data.port || '-'}}</div>
                <div class="open-port__table-cell">{{data.protocol || '-'}}</div>
                <div class="open-port__table-cell">{{data.banner || '-'}}</div>
                <div class="open-port__table-cell">{{data.utime || '-'}}</div>
              </div>
            </div>
          </div>
          <div class="open-port__chart">
            <div class="open-port__chart-title">{{$t('overall.protocolsStatistics')}}</div>
            <div class="open-port__chart-body chart-drawing" :id="`chart${chartInfo.id}`"></div>
          </div>
        </div>
      </template>
      <!-- IP详情 托管域名 -->
      <template v-else-if="isIpHostedDomain">
        <div class="ip-detail__hosted-domain">
          <div class="hosted-domain__list">
            <div class="hosted-domain__list-title">{{$t('overall.domain')}}</div>
            <div class="hosted-domain__list-body">
              <div class="hosted-domain__list-row" v-for="(data, i) in detailData" :key="i">{{data}}</div>
            </div>
          </div>
          <div class="hosted-domain__chart">
            <div>
              <div class="hosted-domain__chart-title">{{$t('entities.byCategory')}}</div>
              <div class="chart-drawing" :id="`chart${chartInfo.id}-0`"></div>
            </div>
            <div>
              <div class="hosted-domain__chart-title">{{$t('entities.byCredit')}}</div>
              <div class="chart-drawing" :id="`chart${chartInfo.id}-1`"></div>
            </div>
          </div>
        </div>
      </template>
      <!-- APP详情 关联域名 -->
      <template v-else-if="isAppRelatedDomain">
        <div class="app-detail__related-domain">
          <div class="related-domain__list">
            <div class="related-domain__list-title">{{$t('overall.domain')}}</div>
            <div class="related-domain__list-body">
              <div class="related-domain__list-row" v-for="(data, i) in detailData" :key="i"><i class="cn-icon cn-icon-domain"></i>&nbsp;{{data}}</div>
            </div>
          </div>
          <div class="related-domain__chart">
            <div>
              <div class="related-domain__chart-title">{{$t('entities.byCategory')}}</div>
              <div class="chart-drawing" :id="`chart${chartInfo.id}-0`"></div>
            </div>
            <div>
              <div class="related-domain__chart-title">{{$t('entities.byCredit')}}</div>
              <div class="chart-drawing" :id="`chart${chartInfo.id}-1`"></div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="isSankey">
        <div class="sankey-box">
          <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
          <div class="sankey__label" style="left: 5%;">{{$t('entities.inboundLinkId')}}</div>
          <div class="sankey__label" style="left: 50%;">{{entity.ip || entity.domain || entity.app}}</div>
          <div class="sankey__label" style="right: 5%; transform: translateX(50%)">{{$t('entities.outboundLinkId')}}</div>
        </div>
      </template>
      <div v-else class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
    <template #footer v-if="layout.indexOf(layoutConstant.FOOTER) > -1">
      <!-- 带Table的饼图，展示Table -->
      <template v-if="isEchartsWithTable">
        <pie-table :tableData="pieTableData" ref="pieTable" :chartInfo="chartInfo" :time-filter="timeFilter" :order="orderPieTable"/>
      </template>
      <template v-else-if="isEchartsWithStatistics">
        <statistics-legend :data="statisticsData" :chart-info="chartInfo" @toggleLegend="toggleStatisticsLegend"></statistics-legend>
      </template>
    </template>
  </echarts-frame>
  <!-- 单值图 -->
  <single-value
    v-else-if="isSingleValue"
    :type="chartInfo.type"
    :style="computePosition"
    :icon="singleValue.icon"
    :color="singleValue.color"
    :loading="loading"
  >
    <template #chartErrorInfo>
      <chart-error
        :isError="isError"
        :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title>
      <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      <span
          v-if="chartInfo.params && chartInfo.params.as"
          class="ip-detail-as"
      >
          as&nbsp;<span style="text-transform: capitalize">{{chartInfo.params.as}}</span>
        </span>
    </template>
    <template #data>
      <span>{{handleSingleValue[0] || handleSingleValue[0] === 0 ? handleSingleValue[0] : '-'}}</span>
      <span class="single-value__unit">{{handleSingleValue[1]}}</span>
    </template>
    <template #chart>
      <div class="chart-drawing" :id="`chart${chartInfo.id}`"></div>
    </template>
  </single-value>
  <!-- 表格：Cryptocurrency活跃IP -->
  <chart-table-active-ip
          v-else-if="isActiveIpTable"
          :table-data="activeIpTable.tableData"
          :style="computePosition"
          :loading="loading"
          :no-data="noData"
  >
    <template #chartErrorInfo>
      <chart-error
              :isError="isError"
              :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations>
      <el-popover trigger="hover" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
        <template #reference>
          <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
        </template>
      </el-popover>
      <div class="header__operation header__operation--table">
        <el-select
                size="mini"
                v-model="activeIpTable.orderBy"
                class="option__select select-column"
                :placeholder="$t('overall.field')"
                popper-class="option-popper"
                @change="activeIpTableLimitChange"
        >
          <template v-for="item in chartActiveIpTableOrderOptions" :key="item">
            <el-option :value="item">{{item}}</el-option>
          </template>
        </el-select>
      </div>
      <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
    </template>
  </chart-table-active-ip>
  <!-- 表格 -->
  <chart-table
    v-else-if="isTable"
    :table-columns="table.tableColumns"
    :table-data="table.currentPageData"
    :style="computePosition"
    :loading="loading"
    :no-data="noData"
  >
    <template #chartErrorInfo>
      <chart-error
        :isError="isError"
        :errorInfo="errorInfo"
      >
      </chart-error>
    </template>
    <template #title>{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</template>
    <template #operations>
      <el-popover trigger="hover" placement="top" :content="chartInfo.remark" v-if="chartInfo.remark">
        <template #reference>
          <span class="header__operation-btn"><i class="cn-icon el-icon-info"></i></span>
        </template>
      </el-popover>
      <div class="header__operation header__operation--table">
        <el-select
            size="mini"
            v-model="table.limit"
            class="option__select select-topn"
            placeholder=""
            popper-class="option-popper"
            @change="tableLimitChange"
        >
          <el-option v-for="item in chartTableTopOptions" :key="item" :value="item">TOP&nbsp;{{item}}</el-option>
          <template #prefix>TOP&nbsp;</template>
        </el-select>
      </div>
      <div class="header__operation header__operation--table">
        <el-select
            size="mini"
            v-model="table.orderBy"
            class="option__select select-column"
            :placeholder="$t('overall.field')"
            popper-class="option-popper"
            @change="tableLimitChange"
        >
          <template v-for="(item, index) in table.tableColumns" :key="item.prop">
            <el-option v-if="index > 0" :value="item.prop">{{item.prop}}</el-option>
          </template>
        </el-select>
      </div>
      <span class="header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
<!--      <div class="header__operation header__operation&#45;&#45;table">
        <span class="option__button"><i class="cn-icon cn-icon-style"></i></span>
        <div class="icon-group-divide"></div>
        <span class="option__button"><i class="cn-icon cn-icon-dropdown"></i></span>
      </div>
      <div class="header__operation header__operation--table">
        <span class="option__button"><i class="cn-icon cn-icon-full-screen"></i></span>
      </div>-->
    </template>
    <template #footer>
      <chart-table-pagination
          ref="tablePagination"
          :total="table.tableData.length"
          @pageJump="pageJump"
      ></chart-table-pagination>
    </template>
  </chart-table>
  <!-- group -->
  <div
      v-else-if="isGroup"
      class="cn-chart cn-chart__group"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
        <span
            v-if="chartInfo.params && chartInfo.params.as"
            class="ip-detail-as"
        >
          as&nbsp;<span style="text-transform: capitalize">{{chartInfo.params.as}}</span>
        </span>
      </div>
    </div>
    <div class="cn-chart__body">
      <template v-for="chart in chartInfo.children" :key="Chart.id">
        <chart
            :chart="Chart"
            :time-filter="timeFilter"
            :ref="`chart-${Chart.id}`"
            :entity="entity"
            :parent-data="groupData"
            :from-block="fromBlock"
            @getChartCurrentTimeRange="getChartCurrentTimeRange"
        ></chart>
      </template>
    </div>
  </div>
  <!-- block -->
  <div
      v-else-if="isBlock"
      class="cn-chart cn-chart__block"
      :style="computePosition"
      :id="chartInfo.params && chartInfo.params.anchorPoint"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
        <div style="top: 18px;" class="panel__time" v-if="chartInfo.params && chartInfo.params.showTimeTool">
          <DateTimeRange class="date-time-range" :start-time="chartTimeFilter.startTime" :end-time="chartTimeFilter.endTime" ref="dateTimeRange" @change="reload"/>
          <TimeRefresh class="date-time-range" @change="timeRefreshChange" :end-time="chartTimeFilter.endTime"/>
        </div>
      </div>
    </div>
    <div class="cn-chart__body">
      <template v-for="chart in chartInfo.children" :key="Chart.id">
        <chart
            :chart="Chart"
            :time-filter="chartTimeFilter"
            :ref="`chart-${Chart.id}`"
            :entity="entity"
            :parent-data="groupData"
            :from-block="true"
            @getChartCurrentTimeRange="getChartCurrentTimeRange"
        ></chart>
      </template>
    </div>
  </div>
  <!-- Domain详情-whois -->
  <div
      v-else-if="isDomainWhois"
      class="cn-chart cn-chart__whois"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      </div>
    </div>
    <div class="cn-chart__body">
      <div class="domain-detail-list">
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.sponsor')}}</div>
          <div class="domain-detail-list__content">{{detailData.registrar || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.org')}}</div>
          <div class="domain-detail-list__content">{{detailData.org || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">Email</div>
          <div class="domain-detail-list__content">{{detailData.postcode || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('overall.country')}}</div>
          <div class="domain-detail-list__content">{{detailData.country || '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.creationDate')}}</div>
          <div class="domain-detail-list__content">{{detailData.createTime ? parseMsDate(detailData.createTime) : '-'}}</div>
        </div>
        <div class="domain-detail-list__row">
          <div class="domain-detail-list__label">{{$t('entities.expirationDate')}}</div>
          <div class="domain-detail-list__content">{{detailData.expirationTime ? parseMsDate(detailData.expirationTime) : '-'}}</div>
        </div>
      </div>
    </div>
  </div>
  <!-- Domain详情-DNS记录 -->
  <div
      v-else-if="isDomainDnsRecord"
      class="cn-chart cn-chart__dns-record"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      </div>
    </div>
    <div class="cn-chart__body">
      <div class="entity-detail__dns-record">
        <div class="dns-record__table">
          <div style="height: 100%; overflow: hidden auto;">
            <div class="dns-record__table-row dns-record__table-row--header">
              <div class="dns-record__table-cell" style="min-width: 200px;">Type</div>
              <div class="dns-record__table-cell" style="width: 100%;">Value</div>
            </div>
            <div class="dns-record__table-row" v-for="(data, index) in detailData" :key="index">
              <div class="dns-record__table-cell">{{data.type || '-'}}</div>
              <div class="dns-record__table-cell">{{data.value || '-'}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Cryptocurrency EventList ：近期挖矿事件-->
  <div v-else-if="isCryptocurrencyEventList"
          class="cn-chart cn-chart__table"
          :style="computePosition"
  >
    <div class="cn-chart__header" >
      <chart-error
              :isError="isError"
              :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title" >
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      </div>

      <span class="header__operations header__operation-btn" @click="refresh"><i class="cn-icon cn-icon-refresh"></i></span>
    </div>
    <div class="chart__loading" v-show="loading">
      <i class="el-icon-loading"></i>
    </div>
    <div class="cn-chart__body"  v-no-data="noData">
      <div class="crypto-eventList__record">
        <div class="record__table">
          <div style="height: 100%; overflow: hidden auto;">
            <div class="record__table-row" v-for="(data, index) in croptyEventList" :key="index">
              <div class="record__table-cell">
                <div class="circle1" style=""></div>
              </div>
              <div class="record__table-cell">
                {{data.message || '-'}}：{{data.serverIP || '-'}}<br/>
                <span class="record_second" > {{data.time || '-'}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{data.clientIP || '-'}}&nbsp;&nbsp;&nbsp; </span>
                <div class="record_second arrow arrow-hor right"> </div>
                <span class="record_second">&nbsp;&nbsp;&nbsp; {{data.serverIP || '-'}}</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- APP详情-基本信息 -->
  <div
      v-else-if="isAppBasicInfo"
      class="cn-chart cn-chart__app-basic"
      :style="computePosition"
  >
    <div class="cn-chart__header">
      <chart-error
          :isError="isError"
          :errorInfo="errorInfo"
      >
      </chart-error>
      <div class="header__title">
        <span :title="chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name">{{chartInfo.i18n ? $t(chartInfo.i18n) : chartInfo.name}}</span>
      </div>
    </div>
    <div class="cn-chart__body">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <el-descriptions :column="1" style="padding: 20px 30px;">
          <el-descriptions-item :label="$t('overall.appName') + ':'">{{detailData.name || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.appFullName') + ':'">{{detailData.allName || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.technology') + ':'">{{detailData.tech || '-'}}</el-descriptions-item>
          <el-descriptions-item :label="$t('overall.remark') + ':'">{{detailData.description || '-'}}</el-descriptions-item>
        </el-descriptions>
        <div style="display: flex;">
          <single-value
              :type="51"
              icon="cn-icon cn-icon-category"
              :loading="false"
              style="width: 250px;"
          >
            <template #title>
              <span>{{$t('entities.category')}}</span>
            </template>
            <template #data>
              <span>{{detailData.category ? detailData.category : '-'}}</span>
            </template>
          </single-value>
          <single-value
              :type="51"
              icon="cn-icon cn-icon-sub-category"
              :loading="false"
              style="width: 250px;"
          >
            <template #title>
              <span>{{$t('entities.subcategory')}}</span>
            </template>
            <template #data>
              <span>{{detailData.subcategory ? detailData.subcategory : '-'}}</span>
            </template>
          </single-value>
          <single-value
              :type="51"
              icon="cn-icon cn-icon-credit"
              :loading="false"
              style="width: 250px;"
          >
            <template #title>
              <span>{{$t('entities.reputationLevel')}}</span>
            </template>
            <template #data>
              <span>{{detailData.risk ? detailData.risk : '-'}}</span>
            </template>
          </single-value>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import * as am4Core from '@amcharts/amcharts4/core'
import * as am4Maps from '@amcharts/amcharts4/maps'
import { ref, shallowRef } from 'vue'
import { tableTitleMapping, legendMapping } from '@/components/charts/chart-table-title'
import {
  isEcharts,
  isSingleValue,
  isTable,
  isActiveIpTable,
  isTitle,
  isMap,
  getOption,
  getTypeCategory,
  getLayout,
  layoutConstant,
  isEchartsWithTable,
  isEchartsWithStatistics,
  isEchartsTimeBar,
  isEchartsCategoryBar,
  isMapLine,
  isMapBlock,
  isSingleValueWithEcharts,
  isSingleValueWithEchartsTemp,
  isRelationShip,
  isTabs,
  isGroup,
  isSankey,
  isIpBasicInfo,
  isIpOpenPort,
  isIpHostedDomain,
  isDomainWhois,
  isDomainDnsRecord,
  isCryptocurrencyEventList,
  isAppBasicInfo,
  isAppRelatedDomain,
  getChartColor, chartBarColor, timeVerticalFormatter, timeHorizontalFormatter,
  categoryHorizontalFormatter, categoryVerticalFormatter, getCharBartColor, isBlock
} from '@/components/charts/chart-options'
import ChartError from '@/components/charts/ChartError'
import EchartsFrame from '@/components/charts/EchartsFrame'
import SingleValue from '@/components/charts/ChartSingleValue'
import ChartTable from '@/components/charts/ChartTable'
import ChartTableActiveIp from '@/components/charts/ChartTableActiveIp'
import ChartMap from '@/components/charts/ChartMap'
import PieTable from '@/components/charts/PieTable'
import StatisticsLegend from '@/components/charts/StatisticsLegend'
import ChartTablePagination from '@/components/charts/ChartTablePagination'
import unitConvert, { getUnitType, valueToRangeValue } from '@/utils/unit-convert'
import { chartTableDefaultPageSize, chartTableTopOptions, chartActiveIpTableOrderOptions, storageKey, chartPieTableTopOptions, unitTypes } from '@/utils/constants'
import { get, post } from '@/utils/http'
import { replaceUrlPlaceholder, getCapitalGeo, getGeoData, lineToSpace } from '@/utils/tools'
import { HeatLegend } from '@/components/amcharts/heatLegend'
import DateTimeRange from '@/components/common/TimeRange/DateTimeRange'
import TimeRefresh from '@/components/common/TimeRange/TimeRefresh'

import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { getNowTime } from '@/utils/date-util'

export default {
  name: 'Chart',
  props: {
    chart: Object, // 图表对象，包括id、name、type等数据
    timeFilter: Object,
    parentData: Object,
    fromBlock: Boolean,
    hideHeader: Boolean,
    entity: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    EchartsFrame,
    SingleValue,
    ChartTablePagination,
    ChartTable,
    ChartTableActiveIp,
    PieTable,
    StatisticsLegend,
    ChartMap,
    ChartError,
    DateTimeRange,
    TimeRefresh
  },
  data () {
    return {
      table: {
        pageSize: chartTableDefaultPageSize,
        limit: chartTableTopOptions[0], // top-n
        orderBy: 'sessions',
        tableColumns: [], // table字段
        tableData: [], // table的所有数据
        currentPageData: [] // table当前页的数据
      },

      activeIpTable: {
        orderBy: 'machine',
        tableData: [
          {
            name: '192.168.20.21',
            num: 111

          }, {
            name: '192.168.20.22',
            num: 345
          }, {
            name: '192.168.20.23',
            num: 111

          }, {
            name: '192.168.20.24',
            num: 345
          }, {
            name: '192.168.20.25',
            num: 111

          }, {
            name: '192.168.20.26',
            num: 345
          }
        ] // table的所有数据
      },
      pieTableData: [],
      singleValue: {
        value: '-',
        icon: '',
        color: ''
      },
      showMapBackButton: false, // 下钻之后控制是否显示返回上一层按钮
      standaloneTimeRange: { // 单个图表刷新时，重新获取时间范围，且不影响到其他图
        use: false,
        startTime: '',
        endTime: ''
      },
      queryTimeRange: { // 实际查询接口时使用的时间
        startTime: '',
        endTime: ''
      },
      activeTab: '',
      groupData: '', // group类型的查询数据，用于传递给子chart，子chart通过params.dataKey取值
      detailData: '', // 详情类型图表的数据
      croptyEventList: [],
      statisticsData: [],
      orderPieTable: chartPieTableTopOptions[0].value,
      selectPieChartName: '',
      allSelectPieChartName: [],
      chartOption: null,
      loading: true,
      noData: false, // 查询结果为空
      noData0: false, // 单chart内含多图表时使用
      noData1: false,
      throttle: null, // 节流器
      isError: false, // 接口响应是否报错
      errorInfo: '', // 接口具体错误信息
      polygonSeries: null, // 世界地图series
      countrySeries: null, // 下钻国家series
      baseMapSeriesName: ['Container', 'MapChart'],
      mapPictureUrl: '/Tiles/{z}/{x}/{y}.png'
    }
  },
  methods: {
    initChart () {
      this.loading = true
      if (this.standaloneTimeRange.use) {
        this.queryTimeRange = { startTime: parseInt(this.standaloneTimeRange.startTime / 1000), endTime: parseInt(this.standaloneTimeRange.endTime / 1000) }
      } else if (this.timeFilter) {
        this.queryTimeRange = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000) }
      } else {
        this.queryTimeRange = { startTime: parseInt(this.chartTimeFilter.startTime / 1000), endTime: parseInt(this.chartTimeFilter.endTime / 1000) }
      }
      try {
        const chartParams = this.chartInfo.params
        if (this.isMap) {
          this.initMap(`chart${this.chartInfo.id}`)
          if (chartParams) {
            this.isIpBasicInfo ? this.loadLeafletMap() : this.loadAm4ChartMap(this.polygonSeries)
          }
          // TODO 优化：缓存地图，重新查询时只更改数据，不再次初始化
        } else if (this.isEcharts) {
          if (this.isIpHostedDomain || this.isAppRelatedDomain) {
            const dom = document.getElementById(`chart${this.chartInfo.id}-0`)
            const dom2 = document.getElementById(`chart${this.chartInfo.id}-1`)
            !this.myChart && (this.myChart = echarts.init(dom))
            !this.myChart2 && (this.myChart2 = echarts.init(dom2))
          } else {
            const dom = document.getElementById(`chart${this.chartInfo.id}`)
            !this.myChart && (this.myChart = echarts.init(dom))
          }
          this.chartOption = this.$_.cloneDeep(getOption(this.chart.type))
          if (chartParams) {
            if (this.isEchartsWithTable) {
              this.initEchartsWithPieTable(chartParams)
            } else if (this.isEchartsWithStatistics) {
              this.initEchartsWithStatistics(chartParams)
            } else if (this.isRelationShip) {
              this.initRelationShip(chartParams)
            } else if (this.isSankey) {
              this.initSankey(chartParams)
            } else if (this.isIpOpenPort) {
              this.initIpOpenPort(chartParams)
            } else if (this.isIpHostedDomain) {
              this.initIpHostedDomain(chartParams)
            } else if (this.isAppRelatedDomain) {
              this.initAppRelatedDomain(chartParams)
            } else if (this.isEchartsTimeBar) {
              this.initEchartsTimeBar(chartParams)
            } else if (this.isEchartsCategoryBar) {
              this.initEchartsCategoryBar(chartParams)
            } else {
              this.initECharts(chartParams)
            }
          }
        } else if (this.isActiveIpTable) {
          this.initChartActiveIpTable(chartParams)
        } else if (this.isTable) {
          if (chartParams) {
            this.initChartTable(chartParams)
          }
        } else if (this.isSingleValue) {
          if (chartParams) {
            this.singleValue.icon = chartParams.icon
            if (chartParams.color) {
              this.singleValue.color = chartParams.color
            }
            const gotData = new Promise(resolve => {
              let result = ''
              if (chartParams.dataKey) {
                if (this.parentData && (this.parentData[chartParams.dataKey] || this.parentData[chartParams.dataKey] === 0)) {
                  result = this.parentData[chartParams.dataKey]
                } else {
                  this.noData = true
                }
                resolve(result)
              } else {
                const queryParams = { ...this.queryTimeRange, ...this.entity }
                get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
                  if (response.code === 200) {
                    result = response.data.result
                  } else {
                    this.isError = true
                    this.noData = true
                    this.errorInfo = response.msg || response.message || 'Unknown'
                  }
                  resolve(result)
                })
              }
            })
            gotData.then(result => {
              if (this.isSingleValueWithEcharts) { // 带曲线的单值图
                const dom = document.getElementById(`chart${this.chartInfo.id}`)
                !this.myChart && (this.myChart = echarts.init(dom))
                this.chartOption = this.$_.cloneDeep(getOption(this.chart.type))
                const seriesTemplate = this.chartOption.series[0]
                this.chartOption.series = result.map((r, i) => {
                  return {
                    ...seriesTemplate,
                    name: r.legend,
                    data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType]),
                    lineStyle: {
                      color: getChartColor[i]
                    }
                  }
                })
                this.myChart.setOption(this.chartOption)
                this.singleValue.value = result[0].values[result[0].values.length - 1][1]

                /* const queryParams = { startTime: parseInt(this.timeFilter.startTime / 1000), endTime: parseInt(this.timeFilter.endTime / 1000), ...this.entity }
                const dom = document.getElementById(`chart${this.chartInfo.id}`)
                !this.myChart && (this.myChart = echarts.init(dom))
                this.chartOption = this.$_.cloneDeep(getOption(this.chart.type))
                const seriesTemplate = this.chartOption.series[0]

                get(replaceUrlPlaceholder(chartParams.urlLine, queryParams)).then(response => {
                  if (response.code === 200) {
                    this.chartOption.series = response.data.result.map((r, i) => {
                      return {
                        ...seriesTemplate,
                        name: r.legend,
                        data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType]),
                        lineStyle: {
                          color: getChartColor[i]
                        }
                      }
                    })
                  } else {
                    this.isError = true
                    this.noData = true
                    this.errorInfo = response.msg || response.message || 'Unknown'
                  }
                  this.myChart.setOption(this.chartOption)
                }) */
              } else {
                this.singleValue.value = result
                this.loading = false
              }
            }).catch(() => {
              this.singleValue.value = ''
            }).finally(() => {
              setTimeout(() => {
                this.loading = false
                this.$nextTick(() => {
                  this.echartsResize()
                })
              }, 250)
            })
          }
        } else if (this.isTabs) {
          if (!this.$_.isEmpty(this.chartInfo.children)) {
            this.activeTab = `${this.chartInfo.children[0].id}`
          }
        } else if (this.isGroup) {
          if (chartParams && chartParams.url) {
            const queryParams = { ...this.queryTimeRange, ...this.entity }
            get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
              if (response.code === 200) {
                this.groupData = response.data.result
              } else {
                this.isError = true
                this.noData = true
                this.errorInfo = response.msg || response.message || 'Unknown'
              }
            }).catch(e => {
              this.isError = true
              this.errorInfo = e
            })
          }
        } else if (this.isDomainWhois || this.isDomainDnsRecord) {
          const queryParams = { domain: this.entity.domain }
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
            if (response.code === 200) {
              this.detailData = response.data.result
            } else {
              this.isError = true
              this.noData = true
              this.errorInfo = response.msg || response.message || 'Unknown'
            }
          }).catch(e => {
            this.isError = true
            this.errorInfo = e
          })
        } else if (this.isCryptocurrencyEventList) {
          const queryParams = { ...this.queryTimeRange, ...this.entity }
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
            if (response.code === 200) {
              if (response.data.result.length > 0) {
                this.croptyEventList = response.data.result
              } else {
                this.noData = true
              }
            } else {
              this.isError = true
              this.noData = true
              this.errorInfo = response.msg || response.message || 'Unknown'
            }
          }).catch(e => {
            this.isError = true
            this.errorInfo = e
          }).finally(() => {
            setTimeout(() => { this.loading = false }, 250)
          })
        } else if (this.isAppBasicInfo) {
          const queryParams = { appName: this.entity.appName }
          get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
            if (response.code === 200) {
              this.detailData = response.data.result
            } else {
              this.isError = true
              this.noData = true
              this.errorInfo = response.msg || response.message || 'Unknown'
            }
          }).catch(e => {
            this.isError = true
            this.errorInfo = e
          })
        }
      } catch (e) {
        console.error(e)
      }
    },

    reloadChart () {
      this.initChart()
      this.$nextTick(() => {
        if (!this.$_.isEmpty(this.chart.children)) {
          this.chart.children.forEach(chart => {
            this.$refs[`chart-${chart.id}`].reloadChart()
          })
        }
      })
    },
    timeRefreshChange () {
      if (!this.$refs.dateTimeRange.isCustom) {
        const value = this.chartTimeFilter.dateRangeValue
        this.$refs.dateTimeRange.quickChange(value)
      }
    },
    reload (s, e, v) {
      this.dateTimeRangeChange(s, e, v)
    },
    dateTimeRangeChange (s, e, v) {
      this.chartTimeFilter = { startTime: s, endTime: e, dateRangeValue: v }
    },
    generateTooltipHTML () {
      return `
        <div class="map-tooltip" style="padding-bottom: 10px;">
          <div class="map-tooltip__title">{name}</div>
          <div class="map-tooltip__content">
            <span>{labelText}</span>
            <span>{showValue}</span>
          </div>
        </div>
      `
    },
    changeTab (tab) {
      this.activeTab = tab.paneName
    },
    initMap (id) {
      if (this.isIpBasicInfo) {
        L.Marker.prototype.options.icon = L.icon({
          iconUrl: icon,
          shadowUrl: iconShadow
        })
        const map = L.map(`chart${this.chartInfo.id}`, {
          minZoom: 3,
          maxZoom: 7,
          zoom: 5,
          attributionControl: false,
          zoomControl: false,
          maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
        })
        L.tileLayer(
          this.mapPictureUrl,
          { noWrap: true }
        ).addTo(map)

        const attribution = L.control.attribution({ position: 'bottomright', prefix: '' })
        attribution.addAttribution(' © OpenStreetMap contributors')
        attribution.addTo(map)

        /* L.control.zoom({
          position: 'bottomright',
          zoomInText: '<i class="nz-icon nz-icon-enlarge"></i>',
          zoomOutText: '<i class="nz-icon nz-icon-narrow"></i>',
          zoomInTitle: '',
          zoomOutTitle: ''
        }).addTo(map) */

        this.myChart = map
      } else {
        const chart = am4Core.create(id, am4Maps.MapChart)
        chart.geodata = getGeoData(storageKey.iso36112WorldLow)
        chart.projection = new am4Maps.projections.Miller()
        this.myChart = chart
        const polygonSeries = chart.series.push(new am4Maps.MapPolygonSeries())
        polygonSeries.useGeodata = true
        polygonSeries.exclude = ['AQ'] // 排除南极洲
        polygonSeries.tooltip.getFillFromObject = false
        polygonSeries.tooltip.background.fill = am4Core.color('#FFFFFF')
        this.polygonSeries = polygonSeries
        const polygonTemplate = polygonSeries.mapPolygons.template
        polygonTemplate.tooltipHTML = this.generateTooltipHTML()
        polygonTemplate.nonScalingStroke = true
        polygonTemplate.strokeWidth = 0.5
        polygonTemplate.fill = am4Core.color('rgba(176,196,222,.5)')
        polygonTemplate.events.on('hit', ev => {
          let countryId = ev.target.dataItem.dataContext.id
          countryId = countryId === 'Private IP' ? 'China' : countryId
          if (countryId) {
            ev.target.series.chart.zoomToMapObject(ev.target)
            ev.target.isHover = false
            this.countrySeries = chart.series.push(new am4Maps.MapPolygonSeries())
            this.countrySeries.tooltip.getFillFromObject = false
            this.countrySeries.tooltip.background.fill = am4Core.color('#FFFFFF')
            const countryTemplate = this.countrySeries.mapPolygons.template
            countryTemplate.tooltipHTML = this.generateTooltipHTML()
            countryTemplate.nonScalingStroke = true
            countryTemplate.strokeWidth = 0.5
            countryTemplate.fill = am4Core.color('rgba(176,196,222,.5)')
            const geoData = getGeoData(countryId)
            if (geoData) {
              this.countrySeries.geodata = geoData
              this.polygonSeries.hide()
              this.loadAm4ChartMap(this.countrySeries, ev.target.dataItem.dataContext.serverCountry)
            }
          }
        })
      }
    },
    loadAm4ChartMap (polygonSeries, country) {
      this.loading = true
      // 清除数据
      polygonSeries.data.splice(0)
      // 清除legend
      this.myChart.children.each((s, i) => {
        if (s.className !== 'Container') {
          this.myChart.children.removeIndex(i)
        }
      })

      this.showMapBackButton = !!country
      const chartParams = this.chartInfo.params
      const queryParams = { ...this.queryTimeRange, country: country || '', region: '', ...this.entity } // 统计数据的查询参数
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200 && !this.$_.isEmpty(response.data.result)) {
          const data = response.data.result
          data.forEach(r => {
            const serverCountryCapital = r.serverId && getCapitalGeo(r.serverId)
            const clientCountryCapital = r.clientId && getCapitalGeo(r.clientId)
            serverCountryCapital && (r.serverLongitude = serverCountryCapital.capitalLongitude)
            serverCountryCapital && (r.serverLatitude = serverCountryCapital.capitalLatitude)
            clientCountryCapital && (r.clientLongitude = clientCountryCapital.capitalLongitude)
            clientCountryCapital && (r.clientLatitude = clientCountryCapital.capitalLatitude)
          })
          /* if (this.isMapLine) {
            const lineSeries = this.myChart.series.push(new am4Maps.MapLineSeries())
            const lineTemplate = lineSeries.mapLines.template
            lineTemplate.stroke = am4Core.color('#A258EC')
            lineTemplate.line.nonScalingStroke = true
            lineTemplate.line.strokeDasharray = '4 3'
            lineTemplate.nonScalingStroke = true
            lineTemplate.arrow.nonScaling = true
            lineTemplate.arrow.width = 4
            lineTemplate.arrow.height = 6
            lineSeries.data = [
              {
                multiGeoLine: data.map(d => {
                  return [
                    {
                      latitude: parseFloat(d.serverLatitude),
                      longitude: parseFloat(d.serverLongitude)
                    },
                    {
                      latitude: parseFloat(d.clientLatitude),
                      longitude: parseFloat(d.clientLongitude)
                    }
                  ]
                })
              }
            ]
            const imageSeries = this.myChart.series.push(new am4Maps.MapImageSeries())
            imageSeries.dataFields.value = 'sessions'
            const imageSeriesTemplate = imageSeries.mapImages.template
            const circle = imageSeriesTemplate.createChild(am4Core.Circle)

            circle.fillOpacity = 0.7
            circle.nonScaling = true
            const radiusHeat = imageSeries.heatRules.push({
              target: circle,
              property: 'radius',
              min: 8,
              max: 30
            })
            const colorHeat = imageSeries.heatRules.push({
              target: circle,
              property: 'fill',
              min: am4Core.color('#D2A8FF'),
              max: am4Core.color('#A258EC')
            })
            imageSeriesTemplate.propertyFields.latitude = 'latitude'
            imageSeriesTemplate.propertyFields.longitude = 'longitude'

            const pointData = []
            data.forEach(d => {
              pointData.push({
                ...d,
                latitude: parseFloat(d.serverLatitude),
                longitude: parseFloat(d.serverLongitude)
              })
              pointData.push({
                ...d,
                latitude: parseFloat(d.clientLatitude),
                longitude: parseFloat(d.clientLongitude)
              })
            })
            imageSeries.data = pointData
          } */
          if (this.isMapBlock) {
            const sumData = []
            data.forEach(r => {
              const hit = sumData.find(s => s.id === r.serverId)
              const { key, labelText } = this.getDataKey(r)
              const value = Number(r[key]) || 0
              if (hit) {
                hit.value += value
              } else {
                sumData.push({
                  id: r.serverId,
                  serverCountry: r.serverCountry,
                  key,
                  labelText,
                  value
                })
              }
            })
            const seriesData = sumData.map(r => ({
              ...r,
              showValue: (r.value || r.value === 0) ? valueToRangeValue(r.value, chartParams.unitType).join(' ') : ''
            }))
            polygonSeries.data = [...seriesData]
            const sorted = seriesData.sort((a, b) => b.value - a.value)
            const allZero = this.$_.isEmpty(sorted) || Number(sorted[0].value) === 0 // 数据全为0的情况，legend只显示1个颜色

            polygonSeries.heatRules.push({
              property: 'fill',
              target: polygonSeries.mapPolygons.template,
              min: this.myChart.colors.getIndex(1).brighten(1),
              max: allZero ? this.myChart.colors.getIndex(1).brighten(1) : this.myChart.colors.getIndex(1).brighten(-0.3)
            })
            const heatLegend = this.myChart.createChild(HeatLegend)
            heatLegend.markerContainer.height = 6
            heatLegend.series = polygonSeries
            heatLegend.align = 'left'
            heatLegend.markerCount = allZero ? 1 : 3
            heatLegend.minValue = 0
            heatLegend.fontSize = 12
            heatLegend.maxValue = allZero ? 1 : Number(sorted[0].value)
            heatLegend.width = allZero ? am4Core.percent(10) : am4Core.percent(25)
            heatLegend.marginLeft = 15
            heatLegend.valign = 'bottom'

            const minRange = heatLegend.valueAxis.axisRanges.create()
            minRange.value = heatLegend.minValue
            minRange.label.text = minRange.value === 0 ? 0 : unitConvert(heatLegend.minValue, chartParams.unitType).join(' ')
            const maxRange = heatLegend.valueAxis.axisRanges.create()
            maxRange.value = heatLegend.maxValue
            maxRange.label.text = maxRange.value === 0 ? 0 : unitConvert(heatLegend.maxValue, chartParams.unitType).join(' ')

            heatLegend.valueAxis.renderer.labels.template.adapter.add('text', function (labelText) {
              return ''
            })
          }
        } else if (response.code !== 200) {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
      }).finally(() => {
        setTimeout(() => { this.loading = false }, 250)
      })
    },
    loadLeafletMap () {
      this.loading = true
      const chartParams = this.chartInfo.params
      get(replaceUrlPlaceholder(chartParams.url, this.entity)).then(response => {
        if (response.code === 200 && !this.$_.isEmpty(response.data.result)) {
          this.detailData = response.data.result
          this.myChart.setView([this.detailData.latitude, this.detailData.longitude], 5)
          const myIcon = L.divIcon({
            className: 'cn-icon cn-icon-position2 position-icon'
          })
          L.marker([this.detailData.latitude, this.detailData.longitude], { icon: myIcon }).addTo(this.myChart)
        }
      }).finally(() => {
        setTimeout(() => { this.loading = false }, 250)
      })
    },
    pageJump (val) {
      this.table.currentPageData = this.getTargetPageData(val, this.table.pageSize, this.table.tableData)
    },
    getTargetPageData (pageNum, pageSize, tableData) {
      return this.$_.slice(tableData, (pageNum - 1) * pageSize, pageNum * pageSize)
    },
    refresh () {
      const eventName = this.fromBlock ? 'getChartCurrentTimeRange' : 'getCurrentTimeRange'
      this.$emit(eventName, ({ startTime, endTime }) => {
        this.standaloneTimeRange.use = true
        this.standaloneTimeRange.startTime = startTime
        this.standaloneTimeRange.endTime = endTime
        this.initChart()
      })
    },
    mapBack () {
      this.countrySeries.hide()
      this.loadAm4ChartMap(this.polygonSeries)
      this.polygonSeries.show()
      this.myChart.goHome()
    },
    // 获取最新时间
    getCurrentTimeRange (callback) {
      this.$emit('getCurrentTimeRange', ({ startTime, endTime }) => {
        callback({ startTime, endTime })
      })
    },
    // 获取最新时间
    getChartCurrentTimeRange (callback) {
      if (this.isGroup) {
        this.$emit('getChartCurrentTimeRange', ({ startTime, endTime }) => {
          callback({ startTime, endTime })
        })
      } else {
        const myEndTime = window.$dayJs.tz().valueOf()
        const myStartTime = myEndTime - this.chartTimeFilter.dateRangeValue * 60 * 1000
        callback({ startTime: myStartTime, endTime: myEndTime })
      }
    },
    getDataKey (r) {
      let key = ''
      let labelText = ''
      if (r.establishLatency || r.establishLatency === 0) {
        key = 'establishLatency'
        labelText = this.$t('networkAppPerformance.tripTime')
      } else if (r.httpResponseLatency || r.httpResponseLatency === 0) {
        key = 'httpResponseLatency'
        labelText = this.$t('networkAppPerformance.httpResponse')
      } else if (r.sslConLatency || r.sslConLatency === 0) {
        key = 'sslConLatency'
        labelText = this.$t('networkAppPerformance.sslResponse')
      } else if (r.sequenceGapLossPercent || r.sequenceGapLossPercent === 0) {
        key = 'sequenceGapLossPercent'
        labelText = this.$t('networkAppPerformance.packetLossRate')
      } else if (r.pktRetransPercent || r.pktRetransPercent === 0) {
        key = 'pktRetransPercent'
        labelText = this.$t('networkAppPerformance.retransmissionRate')
      } else if (r.sessions || r.sessions === 0) {
        key = 'sessions'
        labelText = this.$t('overall.sessions')
      }
      return { key, labelText }
    },
    getTableTitle (data) {
      if (data.length > 0) {
        const dataColumns = Object.keys(data[0]) // 返回数据的字段
        const columns = dataColumns.map(c => tableTitleMapping[c]) // 展示字段
        const keys = ['clientIp', 'serverIp', 'ip', 'appId', 'app', 'appName', 'domain']
        return columns.sort((a, b) => {
          if (keys.indexOf(a.prop) > -1) {
            return -1
          } else if (keys.indexOf(b.prop) > -1) {
            return 1
          } else {
            return 0
          }
        })
      } else {
        return []
      }
    },
    toggleStatisticsLegend (index) {
      this.statisticsData[index].active = !this.statisticsData[index].active
      this.statisticsData.forEach((d, i) => {
        if (d.active) {
          this.myChart.dispatchAction({
            type: 'legendSelect',
            name: d.legend
          })
        } else {
          this.myChart.dispatchAction({
            type: 'legendUnSelect',
            name: d.legend
          })
        }
      })
    },
    orderPieTableChange () {
      if (this.chart.type === 31) {
        const chartParams = this.chartInfo.params || null // 图表参数
        this.initEchartsWithPieTable(chartParams)
      }
    },
    timeLineIsAllZero (data) {
      if (data.resultType === 'matrix') {
        let allZero = true
        try {
          data.result.forEach(d => {
            d.values.forEach(r => {
              if (r[1] && r[1] !== '0') {
                allZero = false
                throw new Error('break')
              }
            })
          })
        } catch (e) {}
        return allZero
      }
    },
    initECharts (chartParams) {
      if (chartParams.showLegend === false) {
        this.chartOption.legend.show = false
      }
      const queryParams = { ...this.queryTimeRange, ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          const seriesTemplate = this.chartOption.series[0]
          const allZero = this.timeLineIsAllZero(response.data)
          if (allZero) {
            this.chartOption.yAxis = {
              ...this.chartOption.yAxis,
              min: 0,
              max: 5,
              interval: 1
            }
          }
          this.chartOption.series = response.data.result.map(r => {
            return {
              ...seriesTemplate,
              name: legendMapping[`${this.entity && this.entity.ip ? 'ip_' : ''}${r.legend}`] ? legendMapping[`${this.entity && this.entity.ip ? 'ip_' : ''}${r.legend}`] : lineToSpace(r.legend),
              data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType])
            }
          })
          const rows = (response.data.result.length - 1) / 4 + 1 // 根据legend个数动态预留legend空间
          const gridTop = 10 + 27 * rows
          this.chartOption.grid.top = gridTop
          if (chartParams.unitType === unitTypes.byte) {
            this.chartOption.yAxis.axisLabel.formatter = function (value, index, a, b) {
              return unitConvert(value, unitTypes.byte).join(' ')
            }
            this.chartOption.grid.left = 75
          }
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
        this.myChart.setOption(this.chartOption)
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },
    initRelationShip (chartParams) {
      this.isError = false
      this.errorInfo = '0'
      const queryParams = { ...this.entity, limit: 5 }
      post(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (!response.data.result) {
            this.noData = true
            return
          }
          const data = []
          const links = []
          handleData(data, links, response.data.result)
          this.chartOption.series[0].data = data
          this.chartOption.series[0].links = links
          this.myChart.setOption(this.chartOption)
        } else {
          this.isError = true
          this.errorInfo = response
          this.noData = true
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          setTimeout(() => {
            this.myChart.resize()
          })
        }, 250)
      })

      const vm = this
      function handleData (data, links, item) {
        if (!data.some(d => d.name === item.name)) {
          data.push({ name: item.name, ...handleStyle(item) })
        }
        if (!vm.$_.isEmpty(item.from) && !vm.$_.isEmpty(item.to)) {
          links.push({ target: item.to, source: item.from })
        }
        if (!vm.$_.isEmpty(item.leaf)) {
          item.leaf.forEach(i => {
            handleData(data, links, i)
          })
        }
      }

      function handleStyle (item) {
        const style = {}
        switch (item.type) {
          case 'app_id': {
            style.itemStyle = { color: '#73DEB3' }
            style.symbol = 'circle'
            break
          }
          case 'domain': {
            style.itemStyle = { color: '#73A0FA' }
            style.symbol = 'circle'
            break
          }
          case 'client_ip': {
            style.itemStyle = { color: '#E8F6FF', borderColor: '#C9C9C9' }
            style.symbol = 'roundRect'
            style.symbolSize = [80, 25]
            break
          }
          case 'server_ip': {
            style.itemStyle = { color: '#E2FCEF', borderColor: '#C9C9C9' }
            style.symbol = 'roundRect'
            style.symbolSize = [80, 25]
            break
          }
        }
        return style
      }
    },
    initSankey (chartParams) {
      const vm = this
      const entityName = this.entity.ip || this.entity.domain || this.entity.app
      const queryParams = { ...this.queryTimeRange, ...this.entity }
      this.chartOption.series[0].tooltip = {
        formatter: function (param) {
          return `
            <div class="sankey__tooltip">
              <div class="sankey__tooltip-row">
                <div class="sankey__row-label">Via:</div>
                <div class="sankey__row-value">${param.data.name}</div>
              </div>
              <div class="sankey__tooltip-row">
                <div style="margin: 6px 0; height: 1px; width: 100%; background-color: #E7EAED;"></div>
              </div>
              <div class="sankey__tooltip-row">
                <div class="sankey__row-label">Traffic:</div>
                <div class="sankey__row-value">${param.data.convert[0]}${param.data.convert[1]}&nbsp;(${param.data.percent[0]}%)</div>
              </div>
              <div class="sankey__tooltip-row">
                <div class="sankey__row-label">Performance:</div>
              </div>
              <div class="sankey__tooltip-table">
                <div class="sankey__table-row">
                  <div class="sankey__table-cell">${vm.$t('networkAppPerformance.tripTime')}:</div>
                  <div class="sankey__table-cell">${param.data.latency[0]}&nbsp;${param.data.latency[1]}</div>
                </div>
                <div class="sankey__table-row">
                  <div class="sankey__table-cell">${vm.$t('overall.packetLoss')}:</div>
                  <div class="sankey__table-cell">${param.data.lossPercent[0]}&nbsp;%</div>
                </div>
                <div class="sankey__table-row">
                  <div class="sankey__table-cell">${vm.$t('overall.packetRetrans')}:</div>
                  <div class="sankey__table-cell">${param.data.retransPercent[0]}&nbsp;%</div>
                </div>
              </div>
            </div>
          `
        }
      }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
          } else {
            this.noData = false
            let inTotalValue = 0
            let outTotalValue = 0

            /* 测试代码
            const t = []
            for (const k in response.data.result) {
              t.push(response.data.result[k])
            }
            response.data.result = t */

            response.data.result.forEach(item => {
              if (item.direction === 'in') {
                inTotalValue += parseInt(item.bytes)
              } else if (item.direction === 'out') {
                outTotalValue += parseInt(item.bytes)
              }
            })
            const data = response.data.result.map(item => {
              return {
                ...item,
                name: item.linkID,
                percent: valueToRangeValue(parseInt(item.bytes) / (item.direction === 'in' ? inTotalValue : outTotalValue) * 100, unitTypes.percent),
                convert: unitConvert(item.bytes, unitTypes.byte),
                latency: valueToRangeValue(item.latency, unitTypes.time),
                lossPercent: valueToRangeValue(item.lossPercent, unitTypes.percent),
                retransPercent: valueToRangeValue(item.retransPercent, unitTypes.percent),
                bytes: parseFloat(item.bytes)
              }
            })
            data.push({ name: entityName })

            const link = data.map(item => {
              const source = item.direction === 'in' ? item.linkID : entityName
              const target = item.direction === 'in' ? entityName : item.linkID
              return {
                ...item,
                source,
                target,
                value: item.bytes
              }
            })
            this.chartOption.series[0].data = data
            this.chartOption.series[0].links = link
            this.myChart.setOption(this.chartOption)
          }
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
      /* const inDirection = new Promise(resolve =>
        get(replaceUrlPlaceholder(chartParams.url, { ...queryParams, direction: 'ingress' })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              this.noData = true
            } else {
              this.noData = false
              resolve(handleData(response.data.result, 'in'))
            }
          }
          resolve()
        })
      )
      const outDirection = new Promise(resolve =>
        get(replaceUrlPlaceholder(chartParams.url, { ...queryParams, direction: 'egress' })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              this.noData = true
            } else {
              this.noData = false
              resolve(handleData(response.data.result, 'out'))
            }
          }
          resolve()
        })
      )
      Promise.all([inDirection, outDirection]).then(responses => {
        const inData = responses[0]
        const outData = responses[1]
        this.chartOption.series[0].data = inData.data.concat(outData.data)
        this.chartOption.series[0].links = inData.link.concat(outData.link)
        this.myChart.setOption(this.chartOption)
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })

      function handleData (originalData, direction) {
        let totalValue = 0
        originalData.forEach(item => {
          totalValue += parseInt(item.bytes)
        })
        const data = originalData.map(item => {
          return {
            ...item,
            name: item.linkID,
            percent: unitConvert(parseInt(item.bytes) / totalValue, unitTypes.byte),
            bytes: unitConvert(item.bytes, unitTypes.byte)
          }
        })

        const link = data.map(item => {
          const source = direction === 'in' ? item.linkID : entityName
          const target = direction === 'in' ? entityName : item.linkID
          return {
            ...item,
            source,
            target,
            value: item.bytes
          }
        })
        return {
          data,
          link
        }
      } */
    },
    initIpOpenPort (chartParams) {
      get(replaceUrlPlaceholder(chartParams.url, { ip: this.entity.ip })).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
          } else {
            this.noData = false
            this.detailData = response.data.result
            const protocols = []
            this.detailData.forEach((d, i) => {
              const index = protocols.findIndex(p => p.name === d.protocol.toUpperCase())
              if (index === -1) {
                protocols.push({ name: d.protocol.toUpperCase(), value: 1, itemStyle: { color: getChartColor(i) } })
              } else {
                protocols[index].value++
              }
            })
            this.chartOption.series[0].data = protocols
            this.chartOption.xAxis.data = protocols.map(p => p.name)
            this.myChart.setOption(this.chartOption)
          }
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },
    initIpHostedDomain (chartParams) {
      const list = new Promise(resolve => {
        get(replaceUrlPlaceholder(chartParams.url, { ip: this.entity.ip })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              this.noData = true
            } else {
              this.noData = false
              this.detailData = response.data.result
            }
          }
          resolve()
        })
      })
      const byType = new Promise(resolve => {
        get(replaceUrlPlaceholder(chartParams.byTypeUrl, { ip: this.entity.ip })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              this.noData0 = true
            } else {
              this.noData0 = false
              const chartOption = this.$_.cloneDeep(this.chartOption)
              chartOption.series[0].data = response.data.result.map(r => ({ ...r, unitType: chartParams.unitType }))
              this.myChart.setOption(chartOption)
            }
          }
          resolve()
        })
      })
      const byCredit = new Promise(resolve => {
        get(replaceUrlPlaceholder(chartParams.byCreditUrl, { ip: this.entity.ip })).then(response => {
          if (response.code === 200) {
            if (this.$_.isEmpty(response.data.result)) {
              this.noData1 = true
            } else {
              this.noData1 = false
              const chartOption = this.$_.cloneDeep(this.chartOption)
              chartOption.series[0].data = response.data.result.map(r => ({ ...r, unitType: chartParams.unitType }))
              this.myChart2.setOption(chartOption)
            }
          }
          resolve()
        })
      })
      Promise.all([list, byType, byCredit]).finally(response => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },
    initAppRelatedDomain (chartParams) {
      this.noData = false
      this.loading = false
      this.chartOption.series[0].data = [
        {
          name: 'test1',
          value: 32
        },
        {
          name: 'test2',
          value: 21
        },
        {
          name: 'test3',
          value: 20
        },
        {
          name: 'test4',
          value: 7
        }
      ]
      this.myChart.setOption(this.chartOption)
      this.myChart2.setOption(this.chartOption)
      get(replaceUrlPlaceholder(chartParams.url, { appName: this.entity.appName })).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
          } else {
            this.detailData = response.data.result
            this.noData = false
          }
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
        }, 250)
      })
    },

    handleTimeChartOption (chartParams, dataArray) {
      let direction = 'vertical'
      if (chartParams.direction) {
        direction = chartParams.direction
        if (direction == 'horizontal') { // 柱状图水平方向
          this.chartOption.xAxis = {
            axisTick: { show: false },
            axisLine: { show: false },
            type: 'value',
            axisLabel: {
              formatter: function (value, index, a, b) {
                return unitConvert(value, unitTypes.number).join(' ')
              }
            }
          }

          this.chartOption.yAxis = {
            type: 'category',
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              interval: 0,
              // rotate: -40, //设置日期显示样式（倾斜度）
              formatter: function (value) { // 在这里写你需要的时间格式
                return window.$dayJs.tz(Number(value)).format('M/D H:m')
              }
            },
            axisPointer: { // y轴上显示指针对应的值
              show: true
            }
          }
        } else if (direction == 'vertical') { // 柱状图竖直方向
          this.chartOption.yAxis = {
            axisTick: { show: false },
            axisLine: { show: false },
            type: 'value',
            axisLabel: {
              formatter: function (value, index, a, b) {
                return unitConvert(value, unitTypes.number).join(' ')
              }
            },
            minInterval: 1
          }
          this.chartOption.xAxis = {
            type: 'category',
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
              interval: 0,
              // rotate: -40, //设置日期显示样式（倾斜度）
              formatter: function (value) { // 在这里写你需要的时间格式
                return window.$dayJs.tz(Number(value)).format('M/D H:m')
              }
            },
            axisPointer: { // y轴上显示指针对应的值
              show: true
            }
          }
        }
      }

      let itemColorAlternately = false// true|false 柱体色是否轮替
      if (chartParams.itemColorAlternately) {
        itemColorAlternately = chartParams.itemColorAlternately
      }

      this.chartOption.tooltip = {
        ...this.chartOption.tooltip,
        formatter: (direction == 'horizontal') ? timeHorizontalFormatter : timeVerticalFormatter
      }

      this.chartOption.series = {
        ...this.chartOption.series[0],
        name: this.chartInfo.name,
        data: dataArray,
        itemStyle: {
          color: function (params) {
            if (itemColorAlternately) {
              return getCharBartColor([params.dataIndex])
            } else {
              return getCharBartColor(0)
            }
          }
        }
      }
    },

    initEchartsTimeBar (chartParams) {
      const queryParams = { ...this.queryTimeRange, ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }

          let dataArray = []
          if (chartParams.direction == 'vertical') { // 柱状图竖直方向
            dataArray = response.data.result[0].values.map((r, i) => {
              return [Number(r[0]), Number(r[1]), chartParams.unitType]
            })
          } else if (chartParams.direction == 'horizontal') { // 柱状图水平方向
            dataArray = response.data.result[0].values.map((r, i) => {
              return [Number(r[1]), Number(r[0]), chartParams.unitType]
            })
          }

          this.handleTimeChartOption(chartParams, dataArray)
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
        this.myChart.setOption(this.chartOption)
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },

    initEchartsCategoryBar (chartParams) {
      const queryParams = { ...this.queryTimeRange, ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }

          let dataArray = []
          if (chartParams.direction == 'horizontal') { // 柱状图水平方向
            dataArray = response.data.result.map((r, i) => { return [r.num, r.name] })
          } else if (chartParams.direction == 'vertical') { // 柱状图竖直方向
            dataArray = response.data.result.map((r, i) => { return [r.name, r.num] })
          }
          this.handleCategoryChartOption(chartParams, dataArray)
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
        this.myChart.setOption(this.chartOption)
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },

    handleCategoryChartOption (chartParams, dataArray) {
      let xType = 'category'
      let yType = 'value'
      let direction = 'vertical'
      if (chartParams.direction) {
        direction = chartParams.direction
        if (direction == 'horizontal') { // 柱状图水平方向
          xType = 'value'
          yType = 'category'
        } else if (direction == 'vertical') { // 柱状图竖直方向
          xType = 'category'
          yType = 'value'
        }
      }

      let itemColorAlternately = false// true|false 柱体色是否轮替
      if (chartParams.itemColorAlternately) {
        itemColorAlternately = chartParams.itemColorAlternately
      }

      this.chartOption.tooltip = {
        ...this.chartOption.tooltip,
        formatter: (direction == 'horizontal') ? categoryHorizontalFormatter : categoryVerticalFormatter
      }
      this.chartOption.xAxis = {
        ...this.chartOption.xAxis,
        type: xType
      }
      this.chartOption.yAxis = {
        ...this.chartOption.yAxis,
        type: yType
      }
      this.chartOption.series = {
        ...this.chartOption.series[0],
        data: dataArray,
        itemStyle: {
          color: function (params) {
            if (itemColorAlternately) {
              return getCharBartColor([params.dataIndex])
            } else {
              return getCharBartColor(0)
            }
          }
        }
      }
    },

    initEchartsWithStatistics (chartParams) {
      const queryParams = { ...this.queryTimeRange, ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          const allZero = this.timeLineIsAllZero(response.data)
          if (allZero) {
            this.chartOption.yAxis = {
              ...this.chartOption.yAxis,
              min: 0,
              max: 5,
              interval: 1
            }
          }
          this.statisticsData = response.data.result.map(d => {
            return {
              ...d,
              active: true
            }
          })
          const seriesTemplate = this.chartOption.series[0]
          this.chartOption.series = response.data.result.map((r, i) => {
            return {
              ...seriesTemplate,
              name: r.legend,
              data: r.values.map(v => [Number(v[0]) * 1000, Number(v[1]), chartParams.unitType]),
              lineStyle: {
                color: getChartColor[i]
              }
            }
          })
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
        this.myChart.setOption(this.chartOption)
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
    },

    initEchartsWithPieTable (chartParams) {
      const self = this
      chartParams.valueColumn = this.orderPieTable
      const unitType = getUnitType(chartParams.valueColumn)
      const queryParams = { ...this.queryTimeRange, limit: 10, order: this.orderPieTable, ...this.entity } // 统计数据的查询参数
      const tableQueryParams = { ...this.queryTimeRange, limit: 10, order: this.orderPieTable, ...this.entity } // 统计数据的查询参数
      tableQueryParams[chartParams.nameColumn] = [] // 处理两个图表不一样的地方)
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          const allZero = this.timeLineIsAllZero(response.data)
          if (allZero) {
            this.chartOption.yAxis = {
              ...this.chartOption.yAxis,
              min: 0,
              max: 5,
              interval: 1
            }
          }

          const data = response.data.result.map(d => {
            if (d[chartParams.nameColumn]) {
              this.allSelectPieChartName.push(d[chartParams.nameColumn])
            }
            return {
              data: d,
              name: d[chartParams.nameColumn],
              value: parseInt(d[chartParams.valueColumn]),
              unitType: unitType
            }
          })

          this.allSelectPieChartName = tableQueryParams[chartParams.nameColumn]
          this.chartOption.series[0].data = data
          if (this.chartOption.series[0].data && this.chartOption.series[0].data.length > 10) { // pieWithTable 图例超过10个改为滚动显示
            this.chartOption.legend.type = 'scroll'
          }
          this.myChart.setOption(this.chartOption)

          if (!this.$_.isEmpty(data)) {
            get(replaceUrlPlaceholder(chartParams.urlTable, tableQueryParams)).then(response2 => {
              if (response2.code === 200) {
                this.pieTableData = response2.data.result
              } else {
                this.isError = true
                this.noData = true
                this.errorInfo = response.msg || response.message || 'Unknown'
              }
            })
          }
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || 'Unknown'
        }
      }).finally(() => {
        setTimeout(() => {
          this.loading = false
          this.$nextTick(() => {
            this.echartsResize()
          })
        }, 250)
      })
      // legend点击事件
      this.myChart.off('legendselectchanged')
      this.myChart.on('legendselectchanged', function (params) {
        self.myChart.setOption({
          legend: { selected: { [params.name]: true } }
        })
        const index = self.chartOption.series[0].data.findIndex(d => d.name === params.name)
        if (self.selectPieChartName !== params.name) {
          self.myChart.dispatchAction({
            type: 'select',
            seriesIndex: 0,
            dataIndex: index
          })
          self.selectPieChartName = params.name
          self.loadPieTableData(params.name)
        } else {
          self.myChart.dispatchAction({
            type: 'unselect',
            seriesIndex: 0,
            dataIndex: index
          })
          self.selectPieChartName = ''
          self.loadPieTableData(this.allSelectPieChartName)
        }
      })
      // 饼图色块点击事件
      this.myChart.off('click')
      this.myChart.on('click', function (echartParams) {
        // 若是已选，则点击后取消选择，并查询全部数据
        if (echartParams.name === self.selectPieChartName) {
          self.selectPieChartName = ''
          self.loadPieTableData(this.allSelectPieChartName)
        } else { // 否则查询当前name数据
          self.selectPieChartName = echartParams.name
          self.loadPieTableData(echartParams.name)
        }
      })
    },
    loadPieTableData (name = '') {
      const childrenParams = { ...this.queryTimeRange, limit: 10, order: this.orderPieTable, ...this.entity }
      childrenParams[this.chartInfo.params.nameColumn] = name
      get(replaceUrlPlaceholder(this.chartInfo.params.urlTable, childrenParams)).then(response => {
        if (response.code === 200) {
          this.pieTableData = response.data.result
        }
      })
    },
    tableLimitChange () {
      const chartParams = this.chartInfo.params || null // 图表参数
      this.initChartTable(chartParams)
    },
    initChartTable (chartParams) {
      const queryParams = { ...this.queryTimeRange, limit: this.table.limit, order: this.table.orderBy, ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          this.table.tableData = response.data.result
          this.table.tableColumns = this.getTableTitle(response.data.result)
          this.table.currentPageData = this.getTargetPageData(1, this.table.pageSize, this.table.tableData)
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || this.$t('tip.unknownError')
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.$refs.tablePagination.resetPageNo()
        })
        setTimeout(() => { this.loading = false }, 250)
      })
    },

    activeIpTableLimitChange () {
      const chartParams = this.chartInfo.params || null // 图表参数
      this.initChartActiveIpTable(chartParams)
    },
    initChartActiveIpTable (chartParams) {
      const queryParams = { ...this.queryTimeRange, order: this.activeIpTable.orderBy, ...this.entity }
      get(replaceUrlPlaceholder(chartParams.url, queryParams)).then(response => {
        if (response.code === 200) {
          if (this.$_.isEmpty(response.data.result)) {
            this.noData = true
            return
          } else {
            this.noData = false
          }
          this.activeIpTable.tableData = response.data.result
          this.activeIpTable.tableColumns = this.getTableTitle(response.data.result)
          this.activeIpTable.currentPageData = this.getTargetPageData(1, this.activeIpTable.pageSize, this.activeIpTable.tableData)
        } else {
          this.isError = true
          this.noData = true
          this.errorInfo = response.msg || response.message || this.$t('tip.unknownError')
        }
      }).finally(() => {
        setTimeout(() => { this.loading = false }, 250)
      })
    },
    echartsResize () {
      this.myChart && this.myChart.resize()
      this.myChart2 && this.myChart2.resize()
    }
  },
  computed: {
    computePosition () {
      const gridColumn = `${this.chartInfo.x} / ${this.chartInfo.x + this.chartInfo.w}`
      const gridRow = `${this.chartInfo.y} / ${this.chartInfo.y + this.chartInfo.h}`
      return {
        gridColumn,
        gridRow
      }
    },
    location () {
      let location = ''
      if (this.detailData) {
        if (this.detailData.country) {
          location = this.detailData.country
          if (this.detailData.province) {
            location += ', '
            location += this.detailData.province
            if (this.detailData.city) {
              location += ', '
              location += this.detailData.city
            }
          }
        } else if (this.detailData.province) {
          location = this.detailData.province
          if (this.detailData.city) {
            location += ', '
            location += this.detailData.city
          }
        } else if (this.detailData.city) {
          location = this.detailData.city
        }
      }
      return location
    },
    handleSingleValue () {
      const value = this.singleValue.value
      const unitType = this.chartInfo.params.unitType
      const result = unitConvert(value, unitType)
      switch (unitType) {
        case unitTypes.percent: {
          result[0] = result[0] < 0.01 ? '< 0.01' : result[0]
          break
        }
        case unitTypes.time: {
          result[0] = result[0] < 1 ? '< 1' : result[0]
          break
        }
        default: break
      }
      return result
    }
  },
  mounted () {
    setTimeout(() => {
      this.initChart()
      this.throttle = this.$_.throttle(this.echartsResize, 500)
      window.addEventListener('resize', this.throttle)
    }, 300)
  },
  watch: {
    chart: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (o) {
          setTimeout(() => { this.initChart() })
        }
      }
    },
    timeFilter: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (n && o) {
          this.standaloneTimeRange.use = false
          this.$nextTick(() => {
            setTimeout(() => { this.initChart() })
          })
        }
      }
    },
    parentData: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (n) {
          this.$nextTick(() => {
            setTimeout(() => { this.initChart() })
          })
        }
      }
    }
  },
  setup (props) {
    const chartInfo = JSON.parse(JSON.stringify(props.chart))
    chartInfo.category = getTypeCategory(props.chart.type)

    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    // entity详情内的chart时间工具不是公共的，需要单独定义
    const chartTimeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      chartInfo,
      chartTimeFilter,
      layoutConstant,
      chartTableTopOptions,
      chartActiveIpTableOrderOptions,
      chartPieTableTopOptions,
      isEcharts: isEcharts(props.chart.type),
      isEchartsTimeBar: isEchartsTimeBar(props.chart.type),
      isEchartsCategoryBar: isEchartsCategoryBar(props.chart.type),
      isEchartsWithTable: isEchartsWithTable(props.chart.type),
      isEchartsWithStatistics: isEchartsWithStatistics(props.chart.type),
      isSingleValue: isSingleValue(props.chart.type),
      isSingleValueWithEcharts: isSingleValueWithEcharts(props.chart.type),
      isSingleValueWithEchartsTemp: isSingleValueWithEchartsTemp(props.chart.type),
      isRelationShip: isRelationShip(props.chart.type),
      isTable: isTable(props.chart.type),
      isActiveIpTable: isActiveIpTable(props.chart.type),
      isMap: isMap(props.chart.type),
      isTitle: isTitle(props.chart.type),
      isMapLine: isMapLine(props.chart.type),
      isMapBlock: isMapBlock(props.chart.type),
      isTabs: isTabs(props.chart.type),
      isGroup: isGroup(props.chart.type),
      isBlock: isBlock(props.chart.type),
      isSankey: isSankey(props.chart.type),
      isIpBasicInfo: isIpBasicInfo(props.chart.type),
      isIpHostedDomain: isIpHostedDomain(props.chart.type),
      isIpOpenPort: isIpOpenPort(props.chart.type),
      isDomainWhois: isDomainWhois(props.chart.type),
      isDomainDnsRecord: isDomainDnsRecord(props.chart.type),
      isCryptocurrencyEventList: isCryptocurrencyEventList(props.chart.type),
      isAppBasicInfo: isAppBasicInfo(props.chart.type),
      isAppRelatedDomain: isAppRelatedDomain(props.chart.type),
      layout: getLayout(props.chart.type),
      myChart: shallowRef(null),
      myChart2: shallowRef(null) // 个别有两个图表的chart
    }
  },
  unmounted () {
    window.removeEventListener('resize', this.throttle)
  }
}
</script>
