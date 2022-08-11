<template>
  <div class="npm-recent">
    <div class="npm-recent-title">{{ $t('network.recentEvents') }}</div>
    <el-table
        :id="`tabTable_${index}`"
        :ref="`dataTable_${index}`"
        :data="tableData"
        class="npm-recent-table"
        height="100%"
    >
      <template v-for="(item, index) in customTableTitles" :key="index">
        <el-table-column class="data-column">
          <template #header>
            <span class="data-column__span">{{$t(item.label)}}</span>
          </template>
          <template  #default="scope" :column="item">
            <div class="data-recent-table">
              <template v-if="item.prop === 'severity'">
                <span class="data-recent-table-severity" :class="iconClass(scope.row)">{{$t(scope.row[item.prop])}}</span>
              </template>
              <template v-else-if="item.prop === 'entity'">
                <span class="data-recent-table-entity">{{$t(scope.row[item.prop])}}</span>
              </template>
              <template v-else-if="item.prop === 'eventType'">
                <span class="data-recent-table-eventType">{{$t(scope.row[item.prop])}}</span>
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
  name: 'NpmRecentEvents',
  data () {
    return {
      tableData: [
        {
          severity: 'Critical',
          entity: 'command adn control',
          eventType: 'dns error'
        }, {
          severity: 'High',
          entity: 'command adn control',
          eventType: 'dns error'
        }, {
          severity: 'Critical',
          entity: 'command adn control',
          eventType: 'dns error'
        }, {
          severity: 'Medium',
          entity: 'command adn control',
          eventType: 'dns error'
        }, {
          severity: 'Low',
          entity: 'command adn control',
          eventType: 'dns error'
        }, {
          severity: 'Info',
          entity: 'command adn control',
          eventType: 'dns error'
        }, {
          severity: 'Critical',
          entity: 'command adn control',
          eventType: 'dns error'
        }, {
          severity: 'Critical',
          entity: 'command adn control',
          eventType: 'dns error'
        }
      ],
      customTableTitles: [
        { label: 'network.severity', prop: 'severity' },
        { label: 'network.entity', prop: 'entity' },
        { label: 'detections.eventType', prop: 'eventType' }
      ]
    }
  },
  computed: {
    iconClass () {
      return function (row) {
        let className
        switch (row.severity) {
          case ('Critical'): {
            className = 'critical'
            break
          }
          case ('High'): {
            className = 'high'
            break
          }
          case ('Info'): {
            className = 'info'
            break
          }
          case ('Medium'): {
            className = 'medium'
            break
          }
          case ('Low'): {
            className = 'low'
            break
          }
          default: break
        }
        return className
      }
    }
  }
}
</script>
