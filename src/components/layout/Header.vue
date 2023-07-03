<template>
  <div class="cn-header">
    <div class="cn-header__banner">
      <div class="banner__left">
        <span @click="shrink" class="shrink-button" :class="{'shrink-button--collapse': showMenu}"><i
            class="cn-icon cn-icon-navigation"></i></span>
        <img alt="loading..." height="26" :src="logo?logo:require('../../assets/img/logo-header.svg')" @click="jump('/panel/networkOverview', '', '', 0)" style="cursor: pointer"/>
      </div>
      <!--个人操作-->
      <div class="personal">
        <el-dropdown>
          <div class="header-menu--item"><i class="cn-icon cn-icon-language"></i></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div id="header-to-english" :style="language === 'en'?'color:#0091ff':''" @click="changeLocal('en')">
                  English
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div id="header-to-chinese" :style="language === 'cn'?'color:#0091ff':''" @click="changeLocal('cn')">
                  中文
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown>
          <div class='login-user header-menu--item'>{{ username }}&nbsp;<i class="cn-icon cn-icon-arrow-down"></i></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div id="header-to-changepin" @click="showPinDialog">{{ $t('overall.changePassword') }}</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div id="header-to-logout" @click="logout">{{ $t('overall.logout') }}</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="cn-header__nav">
      <i class="cn-icon cn-icon-a-NetworkAnalytics"></i>
      <el-breadcrumb class="header__left-breadcrumb" separator=">">
        <el-breadcrumb-item class="header__left-breadcrumb-item" :id="`breadcrumb${item.value}`" :title="item.value"
                            v-for="(item,index) in breadcrumb" :key="item.value">
          <template v-if="index===3">
            <div class="header__left-breadcrumb-item-select">
              <el-popover placement="bottom-start"
                          ref="breadcrumbPopover"
                          :show-arrow="false"
                          :append-to-body="false"
                          :hide-after="0"
                          :show-after="0"
                          popper-class="breadcrumb__popper"
                          @show="showBreadcrumbPopover(item.value)"
                          @hide="hideBreadcrumbPopover()"
                          trigger="click">
                <template #reference>
                  <div class="breadcrumb-button" id="breadcrumbButton"
                       :class="showBackground?'breadcrumb-button__active':''">
                    <span id="breadcrumbValue">
                      <template v-if="curTabProp === 'qtype'">
                        <span>{{ dnsQtypeMapData.get(item.value)}}</span>
                      </template>
                      <template v-else-if="curTabProp === 'rcode'">
                        <span>{{ dnsRcodeMapData.get(item.value)}}</span>
                      </template>
                      <template v-else>
                        <span>{{ item.value }}</span>
                      </template>
                    </span><i class="cn-icon-xiala cn-icon"></i>
                  </div>
                </template>
                <el-row type="flex" justify="center" style="width: fit-content;flex-direction: column;">
                  <div class="search-input">
                    <el-input placeholder="Filter options"
                              size="mini"
                              v-model="dropDownValue"
                              @input="dropDownSearch"></el-input>
                  </div>
                  <ul class="select-dropdown" id="breadcrumbSelectDropdown" @scroll="scrollList()">
                    <li v-for="item in breadcrumbColumnValueListShow" title='' :key="item" :id="item"
                        class="select-dropdown__item" @click="changeValue(item)">
                      <template v-if="curTabProp === 'qtype'">
                        <span>{{ dnsQtypeMapData.get(item) }}</span>
                      </template>
                      <template v-else-if="curTabProp === 'rcode'">
                        <span>{{ dnsRcodeMapData.get(item) }}</span>
                      </template>
                      <template v-else>
                        <span>{{ item }}</span>
                      </template>
                    </li>
                  </ul>
                </el-row>
              </el-popover>
            </div>
          </template>
          <template v-else-if="index===2">
            <span v-if="route===wholeScreenRouterMapping.dns">{{ $t(item.value) }}</span>
            <span v-else class="route-menu" @click="jump(route,item.value,'',3)">{{ $t(item.value) }}</span>
          </template>
          <!-- index=0和index=1的点击跳转由breadcrumb里的数据控制 -->
          <template v-else-if="index===1">
            <span v-if="item.clickable" class="route-menu" @click="jump(route,'','',2)">{{ item.value }}</span>
            <span v-else>{{ item.value }}</span>
          </template>
          <template v-else>
            <span v-if="item.clickable" class="route-menu" @click="jump(item.route,'','',0)">{{ item.value }}</span>
            <span v-else>{{ item.value }}</span>
          </template>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 菜单 -->
    <el-drawer
        v-model="showMenu"
        direction="ttb"
        custom-class="cn-menu"
        modal-class="cn-menu-modal"
        :with-header="false"
        :show-close="false"
    >
      <div class="cn-menu__left">
        <div class="left-menu" v-for="menu in otherMenu" :key="menu.id" @click="jump(menu.route,'','',0)">
          <i :class="menu.icon"></i>
          <span>{{ $t(menu.i18n || menu.name) }}</span>
          <i class="cn-icon cn-icon-right"></i>
        </div>
      </div>
      <div class="cn-menu__middle">
        <div class="middle-menus middle-menus--network-analytics">
          <div class="middle-menus__header">{{ $t('overall.networkAnalytics') }}</div>
          <div class="middle-menus__body">
            <div style="width: 260px;">
              <template v-for="(menu, index) in networkAnalyticsMenu.children" :key="index">
                <div class="middle-menu" v-if="index < 5" @click="jump(menu.route,'','',2)">
                  {{ $t(menu.i18n || menu.name) }}
                </div>
              </template>
            </div>
            <div>
              <template v-for="(menu, index) in networkAnalyticsMenu.children" :key="index">
                <div class="middle-menu" v-if="index >= 5 && index < 10" @click="jump(menu.route,'','',2)">
                  {{ $t(menu.i18n || menu.name) }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 改密码 -->
    <el-dialog v-model="showChangePin"
               width="30%"
               :before-close="handleClose">
      <el-form :rules="changePassFormRules" :model="changePassForm" ref="changePassForm">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('overall.currentPassword')" prop="oldPwd">
              <el-input v-model="changePassForm.oldPwd" type="password"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('overall.newPassword')" prop="newPwd">
              <el-input v-model="changePassForm.newPwd" type="password"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('overall.confirmNewPassword')" prop="newPwd2">
              <el-input v-model="changePassForm.newPwd2" type="password"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePin = false">{{ $t('overall.cancel') }}</el-button>
          <el-button type="primary" @click="submit">{{ $t('overall.update') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { get, put } from '@/utils/http'
import {
  curTabState,
  entityType,
  fromRoute,
  networkTable,
  operationType,
  storageKey,
  wholeScreenRouterMapping
} from '@/utils/constants'
import { api } from '@/utils/api'
import { ref } from 'vue'
import {
  combineDrilldownTableWithUserConfig,
  combineTabList,
  getDefaultCurTab,
  getDnsMapData,
  getTabList,
  handleSpecialValue,
  overwriteUrl,
  urlParamsHandler
} from '@/utils/tools'
import { getNowTime, getSecond } from '@/utils/date-util'
import _ from 'lodash'
import { useRoute } from 'vue-router'

export default {
  name: 'Header',
  data () {
    const passwordComparison = (rule, value, callback) => {
      if (value !== this.changePassForm.newPwd) {
        callback(new Error(this.$t('validate.passwordConsistent')))
      } else {
        callback()
      }
    }
    return {
      username: localStorage.getItem(storageKey.username),
      language: localStorage.getItem(storageKey.language) ? localStorage.getItem(storageKey.language) : 'en',
      showChangePin: false,
      from: '', // entity类型
      changePassForm: {
        oldPwd: '',
        newPwd: '',
        newPwd2: ''
      },
      changePassFormRules: {
        oldPwd: [{
          required: true,
          message: this.$t('validate.required'),
          trigger: 'blur'
        }],
        newPwd: [{
          required: true,
          message: this.$t('validate.required'),
          trigger: 'blur'
        }],
        newPwd2: [{
          required: true,
          message: this.$t('validate.required'),
          trigger: 'blur'
        }, {
          validator: passwordComparison,
          trigger: 'blur'
        }]
      },
      showMenu: false,
      dropDownValue: '',
      breadcrumbColumnValueListShow: [],
      curTabProp: '',
      dnsRcodeMapData: new Map(),
      dnsQtypeMapData: new Map(),
      isDnsMapType: false,
      valueMeta: [],
      showBackground: false,
      selected: false,
      valueMenuId: '',
      fromRoute: fromRoute,
      detectionMenuList: [
        {
          name: 'securityEvents',
          i18n: 'entities.securityEvents',
          path: '/detection/securityEvent'
        },
        {
          name: 'performanceEvents',
          i18n: 'overall.performanceEvents',
          path: '/detection/performanceEvent'
        }
      ],
      curPageNum: 1,
      curTabState: curTabState,
      urlChangeParams: {},
      wholeScreenRouterMapping,
      logo: '' // 此处logo的url未被初始化，可能后续会改动
    }
  },
  computed: {
    networkAnalyticsMenu () {
      return this.$store.getters.menuList.find(menu => menu.code === 'networkAnalytics')
    },
    otherMenu () {
      return this.$store.getters.menuList.filter(menu => ['networkAnalytics', 'chart', 'I18N', 'entityDetail', 'temp'].indexOf(menu.code) === -1)

      /* function excludeButton (menu) {
        for (let i = 0; i < menu.length; i++) {
          if (menu[i].type === 2) {
            menu.splice(i, 1)
            i--
          } else {
            if (menu[i].children && menu[i].children.length > 0) {
              excludeButton(menu[i].children)
            }
          }
        }
      } */
    },
    breadcrumb () {
      const breadcrumb = []
      this.generateBreadcrumb(breadcrumb, this.$store.getters.menuList)
      // 写死一级和二级菜单是否可以点击跳转
      if (breadcrumb[0]) {
        if (['knowledgeBase'].indexOf(breadcrumb[0].code) > -1) {
          breadcrumb[0].clickable = true
        }
        if (breadcrumb[1]) {
          if (breadcrumb[1].route && breadcrumb[1].route.indexOf('/panel/') === 0) {
            breadcrumb[1].clickable = true
          }
        }
      }

      const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')

      let result = [...breadcrumb]
      if (fourthMenu) {
        result = [...result, { value: thirdMenu }, { value: fourthMenu }]
      } else if (thirdMenu) {
        result = [...result, { value: thirdMenu }]
      }
      return result
    },
    showEntityTypeSelector () {
      return this.$store.getters.getShowEntityTypeSelector
    },
    storeFrom () {
      return this.$store.getters.from
    },
    route () {
      return this.$route.path
    }
  },
  watch: {
    from (n) {
      this.$store.commit('entityTypeChange', n)
    },
    storeFrom (n) {
      if (this.from !== n) {
        this.from = n
      }
    },
    async breadcrumb (n) {
      this.curTabProp = this.$route.query.dimensionType ? this.$route.query.dimensionType : null
      if (this.$route.params.typeName === fromRoute.dnsServiceInsights) {
        if (this.dnsQtypeMapData.size === 0) {
          this.dnsQtypeMapData = await getDnsMapData('dnsQtype')
        }
        if (this.dnsRcodeMapData.size === 0) {
          this.dnsRcodeMapData = await getDnsMapData('dnsRcode')
        }
      }
    },
    '$store.getters.timeFilter': function (newVal) {
      if (newVal && Object.keys(newVal).length > 0) {
        this.chartTimeFilter = newVal
      }
    }
  },
  async mounted () {
    this.from = Object.keys(this.entityType)[0]
    // 是否需要dns的qtype和rcode的数据字典
    if (this.$route.params.typeName === fromRoute.dnsServiceInsights) {
      if (this.dnsQtypeMapData.size === 0) {
        this.dnsQtypeMapData = await getDnsMapData('dnsQtype')
      }
      if (this.dnsRcodeMapData.size === 0) {
        this.dnsRcodeMapData = await getDnsMapData('dnsRcode')
      }
    }
    this.initDropdownList()
  },
  setup () {
    const { query } = useRoute()
    // 获取url携带的range、startTime、endTime
    const rangeParam = query.range
    const startTimeParam = query.startTime
    const endTimeParam = query.endTime
    // 若url携带了，使用携带的值，否则使用默认值。

    const dateRangeValue = rangeParam ? parseInt(query.range) : 60
    const chartTimeFilter = ref({ dateRangeValue })
    if (!startTimeParam || !endTimeParam) {
      const { startTime, endTime } = getNowTime(60)
      chartTimeFilter.value.startTime = startTime
      chartTimeFilter.value.endTime = endTime
    } else {
      chartTimeFilter.value.startTime = parseInt(startTimeParam)
      chartTimeFilter.value.endTime = parseInt(endTimeParam)
    }

    return {
      chartTimeFilter,
      entityType // 所有entity类型，用于header下拉框选择
    }
  },
  methods: {
    generateBreadcrumb (breadcrumb, menus) {
      if (this.route === '/entityDetail') {
        const entityMenu = menus.find(m => m.route === '/entityExplorer')
        const entityDetailMenu = menus.find(m => m.route === '/entityDetail')
        breadcrumb.push({
          code: entityMenu.code,
          value: entityMenu.i18n ? this.$t(entityMenu.i18n) : entityMenu.name,
          route: entityMenu.route,
          type: entityMenu.type
        })
        breadcrumb.push({
          code: entityDetailMenu.code,
          value: entityDetailMenu.i18n ? this.$t(entityDetailMenu.i18n) : entityDetailMenu.name,
          route: entityDetailMenu.route,
          type: entityDetailMenu.type
        })
        return true
      }
      const menu = menus.find(m => m.route === this.route)
      if (menu) {
        breadcrumb.unshift({
          code: menu.code,
          value: menu.i18n ? this.$t(menu.i18n) : menu.name,
          route: menu.route,
          type: menu.type
        })
        return true
      } else {
        for (let i = 0; i < menus.length; i++) {
          if (!_.isEmpty(menus[i].children)) {
            if (this.generateBreadcrumb(breadcrumb, menus[i].children)) {
              breadcrumb.unshift({
                code: menus[i].code,
                value: menus[i].i18n ? this.$t(menus[i].i18n) : menus[i].name,
                route: menus[i].route,
                type: menus[i].type
              })
              return true
            }
          }
        }
      }
    },
    handleClose () {
      this.showChangePin = false
    },
    changeLocal (lang) {
      if (lang !== localStorage.getItem(storageKey.language)) {
        localStorage.setItem(storageKey.language, lang)
        window.location.reload()
      }
    },
    showPinDialog () {
      this.showChangePin = true
    },
    logout () {
      sessionStorage.removeItem(storageKey.tokenExpireCurrentPath)
      localStorage.removeItem(storageKey.token)
      get(api.logout)
    },
    refreshLang () {
      this.language = localStorage.getItem(storageKey.language)
      this.$i18n.locale = this.language
      this.$nextTick(() => {
        window.location.reload()
      })
    },
    getCurTabByLabel (label) {
      let curTab = null
      const tableType = this.$route.params ? this.$route.params.typeName : 'networkOverview'
      const curTableInCode = networkTable[tableType] ? networkTable[tableType] : networkTable.networkOverview
      if (curTableInCode && curTableInCode.tabList) {
        curTab = curTableInCode.tabList.find(item => item.label === label)
      }
      return curTab
    },
    async initDropdownList () {
      // 是否需要dns的qtype和rcode的数据字典
      this.curTabProp = this.$route.query.dimensionType ? this.$route.query.dimensionType : null
      const currentValue = document.getElementById('breadcrumbValue') ? document.getElementById('breadcrumbValue').innerText : ''
      const columnName = this.getUrlParam(this.curTabState.thirdMenu, '')
      let type = 'ip'
      const tableType = this.$route.params ? this.$route.params.typeName : 'networkOverview'
      const curTableInCode = networkTable[tableType] ? networkTable[tableType] : networkTable.networkOverview
      if (curTableInCode && curTableInCode.tabList) {
        const curTab = curTableInCode.tabList.find(item => item.label === columnName)
        if (curTab) {
          type = curTab.prop
        }
      }
      const params = {
        startTime: getSecond(this.chartTimeFilter.startTime),
        endTime: getSecond(this.chartTimeFilter.endTime),
        limit: 10 * this.curPageNum++,
        type: type,
        name: this.dropDownValue ? this.dropDownValue : ''
      }
      // 有的界面刷新时没有drilldownList接口地址，会报404
      if (!curTableInCode.url.drilldownList) {
        return true
      }
      get(curTableInCode.url.drilldownList, params).then(async response => {
        if (response.code === 200) {
          this.breadcrumbColumnValueListShow = response.data.result
          if (this.$route.params.typeName === fromRoute.dnsServiceInsights) {
            if (this.dnsQtypeMapData.size === 0) {
              this.dnsQtypeMapData = await getDnsMapData('dnsQtype')
            }
            if (this.dnsRcodeMapData.size === 0) {
              this.dnsRcodeMapData = await getDnsMapData('dnsRcode')
            }
          }
          this.$nextTick(() => {
            this.breadcrumbColumnValueListShow.forEach(item => {
              const selectedDom = document.getElementById(item)
              if (selectedDom) {
                let itemName = item
                if (this.curTabProp === 'qtype') {
                  itemName = this.dnsQtypeMapData.get(item)
                } else if (this.curTabProp === 'rcode') {
                  itemName = this.dnsRcodeMapData.get(item)
                }
                if (itemName === currentValue) {
                  selectedDom.style.cssText = 'color:#0091ff;font-weight: bold;'
                } else {
                  selectedDom.style.cssText = ''
                }
              }
            })
          })
        }
      })
    },
    showBreadcrumbPopover (valueMenuId) {
      this.breadcrumbColumnValueListShow.splice(0, this.breadcrumbColumnValueListShow.length)
      this.curPageNum = 1
      this.showBackground = true
      this.dropDownValue = ''
      this.initDropdownList()
      this.valueMenuId = 'breadcrumb' + valueMenuId
    },
    hideBreadcrumbPopover () {
      this.showBackground = false
    },
    getUrlParam (param, defaultValue, isNumber) {
      if (isNumber) {
        return this.$route.query[param] ? Number(this.$route.query[param]) : defaultValue
      } else {
        return this.$route.query[param] ? this.$route.query[param] : defaultValue
      }
    },
    changeValue (value) {
      // 设置面包屑显示的内容及hover时的title
      let valName = value
      if (this.curTabProp === 'qtype') {
        valName = this.dnsQtypeMapData.get(value)
      } else if (this.curTabProp === 'rcode') {
        valName = this.dnsRcodeMapData.get(value)
      }
      this.curTabProp = this.$route.query.dimensionType ? this.$route.query.dimensionType : null
      document.getElementById('breadcrumbValue').innerText = valName
      document.getElementById(this.valueMenuId).setAttribute('title', valName)
      document.getElementById('breadcrumbButton').click()
      const columnName = this.getUrlParam(this.curTabState.thirdMenu, '')
      const curTab = this.getCurTabByLabel(columnName)
      if (curTab) {
        const queryCondition = []
        const searchProps = curTab.dillDownProp
        if (curTab.prop === 'protocolPort') {
          const valueGroup = value.split(':')
          if (valueGroup) {
            queryCondition.push('common_l7_protocol=\'' + valueGroup[0] + '\'')
            queryCondition.push('common_server_port=' + valueGroup[1])
          }
          // console.log(queryCondition.join(' AND '))
          this.urlChangeParams[this.curTabState.queryCondition] = queryCondition.join(' AND ')
        } else {
          searchProps.forEach(item => {
            queryCondition.push(item + '=\'' + handleSpecialValue(value) + '\'')
          })
          this.urlChangeParams[this.curTabState.queryCondition] = queryCondition.join(' OR ')
        }
      }
      this.changeUrlTabState()
      this.jump(this.route, columnName, value, operationType.fourthMenu)
    },
    shrink () {
      this.showMenu = !this.showMenu
    },
    submit () {
      this.$refs.changePassForm.validate((valid) => {
        if (valid) {
          put(api.pin, {
            oldPin: this.changePassForm.oldPwd,
            newPin: this.changePassForm.newPwd
          }).then(res => {
            if (res.code === 200) {
              this.$message.success('Success')
              this.showChangePin = false
            } else if (res.code === 518005) {
              this.$message.error('密码错误')
            } else {
              this.$message.error(res.message)
            }
          }).catch(e => {
            console.error(e)
            if (e.response.data && e.response.data.message) {
              this.$message.error(e.response.data.message)
            } else {
              this.$message.error('Something went wrong...')
            }
          })
        } else {
          return false
        }
      })
    },
    changeUrlTabState () {
      if (this.urlChangeParams && JSON.stringify(this.urlChangeParams) !== '{}') {
        const { query } = this.$route
        const newUrl = urlParamsHandler(window.location.href, query, this.urlChangeParams)
        overwriteUrl(newUrl)
      }
      this.urlChangeParams = {}
    },
    async handleCurDrilldownTableConfig (thirdMenu) {
      // const userId = localStorage.getItem(storageKey.userId)
      const tableType = this.$route.params ? this.$route.params.typeName : 'networkOverview'
      const metric = this.getUrlParam(this.curTabState.tableMetric, 'Bits/s')
      const drillDownTableConfigs = await combineDrilldownTableWithUserConfig()
      const currentTableConfig = drillDownTableConfigs.find(config => config.route === tableType)
      const tables = currentTableConfig ? currentTableConfig.tables : []
      const commonTabList = currentTableConfig ? currentTableConfig.tabs : []
      if (tables && tables.length > 0) {
        const curTable = tables.find(table => table.id === tableType)
        if (curTable) {
          const tabList = getTabList(curTable, metric)// 未下钻的tab列表
          if (tabList && tabList.length > 0) {
            combineTabList(tableType, tabList, commonTabList)
            tabList.forEach(item => {
              if (item.label === thirdMenu) {
                item.checked = true
              }
            })
          }
        }
      }
    },
    jump (route, columnName, columnValue, opeType) {
      if (route === '/panel/linkMonitor' && opeType === 3) {
        return true
      }
      this.showMenu = false
      const menus = this.breadcrumb
      if (opeType) {
        this.urlChangeParams[this.curTabState.tabOperationBeforeType] = this.getUrlParam(this.curTabState.tabOperationType, '', true)
        this.urlChangeParams[this.curTabState.tabOperationType] = opeType
        if (opeType === 3) {
          this.urlChangeParams.queryCondition = ''
        }
      } else {
        this.urlChangeParams[this.curTabState.tabOperationType] = operationType.mainMenu
      }
      if (!columnName) { // 点击第二级菜单
        this.$store.commit('setNetworkOverviewTabList', [])
      }
      // 清空网络概况的特殊面包屑
      this.$store.getters.menuList.forEach(menu => {
        if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            if (this.$route.path === child.route) {
              if (columnValue) { // 点击的为值
                child.columnValue = columnValue
                child.columnName = columnName
                this.urlChangeParams[this.curTabState.thirdMenu] = columnName
                this.urlChangeParams[this.curTabState.fourthMenu] = columnValue
                // const tabObjGroup = networkOverviewTabList.filter(item => item.label == columnName)
                // let curTab = this.getCurTabByLabel()
                // const type = curTab ? curTab.prop : ''
                // this.curTabProp = this.$route.query.dimensionType ? this.$route.query.dimensionType : null
                // this.urlChangeParams[this.curTabState.dimensionType] = type
                this.urlChangeParams[this.curTabState.panelName] = columnValue
              } else if (columnName) { // 点击的为列名
                child.columnValue = ''
                child.columnName = columnName
                this.urlChangeParams[this.curTabState.thirdMenu] = columnName
                this.urlChangeParams[this.curTabState.fourthMenu] = ''
                this.urlChangeParams[this.curTabState.panelName] = columnName
                const tableType = this.$route.params ? this.$route.params.typeName : 'networkOverview'
                const metric = this.getUrlParam(this.curTabState.tableMetric, 'Bits/s')
                const curTab = getDefaultCurTab(tableType, metric, columnName)
                this.urlChangeParams[this.curTabState.curTab] = curTab.prop
                this.urlChangeParams[this.curTabState.dimensionType] = curTab ? curTab.prop : ''
                this.$_.omit(this.urlChangeParams, [this.curTabState.queryCondition, this.curTabState.networkOverviewBeforeTab])
              } else {
                child.columnName = ''
                child.columnValue = ''
                this.$_.omit(this.urlChangeParams, [this.curTabState.thirdPanel, this.curTabState.fourthPanel, this.curTabState.thirdMenu, this.curTabState.fourthMenu, this.curTabState.dimensionType, this.curTabState.panelName, this.curTabState.curTab, this.curTabState.queryCondition, this.curTabState.networkOverviewBeforeTab])
              }
            }
          })
        }
      })
      this.changeUrlTabState()
      if (opeType === 2 || opeType === 0) { // 二级菜单 或主菜单
        // 如果有四级菜单，则将四级菜单对应tab的checked设置为true:根据columnName和columnValue 或 url判断不准确
        if (menus[3]) {
          this.handleCurDrilldownTableConfig(this.breadcrumb[2], this.breadcrumb[3])
        }
        this.$router.push({
          path: route,
          query: {
            t: +new Date()
          }
        })
      } else if (opeType === 3) {
        this.$router.push({
          query: {
            ...this.$route.query,
            fourthPanel: '',
            t: +new Date()
          }
        })
      } else if (opeType !== 4) {
        this.$router.push({
          query: {
            ...this.$route.query,
            fourthPanel: '',
            thirdPanel: '',
            t: +new Date()
          }
        })
      }
      if (route === this.route) {
        this.refresh()
        return
      }
      if (route) {
        this.$router.push({
          path: route,
          query: {
            t: +new Date()
          }
        })
      }
    },
    dropDownSearch () {
      this.curPageNum = 1
      this.initDropdownList()
    },
    refresh () {
      this.$emit('refresh')
    },
    refreshPanel (menu) {
      if (this.breadcrumb.length >= 4) {
        const breadList = this.breadcrumb.splice(3, this.breadcrumb.length - 3)
        this.breadcrumb = ref(breadList)
      }
    },
    scrollList () {
      const obj = document.getElementById('breadcrumbSelectDropdown')
      if (obj.scrollTop + obj.clientHeight === obj.scrollHeight) {
        this.initDropdownList()
      }
    }
  }
}
</script>
