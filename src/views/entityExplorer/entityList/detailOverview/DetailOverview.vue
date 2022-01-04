<template>
  <div class="entity-detail-overview">
    <template v-if="entity.entityType === 'ip'">
      <ip-overview :entity="entity"></ip-overview>
    </template>
    <template v-else-if="entity.entityType === 'domain'">
      <domain-overview :entity="entity"></domain-overview>
    </template>
    <template v-else-if="entity.entityType === 'app'">
      <app-overview :entity="entity"></app-overview>
    </template>
  </div>
</template>

<script>
import App from './App'
import Domain from './Domain'
import Ip from './Ip'

export default {
  /* 详情概览 */
  name: 'DetailOverview',
  props: {
    entity: Object
  },
  components: {
    'domain-overview': Domain,
    'app-overview': App,
    'ip-overview': Ip
  }
}
</script>
