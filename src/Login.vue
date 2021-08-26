<template>
  <div class="logins">
    <div class="inside">
      <div class="title" style="margin-top:70px">
        <img src="../public/images/cion.png" />
      </div>
      <el-form class="login__box">
        <el-form-item>
          <el-input
              prefix-icon="el-icon-user"
              class="login--input login__input"
            v-model="username"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
              class="login--input"
              prefix-icon="el-icon-lock"
              type="password"
              @keyup.enter="login"
            v-model="pin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              v-loading="loading"
              type="primary"
              class="login--input login--butotn"
              @click="login"
              @keyup.enter="login"
              style="font-size: 16px;"
            >Login</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { post } from '@/utils/http'
export default {

  name: 'Login',
  data () {
    return {
      loading: false,
      username: '',
      pin: ''
    }
  },
  methods: {
    ...mapActions(['loginSuccess']),
    login () {
      if (!this.username || !this.pin) {
        return
      }
      // if (!this.blockOperation.query) {
      //   this.blockOperation.query = true
      // } else {
      //   return
      // }
      post('sys/login', { username: this.username, pin: this.pin }).then(
        res => {
          if (res.code === 200) {
            this.loginSuccess(res)
            localStorage.setItem('cn-username', this.username)
          } else if (res.code === 518005) {
            this.$message.error(this.$t('tip.incorrectUsernameOrPassword'))
          } else {
            this.$message.error(this.$t('tip.unknownError'))
          }
        }
      ).finally(() => {
        this.loading = false
        this.blockOperation.query = false
      })
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
.login--input{
  width: 300px;
  height: 40px;
}
 .login__input:first-of-type{
   margin-top: 45.57px;
 }
 .login__box{
   width: 300px;
   height: 250px;
   margin: auto;
 }
.login--butotn {
  background: #0091ff;
  color: #fff;
  border-radius: 4px;
  border: 0;
  font-weight: 400;
  text-align: center;
}
</style>
