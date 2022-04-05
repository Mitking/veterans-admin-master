<template>
  <div class="m10">
    <div>是否有效: {{ status }}</div>
    <el-divider />
    <div>
      <el-form :model="form" style="width: 400px;">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="" />
        </el-form-item>
      </el-form>
      <el-button v-if="!status" type="primary" @click="auth">授权</el-button>
    </div>
  </div>
</template>

<script type="text/javascript">
import { getAuthStatus, getAuthToken } from '@/api/store/auth'
export default {
  name: 'GetToken',
  data() {
    return {
      status: false,
      form: {
        username: null,
        password: null
      }
    }
  },
  created() {
    this.getAuthStatus()
  },
  methods: {
    getAuthStatus() {
      getAuthStatus().then(res => {
        this.status = res.data
      })
    },
    auth() {
      if (!this.form.username || !this.form.password) {
        this.$message.info('输入信息有误')
        return false
      }
      getAuthToken(this.form).then(res => {
        this.getAuthStatus()
      })
    }
  }
}
</script>

<style scoped>
</style>
