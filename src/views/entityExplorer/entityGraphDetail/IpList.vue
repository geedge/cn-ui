<template>
  <div>
    <div class="graph-list-header">
      <div>
        <div class="graph-list-header-title">
          <i class="cn-icon cn-icon-resolve-ip graph-list-header-icon"></i>
          <span>{{ $t('entities.graph.resolveIp') }}</span>
        </div>
        <div class="graph-list-header-number">
          {{ $t('entity.graph.associatedQuantity') }}：<span>12</span>
        </div>
      </div>

      <i class="cn-icon cn-icon-close graph-close" @click="closeBlock"></i>
    </div>

    <div class="graph-list-expand-btn-block">
      <el-button type="primary" class="graph-list-expand-btn">
        <span>
          <i class="cn-icon cn-icon-expand-continue graph-expand-continue"></i>
          {{ $t('entity.graph.continueToExpand') }}
        </span>
      </el-button>
    </div>

    <div>
      <div class="digital-certificate">
        <div class="digital-certificate-header padding-b-20">
          <div class="digital-certificate-header__icon graph-header__icon"></div>
          <div class="graph-list-content-header ">
            {{ $t('entity.graph.expandedEntityQuantity') }}:&nbsp;&nbsp;
            <span>{{ ipList.length }}</span>
          </div>
        </div>

        <div class="graph-list-content">
          <div v-for="(item, index) in ipList" :key="index" @mouseenter="onMouseenter(item)">
            <div class="graph-list-item-ip"><span @click="expandDetail">{{ item.ip }}</span></div>
            <div class="graph-list-item-block">
              <div class="graph-list-item padding-b-10">
                <div class="graph-list-item-label">{{ $t('overall.location') }}:</div>
                <div class="graph-list-item-value graph-list-item-value1">
                  <img :src="require(`../../../../public/images/flag/${item.flag}.svg`)" class="graph-list-country-flag"/>
                  <span>{{ item.city }}</span>
                </div>
              </div>

              <div class="graph-list-item">
                <div class="graph-list-item-label">ASN:</div>
                <div class="graph-list-item-value">{{ item.asn }}</div>
              </div>
            </div>

            <div class="graph-list-dividing-line" v-if="index !== ipList.length - 1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IpList',
  data () {
    return {
      ipList: [
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' },
        { ip: '192.168.22.11', flag: '011-china', city: 'China, Beijing', asn: 'Sensitive' }
      ]
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
    }
  }
}
</script>

<style lang="scss">

</style>
