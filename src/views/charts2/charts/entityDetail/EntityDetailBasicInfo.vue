<template>
  <div class="entity-detail-basic-info">
    <div class="entity-type">{{entityType[entity.entityType]}}</div>
    <div class="entity-basic-info">
      <div class="entity-basic-info__name">
        <span id="entityName">{{entity.entityName}}</span>
        <div @click="copyEntityName"><i class="cn-icon cn-icon-copy"></i></div>
      </div>
      <el-popover
          placement="bottom-end"
          :width="390"
          trigger="click"
          popper-class="analysis-popper"
          @show="analysisPopSwitch(true)"
          @hide="analysisPopSwitch(false)"
      >
        <template #reference>
          <div class="analysis-btn" :class="{'analysis-btn--active': analysisPopShow}"><i class="cn-icon cn-icon-analysis"></i>{{$t('overall.analysis')}}</div>
        </template>
        <div class="analysis-entry">
          <div class="analysis-entry__header">{{$t('entities.fastEntry')}}</div>
          <div class="analysis-entry__body">
            <div class="analysis-entry-item" v-for="item in analysisItems" :key="item.label" @click="jump(item.url)">
              <div>
                <i :class="item.icon"></i>
              </div>
              <span>{{item.label}}</span>
            </div>
          </div>
        </div>
      </el-popover>
    </div>
    <div class="entity-tags">
      <div v-for="tag in levelTwoTags" :key="tag.value" class="entity-tag" :class="`entity-tag--level-two-${tag.type}`">{{tag.value}}</div>
    </div>
<!--    分割线-->
    <div class="dividing-line"></div>
    <div class="entity-detail-info">
      <div class="detail-card" v-for="card in detailCards" :key="card.name">
        <i :class="card.icon"></i>
        <div class="detail-card__text">
          <div class="detail-card__label">{{card.label}}:</div>
          <div class="detail-card__value" :title="card.value">{{card.value}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.theme-light .el-popper.analysis-popper {
  top: -5px !important;
  padding: 0;
  border: 1px solid #C5C5C5;
  border-radius: 4px;
  box-shadow: -1px 1px 10px -1px rgba(205,205,205,0.85);

  .el-popper__arrow {
    display: none;
  }
  .analysis-entry {
    display: flex;
    flex-direction: column;

    .analysis-entry__header {
      height: 42px;
      line-height: 42px;
      background-color: #F7F7F7;
      padding-left: 20px;
      color: #353636;
      border-radius: 4px 4px 0 0;
    }
    .analysis-entry__body {
      display: flex;
      height: 134px;
      align-items: center;
      justify-content: space-around;

      .analysis-entry-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

        &:hover {
          div i, span {
            color: #046ECA;
          }
        }
        div {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 9px;
          height: 46px;
          width: 46px;
          border-radius: 50%;
          background-color: #F5F6F8;

          i {
            color: #353636;
            font-size: 22px;
          }
        }
        span {
          font-size: 12px;
          color: #353636;
        }
      }
    }
  }
}
.entity-detail-basic-info {
  position: relative;
  padding: 35px 30px 0 30px;
  height: 100%;
  border: 1px solid #E2E5EC;
  border-radius: 4px;

  .dividing-line {
    position: absolute;
    top: 159px;
    left: 30px;
    height: 1px;
    width: calc(100% - 60px);
    background-color: #EFF2F5;
  }
  .entity-type {
    color: #717171;
  }
  .entity-basic-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .entity-basic-info__name {
      display: flex;
      align-items: center;

      span {
        padding-right: 12px;
        font-family: Helvetica-Bold;
        font-size: 32px;
        color: #353636;
        font-weight: bold;
      }
      div {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 28px;
        width: 28px;
        border-radius: 50%;
        background-color: #EFF1F4;
        cursor: pointer;

        i {
          color: #717171;
          font-size: 12px;
        }
      }
    }
    .analysis-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      padding: 0 10px;
      font-size: 12px;
      color: #046ECA;
      cursor: pointer;
      background-color: #FFF;
      transition: background-color linear .2s;

      &.analysis-btn--active {
        background-color: #EBF7FA;
        border-radius: 2px;
      }
      i {
        padding-right: 4px;
        font-size: 14px;
      }
    }
  }
  .entity-tags {
    display: flex;
    align-items: center;
    height: 60px;

    .entity-tag {
      margin-right: 10px;

      &:last-of-type {
        margin-right: 0;
      }
    }
  }
  .entity-detail-info {
    display: flex;
    flex-flow: row wrap;
    align-content: space-around;
    margin-top: 5px;

    .detail-card {
      display: flex;
      padding: 0 12px;
      width: 298px;
      height: 83px;
      align-items: center;

      i {
        font-size: 22px;
        color: #353636;
        margin-right: 14px;
      }
      .detail-card__text {
        .detail-card__label {
          margin-bottom: 6px;
          font-size: 12px;
          color: #717171;
        }
        .detail-card__value {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          color: #222;
          line-height: 18px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
<script>
import chartMixin from '@/views/charts2/chart-mixin'
import { drillDownPanelTypeMapping, entityType } from '@/utils/constants'
import { selectElementText, copySelectionText } from '@/utils/tools'
import { ref } from 'vue'
import i18n from '@/i18n'
import { useRouter } from 'vue-router'
import _ from 'lodash'

export default {
  name: 'EntityDetailBasicInfo',
  mixins: [chartMixin],
  mounted () {
    this.toggleLoading(false)
  },
  data () {
    return {
      // type: positive 正面的，绿色；normal 灰色；negative 负面的，红色
      levelTwoTags: [{ value: '安全', type: 'positive' }, { value: '工具', type: 'normal' }, { value: '恶意IP', type: 'negative' }],
      analysisPopShow: false
    }
  },
  methods: {
    copyEntityName () {
      selectElementText(document.getElementById('entityName'))
      if (copySelectionText()) {
        this.$message.success(this.$t('tip.copySuccess'))
      } else {
        this.$message.error('Unknown error')
      }
    },
    analysisPopSwitch (show) {
      this.analysisPopShow = show
    },
    jump (url) {
      window.open(url, '_blank')
    }
  },
  setup (props) {
    const analysisItems = ref([])

    // 生成url
    const resolvePath = (router) => {
      const { href } = useRouter().resolve(router)
      return href
    }
    // 右上角analysis按钮
    switch (props.entity.entityType) {
      default: {
        analysisItems.value.push({
          icon: 'cn-icon cn-icon-overview',
          label: i18n.global.t('networkOverview.networkOverview'),
          url: resolvePath({
            path: '/panel/networkOverview',
            query: {
              queryCondition: `common_client_ip='${props.entity.entityName}' OR common_server_ip='${props.entity.entityName}'`,
              panelName: props.entity.entityName,
              thirdMenu: 'network.ips',
              dimensionType: 'ip',
              fourthMenu: props.entity.entityName,
              thirdPanel: drillDownPanelTypeMapping.networkOverview,
              fourthPanel: drillDownPanelTypeMapping.networkOverview
            }
          })
        })
        analysisItems.value.push({
          icon: 'cn-icon cn-icon-network-performance',
          label: i18n.global.t('entities.networkPerformance'),
          url: resolvePath({
            path: '/panel/networkAppPerformance',
            query: {
              queryCondition: `common_client_ip='${props.entity.entityName}' OR common_server_ip='${props.entity.entityName}'`,
              panelName: props.entity.entityName,
              thirdMenu: 'network.ips',
              dimensionType: 'ip',
              fourthMenu: props.entity.entityName,
              thirdPanel: drillDownPanelTypeMapping.npmThirdMenu,
              fourthPanel: drillDownPanelTypeMapping.npmOverviewIp
            }
          })
        })
        analysisItems.value.push({
          icon: 'cn-icon cn-icon-dns-insight',
          label: i18n.global.t('dns.dnsInsights'),
          url: resolvePath({
            path: '/panel/dnsServiceInsights',
            query: {
              queryCondition: `common_client_ip='${props.entity.entityName}' OR common_server_ip='${props.entity.entityName}'`,
              panelName: props.entity.entityName,
              thirdMenu: 'dns.dnsServer',
              dimensionType: 'dnsServer',
              fourthMenu: props.entity.entityName,
              thirdPanel: drillDownPanelTypeMapping.dnsThirdMenu,
              fourthPanel: drillDownPanelTypeMapping.dnsFourthMenu
            }
          })
        })
      }
    }
    // 底部各属性
    const detailCards = ref([])
    switch (props.entity.entityType) {
      case 'ip': {
        detailCards.value = _.concat(detailCards.value,
          { icon: 'cn-icon cn-icon-as', name: 'asNumber', label: i18n.global.t('entities.asNumber'), value: 'aaaaaaaaaaaa' },
          { icon: 'cn-icon cn-icon-registration-agency', name: 'asOrg', label: i18n.global.t('entities.asOrg'), value: 'this is agency a that word indispensable' },
          { icon: 'cn-icon cn-icon-as-subnet', name: 'asSubnet', label: i18n.global.t('entities.asSubnet'), value: 'bbbaee' },
          { icon: 'cn-icon cn-icon-operator', name: 'isp', label: 'ISP', value: 'aerae343331' },
          { icon: 'cn-icon cn-icon-geo-location', name: 'location', label: i18n.global.t('entities.geographicLocation'), value: '你好啊' },
          { icon: 'cn-icon cn-icon-dns-ptr', name: 'dnsPtr', label: 'DNS PTR', value: '-' }
        )
        break
      }
      case 'domain': {
        detailCards.value = _.concat(detailCards.value,
          { icon: 'cn-icon cn-icon-category2', name: 'category', label: i18n.global.t('entities.category'), value: 'category' },
          { icon: 'cn-icon cn-icon-sub-type', name: 'subcategory', label: i18n.global.t('entities.subcategory'), value: 'this is a long long long long long subcategory' },
          { icon: 'cn-icon cn-icon-credit-rating', name: 'creditLevel', label: i18n.global.t('entities.creditLevel2'), value: 'a value of credit level' },
          { icon: 'cn-icon cn-icon-expire-date', name: 'expirationDate', label: i18n.global.t('entities.expirationDate2'), value: '2022-02-22 22:22:22' },
          { icon: 'cn-icon cn-icon-registrar', name: 'registrar', label: i18n.global.t('entities.registrar'), value: 'XX注册商' },
          { icon: 'cn-icon cn-icon-registration-agency', name: 'registry', label: i18n.global.t('entities.registry'), value: 'XX注册机构' },
          { icon: 'cn-icon cn-icon-registration-country', name: 'country', label: i18n.global.t('entities.registrationCountry'), value: 'China' },
          { icon: 'cn-icon cn-icon-registration-date', name: 'registrationDate', label: i18n.global.t('entities.registrationDate'), value: '2011-11-11 11:11:11' },
          { icon: 'cn-icon cn-icon-registry-email', name: 'registryEmail', label: i18n.global.t('entities.registryEmail'), value: '注册机构邮箱' }
        )
        break
      }
      case 'app': {
        detailCards.value = _.concat(detailCards.value,
          { icon: 'cn-icon cn-icon-category2', name: 'category', label: i18n.global.t('entities.category'), value: 'category' },
          { icon: 'cn-icon cn-icon-sub-type', name: 'subcategory', label: i18n.global.t('entities.subcategory'), value: 'this is a long long long long long subcategory' },
          { icon: 'cn-icon cn-icon-credit-rating', name: 'creditLevel', label: i18n.global.t('entities.creditLevel2'), value: 'a value of credit level' },
          { icon: 'cn-icon cn-icon-technology', name: 'technology', label: i18n.global.t('overall.technology'), value: 'xx技术' },
          { icon: 'cn-icon cn-icon-app-name', name: 'name', label: i18n.global.t('overall.appName2'), value: 'APP的名称' },
          { icon: 'cn-icon cn-icon-app-full-name', name: 'fullName', label: i18n.global.t('overall.appFullName'), value: 'APP的全称' },
          { icon: 'cn-icon cn-icon-description', name: 'description', label: i18n.global.t('config.dataSource.description'), value: 'A domain registry is an organization responsible for managing the top-level domain (TLD), such as .com, .net, .org, and more, for any given domain name. Domain registries can act as a database of available domains and work with registrars, such as DomainRegistry.com, to purchase a domain.' }
        )
      }
    }
    return {
      entityType,
      analysisItems,
      detailCards
    }
  }
}
</script>
