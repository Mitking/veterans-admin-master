<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <el-form-item label="应用服务" :style="{width:'300px'}">
        <el-select
          v-model="searchForm.module"
          class="item-select-fa"
          clearable
          placeholder="全部"
          style="width:100%"
        >
          <el-option
            v-for="(itemSon,indexSon) in ['SYSTEM','PUBLIC','CORE','UMS','OMS','WMS','BMS','IOT','TASK','STORE','LEMENG']"
            :key="indexSon+100"
            :value="itemSon"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作类型" :style="{width:'300px'}">
        <el-select
          v-model="searchForm.type"
          class="item-select-fa"
          clearable
          placeholder="全部"
          style="width:100%"
        >
          <el-option
            v-for="(itemSon,indexSon) in ['INSERT','DELETE','UPDATE','SELECT','REVIEW','PRINT','EXPORT','LOGIN','UNKNOWN']"
            :key="indexSon+100"
            :value="itemSon"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="日期"
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
        prop="module"
        align="center"
        width="100"
        label="服务"
      />
      <el-table-column
        prop="ip"
        align="center"
        width="120"
        label="操作IP"
      />
      <el-table-column
        prop="type"
        align="center"
        width="120"
        label="类型"
      />
      <el-table-column
        prop="level"
        align="center"
        width="50"
        label="级别"
      />
      <el-table-column
        prop="content"
        align="center"
        width="200"
        label="日志内容"
      />
      <el-table-column
        prop="target"
        align="center"
        label="目标对象"
      />

      <el-table-column
        prop="costMills"
        align="center"
        width="140"
        label="消耗时间(毫秒)"
      />
      <el-table-column
        prop="operator"
        align="center"
        width="150"
        label="操作人"
      />
      <el-table-column
        prop="device"
        align="center"
        width="100"
        label="操作设备"
      />
      <el-table-column
        align="center"
        width="120"
        label="发生时间"
      >
        <template slot-scope="{row}">
          {{ timeComp(row.timestamp) }}
        </template>
      </el-table-column>
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
        <el-descriptions-item label="服务名">{{ curr_row.module }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ curr_row.type }}</el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ curr_row.ip }}</el-descriptions-item>
        <el-descriptions-item label="级别">{{ curr_row.level }}</el-descriptions-item>
        <el-descriptions-item label="目标对象">{{ curr_row.target }}</el-descriptions-item>
        <el-descriptions-item label="消耗时间">{{ curr_row.costMills }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ curr_row.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作人ID">{{ curr_row.operatorId }}</el-descriptions-item>
        <el-descriptions-item label="操作设备">{{ curr_row.device }}</el-descriptions-item>
        <el-descriptions-item label="日志内容">{{ curr_row.content }}</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ timeComp(curr_row.timestamp) }}</el-descriptions-item>
        <el-descriptions-item label="方法">{{ curr_row.method }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :label-style="{width:'6rem',textAlign:'right'}" :column="3" size="small" border>
        <el-descriptions-item label="入参"><textarea class="w100" v-html="deal(curr_row.argVal)" /></el-descriptions-item>
      </el-descriptions>
      <el-descriptions :label-style="{width:'6rem',textAlign:'right'}" :column="3" size="small" border>
        <el-descriptions-item label="回参"><textarea class="w100" v-html="deal(curr_row.returnVal)" /></el-descriptions-item>
      </el-descriptions>
      <div slot="footer">
        <el-button @click="modelShow = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLogKeyList } from '@/api/core/syslog'
import MixPage from '@/components/MixinForm/MixPage.vue'
import dayjs from 'dayjs'
export default {
  name: 'LogKey',
  components: { MixPage },
  data() {
    return {
      table_loading: false,
      curr_row: { id: '' }, // 当前选择数据
      modelShow: false,
      searchForm: {
        'module': '',
        'type': '',
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
    timeComp() {
      return function(t) {
        return dayjs(t).format('YYYY-MM-DD')
      }
    },
    deal() {
      return function(obj) {
        if (!obj) {
          return ''
        }
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
    opm(row) {
      this.curr_row = row
      this.modelShow = true
    },
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search() {
      this.table_loading = true
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).map(key => { searchForm[key] = searchForm[key] || null })
      getLogKeyList(searchForm).then(res => {
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
  margin-bottom:10px
}
.w100{
 width: 100%;
 min-height: 400px;
}
</style>
