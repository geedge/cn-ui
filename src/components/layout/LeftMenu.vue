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
            v-if="menu.children && menu.children.length > 0"
            :key="index"
            :index="`${index}`">
          <template #title>
            <i :class="menu.icon"></i>
            <span>{{menu.i18n ? $t(menu.i18n) : menu.name}}</span>
          </template>
          <template v-for="(secondMenu, secondIndex) in menu.children">
            <template v-if="secondMenu.children && secondMenu.children.length > 0">
              <el-submenu
                  :key="secondIndex"
                  :index="`${index}-${secondIndex}`">
                <template #title>
                  <span class="data-column__span">{{secondMenu.i18n ? $t(secondMenu.i18n) : secondMenu.name}}</span>
                </template>
                <el-menu-item
                    v-for="(thirdMenu, thirdIndex) in secondMenu.children"
                    :key="`${index}-${secondIndex}-${thirdIndex}`"
                    :index="thirdMenu.route">
                  {{thirdMenu.i18n ? $t(thirdMenu.i18n) : thirdMenu.name}}
                </el-menu-item>
              </el-submenu>
            </template>
            <template v-else>
              <el-menu-item
                  :key="secondIndex"
                  :index="secondMenu.route">
                {{secondMenu.i18n ? $t(secondMenu.i18n) : secondMenu.name}}
              </el-menu-item>
            </template>
          </template>
        </el-submenu>
        <el-menu-item
            v-else
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
        // this.refresh()
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

<style lang="scss">
.left-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: $--menu-background-color;

  .el-menu-item .cn-icon, .el-submenu .cn-icon {
    display: inline-block;
    vertical-align: middle;
    margin-right: 5px;
    width: 24px;
    text-align: center;
    font-size: 18px;
  }
  >.el-menu:not(.el-menu--collapse) {
    width: 240px;
  }
  >.el-menu.menu-list {
    height: calc(100% - 110px);
    border-right: none;
    overflow: auto;

    // el-submenu  active字色
    .el-submenu.is-active .el-submenu__title,
    .el-submenu.is-active .el-submenu__title>i,
    .el-menu-item.is-active {
      color: white !important;
    }

    // el-submenu  active且open背景色
    .el-submenu__title:not(.is-active):hover, .el-menu-item:not(.is-active):hover, .el-menu-item:not(.is-active):focus {
      background-color: mix($--color-white, $--menu-background-color, 7%) !important;
    }
    .is-active.is-opened {
      .el-submenu__title, .el-menu-item:not(.is-active) {
        background-color: $--menu-hover-background-color !important;
      }
    }
    .el-menu-item {
      overflow: hidden;
      text-overflow: ellipsis;

      &.is-active {
        background-color: $--color-primary;
      }
    }

    .el-menu-item, .el-submenu__title {
      height: 46px;
      line-height: 46px;
    }
  }

  /*---滚动条默认显示样式--*/
  >.el-menu::-webkit-scrollbar-thumb {
    background-color: rgba(255,255,255,.4);
    border-radius: 2px;
    border: none;
  }
  /*---鼠标点击滚动条显示样式--*/
  >.el-menu::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255,255,255,.3);
    border-radius: 2px;
  }
  /*---滚动条大小--*/
  >.el-menu::-webkit-scrollbar {
    width: 6px;
    height: 14px;
  }
  /*---顶部logo---*/
  >.el-menu.header-logo {
    border-right: none;
    >.el-menu-item {
      padding: 13px 0 0 18px !important;
      height: 50px;
      border-right: 1px solid #202F3F;
      background-color: #182534 !important;

      .logo {
        display: flex;

        img {
          box-shadow: 0 0 2px 0 rgba(0,0,0,0.50);
        }

        .system-name {
          padding-left: 8px;
          color: white;
          font-size: 14px;
          letter-spacing: 0;
          line-height: 34px;
          font-weight: bold;
        }
      }
    }
  }
}
.el-menu--popup {
  .el-menu-item {
    height: 49px;
    line-height: 49px;
  }
}
</style>
