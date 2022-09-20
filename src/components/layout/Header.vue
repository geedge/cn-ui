<template>
  <div class="cn-header">
    <div class="cn-header__banner">
      <div class="banner__left">
        <span @click="shrink" class="shrink-button" :class="{'shrink-button--collapse': showMenu}"><i class="cn-icon cn-icon-navigation"></i></span>
        <img alt="loading..." height="26" :src="logo?logo:require('../../assets/img/logo-header.svg')"/>
      </div>
      <!--个人操作-->
      <div class="personal">
        <el-dropdown>
          <div class="header-menu--item"><i class="cn-icon cn-icon-language"></i></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div id="header-to-english" :style="language === 'en'?'color:#0091ff':''" @click="changeLocal('en')">English</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div id="header-to-chinese" :style="language === 'cn'?'color:#0091ff':''" @click="changeLocal('cn')">中文</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown>
          <div class='login-user header-menu--item'>{{username}}&nbsp;<i class="cn-icon cn-icon-arrow-down"></i></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div id="header-to-changepin" @click="showPinDialog">{{$t('overall.changePassword')}}</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div id="header-to-logout" @click="logout">{{$t('overall.logout')}}</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="cn-header__nav">
      <i class="cn-icon cn-icon-a-NetworkAnalytics"></i>
      <el-breadcrumb class="header__left-breadcrumb" separator=">">
        <el-breadcrumb-item class="header__left-breadcrumb-item" :id="`breadcrumb${item}`" :title="item" v-for="(item,index) in breadcrumb" :key="item">
          <template v-if="index===3">
            <div class="header__left-breadcrumb-item-select">
              <el-popover placement="bottom-start"
                          ref="breadcrumbPopover"
                          :show-arrow="false"
                          :append-to-body="false"
                          :hide-after="0"
                          :show-after="0"
                          popper-class="breadcrumb__popper"
                          @show="showBreadcrumbPopover(item)"
                          @hide="hideBreadcrumbPopover()"
                          trigger="click">
                <template #reference>
                  <div class="breadcrumb-button"  id="breadcrumbButton" :class="showBackground?'breadcrumb-button__active':''"  >
                     <span  id="breadcrumbValue"> {{item}}</span><i class="cn-icon-xiala cn-icon"></i>
                  </div>
                </template>
                <el-row type="flex" justify="center" style="width: fit-content;flex-direction: column;">
                  <div class="search-input">
                    <el-input placeholder="Filter options"
                              size="mini"
                              v-model="dropDownValue"
                              @input="dropDownSearch"></el-input>
                  </div>
                  <ul class="select-dropdown" id="breadcrumbSelectDropdown"  @scroll="scrollList()">
                    <li v-for="item in breadcrumbColumnValueListShow" title='' :key="item" :id="item" class="select-dropdown__item" @click="changeValue(item)" :class="selected?'':''">
                      <span>{{item}}</span>
                    </li>
                  </ul>
                </el-row>
              </el-popover>
            </div>
          </template>
          <template v-else-if="index===2">
            <span class="route-menu" @click="jump(path,item,'',3)">{{$t(item)}}</span>
          </template>
          <template v-else-if="index===1">
            <span class="route-menu" @click="jump(path,'','',2)" v-if="route.indexOf('detection') === -1">{{item}}</span>
            <div class="header__left-breadcrumb-item-select" v-if="route.indexOf('detection') > -1">
              <el-popover placement="bottom-start"
                          v-if="route.indexOf('detection') > -1"
                          ref="breadcrumbPopover"
                          :show-arrow="false"
                          :append-to-body="false"
                          :hide-after="0"
                          :show-after="0"
                          popper-class="breadcrumb__popper"
                          trigger="click">
                <template #reference>
                  <div class="breadcrumb-button"  id="breadcrumbButton2" :class="showBackground?'breadcrumb-button__active':''"  v-if="route.indexOf('detection') > -1">
                    <span id="breadcrumbValue2"> {{item}}</span><i class="cn-icon-xiala cn-icon"></i>
                  </div>
                </template>
                <el-row type="flex" justify="center" style="width: fit-content;flex-direction: column;">
                  <ul class="select-dropdown" id="breadcrumbSelectDropdown2">
                    <li v-for="item in detectionMenuList" title='' :key="item.name" :id="item.name" class="select-dropdown__item" @click="jump(item.path)">
                      <span>{{$t(item.i18n)}}</span>
                    </li>
                  </ul>
                </el-row>
              </el-popover>
            </div>
          </template>
          <template v-else>
            <span>{{item}}</span>
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
        <div class="left-menu" v-for="menu in otherMenu" :key="menu.id" @click="jump(menu.route)">
          <i :class="menu.icon"></i>
          <span>{{$t(menu.i18n || menu.name)}}</span>
          <i class="cn-icon cn-icon-right"></i>
        </div>
      </div>
      <div class="cn-menu__middle">
        <div class="middle-menus middle-menus--network-analytics">
          <div class="middle-menus__header">{{$t('overall.networkAnalytics')}}</div>
          <div class="middle-menus__body">
            <div style="width: 260px;">
              <template v-for="(menu, index) in networkAnalyticsMenu.children" :key="index">
                <div class="middle-menu" v-if="index < 5" @click="jump(menu.route)">{{$t(menu.i18n || menu.name)}}</div>
              </template>
            </div>
            <div>
              <template v-for="(menu, index) in networkAnalyticsMenu.children" :key="index">
                <div class="middle-menu" v-if="index >= 5 && index < 10" @click="jump(menu.route)">{{$t(menu.i18n || menu.name)}}</div>
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
      <el-form  :rules="changePassFormRules" :model="changePassForm" ref="changePassForm">
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
          <el-button @click="showChangePin = false">{{$t('overall.cancel')}}</el-button>
          <el-button type="primary" @click="submit">{{$t('overall.update')}}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { get, put } from '@/utils/http'
import { entityType, storageKey, networkOverviewTabList, operationType, networkOverviewSearchUrl, curTabState } from '@/utils/constants'
import { api } from '@/utils/api'
import { ref } from 'vue'
import { urlParamsHandler, overwriteUrl } from '@/utils/tools'
import { getNowTime, getSecond } from '@/utils/date-util'

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
        oldPwd: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        newPwd: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        newPwd2: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: passwordComparison, trigger: 'blur' }]
      },
      showMenu: false,
      dropDownValue: '',
      breadcrumbColumnValueListShow: [],
      valueMeta: [],
      showBackground: false,
      selected: false,
      valueMenuId: '',
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
      curTabState: curTabState
    }
  },
  computed: {
    networkAnalyticsMenu () {
      return this.$store.getters.menuList.find(menu => menu.code === 'networkAnalytics')
    },
    otherMenu () {
      return this.$store.getters.menuList.filter(menu => menu.code !== 'networkAnalytics')

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
      const breadcrumbMap = []
      this.$store.getters.menuList.forEach(menu => {
        if (this.$_.isEmpty(menu.children) && menu.route) {
          breadcrumbMap.push({ name: this.$t(menu.i18n), path: menu.route, columnName: menu.columnName, columnValue: menu.columnValue })
        } else if (!this.$_.isEmpty(menu.children)) {
          menu.children.forEach(child => {
            breadcrumbMap.push({ name: child.i18n ? this.$t(child.i18n) : child.name, parentName: menu.i18n ? this.$t(menu.i18n) : menu.name, path: child.route, columnName: child.columnName, columnValue: child.columnValue })
          })
        }
      })
      const breadcrumb = breadcrumbMap.find(b => this.path === b.path)
      const thirdMenu = this.getUrlParam(this.curTabState.thirdMenu, '')
      const fourthMenu = this.getUrlParam(this.curTabState.fourthMenu, '')
      if (breadcrumb.columnValue) {
        return breadcrumb ? [breadcrumb.parentName, breadcrumb.name, breadcrumb.columnName, breadcrumb.columnValue] : []
      } else if (breadcrumb.columnName) {
        return breadcrumb ? [breadcrumb.parentName, breadcrumb.name, breadcrumb.columnName] : []
      } else if (fourthMenu) {
        return breadcrumb ? [breadcrumb.parentName, breadcrumb.name, thirdMenu, fourthMenu] : []
      } else if (thirdMenu) {
        return breadcrumb ? [breadcrumb.parentName, breadcrumb.name, thirdMenu] : []
      } else {
        return breadcrumb ? [breadcrumb.parentName, breadcrumb.name] : []
      }
    },
    path () {
      const { path } = useRoute()
      return path
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
    }
  },
  mounted () {
    this.from = Object.keys(this.entityType)[0]
    this.initDropdownList()
  },
  setup () {
    const dateRangeValue = 60
    const { startTime, endTime } = getNowTime(dateRangeValue)
    const chartTimeFilter = ref({ startTime, endTime, dateRangeValue })
    return {
      chartTimeFilter,
      entityType // 所有entity类型，用于header下拉框选择
    }
  },
  methods: {
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
    initDropdownList () {
      const currentValue = document.getElementById('breadcrumbValue') ? document.getElementById('breadcrumbValue').innerText : ''
      // const columnName = this.$store.getters.getBreadcrumbColumnName
      const columnName = this.getUrlParam(this.curTabState.thirdMenu, '')
      let type = 'ip'
      const tabObjGroup = networkOverviewTabList.filter(item => item.label == columnName)
      if (tabObjGroup && tabObjGroup.length > 0) {
        const curTab = tabObjGroup[0]
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
      get(networkOverviewSearchUrl.drilldownList, params).then(response => {
        if (response.code === 200) {
          this.breadcrumbColumnValueListShow = response.data.result
          this.$nextTick(() => {
            this.breadcrumbColumnValueListShow.forEach(item => {
              const selectedDom = document.getElementById(item)
              if (selectedDom) {
                if (item === currentValue) {
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
    getUrlParam (param, defaultValue,isNumber) {
      if(isNumber){
        return this.$route.query[param] ? Number(this.$route.query[param]) : defaultValue
      }else {
        return this.$route.query[param] ? this.$route.query[param] : defaultValue
      }
    },
    changeValue (value) {
      // 设置面包屑显示的内容及hover时的title
      document.getElementById('breadcrumbValue').innerText = value
      document.getElementById('breadcrumbButton').setAttribute('title', value)
      document.getElementById(this.valueMenuId).setAttribute('title', value)
      document.getElementById('breadcrumbButton').click()
      // const columnName = this.$store.getters.getBreadcrumbColumnName
      const columnName = this.getUrlParam(this.curTabState.thirdMenu, '')
      const tabObjGroup = networkOverviewTabList.filter(item => item.label == columnName)
      if (tabObjGroup && tabObjGroup.length > 0) {
        const curTab = tabObjGroup[0]
        if (curTab) {
          const queryCondition = []
          const searchProps = curTab.dillDownProp
          if (curTab.prop === 'protocolPort') {
            const valueGroup = value.split(':')
            if (valueGroup) {
              queryCondition.push("common_l7_protocol='" + valueGroup[0] + "'")
              queryCondition.push('common_server_port=' + valueGroup[1])
            }
            console.log(queryCondition.join(' AND '))
            // this.$store.commit('setQueryCondition', queryCondition.join(' AND '))
            this.changeUrlTabState(this.curTabState.queryCondition, queryCondition.join(' AND '))
          } else {
            searchProps.forEach(item => {
              queryCondition.push(item + "='" + value + "'")
            })
            // this.$store.commit('setQueryCondition', queryCondition.join(' OR '))
            this.changeUrlTabState(this.curTabState.queryCondition, queryCondition.join(' OR '))
          }
        }
      }

      this.jump(this.path, columnName, value, operationType.fourthMenu)
    },
    shrink () {
      this.showMenu = !this.showMenu
    },
    submit () {
      this.$refs.changePassForm.validate((valid) => {
        if (valid) {
          put(api.pin, { oldPin: this.changePassForm.oldPwd, newPin: this.changePassForm.newPwd }).then(res => {
            if (res.code === 200) {
              this.$message.success('Success')
              this.showChangePin = false
            } else if (res.code === 518005) {
              this.$message.error('密码错误')
            }
          })
        } else {
          return false
        }
      })
    },
    changeUrlTabState (param, value) {
      const { query } = this.$route
      const newQuery = {}
      newQuery[param] = value
      const newUrl = urlParamsHandler(window.location.href, query, newQuery)
      overwriteUrl(newUrl)
    },
    jump (route, columnName, columnValue, opeType) {
      this.showMenu = false
      if (opeType) {
        //this.$store.commit('setTabOperationBeforeType', this.$store.getters.getTabOperationType)
        //this.$store.commit('setTabOperationType', opeType)
        this.changeUrlTabState(this.curTabState.tabOperationBeforeType, this.getUrlParam(this.curTabState.tabOperationType, '',true))
        this.changeUrlTabState(this.curTabState.tabOperationType, opeType)
      } else {
        //this.$store.commit('setTabOperationType', operationType.mainMenu)
        this.changeUrlTabState(this.curTabState.tabOperationType, operationType.mainMenu)
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
                // this.$store.commit('setBreadcrumbColumnValue', columnValue)
                // this.$store.commit('setBreadcrumbColumnName', columnName)
                this.changeUrlTabState(this.curTabState.thirdMenu, columnName)
                this.changeUrlTabState(this.curTabState.fourthMenu, columnValue)
                const tabObjGroup = networkOverviewTabList.filter(item => item.label == columnName)
                const type = tabObjGroup && tabObjGroup[0] ? tabObjGroup[0].prop : ''
                // this.$store.commit('setDimensionType', type)
                this.changeUrlTabState(this.curTabState.dimensionType, type)
                // this.$store.commit('setPanelName', columnValue)
                this.changeUrlTabState(this.curTabState.panelName, columnValue)
              } else if (columnName) { // 点击的为列名
                child.columnValue = ''
                child.columnName = columnName
                // this.$store.commit('setBreadcrumbColumnValue', '')
                // this.$store.commit('setBreadcrumbColumnName', columnName)
                this.changeUrlTabState(this.curTabState.thirdMenu, columnName)
                this.changeUrlTabState(this.curTabState.fourthMenu, '')
                // this.$store.commit('setPanelName', columnName)
                this.changeUrlTabState(this.curTabState.panelName, columnName)
                const tabList = this.$store.getters.getNetworkOverviewTabList
                const curTab = tabList.filter(item => item.label === columnName)[0]
                this.changeUrlTabState(this.curTabState.curTab, curTab)
                // this.$store.commit('setDimensionType', curTab ? curTab.prop : '')
                this.changeUrlTabState(this.curTabState.dimensionType, curTab ? curTab.prop : '')
                // this.$store.commit('setQueryCondition', '')
                this.changeUrlTabState(this.curTabState.queryCondition, '')
                //this.$store.commit('setNetworkOverviewBeforeTab', null)
                this.changeUrlTabState(this.curTabState.networkOverviewBeforeTab, '')
              } else {
                child.columnName = ''
                child.columnValue = ''
                // this.$store.commit('setBreadcrumbColumnValue', '')
                // this.$store.commit('setBreadcrumbColumnName', '')
                this.changeUrlTabState(this.curTabState.thirdMenu, '')
                this.changeUrlTabState(this.curTabState.fourthMenu, '')
                // this.$store.commit('setDimensionType', '')
                this.changeUrlTabState(this.curTabState.dimensionType, '')
                // this.$store.commit('setPanelName', '')
                this.changeUrlTabState(this.curTabState.panelName, '')
                // this.$store.commit('setBreadcrumbColumnValueList', [])
                this.changeUrlTabState(this.curTabState.curTab, null)
                // this.$store.commit('setQueryCondition', '')
                this.changeUrlTabState(this.curTabState.queryCondition, '')
                //this.$store.commit('setNetworkOverviewBeforeTab', null)
                this.changeUrlTabState(this.curTabState.networkOverviewBeforeTab, '')
              }
            }
          })
        }
      })
      // console.log(this.$store.getters.getDimensionType)
      if (opeType === 3) {
        this.$router.push({
          query: { ...this.$route.query, fourthPanel: '' }
        })
      } else if (opeType != 4) {
        this.$router.push({
          query: { ...this.$route.query, fourthPanel: '', thirdPanel: '' }
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
