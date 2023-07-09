<template>
  <div>
    <loading :loading="entity.loading" size="small"></loading>
    <div class="graph-list-header">
      <div>
        <div class="graph-list-header-title">
          <i class="cn-icon cn-icon-resolve-ip graph-list-header-icon"></i>
          <span>{{ $t('entities.graph.resolveIp') }}</span>
        </div>
        <div class="graph-list-header-number">
          {{ $t('entity.graph.associatedQuantity') }}:&nbsp;<span>{{entity.count}}</span>
        </div>
      </div>

      <i class="cn-icon cn-icon-close graph-close" @click="closeBlock"></i>
    </div>

    <div class="graph-list-expand-btn-block">
      <div class="graph-list-expand-btn" :class="{ 'graph-list-expand-btn--disabled': expandBtnDisable }" style="display: inline-flex;" @click="expandList">
          <i class="cn-icon cn-icon-expand-continue graph-expand-continue"></i>
        {{ $t('entity.graph.continueToExpand') }}
      </div>
    </div>

    <div>
      <div class="digital-certificate">
        <div class="digital-certificate-header padding-b-16">
          <div class="digital-certificate-header__icon graph-header__icon"></div>
          <div class="graph-list-content-header ">
            {{ $t('entity.graph.expandedEntityQuantity') }}:&nbsp;&nbsp;
            <span>{{ entity.listData ? entity.listData.length : 0 }}</span>
          </div>
        </div>

        <div class="graph-list-content">
          <div v-for="(item, index) in entity.listData" :key="index" @mouseenter="onMouseenter(item)">
            <div class="graph-list-item-ip"><span @click="expandDetail">{{ item.vertex }}</span></div>
            <div class="graph-list-item-block">
              <div class="graph-list-item padding-b-4">
                <div class="graph-list-item-label">{{ $t('overall.location') }}:</div>
                <div class="graph-list-item-value graph-list-item-value1" style="display: flex;align-items: center;">
<!--                  <img :src="require(`../../../../public/images/flag/${item.flag}.svg`)" class="graph-list-country-flag"/>-->
                  <span>{{ $_.get(item.detail, 'location.city', '-') }}</span>
                </div>
              </div>

              <div class="graph-list-item">
                <div class="graph-list-item-label">ASN:</div>
                <div class="graph-list-item-value">{{ $_.get(item.detail, 'asn.asn', '-') }}</div>
              </div>
            </div>

            <div class="graph-list-dividing-line" v-if="index !== entity.listData.length - 1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from '@/components/common/Loading'
export default {
  name: 'IpList',
  props: {
    entity: {
      type: Object
    }
  },
  components: {
    Loading
  },
  computed: {
    expandBtnDisable () {
      return !((this.entity.listData ? this.entity.listData.length : 0) < this.entity.count && this.entity.count > 10 && (this.entity.listData && this.entity.listData.length < 50))
    }
  },
  methods: {
    closeBlock () {
      this.$emit('closeBlock')
    },
    expandDetail () {
      this.$emit('expandDetail', 'ipDetail')
    },
    onMouseenter (val) {
      // 鼠标移动过graph列表名称时，graph图的分支图形会变大一点
      this.$emit('mouseenter', val)
    },
    expandList () {
      // 继续拓展ip列表，传递信息，调用接口
      this.$emit('expandList', this.entity.sourceName, this.entity.nodeId)
    }
  }
}
</script>
