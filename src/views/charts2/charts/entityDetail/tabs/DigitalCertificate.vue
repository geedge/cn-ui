<template>
  <div>
    <chart-error v-if="showError" :content="errorMsg"></chart-error>
    <chart-no-data v-if="isNoData && !showError"></chart-no-data>

    <div v-if="!isNoData && !showError && !loading" class="digital-certificate" :style="{width: moreCertificatesWidth}">
      <div class="digital-certificate-header">
        <div class="digital-certificate-header__icon"></div>
        <div class="digital-certificate-header-name">
          {{ this.$t('entity.detail.relevantCertificates') }}
          <span>（{{ infoList.length }}）</span>
        </div>
      </div>

      <div v-for="item in infoList" :key="item.name" class="margin-t-20">
        <div class="digital-certificate-body">
          <div class="digital-certificate-body-tags">
            <div :class="item.flag === '0' ? 'entity-tag entity-tag--level-two-negative-no-background' : 'entity-tag entity-tag--level-two-positive-no-background'">{{ this.$t(getTrusted(item.flag)) }}</div>
          </div>

          <div class="digital-certificate-body-content">
            <div class="certificate-list-list">
              <div v-for="item1 in item.data" :key="item1.label" class="certificate-list-item">
                <div class="certificate-list-item__label">{{ item1.label }}</div>
                <div v-if="item1.type" :class="'entity-tag entity-tag--small entity-tag--level-one-' + item1.type">{{ item1.value }}</div>
                <div v-else class="certificate-list-item__value">
                  {{ item1.value }}
                  <span v-if="item1.value1" class="certificate-list-item__value1">{{ item1.value1 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
import { api } from '@/utils/api'
import chartMixin from '@/views/charts2/chart-mixin'
import ChartError from '@/components/common/Error'
import ChartNoData from '@/views/charts/charts/ChartNoData'
import { useRoute } from 'vue-router'

export default {
  name: 'DigitalCertificate',
  components: { ChartNoData, ChartError },
  data () {
    return {
      showError: false,
      infoList: [],
      errorMsg: '',
      loading: true // 添加loading，为了避免初始化loading时，标题显示，而在loading结束error出现时标题隐藏，导致闪一下的效果
    }
  },
  mixins: [chartMixin],
  mounted () {
    this.initData()
  },
  setup () {
    const { query } = useRoute()
    const entityType = query.entityType
    const entityName = query.entityName

    return {
      entityType,
      entityName
    }
  },
  computed: {
    // 当多个证书时，宽度会因为边框线条撑大2px，导致滚动条与边框重叠影响观感
    moreCertificatesWidth () {
      let width = '100%'
      if (this.infoList.length > 1) {
        width = 'calc(100% - 2px)'
      }
      return width
    }
  },
  methods: {
    initData () {
      // 入参不明确
      const params = {
        type: this.entityType, // 实体类型
        name: this.entityName // 实体名称
      }

      this.loading = true
      this.toggleLoading(true)
      // todo 接口、数据不明确，故没有模拟mock数据，后续此处需修改
      axios.get(api.entity.performanceEvent, { params: params }).then(response => {
        const res = response.data

        if (response.status === 200) {
          this.isNoData = res.data.result.length === 0
          this.showError = false
          if (!this.isNoData) {
            // const data = res.data.result

            this.infoList = [
              {
                name: '[SHA1]4ad21f8b6f10a8734f2cbcaf18f88971c59d692e',
                flag: '0', // 0证书不可信，1证书可信
                data: [
                  { label: this.$t('entity.detail.certificateThumbprint'), value: '[SHA1]4ad21f8b6f10a8734f2cbcaf18f88971c59d692e' },
                  { label: this.$t('entity.detail.expirationTime'), value: '2029-06-02 03:14:19' },
                  { label: this.$t('entity.detail.IssueTime'), value: '2023-06-02 03:14:19' },
                  { label: this.$t('entity.detail.userName'), value: 'SSL Certificate' },
                  { label: this.$t('entity.detail.state'), value: '未过期', type: 'positive' },
                  { label: this.$t('entity.detail.userOrganization'), value: 'My Company' },
                  { label: this.$t('entity.detail.userCountryOrRegion'), value: 'SA My State My City' },
                  { label: this.$t('entity.detail.issuerCountryOrRegion'), value: 'SA My State My City' },
                  { label: this.$t('entity.detail.issuerName'), value: 'SSL Certificate' },
                  { label: this.$t('entity.detail.serialNumber'), value: '6297ba8b' },
                  { label: this.$t('entity.detail.issuerOrganization'), value: 'My Company' },
                  { label: this.$t('entity.detail.authorizedDomain'), value: 'baidu.com' },
                  { label: this.$t('entity.detail.use'), value: 'SSL clientSSL serverlNetscape SSL serverlS/MIME signing S/MIME encryption CRL signing Any Purpose Any Purpose CAOCSP helper' }
                ]
              },
              {
                name: '[SHA1234]4ad21f8b6f10a8734f2cbcaf18f88971c59d692e',
                flag: '1', // 0证书不可信，1证书可信
                data: [
                  { label: this.$t('entity.detail.certificateThumbprint'), value: '[SHA1234]4ad21f8b6f10a8734f2cbcaf18f88971c59d692e' },
                  { label: this.$t('entity.detail.expirationTime'), value: '2029-06-02 03:14:19' },
                  { label: this.$t('entity.detail.IssueTime'), value: '2023-06-02 03:14:19' },
                  { label: this.$t('entity.detail.userName'), value: 'SSL Certificate' },
                  { label: this.$t('entity.detail.state'), value: '已过期', type: 'negative' },
                  { label: this.$t('entity.detail.userOrganization'), value: 'My Company' },
                  { label: this.$t('entity.detail.userCountryOrRegion'), value: 'SA My State My City' },
                  { label: this.$t('entity.detail.issuerCountryOrRegion'), value: 'SA My State My City' },
                  { label: this.$t('entity.detail.issuerName'), value: 'SSL Certificate' },
                  { label: this.$t('entity.detail.serialNumber'), value: '6297ba8b' },
                  { label: this.$t('entity.detail.issuerOrganization'), value: 'My Company' },
                  { label: this.$t('entity.detail.authorizedDomain'), value: 'baidu.com' },
                  { label: this.$t('entity.detail.use'), value: 'SSL clientSSL serverlNetscape SSL serverlS/MIME signing S/MIME encryption CRL signing Any Purpose Any Purpose CAOCSP helper' }
                ]
              }
            ]

            // 将证书指纹截取两部分，后段添加下划线，用for循环方便用break终止循环
            for (let i = 0; i < this.infoList.length; i++) {
              for (let j = 0; j < this.infoList[i].data.length; j++) {
                const item = this.infoList[i].data[j]
                if (j === 0) {
                  const str = item.value
                  item.value = str.substring(0, str.indexOf(']') + 1)
                  item.value1 = str.substring(str.indexOf(']') + 1)
                  break
                }
              }
            }
          }
        } else {
          this.httpError(res)
        }
      }).catch(e => {
        console.error(e)
        this.httpError(e)
      }).finally(() => {
        this.loading = false
        this.toggleLoading(false)
      })
    },
    /** 判断证书是否可信，后续根据实际字段进行取舍 */
    getTrusted (flag) {
      switch (flag) {
        case '0': {
          return 'entity.detail.certificateIsNotTrusted'
        }
        case '1': {
          return 'entity.detail.certificateIsTrusted'
        }
      }
    },
    httpError (e) {
      this.isNoData = false
      this.showError = true
      this.errorMsg = this.errorMsgHandler(e)
    }
  }
}
</script>
