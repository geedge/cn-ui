<template>
  <div class="type-data__column">
    <div class="type-data">
      <div class="type-title">
        <span class="title-mark" ></span>{{ $t('entities.tab.currentDevelopmentPortsAndServices') }}&nbsp;&nbsp;(5)</div>
      <div class="type-content">
        <div v-for="openPort in openPortList" class="data-item">{{openPort}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OpenPort',
  props: {
  },
  data () {
    return {
      openPortList: []
    }
  },
  mounted () {
    this.openPortList = ['11/rpcbind', '22/rpcbind', '231/zmpt', '22/rpcbind', '231/zmpt']
  }
}
</script>
