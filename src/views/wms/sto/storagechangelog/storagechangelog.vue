<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <!-- <transition
      name="el-zoom-in-top"
      @before-leave="(e)=>{transition=false;transitionBegin(e)}"
      @after-leave="transition=true;transitionMarginTop=24"
      @before-enter="(e)=>{transitionBegin(e)}"
      @enter="transitionEnter"
    > -->
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      :readonly-from-page="mixin_select_form_show"
      v-bind="$attrs"
      :is_child="true"
      @search="search"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event]=''"
    />
    <!-- </transition> -->
    <!-- 操作栏目 -->
    <!-- <mix-operate
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
    /> -->
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
      <!--   可选  -->
      <!-- <el-table-column
        type="selection"
        width="55"
        align="center"
        :fixed="!!tableData.records.length?'left':false"
      /> -->
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
          <div v-if="item.type==='select'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption || { value: '', label: '' }) }}</div>
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
        mixin_dialog_item.selectForm==='User' && '员工选择'"
      :visible.sync="mixin_select_form_show"
      :append-to-body="true"
      width="80%"
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
import MixinGlobal from '@/components/MixinGlobal'
import { getStockStorageChangeLog } from '@/api/wms/storagechangelog'
import ProductIndex from '@/views/core/product/product/index'
// import { getCategoryTree } from '@/api/core/goodscategory'
import User from '@/views/ums/admin/userSelectPage'
import dayjs from 'dayjs'
export default {
  name: 'Order',
  components: { ProductIndex, User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const disabledDateFn = (date) => {
      return (dayjs() < date) || (dayjs().subtract(30, 'day') > date)
    }
    return {
      Comp: 'ProductIndex',
      selectFormShow: false,
      operateTableList: [],
      searchList: [ // 搜索栏项目
        // { title: '组织', prop: 'orgId', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        // { title: '门店', prop: 'storeId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), type: 'select', selectData: 'stores', width: '300px', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId' },
        // { title: '仓库', prop: 'stockId', defaultValue: 0, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId' },
        // { title: '商品', prop: 'goodsName', reallyProp: 'goodsCode', click: 'addItems', selectForm: 'ProductIndex', type: 'selectFromPage', width: '300px' },
        // { title: '商品', prop: 'goodsName', type: 'text', width: '300px' },
        { title: '调整方式', prop: 'stockChangeType', defaultValue: 0, width: '240px', type: 'select', selectData: 'stock_change_type' },
        { title: '操作人', prop: 'creatorName', reallyProp: 'creator', type: 'selectFromPage', selectForm: 'User', width: '200px' },
        { title: '开始时间', prop: 'beginTime', defaultValue: dayjs().subtract(30, 'day').format('YYYY-MM-DD 00:00:00'), pickerOptions: { disabledDate: disabledDateFn }, type: 'datetime', width: '280px' },
        { title: '结束时间', prop: 'endTime', defaultValue: dayjs().format('YYYY-MM-DD 23:59:59'), pickerOptions: { disabledDate: disabledDateFn }, type: 'datetime', defaultTime: '23:59:59', width: '280px' }
      ],
      // operateList: [ // 操作栏项目
      //   { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['core:stockStorage:getList'], width: 80 }
      // // { title: '导出', show: true, prop: 'export', click: this.search, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['core:stockStorage:getList'], width: 80 }
      // ],

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        storeId: 0,
        stockId: 0,
        goodsCode: 0,
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
    '$attrs.log_search_data': {
      handler() {
        this.search()
      },
      immediate: true
    }
  },
  created() {
    console.log('重新加载')
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    // getCategoryTree().then(res => {
    //   this.searchList[4].goodsOptions = res.data
    // })
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, item.defaultValue === undefined ? '' : item.defaultValue)
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
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
      Object.keys(searchForm).forEach(item => { searchForm[item] = this.$attrs.log_search_data[item] || searchForm[item] || null })

      this.Mixin_loading = true
      getStockStorageChangeLog(searchForm).then(res => {
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
