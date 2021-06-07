<template>
  <div class="cn-header">
<!--    <div class="left-menu&#45;&#45;pin" :class="false ? 'left-menu&#45;&#45;pin-normal' : 'left-menu&#45;&#45;pin-reverse'" @click="shrink"><i :class="{'icon-reverse': false}" class="el-icon-s-fold"></i></div>-->
    <!--导航面包屑-->
    <div style="flex-grow: 1"></div>
    <!--个人操作-->
    <div class="personal">
      <el-dropdown>
        <div class="header-menu--item">Language</div>
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
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <div id="header-to-changepin" @click="showPinDialog">Change pin</div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div id="header-to-logout" @click="logout">Sign out</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
<!--    <change-password :cur-user="username" :show-dialog="showChangePin" @click="showPinDialog" @dialogClosed="dialogClosed"></change-password>-->
  </div>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {
      username: 'admin', // sessionStorage.getItem('cn-username'),
      language: localStorage.getItem('cn-language') ? localStorage.getItem('cn-language') : 'en',

      showChangePin: false
    }
  },
  methods: {
    changeLocal (lang) {
      if (lang !== localStorage.getItem('cn-language')) {
        localStorage.setItem('cn-language', lang)
        // this.$i18n.locale = lang
        window.location.reload()
      }
    },
    showPinDialog () {
      this.showChangePin = true
    },
    logout () {
    },
    refreshLang () {
      this.language = localStorage.getItem('cn-language')
      this.$i18n.locale = this.language
      this.$nextTick(() => {
        window.location.reload()
      })
    },
    shrink () {
    }
  }
}
</script>

<style lang="scss">
.cn-header {
  display: flex;
  height: 50px;

  .header-menu {
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;

    .el-dropdown {
      width: 60px;
      text-align: center;
      height: 36px;
      line-height: 50px;
      .el-dialog{
        width: 1000px;
        height: 70px;
        .el-dialog__header{
          .el-dialog__title{
            color: #fff;
          }
          .el-dialog__close{
            color: #fff;
            line-height: 50px;
            font-size: 30px;
          }
        }
      }
    }
  }
  .header-menu--item {
    color: #778391;
    cursor: pointer;
    transition: color linear .2s;
    i {
      font-size: 18px;
    }
  }
  .header-menu--item:hover {
    color: #313336;
  }
  .personal {
    display: flex;
    .el-dropdown {
      margin: 0 10px 0 30px;
      height: 36px;
      line-height: 50px;
      text-align: center;
    }
    .login-user {
      color: #333;
      i {
        color: #999;
        font-size: 12px;
      }
    }
  }
  .left-menu--pin {
    width: 20px;
    font-size: 20px;
    font-weight: 100;
    color: #999999;
    transition: all .4s;
    height: 100%;
    line-height: 50px;
    margin-left: 10px;
    i {
      transform: rotateY(0);
      transition: transform .4s;
    }
    i.icon-reverse {
      transform: rotateY(180deg);
    }
  }
  .left-menu--pin-normal{
  }
  .left-menu--pin-reverse{
  }
}
.link-title a {
  color: inherit;
  text-decoration: none;
}
.cn-breakcrumb {
  padding-left: 15px;
  line-height: 50px;

  .el-breadcrumb__item .el-breadcrumb__inner {
    color: #999;
  }
}
</style>
