<template>
  <div class="entity-filter-case">
    <div class="filter-case__header">{{ $t('entities.filter1') }}</div>

    <div class="entity-filter" v-for="(item, index) in filterData" :key="index">
      <div class="filter__header">
        <i :class="item.icon"></i>
        {{ item.title }}
      </div>

      <div class="filter__body">
        <div class="filter__body-item" v-for="(data, i) in item.data" :key="i" @click="filter(data.label, data)">
          <div class="filter__body-item-left">
            <div v-if="data.flag">
              <img :src="require(`../../../public/images/flag/${data.flag}.svg`)" class="filter-country-flag"/>
            </div>
            <div v-else class="filter__body-item-left-index">{{ i }}</div>
            <div class="filter__body-item-left-label">
              <el-tooltip :content="data.label" placement="top" effect="light" :disabled="disabledLabel">
                <span @mouseenter="handleMouse(`filter${index}${i}`)" :id="`filter${index}${i}`">{{ data.label }}</span>
              </el-tooltip>
            </div>
          </div>

          <div class="filter__body-item-right">{{ data.value }}</div>
        </div>
        <div class="filter-hr"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EntityFilter',
  data () {
    return {
      filterData: [
        {
          icon: 'cn-icon cn-icon-registration-country',
          title: 'Top Countries',
          totalCount: 0,
          data: [
            {
              label: 'China',
              flag: '011-china',
              topColumn: 'ip_location_country', // top弹框查询字段
              value: 364
            },
            {
              label: 'Australia',
              flag: '142-australia',
              topColumn: 'ip_location_country', // top弹框查询字段
              value: 226
            },
            {
              label: 'South Korea',
              flag: '218-south korea',
              topColumn: 'ip_location_country', // top弹框查询字段
              value: 120
            },
            {
              label: 'Germany',
              flag: '207-germany',
              topColumn: 'ip_location_country', // top弹框查询字段
              value: 120
            },
            {
              label: 'America',
              flag: '185-united states of america',
              topColumn: 'ip_location_country', // top弹框查询字段
              value: 120
            }
          ]
        },
        {
          icon: 'cn-icon cn-icon-city',
          title: 'Top Cities',
          totalCount: 0,
          data: [
            {
              label: 'Beijing',
              topColumn: 'ip_location_city', // top弹框查询字段
              value: 364
            },
            {
              label: 'Shanghai',
              topColumn: 'ip_location_city', // top弹框查询字段
              value: 226
            },
            {
              label: 'Guangzhou',
              topColumn: 'ip_location_city', // top弹框查询字段
              value: 120
            },
            {
              label: 'Hangzhou',
              topColumn: 'ip_location_city', // top弹框查询字段
              value: 64
            },
            {
              label: 'Shenzhen',
              topColumn: 'ip_location_city', // top弹框查询字段
              value: 48
            }
          ]
        },
        {
          icon: 'cn-icon cn-icon-org',
          title: 'Top Oranization',
          totalCount: 0,
          data: [
            {
              label: 'China internet network information Center',
              topColumn: 'ip_location_org', // top弹框查询字段
              value: 364
            },
            {
              label: 'Educause',
              topColumn: 'ip_location_org', // top弹框查询字段
              value: 226
            },
            {
              label: 'Telecommunication tokelau company',
              topColumn: 'ip_location_org', // top弹框查询字段
              value: 120
            },
            {
              label: 'Universidad del valle de guatemala',
              topColumn: 'ip_location_org', // top弹框查询字段
              value: 64
            },
            {
              label: 'Internet systems consortium',
              topColumn: 'ip_location_org', // top弹框查询字段
              value: 48
            }
          ]
        },
        {
          icon: 'cn-icon cn-icon-tag',
          title: 'Top Tags',
          totalCount: 0,
          data: [
            {
              label: 'Internet',
              topColumn: 'ip_location_tag', // top弹框查询字段
              value: 364
            },
            {
              label: 'Virus software',
              topColumn: 'ip_location_tag', // top弹框查询字段
              value: 226
            },
            {
              label: 'Information Technology',
              topColumn: 'ip_location_tag', // top弹框查询字段
              value: 120
            },
            {
              label: 'Information Technology',
              topColumn: 'ip_location_tag', // top弹框查询字段
              value: 64
            },
            {
              label: 'Security software',
              topColumn: 'ip_location_tag', // top弹框查询字段
              value: 48
            }
          ]
        },
        {
          icon: 'cn-icon cn-icon-category2',
          title: 'Top Domain Categories',
          totalCount: 0,
          data: [
            {
              label: 'Business and Economy',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 364
            },
            {
              label: 'Games',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 226
            },
            {
              label: 'Society',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 120
            },
            {
              label: 'Government',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 64
            },
            {
              label: 'Computer and Internet Info',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 48
            }
          ]
        },
        {
          icon: 'cn-icon cn-icon-category2',
          title: 'Top App Categories',
          totalCount: 0,
          data: [
            {
              label: 'Media',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 364
            },
            {
              label: 'Networking',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 226
            },
            {
              label: 'Collaboration',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 120
            },
            {
              label: 'Bussiness-systems',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 64
            },
            {
              label: 'General-internet',
              topColumn: 'ip_location_category', // top弹框查询字段
              value: 48
            }
          ]
        },
        {
          icon: 'cn-icon cn-icon-as',
          title: 'Top ASNs',
          totalCount: 0,
          data: [
            {
              label: 'AS4837',
              topColumn: 'ip_location_asn', // top弹框查询字段
              value: 364
            },
            {
              label: 'AS9808',
              topColumn: 'ip_location_asn', // top弹框查询字段
              value: 226
            },
            {
              label: 'AS4134',
              topColumn: 'ip_location_asn', // top弹框查询字段
              value: 120
            },
            {
              label: 'AS37963',
              topColumn: 'ip_location_asn', // top弹框查询字段
              value: 64
            },
            {
              label: 'AS54994',
              topColumn: 'ip_location_asn', // top弹框查询字段
              value: 48
            }
          ]
        }
      ],
      disabledLabel: true
    }
  },
  methods: {
    /**
     * 判断文字是否溢出，超出则鼠标移入tooltip显示，否则鼠标移入不显示
     * @param id
     */
    handleMouse (id) {
      const dom = document.getElementById(id)
      if (dom) {
        const width = document.getElementById(id).offsetWidth
        this.disabledLabel = width < 180
      } else {
        this.disabledLabel = true
      }
    },
    filter (name, data) {
      this.$emit('filter', name, data)
    }
  }
}
</script>

<style lang="scss" scoped>
.entity-filter-case {
  display: flex;
  flex-direction: column;
  width: 280px;
  margin-right: 10px;
  overflow: auto;
  z-index: 1;
  border: 1px solid rgba(226, 229, 236, 1) !important;
  border-radius: 4px !important;

  .filter__header {
    height: 46px;
    line-height: 46px;
    margin: 0 20px;
    font-size: 14px;
    color: #353636;
    font-weight: 500;
  }

  .filter__body {
    width: calc(100% - 40px);
    margin: 0 20px;

    .filter-hr {
      width: calc(100% + 20px);
      margin-left: -10px;
      margin-top: 10px;
      height: 1px;
      background: #EFF2F5;
      //background: #000;
    }

    .filter__body-item {
      height: 26px;
      line-height: 26px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      .filter__body-item-left {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #353636;
        font-weight: 400;

        .filter-country-flag {
          width: 18px;
          height: 12px;
        }

        .filter__body-item-left-index {
          width: 16px;
          height: 16px;
          line-height: 16px;
          text-align: center;
          background: #EFF2F5;
          border-radius: 2px;
          margin-right: 6px;
          font-family: NotoSansHans-Black;
          font-size: 9px;
          color: #96A2B0;
          font-weight: 900;
        }

        .filter__body-item-left-label {
          max-width: 180px;
          font-family: NotoSansSChineseRegular;
          font-size: 14px;
          color: #353636;
          font-weight: 400;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .filter__body-item-right {
        flex-shrink: 0;
        font-family: NotoSansSChineseRegular;
        font-size: 12px;
        color: #717171;
        font-weight: 400;
      }
    }
  }
}
</style>
