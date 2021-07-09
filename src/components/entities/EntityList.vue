<template>
  <div class="entity-list">
    <div class="entity-list__content">
      <div class="cn-entity" v-for="d in listData" :key="d.id">
        <div class="cn-entity__header">
          <div class="header__icon" :style="{backgroundColor: circleColor}"><i :class="iconClass"></i></div>
          <div class="header__content">
            <div class="content__title">
              <template v-if="entityType === 'ip'">{{d.ip || 'Unknown'}}</template>
              <template v-else-if="entityType === 'domain'">{{d.domainName || 'Unknown'}}</template>
              <template v-else-if="entityType === 'app'">{{d.appName || 'Unknown'}}</template>
            </div>
            <div class="content__desc" v-if="entityType !== 'ip'">
              <template v-if="entityType === 'domain'">
                <span class="desc__label">{{$t('entities.reputationLevel')}}:</span>
                <span>{{d.reputationLevel || '-'}}</span>
              </template>
              <template v-else-if="entityType === 'app'">
                <span class="desc__label">{{$t('entities.risk')}}:</span>
                <span>{{d.appRisk || '-'}}</span>
              </template>
            </div>
          </div>
        </div>
        <div class="cn-entity__body"></div>
      </div>
    </div>
    <div class="entity-list__pagination"></div>
  </div>
</template>

<script>
export default {
  name: 'EntityList',
  props: {
    listData: Array,
    entityType: String
  },
  computed: {
    circleColor () {
      let color
      switch (this.entityType) {
        case ('ip'): {
          color = '#E8FBF9'
          break
        }
        case ('domain'): {
          color = '#EEF6FE'
          break
        }
        case ('app'): {
          color = '#FEF7E7'
          break
        }
        default: break
      }
      return color
    },
    iconClass () {
      let className
      switch (this.entityType) {
        case ('ip'): {
          className = 'cn-icon cn-icon-ip ip-green'
          break
        }
        case ('domain'): {
          className = 'cn-icon cn-icon-domain domain-blue'
          break
        }
        case ('app'): {
          className = 'cn-icon cn-icon-app app-orange'
          break
        }
        default: break
      }
      return className
    }
  }
}
</script>

<style>
</style>
