<template>
  <div class="detection-drawer" style="height: 100vh;overflow: scroll;padding-bottom: 90px">
    <div class="drawer-basic">
      <div class="drawer-basic-header">
        <div class="drawer-basic-id">ID: {{ drawerInfo.ruleId }}</div>
        <div :class="`detection-tag-status${detailData.status}`">
          {{ switchStatus(detailData.status) }}
        </div>
      </div>

      <div class="drawer-basic-function">
        <div class="detection-drawer-title">Name</div>
        <div class="basic-function-value">{{ detailData.name }}</div>
      </div>

      <div class="drawer-basic-function">
        <div class="detection-drawer-title">Type</div>
        <div class="basic-function-value">{{ detailData.eventType }}</div>
      </div>

      <div class="drawer-basic-description">
        <div class="detection-drawer-title">Description</div>
        <div class="basic-description-value">{{ detailData.description }}</div>
      </div>
    </div>

    <div class="detection-drawer-collapse">
      <el-collapse v-model="activeRule">
        <el-collapse-item title="Rule Definitcm" name="rule">
          <div class="drawer-collapse-content">

            <div class="drawer-basic-function">
              <div class="detection-drawer-title">Source</div>
              <div class="basic-function-value">{{ detailData.category }}</div>
            </div>

            <div v-if="detailData.ruleType==='indicator_match'">
              <div class="drawer-basic-function">
                <div class="detection-drawer-title">Library</div>
                <span class="basic-function-value">{{ detailData.library }}</span>
              </div>

              <div class="drawer-basic-function">
                <div class="detection-drawer-title">Level</div>
                <div class="detection-drawer-title">
                  <div class="detection__icon" :style="`background-color: ${eventSeverityColor['critical']}`"></div>
                  <div class="basic-function-value">Critical</div>
                </div>
              </div>
            </div>

            <div v-else>
              <div class="drawer-basic-function">
                <div class="detection-drawer-title">Dimensions</div>
                <span class="detection-tag-blue">{{ detailData.dimensions }}</span>
              </div>

              <div class="drawer-basic-function">
                <div class="detection-drawer-title">Filters</div>
                <span class="detection-tag-blue">source</span>
                <span style="margin: 0 6px;">equal</span><span>19890</span>
              </div>

              <div class="drawer-basic-function" v-for="item in severityList" :key="item.severity"
                   style="padding-bottom: 0">
                <div class="detection-drawer-title">
                  <div class="detection__icon" :style="`background-color: ${eventSeverityColor[item.severity]}`"></div>
                  <div>{{ toUpperCaseByString(item.severity) }}</div>
                </div>
                <div class="detection-drawer-title">Conditions</div>
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
        <el-collapse-item title="Trigger" name="trigger">
          <div class="drawer-collapse-content">
            <div class="drawer-collapse-trigger">
              Triggered when conditions occur at least
              <span style="color: #046ECA" v-if="detailData.trigger">
                {{ detailData.trigger.atLeast }} time
              </span> in
              <span style="color: #046ECA" v-if="detailData.trigger">
                <!--todo 此处返回的是PT5M，具体时间处理根据后续字段来看-->
                {{ getNumberFromStr(detailData.trigger.interval) }} minutes
              </span>
            </div>

            <div class="drawer-basic-function">
              <div class="detection-drawer-title">Evaluation Frequency</div>
              <div class="basic-function-value" v-if="detailData.trigger">{{ getNumberFromStr(detailData.trigger.resetInterval) }} minutes</div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

  </div>
</template>

<script>
import { switchStatus, toUpperCaseByString } from '@/utils/tools'
import { eventSeverityColor } from '@/utils/constants'
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
      severityList: []
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
        }
      }).catch(err => {
        console.error(err)
      })
    },
    getNumberFromStr (str) {
      return str.match(/\d+(\.\d+)?/g)[0]
    }
  }
}
</script>

<style lang="scss">
</style>
