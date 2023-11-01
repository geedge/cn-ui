<template>
  <div class="detection-drawer" style="height: 100vh;overflow: scroll;padding-bottom: 90px">
    <div class="drawer-basic">
      <div class="drawer-basic-header">
        <div class="drawer-basic-id">ID: {{ drawerInfo.ruleId }}</div>
        <div :class="`detection-tag-status${drawerInfo.status}`">
          {{ $t(switchStatus(drawerInfo.status)) }}
        </div>
      </div>

      <div class="drawer-basic-function">
        <div class="detection-drawer-title">{{ $t('overall.name') }}</div>
        <div class="basic-function-value">{{ $_.get(detailData, 'name', '-') || '-'}}</div>
      </div>

      <div class="drawer-basic-function">
        <div class="detection-drawer-title">{{ $t('overall.type') }}</div>
        <div class="basic-function-value">{{ $_.get(detailData, 'eventType', '-') || '-'}}</div>
      </div>

      <div class="drawer-basic-description">
        <div class="detection-drawer-title">{{ $t('config.dataSet.description') }}</div>
        <div class="basic-description-value">{{ $_.get(detailData, 'description', '-') || '-' }}</div>
      </div>
    </div>

    <div class="detection-drawer-collapse">
      <el-collapse v-model="activeRule">
        <el-collapse-item :title="$t('detection.ruleDefinition')" name="rule">
          <div class="drawer-collapse-content">

            <div class="drawer-basic-function">
              <div class="detection-drawer-title">{{ $t('config.user.source') }}</div>
              <div class="basic-function-value">{{ changeCategory(detailData.category) }}</div>
            </div>

            <div v-if="detailData.ruleType==='indicator_match'">
              <div class="drawer-basic-function">
                <div class="detection-drawer-title">{{ $t('detection.library') }}</div>
                <span class="basic-function-value">{{ $_.get(detailData, 'ruleConfigObj.knowledgeBase.name', '-') || '-' }}</span>
              </div>

              <div class="drawer-basic-function">
                <div class="detection-drawer-title">{{ $t('detection.level') }}</div>
                <div class="detection-drawer-title">
                  <div class="detection__icon" :style="`background-color: ${eventSeverityColor[detailData.ruleConfigObj.level]}`"></div>
                  <div class="basic-function-value">{{ changeSecurityLevel(detailData.ruleConfigObj) }}</div>
                </div>
              </div>
            </div>

            <div v-else>
              <div class="drawer-basic-function">
                <div class="detection-drawer-title">{{ $t('detection.create.dimensions') }}</div>
                <span class="detection-tag-blue">{{ detailData.dimensions }}</span>
              </div>

              <div class="drawer-basic-function">
                <div class="detection-drawer-title">{{ $t('detections.filters') }}</div>
                <span class="detection-tag-blue">Source Port</span>
                <span style="margin: 0 6px;">{{ $t('detections.equal') }}</span><span>19890</span>
              </div>

              <div class="drawer-basic-function" v-for="item in severityList" :key="item.severity"
                   style="padding-bottom: 0">
                <div class="detection-drawer-title">
                  <div class="detection__icon" :style="`background-color: ${eventSeverityColor[item.severity]}`"></div>
                  <div>{{ toUpperCaseByString(item.severity) }}</div>
                </div>
                <div class="detection-drawer-title">{{ $t('detections.conditions') }}</div>
                <div>
                  <div class="detection-tag-gray margin-r-10">> 60 Kpackets/s</div>
                  <div class="detection-tag-gray">> 50 Unique Src IPs</div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div class="detection-drawer-collapse" style="margin: 20px 0">
      <el-collapse v-model="activeTrigger">
        <el-collapse-item :title="$t('detection.create.trigger')" name="trigger">
          <div class="drawer-collapse-content" v-if="language===EN">
            <div class="drawer-collapse-trigger">
              Triggered when conditions occur at least
              <span style="color: #046ECA">
                {{ atLeast }} {{ times }}
              </span> in
              <span style="color: #046ECA">
                {{ getNumberFromStr($_.get(detailData, 'ruleTriggerObj.interval', '0')) || '-' }}
                {{ $_.get(detailData, 'ruleTriggerObj.intervalVal', '-') || '-' }}
              </span>
            </div>

            <div class="drawer-basic-function">
              <div class="detection-drawer-title">{{ $t('detection.evaluationFrequency') }}</div>
              <div class="drawer-trigger-minutes">
                {{ getNumberFromStr($_.get(detailData, 'ruleTriggerObj.resetInterval', '0')) || '-' }}
                {{ $_.get(detailData, 'ruleTriggerObj.intervalVal', '-') || '-' }}
              </div>
            </div>
          </div>
          <div class="drawer-collapse-content" v-if="language===ZH">
            <div class="drawer-collapse-trigger">
              当条件为
              <span style="color: #046ECA">
                {{ getNumberFromStr($_.get(detailData, 'ruleTriggerObj.interval', '0')) || '-' }}
                {{ changeValueToLabel(detailData.ruleTriggerObj) }}
              </span>内至少出现
              <span style="color: #046ECA">
                {{ $_.get(detailData, 'ruleTriggerObj.atLeast', '-') || '-' }} 次
              </span>时触发
            </div>

            <div class="drawer-basic-function">
              <div class="detection-drawer-title">评估频率</div>
              <div class="drawer-trigger-minutes">
                {{ getNumberFromStr($_.get(detailData, 'ruleTriggerObj.resetInterval', '0')) || '-' }}
                {{ changeValueToLabel(detailData.ruleTriggerObj) }}
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

  </div>
</template>

<script>
import { switchStatus, toUpperCaseByString } from '@/utils/tools'
import { detectionUnitList, eventSeverityColor, securityLevel, storageKey, ZH, EN } from '@/utils/constants'
import axios from 'axios'
import { api } from '@/utils/api'

export default {
  name: 'DetectionDrawer',
  props: {
    drawerInfo: {
      type: Object
    }
  },
  data () {
    return {
      activeRule: 'rule',
      activeTrigger: 'trigger',
      detailData: {},
      eventSeverityColor,
      severityList: [],
      language: EN,
      atLeast: 0,
      times: 'time',
      ZH,
      EN
    }
  },
  watch: {
    drawerInfo: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.getDetailData()
        }
      }
    }
  },
  mounted () {
    this.language = localStorage.getItem(storageKey.language) || EN
  },
  methods: {
    switchStatus,
    toUpperCaseByString,
    getDetailData () {
      this.severityList = [
        {
          severity: 'critical',
          list: ['> 60 Kpackets/s', '> 50 Unique Src IPs']
        },
        {
          severity: 'high',
          list: ['> 20 Kpackets/s', '> 50 Unique Src IPs']
        }
      ]

      axios.get(`${api.detection.detail}/${this.drawerInfo.ruleId}`).then(res => {
        if (res.status === 200) {
          this.detailData = res.data.data
          this.atLeast = this.$_.get(this.detailData, 'ruleTriggerObj.atLeast', '-')
          if (!isNaN(this.atLeast) && this.atLeast > 1) {
            this.times = 'times'
          } else {
            this.times = 'time'
          }
        }
      }).catch(err => {
        console.error(err)
      })
    },
    getNumberFromStr (str) {
      return str.match(/\d+(\.\d+)?/g)[0]
    },
    changeCategory (value) {
      if (value) {
        const obj = detectionUnitList.categoryList.find(d => d.value === value)
        let label = value
        if (obj) {
          label = this.$t(obj.label)
        }
        return label
      } else {
        return '-'
      }
    },
    changeSecurityLevel (config) {
      if (config) {
        if (config.level) {
          const obj = securityLevel.find(d => d.value === config.level)
          let label = config.level
          if (obj) {
            label = this.$t(obj.label)
          }
          return label
        } else {
          return '-'
        }
      } else {
        return '-'
      }
    },
    changeValueToLabel (config) {
      if (config) {
        if (config.intervalVal) {
          const obj = detectionUnitList.intervalListCN.find(d => d.value === config.intervalVal)
          let label = config.intervalVal
          if (obj) {
            label = this.$t(obj.label)
          }
          return label
        } else {
          return '-'
        }
      } else {
        return '-'
      }
    }
  }
}
</script>

<style lang="scss">
</style>
