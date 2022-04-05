<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      @search="search({ prop: true })"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event] = ''"
    />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{
        'margin-top': searchFormShow?'0px':'24px',
        transition: transition ? null : 'all .3s ease',
      }"
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
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="
        (row) => {
          $refs.Tab.toggleRowSelection(row)
        }
      "
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
        v-for="(item, index) in ArrFilter($attrs['form-data'], { show: true })"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{ row }">
          <div v-if="item.type === 'if_type' || item.type === 'if_enable'" :style="{color:row[item.prop]?'':'#999999'}">
            {{ MenuGetPropName(item.type, row[item.prop]) }}
          </div>
          <div
            v-else-if="item.type === 'select' || item.type === 'selectState'"
          >
            {{
              MenuGetPropName(
                item.selectData,
                row[item.prop],
                item.selectOption ? item.selectOption : { value: "", label: "" }
              )
            }}
          </div>
          <div v-else-if="item.type === 'PRICE_AUTOMATIC' || item.type === 'PRICE'">
            {{ fen2yuan(row[item.prop]) }}
          </div>
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
    <!-- 分页 -->
    <mix-page
      ref="mixinPage"
      :form="searchForm"
      :table-data="tableData"
      @search="search"
    />
    <!--    一键选日期    -->
    <el-dialog
      title="请选择生成单据日期"
      :visible.sync="dialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="30%"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules">
        <el-form-item prop="selectData">
          <el-date-picker
            v-model="ruleForm.selectData"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            :picker-options="pickerOptions"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          :loading="generateLoading"
          @click="
            selectData = '';
            $refs.ruleForm.resetFields();
            dialogVisible = false;
            generateLoading = false;
          "
        >取 消</el-button>
        <el-button
          :loading="generateLoading"
          type="primary"
          @click="generateFunction({ prop: subType })"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      title="员工选择"
      :visible.sync="mixin_select_form_show"
      width="600px"
    >
      <div style="width: 100%; padding-right: 15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          :table_goods_code_arr="[]"
          :no_multiple="true"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show = false"
        />
      </div>
      <div slot="footer" style="marginTop:-20px">
        <el-button type="primary" @click="mixin_select_form_show = false">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 成本弹窗 -->
    <el-dialog
      v-if="cost_form_show"
      title="成本核算"
      :visible.sync="cost_form_show"
      width="80%"
    >
      <div>
        <el-table
          ref="FormTab"
          :data="purCostList"
          style="width: 80%;margin:0 10%"
          border
          max-height="500"
          highlight-current-row
          :header-cell-style="{background:'#F3F4F7',color:'#555'}"
          @row-click="(row) => {$refs.FormTab.toggleRowSelection(row)}"
          @selection-change="formSelectFeeList=$event"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            prop="purCostsOrderNo"
            label="费用单号"
            align="center"
            width="260"
          />
          <el-table-column
            prop="costDate"
            label="费用日期"
            align="center"
          />
          <el-table-column
            prop="totalAmount"
            label="费用总金额"
            align="center"
          >
            <template slot-scope="{row}">
              {{ fen2yuan(row.totalAmount) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer">
        <el-button type="" :loading="cost_form_loading" @click="cost_form_show = false">取 消</el-button>
        <el-button type="primary" :loading="cost_form_loading" :disabled="!formSelectFeeList.length" @click="costCalculation">核 算</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import User from '@/views/ums/admin/userSelectPage'
// import PurCostsIndex from '@/views/wms/pur/costs/index.vue'
import MixinGlobal from '@/components/MixinGlobal'
import { getPage, shareFee, review, GeneratePrice } from '@/api/oms/fin/storeceivefeeshare'
// import { getPage as getPageReplenish } from '@/api/wms/purreplenishment'
import { getPurCostListForFeeShare } from '@/api/wms/purcosts'
export default {
  name: 'Order',
  components: { User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      formSelectFeeList: [],
      purCostList: [],
      cost_form_loading: false,
      costSelected: [],
      cost_form_show: false,
      pickerOptions: {
        disabledDate(item) {
          return item.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      generateLoading: false,
      ruleForm: {
        selectData: ''
      },
      dialogVisible: false,
      rules: {
        selectData: [
          { required: true, message: '请输入日期', trigger: 'blur' }
        ]
      },

      searchList: [
        // 搜索栏项目
        { title: '收货单号', prop: 'receiveOrderNo', type: 'text', width: '300px' },
        { title: '收货日期', prop: 'receiveDate', type: 'date', width: '300px' },
        { title: '审核状态', defaultValue: 0, prop: 'auditStatus', type: 'select', selectData: 'audit_status', width: '300px' },
        { title: '制单人', prop: 'creatorName', reallyProp: 'creator', type: 'selectFromPage', selectForm: 'User', width: '300px' },
        { title: '审核人', prop: 'reviewer', reallyProp: 'reviewerId', type: 'selectFromPage', selectForm: 'User', width: '300px' }
      ],
      operateTableList: [
        { title: '详情', show: true, prop: 'detail', click: this.$listeners.openModel, loading: false, icon: 'el-icon-document', disabled: 'isRow', type: 'primary', permission: ['oms:finFeeShareDetails:getList'], width: 80 },
        { title: '修改', show: true, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRowNoRevEds', type: 'primary', permission: ['oms:finFeeShare:update'], width: 80 }
      ],
      operateList: [
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['oms:finFeeShare:page'], width: 80 },
        { title: '审核', show: true, prop: 'edit', click: this.reviews, loading: false, icon: 'el-icon-s-check', disabled: 'idsNoRevEds', type: 'primary', permission: ['oms:finFeeShare:review'], width: 80 },
        { title: '成本核算', show: true, prop: 'costCalculation', click: this.costCalculation, loading: false, icon: 'el-icon-money', disabled: 'idsNoRevEds', disabledFn: this.isCostCalculationed, type: 'primary', permission: ['oms:finFeeShare:share'], width: 80 },
        { title: '生成定价单', show: true, prop: 'generatePrice', click: this.generatePrice, loading: false, icon: 'el-icon-edit-outline', disabled: 'idsNoWillRevs', disabledFn: this.isGedPrice, type: 'primary', permission: ['oms:finFeeShare:generatePrice'], width: 80 }
      ],
      ids: [],
      ids_pur: [],
      ids_replenishment: [],
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
      purOrderNos: [],
      replenishmentOrderNos: [],
      subType: ''
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
    this.searchList.map((item) => {
      this.$set(this.searchForm, item.prop, item.defaultValue === undefined ? '' : item.defaultValue)
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
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
      this.mixin_rows = rows
      this.ids = rows.map((item) => item.id)
    },
    isCostCalculationed() {
      // 存在已核算单据单的情况,或者不是采购收货
      return this.mixin_rows.some((item) => !!item.feeAmount || item.receiveType !== '1')
    },
    isGedPrice() {
      // 已生成定价单
      return this.mixin_rows.some((item) => item.isGeneratePrice)
    },

    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    costCalculation(e = {}, isSure = false) {
      if (this.cost_form_show === false) {
        e.loading = true
        this.formSelectFeeList = []
        getPurCostListForFeeShare({}).then(res => {
          this.purCostList = res.data
          this.cost_form_show = true
        }).finally(() => {
          e.loading = false
        })
      } else {
        if (!isSure) {
          this.$confirm(`确认费用分摊吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.costCalculation(null, true)
          }).catch(() => {
            this.$message.info('已取消操作')
          })
          return
        }
        this.cost_form_loading = true
        shareFee({ 'shareIds': this.ids, 'purFees': this.formSelectFeeList }).then(res => {
          this.message(res)
          this.cost_form_show = false
        }).finally(() => {
          this.cost_form_loading = false
        })
      }
    },
    generatePrice(e = {}, isSure = false) {
      e.loading = true
      if (!isSure) {
        this.$confirm(`确认生成吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.generatePrice(e, true)
        }).catch(() => {
          this.$message.info('已取消操作')
          e.loading = false
        })
        return
      }
      GeneratePrice({ 'ids': this.ids }).then(res => {
        this.message(res)
      }).finally(() => {
        e.loading = false
      })
    },
    reviews(e = {}, isSure = false) { // 审核
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
      review({ 'ids': this.ids, 'auditStatus': '3' }).then(res => {
        if (res.code === 200) {
          this.message(res)
        }
      }).finally(() => {
        e.loading = false
      })
    },
    async search(operateItem = { prop: '' }, pageSize = null, pageNum = null) {
      // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach((item) => {
        searchForm[item] = searchForm[item] || null
      })

      this.Mixin_loading = true
      const { data, code } = await getPage(searchForm)
      if (code === 200) {
        data.records.map(item => { item.orderType = '1' })
        this.tableData = data
      }
      this.Mixin_loading = false
      this.currentRow = { id: '' }
    },
    transitionBegin(el) {
      this.otherOffsetHeight = el.offsetHeight
      this.transitionMarginTop = this.searchFormShow
        ? 0
        : 0 - this.otherOffsetHeight
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
.transition {
  /*position: absolute;*/
  transition: all 0.3s ease;
  margin-top: 0;
  top: 0;
}
</style>
