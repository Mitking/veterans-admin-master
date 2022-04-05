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
      <el-form-item style="width:300px">
        <template slot="label">
          <span>商品列表</span>
          <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="商品档案可以多选" placement="top" effect="light">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </template>
        <el-input
          :value="searchForm.goodsNameGroup.toString()"
          :readonly="false"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='ProductIndex';search_dialog_item.searchFormProp='Product';search_dialog_item.show=true"
          @clear="searchForm.goodsCodeGroup=[];searchForm.goodsNameGroup=[];is_clear=false"
        />
      </el-form-item>

      <el-form-item label="商品类别" :style="{width:'300px'}">
        <el-cascader
          v-model="searchForm.categoryId"
          clearable
          :options="goodsOptions"
          :props="{
            value:'id',
            label:'name',
            emitPath:false,
            checkStrictly: true
          }"
          @focus="getCategoryFn"
        />
      </el-form-item>

      <el-form-item label="收银员" :style="{width:'300px'}">
        <el-input
          v-model="searchForm.cashierName"
          :readonly="false"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='User';search_dialog_item.searchFormProp='cashierName';search_dialog_item.show=true"
          @clear="searchForm.cashierId='';searchForm.cashierName=''"
        />
      </el-form-item>

    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search(null, null, 1)">查询</el-button>
    </div>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      style="margin:12px 24px;width:2100px;max-width:98%"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="maxHeight"
      highlight-current-row
    >
      <el-table-column prop="orderNo" width="200" label="单据号" align="center" />
      <el-table-column prop="goodsCode" label="商品代码" width="160" align="center" />
      <el-table-column prop="goodsName" label="商品名称" width="200" align="center">
        <template slot-scope="{row}">
          <el-tooltip
            v-if="row.goodsName.length>12"
            effect="dark"
            :content="row.goodsName"
            placement="top-start"
          >
            <div>
              {{ row.goodsName | sizeFilter(12) }}
            </div>
          </el-tooltip>
          <div v-else>{{ row.goodsName }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="spec" label="规格" align="center" />
      <el-table-column prop="weightType" label="单位" align="center">
        <template slot-scope="{row}">
          {{ MenuGetPropName('weight_type',row.weightType) }}
        </template>
      </el-table-column>
      <el-table-column prop="number" label="数量" align="center">
        <template slot-scope="{row}">
          {{ g2kg(row.number) }}
        </template>
      </el-table-column>
      <el-table-column prop="actualPrice" width="120" align="center">
        <template slot="header">
          <span class="table-header">实际售价
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="实际销售价（会员记录会员价；非会员记录非会员价）" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.actualPrice) }}
        </template>
      </el-table-column>
      <el-table-column prop="actualAmount" width="120" align="center">
        <template slot="header">
          <span class="table-header">实际销售额
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="实际售价*数量" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.actualAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="costAmount" align="center">
        <template slot="header">
          <span class="table-header">成本
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="门店商品成本*数量" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.costAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="gross" align="center">
        <template slot="header">
          <span class="table-header">毛利
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="实际销售额-成本" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.gross) }}
        </template>
      </el-table-column>
      <el-table-column prop="grossRate" width="100" align="center">
        <template slot="header">
          <span class="table-header">毛利率
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="毛利/实际销售额" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.grossRate }} %
        </template>
      </el-table-column>
      <el-table-column prop="storeName" label="门店" width="200" align="center" />
      <el-table-column prop="cashier" width="120" label="收银员" align="center" />
      <el-table-column prop="deviceCode" label="收款机" width="150" align="center">
        <template slot-scope="{row}">
          <el-tooltip
            effect="dark"
            :content="row.deviceCode"
            placement="top-start"
          >
            <div>
              {{ row.deviceCode | sizeFilter(10) }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="dealTime" label="收款时间" width="160" align="center" />
      <!-- <el-table-column prop="mobile" label="手机号" width="150" align="center" /> -->
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
      :width="search_dialog_item.selectForm==='User' && '600px' || '80%'"
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
import { getRetailPage } from '@/api/bms/RetailDetails'
import { getCategoryTree } from '@/api/core/goodscategory'
export default {
  name: 'RetailDetails',
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
        'goodsCodeGroup': [],
        'goodsNameGroup': '',
        'cashierId': '',
        'cashierName': '',
        'categoryId': 0,
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
      return this.windowH - 300 - this.$refs.searchForm.$el.offsetHeight
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

      // this.searchForm
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
      searchForm.goodsCodeGroup = searchForm.goodsCodeGroup.length ? searchForm.goodsCodeGroup : null
      getRetailPage(searchForm).then(res => {
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
