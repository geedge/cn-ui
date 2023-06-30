<template>
  <div>
    <div class="graph-list-header">
      <div>
        <div class="graph-list-header-title">
          <i class="graph-list-header-icon" :class="entityIcon"></i>
          <span>{{ $t(entityName) }}</span>
        </div>
        <div class="graph-list-header-number" style="margin-bottom: 24px">
          {{ $t('entity.graph.associatedQuantity') }}：<span>2</span>
        </div>
      </div>

      <i class="cn-icon cn-icon-close graph-close" @click="closeBlock"></i>
    </div>

    <div>
      <div class="digital-certificate">
        <div class="digital-certificate-header padding-b-12">
          <div class="digital-certificate-header__icon graph-header__icon"></div>
          <div class="graph-list-content-header ">
            {{ $t('entity.graph.expandedEntityQuantity') }}:&nbsp;&nbsp;
            <span>{{ cardData.length }}</span>
          </div>
        </div>

        <div class="graph-list-content">
          <div v-for="(item, index) in cardData" :key="index" @mouseenter="onMouseenter(item)">
            <div class="graph-list-item-ip" @click="expandDetail">{{ item.name }}</div>
            <div class="graph-list-item-block">
              <div v-for="card in item.data" :key="card.name">
                <div class="graph-list-item__app">
                  <div class="graph-list-item-label__app">{{ card.label }}:</div>
                  <div class="graph-list-item-value">{{ card.value }}</div>
                </div>
              </div>
            </div>

            <div class="graph-list-dividing-line" v-if="index !== cardData.length - 1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n'
import { ref } from 'vue'

export default {
  name: 'AppOrDomainList',
  props: {
    entity: {
      type: Object
    }
  },
  data () {
    return {
    }
  },
  mounted () {
    this.initData()
  },
  setup (props) {
    const cardData = ref([]) // 列表数据
    const entityIcon = ref('') // 顶部icon
    const entityName = ref('') // 顶部名称，非实体名

    switch (props.entity.entityType) {
      case 'app': {
        entityIcon.value = 'cn-icon cn-icon-app-name'
        entityName.value = 'entities.tab.relatedApp'

        cardData.value = [
          {
            name: 'Wechat',
            data: [
              { name: 'appId', label: i18n.global.t('entities.domainDetail.appid'), value: '2376' },
              { name: 'appCategory', label: i18n.global.t('entities.category'), value: 'Sensitive' },
              { name: 'appSubcategory', label: i18n.global.t('entities.subcategory'), value: 'Parked Domain' },
              { name: 'appRisk', label: i18n.global.t('entities.riskLevel'), value: 'Moderate Risk' },
              { name: 'appDescription', label: i18n.global.t('config.dataSource.description'), value: 'Wechat is a Chinese multinational networking and services company.' }
            ]
          },
          {
            name: 'Wechat',
            data: [
              { name: 'appId', label: i18n.global.t('entities.domainDetail.appid'), value: '2376' },
              { name: 'appCategory', label: i18n.global.t('entities.category'), value: 'Sensitive' },
              { name: 'appSubcategory', label: i18n.global.t('entities.subcategory'), value: 'Parked Domain' },
              { name: 'appRisk', label: i18n.global.t('entities.riskLevel'), value: 'Moderate Risk' },
              { name: 'appDescription', label: i18n.global.t('config.dataSource.description'), value: 'Wechat is a Chinese multinational networking and services company.' }
            ]
          }
        ]
        break
      }
      case 'domain': {
        entityIcon.value = 'cn-icon cn-icon-subdomain'
        entityName.value = 'entities.subdomain'

        cardData.value = [
          {
            name: '-*.webproxy.at.1.baidu.com',
            data: [
              { name: 'categoryName', label: i18n.global.t('entities.category'), value: 'Business and Economy' },
              { name: 'categoryGroup', label: i18n.global.t('entities.group'), value: 'Productivity' },
              { name: 'registration', label: i18n.global.t('entities.registration'), value: 'China' },
              { name: 'registrantOrg', label: i18n.global.t('entities.registry'), value: 'Beijing Baidu Netcom Science Technology Co, Ltd' },
              { name: 'icpLicense', label: i18n.global.t('entities.icpLicense'), value: '京ICP备24537号' }
            ]
          },
          {
            name: '-*.webproxy.at.1.baidu.com',
            data: [
              { name: 'categoryName', label: i18n.global.t('entities.category'), value: 'Business and Economy' },
              { name: 'categoryGroup', label: i18n.global.t('entities.group'), value: 'Productivity' },
              { name: 'registration', label: i18n.global.t('entities.registration'), value: 'China' },
              { name: 'registrantOrg', label: i18n.global.t('entities.registry'), value: 'Beijing Baidu Netcom Science Technology Co, Ltd' },
              { name: 'icpLicense', label: i18n.global.t('entities.icpLicense'), value: '京ICP备24537号' }
            ]
          }
        ]
        break
      }
    }

    return {
      entityIcon,
      entityName,
      cardData
    }
  },
  methods: {
    initData () {
      // 此处请求接口
    },
    closeBlock () {
      this.$emit('closeBlock')
    },
    expandDetail () {
      if (this.entity.entityType === 'app') {
        this.$emit('expandDetail', 'appDetail')
      } else if (this.entity.entityType === 'domain') {
        this.$emit('expandDetail', 'domainDetail')
      }
    },
    onMouseenter (val) {
      // 鼠标移动过graph列表名称时，graph图的分支图形会变大一点
      this.$emit('mouseenter', val)
    }
  }
}
</script>
