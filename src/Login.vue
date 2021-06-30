<template>
  <div class="wrap">
    <div class="inside">
      <div class="title" style="margin-top:70px">
        <img src="/logo.png" />
      </div>
      <el-form>
        <el-form-item>
          <el-input
              prefix-icon="el-icon-user"
            style="width: 300px;height: 40px;margin-left:34px;margin-top:45.57px"
            v-model="username"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
              prefix-icon="el-icon-lock"
              type="password"
            style="width: 300px;height: 40px;margin-left:34px;"
            v-model="pin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            style=" margin-bottom: -62px;"
            class="button"
            @click="login"
            >登陆</el-button
          >
        </el-form-item>
      </el-form>
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

<style>
body{
  background-color: #000c18;
}
 .wrap{
  background-color: #000c18;
  background-size: 100% 100%;
  background-repeat: no-repeat;
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

.button {
  background: #0091ff;
  color: #fff;
  border-radius: 4px;
  border: 0px;
  font-family: PingFangSC-Regular;
  font-size: 16px;
  text-align: left;
  line-height: 22px;
  font-weight: 400;
  width: 300px;
  height: 40px;
  text-align: center;
  margin-top: 20px;
  margin-left: 34px;
}
</style>
