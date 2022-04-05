<template>
  <div class="container">
    <el-form inline>
      <el-form-item label="触发Bean">
        <el-input v-model="query.jobHandler" />
      </el-form-item>
      <el-form-item label="任务名称">
        <el-input v-model="query.taskName" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="()=>{query.pageNum = 1; page()}">查询
        </el-button>
      </el-form-item>
    </el-form>

    <el-form inline size="mini">
      <el-form-item v-permission="['task:job:addJob']">
        <el-button type="primary" icon="el-icon-plus" @click="insert">添加
        </el-button>
      </el-form-item>
      <el-form-item v-permission="['task:job:updateJob']">
        <el-button :disabled="!currentRow" icon="el-icon-edit" @click="update">修改</el-button>
      </el-form-item>
      <el-form-item v-permission="['task:jobRecord:getJobRecordPage']">
        <el-button type="primary" plain :disabled="!currentRow" icon="el-icon-view" @click="viewLog">查看日志</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData.records" highlight-current-row @row-click="(row)=>{currentRow = row}">
      <el-table-column label="模块" width="80">
        <template slot-scope="{row}">
          {{ getModuleName(row.module) }}
        </template>
      </el-table-column>
      <el-table-column label="任务名称" prop="taskName" align="center" width="200" />
      <el-table-column label="触发Bean" prop="jobHandler" align="center" width="150" />
      <el-table-column label="CRON" prop="cron" align="center" width="180" />
      <el-table-column label="执行频率" align="center" width="120">
        <template slot-scope="{row}">
          {{ getRateName(row.rate) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="valid" align="center" width="120">
        <template slot-scope="{row}" v-permission="['task:job:validJob']">
          <state-tag key="row.id" :row="row" @change="validJob" />
        </template>
      </el-table-column>
      <el-table-column label="修改时间" prop="updateTime" align="center" width="150" />
      <el-table-column label="创建时间" prop="createTime" align="center" width="150" />
      <el-table-column label="备注" prop="remark" />
    </el-table>

    <my-pagination
      :options="{currentPage: query.pageNum, pageSize: query.pageSize, total: tableData.total}"
      @size-change="(pageSize)=>{query.pageSize=pageSize;page()}"
      @current-change="(currentPage)=>{query.pageNum=currentPage;page()}"
    />
    <el-dialog :visible.sync="showDialog">
      <job-form v-if="showDialog" :row="currentRow" :form-type="formType" :modules="modules" @success="success" />
    </el-dialog>
    <el-dialog :visible.sync="showLogDialog" title="调度日志">
      <job-records v-if="showLogDialog" :task-id="currentRow.id" />
    </el-dialog>
  </div>
</template>

<script>
import { getJobPage, validJob } from '@/api/task/task'
import MyPagination from '@/components/Pagination/MyPagination'
import StateTag from '@/components/StateTag'
import JobForm from '@/views/task/job/components/JobForm'
import JobRecords from '@/views/task/job/components/JobRecords'

export default {
  name: 'JobList',
  components: { JobRecords, JobForm, StateTag, MyPagination },
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: 10,
        jobHandler: '',
        taskName: ''
      },
      formType: null,
      showDialog: false,
      showLogDialog: false,
      currentRow: null,
      tableData: {},
      modules: {
        0: '其他',
        1: '档案',
        2: '采购',
        3: '物流',
        4: '仓储',
        5: '连锁',
        6: '财务',
        7: '收银',
        8: '调度',
        9: '礼品卡',
        10: '报表',
        11: '系统',
        12: '商城',
        13: 'POS',
        14: 'ToB'
      },
      rates: {
        0: '默认',
        1: '日',
        2: '月',
        3: '年'
      }
    }
  },
  computed: {
    getModuleName() {
      return (v) => this.modules[v]
    },
    getRateName() {
      return (v) => this.rates[v]
    }
  },
  created() {
    this.page()
  },
  methods: {
    page() {
      getJobPage(this.query).then(res => {
        this.tableData = res.data
      })
    },
    validJob(data) {
      validJob({ id: data.id }).then(res => {
        this.$message.info('操作成功')
      })
    },
    insert() {
      this.showDialog = true
      this.formType = 'insert'
    },
    update() {
      this.showDialog = true
      this.formType = 'update'
    },
    viewLog() {
      this.showLogDialog = true
    },
    success() {
      this.showDialog = false
      this.page()
    }
  }
}
</script>

<style scoped>
.container {
  padding: 10px;
}
</style>
