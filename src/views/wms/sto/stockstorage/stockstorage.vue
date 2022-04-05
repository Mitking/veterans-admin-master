<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      :readonly-from-page="mixin_select_form_show"
      v-bind="$attrs"
      @search="search({ prop: true })"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event]=''"
    />
    <!-- </transition> -->
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :rows="[]"
      :ids="[]"
      :current-row="null"
      :back="true"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined}),{op:true,opWidth:(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @selection-change="handleSelectionChange"
    >
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='select'">{{ MenuGetPropName(item.selectData,row[item.prop],{ value: '', label: '' }) }}</div>
          <div v-else-if="item.type==='PRICE'">{{ fen2yuan(row[item.prop]) }}</div>
          <div v-else-if="item.type==='COST_PRICE'">{{ fen2yuan6cover(row[item.prop]) }}</div>
          <div v-else-if="item.type==='weight_number'">{{ g2kg(row[item.prop]) }}</div>
          <!--          v-else-->
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>

      <!-- 操作单条 -->
      <el-table-column
        v-if="mixTableOprateLength"
        :width="mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0"
        align="center"
        :fixed="!!tableData.records.length?'right':false"
        label="操作"
        class="my-op-fa"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            v-for="item in operateTableList"
            :key="item.prop"
            effect="light"
            :content="item.title"
            placement="top"
            :hide-after="1000"
            :enterable="false"
            :disabled="$store.state.app.tooltipDisabled"
          >
            <el-button
              v-show="item.show"
              v-permission="item.permission"
              class="my-op-class"
              type="text"
              size="mini"
              :disabled="comp_disabled_table(item,row)"
              :loading="item.loading"
              :icon="item.icon"
              @click.stop="
                if(operateTableList.every(item => !item.loading )){
                  currentRow=row;
                  item.click(item)
                }"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      :title="mixin_dialog_item.selectForm==='SupplierIndex' && '供应商' ||
        mixin_dialog_item.selectForm==='ProductIndex' && '商品列表' ||
        mixin_dialog_item.selectForm==='storagechangelog' && `近30天库存变更记录:${currentRow.storeName}「${currentRow.goodsName}」` ||
        mixin_dialog_item.selectForm==='User' && '员工选择'"
      :visible.sync="mixin_select_form_show"
      width="1450px"
    >
      <div>
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          :log_search_data="currentRow"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show=false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
// addSendCall,deleteDetailById,getCallDetails,reviewSendCall,updateSendCall getCallDetails, addSendCall, updateSendCall, deleteDetailById, getSendNumber,
import { getStockStoragePage, printStockStorage, syncLemengStockByStoreId } from '@/api/wms/stockstorage'
import { syncStock } from '@/api/core/storeproduct'
import ProductIndex from '@/views/core/product/product/index'
import { getCategoryTree } from '@/api/core/goodscategory'
import User from '@/views/ums/admin/userSelectPage'
import storagechangelog from '@/views/wms/sto/storagechangelog'
import dayjs from 'dayjs'
export default {
  name: 'Order',
  components: { ProductIndex, User, storagechangelog },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      currentRow: { id: '' },
      Comp: 'ProductIndex',
      selectFormShow: false,
      stockStorageLogShow: false,
      operateTableList: [
        { title: '库存变更记录', show: !this.$attrs.is_child, loading: false, prop: 'stockStorageLog', click: this.stockStorageLogFn, icon: 'el-icon-s-data', disabled: 'isRow', type: 'primary', permission: ['core:stockStorage:log'], width: 80 },
        { title: '同步乐檬库存', show: !this.$attrs.is_child, loading: false, prop: 'syncLenmeng', click: this.syncLenmengFn, icon: 'el-icon-monitor', disabled: 'isRow', disabledFn: (row) => !row.itemNum, type: 'primary', permission: ['api:lemeng:syncStock'], width: 80 }
      ],
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'orgId', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '门店', prop: 'storeId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), type: 'select', selectData: 'stores', width: '300px', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId' },
        { title: '仓库', prop: 'stockId', defaultValue: 0, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId' },
        // { title: '商品', prop: 'goodsName', reallyProp: 'goodsCode', click: 'addItems', selectForm: 'ProductIndex', type: 'selectFromPage', width: '300px' },
        { title: '商品名称', prop: 'goodsName', type: 'text', width: '300px' },
        { title: '商品条码', prop: 'barcode', type: 'text', width: '300px' },
        { title: '分类', prop: 'goodsCategoryId', type: 'goodsCategory', width: '300px', goodsOptions: [], valueProp: 'id' },
        { title: '库存数量正序', prop: 'sortByStorage', type: 'checkbox', width: '150px' },
        { title: '只看停售', prop: 'stopSale', type: 'checkbox', width: '150px' },
        { title: '不看停售', prop: 'notStopSale', type: 'checkbox', width: '150px' },
        { title: '只看负库存', prop: 'burden', type: 'checkbox', width: '150px' },
        { title: '不看负库存', prop: 'notBurden', type: 'checkbox', width: '150px' },
        { title: '只看0库存', prop: 'zero', type: 'checkbox', width: '150px' },
        { title: '不看0库存', prop: 'notZero', type: 'checkbox', width: '150px' }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:stockStorage:getList'], width: 80 },
        { title: '同步门店乐檬库存', show: true, prop: 'export', click: this.syncLemengByStoreId, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:stockStorage:print'], width: 80 },
        { title: '导出', show: true, prop: 'export', click: this.searchExport, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:stockStorage:print'], width: 80 }
      ],

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        // shipStoreId: this.$store.state.user.storeId,
        pageNum: 1,
        pageSize: 10
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
  watch: {},
  created() {
    console.log('重新加载')
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    getCategoryTree().then(res => {
      this.searchList[4].goodsOptions = res.data
    })
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, item.defaultValue === undefined ? '' : item.defaultValue)
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
    stockStorageLogFn() {
      this.mixin_dialog_item.selectForm = 'storagechangelog'
      this.mixin_select_form_show = true
    },
    syncLemengByStoreId(item, isSure = false) {
      if (!this.searchForm.storeId) {
        return this.$message.info('请先选择门店!')
      }
      item.loading = true
      if (!isSure) {
        this.$confirm(`确认同步该门店库存吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.syncLemengByStoreId(item, true)
        }).catch(() => {
          item.loading = false
          this.$message.info('已取消操作')
        })
        return
      }
      syncLemengStockByStoreId({
        'id': this.searchForm.storeId
      }).then(res => {
        this.message(res)
      }).finally(() => {
        item.loading = false
      })
    },
    syncLenmengFn(item, isSure = false) {
      item.loading = true
      if (!isSure) {
        this.$confirm(`确认同步乐檬库存吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.syncLenmengFn(item, true)
        }).catch(() => {
          item.loading = false
          this.$message.info('已取消操作')
        })
        return
      }
      syncStock({
        'storeId': this.currentRow.storeId,
        'lemengGoodsCode': this.currentRow.itemNum,
        'goodsCode': this.currentRow.goodsCode
      }).then(res => {
        this.message(res)
      }).finally(() => {
        item.loading = false
      })
    },
    handleSelectionChange(rows) {
      this.mixin_rows = rows
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = this.searchFormShow ? 0 : 0 - this.otherOffsetHeight
    },
    transitionEnter(el, done) {
      this.transition = false
      this.transitionMarginTop = 0
      done()
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      // searchForm.ifStopSale = searchForm.ifStopSale ? 0 : null
      this.Mixin_loading = true
      getStockStoragePage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
            this.search({ prop: '' }, null, searchForm.pageNum - 1)
          } else {
            this.tableData = res.data
            this.Mixin_loading = false
          }
        }
      })
    },
    searchExport(item, isSure = false) {
      if (!this.searchForm.storeId) {
        return this.$message.info('请先选择门店')
      }
      this.search({ prop: '' }, null, this.searchForm.pageNum)
      item.loading = true
      if (!isSure) {
        this.$confirm(`确认导出库存文件吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.searchExport(item, true)
        }).catch(() => {
          item.loading = false
          this.$message.info('已取消操作')
        })
        return
      }
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      printStockStorage(searchForm).then(res => {
        if (!res.data.length) {
          return this.$message.info('导出失败:未查到商品数据')
        }
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['门店名称', '仓库', '商品代码', '商品名称', '规格', '库存数量', '库存单位', '成本单价', '金额', '最近收货日期', '乐檬商品编码']
          const filterVal = ['storeName', 'stockName', 'goodsCode', 'goodsName', 'spec', 'stockNum', 'weightType', 'costPrice', 'amount', 'lastReceiveDate', 'itemNum']
          const list = res.data
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '门店:' +
            this.MenuGetPropName('stores', searchForm.storeId, { value: 'id', label: 'name' }) +
            (searchForm.notStopSale ? '(非停售,' : '(') +
            (searchForm.stopSale ? '停售,' : '') +
            (searchForm.burden ? '负库存,' : '') +
            (searchForm.notBurden ? '非负库存,' : '') +
            (searchForm.zero ? '0库存,' : '') +
            (searchForm.notZero ? '非0库存)-' : ')-') +
            dayjs().format('YYYYMMDD'),
            autoWidth: true,
            bookType: 'xlsx'
          })
        })
      }).finally(() => {
        item.loading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'stockNum') {
          return this.DECIMAL.div(v[j], '1000').toNumber()
        } else if (j === 'weightType') {
          return this.MenuGetPropName('weight_type', v[j], { value: '', label: '' })
        } else if (['costPrice', 'amount'].includes(j)) {
          return this.fen2yuan(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>

<style scoped>
.transition{
  /*position: absolute;*/
  transition:all .3s ease;
  margin-top: 0;
  top: 0;
}
</style>
