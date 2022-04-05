<template>
  <div>
    <el-table :data="tableData.records" highlight-current-row @row-click="(row)=>{currentRow = row}">
      <el-table-column label="执行时间" prop="executeTime" />
      <el-table-column label="状态">
        <template slot-scope="{row}">
          <el-tag v-if="row.status" type="success">成功</el-tag>
          <el-tag v-else type="danger">失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="错误信息" prop="errMsg" />
    </el-table>
    <my-pagination
      :options="{currentPage: query.pageNum, pageSize: query.pageSize, total: tableData.total}"
      @size-change="(pageSize)=>{query.pageSize=pageSize;page()}"
      @current-change="(currentPage)=>{query.pageNum=currentPage;page()}"
    />
  </div>
</template>

<script>
import { getJobRecordPage } from '@/api/task/task'
import MyPagination from '@/components/Pagination/MyPagination'

export default {
  name: 'JobRecords',
  components: { MyPagination },
  props: {
    taskId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: {}
    }
  },
  mounted() {
    this.page()
  },
  methods: {
    page() {
      getJobRecordPage({ ...this.query, ...{ taskId: this.taskId }}).then(res => {
        this.tableData = res.data
      })
    }
  }
}
</script>

<style scoped>

</style>
