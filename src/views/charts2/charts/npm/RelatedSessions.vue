<template>
 <div class="npm-sessions">
   <div class="npm-sessions-title">
     {{$t('npm.relatedSessions')}}
     <chart-error v-if="showError" tooltip :content="errorMsg" />
   </div>
   <div class="npm-sessions-div">
     <div class="npm-sessions-div-green" id="green" v-show="clientSessions > 0"></div>
     <div class="npm-sessions-div-red" id="red" v-show="serverSessions > 0"></div>
     <div class="npm-sessions-div-gray" id="gray" v-show="showError || isNoData"></div>
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
           <div class="npm-sessions-as-client-i18n">{{$t('npm.asServer')}}</div>
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
import ChartError from '@/components/common/Error'

export default {
  name: 'RelatedSessions',
  components: { ChartError },
  mixins: [chartMixin],
  data () {
    return {
      sessionData: {},
      unitConvert,
      unitTypes,
      clientSessions: 0,
      serverSessions: 0,
      showError: false,
      errorMsg: '',
      noData: false,
      isNoData: false
    }
  },
  watch: {
    timeFilter: {
      handler () {
        this.relatedSessionsData()
      }
    }
  },
  methods: {
    relatedSessionsData () {
      const conditionStr = this.$route.query.queryCondition ? this.$route.query.queryCondition : ''
      const condition = conditionStr.split(/["|'](.*?)["|']/)
      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime),
        ip: condition[1]
      }
      const divGreen = document.getElementById('green')
      const divRed = document.getElementById('red')
      const divGray = document.getElementById('gray')
      get(api.npm.overview.relatedSessions, params).then(res => {
        if (res.code === 200) {
          this.showError = false
          this.isNoData = false

          this.sessionData = res.data.result
          const client = this.sessionData.clientSessions
          const server = this.sessionData.serverSessions

          // 如果返回数据为-，则不必计算比例
          if (!isNaN(client) && !isNaN(server)) {
            this.clientSessions = client / (client + server)
            this.serverSessions = server / (client + server)
            this.sessionData.clientSessions = unitConvert(this.clientSessions, unitTypes.percent).join('')
            this.sessionData.serverSessions = unitConvert(this.serverSessions, unitTypes.percent).join('')

            if (this.clientSessions === 1) {
              divGreen.style.borderRadius = 4 + 'px'
            } else if (this.serverSessions === 1) {
              divRed.style.borderRadius = 4 + 'px'
            } else if (this.clientSessions === 0 && this.serverSessions === 0) {
              this.isNoData = true
              divGray.style.borderRadius = 4 + 'px'
              divGray.style.width = '100%'
            }

            divGreen.style.width = this.sessionData.clientSessions
            divRed.style.width = this.sessionData.serverSessions
          } else {
            this.isNoData = true
            this.changeByErrorOrNodata()
          }
        } else {
          this.showError = true
          this.errorMsg = res.message
          this.changeByErrorOrNodata()
        }
      }).catch(error => {
        this.showError = true
        this.errorMsg = error.message
        this.changeByErrorOrNodata()
      }).finally(() => {
        this.toggleLoading(false)
      })
    },
    /**
     * 当无数据或者报错时改变界面样式，出现灰条
     */
    changeByErrorOrNodata () {
      const divGray = document.getElementById('gray')
      divGray.style.borderRadius = 4 + 'px'
      divGray.style.width = '100%'
      this.sessionData.clientSessions = '—'
      this.sessionData.serverSessions = '—'
      this.clientSessions = 0
      this.serverSessions = 0
    }
  },
  mounted () {
    this.relatedSessionsData()
  }
}
</script>
