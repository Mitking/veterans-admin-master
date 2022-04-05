<template>
  <div style="margin:24px">
    <el-form ref="searchForm" inline :size="$attrs.is_child?'mini':'medium'">
      <el-form-item label="姓名">
        <el-input v-model="query.surname" clearable @keyup.native.enter="page()" />
      </el-form-item>
      <el-form-item>
        <!--   v-permission="['user:page:merchant']"     -->
        <el-button type="primary" icon="el-icon-search" :size="$attrs.is_child?'mini':'medium'" @click="()=>{query.pageNum = 1; page()}">查询
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      border
      highlight-current-row
      style="width:401px"
      :max-height="mixin_tab_max_height"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
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
        prop="surname"
        align="center"
        width="200"
        label="姓名"
      />
      <el-table-column
        prop="balance"
        align="center"
        width="200"
        label="用户余额"
      >
        <template slot="header">
          <span class="table-header">用户余额
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="正数:公司尚欠用户余额,负数:用户尚欠公司余额" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{ row }">{{ fen2yuan(row.balance) }}</template>
      </el-table-column>
    </el-table>
    <my-pagination
      :options="{currentPage: query.pageNum, pageSize: query.pageSize, total: tableData.total}"
      @size-change="(pageSize)=>{query.pageSize=pageSize;page()}"
      @current-change="(currentPage)=>{query.pageNum=currentPage;page()}"
    />

  </div>
</template>

<script>
import MyPagination from '@/components/Pagination/MyPagination'
import { getUserTypeName, userPage, grantRole, deleteUser } from '@/api/ums/user'
export default {
  name: 'UserAccountPage',
  components: { MyPagination },
  data() {
    return {
      searchFormHeight: 0,
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
    // 表格最大高度
    mixin_tab_max_height() {
      return this.windowH - 240 - this.searchFormHeight
    },
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
    this.$nextTick(() => {
      this.searchFormHeight = this.$refs.searchForm.$el.offsetHeight
    })
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

