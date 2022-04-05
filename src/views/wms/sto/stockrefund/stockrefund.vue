<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      :readonly-from-page="mixin_select_form_show"
      :create_init.sync="create_init"
      @search="search({ prop: true })"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event]=''"
    />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :ids="ids"
      :rows="mixin_rows"
      :current-row="currentRow"
      :back="!$attrs.is_child"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--    表格 -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tableHidden:undefined}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {if(windowSelectable(row)){$refs.Tab.toggleRowSelection(row)}}"
      @selection-change="handleSelectionChange"
      @row-dblclick="(row)=>{
        if($attrs.is_child && windowSelectable(row)){
          $listeners.selectList([row])
          $listeners.addlist()
        }}"
    >
      <!--   可选  -->
      <el-table-column
        v-if="!!$attrs.is_child"
        type="selection"
        width="55"
        align="center"
        :selectable="windowSelectable"
        :fixed="!!tableData.records.length?'left':false"
      />
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true,tableHidden:undefined})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select' || item.type==='selectState'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <div v-else-if="item.type==='PRICE' || item.type==='PRICE_AUTOMATIC'">{{ fen2yuan(row[item.prop]) }}</div>
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
                  $listeners.currentSelect(currentRow);
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
        mixin_dialog_item.selectForm==='User' && '员工选择'"
      :visible.sync="mixin_select_form_show"
      :width="mixin_dialog_item.selectForm==='User' && '600px' || '80%'"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show=false"
        />
      </div>
      <div slot="footer" style="marginTop:-20px">
        <el-button type="primary" @click="mixin_select_form_show = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPage, deleteOrder, review } from '@/api/wms/stockrefund'
import SupplierIndex from '@/views/core/market/supplier/index'
import User from '@/views/ums/admin/userSelectPage'
export default {
  name: 'Order',
  components: { SupplierIndex, User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      create_init: false,
      selectFormShow: false,
      Comp: 'SupplierIndex',
      searchList: [ // 搜索栏项目
        { title: '退货单号', prop: 'storageRefundNo', type: 'text', width: '300px' },
        { title: '供应商', prop: 'supplierName', reallyProp: 'supplierId', type: 'selectFromPage', selectForm: 'SupplierIndex', width: '300px' },
        { title: '审核状态', prop: 'auditStatus', type: 'select', selectData: 'audit_status', width: '300px', defaultValue: 0 },
        { title: '退货门店', prop: 'refundStoreId', type: 'select', defaultValue: [0, 3, 2].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.storeId, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), selectData: 'stores', width: '300px', selectOption: { label: 'name', value: 'id' }},
        { title: '退货仓库', prop: 'refundStockId', type: 'select', defaultValue: 0, selectData: 'stockId', width: '300px', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'refundStoreId', fatherPropName: 'storeId' },
        { title: '退货日期', prop: 'refundDate', type: 'date', width: '300px' },
        { title: '制单人', prop: 'creatorName', reallyProp: 'creator', type: 'selectFromPage', selectForm: 'User', width: '300px' },
        { title: '审核人', prop: 'reviewer', reallyProp: 'reviewerId', type: 'selectFromPage', selectForm: 'User', width: '300px' }
      ],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['wms:stoRefundOrderDetails:getDetails'], width: 80 },
        { title: '修改', show: !this.$attrs.is_child, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRowNoRevEds', type: 'primary', permission: ['wms:stoRefundOrder:update'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: !this.$attrs.is_child, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['wms:stoRefundOrder:getList'], width: 80 },
        { title: '新增', show: !this.$attrs.is_child, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['wms:stoRefundOrder:add'], width: 80 },
        { title: '删除', show: !this.$attrs.is_child, prop: 'delete', click: this.dels, loading: false, icon: 'el-icon-minus', disabled: 'idsNoRevEds', type: 'primary', permission: ['wms:stoRefundOrder:delete'], width: 80 },
        // { title: '审核', show: true, prop: 'edit', click: this.$listeners.review, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRowNoRevEds', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        { title: '审核', show: !this.$attrs.is_child, prop: 'edit', click: this.reviews, loading: false, icon: 'el-icon-s-check', disabled: 'idsNoRevEds', type: 'primary', permission: ['wms:stoRefundOrder:update:review'], width: 80 }
        // { title: '复制', prop: 'copy', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
      ],
      ids: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
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
  watch: {
    '$attrs.detail_show': {
      handler(n) {
        if (this.$refs.Tab && !this.windowSelectable(this.currentRow) && n === false) { // 选取了禁用的项目
          this.$refs.Tab.clearSelection()
        }
      }
    },
    '$attrs.select_window_name': {
      handler(n) {
        if (n === 'StockRefundIndex' && this.$attrs.add_arr.length === 0) {
          console.log('选择窗口打开了')
          this.searchList.map((item, index) => {
            if (Object.keys(this.$attrs.child_search_data).includes(item.prop)) { // 存在搜索条件限制
              this.$set(this.searchList[index], 'disabled', true)
            }
          })
          this.$set(this.searchList[4], 'disabled', true) // 退货仓库隐藏
          const temp = this.deepClone(this.searchForm)
          this.searchForm = Object.assign(this.searchForm, this.$attrs.child_search_data)
          if (this.$refs.Tab) { // 缓存ref
            if (JSON.stringify(temp) !== JSON.stringify(this.searchForm) && this.create_init) { // 搜索条件改变 从新请求数据 第一次做，放在$refs判断里
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
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
    windowSelectable(row) {
      if (this.$attrs.is_child) {
        return !this.$attrs.table_goods_code_arr.includes(row.storageRefundNo)
      }
      return true
    },
    handleSelectionChange(rows) {
      if (this.$attrs.is_child) {
        this.$listeners.selectList(rows)
      }
      this.mixin_rows = rows
      this.ids = rows.map(item => item.id)
      if (this.$listeners.rowsList) {
        this.$listeners.rowsList(rows, this.ids)
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
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      if (this.Mixin_loading && operateItem.prop !== true) {
        return
      }
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      this.Mixin_loading = true
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
    dels(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`确认删除所选项目吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteOrder({ 'storageRefundNos': this.mixin_rows.map(item => item.storageRefundNo) }).then(res => {
          this.message(res)
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
    reviews(e, isSure = false) {
      e.loading = true
      if (!isSure) {
        this.$confirm(`确认审核吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.reviews(e, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          e.loading = false
        })
        return
      }
      // 批量审核
      review({ ids: this.ids, auditStatus: '3' }).then((res) => {
        this.message(res)
      }).finally(() => {
        e.loading = false
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
