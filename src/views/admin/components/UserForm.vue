<template>
  <div>
    <el-form ref="form" :rules="rules" :model="form" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" @focus="updateInit=false" />
      </el-form-item>
      <el-form-item label="姓名" prop="surname">
        <el-input v-model="form.surname" @focus="updateInit=false" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="form.phone" @focus="updateInit=false" />
      </el-form-item>
      <el-form-item label-width="450px">
        <el-button :loading="loading" type="primary" @click="onSubmit">
          <template v-if="formType === 'insert'">
            创建
          </template>
          <template v-else>
            修改
          </template>
        </el-button>
      </el-form-item>
      <el-dialog
        center
        :visible.sync="passWordShow"
        append-to-body
        width="50%"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <span slot="title" style="color: #F6416C;">
          <i class="el-icon-warning" />重要提示
        </span>
        <div style="line-height: 2rem;padding-left:2rem">
          <div>创建账号成功，请牢记用户名和密码</div>
          <div class="ml10">用户名：<span>{{ form.username }}</span></div>
          <div class="ml10">密码：<span>{{ (insertPassWord===true)?'123456':insertPassWord }}</span></div>
          <!--          <div class="ml10">密码：<span>{{ typeof insertPassWord }}</span></div>-->
        </div>
        <span slot="footer" style="margin-left:60%;margin-bottom: 100px;">
          <el-button type="primary" style="margin-bottom:15px" @click="()=>{if(timeDown<=0)passWordShow=false}">确认<span
            v-show="timeDown>0"
          >({{ timeDown }})</span></el-button>
        </span>
      </el-dialog>
    </el-form>
  </div>
</template>
<script>
import { saveOrUpdateUser } from '@/api/ums/user'
import { mapGetters } from 'vuex'

export default {
  name: 'UserForm',
  components: { },
  props: {
    rower: {
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
      updateInit: false,
      orgs: [],
      stores: [],
      passWordShow: false,
      timeDown: 5,
      timer: '',
      insertPassWord: '',
      loading: false,
      form: {
        id: null,
        username: '',
        surname: '',
        phone: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 15, message: '联系人长度5-15个字符', trigger: 'blur' }
        ],
        surname: [
          { required: true, message: '请输入联系人', trigger: 'blur' },
          { min: 2, max: 15, message: '联系人长度2-15个字', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { min: 7, max: 12, message: '联系电话长度7-12个字', trigger: 'blur' }
        ]
      },
      eslintDeal: {}
    }
  },
  computed: {
    ...mapGetters(['accountId'])
  },
  watch: {
    formType() {
      this.reset()
    },
    '$attrs.show': {
      handler(n) {
        this.form = this.deepClone(this.rower)
      },
      immediate: true
    }
  },
  created() {
  },
  methods: {
    timeDownStart() {
      this.timeDown = 5
      this.timer = setInterval(() => {
        this.timeDown--
        if (this.timeDown <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
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
      saveOrUpdateUser(this.form).then(res => {
        if (res.code === 200) {
          if (this.formType === 'update') {
            this.$success('操作成功')
            this.$emit('hide')
          } else if (this.formType === 'insert') {
            this.insertPassWord = res.data
            this.$emit('hide')
            this.passWordShow = true
            this.timeDownStart()
          }
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
