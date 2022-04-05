<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      :form-data="table_data_arr"
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
          search_form_height=$refs.searchForm.$el.offsetHeight
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="tb"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter(table_data_arr,{show:true}),{op:true,opWidth:55})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :class="{'check-all-none':$attrs.single}"
      :data="tableData.records"
      @selection-change="handleSelectionChange"
    >
      <!--   可选  -->
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :selectable="selectable"
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
          <div v-if="item.type==='PRICE'">{{ fen2yuan(row[item.prop]) }}</div>
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
  </div>
</template>
<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPage } from '@/api/oms/card/cardreplace'
export default {
  name: 'CardReplace',
  components: {},
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'orgId', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '门店', prop: 'storeId', type: 'select', accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, width: '300px', fatherProp: 'orgId' },
        { title: '原卡面号', prop: 'originalFaceNo', type: 'text', width: '300px' }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['oms:cardFlowing:getList'], width: 80 }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '原卡面号', prop: 'originalFaceNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '原卡号', prop: 'originalCardNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '目标卡面号', prop: 'targetFaceNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '替换金额', prop: 'replaceAmount', width: 100, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '操作人', prop: 'creatorName', width: 120, show: true, type: 'text', detailShow: true, addFatherProp: 'Req' },
        { title: '替换时间', prop: 'createTime', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' }
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
  watch: {},
  created() {
    console.log('重新加载卡管理页')
    this.searchList.map(item => {
      if (this.$attrs.search_lock && Object.keys(this.$attrs.search_lock).includes(item.prop)) { // 固定检索条件
        this.$set(item, 'lockValue', this.$attrs.search_lock[item.prop])
      }
      this.$set(this.searchForm, item.prop, item.defaultValue === undefined ? '' : item.defaultValue)
    })
    if (this.$attrs.search_lock) {
      this.searchForm = Object.assign(this.searchForm, this.$attrs.search_lock)
    }
    this.$nextTick(() => {
      this.search_form_height = this.$refs.searchForm.$el.offsetHeight
    })
  },
  methods: {
    selectable(row) {
      if (this.$attrs.selectlist) {
        return !this.$attrs.selectlist.includes(row.cardNo)
      } else {
        return true
      }
    },
    handleSelectionChange(rows) {
      // if (rows.length === 1) {
      //   this.currentRow = rows[0]
      //   this.$listeners.currentSelect(rows[0])
      // } else {
      //   this.currentRow = { id: '' }
      //   this.$listeners.currentSelect({ id: '' })
      // }
      this.ids = rows.map(item => item.id)
      if (this.$attrs.child) {
        if (this.$attrs.single) { // 单选
          if (rows.length > 1) {
            this.$refs.Tab.clearSelection()
            this.$refs.Tab.toggleRowSelection(rows.pop())
          }
        }
        this.$listeners.selectedRows({ data: rows, type: 'list' })
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
    // del(operateItem = {}) {
    //   operateItem.loading = true
    //   this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('finChargeNo', this.table_data_arr)}「${this.currentRow.finChargeNo}」, 是否继续?`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     // this.operateItem.loading = true
    //     deleteOrder({ 'finChargeNo': this.currentRow.finChargeNo }).then(res => {
    //       this.message(res)
    //       operateItem.loading = false
    //     }).catch(err => {
    //       operateItem.loading = false
    //       throw err
    //     })
    //   }).catch(() => {
    //     this.$message({
    //       type: 'info',
    //       message: '已取消删除'
    //     })
    //     operateItem.loading = false
    //   })
    // },
    // reviews(e) { // 批量审核
    //
    //   editOrder({ 'ids': this.ids, 'state': e.state }).then(res => {
    //     this.message(res)
    //   })
    // },
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
