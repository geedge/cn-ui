<template>
  <div>
    <el-input v-model="username"></el-input>
    <el-input v-model="pin"></el-input>
    <button type="button" @click="login">Login</button>
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
      post('sys/login', { username: this.username, pin: this.pin }).then(res => {
        if (res.code === 200) {
          this.loginSuccess(res)
        }
      })
    }
  },
  mounted () {
  }
}
</script>

<style>

</style>
