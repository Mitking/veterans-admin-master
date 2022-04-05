<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="$attrs.is_child?searchListChild:searchList"
      v-bind="$attrs"
      @search="search({ prop: true })"
    />
    <!-- 操作栏目 -->
    <mix-operate
      v-if="!this.$attrs.is_child"
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :ids="ids"
      :current-row="currentRow"
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
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data-table'],{show:true}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      border
      highlight-current-row
      :size="$attrs.is_child?'mini':'medium'"
      :max-height="mixin_tab_max_height"
      :data="tableData.records"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      @row-click="(row) => {
        if(windowSelectable(row)){
          if($attrs.no_multiple){
            $refs.Tab.clearSelection()
          }
          $refs.Tab.toggleRowSelection(row)
        }}"
      @selection-change="handleSelectionChange"
      @row-dblclick="(row)=>{
        if($attrs.is_child && windowSelectable(row)){
          windowSelect([row])
          $listeners.addlist()
        }}"
    >
      <!--   可选  -->
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :selectable="windowSelectable"
        :fixed="!!tableData.records.length?'left':false"
      />
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data-table'],{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row,column}">
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="['storeIdList','select','selectState'].includes(item.type)">{{
            MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })
          }}</div>
          <div v-else-if="item.type==='weight_number'">{{
            g2kg(row[item.prop])
          }}</div>
          <div v-else-if="item.type==='PRICE'">{{
            fen2yuan(row[item.prop])
          }}</div>
          <div v-else-if="item.type==='selectObj'">{{
            MenuGetPropName(item.selectData,row['unitConversionRateRes']?row['unitConversionRateRes']['purWeightType']:'',item.selectOption?item.selectOption:{ value: '', label: '' })
          }}</div>

          <!-- v-else -->
          <div v-else>
            <el-tooltip
              v-if="row[item.prop] && row[item.prop].length>column.realWidth/(item.fontWidth || 18)"
              effect="dark"
              :content="row[item.prop]"
              placement="bottom"
            >
              <div>{{ row[item.prop] | sizeFilter(column.realWidth/(item.fontWidth || 18)) }}
                <i
                  v-if="item.copy"
                  v-clipboard:copy="mix_comp_row_product_data_deal(row,item)"
                  v-clipboard:success="mix_copy_text"
                  class="el-icon-copy-document"
                />
              </div>
            </el-tooltip>
            <div v-else>{{ row[item.prop] }}
              <i
                v-if="item.copy"
                v-clipboard:copy="mix_comp_row_product_data_deal(row,item)"
                v-clipboard:success="mix_copy_text"
                class="el-icon-copy-document"
              />
            </div>
          </div>
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
                  $listeners.currentSelect(currentRow)
                  item.click(item)
                }"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <!--    复制门店商品   -->
    <el-dialog
      title="门店商品复制"
      :visible.sync="copyFormShow"
    >
      <el-form style="display: flex;width: 100%;justify-content: space-around">
        <el-form-item label="被复制门店">
          <el-select v-model="copyForm.sourceStoreId" class="item-select-fa" placeholder="请选择">
            <el-option
              v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'})"
              :key="indexSon"
              :label="itemSon.name"
              :value="itemSon.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标门店">
          <el-select v-model="copyForm.targetStoreId" class="item-select-fa" placeholder="请选择">
            <el-option
              v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'})"
              :key="indexSon"
              :label="itemSon.name"
              :value="itemSon.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading" @click="copyFormShow = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="productCopySubmit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="pricePullShow" width="30%">
      <template slot="title">
        <div>提示:<span style="font-size: 0.8rem;color:#ff0000">商品档案数据将会覆盖被拉取项目相关价格数据</span></div>
      </template>
      <el-form style="display: flex;width: 100%;">
        <el-form-item label-width="100px" label="门店">
          <el-select v-model="pullStoreId" class="item-select-fa" placeholder="请选择">
            <el-option
              v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'})"
              :key="indexSon"
              :label="itemSon.name"
              :value="itemSon.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading" @click="pricePullShow = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="pricePullSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="pricePullIdsShow"
    >
      <template slot="title">
        <div>提示:<span style="font-size: 0.8rem;color:#ff0000">门店相关价格数据将会被覆盖更新</span></div>
      </template>
      <el-table :data="rows" style="width: 70%;margin-left: 15%;" max-height="500">
        <el-table-column
          prop="storeId"
          label="门店"
          width="180"
          sortable
        >
          <template slot-scope="{row}">
            <div>{{ MenuGetPropName('stores',row.storeId,{ value: 'id', name: '' }) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="goodsCode"
          label="商品Code"
          width="120"
        />
        <el-table-column
          prop="goodsName"
          label="商品名称"
          sortable
          width="240"
        />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="loading" @click="pricePullIdsShow = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="pricePullIdsSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPage, deleteOrder, copyStoreProduct, storeProductPricePull, syncStock } from '@/api/core/storeproduct'
import { getDetails as getwhssettlement } from '@/api/tob/whssale'
import { getDetails as getshipment } from '@/api/tob/agencyshipment'
import { updateStoreProduct } from '@/api/core/storeproduct'
import { getCategoryTree } from '@/api/core/goodscategory'
export default {
  name: 'Order',
  components: {},
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      searchList: [ // 搜索栏项目
        { title: '关键字', prop: 'keyWord', type: 'text', placeholder: '商品名称/代码/速记码/条码' },
        { title: '组织', prop: 'orgId', disabled: false, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '门店', prop: 'storeId', disabled: false, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), type: 'select', defaultValue: this.$store.getters.storeId, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, width: '300px', fatherProp: 'orgId',
          defaultName: '全部', defaultAllValue: this.$store.getters.storeId },
        { title: '仓库', prop: 'stockId', disabled: false, type: 'select', defaultValue: 0, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', width: '300px' },
        { title: '分类', prop: 'goodsCategoryId', type: 'goodsCategory', width: '300px', valueProp: 'id', goodsOptions: [] }
      ],
      searchListChild: [ // 搜索栏项目
        { title: '关键字', prop: 'keyWord', type: 'text', placeholder: '商品名称/代码/速记码/条码' },
        { title: '只看关联品', prop: 'only_relevan', disabled: this.only_relevan_disab_comp, type: 'checkbox', width: '120px' }
      ],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['core:productArchive:getDetail'], width: 80 },
        { title: '同步乐檬库存', show: !this.$attrs.is_child, loading: false, prop: 'syncLenmeng', click: this.syncLenmengFn, icon: 'el-icon-monitor', disabled: 'isRow', disabledFn: (row) => !row.itemNum, type: 'primary', permission: ['api:lemeng:syncStock'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:storeProduct:getList:mobile'], width: 80 },
        { title: '新增', show: !this.$attrs.is_child, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:storeProduct:add'], width: 80 },
        { title: '停售', show: !this.$attrs.is_child, prop: 'disabled', click: this.enableFn, loading: false, disabledFn: () => this.rows.some(item => item.stopSale), icon: 'el-icon-circle-close', disabled: 'ids', type: 'primary', permission: ['core:storeProduct:update'], width: 80 },
        { title: '启售', show: !this.$attrs.is_child, prop: 'sale', click: this.saleFn, loading: false, disabledFn: () => this.rows.some(item => !item.stopSale), icon: 'el-icon-shopping-bag-2', disabled: 'ids', type: 'primary', permission: ['core:storeProduct:update'], width: 80 }
      ],
      ids: [],
      rows: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 24, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        ifTotalStock: false,
        only_relevan: !this.only_relevan_disab_comp, // 显示关联单的品默认给true
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      details: [], // 详细数据
      copyFormShow: false,
      copyForm: { sourceStoreId: '', targetStoreId: '' },
      loading: false,
      pricePullIdsShow: false,
      pullForm: {},
      pricePullShow: false,
      pullStoreId: ''
    }
  },
  computed: {
    only_relevan_disab_comp() { // 判断是否显示关联单，true不显示
      if (this.$attrs.is_child && this.$attrs.child_search_data) {
        return (this.$attrs.child_search_data.whsOrderId === undefined && this.$attrs.child_search_data.shipmentId === undefined)
      }
      return true
    }
  },
  watch: {
    'searchForm.only_relevan': {
      handler() {
        if (!this.Mixin_loading) {
          this.search()
        }
      },
      immediate: true
    },
    '$attrs.detail_show': {
      handler(n) {
        if (this.$refs.Tab && !this.windowSelectable(this.currentRow) && n === false) { // 选取了禁用的项目
          this.$refs.Tab.clearSelection()
        }
      }
    },
    '$attrs.select_window_name': {
      handler(n) {
        if (n === 'StoreProductIndex' && this.$attrs.add_arr.length === 0) {
          console.log('选择窗口打开了')
          this.$set(this.searchListChild[1], 'disabled', this.only_relevan_disab_comp)
          if (Object.keys(this.$attrs.child_search_data).includes('ifTotalStock')) { // 存在总仓选品情况
            this.mixin_arr_edit_by_prop(this.searchList, 'storeId', 'disabled', true)
          }
          this.searchListChild.map((item, index) => {
            if (Object.keys(this.$attrs.child_search_data).includes(item.prop)) { // 存在搜索条件限制
              this.$set(this.searchListChild[index], 'disabled', true)
            }
          })
          const temp = this.deepClone(this.searchForm)
          this.searchForm = Object.assign(this.searchForm, this.$attrs.child_search_data)
          this.searchForm.nonInventory = false
          if (this.$refs.Tab) { // 缓存ref
            if (JSON.stringify(temp) !== JSON.stringify(this.searchForm)) { // 搜索条件改变 从新请求数据 第一次做，放在$refs判断里
              console.log('改变了搜索数据')
              this.searchForm.pageNum = 1
              this.search()
            }
            this.$refs.Tab.clearSelection()
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    console.log('重新加载')
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    getCategoryTree().then(res => {
      this.searchList[4].goodsOptions = res.data
    })
    this.searchList.map(item => {
      if (item.type === 'range') {
        item.range.map(itemRange => {
          this.$set(this.searchForm, itemRange.prop, itemRange.defaultValue === 0 ? 0 : '')
        })
      } else {
        this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
      }
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search()
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    windowSelect(e) {
      if (this.$attrs.is_child) {
        this.$listeners.selectList(e)
      }
    },
    windowSelectable(row) {
      // if (this.$attrs.is_child) {
      //   return !this.$attrs.table_goods_code_arr.includes(row.goodsCode)
      // }
      return true
    },
    enableFn(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将禁售已选商品, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('禁售')
        updateStoreProduct({ ids: this.ids, stopSale: true, storeIds: [] }).then(res => {
          this.messageFn(res)
          operateItem.loading = false
        }).catch(err => {
          operateItem.loading = false
          throw err
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
        operateItem.loading = false
      })
    },

    saleFn(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将启售已选商品, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('启售')
        updateStoreProduct({ ids: this.ids, stopSale: false, storeIds: [] }).then(res => {
          this.messageFn(res)
          operateItem.loading = false
        }).catch(err => {
          operateItem.loading = false
          throw err
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
        operateItem.loading = false
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
        'storeId': this.searchForm.storeId,
        'lemengGoodsCode': this.currentRow.itemNum,
        'goodsCode': this.currentRow.goodsCode
      }).then(res => {
        this.message(res)
      }).finally(() => {
        item.loading = false
      })
    },
    handleSelectionChange(rows) {
      if (this.$attrs.is_child) {
        this.$listeners.selectList(rows)
      }
      this.rows = rows
      this.ids = rows.map(item => item.id)
      this.$listeners.rowsList(rows, this.ids)
    },
    messageFn(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.pullStoreId = ''
        this.copyFormShow = false
        this.pricePullIdsShow = false
        this.pricePullShow = false
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
      this.loading = false
    },
    productCopy() {
      this.copyFormShow = true
    },
    productCopySubmit() {
      if (this.copyForm.sourceStoreId === '' || this.copyForm.targetStoreId === '') {
        this.$message.error('请选择门店')
        return
      }
      if (this.copyForm.sourceStoreId === this.copyForm.targetStoreId) {
        this.$message.error('门店不能相同')
        return
      }
      this.loading = true
      copyStoreProduct(this.copyForm).then(res => {
        this.messageFn(res)
        if (res.code === 200) {
          this.copyFormShow = false
          this.loading = false
          this.copyForm = { sourceStoreId: '', targetStoreId: '' }
        }
      })
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      let searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      if (searchForm.storeId === null) {
        this.searchForm.orgId = 0
      }
      if (this.$attrs.child_search_data) {
        searchForm = Object.assign(searchForm, this.$attrs.child_search_data)
        searchForm.nonInventory = false // 选品时只选库存品
        searchForm.goodsType = '1' // 选品时只能选标准品
      }

      this.Mixin_loading = true
      if (this.$attrs.child_search_data && searchForm.only_relevan) {
        if (searchForm.whsOrderId) { // 批发单
          this.$listeners.changeTableArr(true)
          getwhssettlement({ 'id': searchForm.whsOrderId }).then(res => {
            this.currentRow = { id: '' }
            this.tableData.records = res.data.details.filter(f => !searchForm.goodsName || f.goodsName.indexOf(searchForm.goodsName) !== -1).map(item => ({
              goodsCode: item.goodsCode,
              goodsName: item.goodsName,
              spec: item.spec,
              price: item.whsPrice,
              num: item.whsNumber,
              count: item.whsCnt,
              storeId: searchForm.storeId,
              weightType: item.unitId,
              whetherCount: item.whetherCount,
              goodsArchiveId: item.productId,
              img: item.img,
              id: true,
              by_order: true
            }))
            this.Mixin_loading = false
          })
          return
        } else if (searchForm.shipmentId) {
          this.$listeners.changeTableArr(true)
          getshipment({ 'id': searchForm.shipmentId }).then(res => {
            this.currentRow = { id: '' }
            this.tableData.records = res.data.detailsRes.filter(f => !searchForm.goodsName || f.goodsName.indexOf(searchForm.goodsName) !== -1).map(item => ({
              goodsCode: item.goodsCode,
              goodsName: item.goodsName,
              spec: item.spec,
              price: item.consignmentPrice,
              num: item.consignmentQuantity,
              count: item.consignmentNumber,
              storeId: searchForm.storeId,
              weightType: item.weightType,
              whetherCount: !!item.whetherCount,
              goodsArchiveId: item.productId,
              img: item.img || '',
              id: true,
              by_order: true
            }))
            this.Mixin_loading = false
          })
          return
        }
      } else if (this.$attrs.child_search_data && !searchForm.only_relevan) {
        this.$listeners.changeTableArr(false)
      }
      getPage(searchForm).then(res => {
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
    del(operateItem = {}) {
      operateItem.loading = true
      if (operateItem.prop === 'delete') {
        this.rows = [this.currentRow]
      }
      this.$confirm(`此操作将永久删除门店商品「${this.rows.map(item => item.goodsName)}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteOrder({ ids: operateItem.prop === 'delete' ? [this.currentRow.id] : this.rows.map(item => item.id) }).then(res => {
          this.messageFn(res)
          operateItem.loading = false
        }).catch(err => {
          operateItem.loading = false
          throw err
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        operateItem.loading = false
      })
    },
    pricePull() { // 拉取价格
      this.pricePullShow = true
    },
    pricePullIds() { // 拉取选中商品价格弹窗
      this.pricePullIdsShow = true
    },
    pricePullIdsSubmit() { // 拉取选中商品价格
      this.loading = true
      const summary_temp = this.groupByProp(this.rows, 'storeId')
      Promise.all(summary_temp.map(item => {
        const temp = {}
        temp.selectAll = false
        temp.list = item.children.map(itemSon => ({ goodsCode: itemSon.goodsCode, id: itemSon.id }))
        temp.storeId = item.storeId
        return storeProductPricePull(temp).catch(err => err)
      })).then(res => {
        if (res.map(item => item.code === 200).every(item => item)) {
          this.messageFn(res[0])
        }
      }).catch(() => {
        this.loading = false
        this.$message.error('拉取失败请重新操作')
      })
    },
    pricePullSubmit() { // 拉取门店商品价格
      this.loading = true
      storeProductPricePull({ storeId: this.pullStoreId, selectAll: true }).then(res => {
        this.messageFn(res)
      }).catch(() => {
        this.loading = false
        this.$message.error('拉取失败请重新操作')
      })
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = this.searchFormShow ? 0 : 0 - this.otherOffsetHeight
    },
    transitionEnter(el, done) {
      this.transition = false
      this.transitionMarginTop = 0
      done()
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
