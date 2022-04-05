<template>
  <div style="margin:24px">
    <el-form inline :size="$attrs.is_child?'mini':'medium'">
      <el-form-item label="账套号">
        <el-input v-model="query.accountNum" @keyup.native.enter="page()" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="query.username" @keyup.native.enter="page()" />
      </el-form-item>
      <el-form-item>
        <!--   v-permission="['user:page:merchant']"     -->
        <el-button type="primary" icon="el-icon-search" :size="$attrs.is_child?'mini':'medium'" @click="()=>{query.pageNum = 1; page()}">查询
        </el-button>
      </el-form-item>
      <!--      这里的分配角色应该删除，只管重置密码，角色管理交给对应账套的admin-->
    </el-form>

    <el-form v-show="!$attrs.is_child" inline size="mini">
      <el-form-item v-if="this.$store.getters.accountType===3">
        <el-button type="primary" icon="el-icon-plus" @click="insert">添加
        </el-button>
      </el-form-item>
      <el-form-item v-if="this.$store.getters.accountType===3">
        <el-button :disabled="!currentRow.id" icon="el-icon-edit" @click="update">修改</el-button>
      </el-form-item>
      <el-form-item v-if="this.$store.getters.accountType===3">
        <el-button :disabled="!currentRow.id" type="info" icon="el-icon-s-custom" @click="roleShow=true">分配角色</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!currentRow.id" type="danger" icon="el-icon-refresh-left" @click="resetPasswordShow = true">重置密钥</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!currentRow.id" type="danger" icon="el-icon-minus" @click="del">删除账号</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      border
      highlight-current-row
      :data="tableData.records"
      :size="$attrs.is_child?'mini':'medium'"
      @row-click="(row)=>{
        currentRow = row
        if($listeners.selectList){
          $listeners.selectList([currentRow])
        }
      }"
      @row-dblclick="()=>{
        if($listeners.selectList){
          $listeners.selectList([currentRow])
          $listeners.addlist()
        }
      }"
    >
      <el-table-column
        prop="accountNum"
        align="center"
        label="账套编号"
      />
      <el-table-column
        prop="typeName"
        align="center"
        label="账号类型"
      >
        <template slot-scope="{row}">{{ getTypeName(row.type) }}</template>
      </el-table-column>
      <el-table-column
        prop="username"
        align="center"
        label="用户名"
      />
      <el-table-column
        prop="surname"
        align="center"
        label="姓名"
      />
      <el-table-column
        prop="phone"
        align="center"
        label="手机号"
      />
      <el-table-column
        prop="updateTime"
        align="center"
        label="修改时间"
        width="200"
      />
      <el-table-column
        prop="createTime"
        align="center"
        label="创建时间"
        width="200"
      />
    </el-table>
    <my-pagination
      :options="{currentPage: query.pageNum, pageSize: query.pageSize, total: tableData.total}"
      @size-change="(pageSize)=>{query.pageSize=pageSize;page()}"
      @current-change="(currentPage)=>{query.pageNum=currentPage;page()}"
    />

    <!--    添加/修改账套   -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="modalShow"
      append-to-body
    >
      <user-form ref="form" :show="modalShow" :rower="currentRow" :form-type="modalType" @hide="modalShow=false;page()" />
    </el-dialog>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="roleShow"
      width="80%"
    >
      <RoleList ref="form" :child="true" show="roleShow" :row="currentRow" @childChoose="roleChoose" />
    </el-dialog>
    <el-dialog title="重置密码" :visible.sync="resetPasswordShow">
      <el-form ref="form" label-width="100px">
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
          用户名：<span>{{ currentRow.username }}</span>
        </div>
        <div class="ml10">
          密码：<span>{{ insertPassWord }}</span>
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
import { getUserTypeName, pageUser, grantRole, deleteUser } from '@/api/ums/user'
import UserForm from '@/views/ums/admin/components/UserForm'
import RoleList from './role'
import { resetPwd } from '@/api/ums/user'

export default {
  name: 'User',
  components: { UserForm, MyPagination, RoleList },
  data() {
    return {
      resetPasswordShow: false,
      resetPasswordLoading: false,
      passWordShow: false,
      loading: false,
      insertPassWord: '',
      modalShow: false,
      modalType: '', // insert/update = 添加/修改
      modalTitle: '账号',
      roleShow: false,
      timeDown: 3,
      query: {
        pageNum: 1,
        pageSize: 10,
        // 账套级别
        ifAdmin: true,
        type: '3'
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
      return (code) => {
        return getUserTypeName(code)
      }
    }
  },
  created() {
    if ([0, 3].includes(this.$store.getters.accountType)) {
      this.page()
    } else {
      this.$message.info('无访问管理员页面权限！')
      this.$router.replace({ name: 'Dashboard' })
    }
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
      this.$confirm(`此操作将永久删除账号「${this.currentRow.username}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(this.currentRow.id).then(res => {
          this.message(res)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
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
      this.timeDown = 3
      this.timer = setInterval(() => {
        this.timeDown--
        if (this.timeDown <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    roleChoose(roleArr) {
      console.log(roleArr)
      grantRole({ 'roleIds': roleArr, 'userId': this.currentRow.id }).then(res => {
        this.roleShow = false
      }).finally(() => {
        this.roleShow = false
      })
    },
    page() {
      this.loading = true
      pageUser(this.query).then(res => {
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

</style>

