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
      :current-row="currentRow"
      :rows="mixin_rows"
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
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
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
          <el-tooltip
            v-else-if="item.type==='storeIds'"
            effect="dark"
            :content="row[item.prop].map(itemZ=>MenuGetPropName('stores',itemZ,{ value: 'id', label: 'name' })).toString()"
            placement="top-start"
          >
            <div slot="content" style="width:500px">{{ row[item.prop].map(itemZ=>MenuGetPropName('stores',itemZ,{ value: 'id', label: 'name' })).toString() }}</div>
            <div>
              {{ row[item.prop].map(itemZ=>MenuGetPropName('stores',itemZ,{ value: 'id', label: 'name' })).toString() | sizeFilter(14) }}
            </div>
          </el-tooltip>
          <!--          v-else-->
          <div v-else>{{ row[item.prop] || '-' }}</div>
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
    <!--    一键选日期    -->
    <el-dialog
      title="请选择采购任务日期"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules">
        <el-form-item prop="selectData">
          <el-date-picker
            v-model="ruleForm.selectData"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="selectData='';$refs.ruleForm.resetFields();dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="generateFunction">确 定</el-button>
      </span>
    </el-dialog>
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
import { getPage, deleteOrders, review, OrderInvalid, broadcast } from '@/api/wms/retailadjustment'
import { generate } from '@/api/wms/purtask'
export default {
  name: 'Order',
  components: { User },
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
      searchList: [ // 搜索栏项目
        { title: '调价单号', prop: 'adjustmentOrderNo', type: 'text', width: '300px' },
        { title: '调价组织', prop: 'adjustmentOrg', defaultValue: this.$store.getters.orgId, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), width: '300px', type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '调价门店', prop: 'adjustmentStore', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherPropName: 'orgId', fatherProp: 'adjustmentOrg', width: '300px' },
        { title: '审核状态', prop: 'auditStatu', defaultValue: 0, type: 'select', selectData: 'audit_status', width: '300px' },
        { title: '调价日期', prop: 'adjustmentDate', type: 'date', width: '300px' },
        { title: '制单人', prop: 'creatorName', reallyProp: 'creator', type: 'selectFromPage', selectForm: 'User', width: '300px' },
        { title: '审核人', prop: 'reviewer', reallyProp: 'reviewerId', type: 'selectFromPage', selectForm: 'User', width: '300px' }
      ],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['price:adjustment:order:getList'], width: 80 },
        { title: '修改', show: true, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRowNoRevEd', type: 'primary', permission: ['price:adjustment:order:save'], width: 80 },
        { title: '广播', show: true, prop: 'broadcast', click: this.broadcastFn, disabled: 'isRowNoWillRev', disabledFn: this.disabledFn, loading: false, type: 'primary', icon: 'el-icon-bell', permission: ['price:adjustment:order:broadcast'] },
        { title: '导出', show: true, prop: 'export', click: this.exportFn, loading: false, icon: 'el-icon-download', disabled: 'isRowNoWillRev', type: 'primary', permission: ['price:adjustment:print'], width: 80 }

        // { title: '失效', show: true, prop: 'invalid', click: this.invalidFn, loading: false, disabled: 'isRowNoWillRev', disabledFn: this.disabledFn, icon: 'el-icon-circle-close', type: 'primary', permission: ['price:adjustment:order:adjustPriceOrderInvalid'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['price:adjustment:order:getList'], width: 80 },
        { title: '新增', show: true, prop: 'insert', click: this.$listeners.openModel, loading: false, icon: 'el-icon-plus', disabled: false, type: 'primary', permission: ['price:adjustment:order:save'], width: 80 },
        { title: '删除', show: true, prop: 'delete', click: this.dels, loading: false, icon: 'el-icon-minus', disabled: 'idsNoRevEd', type: 'primary', permission: ['price:adjustment:order:delete'], width: 80 },
        { title: '审核', show: true, prop: 'edit', click: this.reviews, loading: false, icon: 'el-icon-s-check', disabled: 'idsNoRevEd', type: 'primary', permission: ['price:adjustment:order:reviewer'], width: 80 }
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
      selectList: []
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
    disabledFn() {
      return this.currentRow.invalidFlag
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
      this.mixin_rows = rows
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
            // res.data.records.map(item => { item.invalidAdjustType = item.invalidAdjustType.toString() })
            this.tableData = res.data
            this.Mixin_loading = false
          }
        }
      })
    },
    exportFn(item) {
      this.$listeners.exportFn(this.currentRow, item)
    },
    del(operateItem = {}) {
      operateItem.loading = true
      this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('adjustmentOrderNo', this.$attrs['form-data'])}「${this.currentRow.adjustmentOrderNo}」, 是否继续?`, '提示', {
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
    broadcastFn(e, isSure = false) { // 表单按钮执行
      e.loading = true
      if (!isSure) {
        this.$confirm(`确认向POS发送广播吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.broadcastFn(e, true)
        }).catch(() => {
          this.$message.info('已取消操作')
          e.loading = false
        })
        return
      }
      console.log('执行广播')
      broadcast({ priceAdjustmentOrderNo: this.currentRow.adjustmentOrderNo }).then(res => {
        this.message(res)
      }).finally(() => {
        e.loading = false
      })
    },
    invalidFn(e, isSure = false) {
      e.loading = true
      if (!isSure) {
        this.$confirm(`确认设置调价单为失效吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.invalidFn(e, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          e.loading = false
        })
        return
      }
      OrderInvalid({ adjustmentOrderNo: this.currentRow.adjustmentOrderNo }).then((res) => {
        this.message(res)
      }).finally(() => {
        e.loading = false
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
