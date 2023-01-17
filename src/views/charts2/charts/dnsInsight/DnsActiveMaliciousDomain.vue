<template>
  <div class="dns-mailcious-domain">
    <div class="dns-mailcious-domain-title">
      {{ $t('dns.activeMaliciousDomains') }}
    </div>
    <el-table :data="tableData" class="dns-mailcious-domain-table" height="100%">
      <template v-for="(item, index) in customTableTitles" :key="index">
        <el-table-column class="data-column">
          <!--表头-->
          <template #header>
            <span class="dns-column__span">{{ $t(item.label) }}</span>
          </template>
          <!--表格内容-->
          <template #default="scope" :column="item">
            <div class="data-mailcious-domain-table">
              <template v-if="item.prop === 'domain'">
                <span class="data-column-domain">{{ $t(scope.row[item.prop]) }}</span>
              </template>

              <template v-else-if="item.prop === 'ips'">
                <el-popover placement="right" :width="126" trigger="hover" v-if="scope.row['ips'].split(',').length >=3">
                  <template #reference>
                    <span class="data-column-ips">{{ $t(scope.row[item.prop]) }}</span>
                  </template>
                  <!--超过3个ip就省略号显示，移动鼠标block块展示，并换行-->
                  <pre style="max-height: 152px;margin: 0px -10px -15px 0;overflow: scroll;"><span style="height: 24px;line-height: 24px;color: #046ECA;">{{scope.row[item.prop].replace(/,/g, '\n')}}</span></pre>
                </el-popover>
                <span v-else class="data-column-ips">{{ $t(scope.row[item.prop]) }}</span>
              </template>

              <template v-else-if="item.prop === 'numberOfIPs'">
                <span>{{ scope.row['ips'].split(',').length }}</span>
              </template>

              <template v-else-if="item.prop === 'queries'">
                <span>{{ scope.row[item.prop] }}</span>
              </template>

              <template v-else-if="item.prop === 'firstSeenTime'">
                <span>{{ dateFormatByAppearance(scope.row[item.prop]) }}</span>
              </template>

              <template v-else-if="item.prop === 'lastSeenTime'">
                <span>{{ dateFormatByAppearance(scope.row[item.prop]) }}</span>
              </template>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
      </template>

      <template v-slot:empty>
        <div class="table-no-data" v-show="isNoData">
          <div class="table-no-data__title">{{ $t('npm.noData') }}</div>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script>
import { api } from '@/utils/api'
import { getSecond } from '@/utils/date-util'
import { get } from '@/utils/http'
import chartMixin from '@/views/charts2/chart-mixin'

export default {
  name: 'DnsActiveMaliciousDomain',
  data () {
    return {
      tableData: [], // 表格数据
      // 表头数据
      customTableTitles: [
        {
          label: 'dns.domain',
          prop: 'domain'
        },
        {
          label: 'dns.IPs',
          prop: 'ips'
        },
        {
          label: 'dns.numberOfIPs',
          prop: 'numberOfIPs'
        },
        {
          label: 'dns.queries',
          prop: 'queries'
        },
        {
          label: 'dns.firstSeenTime',
          prop: 'firstSeenTime'
        },
        {
          label: 'dns.lastSeenTime',
          prop: 'lastSeenTime'
        }
      ],
      isNoData: false // 无数据标识，true为无数据，false有数据
    }
  },
  mixins: [chartMixin],
  watch: {
    timeFilter: {
      handler (n) {
        this.initData()
      }
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      this.toggleLoading(true)

      this.tableData = []

      const params = {
        startTime: getSecond(this.timeFilter.startTime),
        endTime: getSecond(this.timeFilter.endTime)
      }
      this.toggleLoading(true)
      get(api.dnsInsight.activeMaliciousDomain, params).then(res => {
        if (res.code === 200) {
          this.isNoData = res.data.result.length === 0
          this.tableData = res.data.result
        } else {
          this.isNoData = true
        }
      }).finally(() => {
        this.toggleLoading(false)
      })
    }
  },
  computed: {}
}
</script>
