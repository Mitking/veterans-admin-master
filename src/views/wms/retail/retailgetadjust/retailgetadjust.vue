<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      :form-data="dataList"
      v-bind="$attrs"
      @search="search({ prop: true })"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event]=''"
    />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :back="true"
      :ids="ids"
      :current-row="currentRow"
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
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :style="{width:minxin_width_total(ArrFilter(dataList,{show:true}),{op:false})}"
      :data="tableData.records"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-for="(item,index) in ArrFilter(dataList,{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '200'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row,column}">
          <el-tooltip
            v-if="mix_comp_row_product_data_deal(row,item).length>column.realWidth/(item.fontWidth || 18)"
            effect="dark"
            :content="mix_comp_row_product_data_deal(row,item)"
            placement="bottom"
          >
            <div>{{ mix_comp_row_product_data_deal(row,item) | sizeFilter(column.realWidth/(item.fontWidth || 18)) }}</div>
          </el-tooltip>
          <div v-else>
            <!--            {{ item.prop['unitConversionRateRes']['basicWeightType'] }}-->
            {{ mix_comp_row_product_data_deal(row,item) }}
          </div>
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
      :width="mixin_dialog_item.selectForm==='User' && '600px' || '80%'"
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
      <div slot="footer" style="marginTop:-20px">
        <el-button type="primary" @click="mixin_select_form_show = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import User from '@/views/ums/admin/userSelectPage'
import MixinGlobal from '@/components/MixinGlobal'
import { getPage } from '@/api/wms/retailgetadjust'
import ProductIndex from '@/views/core/product/product/index'
export default {
  name: 'Order',
  components: { ProductIndex, User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      Comp: 'ProductIndex',
      selectFormShow: false,
      currentRow: { id: '' },
      ids: [],
      editShow: false,
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'orgId', type: 'select', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '门店', prop: 'updateStoreId', type: 'select', accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: [0, 3, 2].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.storeId, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId', width: '300px' },
        { title: '商品分类', prop: 'categoryId', type: 'goodsCategory', valueProp: 'id', width: '300px', dataArr: {}},
        { title: '商品档案', prop: 'goodsName', reallyProp: 'goodsCode', click: 'addItems', selectForm: 'ProductIndex', type: 'selectFromPage', width: '300px' },
        { title: '修改价格类型', prop: 'updateType', defaultValue: 0, type: 'select', selectData: 'price_type', width: '300px' },
        { title: '开始日期', prop: 'startDate', type: 'datetime', defaultTime: '00:00:00', width: '300px' },
        { title: '结束日期', prop: 'endDate', type: 'datetime', defaultTime: '23:59:59', width: '300px' },
        { title: '修改方式', prop: 'updateMethod', defaultValue: 0, type: 'select', selectData: 'store_price_method', width: '300px' },
        { title: '修改人', prop: 'reviewer', reallyProp: 'modifier', type: 'selectFromPage', selectForm: 'User', width: '300px' }
        // { title: '门店ID', prop: 'storeId', type: 'select', selectData: 'stores', width: '300px' },
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'edit', click: this.search, loading: false, icon: 'el-icon-edit-outline', disabled: false, type: 'primary', permission: ['retail:adjust:price:log:getList'], width: 80 }
        // { title: '导出', show: true, prop: 'delete', click: this.output, loading: false, icon: 'el-icon-minus', disabled: 'ids', type: 'primary', permission: ['ums:role:page'], width: 80 }
        // { title: '审核', show: true, prop: 'edit', click: this.$listeners.review, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        // { title: '审核', prop: 'edit', click: this.reviews, loading: false, icon: 'el-icon-edit-outline', disabled: 'ids', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 }
        // { title: '复制', prop: 'copy', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
      ],
      dataList: [
        { title: '调整单号', prop: 'relationNo', fontWidth: 8, show: true, type: 'text', width: 220, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '商品名称', prop: 'productName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '门店名', width: 200, prop: 'storeName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '调价类型', width: 150, prop: 'updateTypeDesc', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '调价描述', width: 200, prop: 'updateMethodDesc', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '调整时间', width: 180, prop: 'updateTime', fontWidth: 8, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],

      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: [],
      details: [], // 详细数据
      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0
    }
  },
  computed: {
    idsLength() {
      return true
    },
    selectComputed() { // select选项集
      return function(propitem) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = 0
          }
          return temp
        }
        return this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
      }
    },
    minxin_width_total() { // 表格总宽度计算
      return function(arr, widthArg = null) {
        return arr.map(item => ((widthArg && item[widthArg.widthProp]) ? item[widthArg.widthProp] : item.width) || 200)
          .reduce((curr, prev) => (curr + prev), 1 + (widthArg && widthArg.op ? widthArg.opWidth : 0)) + 'px'
      }
    }
  },
  watch: {},
  created() {
    // this.selectDataLoad(['stores'])
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, (item.defaultValue !== undefined ? item.defaultValue : ''))
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
    // this.getDate()
  },
  methods: {
    handleSelectionChange(rows) {
      // if (rows.length === 1) {
      //   this.currentRow = rows[0]
      //   this.$listeners.currentSelect(rows[0])
      // } else {
      //   this.currentRow = { id: '' }
      //   this.$listeners.currentSelect({ id: '' })
      // }
      this.ids = rows.map(item => item.id)
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    getDate() {
      getPage().then(res => {
        if (res.code === 200) {
          this.tableData = res.data
          this.editShow = false
          this.Mixin_loading = false
        }
      })
    },
    // save() {
    //   updateOrSave(this.tableData).then(res => {
    //     if (res.code === 200) {
    //       this.getDate()
    //     }
    //   }).catch(() => {
    //     this.editShow = false
    //   })
    // },
    edit() {
      console.log('edit')
      this.editShow = true
    },
    output() {
      console.log('output')
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      if (searchForm.goodsName !== undefined) {
        delete searchForm.goodsName
      }

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
    //   this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('stoInvPlanNo', this.$attrs['form-data'])}「${this.currentRow.stoInvPlanNo}」, 是否继续?`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     // this.operateItem.loading = true
    //     deleteOrder({ 'stoInvPlanNo': this.currentRow.stoInvPlanNo }).then(res => {
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
    // reviews() { // 批量审核
    //   review({ 'ids': this.ids, 'auditStatus': '3' }).then(res => {
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
</style>
