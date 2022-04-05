<template>
  <div>
    <!-- 头部 -->
    <el-form ref="searchForm" :model="searchForm" inline :style="{margin:'24px 24px 0 24px'}">
      <el-form-item
        :rules="[{ required: true, message: '门店不能为空'}]"
        prop="storeIds"
        label="门店"
        :style="{marginRight:'55px'}"
      >
        <el-cascader
          v-model="searchForm.storeIds"
          style="width:350px"
          :options="storesOptions"
          :props="{ multiple: true,emitPath:false }"
          collapse-tags
          clearable
        />
        <!-- <el-select
          v-if="[2].includes($store.getters.accountType)"
          v-model="searchForm.storeIds"
          placeholder="请选择"
          multiple
          collapse-tags
          style="width:100%"
        >
          <el-option
            v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'}).filter(item=>item.orgId===$store.getters.orgId)"
            :key="indexSon"
            :label="itemSon.name"
            :value="itemSon.id"
          />
        </el-select> -->
      </el-form-item>
      <el-form-item
        :rules="[{ required: true, message: '日期不能为空'},{ validator: validate, trigger: 'change' }]"
        prop="endDate"
        label="日期"
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
      <el-form-item
        :rules="[{ required: true, message: '商品不能为空'}]"
        prop="goodsNameGroup"
        style="width:300px"
        label="商品列表"
      >
        <el-input
          :value="searchForm.goodsNameGroup.toString()"
          :readonly="false"
          placeholder="点击选择"
          clearable
          @focus="is_clear=true;search_dialog_item.selectForm='ProductIndex';search_dialog_item.searchFormProp='Product';search_dialog_item.show=true"
          @clear="searchForm.purchaseList=[];searchForm.goodsNameGroup='';is_clear=false"
        />
      </el-form-item>
    </el-form>
    <!-- 操作栏 -->
    <el-form inline size="mini" style="margin: 0 24px">
      <el-form-item v-for="item in operateList" :key="item.prop">
        <el-button type="primary" :loading="item.loading" :icon="item.icon" @click="item.click">{{ item.title }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 门店汇总 -->
    <el-table
      v-if="mode==='store'"
      ref="dataTreeList"
      v-loading="tabLoading"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      :max-height="windowH-300"
      style="margin: 0 24px;max-width: 98%;"
      border
      :data="tableData"
      @row-click="(row) => {$refs.dataTreeList.toggleRowExpansion(row)}"
    >
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <el-form size="mini" label-position="left" inline class="demo-table-expand">
            <el-table
              size="mini"
              border
              :data="row.purchaseList"
              style="width: 1171px;margin:10px"
            >
              <el-table-column
                label="商品代码"
                prop="goodsCode"
                align="center"
                width="150"
              />
              <el-table-column
                label="商品名称"
                prop="goodsName"
                align="center"
                width="300"
              />
              <el-table-column
                label="单位"
                prop="purUnit"
                align="center"
                width="100"
              />
              <el-table-column
                label="库存"
                prop="stockNumber"
                align="center"
                width="100"
              />
              <el-table-column
                label="预算天数"
                prop="preSaleDays"
                align="center"
                width="100"
              />
              <el-table-column
                label="销量"
                prop="saleNumber"
                align="center"
                width="100"
              />
              <el-table-column
                label="平均一天销量"
                prop="avgSaleNumber"
                align="center"
                width="160"
              />
              <el-table-column
                label="采购预算数"
                prop="purpreNumber"
                align="center"
                width="160"
              />
            </el-table>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="#"
        type="index"
      />
      <el-table-column
        label="门店"
        prop="storeName"
      />
    </el-table>

    <!-- 合计 -->
    <el-table
      v-if="mode==='goods'"
      ref="dataTreeList"
      v-loading="tabLoading"
      :max-height="windowH-300"
      style="margin: 0 24px;max-width: 98%;"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :data="totalData"
      @row-click="(row) => {$refs.dataTreeList.toggleRowExpansion(row)}"
    >
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-table
              size="mini"
              border
              :data="row.dataDetails"
              style="width: 1171px;margin:10px"
            >
              <el-table-column
                label="商品代码"
                prop="goodsCode"
                align="center"
                width="150"
              />
              <el-table-column
                label="门店名"
                prop="storeName"
                align="center"
                width="300"
              />
              <el-table-column
                label="采购单位"
                prop="unit"
                align="center"
                width="100"
              />
              <el-table-column
                label="库存"
                prop="storage"
                align="center"
                width="100"
              />
              <el-table-column
                label="销售量"
                prop="saleVolumes"
                align="center"
                width="100"
              />
              <el-table-column
                label="预算量"
                prop="budgetVolumes"
                align="center"
                width="100"
              />
              <el-table-column
                label="最后一次采购价"
                prop="lastPurPrice"
                align="center"
                width="160"
              />
              <el-table-column
                label="合计"
                prop="total"
                align="center"
                width="160"
              />
            </el-table>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="#"
        type="index"
      />
      <el-table-column
        label="标题"
        prop="title"
      />
      <el-table-column
        label="合计数量"
        prop="total"
      />
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
          :child_search_data="{goodsType:'1'}"
          :is_selected_arr="searchForm.purchaseList"
          :no_multiple="false"
          @selectList="SearchDialogSelect"
          @addlist="search_dialog_item.show=false"
        />
      </div>
      <div slot="footer">
        <!-- <el-button @click="search_dialog_item.show=false">关 闭</el-button> -->
        <el-button type="primary" @click="dialogShow">查看已添加</el-button>
        <el-button type="primary" @click="search_dialog_item.show=false">确 认</el-button>
      </div>
    </el-dialog>
    <el-dialog
      custom-class="max-form-width"
      title="已选商品"
      :visible.sync="dialogVisible"
    >
      <div>
        <Table style="margin:auto" :purchase-list="purchaseList" @del="SearchDialogSelect([],$event);is_clear=false" />
      </div>
      <div slot="footer">
        <el-button type="primary" @click="SearchDialogSelect([],purchaseList);is_clear=false">清 空</el-button>
        <el-button type="primary" @click="dialogVisible = false;is_clear=true;search_dialog_item.show=true">添 加</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import dayjs from 'dayjs'
import MixinGlobal from '@/components/MixinGlobal'
import Table from './Table'
import { purBudget, dataTotal, exportDataTotal } from '@/api/wms/newprod'
import { getStoreList } from '@/api/core/store'
import { queryOrgByAccountId } from '@/api/ums/org'
import { mapGetters } from 'vuex'
import ProductIndex from '@/views/core/product/product/index.vue'
import store from '@/store'
export default {
  name: 'NewProd',
  components: { ProductIndex, Table },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      tabLoading: false,
      mode: 'store',
      tableData: [],
      totalData: [],
      activeNames: '',
      purchaseList: [],
      dialogVisible: false,
      is_clear: true,
      search_dialog_item: { selectForm: '', searchFormProp: '', show: false },
      operateList: [
        { title: '采购计算', prop: 'search', click: this.search, icon: 'el-icon-search', permission: ['analysis:budget:purBudget'] },
        { title: '查看已选', prop: 'products', click: this.dialogShow, icon: 'el-icon-finished', permission: ['analysis:budget:purBudget'] },
        { title: '合计', prop: 'dataTotal', click: this.searchTotal, icon: 'el-icon-paperclip', permission: ['analysis:budget:dataTotal'] },
        { title: '导出', prop: 'output', click: this.exportData, icon: 'el-icon-download', permission: ['analysis:budget:purBudget'] },
        { title: '全部展开', prop: 'allopen', click: this.allopen, icon: 'el-icon-arrow-down', permission: [''] },
        { title: '全部收起', prop: 'allclose', click: this.allclose, icon: 'el-icon-arrow-up', permission: [''] }
      ],
      searchForm: {
        'startDate': dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
        'endDate': dayjs().format('YYYY-MM-DD'),
        'storeIds': [],
        'goodsNameGroup': [],
        'purchaseList': []
      },
      curr_date: [dayjs().subtract(3, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
    }
  },
  computed: {
    ...mapGetters([
      'enumList',
      'accountId'
    ]),
    storesOptions() {
      const store_org = this.groupByProp(this.$store.getters.enumList.stores, 'orgId')
      const res = store_org.map(item => ({
        label: this.MenuGetPropName('organizes', item.orgId, { label: 'orgShortName', value: 'id' }),
        value: item.id,
        children: item.children.map(itemC => ({
          label: itemC.name,
          value: itemC.id
        }))
      }))
      return res
    }
  },
  watch: {},
  created() {
    if (this.enumList.organizes.length === 0 || this.enumList.stores.length === 0) {
      console.log('没有组织或者门店数据')
      Promise.all([
        queryOrgByAccountId({ accountId: this.accountId }),
        getStoreList({})
      ]).then((res) => { // 返回的res是一个数组
        if (res[0].code === 200) {	// res[0] 是接口1的返回数据
          store.dispatch('enum/add_enum', { organizes: res[0].data || [] })
          if (res[1].code === 200) {	// res[1] 是接口2的返回数据
            store.dispatch('enum/add_enum', { stores: res[1].data || [] })
          } else {
            this.$message.info('门店列表加载失败！')
            this.isOK = false
          }
        } else {
          this.$message.info('组织列表加载失败！')
        }
      })
    }
  },
  methods: {
    validate(rule, value, callback) {
      if (value === this.searchForm.startDate) {
        callback(new Error('开始结束日期不能相同!'))
      } else {
        callback()
      }
    },
    dialogShow() {
      if (this.purchaseList.length === 0) {
        return this.$message.info('没有选择商品')
      }
      this.search_dialog_item.show = false
      this.dialogVisible = true
    },
    search() {
      this.mode = 'store'
      this.$refs.searchForm.validate(pass => {
        if (pass) {
          this.tabLoading = true
          purBudget(this.searchForm).then(res => {
            this.tableData = res.data
          }).finally(() => {
            this.tabLoading = false
          })
        }
      })
    },
    searchTotal() {
      if (this.tableData.length === 0) {
        return this.$message.info('合计失败:无商品数据')
      }
      this.tabLoading = true
      dataTotal({ datas: this.tableData }).then(res => {
        this.totalData = res.data
        this.mode = 'goods'
      }).finally(() => {
        this.tabLoading = false
      })
    },
    exportData(e) {
      if (this.tableData.length === 0) {
        return this.$message.info('导出失败:无商品数据')
      }
      e.loading = true
      exportDataTotal({ datas: this.tableData, title: this.searchForm.startDate + '至' + this.searchForm.endDate }).finally(() => {
        e.loading = false
      })
    },
    allopen() {
      this.tableData.forEach(item => {
        this.$refs.dataTreeList.toggleRowExpansion(item, true)
      })
      this.totalData.forEach(item => {
        this.$refs.dataTreeList.toggleRowExpansion(item, true)
      })
    },
    allclose() {
      this.tableData.forEach(item => {
        this.$refs.dataTreeList.toggleRowExpansion(item, false)
      })
      this.totalData.forEach(item => {
        this.$refs.dataTreeList.toggleRowExpansion(item, false)
      })
    },
    SearchDialogSelect(e, un) {
      this.searchForm.goodsNameGroup = this.MergeArray(this.searchForm.goodsNameGroup, e.map(item => item.goodsName)).filter(item => !un.map((u) => u.goodsName).includes(item))
      this.searchForm.purchaseList = this.MergeArray(this.searchForm.purchaseList, e.map(item => item.goodsCode)).filter(itemF => !un.map((u) => u.goodsCode).includes(itemF))
      this.purchaseList = this.MergeArray(this.purchaseList, e).filter(item => !un.map((u) => u.goodsCode).includes(item.goodsCode))
    }
  }
}
</script>
<style>
.max-form-width{
 width: 80%;
 max-width: 1100px!important
}
</style>
