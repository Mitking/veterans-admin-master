<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      class="form-fa"
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <SelectOrgStore :type="1" @updateData="searchForm=Object.assign(searchForm,$event)" />
      <el-form-item
        label="时间段"
        :style="{marginRight:'55px'}"
      >
        <el-date-picker
          v-model="curr_date"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['07:00:00', '23:59:59']"
          align="right"
          @change="searchForm.startTime=$event?$event[0]:$event;searchForm.endTime=$event?$event[1]:$event"
        />
      </el-form-item>
    </el-form>
    <div style="margin:0 24px">
      <el-button type="primary" @click="search">查询</el-button>
    </div>
    <el-table
      :loading="table_loading"
      :data="tableData"
      style="margin:12px 24px;max-width:98%;width:1200px;"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="windowH-300"
      highlight-current-row
    >
      <el-table-column prop="period" label="时段" align="center" />
      <el-table-column prop="customerCount" label="总客流" align="center" />
      <el-table-column prop="orderCount" label="订单数" align="center" />
      <el-table-column prop="carryRate" label="提袋率" align="center">
        <template slot-scope="{row}">
          {{ DECIMAL.mul(row.carryRate,'100') }} %
        </template>
      </el-table-column>
      <el-table-column prop="orderAmount" label="订单金额" align="center" />
      <el-table-column prop="avgConsume" label="人均消费" align="center" />
    </el-table>
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import { getCustomerAnalyze } from '@/api/bms/CustomerAnalyze'
import dayjs from 'dayjs'
export default {
  name: 'CustomerAnalyze',
  components: { SelectOrgStore },
  data() {
    return {
      curr_date: [dayjs().format('YYYY-MM-DD 07:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': 0,
        'storeId': 0,
        'startTime': dayjs().format('YYYY-MM-DD 07:00:00'),
        'endTime': dayjs().format('YYYY-MM-DD 23:59:59')
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: [],
      details: [] // 详细数据
    }
  },
  computed: {
    idsLength() {
      return true
    }
  },
  created() {
    this.table_loading = true
    this.search()
  },
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
      if (!this.searchForm.startTime || !this.searchForm.endTime) {
        return this.$message.info('时间段不能为空')
      }
      if (this.searchForm.startTime.substr(0, 10) !== this.searchForm.endTime.substr(0, 10)) {
        return this.$message.info('时间段不可以跨天')
      }
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
      getCustomerAnalyze(searchForm).then(res => {
        let totalArr = {}
        const temp = res.data.filter(itemF => {
          if (itemF.period === 25) {
            totalArr = {
              period: '合计',
              customerCount: itemF.customerCount,
              orderCount: itemF.orderCount,
              carryRate: itemF.carryRate,
              orderAmount: this.fen2yuan(itemF.orderAmount),
              avgConsume: this.fen2yuan(itemF.avgConsume)
            }
          }
          return itemF.period !== 25
        }).map(item => ({
          period: `${item.period}:00-${item.period + 1}:00`,
          customerCount: item.customerCount,
          orderCount: item.orderCount,
          carryRate: item.carryRate,
          orderAmount: this.fen2yuan(item.orderAmount),
          avgConsume: this.fen2yuan(item.avgConsume)
        }))

        temp.push(totalArr)
        this.tableData = temp
      }).finally(() => {
        this.table_loading = false
      })
    }
  }
}
</script>

<style>

</style>
