<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      label-width="100px"
      style="margin:24px;"
    >
      <SelectOrgStore ref="OrgStore" :type="2" @updateData="form=Object.assign(form,$event)" />
      <el-form-item style="width:300px" prop="oldPassword" label="旧密码" :rules="[{ required: true, message: '请输入旧密码', trigger: 'blur' }]">
        <el-input v-model="form.oldPassword" clearable type="password" />
      </el-form-item>
      <el-form-item style="width:300px" label="新密码" prop="newPassword" :rules="[{ required: true, message: '请输入新密码', trigger: 'blur' },{ validator: validatePass, trigger: 'submit' }]">
        <el-input v-model="form.newPassword" clearable type="password" />
      </el-form-item>
      <el-form-item style="width:300px" label="确认新密码" prop="newPasswordSure" :rules="[{ required: true, message: '请再次输入新密码', trigger: 'blur' },{ validator: validatePass, trigger: 'submit' }]" clearable type="password">
        <el-input v-model="form.newPasswordSure" type="password" />
      </el-form-item>
      <el-form-item style="margin-left:130px">
        <el-button type="primary" :loading="loading" @click="submit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import { changeStorePasswd } from '@/api/core/changestorepass'
export default {
  name: 'ChangeStorePasswd',
  components: { SelectOrgStore },
  data() {
    return {
      form: {
        'newPassword': '',
        'oldPassword': '',
        'orgId': null,
        'storeId': null,
        'newPasswordSure': ''
      },
      loading: false
    }
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    message(res) {
      if (res.code === 200) {
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.OrgStore.searchform = { orgId: this.$store.getters.accountType === 2 ? this.$store.getters.orgId : '', storeId: null }
          this.$refs.form.resetFields()
        }, 0)
      }
      this.loading = false
    },
    submit() { // 审核
      this.loading = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$confirm(`确认修改吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            changeStorePasswd(this.form).then(res => {
              this.message(res)
            }).finally(() => {
              this.loading = false
            })
          }).catch(() => {
            this.loading = false
            this.$message.info('已取消')
          })
        } else {
          this.loading = false
          return false
        }
      })
    },
    validatePass(rule, value, callback) {
      if (this.form.newPassword !== this.form.newPasswordSure) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
  }
}
</script>
<style scoped>
</style>
