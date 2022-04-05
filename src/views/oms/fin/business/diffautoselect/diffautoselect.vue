<template>
  <div>
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
      :size="$attrs.is_child?'mini':'medium'"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {$refs.Tab.toggleRowSelection(row)}"
      @selection-change="handleSelectionChange"
      @row-dblclick="(row)=>{
        if($attrs.is_child){
          $refs.Tab.clearSelection()
          $refs.Tab.toggleRowSelection(row)
          $listeners.addlist()
        }}"
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
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true})"
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
          <div v-else-if="item.type==='PRICE_AUTOMATIC' || item.type==='PRICE'">{{ fen2yuan(row[item.prop]) }}</div>
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
// generateFunction
import MixinGlobal from '@/components/MixinGlobal'
import { getList } from '@/api/wms/receivediff'
import SupplierIndex from '@/views/core/market/supplier/index'
import User from '@/views/ums/admin/userSelectPage'
export default {
  name: 'Order',
  components: { SupplierIndex, User },
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
        { title: '系统差异单号', disabled: true, prop: 'diffRecordId', type: 'text', width: '300px' },
        { title: '收货单号', prop: 'receiveOrderNo', type: 'text', width: '300px' },
        { title: '采购员', prop: 'purPersonId', disabled: this.$attrs.is_child, type: 'select', defaultValue: 0, selectData: 'personListCG', selectOption: { label: 'surname', value: 'id' }, width: '300px' },
        { title: '组织', prop: 'orgId', disabled: false, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), defaultValue: 0, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '收货日期', prop: 'receiveDate', type: 'date', width: '300px' }
      ],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['sto:receive:diff:getListByRecordId'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: !this.$attrs.is_child, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['sto:receive:diff:getList'], width: 80 }
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
  watch: {},
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
    financialAudited(row) {
      return row.financialAudit > 2
    },
    handleSelectionChange(rows) {
      if (this.$attrs.is_child) {
        const unSelectList = this.$refs.Tab.data.filter(item => !rows.includes(item)) // 未选

        if (!this.Mixin_loading) { // 请求完成
        // 合并 is_selected_arr,同步已选和未选
        // let temp = this.MergeArray(this.$attrs.is_selected_arr)
          const arr_temp = this.$refs.Tab.data.filter(item =>
            this.$attrs.is_selected_arr.filter(itF =>
              !unSelectList.map(un => un.id).includes(itF)).includes(item.id))
          if (arr_temp.length) {
            rows = this.MergeArray(rows, arr_temp)
          }
          this.$listeners.selectList(rows, unSelectList)
        }
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
      return this.mixin_rows.some(item => item.financialAudit === 3)
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
      if (this.$attrs.child_search_data) {
        searchForm.purPersonId = this.$attrs.child_search_data.personId
      }
      this.Mixin_loading = true
      getList(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
            this.search({ prop: '' }, null, searchForm.pageNum - 1)
          } else {
            res.data.records.map(item => {
              if (this.$attrs.is_selected_arr && this.$attrs.is_selected_arr.includes(item.id)) {
                this.$nextTick(() => {
                  this.$refs.Tab.toggleRowSelection(item, true)
                })
              }
            })
            this.tableData = res.data
            this.$nextTick(() => {
              this.Mixin_loading = false
            })
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
