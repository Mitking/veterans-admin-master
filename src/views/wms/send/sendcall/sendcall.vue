<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
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
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :ids="ids"
      :rows="mixin_rows"
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
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,outTabHidden:undefined}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {$refs.Tab.toggleRowSelection(row)}"
      @selection-change="handleSelectionChange"
    >
      <!--   可选  -->
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :fixed="!!tableData.records.length?'left':false"
      />
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true,outTabHidden:undefined})"
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
    <!--打印弹窗-->
    <el-dialog
      title="打印预览"
      :visible.sync="printShow"
      :fullscreen="true"
    >
      <send-call-printer v-if="printShow" :call-numbers="checkedNumbers" />
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
// addSendCall,deleteDetailById,getCallDetails,reviewSendCall,updateSendCall getCallDetails, addSendCall, updateSendCall, deleteDetailById, getSendNumber,
import { getSendCallPage, deleteSendCall, reviewSendCall } from '@/api/wms/sendcall'
import SendCallPrinter from '@/views/wms/sto/sendcall/components/SendCallPrinter.vue'
import ProductIndex from '@/views/core/product/product/index'
import User from '@/views/ums/admin/userSelectPage'
import dayjs from 'dayjs'
export default {
  name: 'SendCall',
  components: { ProductIndex, User, SendCallPrinter },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      checkedNumbers: [], // 所有选中的单号
      Comp: 'ProductIndex',
      selectFormShow: false,
      searchList: [ // 搜索栏项目
        { title: '调出单号', prop: 'callNo', type: 'text', width: '300px' },
        { title: '商品', prop: 'goodsName', reallyProp: 'goodsCode', click: 'addItems', selectForm: 'ProductIndex', type: 'selectFromPage', width: '300px' },
        { title: '组织', prop: 'orgId', defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '发货门店', prop: 'shipStoreId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), type: 'select', selectData: 'stores', width: '300px', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId' },
        { title: '收货门店', prop: 'receiptStoreId', type: 'select', defaultValue: 0, selectData: 'stores', width: '300px', selectOption: { label: 'name', value: 'id' }},
        { title: '审核状态', prop: 'auditStatus', defaultValue: 0, type: 'select', selectData: 'audit_status', width: '300px' },
        // { title: '调出结束日期', prop: 'callEndDate', defaultValue: dayjs().format('YYYY-MM-DD'), type: 'date', width: '300px' },
        { title: '审核人', prop: 'reviewer', reallyProp: 'auditPersonId', type: 'selectFromPage', selectForm: 'User', width: '300px' },
        { title: '调出日期', prop: 'callDate', defaultValue: [dayjs().subtract(3, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')], type: 'daterange', width: '350px' },
        { title: '只看生成验收单', prop: 'isGenerateAccept', type: 'checkbox', width: '160px' },
        { title: '只看生成入库单', prop: 'isGenerateStorage', type: 'checkbox', width: '160px' }
      ],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['wms:sendCallDetails:getDetails'], width: 80 },
        { title: '修改', show: true, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRowNoRevEds', type: 'primary', permission: ['wms:sendCall:update'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['wms:sendCall:getList'], width: 80 },
        { title: '新增', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['wms:sendCall:add'], width: 80 },
        { title: '删除', show: true, prop: 'delete', click: this.dels, loading: false, icon: 'el-icon-minus', disabled: 'idsNoRevEds', disabledFn: this.isAutoGenerate, type: 'primary', permission: ['wms:sendCall:delete'], width: 80 },
        // { title: '审核', show: true, prop: 'edit', click: this.review, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRowNoRevEds', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        { title: '审核', show: true, prop: 'review', click: this.reviews, loading: false, icon: 'el-icon-s-check', disabled: 'idsNoRevEds', type: 'primary', permission: ['wms:sendCall:update:review'], width: 80 },
        { title: '打印', show: true, prop: 'print', click: this.print, loading: false, icon: 'el-icon-document-copy', disabled: 'ids', type: 'primary', permission: ['wms:sendCall:print'], width: 80 }
        // { title: '复制', prop: 'copy', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
      ],
      ids: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        shipStoreId: this.$store.state.user.storeId,
        callDate: [dayjs().subtract(3, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
        callBeginDate: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
        callEndDate: dayjs().format('YYYY-MM-DD'),
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      printShow: false,
      printData: [], // 打印接口返回数据
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
      this.ids = rows.map(item => item.id)
      this.checkedNumbers = rows.map(item => item.callNo)
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$message.error(res.msg)
      }
    },
    isAutoGenerate() { // 存在生成单号
      return this.mixin_rows.some(item => item.autoGenerate)
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      searchForm.callBeginDate = this.searchForm.callDate && this.searchForm.callDate[0]
      searchForm.callEndDate = this.searchForm.callDate && this.searchForm.callDate[1]
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
      if (searchForm.goodsName !== undefined) {
        delete searchForm.goodsName
      }

      this.Mixin_loading = true
      getSendCallPage(searchForm).then(res => {
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
        deleteSendCall({ 'callNos': this.mixin_rows.map(item => item.callNo) }).then(res => {
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
    review() { // 审核
      this.$listeners.review()
    },
    reviews() { // 批量审核
      reviewSendCall({ 'ids': this.ids, 'auditStatus': '3' }).then(res => {
        this.message(res)
      }).catch(err => {
        this.$message.error(err.message)
      })
    },
    print() {
      this.printShow = true
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
