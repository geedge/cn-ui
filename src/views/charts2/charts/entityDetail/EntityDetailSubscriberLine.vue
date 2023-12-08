<template>
  <div class="entity-detail-line entity-detail-line--subscriber">
    <el-tabs v-model="lineOuterTab" class="cn-chart__tabs" @tab-click="switchOuterTab">
      <el-tab-pane name="serviceName" class="tab-pane" :label="$t('subscriber.serviceName')">
        <service-name
            v-if="lineOuterTab === 'serviceName'"
            :chart="chart"
            :entity="entity"
            @toggleLoading="toggleLoading"
        ></service-name>
      </el-tab-pane>
      <el-tab-pane name="app" class="tab-pane" label="APP">
        <app
            v-if="lineOuterTab === 'app'"
            :chart="chart"
            :entity="entity"
            @toggleLoading="toggleLoading"
        ></app>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ServiceName from '@/views/charts2/charts/entityDetail/lines/ServiceName'
import App from '@/views/charts2/charts/entityDetail/lines/App'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { overwriteUrl, urlParamsHandler } from '@/utils/tools'

export default {
  name: 'EntityDetailLine',
  components: {
    ServiceName,
    App
  },
  props: {
    chart: Object,
    entity: Object
  },
  methods: {
    switchOuterTab (tab) {
      const { query } = this.$route
      const newUrl = urlParamsHandler(window.location.href, query, {
        lineOuterTab: tab.paneName
      })
      overwriteUrl(newUrl)
    },
    toggleLoading (loading) {
      this.$emit('toggleLoading', loading)
    }
  },
  setup () {
    const { query } = useRoute()
    const lineOuterTab = ref(query.lineOuterTab || 'serviceName')
    return {
      lineOuterTab
    }
  }
}
</script>
