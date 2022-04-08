<template>
  <div style="margin:24px">
    <el-form inline :size="$attrs.is_child?'mini':'medium'">
      <el-form-item label="姓名">
        <el-input v-model="query.surname" clearable @keyup.native.enter="page()" />
      </el-form-item>
      <el-form-item>
        <!--   v-permission="['user:page:merchant']"     -->
        <el-button type="primary" icon="el-icon-search" :size="$attrs.is_child?'mini':'medium'" @click="()=>{query.pageNum = 1; page()}">查询
        </el-button>
      </el-form-item>
    </el-form>

    <el-form v-show="!$attrs.is_child" inline size="mini">
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" @click="insert">添加
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!currentRow.id" icon="el-icon-edit" @click="update">修改</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!currentRow.id" type="info" icon="el-icon-s-custom" @click="roleShow=true">分配角色</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!currentRow.id" type="danger" icon="el-icon-refresh-left">重置密钥</el-button>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!currentRow.id" type="danger" icon="el-icon-refresh-left" @click="del">删除账号</el-button>
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

  </div>
</template>

<script>
import MyPagination from '@/components/Pagination/MyPagination'
import { getUserTypeName, userPage, grantRole, deleteUser } from '@/api/ums/user'
import UserForm from '@/views/admin/components/UserForm'
import RoleList from './role'

export default {
  name: 'User',
  components: { UserForm, MyPagination, RoleList },
  data() {
    return {
      loading: false,
      modalShow: false,
      modalType: '', // insert/update = 添加/修改
      modalTitle: '账号',
      roleShow: false,
      query: {
        pageNum: 1,
        pageSize: 10,
        surname: null
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

</style>

