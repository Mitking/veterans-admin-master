<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <el-form-item label="应用服务" :style="{width:'300px'}">
        <el-select
          v-model="searchForm.app"
          class="item-select-fa"
          clearable
          placeholder="全部"
          style="width:100%"
        >
          <el-option
            v-for="(itemSon,indexSon) in ['bdd-core','bdd-oms','bdd-wms','bdd-ums','bdd-gateway','bdd-iot','bdd-bms','bdd-store','bdd-task','bdd-lemeng']"
            :key="indexSon+100"
            :value="itemSon"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="日期"
        :style="{marginRight:'55px'}"
      >
        <el-date-picker
          v-model="searchForm.date"
          style="width:150px"
          type="date"
          value-format="yyyy-MM-dd"
          align="right"
        />
      </el-form-item>
    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search">查询</el-button>
    </div>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      style="margin:12px 24px;max-width:98%;"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="windowH-300"
      highlight-current-row
    >
      <el-table-column
        align="center"
        label="服务名"
        width="100"
      >
        <template slot-scope="{row}">
          {{ row.contextMap.app }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="ip地址"
        width="150"
      >
        <template slot-scope="{row}">
          {{ row.contextMap.ip }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="api"
      >
        <template slot-scope="{row}">
          {{ row.contextMap.api }}
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="loggerName"
        align="center"
        label="日志名称"
      /> -->
      <el-table-column
        prop="message"
        align="center"
        label="日志内容"
      />
      <el-table-column
        prop="date"
        align="center"
        width="200"
        label="发生时间"
      />
      <el-table-column
        prop="date"
        align="center"
        width="100"
        label="详情"
      >
        <template slot-scope="{row}">
          <el-button size="mini" @click="opm(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <el-dialog
      v-if="modelShow"
      title="日志详情"
      :visible.sync="modelShow"
      fullscreen
    >
      <el-descriptions :label-style="{width:'6rem',textAlign:'right'}" :column="3" size="small" border>
        <el-descriptions-item label="id">{{ curr_row.id }}</el-descriptions-item>
        <el-descriptions-item label="服务名">{{ curr_row.contextMap.app }}</el-descriptions-item>
        <el-descriptions-item label="ip地址">{{ curr_row.contextMap.ip }}</el-descriptions-item>
        <el-descriptions-item label="api">{{ curr_row.contextMap.api }}</el-descriptions-item>
        <el-descriptions-item label="日志名称">{{ curr_row.loggerName }}</el-descriptions-item>
        <el-descriptions-item label="日志内容">{{ curr_row.message }}</el-descriptions-item>
        <el-descriptions-item label="scheme">{{ curr_row.contextMap.scheme }}</el-descriptions-item>
        <el-descriptions-item label="方法名">{{ curr_row.contextMap.method }}</el-descriptions-item>
        <el-descriptions-item label="线程ID">{{ curr_row.threadId }}</el-descriptions-item>
        <el-descriptions-item label="线程名称">{{ curr_row.threadName }}</el-descriptions-item>
        <el-descriptions-item label="类名">{{ curr_row.source.className }}</el-descriptions-item>
        <el-descriptions-item label="文件名">{{ curr_row.source.fileName }}</el-descriptions-item>
        <el-descriptions-item label="行号">{{ curr_row.source.lineNumber }}</el-descriptions-item>
        <el-descriptions-item label="Source方法名">{{ curr_row.source.method }}</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ curr_row.date }}</el-descriptions-item>
        <!-- <el-descriptions-item label="异常">{{ curr_row.thrown || '' }}</el-descriptions-item> -->
      </el-descriptions>
      <el-descriptions v-if="curr_row.thrown && curr_row.thrown.message" :label-style="{width:'6rem',textAlign:'right'}" size="small" border>
        <el-descriptions-item label="异常信息"><el-link type="danger">{{ curr_row.thrown.message }}</el-link></el-descriptions-item>
      </el-descriptions>
      <el-descriptions v-if="curr_row.thrown" :label-style="{width:'6rem',textAlign:'right'}" size="small" border>
        <el-descriptions-item label="异常详情"><textarea class="w100" v-html="deal(curr_row.thrown)" /></el-descriptions-item>
      </el-descriptions>
      <div slot="footer">
        <el-button @click="modelShow = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLogErrorList } from '@/api/core/syslog'
import MixPage from '@/components/MixinForm/MixPage.vue'
import dayjs from 'dayjs'
export default {
  name: 'LogError',
  components: { MixPage },
  data() {
    return {
      table_loading: false,
      curr_row: { id: '' }, // 当前选择数据
      modelShow: false,
      searchForm: {
        'app': '',
        'date': dayjs().format('YYYY-MM-DD'),
        'pageNum': 1,
        'pageSize': 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      details: [] // 详细数据
    }
  },
  computed: {
    deal() {
      return function(obj) {
        return JSON.stringify(obj).replace(/,/g, ',\n')
      }
    }
  },
  watch: {
    'search_dialog_item.show': {
      handler(n) {
        if (n) {
          this.is_clear = n
        }
      }
    }
  },
  created() {
    this.search()
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    opm(row) {
      this.curr_row = row
      this.modelShow = true
    },
    search() {
      this.table_loading = true
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).map(key => { searchForm[key] = searchForm[key] || null })
      getLogErrorList(searchForm).then(res => {
        if (res.data) {
          this.tableData = res.data
        } else {
          this.$message.info('查询失败')
        }
      }).finally(() => {
        this.table_loading = false
      })
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
}
.form-fa >>> .el-form-item__content{
  display: flex;
  padding:0 30px 0 0;
  margin: 0;
}
.form-fa >>> .el-form-item{
  margin-bottom:10px;

}
.w100{
 width: 100%;
 min-height: 400px;
}
</style>
