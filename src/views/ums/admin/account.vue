<template>
  <div style="margin:24px">
    <el-form inline>
      <el-form-item label="组织">
        <el-input v-model="query.orgName" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="()=>{query.pageNum = 1; page()}">查询
        </el-button>
      </el-form-item>
    </el-form>
    <el-form inline size="mini">
      <el-form-item v-permission="['ums:account:add']">
        <el-button type="primary" icon="el-icon-plus" @click="insert">添加
        </el-button>
      </el-form-item>
      <el-form-item v-permission="['ums:account:saveAccount']">
        <el-button :disabled="!currentRow" icon="el-icon-edit" @click="update">修改</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      border
      highlight-current-row
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row}"
    >
      <el-table-column
        prop="accountNum"
        align="center"
        label="账套编号"
      />
      <el-table-column
        prop="orgName"
        align="center"
        label="组织"
      />
      <el-table-column
        prop="contactMan"
        align="center"
        width="110"
        label="联系人"
      />
      <el-table-column
        prop="contactPhone"
        align="center"
        width="120"
        label="联系电话"
      />
      <el-table-column
        prop="address"
        align="center"
        label="通讯地址"
      />
      <el-table-column
        align="center"
        label="官网"
      >
        <template slot-scope="{row}">
          <a :href="row.webSite" target="_blank">{{ row.webSite }}</a>
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        align="center"
        label="备注"
      />
      <el-table-column
        prop="createTime"
        align="center"
        label="创建时间"
      />
      <el-table-column
        prop="deleted"
        align="center"
        label="状态"
      >
        <template slot-scope="{row}">
          <state-tag :key="row.id" :row="row" @change="changeState" />
        </template>
      </el-table-column>
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
      <account-form
        v-if="modalShow"
        ref="form"
        :row="currentRow"
        :form-type="modalType"
        @hide="addSuccess"
      />
    </el-dialog>

    <el-dialog :visible.sync="passWordShow" width="400px" :close-on-click-modal="false" :show-close="false">
      <span slot="title" style="color: #F6416C;">
        <i class="el-icon-warning" />重要提示
      </span>
      <div style="line-height: 2rem;padding-left:2rem">
        <div>账套创建成功，请牢记账套信息</div>
        <div class="ml10">账套号：<span>{{ accountNum }}</span></div>
        <div class="ml10">用户名：<span>{{ username }}</span></div>
        <div class="ml10">密 码：<span>{{ newPassWord }}</span></div>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="()=>{if(timeDown<=0){passWordShow=false;page()}}">确认<span v-show="timeDown>0">({{ timeDown }})</span></el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import MyPagination from '@/components/Pagination/MyPagination'
import { pageAccount, updateAccountState } from '@/api/ums/account'
import StateTag from '@/components/StateTag'
import AccountForm from '@/views/ums/admin/components/AccountForm'

export default {
  name: 'Account',
  components: { AccountForm, StateTag, MyPagination },
  data() {
    return {
      timeDown: 3,
      passWordShow: false,
      newPassWord: '******',
      accountNum: '',
      username: '',
      loading: false,
      modalShow: false,
      modalType: '', // insert/update = 添加/修改
      modalTitle: '账套',
      updateRow: null, // 预修改行
      query: {
        pageNum: 1,
        pageSize: 10,
        accountSearchVal: ''
        // accountNum: null,
        // orgName: null,
        // state: null
      },
      currentRow: null,
      tableData: {}
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
    addSuccess(obj) {
      this.modalShow = false
      this.newPassWord = obj.password
      this.accountNum = obj.accountNum
      this.username = obj.username
      this.passWordShow = true
      this.timeDownStart()
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
    page() {
      this.loading = true
      pageAccount(this.query).then(res => {
        this.loading = false
        this.tableData = res.data
      })
    },
    insert() {
      this.currentRow = null
      this.modalType = 'insert'
      this.modalShow = true
    },
    update() {
      this.modalType = 'update'
      this.modalShow = true
    },
    changeState(data) {
      updateAccountState(data).then(res => {
        if (res.data) {
          this.$success('操作成功')
        } else {
          this.$error('操作失败')
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
