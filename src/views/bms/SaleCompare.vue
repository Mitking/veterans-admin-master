<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
    >
      <el-form-item
        label="上期"
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
          @change="searchForm.previousPeriodStartDate=$event?$event[0]:$event;searchForm.previousPeriodEndDate=$event?$event[1]:$event"
        />
      </el-form-item>

      <el-form-item
        label="同期"
        :style="{marginRight:'55px'}"
      >
        <el-date-picker
          v-model="curr_p_date"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          align="right"
          @change="searchForm.samePeriodStartDate=$event?$event[0]:$event;searchForm.samePeriodEndDate=$event?$event[1]:$event"
        />
      </el-form-item>

      <SelectOrgStore :type="1" @updateData="searchForm=Object.assign(searchForm,$event)" />

    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search">查询</el-button>
    </div>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      style="margin:12px 24px;max-width:98%;max-width:1800px"
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

      <el-table-column align="center" label="客单量">
        <el-table-column prop="preUpt" label="上期" align="center" />
        <el-table-column prop="sameUpt" label="同期" align="center" />
        <el-table-column prop="growthRateUpt" label="增长率" align="center">
          <template slot="header">
            <span class="table-header">增长率
              <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="（同期-上期）/上期" placement="top" effect="light">
                <i class="el-icon-warning-outline" />
              </el-tooltip>
            </span>
          </template>
          <template slot-scope="{row}">
            {{ DECIMAL.mul(row.growthRateUpt,'100') }} %
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column align="center" label="客单价">
        <el-table-column prop="preAtv" label="上期" align="center">
          <template slot-scope="{row}">
            {{ fen2yuan(row.preAtv) }}
          </template>
        </el-table-column>
        <el-table-column prop="sameAtv" label="同期" align="center">
          <template slot-scope="{row}">
            {{ fen2yuan(row.sameAtv) }}
          </template>
        </el-table-column>
        <el-table-column prop="growthRateAtv" label="增长率" align="center">
          <template slot-scope="{row}">
            {{ DECIMAL.mul(row.growthRateAtv,'100') }} %
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column align="center" label="商品销售数量">
        <el-table-column prop="preSaleNumber" label="上期" align="center">
          <template slot-scope="{row}">
            {{ DECIMAL.div(row.preSaleNumber,'1000') }}
          </template>
        </el-table-column>
        <el-table-column prop="sameSaleNumber" label="同期" align="center">
          <template slot-scope="{row}">
            {{ DECIMAL.div(row.sameSaleNumber,'1000') }}
          </template>
        </el-table-column>
        <el-table-column prop="growthRateSaleNumber" label="增长率" align="center">
          <template slot-scope="{row}">
            {{ DECIMAL.mul(row.growthRateSaleNumber,'100') }} %
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column align="center" label="商品销售金额">
        <el-table-column prop="preSaleAmount" label="上期" align="center">
          <template slot-scope="{row}">
            {{ fen2yuan(row.preSaleAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="sameSaleAmount" label="同期" align="center">
          <template slot-scope="{row}">
            {{ fen2yuan(row.sameSaleAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="growthRateGrossMargin" label="增长率" align="center">
          <template slot-scope="{row}">
            {{ DECIMAL.mul(row.growthRateGrossMargin,'100') }} %
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column align="center" label="商品销售毛利">
        <el-table-column prop="preGrossMargin" label="上期" align="center">
          <template slot-scope="{row}">
            {{ fen2yuan(row.preGrossMargin) }}
          </template>
        </el-table-column>
        <el-table-column prop="sameGrossMargin" label="同期" align="center">
          <template slot-scope="{row}">
            {{ fen2yuan(row.sameGrossMargin) }}
          </template>
        </el-table-column>
        <el-table-column prop="growthRateGrossMargin" label="增长率" align="center">
          <template slot-scope="{row}">
            {{ DECIMAL.mul(row.growthRateGrossMargin,'100') }} %
          </template>
        </el-table-column>
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
import { SaleCompare } from '@/api/bms/SaleCompare'
import { getCategoryTree } from '@/api/core/goodscategory'
import dayjs from 'dayjs'
export default {
  name: 'SaleCompare',
  components: { SelectOrgStore, MixPage, User, ProductIndex },
  data() {
    return {
      is_clear: true,
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      goodsOptions: [],
      curr_date: [dayjs().subtract(1, 'day').format('YYYY-MM-DD'), dayjs().subtract(1, 'day').format('YYYY-MM-DD')],
      curr_p_date: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': 0,
        'storeId': 0,
        'previousPeriodStartDate': dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
        'previousPeriodEndDate': dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
        'samePeriodStartDate': dayjs().format('YYYY-MM-DD'),
        'samePeriodEndDate': dayjs().format('YYYY-MM-DD')
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
      SaleCompare(searchForm).then(res => {
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
