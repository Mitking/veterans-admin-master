<template>
  <div>
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="$attrs.is_child?searchListChild:searchList"
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
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {
        if ($attrs.is_child && $attrs.no_multiple) { // 单选客户
          currentRow = row
          $listeners.selectList([row])
        }else if($attrs.no_multiple===false && windowSelectable(row)){
          $refs.Tab.toggleRowSelection(row)
        }else if(windowSelectable(row)){
          $refs.Tab.toggleRowSelection(row)
        }
      }"
      @row-dblclick="(row)=>{
        if($attrs.is_child && windowSelectable(row)){
          $listeners.selectList([row])
          $listeners.addlist()
        }}"
      @selection-change="handleSelectionChange"
    >
      <!--   可选  -->
      <el-table-column
        v-if="!$attrs.no_multiple"
        type="selection"
        width="55"
        align="center"
        :fixed="!!tableData.records.length?'left':false"
        :selectable="windowSelectable"
      />
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
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select' || item.type==='selectState'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <div v-else-if="item.type==='PRICE_AUTOMATIC' || item.type==='PRICE' || item.type==='PRICE_AUTOMATIC_SWITCH'">{{ fen2yuan(row[item.prop]) }}</div>
          <div v-else-if="item.type==='selectFromPage'">{{ row[item.propFromPageName] }}</div>
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
      :title="mixin_dialog_item.selectForm==='Customer' && '客户列表' ||
        mixin_dialog_item.selectForm==='ProductIndex' && '商品列表' ||
        mixin_dialog_item.selectForm==='User' && '员工选择' || '暂无'"
      :visible.sync="mixin_select_form_show"
      :width="mixin_dialog_item.selectForm==='User' && '600px' || '1050px'"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          :child_search_data="mixin_select_pro_form_data"
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
import { getPage, deleteOrders, orderReviewer } from '@/api/tob/whssale'
import { generate } from '@/api/wms/purtask'
import Customer from '@/views/core/Customer/Customer'
import User from '@/views/ums/admin/userSelectPage'
export default {
  name: 'Order',
  components: { Customer, User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      ruleForm: {
        selectData: ''
      },
      dialogVisible: false,
      rules: {
        selectData: [{ required: true, message: '请输入日期', trigger: 'blur' }]
      },
      searchList: [
        { title: '批发单号', prop: 'whsOrderNo', type: 'text', width: '300px' },
        { title: '销售日期', prop: 'saleDate', type: 'date' },
        { title: '组织', prop: 'whsOrgId', width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '销售门店', prop: 'whsStoreId', disabled: false, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: [0, 3, 2].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.storeId, type: 'select', selectData: 'stores', width: '300px', fatherProp: 'whsOrgId', fatherPropName: 'orgId', selectOption: { label: 'name', value: 'id' }},
        { title: '销售仓库', prop: 'whsStorageId', disabled: false, type: 'select', defaultValue: 0, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'whsStoreId', fatherPropName: 'storeId', width: '300px' },
        { title: '批发商', prop: 'whsName', reallyProp: 'whsId', type: 'selectFromPage', selectForm: 'Customer', formProData: { typeName: '批发商' }, width: '300px' },
        { title: '审核状态', defaultValue: 0, prop: 'auditStatu', type: 'select', selectData: 'audit_status', width: '300px' },
        { title: '制单人', prop: 'creatorName', reallyProp: 'creator', type: 'selectFromPage', selectForm: 'User', width: '300px' },
        { title: '审核人', prop: 'reviewer', reallyProp: 'reviewerId', type: 'selectFromPage', selectForm: 'User', width: '300px' }
      ],
      searchListChild: [ // 搜索栏项目
        { title: '组织', prop: 'whsOrgId', disabled: !!(this.$attrs.child_search_data && this.$attrs.child_search_data.whsOrgId), width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '销售门店', prop: 'whsStoreId', disabled: !!(this.$attrs.child_search_data && this.$attrs.child_search_data.whsStoreId), accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), defaultValue: [0, 3, 2].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.storeId, type: 'select', selectData: 'stores', width: '300px', fatherProp: 'whsOrgId', fatherPropName: 'orgId', selectOption: { label: 'name', value: 'id' }},
        { title: '销售仓库', prop: 'whsStorageId', disabled: false, type: 'select', defaultValue: 0, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'whsStoreId', fatherPropName: 'storeId', width: '300px' }
      ],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['whs:sale:order:getWhsOrderInfo'], width: 80 },
        { title: '修改', show: !this.$attrs.is_child, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabledFn: this.financialAudited, disabled: 'isRow', type: 'primary', permission: ['whs:sale:order:saveWhsOrder'], width: 80 }
        // { title: '失效', show: true, prop: 'Invalid', click: this.Invalid, loading: false, icon: 'el-icon-circle-close', disabledFn: this.InvalidDisFn, disabled: 'isRow', type: 'primary', permission: ['wms:pur:diff:order:diffOrderInvalidation'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: !this.$attrs.is_child, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['whs:sale:order:getWhsOrderPageList'], width: 80 },
        { title: '新增', show: !this.$attrs.is_child, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['whs:sale:order:saveWhsOrder'], width: 80 },
        { title: '删除', show: !this.$attrs.is_child, prop: 'delete', click: this.dels, loading: false, icon: 'el-icon-minus', disabledFn: this.financialAuditFn, disabled: 'ids', type: 'primary', permission: ['whs:sale:order:batchDeleteWhsOrder'], width: 80 },
        { title: '审核', show: !this.$attrs.is_child, prop: 'review', click: this.reviews, loading: false, disabled: 'ids', disabledFn: this.financialAuditFn, icon: 'el-icon-s-check', type: 'primary', permission: ['whs:sale:order:whsOrderReview'], width: 80 }
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
      details: [], // 详细数据
      selectList: [],
      details_select_billType: [],
      rowsList: []
    }
  },
  computed: {
    idsLength() {
      return true
    }
  },
  watch: {
    '$attrs.select_window_name': {
      handler(n) {
        if (n === 'WhsSaleIndex') {
          console.log('选择窗口打开了')
          this.searchForm = Object.assign(this.searchForm, this.$attrs.child_search_data)
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
        return !this.$attrs.table_goods_code_arr.includes(row.whsOrderNo)
      }
      return true
    },
    financialAudited(row) {
      return Number(row.auditStatu) > 2
    },
    handleSelectionChange(rows) {
      if (this.$attrs.is_child) {
        this.$listeners.selectList(rows)
      }
      this.rowsList = rows
      this.mixin_rows = rows
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
    financialAuditFn() {
      return this.mixin_rows.some(item => item.auditStatu === 3)
    },
    InvalidDisFn(row) {
      return row.orderInvalid
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = typeof searchForm[item] === 'boolean' ? searchForm[item] : (searchForm[item] || null) })

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
    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purCheckOrderNo', this.$attrs['form-data'])}「${this.currentRow.purCheckOrderNo}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.operateItem.loading = true
        deleteOrders({ 'ids': [this.currentRow.id] }).then(res => {
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
    dels(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`确认删除所选项目吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOrders({ 'ids': this.ids }).then(res => {
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
    reviews(btnItem, isSure = false) { // 审核
      btnItem.loading = true
      if (!isSure) {
        this.$confirm(`确认审核吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.reviews(btnItem, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          btnItem.loading = false
        })
        return
      }
      orderReviewer({ 'ids': this.ids }).then(res => {
        this.message(res)
      }).finally(() => {
        btnItem.loading = false
      })
    },
    generateFunction() {
      if (!this.dialogVisible && this.ruleForm.selectData === '') {
        this.dialogVisible = true
        setTimeout(() => {
          this.$refs.ruleForm.resetFields()
        }, 0)
      } else {
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            generate({ taskDate: this.ruleForm.selectData, taskDetails: this.selectList }).then(res => {
              this.message(res)
              this.ruleForm.selectData = ''
              this.$refs.ruleForm.resetFields()
            }).catch(err => {
              this.$message.error('网络错误')
              this.ruleForm.selectData = ''
              this.$refs.ruleForm.resetFields()
              throw err
            })
          }
        })
      }
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
