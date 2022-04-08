<template>
  <div>
    <el-form ref="form" :rules="rules" :model="form" label-width="80px">
      <el-form-item label="账套">
        <template v-if="formType === 'insert'">
          系统自动创建账套
        </template>
        <template v-else>
          {{ form.accountNum }}
        </template>
      </el-form-item>
      <el-form-item label="组织名称" prop="orgName">
        <el-input v-model="form.orgName" placeholder="集团/企业/组织名称，通常为最上层组织" />
      </el-form-item>
      <el-form-item label="联系人" prop="contactMan">
        <el-input v-model="form.contactMan" />
      </el-form-item>
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input v-model="form.contactPhone" />
      </el-form-item>
      <el-form-item label="通讯地址" prop="address">
        <el-input v-model="form.address" />
      </el-form-item>
      <el-form-item label="官网" prop="webSite">
        <el-input v-model="form.webSite" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" />
      </el-form-item>
      <el-form-item>
        <el-button v-loading="loading" type="primary" @click="onSubmit">
          <template v-if="formType === 'insert'">
            创建
          </template>
          <template v-else>
            修改
          </template>
        </el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { saveOrUpdateAccount } from '@/api/ums/account'

export default {
  name: 'AccountForm',
  props: {
    row: {
      type: Object,
      default: () => {}
    },
    formType: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      loading: false,
      form: {
        accountNum: '',
        orgName: '',
        contactMan: '',
        contactPhone: '',
        address: '',
        webSite: '',
        remark: ''
      },
      rules: {
        orgName: [
          { required: true, message: '请输入组织名称', trigger: 'blur' },
          { min: 4, max: 30, message: '组织名称长度4-30个字', trigger: 'blur' }
        ],
        contactMan: [
          { required: true, message: '请输入联系人', trigger: 'blur' },
          { min: 2, max: 15, message: '联系人长度2-15个字', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { min: 7, max: 12, message: '联系电话长度7-12个字', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入通讯地址', trigger: 'blur' },
          { min: 5, max: 80, message: '通讯地址长度5-80个字', trigger: 'blur' }
        ],
        webSite: [
          { type: 'url', required: true, message: '请输入有效的官方网站', trigger: 'blur' },
          { max: 45, message: '官网最多45个字符', trigger: 'blur' }
        ],
        remark: [
          { max: 45, message: '备注最多45个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    formType() {
      this.reset()
    }
  },
  created() {
    if (this.row) {
      this.form = this.deepClone(this.row)
    }
  },
  methods: {
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          this.saveOrUpdate()
        }
      })
    },
    reset() {
      this.$refs['form'].resetFields()
    },
    saveOrUpdate() {
      saveOrUpdateAccount(this.form).then(res => {
        if (res.code === 200) {
          this.$emit('hide', res.data)
        }
      })
    }
  }
}
</script>
