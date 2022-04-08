<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item v-if="form.id === ''" prop="accountId" label="账套">
        <el-select v-model="form.accountId" style="width: 100%;">
          <el-option
            v-for="item in accountList"
            :key="item.id"
            :value="item.id"
            :label="item.accountNum+'-'+item.orgName"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="orgName" label="组织名称">
        <el-input v-model="form.orgName" />
      </el-form-item>
      <el-form-item prop="orgName" label="组织简称">
        <el-input v-model="form.orgShortName" />
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="onSubmit">提交</el-button>
  </div>
</template>
<script>
import { saveOrUpdate } from '@/api/ums/org'
import { getAccountList } from '@/api/ums/account'

export default {
  name: 'OrgForm',
  props: {
    orgEntity: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      form: {},
      accountList: [],
      rules: {
        accountId: [
          { required: true, message: '请选择账套' }
        ],
        orgName: [
          { required: true, message: '请输入组织名称' },
          { min: 2, max: 25, message: '组织名称长度2 - 25' }
        ],
        orgShortName: [
          { required: true, message: '请输入组织简称' },
          { min: 2, max: 15, message: '组织简称长度2 - 15' }
        ]
      }
    }
  },
  created() {
    if (this.orgEntity) {
      this.form = { ...this.orgEntity }
    }
    this.getAccountList()
  },
  methods: {
    getAccountList() {
      getAccountList().then(res => {
        this.accountList = res.data
      })
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          saveOrUpdate(this.form).then(res => {
            this.$message.info('操作成功')
            this.$emit('refresh')
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
