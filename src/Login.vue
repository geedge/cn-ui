<template>
  <div class="background">
  <div class="logins">
    <div class="inside">
      <div class="title" style="margin-top:70px">
        <img src="../public/images/cion.png" />
      </div>
      <el-form class="five">
        <el-form-item>
          <el-input
              prefix-icon="el-icon-user"
              class="inputStyle tow"
            v-model="username"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
              class="inputStyle"
              prefix-icon="el-icon-lock"
              type="password"
            v-model="pin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
            class="inputStyle button"
            @click="login"
              style=" font-size: 16px;"
            >登陆</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { post } from '@/utils/http'
import bus from '@/utils/bus'

export default {
  name: 'Login',
  data () {
    return {
      username: 'admin',
      pin: 'Nezha2021'
    }
  },
  methods: {
    ...mapActions(['loginSuccess']),
    login () {
      post('sys/login', { username: this.username, pin: this.pin }).then(
        res => {
          if (res.code === 200) {
            localStorage.setItem('cn-username', this.username)
            this.loginSuccess(res)
          }
        }
      )
    }
  }
}
</script>

<style lang="scss">
body{
  background-color: #000C18;
}
.background:after{
  width: 100%;
  height: 100%;
  background-color: #000C18;
  opacity: 0.2;
}

 .logins{
 background-color: #000C18;
  background-size: auto;
  background-repeat: round;
  background-image: url('../public/images/bg.png');
  display: flex;
  justify-content: center;
  align-items: center;
   width: 1920px;
   height: 1080px;
   margin: auto;
}

.inside {
  opacity: 0.78;
  background: #051a37;
  border-radius: 6px;
  width: 368px;
  height: 400px;
  /* margin-top:340px; */
}
.inside > div {
  display: block;
}

.title {
  /* margin-top: 70px; */
  margin-left: 52px;
  margin-right: 10px;
}
.inputStyle{
  width: 300px;
  height: 40px;
}
 .tow:first-of-type{
   margin-top: 45.57px;
 }
 .five{
   width: 300px;
   height: 250px;
   margin: auto;
 }
.button {
  background: #0091ff;
  color: #fff;
  border-radius: 4px;
  border: 0px;
  font-family: PingFangSC-Regular;
  text-align: left;
  line-height: 22px;
  font-weight: 400;
  text-align: center;
}
</style>
