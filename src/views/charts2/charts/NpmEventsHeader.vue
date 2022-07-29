<template>
 <div class="npm-header">
  <div class="npm-header-body" v-for="(item, index) in chartData" :key="index">
    <div class="npm-header-body-severity">
      <div class="npm-header-body-severity-icon" :class="iconClass(item)"></div>
      <div class="npm-header-body-severity-value">{{item.severity}}</div>
    </div>
    <div class="npm-header-body-total">{{item.total}}</div>
  </div>
 </div>
</template>

<script>
export default {
  name: 'NpmEventsHeader',
  data () {
    return {
      chartData: [
        { severity: 'Critical', total: 12 },
        { severity: 'High', total: 32 },
        { severity: 'Medium', total: 12 },
        { severity: 'Low', total: 21 },
        { severity: 'Info', total: 18 }
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
