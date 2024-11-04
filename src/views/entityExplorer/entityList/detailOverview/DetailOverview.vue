<template>
  <div class="entity-detail-overview">
    <template v-if="entity.entityType === 'ip'">
      <ip-overview :entity="entity" :time-filter="timeFilter" :keywordList="keywordList" @reloadEntity="getEntity" @eventNum="getEventNum"></ip-overview>
    </template>
    <template v-else-if="entity.entityType === 'domain'">
      <domain-overview :entity="entity" :time-filter="timeFilter" :keywordList="keywordList" @reloadEntity="getEntity" @eventNum="getEventNum"></domain-overview>
    </template>
    <template v-else-if="entity.entityType === 'app'">
      <app-overview :entity="entity" :time-filter="timeFilter" :keywordList="keywordList" @reloadEntity="getEntity" @eventNum="getEventNum"></app-overview>
    </template>
    <template v-else-if="entity.entityType === 'subscriber_id'">
      <subscriber-overview :entity="entity" :time-filter="timeFilter" :keywordList="keywordList" @reloadEntity="getEntity" @eventNum="getEventNum"></subscriber-overview>
    </template>
  </div>
</template>

<script>
import App from './App'
import Domain from './Domain'
import Ip from './Ip'
import Subscriber from './Subscriber'

export default {
  /* 详情概览 */
  name: 'DetailOverview',
  props: {
    entity: Object,
    timeFilter: Object,
    keywordList: Array
  },
  components: {
    'domain-overview': Domain,
    'app-overview': App,
    'ip-overview': Ip,
    'subscriber-overview': Subscriber
  },
  methods: {
    getEntity (data) {
      this.$emit('reloadEntity', data)
    },
    getEventNum (data) {
      this.$emit('eventNum', data)
    }
  }
}
</script>
