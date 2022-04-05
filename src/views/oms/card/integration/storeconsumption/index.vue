<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <!-- type:1:组织，门店 -->
      <SelectOrgStore :type="1" @updateData="searchForm=Object.assign(searchForm,$event)" />
      <el-form-item label="时间">
        <el-date-picker
          v-model="rangeTime"
          style="width:360px"
          type="datetimerange"
          :default-time="['00:00:00', '23:59:59']"
          placeholder="全部"
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="searchForm.startTime=$event?$event[0]:null;searchForm.endTime=$event?$event[1]:null"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="Tab"
      v-loading="table_loading"
      style="margin:0 24px;max-width:98%;width:721px"
      :max-height="windowH-350"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="small"
      highlight-current-row
      :data="tableData.records"
      :class="{'check-all-none':$attrs.single}"
      @row-click="(row) => {$refs.Tab.toggleRowSelection(row)}"
    >
      <el-table-column
        prop="storeName"
        align="center"
        :width="'200'"
        label="门店"
      />
      <el-table-column
        align="center"
        label="余额"
      >
        <el-table-column
          prop="rechargeAmount"
          label="充值"
          align="center"
          width="100"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row.rechargeAmount) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="consumptionAmount"
          label="消费"
          align="center"
          width="100"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row.consumptionAmount) }}
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        align="center"
        label="积分"
      >
        <el-table-column
          prop="rechargePoint"
          label="获得"
          align="center"
          width="100"
        />
        <el-table-column
          prop="consumptionPoint"
          label="兑换"
          align="center"
          width="100"
        />
      </el-table-column>
      <el-table-column
        prop="refundAmount"
        label="退款充值金额"
        align="center"
        width="120"
      >
        <template slot-scope="{row}">
          {{ fen2yuan(row.refundAmount) }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin:12px;max-width: 97%;"
      background
      :page-size.sync="searchForm.pageSize"
      :current-page.sync="searchForm.pageNum"
      :page-sizes="[10, 20, 30, 50]"
      layout="total,sizes,prev, pager, next,jumper"
      :total="tableData.total"
      @size-change="search(searchForm)"
      @current-change="search(searchForm)"
    />
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import { getPage } from '@/api/oms/card/storeconsumption'
export default {
  name: 'StoreConsumption',
  components: { SelectOrgStore },
  data() {
    return {
      rangeTime: [],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'startTime': '',
        'endTime': '',
        'storeId': 0,
        'orgId': 0,
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
    idsLength() {
      return true
    }
  },
  mounted() { this.search() },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search() {
      this.table_loading = true
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).map(prop => {
        searchForm[prop] = searchForm[prop] || null
        if (prop === 'orgId') {
          searchForm.orgId = [1, 2].includes(this.$store.getters.accountType) ? this.$store.getters.orgId : searchForm.orgId
        }
        if (prop === 'storeId') {
          searchForm.storeId = this.$store.getters.accountType === 1 ? this.$store.getters.storeId : searchForm.storeId
        }
      })
      getPage(searchForm).then(res => {
        this.tableData = res.data
      }).finally(() => {
        this.table_loading = false
      })
    }
  }
}
</script>

<style scoped>
.check-all-none >>> .el-table__header .el-checkbox {
  display: none
}

.form-fa {
  display: flex;
  flex-wrap: wrap;
}
.summary{
  margin-top: 10px;
  margin-left: 23px;
  border: solid 1px #c1c1c1;
  border-collapse: collapse;
  width: 30%;
}
.summary th, td{
  border: solid 1px #c1c1c1;
  text-align: center;
  height: 34px;
  color: #5d5d60;
}
</style>
