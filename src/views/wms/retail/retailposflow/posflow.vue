<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event]=''"
      @search="search"
    />
    <!-- 操作栏目 -->
    <mix-operate
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
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%;width:1401px"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row)=>{currentRow = row}"
    >
      <!--   v-if="item.show" 表头  -->
      <el-table-column prop="orderNo" label="单据号" align="center" width="180" />
      <el-table-column prop="orgId" label="组织" align="center" width="200">
        <template slot-scope="{row}">
          {{ MenuGetPropName('organizes',row.orgId,{ value: 'id', label: 'orgShortName' }) }}
        </template>
      </el-table-column>
      <el-table-column prop="storeId" label="门店" align="center" width="200">
        <template slot-scope="{row}">
          {{ MenuGetPropName('stores',row.storeId,{ value: 'id', label: 'name' }) }}
        </template>
      </el-table-column>
      <el-table-column prop="dealAmount" label="交易金额" align="center" width="120">
        <template slot-scope="{row}">
          {{ fen2yuan(row.dealAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="dealOrderType" label="订单类型" align="center" width="120">
        <template slot-scope="{row}">
          {{ MenuGetPropName('deal_order_type',row.dealOrderType) }}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="订单状态" align="center" width="100">
        <template slot-scope="{row}">
          {{ MenuGetPropName('pos_order_state',row.state) }}
        </template>
      </el-table-column>
      <el-table-column prop="mobile" label="会员手机号" align="center" width="120" />
      <el-table-column prop="dealTime" label="交易时间" align="center" width="150" />
      <el-table-column prop="creatorName" label="收银员" align="center" width="150" />
      <!-- 操作单条 -->
      <el-table-column
        :width="60"
        align="center"
        :fixed="!!tableData.records.length?'right':false"
        label="操作"
        class="my-op-fa"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            effect="light"
            content="详情"
            placement="top"
            :hide-after="1000"
            :enterable="false"
            :disabled="$store.state.app.tooltipDisabled"
          >
            <el-button
              v-permission="['oms:posOrder:getPosFlowDetail']"
              class="my-op-class"
              type="text"
              size="mini"
              :loading="$attrs.btnloading"
              icon="el-icon-document"
              @click.stop="
                if(!$attrs.btnloading){
                  currentRow=row;
                  $listeners.currentSelect(currentRow)
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
        mixin_dialog_item.selectForm==='User' && '员工选择'"
      :visible.sync="mixin_select_form_show"
      :width="mixin_dialog_item.selectForm==='User' && '50%' || '80%'"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show=false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
// length
import MixinGlobal from '@/components/MixinGlobal'
import ProductIndex from '@/views/core/product/product/index.vue'
import { getPosFlowPage } from '@/api/wms/posflow'
export default {
  name: 'Order',
  components: { ProductIndex },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      searchList: [ // 搜索栏项目
        { title: '单据号', prop: 'orderNo', type: 'text', width: '300px' },
        { title: '组织', prop: 'orgId', disabled: false, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '门店', prop: 'storeId', accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId', width: '300px' },
        // { title: '商品', prop: 'goodsCode', type: 'text', width: '300px' },
        { title: '商品', prop: 'goodsName', reallyProp: 'goodsCode', click: 'addItems', selectForm: 'ProductIndex', type: 'selectFromPage', width: '300px' },
        { title: '商品单价区间', type: 'range', range: [
          { prop: 'beginPrice', type: 'PRICE', placeholder: '起始价', float: { max: 9999, decimal: 2 }},
          { prop: 'endPrice', type: 'PRICE', placeholder: '终止价', float: { max: 999999, decimal: 2 }}
        ] },
        { title: '会员手机号', prop: 'mobile', type: 'text', width: '300px' },
        { title: '开始时间', prop: 'beginTime', type: 'datetime' },
        { title: '结束时间', prop: 'endTime', type: 'datetime', defaultTime: '23:59:59' },
        { title: '订单类型', prop: 'dealOrderType', type: 'select', selectData: 'deal_order_type', defaultValue: 0 },
        { title: '订单状态', prop: 'state', type: 'select', selectData: 'pos_order_state', defaultValue: 0 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['retail:getRetailPrice'], width: 80 }
      ],
      ids: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        orgId: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId,
        storeId: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0,
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
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
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

      searchForm.beginPrice = searchForm.beginPrice ? this.yuan2fen(searchForm.beginPrice) : null
      searchForm.endPrice = searchForm.endPrice ? this.yuan2fen(searchForm.endPrice) : null

      this.Mixin_loading = true
      getPosFlowPage(searchForm).then(res => {
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
