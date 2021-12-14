<template>
  <div class="left-menu">
    <el-menu
        :collapse="isShrink"
        active-text-color="#ffffff"
        class="header-logo"
        text-color="#ffffff">
      <el-menu-item index="logo">
        <div id="home-to-overview" class="logo link">
          <img alt="loading..." height="32" :src="logo?logo:require('../../assets/img/cn-logo-medium.svg')"/>
          <span class="system-name">{{systemName && systemName !== 'undefined' ? systemName : 'dashboard.overview.contentTitle'}}</span>
        </div>
      </el-menu-item>
    </el-menu>
    <el-menu
        :collapse="isShrink"
        :default-active="route"
        class="menu-list"
        mode="vertical"
        unique-opened
        @select="jump">
      <template v-for="(menu, index) in menuList">
        <el-submenu
            v-if="menu.children && menu.children.length > 0 && menu.state === 1"
            :key="index"
            :index="`${index}`">
          <template #title>
            <i :class="menu.icon"></i>
            <span :title="$t(menu.i18n)">{{menu.i18n ? $t(menu.i18n) : menu.name}}</span>
          </template>
          <template v-for="(secondMenu, secondIndex) in menu.children">
            <el-submenu
                v-if="secondMenu.children && secondMenu.children.length > 0 && secondMenu.state === 1"
                :key="secondIndex"
                :index="`${index}-${secondIndex}`">
              <template #title>
                <span class="data-column__span">{{secondMenu.i18n ? $t(secondMenu.i18n) : secondMenu.name}}</span>
              </template>
              <template v-for="(thirdMenu, thirdIndex) in secondMenu.children" :key="`${index}-${secondIndex}-${thirdIndex}`">
                <el-menu-item
                    :title="$t(thirdMenu.i18n)"
                    v-if="thirdMenu.state === 1"
                    :index="thirdMenu.route">
                  {{thirdMenu.i18n ? $t(thirdMenu.i18n) : thirdMenu.name}}
                </el-menu-item>
              </template>
            </el-submenu>
            <el-menu-item
                :title="$t(secondMenu.i18n)"
                v-else-if="secondMenu.state === 1"
                :key="secondIndex * 100"
                :index="secondMenu.route">
              {{secondMenu.i18n ? $t(secondMenu.i18n) : secondMenu.name}}
            </el-menu-item>
          </template>
        </el-submenu>
        <el-menu-item
            :title="menu.i18n"
            v-else-if="menu.state === 1"
            :key="index + 'a'"
            :index="menu.route">
          <i :class="menu.icon"></i>
          <template #title>
            <span class="data-column__span">{{menu.i18n ? $t(menu.i18n) : menu.name}}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'LeftMenu',
  data () {
    return {
      systemName: localStorage.getItem('cn-sys-name'),
      logo: ''
    }
  },
  mounted () {
    const self = this
    window.addEventListener('setItemEvent', function (e) {
      if (e.key === 'cn-sys-logo' && e.value) {
        self.logo = e.value
      }
    })
  },
  computed: {
    menuList () {
      const allMenu = this.$store.getters.menuList
      excludeButtonAndMenu(this.$store.getters.menuList)
      return allMenu
      function excludeButtonAndMenu (menu) {
        for (let i = 0; i < menu.length; i++) {
          if (menu[i].type === 2 || menu[i].type === 3) {
            menu.splice(i, 1)
            i--
          } else {
            if (menu[i].children && menu[i].children.length > 0) {
              excludeButtonAndMenu(menu[i].children)
            }
          }
        }
      }
    },
    route () {
      return this.$route.path
    },
    isShrink () {
      return this.$store.getters.getIsShrink
    }
  },
  methods: {
    jump (route) {
      if (route === this.route) {
        this.refresh()
        return
      }
      this.$router.push({
        path: route,
        query: {
          t: +new Date()
        }
      })
    },
    refresh () {
      this.$emit('refresh')
    }
  }
}
</script>
