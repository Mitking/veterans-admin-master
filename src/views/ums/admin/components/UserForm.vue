<template>
  <div>
    <el-alert>组织和账套类型，请将组织和门店选择默认（管理中心）</el-alert>
    <el-form ref="form" :rules="rules" :model="form" label-width="80px">
      <el-form-item v-if="!$attrs.merchant" label="账套" prop="accountId">
        <account-select :account="account" @select="accountSelected" @focus="updateInit=false" />
      </el-form-item>
      <el-form-item label="账号类型" prop="type">
        <el-radio-group v-model="form.type" :disabled="formType === 'update'" @focus="updateInit=false">
          <el-radio :label="1">门店</el-radio>
          <!--          <el-radio v-if="$store.getters.usertype===3" :label="2">组织</el-radio>-->
          <!--          <el-radio v-if="$store.getters.usertype===3" :label="3">账套</el-radio>-->
          <el-radio :label="2">组织</el-radio>
          <el-radio :label="3">账套</el-radio>
          <!-- <el-radio :label="0">平台</el-radio> -->
        </el-radio-group>
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <el-select v-model="form.orgId" placeholder="请选择" style="width:100%" @focus="updateInit=false">
          <el-option v-for="item in orgs" :key="item.id" :label="item.orgName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="门店" prop="storeId">
        <el-select v-model="form.storeId" placeholder="请选择" style="width:100%" @focus="updateInit=false">
          <el-option
            v-for="item in $store.state.enum.enumList.stores.filter(itemF=>itemF.orgId===form.orgId)"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="账号" prop="username">
        <el-input v-model="form.username" @focus="updateInit=false" />
      </el-form-item>
      <el-form-item label="姓名" prop="surname">
        <el-input v-model="form.surname" @focus="updateInit=false" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="form.phone" @focus="updateInit=false" />
      </el-form-item>
      <el-form-item label-width="400px">
        <el-button @click="reset">重置</el-button>
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
import AccountSelect from '@/views/ums/admin/components/AccountSelect'
import { saveOrUpdateUser } from '@/api/ums/user'
import { queryOrgByAccountId } from '@/api/ums/org'
import { getStoreList } from '@/api/core/store'
import store from '@/store'
import { mapGetters } from 'vuex'

export default {
  name: 'UserForm',
  components: { AccountSelect },
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
    const accountNumRuler = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请选择'))
      } else {
        callback()
      }
    }
    return {
      updateInit: false,
      orgs: [],
      stores: [],
      passWordShow: false,
      timeDown: 5,
      timer: '',
      insertPassWord: '',
      loading: false,
      account: { accountNum: '', orgName: '' },
      form: {
        // type: this.$store.getters.usertype,
        id: null,
        type: '',
        username: '',
        surname: '',
        phone: '',
        orgId: null,
        storeId: null
      },
      rules: {
        accountId: [{ validator: accountNumRuler, trigger: 'change' }],
        orgId: [{ validator: accountNumRuler, trigger: 'change' }],
        storeId: [{ validator: accountNumRuler, trigger: 'change' }],
        type: [{ required: true, message: '请选择账号类型' }],
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
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
    'form.accountId': {
      handler(n) {
        if (n !== '') {
          queryOrgByAccountId({ accountId: n }).then(res => {
            if (res.code === 200) {
              this.orgs = res.data
              this.form.orgId = this.updateInit ? this.form.orgId : null
            }
          })
        }
      },
      immediate: false
    },
    'form.orgId': {
      handler(n) {
        this.form.storeId = this.updateInit ? this.form.storeId : null
      },
      immediate: false
    },
    'form.type': {
      handler(n) {
        if (n === 2) {
          // 组织
          this.form.storeId = this.updateInit ? this.form.storeId : null
        }
        if (n === 3) {
          // 账套
          this.form.orgId = this.updateInit ? this.form.orgId : null
          this.form.storeId = this.updateInit ? this.form.storeId : null
        }
      },
      immediate: false
    },
    formType() {
      this.reset()
    },
    '$attrs.show': {
      handler(n) {
        if (n) {
          queryOrgByAccountId({ accountId: this.accountId }).then(res => {
            // 临时用
            if (res.code === 200) {
              this.orgs = res.data
              this.form.orgId = this.updateInit ? this.form.orgId : null
            }
          })
          if (this.rower.id && this.formType === 'update') {
            this.updateInit = true
            const {
              createTime,
              deleted,
              maxStoreNum,
              password,
              salt,
              updateTime,
              ...temp
            } = this.deepClone(this.rower)
            this.eslintDeal = {
              createTime,
              deleted,
              maxStoreNum,
              password,
              salt,
              updateTime
            }
            this.form = temp
            // this.form.accountId = this.type===3 等后台返回数据修改

            this.account = {
              accountNum: this.form.accountId,
              orgName: this.rower.orgName
            }
          } else if (this.formType === 'insert') {
            this.account = { accountNum: '', orgName: '' }
            this.form = {
              id: '',
              type: '',
              username: '',
              surname: '',
              phone: '',
              accountId: '',
              orgId: '',
              storeId: ''
            }
          }
        }
      },
      immediate: true
    }
  },
  created() {
    getStoreList({}).then(res => {
      if (res.code === 200) {
        store.dispatch('enum/add_enum', { stores: res.data })
      }
    })
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
    accountSelected(account) {
      this.form.accountId = account.id
      this.account = account
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
