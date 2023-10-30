<template>
  <div>
    <div class="new-detection-filter-title">
      {{ $t('detections.filters') }}
    </div>
    <div class="new-detection-filter-content">
      <div>
        <div class="new-filter-content-title">{{ $t('overall.status') }}</div>
        <div class="new-filter-content-content">
          <el-checkbox-group v-model="checkStatus" @change="onChangeCategory" style="display: flex;flex-direction: column">
            <el-checkbox v-for="item in statusList" :key="item.name" class="new-filter-content-checkbox" :label="item.status">
              <div>{{ item.name }}</div>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div>
        <div class="new-filter-content-title">{{ $t('overall.category') }}</div>
        <div class="new-filter-content-content">
          <el-checkbox-group v-model="checkCategory" @change="onChangeCategory">
            <el-checkbox v-for="item in categoryList" :key="item.name" class="new-filter-content-checkbox" :label="item.name">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <div>
        <div class="new-filter-content-title">{{ $t('overall.type') }}</div>
        <div class="new-filter-content-content">
          <el-checkbox-group v-model="checkEventType" @change="onChangeCategory" style="display: flex;flex-direction: column">
            <el-checkbox v-for="item in eventTypeList" :key="item.name" class="new-filter-content-checkbox" :label="item.name">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { api } from '@/utils/api'
import { switchStatus } from '@/utils/tools'
import { detectionUnitList } from '@/utils/constants'

export default {
  name: 'DetectionFilter',
  data () {
    return {
      statusList: [], // 状态列表数据
      categoryList: [], // 类别列表
      eventTypeList: [], // 事件类型列表
      checkStatus: [], // checkbox选择的状态列表
      checkCategory: [], // checkbox选择的类别
      checkEventType: [], // checkbox选择的事件类型
      policyTotal: 0, // 策略总条数，与筛选条件无关
      policyEnabledNum: 0 // 策略中状态为enabled的数量
    }
  },
  mounted () {
    this.getFilterData()
  },
  methods: {
    getFilterData () {
      axios.get(api.detection.statistics).then(response => {
        if (response.status === 200) {
          const data = response.data.data
          if (data.statusList) {
            data.statusList.forEach(item => {
              this.policyTotal += item.count
              if (item.status === 1) {
                this.policyEnabledNum = item.count
              }
              this.statusList.push({ status: item.status, name: this.$t(switchStatus(item.status)) })
            })
            this.$emit('policyTotal', this.policyTotal, this.policyEnabledNum)
          } else {
            this.statusList = []
          }

          if (data.categoryList) {
            this.categoryList = []
            data.categoryList.forEach(item => {
              const obj = detectionUnitList.categoryList.find(d => d.value === item.name)
              if (obj) {
                this.categoryList.push({ ...item, label: this.$t(obj.label) })
              }
            })
          } else {
            this.categoryList = []
          }

          if (data.eventTypeList) {
            this.eventTypeList = []
            data.eventTypeList.forEach(item => {
              const obj = detectionUnitList.eventTypeList.find(d => d.value === item.name)
              if (obj) {
                this.eventTypeList.push({ ...item, label: this.$t(obj.label) })
              }
            })
          } else {
            this.eventTypeList = []
          }
        } else {
          console.error(response.data)
        }
      }).catch((e) => {
        console.error(e)
        this.statusList = []
        this.categoryList = []
        this.eventTypeList = []
      })
    },
    onChangeCategory () {
      const obj = {}
      if (this.checkStatus.length === 1) {
        obj.status = this.checkStatus.join(',')
      } else {
        delete obj.status
      }
      if (this.checkCategory.length > 0) {
        obj.category = this.checkCategory.join(',')
      }
      if (this.checkEventType.length > 0) {
        obj.eventType = this.checkEventType.join(',')
      }
      this.$emit('filterParams', obj)
    }
  }
}
</script>
