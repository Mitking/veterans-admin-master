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
      <el-form-item style="width:300px" label="商品">
        <el-input
          v-model="searchForm.goodsName"
          :readonly="false"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='ProductIndex';search_dialog_item.searchFormProp='ProductIndex';search_dialog_item.show=true"
          @clear="searchForm.goodsCode='';searchForm.goodsName=''"
        />
      </el-form-item>

    </el-form>
    <div style="margin:0 24px;">
      <el-button size="small" type="primary" @click="search">查询</el-button>
    </div>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      style="margin:12px 24px;max-width:98%;width:1421px"
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
      <el-table-column prop="beginPeriodAmount" width="140" label="期初库存金额" align="center">
        <template slot="header">
          <span class="table-header">期初库存金额
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="所选开始时间时的该门店所有库存成本金额" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.beginPeriodAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="endPeriodAmount" width="140" label="期末库存金额" align="center">
        <template slot="header">
          <span class="table-header">期末库存金额
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="所选结束时间时的该门店所有库存成本金额" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.endPeriodAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="saleCostAmount" width="140" label="商品销售成本" align="center">
        <template slot="header">
          <span class="table-header">商品销售成本
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="所有销售单的成本（销售，退货，赠送的成本都算）" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.saleCostAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="callCostAmount" width="120" label="调出成本" align="center">
        <template slot="header">
          <span class="table-header">调出成本
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="调出单单据明细商品调出成本汇总（按门店角度统计）" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.callCostAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="costStockTurnoverRate" width="160" label="库存周转率(成本)" align="center">
        <template slot="header">
          <span class="table-header">库存周转率(成本)
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="(商品销售成本+调出成本）*2/(期初库存金额+期末库存金额)" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ DECIMAL.mul(row.costStockTurnoverRate,'100') }} %
        </template>
      </el-table-column>
      <el-table-column prop="costStockTurnoverDays" width="180" label="库存周转天数(成本)" align="center">
        <template slot="header">
          <span class="table-header">库存周转天数(成本)
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="查询天数/库存周转率(成本)" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="numberStockTurnoverRate" width="160" label="库存周转率(数量)" align="center">
        <template slot="header">
          <span class="table-header">库存周转率(数量)
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="(商品销售数量+调出数量）*2/(期初库存数量+期末库存数量)" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ DECIMAL.mul(row.numberStockTurnoverRate,'100') }} %
        </template>
      </el-table-column>
      <el-table-column prop="numberStockTurnoverDays" width="180" label="库存周转天数(数量)" align="center">
        <template slot="header">
          <span class="table-header">库存周转天数(数量)
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="查询天数 / 库存周转率(数量)" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
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
import { StockTurnover } from '@/api/bms/StockTurnover'
import { getCategoryTree } from '@/api/core/goodscategory'
import dayjs from 'dayjs'
export default {
  name: 'StockTurnover',
  components: { SelectOrgStore, MixPage, User, ProductIndex },
  data() {
    return {
      is_clear: true,
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      goodsOptions: [],
      curr_date: [dayjs().subtract(3, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': 0,
        'storeId': 0,
        'startDate': dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
        'endDate': dayjs().format('YYYY-MM-DD'),
        'goodsCode': '',
        'goodsName': ''
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
      StockTurnover(searchForm).then(res => {
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
