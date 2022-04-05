<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      @search="search"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event]=''"
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
          search_form_height=$refs.searchForm.$el.offsetHeight
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter(table_data_arr,{show:true}))}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :size="$attrs.is_child?'mini':'medium'"
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :class="{'check-all-none':$attrs.single}"
      :data="tableData.records"
    >

      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter(table_data_arr,{show:true})"
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
import MixinGlobal from '@/components/MixinGlobal'
import { getCardExpensesLog } from '@/api/oms/card/getcardpage'
export default {
  name: 'CardExpensesLog',
  components: {},
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      searchList: [ // 搜索栏项目
        { title: '卡面号', prop: 'faceNo', type: 'text', width: '300px' },
        { title: '组织', prop: 'orgId', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '门店', prop: 'storeId', type: 'select', accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, width: '300px', fatherProp: 'orgId' },
        { title: '消费日期', prop: 'expDate', type: 'date', width: '300px' },
        { title: '系统类型', prop: 'systemType', width: 200, defaultAllValue: '1', defaultValue: '1', show: true, type: 'select', selectData: 'system_type', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['oms:cardExpensesRecord:getCardExpensesLog'], width: 80 }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '卡面号', width: 200, prop: 'faceNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '卡号', width: 200, prop: 'cardNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '消费时间', width: 180, prop: 'expensesTime', show: true, type: 'text', selectData: 'card_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '消费门店', width: 200, prop: 'storeName', show: true, type: 'text', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '消费金额', width: 150, prop: 'expensesAmount', show: true, type: 'PRICE', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '余额', width: 150, prop: 'balance', show: true, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '关联单号', width: 200, prop: 'orderNo', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' }
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
      }
    }
  },
  computed: {
    mixin_tab_max_height() {
      const tabmaxheight = this.windowH -
       (this.searchFormShow ? this.search_form_height : 0) -
       (this.$attrs.is_child ? 420 : 300)
      return tabmaxheight
    },
    idsLength() {
      return true
    }
  },
  watch: {
    '$attrs.select_window_name': {
      handler(n) {
        if (n === 'GetCardPageIndex' && this.$attrs.add_arr.length === 0) {
          console.log('选择窗口打开了')

          this.searchList.map((item, index) => {
            if (Object.keys(this.$attrs.child_search_data).includes(item.prop)) { // 存在搜索条件限制
              this.$set(this.searchList[index], 'disabled', true)
            }
          })
          const temp = this.deepClone(this.searchForm)
          this.searchForm = Object.assign(this.searchForm, this.$attrs.child_search_data)
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
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.search_form_height = this.$refs.searchForm.$el.offsetHeight
    })
  },
  methods: {
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      if (this.$attrs.is_child) {
        searchForm.ifReview = false
      }

      this.Mixin_loading = true
      getCardExpensesLog(searchForm).then(res => {
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
.check-all-none >>> .el-table__header .el-checkbox{
  display: none
}
</style>
