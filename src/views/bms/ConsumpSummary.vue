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
          :default-time="['00:00:00', '23:59:59']"
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
      style="margin:12px 24px;max-width:1400px"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="windowH-300"
      highlight-current-row
    >
      <el-table-column prop="storeId" width="200" label="门店" align="center" />
      <el-table-column prop="count" align="center">
        <template slot="header">
          <span class="table-header">单据总数
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="时间段内已支付的单据总数" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="totalCashAmount" align="center">
        <template slot="header">
          <span class="table-header">现金
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="所有订单的现金金额汇总" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="totalDinpayAmount" align="center">
        <template slot="header">
          <span class="table-header">一码付
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="所有订单的一码付金额汇总" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="totalCardAmount" label="礼品卡" align="center" />
      <el-table-column prop="totalDodobAmount" label="多多币" align="center" />
      <el-table-column prop="totalCouponAmount" label="优惠券" align="center" />
      <el-table-column prop="totalDeliveryCouponAmount" label="提货券" align="center" />
      <el-table-column prop="totalCodeCouponAmount" label="电子券" align="center" />
      <el-table-column prop="totalOnaccountAmount" label="挂账" align="center" />
      <el-table-column prop="totalDealAmount" label="合计" align="center" />
    </el-table>
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import { getConsumpSummaryGroup } from '@/api/bms/ConsumpSummary'
export default {
  name: 'ConsumpSummary',
  components: { SelectOrgStore },
  data() {
    return {
      curr_date: [],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': 0,
        'storeId': 0,
        'startTime': null,
        'endTime': null
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
  mounted() {
    // this.table_loading = true
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
      getConsumpSummaryGroup(searchForm).then(res => {
        let totalArr = {}
        const temp = res.data.filter(itemF => {
          if (itemF.storeId === 0) {
            totalArr = {
              storeId: '合计',
              count: itemF.count,
              totalCashAmount: this.fen2yuan(itemF.totalCashAmount),
              totalDinpayAmount: this.fen2yuan(itemF.totalDinpayAmount),
              totalCardAmount: this.fen2yuan(itemF.totalCardAmount),
              totalDodobAmount: this.fen2yuan(itemF.totalDodobAmount),
              totalCouponAmount: this.fen2yuan(itemF.totalCouponAmount),
              totalDeliveryCouponAmount: this.fen2yuan(itemF.totalDeliveryCouponAmount),
              totalCodeCouponAmount: this.fen2yuan(itemF.totalCodeCouponAmount),
              totalOnaccountAmount: this.fen2yuan(itemF.totalOnaccountAmount),
              totalDealAmount: this.fen2yuan(itemF.totalDealAmount)
            }
          }
          return itemF.storeId !== 0
        }).map(item => ({
          storeId: this.MenuGetPropName('stores', item.storeId, { value: 'id', label: 'name' }),
          count: item.count,
          totalCashAmount: this.fen2yuan(item.totalCashAmount),
          totalDinpayAmount: this.fen2yuan(item.totalDinpayAmount),
          totalCardAmount: this.fen2yuan(item.totalCardAmount),
          totalDodobAmount: this.fen2yuan(item.totalDodobAmount),
          totalCouponAmount: this.fen2yuan(item.totalCouponAmount),
          totalDeliveryCouponAmount: this.fen2yuan(item.totalDeliveryCouponAmount),
          totalOnaccountAmount: this.fen2yuan(item.totalOnaccountAmount),
          totalCodeCouponAmount: this.fen2yuan(item.totalCodeCouponAmount),
          totalDealAmount: this.fen2yuan(item.totalDealAmount)
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
