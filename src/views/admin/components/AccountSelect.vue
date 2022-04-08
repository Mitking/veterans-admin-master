<template>
  <div>
    <el-input :value="`${account.accountNum} - ${account.orgName}`" readonly placeholder="选择账套" @focus="modalShow=true;$listeners.focus()">
      <el-button slot="append" icon="el-icon-search" @click="modalShow=true;$listeners.focus()" />
    </el-input>
    <el-dialog title="选择账套" :visible.sync="modalShow" append-to-body width="80%">
      <el-form inline>
        <el-form-item label="账套">
          <el-input v-model="query.accountNum" size="small" />
        </el-form-item>
        <el-form-item label="组织">
          <el-input v-model="query.orgName" size="small" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.state">
            <el-option :value="null" label="全部" />
            <el-option :value="1" label="有效" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" icon="el-icon-search" @click="()=>{query.pageNum = 1; page()}">查询
          </el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="loading"
        border
        size="mini"
        :data="tableData.records"
        @row-click="rowClick"
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
          label="联系人"
        />
        <el-table-column
          prop="contactPhone"
          align="center"
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
          prop="state"
          align="center"
          label="状态"
        >
          <template slot-scope="{row}">
            <state-tag :row="row" />
          </template>
        </el-table-column>
      </el-table>
      <my-pagination
        :options="{currentPage: query.pageNum, pageSize: query.pageSize, total: tableData.total}"
        @size-change="(pageSize)=>{query.pageSize=pageSize;page()}"
        @current-change="(currentPage)=>{query.pageNum=currentPage;page()}"
      />
    </el-dialog>
  </div>
</template>

<script>
import MyPagination from '@/components/Pagination/MyPagination'
import { pageAccount } from '@/api/ums/account'
import StateTag from '@/components/StateTag'

export default {
  name: 'AccountSelect',
  components: { StateTag, MyPagination },
  props: {
    account: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      modalShow: false,
      modalTitle: '账套',
      query: {
        pageNum: 1,
        pageSize: 10,
        state: null,
        accountNum: null,
        orgName: null
      },
      // account: { accountNum: '', orgName: '' },
      tableData: {}
    }
  },
  created() {
    this.page()
  },
  methods: {
    page() {
      this.loading = true
      pageAccount(this.query).then(res => {
        this.loading = false
        this.tableData = res.data
      })
    },
    rowClick(row) {
      this.$emit('select', row)
      this.modalShow = false
    }
  }
}
</script>

<style scoped>

</style>
