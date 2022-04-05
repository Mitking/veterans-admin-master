<template>
  <div v-entersearch:Enter="{is_child:false,func:search}">
    <el-form
      inline
      :style="{margin:'24px 24px 0 24px'}"
      class="form-fa"
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
      <el-form-item style="width:220px" label="累计占比A(%)">
        <el-input v-model="searchForm.totalPercentA" v-number-input.float="{decimal:2,max:100}" style="width:100px" />
      </el-form-item>
      <el-form-item style="width:220px" label="累计占比B(%)">
        <el-input v-model="searchForm.totalPercentB" v-number-input.float="{decimal:2,max:100}" style="width:100px" />
      </el-form-item>
      <el-form-item style="width:300px" label="商品列表">
        <el-input
          :value="searchForm.goodsNameGroup.toString()"
          :readonly="false"
          style="width:180px"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='ProductIndex';search_dialog_item.searchFormProp='Product';search_dialog_item.show=true"
          @clear="searchForm.goodsCodeGroup=[];searchForm.goodsNameGroup='';is_clear=false"
        />
      </el-form-item>
      <el-form-item>
        <el-button size="small" type="primary" @click="search">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      :summary-method="getSummaries"
      style="margin:12px 24px;width:1951px;max-width:98%"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="windowH-300"
      highlight-current-row
    >

      <el-table-column prop="goodsCode" label="商品代码" width="150" align="center">
        <template slot-scope="{row}">
          <el-tooltip
            effect="dark"
            :content="row.goodsCode"
            placement="top-start"
          >
            <div>
              {{ row.goodsCode | sizeFilter(14) }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="goodsName" label="商品名称" width="200" align="center" />
      <el-table-column prop="weightType" width="120" label="商品单位" align="center">
        <template slot-scope="{row}">
          {{ MenuGetPropName('weight_type',row.weightType) }}
        </template>
      </el-table-column>

      <el-table-column prop="spec" width="100" label="规格" align="center" />
      <el-table-column prop="goodsCategoryId" width="100" label="类别" align="center">
        <template slot-scope="{row}">
          {{ MenuGetPropName('categoryList',row.goodsCategoryId,{value:'id',lebal:'name'}) }}
        </template>
      </el-table-column>

      <el-table-column prop="saleAmount" width="140" label="商品销售金额" align="center">
        <template slot-scope="{row}">
          {{ fen2yuan(row.saleAmount) }}
        </template>
      </el-table-column>

      <el-table-column prop="saleAmountRate" width="180" label="商品销售金额占比" align="center">
        <template slot="header">
          <span class="table-header">销售金额占比
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="销售金额/销售金额合计" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.saleAmountRate !==undefined ?row.saleAmountRate+'%':'' }}
        </template>
      </el-table-column>
      <el-table-column prop="saleAbc" width="120" label="销售ABC" align="center">
        <template slot="header">
          <span class="table-header">销售ABC
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="ABC的算法:A=销售金额合计*70%;B=销售金额合计*90%-A;根据商品销售金额排序,小于等于A为A品,小于等于B为B品" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="grossAmount" width="140" label="商品销售毛利" align="center">
        <template slot="header">
          <span class="table-header">销售毛利
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="销售金额-销售成本" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.grossAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="grossAmountRate" width="160" label="商品销售毛利占比" align="center">
        <template slot="header">
          <span class="table-header">销售毛利占比
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="销售毛利/销售毛利合计" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ row.grossAmountRate !==undefined ?row.grossAmountRate+'%':'' }}
        </template>
      </el-table-column>
      <el-table-column prop="grossAbc" width="120" label="毛利ABC" align="center">
        <template slot="header">
          <span class="table-header">毛利ABC
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="ABC的算法:A=销售毛利合计*70%;B=销售毛利合计*90%-A;根据商品销售毛利排序,小于等于A为A品,小于等于B为B品" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="saleNumber" width="140" label="商品销售数量" align="center">
        <template slot-scope="{row}">
          {{ g2kg(row.saleNumber) }}
        </template>
      </el-table-column>
      <el-table-column prop="grossAmountRate" width="160" label="商品销售数量占比" align="center">
        <template slot-scope="{row}">
          {{ row.saleNumberRate?row.saleNumberRate+'%':'' }}
        </template>
      </el-table-column>
      <el-table-column prop="numberAbc" width="120" label="数量ABC" align="center">
        <template slot="header">
          <span class="table-header">数量ABC
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="ABC的算法:A=销售数量合计*70%;B=销售数量合计*90%-A;根据商品销售数量排序,小于等于A为A品,小于等于B为B品" placement="top" effect="light">
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
          :is_selected_arr="searchForm.goodsCodeGroup"
          :no_multiple="false"
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
import { AbcGroup } from '@/api/bms/AbcGroup'
import { getCategoryTree, getCategoryList } from '@/api/core/goodscategory'
import store from '@/store'
export default {
  name: 'AbcGroup',
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
        'goodsCodeGroup': [],
        'goodsNameGroup': [],
        'startDate': '',
        'endDate': '',
        'totalPercentA': 70,
        'goodsCode': '',
        'goodsName': '',
        'totalPercentB': 90
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
    getCategoryList({}).then(res => {
      store.dispatch('enum/add_enum', { categoryList: res.data || [] }).then(() => {
        this.search()
      })
    })
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
      AbcGroup(searchForm).then(res => {
        res.data = res.data || []
        res.data.map(item => { item.weightType = Number(item.weightType) })
        this.tableData.records = res.data
      }).finally(() => {
        this.table_loading = false
      })
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总价'
          return
        }
        if (['saleAmount', 'grossAmount'].includes(column.property)) {
          const val = data.map(item => Number(item[column.property])).reduce((curr, prve) => this.DECIMAL.add(curr, prve).toNumber(), 0)
          sums[index] = this.fen2yuan(val)
        } else {
          sums[index] = ''
        }
        // const values = data.map(item => Number(item[column.property]))
      })
      return sums
    }
  }
}
</script>

<style scoped>
/* .form-fa{
  display: flex;
  flex-wrap: wrap;
}
.form-fa >>> .el-form-item__content{
  display: flex;
  padding:0 30px 0 0;
  margin: 0;
} */
.form-fa >>> .el-form-item{
  margin-bottom:10px
}
</style>
