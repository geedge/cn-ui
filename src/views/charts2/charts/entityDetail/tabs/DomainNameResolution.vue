<template>
  <div class="type-data__column">
    <div class="type-data">
      <div class="type-title">
        <span class="title-mark" ></span>{{ $t('entities.tab.relatedApp') }}&nbsp;&nbsp;({{relatedAppList.length}})</div>
      <div class="type-content">
        <div v-for="app in relatedAppList" class="data-item">{{app}}</div>
      </div>
    </div>
    <div class="type-data">
      <div class="type-title">
        <span class="title-mark" ></span>{{ $t('entities.tab.relatedIp') }}&nbsp;&nbsp;({{relatedIpList.length}})</div>
      <div class="type-content">
        <div v-for="ip in relatedIpList" class="data-item">{{ip}}</div>
      </div>
    </div>
    <div class="type-data">
      <div class="type-title">
        <span class="title-mark" ></span>{{ $t('entities.tab.relatedDomain') }}&nbsp;&nbsp;({{relatedDomainList.length}})</div>
      <div class="type-content">
        <div v-for="domain in relatedDomainList"  class="data-item">{{domain}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DomainNameResolution',
  props: {
  },
  data () {
    return {
      relatedAppList: [],
      relatedIpList: [],
      relatedDomainList: []
    }
  },
  mounted () {
    this.relatedAppList = ['Wechat', 'baidu', 'Wechat', 'baidu', 'Wechat', 'baidu', 'Wechat']
    this.relatedIpList = ['116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242', '116.178.70.242']
    this.relatedDomainList = ['-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com', '-*.pangolin-sdk-toutiao.com']
  }
}
</script>
