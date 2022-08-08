<template>
  <div class="npm-app-event">
    <div class="metric-select" >
      <el-select v-model="metric"
                 class="option__select select-column"
                 popper-class="option-popper metric-select"
                 :popper-append-to-body="false"
                 key="tabMetric"
                 @change="changeMetric"
                 size="mini"
                 width="100">
        <el-option
                v-for="item in options"
                :key="item.label"
                :label="item.label"
                :value="item.value"
        />
      </el-select>
      <span>{{$t('network.metric')}}：</span>
    </div>
    <el-table
            :id="`tabTable_${index}`"
            :ref="`dataTable_${index}`"
            :data="tableData"
            class="npm-app-event-table"
            height="100%"
    >
      <template v-for="(item, index) in customTableTitles" :key="index">
        <el-table-column class="data-column">
          <template #header>
            <span class="data-column__span">{{$t(item.label)}}</span>
          </template>
          <template  #default="scope" :column="item">
            <div class="data-app-event-table">
              <template v-if="item.prop === 'applications'">
                <span class="data-applications">{{$t(scope.row[item.prop])}}</span>
              </template>
              <template v-else-if="item.prop === 'severity'">
                <template v-if="scope.row[item.prop]==='Critical'">
                  <div v-for="item in 5" class="red-dot"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='High'">
                  <div v-for="item in 4" class="red-dot"></div>
                  <div class="grey-dot"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='Medium'">
                  <div v-for="item in 3" class="red-dot"></div>
                  <div v-for="item in 2" class="grey-dot"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='Low'">
                  <div v-for="item in 2" class="red-dot"></div>
                  <div v-for="item in 3" class="grey-dot"></div>
                </template>
                <template v-else-if="scope.row[item.prop]==='Info'">
                  <div v-for="item in 1" class="red-dot"></div>
                  <div v-for="item in 4" class="grey-dot"></div>
                </template>
                <span class="data-severity" >{{$t(scope.row[item.prop])}}</span>
              </template>
              <template v-else-if="item.prop === 'eventType'">
                <span class="data-eventType" v-for="type in scope.row[item.prop]">{{type}}</span>
              </template>
              <template v-else-if="item.prop === 'eventCount'">
                <span class="data-eventCount">{{scope.row[item.prop]}}</span>
              </template>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'NpmAppEventTable',
  data () {
    return {
      metric: 'Application',
      options: [
        {
          value: 'Application',
          label: 'Application'
        },
        {
          value: 'Provider',
          label: 'Provider'
        }
      ],
      dotList: ['grey-dot', 'grey-dot', 'grey-dot', 'grey-dot', 'grey-dot'],
      tableData: [
        {
          applications: 'Critical',
          severity: 'Critical',
          eventCount: 8,
          eventType: ['dns error', 'http error', 'high dns response time']
        }, {
          applications: 'High',
          severity: 'High',
          eventCount: 8,
          eventType: ['dns error']
        }, {
          applications: 'Critical',
          severity: 'Critical',
          eventCount: 8,
          eventType: ['dns error', 'high dns response time']
        }, {
          applications: 'Medium',
          severity: 'Medium',
          eventCount: 8,
          eventType: ['dns error', 'http error', 'high dns response time']
        }, {
          applications: 'Low',
          severity: 'Low',
          eventCount: 8,
          eventType: ['http error', 'high dns response time']
        }, {
          applications: 'Info',
          severity: 'Info',
          eventCount: 8,
          eventType: ['dns error', 'high dns response time']
        }, {
          applications: 'Critical',
          severity: 'Critical',
          eventCount: 8,
          eventType: ['dns error', 'http error']
        }, {
          applications: 'Critical',
          severity: 'Critical',
          eventCount: 8,
          eventType: ['dns error', 'http error', 'high dns response time']
        }
      ],
      customTableTitles: [
        { label: 'network.applications', prop: 'applications' },
        { label: 'network.severity', prop: 'severity' },
        { label: 'network.eventType', prop: 'eventType' },
        { label: 'network.eventCount', prop: 'eventCount' }
      ]
    }
  },
  computed: {
  }
}
</script>
