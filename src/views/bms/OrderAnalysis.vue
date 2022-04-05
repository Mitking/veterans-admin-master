<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
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
          @change="searchForm.startDate=$event?$event[0]:$event;searchForm.endDate=$event?$event[1]:$event"
        />
      </el-form-item>
      <!-- <el-form-item style="width:300px" label="商品">
        <el-input
          v-model="searchForm.goodsName"
          :readonly="false"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='ProductIndex';search_dialog_item.searchFormProp='ProductIndex';search_dialog_item.show=true"
          @clear="$set(searchForm,'goodsCode','');$set(searchForm,'goodsName','')"
        />
      </el-form-item> -->

    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search">查询</el-button>
    </div>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      style="margin:12px 24px;max-width:98%;width:1661px"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="windowH-300"
      highlight-current-row
    >
      <el-table-column
        prop="storeId"
        align="center"
        :width="'200'"
        label="门店"
      >
        <template slot-scope="{row}">
          {{ MenuGetPropName('stores', row.storeId,{value: 'id',label: 'name'}) }}
        </template>
      </el-table-column>
      <el-table-column prop="turnover" width="100" label="营业额" align="center">
        <template slot-scope="{row}">
          {{ fen2yuan(row.turnover) }}
        </template>
      </el-table-column>
      <el-table-column prop="couponTurnover" width="140" label="营业额(消费券)" align="center">
        <template slot-scope="{row}">
          {{ fen2yuan(row.couponTurnover) }}
        </template>
      </el-table-column>
      <el-table-column prop="turnoverRate" width="100" label="金额占比" align="center">
        <template slot="header">
          <span class="table-header">金额占比
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="营业额/sum(营业额)" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.turnoverRate?DECIMAL.mul(row.turnoverRate,'100'):'-' }} %
        </template>
      </el-table-column>
      <el-table-column prop="upt" width="100" label="客单量" align="center" />
      <el-table-column prop="uptRate" width="120" label="客单量占比" align="center">
        <template slot="header">
          <span class="table-header">客单量占比
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="客单量/sum（客单量）" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.uptRate?DECIMAL.mul(row.uptRate,'100'):'-' }} %
        </template>
      </el-table-column>
      <el-table-column prop="atv" width="100" label="客单价" align="center">
        <template slot="header">
          <span class="table-header">客单价
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="营业额/客单量" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.atv) }}
        </template>
      </el-table-column>
      <el-table-column prop="memberTurnover" width="160" label="会员商品销售金额" align="center">
        <template slot-scope="{row}">
          {{ fen2yuan(row.memberTurnover) }}
        </template>
      </el-table-column>
      <el-table-column prop="memberTurnoverRate" width="140" label="会员金额占比" align="center">
        <template slot="header">
          <span class="table-header">会员金额占比
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="会员商品销售金额/营业额" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.memberTurnoverRate?DECIMAL.mul(row.memberTurnoverRate,'100'):'-' }} %
        </template>
      </el-table-column>
      <el-table-column prop="memberUpt" width="140" label="会员客单数" align="center" />
      <el-table-column prop="memberUptRate" width="140" label="会员客单占比" align="center">
        <template slot="header">
          <span class="table-header">会员客单占比
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="会员客单数/客单数" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.memberUptRate?DECIMAL.mul(row.memberUptRate,'100'):'-' }} %
        </template>
      </el-table-column>
      <el-table-column prop="memberAtv" width="120" label="会员客单价" align="center">
        <template slot="header">
          <span class="table-header">会员客单价
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="会员商品销售金额/会员客单数" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.memberAtv) }}
        </template>
      </el-table-column>
      <el-table-column prop="associateRate" width="100" label="连带率" align="center">
        <template slot="header">
          <span class="table-header">连带率
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="销售明细计数/有效单据数（销售明细计数取值，只取状态是销售的数据，不取状态是赠送和退货的数据。同一个order里如果A商品有多条销售明细，那么只按1条统计。）" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.associateRate?DECIMAL.mul(row.associateRate,'100'):'-' }} %
        </template>
      </el-table-column>
    </el-table>
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      v-if="is_clear"
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
          :no_multiple="true"
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
import { OrderAnalysis } from '@/api/bms/OrderAnalysis'
import { getCategoryTree } from '@/api/core/goodscategory'
export default {
  name: 'OrderAnalysis',
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
        'accountId': 0,
        'orgId': 0,
        'storeId': 0,
        'startDate': '',
        'endDate': ''
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
    // this.getCategoryFn()
    // getCategoryList({}).then(res => {
    //   store.dispatch('enum/add_enum', { categoryList: res.data || [] }).then(() => {
    //     this.search()
    //   })
    // })
    this.search()
  },
  methods: {
    getCategoryFn() {
      getCategoryTree({}).then(res => {
        this.goodsOptions = res.data
      })
    },
    SearchDialogSelect(e) {
      switch (this.search_dialog_item.searchFormProp) {
        case 'ProductIndex':
          this.searchForm.goodsName = e[0].goodsName
          this.searchForm.goodsCode = e[0].goodsCode
          break
        case 'cashierName':
          this.searchForm.cashierId = e[0].id
          this.searchForm.cashierName = e[0].surname
          break
      }

      // this.searchForm
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
      Object.keys(searchForm).map(prop => {
        searchForm[prop] = searchForm[prop] || null
        if (prop === 'orgId') {
          searchForm.orgId = [1, 2].includes(this.$store.getters.accountType) ? this.$store.getters.orgId : searchForm.orgId
        }
        if (prop === 'storeId') {
          searchForm.storeId = this.$store.getters.accountType === 1 ? this.$store.getters.storeId : searchForm.storeId
        }
      })
      OrderAnalysis(searchForm).then(res => {
        this.tableData.records = res.data
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
