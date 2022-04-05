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
        <!--@change="searchForm.startDate=$event?$event[0]:$event;searchForm.endDate=$event?$event[1]:$event"  -->
        <el-date-picker
          v-model="searchForm.spanDate"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00','23:59:59']"
          align="right"
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
          @clear="searchForm.goodsCodes=[];searchForm.goodsNameGroup=[];is_clear=false"
        />
      </el-form-item>
      <!-- <el-form-item style="width:300px" label="商品">
        <el-input
          v-model="searchForm.goodsName"
          :readonly="false"
          placeholder="全部"
          clearable
          @focus="search_dialog_item.selectForm='ProductIndex';search_dialog_item.searchFormProp='ProductIndex';search_dialog_item.show=true"
          @clear="searchForm.goodsCode='';searchForm.goodsName=''"
        />
      </el-form-item> -->

    </el-form>
    <div style="margin:0 24px">
      <el-button size="small" type="primary" @click="search">查询</el-button>
    </div>
    <el-table
      v-loading="table_loading"
      :data="tableData.records"
      style="margin:12px 24px;max-width:98%;width:1181px;"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      size="normal"
      :max-height="windowH-300"
      highlight-current-row
    >
      <!-- <el-table-column
        prop="storeId"
        align="center"
        width="200"
        label="门店"
      >
        <template slot-scope="{row}">
          {{ MenuGetPropName('stores', row.storeId,{value: 'id',label: 'name'}) }}
        </template>
      </el-table-column> -->
      <el-table-column prop="goodsCode" width="140" label="商品代码" align="center" />
      <el-table-column prop="goodsName" width="200" label="商品名称" align="center">
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

      <el-table-column prop="saleNum" sortable width="140" label="销售量" align="center">
        <template slot="header">
          <span class="table-header">销售量
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="该品区间销售数量" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ g2kg(row.saleNum) }}
        </template>
      </el-table-column>
      <el-table-column prop="saleAmount" sortable width="140" label="销售金额" align="center">
        <template slot="header">
          <span class="table-header">销售金额
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="该品区间销售金额" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.saleAmount) }}
        </template>
      </el-table-column>

      <el-table-column prop="avgNum" width="140" sortable label="日均售量" align="center">
        <template slot="header">
          <span class="table-header">日均售量
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="区间总销售数量/区间天数" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ g2kg(row.avgNum) }}
        </template>
      </el-table-column>
      <el-table-column prop="avgAmount" width="140" sortable label="日均售额" align="center">
        <template slot="header">
          <span class="table-header">日均售额
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="区间总销售额/区间天数" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
        <template slot-scope="{row}">
          {{ fen2yuan(row.avgAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="avgNumShare" sortable width="140" label="日均售量占比" align="center">
        <template slot="header">
          <span class="table-header">日均售额
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="(区间销售数量/区间总销售数量)*100%" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="avgAmountShare" sortable width="140" label="日均售额占比" align="center">
        <template slot="header">
          <span class="table-header">日均售额
            <el-tooltip v-if="!$store.state.app.tooltipDisabled" content="(区间销售金额/区间总销售额)*100%" placement="top" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
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
          :no_multiple="false"
          :table_goods_code_arr="[]"
          :is_selected_arr="searchForm.goodsCodes"
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
import { prodSaleShare } from '@/api/bms/ProdSaleShare'
import dayjs from 'dayjs'
export default {
  name: 'ProdSaleShare',
  components: { SelectOrgStore, MixPage, User, ProductIndex },
  data() {
    return {
      is_clear: true,
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      goodsOptions: [],
      table_loading: false,
      ids: [],
      showSummary: false,
      currentRow: { id: '' }, // 当前选择数据
      searchForm: {
        'orgId': 0,
        'storeId': 0,
        'spanDate': [dayjs().subtract(dayjs().get('date') >= 3 ? 3 : 0, 'day').format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')],
        'goodsCodes': [],
        'goodsNameGroup': [],
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
    //    })
  },
  methods: {
    // getCategoryFn() {
    //   getCategoryTree({}).then(res => {
    //     this.goodsOptions = res.data
    //   })
    // },
    SearchDialogSelect(e, un) {
      this.searchForm.goodsNameGroup = this.MergeArray(this.searchForm.goodsNameGroup, e.map(item => item.goodsName)).filter(item => !un.map((u) => u.goodsName).includes(item))
      this.searchForm.goodsCodes = this.MergeArray(this.searchForm.goodsCodes, e.map(item => item.goodsCode)).filter(item => !un.map((u) => u.goodsCode).includes(item))
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
      if (!this.searchForm.goodsCodes.length) {
        return this.$message.error('至少选一个品!')
      }
      // if (this.searchForm.spanDate && this.searchForm.spanDate[0] === this.searchForm.spanDate[1]) {
      //   return this.$message.error('起止日期不能是同一天!')
      // }
      if (!this.searchForm.spanDate) {
        return this.$message.error('日期不能为空!')
      }
      if (dayjs(this.searchForm.spanDate[0]).format('YYYY-MM') !== dayjs(this.searchForm.spanDate[1]).format('YYYY-MM')) {
        return this.$message.error('日期不可跨月!')
      }
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
      prodSaleShare(searchForm).then(res => {
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
