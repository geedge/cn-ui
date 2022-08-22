<template>
 <div class="npm-sessions">
   <div class="npm-sessions-title">{{$t('npm.relatedSessions')}}</div>
   <div class="npm-sessions-div">
     <div class="npm-sessions-div-green" id="green" v-show="clientSessions > 0"></div>
     <div class="npm-sessions-div-red" id="red" v-show="serverSessions > 0"></div>
   </div>
   <div class="npm-sessions-body">
     <div class="npm-sessions-body-left">
       <div class="npm-sessions-as-clients right">
         <div class="npm-sessions-as-client">
           <div class="npm-sessions-as-client-green"></div>&nbsp;
           <div class="npm-sessions-as-client-i18n">{{$t('npm.asClient')}}</div>
         </div>
         <div class="npm-sessions-as-client-percent">{{sessionData.clientSessions}}</div>
       </div>
       <div class="npm-sessions-as-clients">
         <div class="npm-sessions-as-client">
           <div class="npm-sessions-as-client-red"></div>&nbsp;
           <div class="npm-sessions-as-client-i18n">{{$t('npm.asClient')}}</div>
         </div>
         <div class="npm-sessions-as-client-percent">{{sessionData.serverSessions}}</div>
       </div>
     </div>
     <div class="npm-sessions-body-right">
       <span class="npm-sessions-Progress-number">{{unitConvert(sessionData.sessionsRate, unitTypes.number)[0]}}</span>&nbsp;<span class="npm-sessions-Progress-unit">{{unitConvert(sessionData.sessionsRate, unitTypes.number)[1]}}Sessions/s</span>
     </div>
   </div>
 </div>
</template>

<script>
import { get } from '@/utils/http'
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import unitConvert from '@/utils/unit-convert'
import { unitTypes } from '@/utils/constants'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'RelatedSessions',
  mixins: [chartMixin],
  data () {
    return {
      sessionData: {},
      unitConvert,
      unitTypes,
      clientSessions: 0,
      serverSessions: 0
    }
  },
  methods: {
    relatedSessionsData () {
      const condition = this.$store.getters.getQueryCondition.split(/["|'](.*?)["|']/)
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        ip: condition[1]
      }
      const divGreen = document.getElementById('green')
      const divred = document.getElementById('red')
      get(api.npm.overview.relatedSessions, params).then(res => {
        if (res.code === 200) {
          this.sessionData = res.data.result
          this.clientSessions = this.sessionData.clientSessions / (this.sessionData.clientSessions * 1 + this.sessionData.serverSessions * 1)
          this.serverSessions = this.sessionData.serverSessions / (this.sessionData.clientSessions * 1 + this.sessionData.serverSessions * 1)
          this.sessionData.clientSessions = unitConvert(this.clientSessions, unitTypes.percent).join('')
          this.sessionData.serverSessions = unitConvert(this.serverSessions, unitTypes.percent).join('')
          if (this.clientSessions === 1) {
            divGreen.style.borderRadius = 4 + 'px'
          } else if (this.serverSessions === 1) {
            divred.style.borderRadius = 4 + 'px'
          }
          divGreen.style.width = this.sessionData.clientSessions
          divred.style.width = this.sessionData.serverSessions
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  mounted () {
    this.relatedSessionsData()
  }
}
</script>
