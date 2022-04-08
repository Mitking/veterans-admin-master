<template>
  <div style="margin: 24px">
    <el-form inline>
      <el-form-item label="用户名">
        <el-input v-model="query.username" clearable @keyup.native.enter="page()" />
      </el-form-item>
    </el-form>

    <el-form inline size="mini">
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="() => {query.pageNum = 1;page();}">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-permission="['user:saveOrUpdate']" type="primary" icon="el-icon-plus" @click="insert">添加</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-permission="['user:saveOrUpdate']" :disabled="!currentRow.id || currentRow.username === 'admin'" icon="el-icon-edit" @click="update">修改</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-permission="['user:grantRole']" :disabled="!currentRow.id" type="info" icon="el-icon-s-custom" @click="openRoleInfo">分配角色</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!currentRow.id || currentRow.username === 'admin'" type="info" icon="el-icon-s-custom" @click="updatePasswordShow = true">
          修改密码
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          v-permission="[]"
          :disabled="!currentRow.id"
          type="danger"
          icon="el-icon-refresh-left"
          @click="resetPasswordShow = true"
        >重置密钥
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-permission="['ums:user:delete']" :disabled="!currentRow.id || currentRow.username === 'admin'" type="danger" icon="el-icon-refresh-left" @click="del">删除账号</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      border
      highlight-current-row
      :data="tableData.records"
      @row-click="
        (row) => {
          currentRow = row;
        }
      "
    >
      <el-table-column prop="username" align="center" label="用户名" />
      <el-table-column prop="surname" align="center" label="姓名" />
      <el-table-column prop="phone" align="center" label="手机号" />
      <el-table-column prop="updateTime" align="center" label="修改时间" />
      <el-table-column prop="createTime" align="center" label="创建时间" />
    </el-table>
    <my-pagination
      :options="{
        currentPage: query.pageNum,
        pageSize: query.pageSize,
        total: tableData.total,
      }"
      @size-change="
        (pageSize) => {
          query.pageSize = pageSize;
          page();
        }
      "
      @current-change="
        (currentPage) => {
          query.pageNum = currentPage;
          page();
        }
      "
    />

    <!--    添加/修改账套   -->
    <el-dialog :title="dialogTitle" width="600px" :visible.sync="modalShow" append-to-body :close-on-click-modal="false">
      <user-form
        ref="form"
        :merchant="true"
        :show="modalShow"
        :rower="currentRow"
        :form-type="modalType"
        @hide="modalShow = false;page();"
      />
    </el-dialog>
    <el-dialog title="角色授权" :visible.sync="roleShow" :close-on-click-modal="false">
      <div style="display: flex; justify-content: center">
        <el-transfer v-model="roleValue" :titles="['全部角色', '授权角色']" :data="roleData" />
      </div>
      <div slot="footer">
        <el-button @click="roleShow = false">取 消</el-button>
        <el-button type="primary" @click="roleChoose(roleValue)">确 定</el-button>
      </div>
    </el-dialog>
    <!--  修改密码  -->
    <el-dialog title="修改密码" width="500px" :visible.sync="updatePasswordShow" :close-on-click-modal="false">
      <el-form ref="form" :rules="rules" :model="form" label-width="100px">
        <el-form-item label="原密码" prop="opwd">
          <el-input v-model="form.opwd" />
        </el-form-item>
        <el-form-item label="新密码" prop="npwd">
          <el-input v-model="form.npwd" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="npwdReinput">
          <el-input v-model="form.npwdReinput" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updatePasswordShow = false">取 消</el-button>
        <el-button type="primary" @click="upsetPassword">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="重置密码" :visible.sync="resetPasswordShow" :close-on-click-modal="false">
      <el-form ref="form" :rules="rules" :model="form" label-width="100px">
        <span>确认重置用户名「{{ currentRow.username }}」密码？</span>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetPasswordShow = false">取 消</el-button>
        <el-button type="primary" :loading="resetPasswordLoading" @click="resetPassword">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog center :visible.sync="passWordShow" width="50%" :close-on-click-modal="false" :show-close="false">
      <span slot="title" style="color: #f6416c">
        <i class="el-icon-warning" />重要提示
      </span>
      <div style="line-height: 2rem; padding-left: 2rem">
        <div>密码重置成功，请牢记用户名和密码</div>
        <div class="ml10">
          用户名:<span>{{ currentRow.username }}</span>
        </div>
        <div class="ml10">
          密码:<span>{{ insertPassWord }}</span>
        </div>
      </div>
      <span slot="footer" style="margin-left: 60%; margin-bottom: 100px">
        <el-button
          type="primary"
          style="margin-bottom: 15px"
          @click="
            () => {
              if (timeDown <= 0) passWordShow = false;
            }
          "
        >确认<span v-show="timeDown > 0">({{ timeDown }})</span></el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MyPagination from '@/components/Pagination/MyPagination'
import {
  getUserTypeName,
  userPage,
  grantRole,
  getRoleAll,
  getAllTarget,
  updatePwd,
  resetPwd,
  deleteUser
} from '@/api/ums/user'
import UserForm from '@/views/admin/components/UserForm'
// import RoleList from './role'
import { getUsersByRoleName } from '@/api/ums/role'
import store from '@/store'
export default {
  name: 'UserMerchant',
  components: { UserForm, MyPagination },
  data() {
    const generateData = _ => {
      const data = []
      for (let i = 1; i <= 15; i++) {
        data.push({
          key: i,
          label: `备选项 ${i}`,
          disabled: i % 4 === 0
        })
      }
      return data
    }
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.npwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      form: {
        opwd: '',
        npwd: '',
        npwdReinput: ''
      },
      rules: {
        opwd: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        npwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '长度至少6个字符', trigger: 'blur' }
        ],
        npwdReinput: [{ validator: validatePass, trigger: 'blur' }]
      },
      updatePasswordShow: false,
      resetPasswordShow: false,
      resetPasswordLoading: false,
      passWordShow: false,
      timeDown: 5,
      insertPassWord: '',
      roleValue: [],
      roleData: generateData(),
      loading: false,
      modalShow: false,
      modalType: '', // insert/update = 添加/修改
      modalTitle: '账号',
      roleShow: false,
      query: {
        pageNum: 1,
        pageSize: 10
        // accountNum: null,
        // username: null
      },
      currentRow: { id: null },
      tableData: {},
      roleSetShow: false
    }
  },
  computed: {
    dialogTitle() {
      if (this.modalType === 'insert') {
        return '添加' + this.modalTitle
      } else if (this.modalType === 'update') {
        return '修改' + this.modalTitle
      }
      return ''
    },
    getTypeName() {
      return code => {
        return getUserTypeName(code)
      }
    }
  },
  created() {
    this.page()
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.page()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    del() {
      this.$confirm(
        `此操作将永久删除账号「${this.currentRow.username}」, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          deleteUser(this.currentRow.id).then(res => {
            this.message(res)
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    upsetPassword() {
      this.$refs.form
        .validate()
        .then(pass => {
          if (pass) {
            updatePwd({
              id: this.currentRow.id,
              opwd: this.form.opwd,
              npwd: this.form.npwd
            }).then(res => {
              if (res.code === 200) {
                this.$message.success('修改成功')
                this.updatePasswordShow = false
              } else {
                this.$message.error(res.message)
              }
            })
          } else {
            this.$message.error('请检查提交数据')
          }
        })
        .catch(err => {
          this.$message.error('请检查提交数据')
          throw err
        })
    },
    resetPassword() {
      this.resetPasswordLoading = true
      resetPwd({ userId: this.currentRow.id }).then(res => {
        if (res.code === 200) {
          this.insertPassWord = res.data
          setTimeout(() => {
            this.resetPasswordLoading = false
            this.resetPasswordShow = false
          }, 500)
          this.passWordShow = true
          this.timeDownStart()
        }
      })
    },
    timeDownStart() {
      this.timeDown = 5
      this.timer = setInterval(() => {
        this.timeDown--
        if (this.timeDown <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    openRoleInfo() {
      Promise.all([
        getRoleAll(),
        getAllTarget({ userId: this.currentRow.id })
      ]).then(res => {
        if (res[0].code === 200 && res[1].code === 200) {
          this.roleData = res[0].data.map(item => ({
            key: item.roleId,
            label: item.roleName
          }))
          this.roleValue = res[1].data.map(item => item.roleId)
          this.roleShow = true
        }
      })
    },
    roleChoose(roleArr) {
      console.log(roleArr)
      grantRole({ roleIds: roleArr, userId: this.currentRow.id })
        .then(res => {
          this.roleShow = false
        })
        .finally(() => {
          this.roleShow = false
        })
    },
    forcePersonList() {
      const mixinPKey = ['personListCG', 'personListSH', 'personListSJ']
      const pArr = [
        getUsersByRoleName({ roleName: '采购员' }),
        getUsersByRoleName({ roleName: '仓储收货' }),
        getUsersByRoleName({ roleName: '司机' })]
      Promise.all(pArr).then(res => {
        res.map((item, index) => {
          store.dispatch('enum/add_enum', { [mixinPKey[index]]: item.data || [] })
        })
      })
    },
    page() {
      this.loading = true
      userPage(this.query).then(res => {
        this.loading = false
        this.tableData = res.data
      })
    },
    insert() {
      this.currentRow = { id: null }
      this.modalType = 'insert'
      this.modalShow = true
    },
    update() {
      this.modalType = 'update'
      this.modalShow = true
    }
  }
}
</script>

<style scoped>
.notes {
  color: #aaa8a8;
  padding: 0 8px;
}
</style>
