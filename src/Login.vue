<template>
  <div class="logins">
    <div class="inside">
      <div class="title" style="margin-top:70px">
        <img src="../public/images/cion.png" />
      </div>
      <el-form class="login__shrink__Box">
        <el-form-item>
          <el-input
              prefix-icon="el-icon-user"
              class="inputStyle login__one_input"
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
              v-loading="loading"
              type="primary"
            class="inputStyle login__button"
            @click="login"
              style=" font-size: 16px;"
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
import { Loading } from 'element-ui'
export default {

  name: 'Login',
  data () {
    return {
      loading: false,
      username: 'admin',
      pin: 'Nezha2021'
    }
  },
  methods: {
    ...mapActions(['loginSuccess']),
    login () {
      if (!this.blockOperation.query) {
        this.blockOperation.query = true
      } else {
        return
      }
      post('sys/login', { username: this.username, pin: this.pin }).then(
        res => {
          this.blockOperation.query = false
          this.loading = true
          setTimeout(() => {
            if (res.code === 200) {
              localStorage.setItem('cn-username', this.username)
              this.loginSuccess(res)
            }
          }, 2000)
        }
      )
    }
  }
}
</script>

<style lang="scss">
 .logins{
  background-color: #000C18;
  background-size: auto;
  background-repeat: round;
  background-image: url('../public/images/bg.png');
  display: flex;
   height: 100%;
  justify-content: center;
  align-items: center;
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
 .login__one_input:first-of-type{
   margin-top: 45.57px;
 }
 .login__shrink__Box{
   width: 300px;
   height: 250px;
   margin: auto;
 }
.login__button {
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
