<template>
  <div>
    <!-- 操作栏目 -->
    <mix-operate
      style="marginTop:30px"
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
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      :style="{width:minxin_width_total(ArrFilter(table_data_arr,{show:true}),{op:true,opWidth:55})}"
      :size="$attrs.is_child?'mini':'medium'"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {if(windowSelectable(row)){$refs.Tab.toggleRowSelection(row)}}"
      @selection-change="handleSelectionChange"
      @row-dblclick="(row)=>{
        if(windowSelectable(row)){
          $listeners.selectList([row])
          $listeners.addlist()}
      }"
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
          <div v-if="item.type==='PRICE' || item.type==='PRICE_AUTOMATIC'">{{ fen2yuan(row[item.prop]) }}</div>
          <!--          v-else-->
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <!-- <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" /> -->
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getListForInvoicing } from '@/api/oms/fin/franchiseesettle'
export default {
  name: 'InvioceSelectIndex',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      searchList: [],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['oms:finFranchiseeSettle:getList'], width: 80 }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '结算单号', prop: 'franchiseeSettleNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '结算金额', prop: 'settleAmount', width: 100, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '已开票金额', prop: 'invoicedAmount', width: 100, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '未开票金额', prop: 'uninvoicedAmount', width: 100, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],
      ids: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        settleOrgId: ''
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      details: [] // 详细数据
    }
  },
  computed: {},
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
        if (n === 'InvioceSelectIndex' && this.$attrs.add_arr.length === 0) {
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
    console.log('重新加载123')
    this.search_form_height = 30
    this.search()
  },
  methods: {
    windowSelect(e) {
      if (this.$attrs.is_child) {
        this.$listeners.selectList(e)
      }
    },
    windowSelectable(row) {
      if (this.$attrs.is_child) {
        return !this.$attrs.table_goods_code_arr.includes(row.franchiseeSettleNo)
      }
      return true
    },
    handleSelectionChange(rows) {
      if (this.$attrs.is_child) {
        this.$listeners.selectList(rows)
      }
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
    search() { // 操作
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.Mixin_loading = true
      getListForInvoicing(searchForm).then(res => {
        this.tableData.records = res.data
        this.Mixin_loading = false
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
