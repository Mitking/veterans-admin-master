<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      ref="searchForm"
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
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          align="right"
          @change="searchForm.startTime=$event?$event[0]:$event;searchForm.endTime=$event?$event[1]:$event"
        />
      </el-form-item>

      <el-form-item label="订单ID" style="width:300px">
        <el-input
          v-model="searchForm.fid"
          placeholder="全部"
          clearable
        />
      </el-form-item>
      <el-form-item label="顾客名" style="width:300px">
        <el-input
          v-model="searchForm.operator"
          placeholder="全部"
          clearable
        />
      </el-form-item>
      <el-form-item label="手机号" style="width:300px">
        <el-input
          v-model="searchForm.mobile"
          placeholder="全部"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="积分类型"
        style="width:300px"
      >
        <el-select
          v-model="searchForm.changeType"
          class="item-select-fa"
          collapse-tags
          clearable
          placeholder="全部"
          style="width:100%"
        >
          <el-option label="全部" :value="0" />
          <el-option label="线上签到" value="1" />
          <el-option label="线上积分兑换多多币" value="2" />
          <el-option label="线上积分兑换优惠券" value="3" />
          <el-option label="线上积分兑换实物" value="4" />
          <el-option label="线上购物积分" value="5" />
          <el-option label="线上邀请新人" value="6" />
          <el-option label="线上积分兑换[优惠券失败]补偿" value="7" />
          <el-option label="线上商品评价" value="8" />
        </el-select>
      </el-form-item>
    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search(null, null, 1)">查询</el-button>
    </div>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      style="margin:12px 24px;width:1161px;max-width:98%"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="maxHeight"
      highlight-current-row
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column prop="fid" width="200" label="订单ID" align="center" />
      <el-table-column prop="point" label="积分值" width="100" align="center" />
      <el-table-column prop="changeType" label="变动类型" width="160" align="center">
        <template slot-scope="{row}">
          {{ row.changeType==='1' && "线上签到" ||
            row.changeType==='2' && "线上积分兑换多多币" ||
            row.changeType==='3' && "线上积分兑换优惠券" ||
            row.changeType==='4' && "线上积分兑换实物" ||
            row.changeType==='5' && "线上购物积分" ||
            row.changeType==='6' && "线上邀请新人" ||
            row.changeType==='7' && "线上积分兑换[优惠券失败]补偿" ||
            row.changeType==='8' && "线上商品评价" }}
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="用户名" width="160" align="center" />
      <el-table-column prop="mobile" label="电话" width="160" align="center" />
      <el-table-column prop="storeName" label="门店名" width="220" align="center" />
      <el-table-column prop="createTime" label="创建时间" width="160" align="center" />

    </el-table>
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <!--搜索条件弹窗-->
    <el-dialog
      v-if="is_clear"
      class="my-class-pt0"
      :title="search_dialog_item.selectForm==='SupplierIndex' && '供应商' ||
        search_dialog_item.selectForm==='ProductIndex' && '商品列表' ||
        search_dialog_item.selectForm==='User' && '员工选择' || ''"
      :visible.sync="search_dialog_item.show"
      width="80%"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="search_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="false"
          :is_selected_arr="searchForm.goodsCodeGroup"
          @selectList="SearchDialogSelect"
          @addlist="search_dialog_item.show=false"
        />
      </div>
      <div slot="footer">
        <!-- <el-button @click="search_dialog_item.show=false">关 闭</el-button> -->
        <el-button type="primary" @click="search_dialog_item.show=false">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SelectOrgStore from '@/components/SelectOrgStore/SelectOrgStore.vue'
import MixPage from '@/components/MixinForm/MixPage.vue'
import User from '@/views/ums/admin/userSelectPage.vue'
import ProductIndex from '@/views/core/product/product/index.vue'
import { getPointLogPage } from '@/api/bms/PointLogPage'
import { getCategoryTree } from '@/api/core/goodscategory'
export default {
  name: 'PointLogPage',
  components: { SelectOrgStore, MixPage, User, ProductIndex },
  data() {
    return {
      is_clear: true,
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      goodsOptions: [],
      curr_date: [],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': 0,
        'storeId': 0,
        'startTime': '',
        'endTime': '',
        'fid': '',
        'operator': '',
        'mobile': '',
        'changeType': 0,
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
    maxHeight() {
      if (this.table_loading) {
        return this.windowH - 300
      }
      return this.windowH - 270 - this.$refs.searchForm.$el.offsetHeight
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
    this.getCategoryFn()
    this.search(null, null, 1)
  },
  methods: {
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (column.property === 'point') {
          sums[index] = data.map(item => Number(item[column.property])).reduce((prev, curr) => (prev + curr), 0)
        }
      })
      return sums
    },
    getCategoryFn() {
      getCategoryTree({}).then(res => {
        this.goodsOptions = res.data
      })
    },
    SearchDialogSelect(e, un) {
      switch (this.search_dialog_item.searchFormProp) {
        case 'Product':
          this.searchForm.goodsNameGroup = this.MergeArray(this.searchForm.goodsNameGroup, e.map(item => item.goodsName)).filter(item => !un.map((u) => u.goodsName).includes(item))
          this.searchForm.goodsCodeGroup = this.MergeArray(this.searchForm.goodsCodeGroup, e.map(item => item.goodsCode)).filter(item => !un.map((u) => u.goodsCode).includes(item))
          break
        case 'cashierName':
          this.searchForm.cashierId = e[0].id
          this.searchForm.cashierName = e[0].surname
          break
      }
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search(e, ps = null, pn = null) {
      this.table_loading = true
      this.searchForm.pageNum = pn || this.searchForm.pageNum
      this.searchForm.pageSize = ps || this.searchForm.pageSize
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
      getPointLogPage(searchForm).then(res => {
        this.tableData = res.data
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
</style>
