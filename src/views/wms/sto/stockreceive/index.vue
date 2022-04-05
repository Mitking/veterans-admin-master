<template>
  <div>
    <keep-alive :max="2" exclude="WmsCompForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :current-row="currentRow"
        :details="details"
        :show="formShow"
        :edit-detail-some-disable="table_add_disable"
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        :detail_show="detailFormShow"
        v-bind="$attrs"
        v-on="$listeners"
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
    <!-- 详情弹窗 -->
    <el-dialog
      class="my-class"
      title="单据详情"
      :visible.sync="detailFormShow"
      :modal-append-to-body="false"
      fullscreen
      :modal="false"
    >
      <component
        :is="'WmsForm'"
        :show="detailFormShow?'WmsForm':''"
        :current-row="currentRow"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :details="details"
        :is_child="$attrs.is_child"
        :add_arr="[]"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailFormShow = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, deleteDetails, getStoNumber, review } from '@/api/wms/stockreceive'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './stockreceive'
import dayjs from 'dayjs'
export default {
  name: 'StockReceiveIndex',
  components: { WmsCompForm, Order, WmsForm },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const check_amount = (rule, value, callback) => { // 金额计算校验
      // callback()
      if (rule.field === 'amount') {
        const form = this.$refs.Comp.$refs.Comp.$refs.Table.autoFormData
        const temp = new this.DECIMAL(value).mul('0.0001').toFixed(0)
        // temp = new this.DECIMAL(temp).mul('10000').toNumber()
        const eq = this.mixin_auto_amount(form.receivePrice, form.number)
        if (temp !== new this.DECIMAL(eq).mul('0.0001').toFixed(0)) {
          callback(new Error('金额计算异常'))
        } else {
          callback()
        }
      } else {
        const index = Number(rule.field.replace(/[^0-9]/ig, ''))
        const temp = new this.DECIMAL(value || '0').mul('0.0001').toFixed(0)
        // temp = new this.DECIMAL(temp).mul('10000').toNumber()
        const eq = this.mixin_auto_amount(this.Mixin_tabDate[index].receivePrice, this.Mixin_tabDate[index].number || '0')
        if (temp !== new this.DECIMAL(eq).mul('0.0001').toFixed(0)) {
          callback(new Error('金额计算异常'))
        } else {
          callback()
        }
      }
    }
    const numberCheck = (rule, value, callback) => { // 数量校验
      if (value < 0) {
        return callback(new Error('不能为负数'))
      }
      let index = rule.field.replace(/[^0-9]/ig, '')
      if (index !== '') {
        index = Number(index)
        if (this.Mixin_tabDate[index].number && this.Mixin_tabDate[index].whetherCount && !this.Mixin_tabDate[index].count) {
          callback(new Error('个数必填'))
        } else if (Number(this.Mixin_tabDate[index].count) && !this.Mixin_tabDate[index].number) {
          callback(new Error('有个数，数量不能为空'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      detailFormShow: false,
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'ProductIndex' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, insertShow: false, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:stoReceiveOrder:update:review'] }
      ],
      table_add_disable: true, // 是够可以新增删除详情品
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      tabDate: [],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货单号', prop: 'receiveOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '采购单号', prop: 'purOrderNo', show: true, type: 'text', editShow: false, detailShow: true, placeholder: '无关联单据', addFatherProp: 'Req', readonly: true },
        { title: '收货日期', prop: 'receiveDate', width: 160, defaultValue: dayjs().format('YYYY-MM-DD'), show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '收货日期不能为空', trigger: 'change' }] },
        // { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, detailShow: false, tabHidden: true, addFatherProp: 'Req' },
        { title: '收货门店', prop: 'receiveStoreId', readonly: true, show: true, width: 200, type: 'select', selectData: 'stores', defaultValue: this.$store.state.user.storeId || '', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '收货门店不能为空', trigger: 'change' }] },
        { title: '收货仓库', prop: 'receiveStockId', show: true, width: 200, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherPropName: 'storeId', fatherProp: 'receiveStoreId',
          rule: [{ required: true, message: '收货仓库不能为空', trigger: 'change' }] },
        { title: '收货类型', prop: 'receiveType', show: true, width: 160, type: 'select', selectData: 'receive_type', selectDataFilter: null, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '收货类型不能为空', trigger: 'change' }] },
        { title: '总金额', prop: 'orderAmount', show: true, width: 160, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 160, show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        // { title: '制单人id', prop: 'creator', show: true, width: 160, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, width: 160, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '结算状态', prop: 'settleState', show: true, width: 160, type: 'select', selectData: 'settle_state', editShow: false, detailShow: false, addFatherProp: 'Req', defaultValue: '0' },
        { title: '收货来源', prop: 'receiveSource', show: true, width: 160, type: 'select', selectData: 'receive_source', editShow: false, tableHidden: true, tabHidden: true, detailShow: true, addFatherProp: 'Req', defaultValue: '', readonly: true,
          rule: [{ required: true, message: '收货来源不能为空', trigger: 'change' }] },
        { title: '审核人', prop: 'reviewer', show: true, width: 160, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, width: 200, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },

        { title: '制单时间', prop: 'createTime', show: true, width: 200, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, width: 160, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, width: 200, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '收货仓库', prop: 'receiveStock', show: false, type: 'text', editShow: false, defaultValue: '', detailShow: true, addFatherProp: 'Req',
        // rule: [{ required: true, message: '收货仓库不能为空', trigger: 'change' }] },
        // { title: '采购员', prop: 'purPerson', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req',
        //   rule: [{ required: true, message: '采购员必填', trigger: 'change' }] },
        // { title: '采购员id', prop: 'purPersonId', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '收货单号', prop: 'receiveOrderNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', readonly: false, show: false, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', formProData: { orgId: 0, ifTotalStock: true, stopBuy: false },
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', readonly: false, show: false, autoForm: ['amount'], tabWidth: 200, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', formProData: { orgId: 0, ifTotalStock: true, stopBuy: false }},
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, type: 'text', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单位', prop: 'weightType', show: false, defaultValue: '-', readonly: true, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否称重', prop: 'whetherWeigh', show: false, readonly: true, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', show: false, readonly: true, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '供应商', prop: 'supplierId', show: false, click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '供应商', prop: 'supplier', show: false, placeholder: '请选择', click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', focusFn: this.focusFn, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '采购员', prop: 'purPersonId', show: false, type: 'select', selectData: 'personListCG', selectOption: { label: 'surname', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '成本价(隐藏)', prop: 'costPrice', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '收货单价', prop: 'receivePrice', realProp: 'costPrice', tabWidth: 120, propSemiName: 'amount', readonly: false, autoForm: ['amount'], focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'amount' }, show: false, type: 'COST_PRICE_AUTOMATIC', design: this.mixin_auto_price, arg: ['amount', 'number'], placeholder: '系统辅助计算', designSemi: this.mixin_auto_amount, argSemi: ['receivePrice', 'number'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '采购个数', prop: 'purNum', show: false, type: 'Number', editShow: false, disabled: true, detailShow: true, readonly: true, addFatherProp: 'detailReqs' },
        { title: '收货个数', prop: 'count', show: false, placeholder: '计数商品必填', type: 'Number', fn_disabled: (row) => !row.whetherCount, tableHidden: true, autoForm: ['amount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '总毛重', prop: 'weight', placeholder: '手动录入', fn_disabled: (row) => !row.whetherWeigh, tableHidden: true, autoForm: ['amount'], type: 'weight_number', show: false, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购件数', prop: 'purPiecesNum', show: false, type: 'Number', readonly: true, defaultValue: 0, tableHidden: true, autoForm: [], selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单件皮重(数量)', autoFormTitleFn: (row) => row.whetherWeigh ? '单件皮重' : '单件数量', prop: 'onePiecesTareWeight', show: false, placeholder: '请填写', tableHidden: true, autoForm: ['amount'], type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货件数', prop: 'receivePiecesNum', show: false, type: 'Number', placeholder: '手动录入', tableHidden: true, autoForm: ['amount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购数量', autoFormTitleFn: (row, form) => form.receiveType === '1' && '采购数量' || form.receiveType === '2' && '赠送数量' || form.receiveType === '3' && '补损数量' || '数量', prop: 'purQuantity', show: false, type: 'weight_number', disabled: true, readonly: true, autoForm: [], defaultValue: 0, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货数量', prop: 'number', show: false, placeholder: '系统计算', type: 'WEIGHT_AUTOMATIC', autoForm: ['amount'], focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'amount' }, design: this.mixin_auto_pur_num_weight, arg: ['weight', 'onePiecesTareWeight', 'receivePiecesNum', 'whetherWeigh'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: numberCheck, trigger: 'submit' }] },
        { title: '金额', prop: 'amount', propSemiName: 'receivePrice', propSemiType: 'COST_PRICE', readonly: false, show: false, type: 'PRICE', disabled: true, autoForm: ['amount'], autoFormfocusFn: this.mixin_auto_amount, autoFormPropFilter: { autoForm: 'amount' }, placeholder: '系统辅助计算', design: this.mixin_auto_amount, designSemi: this.mixin_auto_price, argSemi: ['amount', 'number'], arg: ['receivePrice', 'number'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: check_amount, trigger: 'change' }] },
        // { title: '费用', prop: 'fee', show: false, type: 'PRICE', autoForm: ['amount'], readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货人', prop: 'receiveUserId', show: false, type: 'select', defaultValue: '', disabled: false, selectData: 'personListSH', selectOption: { label: 'surname', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '试吃不入库', prop: 'isGive', tabWidth: 100, show: false, readonly: false, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, defaultValue: false, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsCompForm')
      return this.currentComponent === 'WmsCompForm'
    }
  },
  watch: {},
  created() {},
  methods: {
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'Order'
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
      this.loading = false
    },
    focusFn(item, row, index) {
      switch (item.prop) {
        case 'number': case 'price' : case 'supplier': case 'amount':
          if (!row.goodsCode) {
            this.$message.info('请先选择商品')
          }
          if (!this.$attrs.is_child) {
            this.$refs.Comp.$refs.Comp.$refs.Table.$refs.Form.clearValidate(`details[${index}][${item.prop}]`)
          }
          return !!row.goodsCode
        default:
          return true
      }
    },
    disabled_fn(row) {
      return !row.whetherWeigh
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      const autoOrder = ['edit', 'detail'].includes(operateItem.prop) && !!this.currentRow.purOrderNo // 自动生成单据
      // 试吃
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'isGive', 'editShow', autoOrder && this.currentRow.receiveType === '2')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'isGive', 'detailShow', autoOrder && this.currentRow.receiveType === '2')
      // 单据类型
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveType', 'readonly', autoOrder)
      // 根据单据类型修改金额计算方式
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'amount', 'disabled', autoOrder)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'amount', 'readonly', autoOrder)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'amount', 'type', autoOrder ? 'PRICE' : 'PRICE_SEMI_AUTOMATIC')
      // 根据单据类型修改单价计算方式
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receivePrice', 'type', autoOrder ? 'COST_PRICE_AUTOMATIC' : 'COST_PRICE_SEMI_AUTOMATIC')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receivePrice', 'placeholder', autoOrder ? '系统计算' : '系统辅助计算')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPersonId', 'editShow', autoOrder)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'purQuantity', 'editShow', autoOrder)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'purQuantity', 'detailShow', autoOrder)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'purNum', 'detailShow', autoOrder)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPiecesNum', 'detailShow', autoOrder)

      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receivePrice', 'editShow', !(operateItem.prop === 'edit' && ['2', '3', '6'].includes(this.currentRow.receiveType)))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'amount', 'editShow', !(operateItem.prop === 'edit' && ['2', '3', '6'].includes(this.currentRow.receiveType)))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'orderAmount', 'editShow', !(operateItem.prop === 'edit' && ['2', '3', '6'].includes(this.currentRow.receiveType)))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'orderAmount', 'detailShow', !(operateItem.prop === 'edit' && ['2', '3', '6'].includes(this.currentRow.receiveType)))

      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'fee', 'detailShow', autoOrder)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'fee', 'editShow', autoOrder)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'fee', 'autoForm', autoOrder ? ['amount'] : [])

      // 根据单据类型是否弹窗展示
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purNum', 'autoForm', autoOrder ? ['amount'] : [])
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purQuantity', 'autoForm', autoOrder ? ['amount'] : [])
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPiecesNum', 'autoForm', autoOrder ? ['amount'] : [])

      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveStoreId', 'readonly', [1].includes(this.$store.getters.accountType))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveUserId', 'editShow', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveSource', 'defaultValue', operateItem.prop === 'insert' ? 2 : this.currentRow.receiveSource)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveType', 'selectDataFilter',
        operateItem.prop === 'insert' ? ['1', '2', '3']
          : (Number(this.currentRow.receiveSource) === 1 && ['4', '5'] || Number(this.currentRow.receiveSource) === 2 && ['1', '2', '3']))
      this.table_add_disable = !(operateItem.prop === 'insert' || (!this.currentRow.purOrderNo && Number(this.currentRow.receiveSource) === 2))
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        const cgarr = this.enumGetproplist({ selectData: 'personListSH' }).map(item => item.id)
        if (operateItem.prop === 'edit' && !cgarr.includes(this.$store.getters.operatorId)) { // 没有收货权限
          this.$message.info('非收货人员无该权限！')
          operateItem.loading = false
          return
        } else if (this.$store.getters.accountType === 1 && operateItem.prop === 'edit' && cgarr.includes(this.$store.getters.operatorId)) { // 门店级别有收货权限
          // this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveUserId', 'defaultValue', this.$store.getters.operatorId)
          this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveUserId', 'disabled', true)
        } else {
          this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveUserId', 'disabled', false)
        }
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'supplier', 'readonly', !!this.currentRow.purOrderNo)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPersonId', 'readonly', !!this.currentRow.purOrderNo)
        // this.mixin_arr_edit_by_prop(this.table_data_arr, 'price', 'title', this.currentRow.purOrderNo ? '采购单价' : '单价')
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsCode', 'readonly', !!this.currentRow.purOrderNo)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsName', 'readonly', !!this.currentRow.purOrderNo)
        getDetails({ 'receiveOrderNo': this.currentRow.receiveOrderNo }).then(res => {
          if (res.code === 200) {
            res.data.map(item => {
              if (item.receiveUserId !== '0' && this.$store.state.enum.enumList.personListSH.every(itemZ => itemZ.id !== Number(item.receiveUserId))) {
                this.$store.commit('enum/ADD_LIST_ITEM', { name: 'personListSH', obj: { id: Number(item.receiveUserId), surname: item.receiveUser }})
              }
            })
            this.details = res.data
            if (this.$store.getters.accountType === 1 && operateItem.prop === 'edit' && cgarr.includes(this.$store.getters.operatorId)) {
              this.details.map(item => { item.receiveUserId = this.$store.getters.operatorId })
            }
            if (this.$attrs.is_child) { // 选单时弹窗展示详情
              this.detailFormShow = true
            } else {
              this.currentComponent = 'WmsCompForm'
            }
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'supplier', 'readonly', false)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPersonId', 'readonly', false)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'receivePrice', 'readonly', false)
        // this.mixin_arr_edit_by_prop(this.table_data_arr, 'price', 'title', '单价')
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsCode', 'readonly', false)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsName', 'readonly', false)
        this.details = []
        getStoNumber({ stoType: 'CC_SH' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          data.Req.id = null

          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.receiveOrderNo = data.Req.receiveOrderNo
              if (data.Req.receiveType !== '1') {
                item.receivePrice = 0
                item.amount = 0
              }
              if (data.Req.receiveType === '1') {
                item.price = item.receivePrice
              }
            })
          }
          if (data.Req.receiveType !== '1') {
            data.Req.orderAmount = 0
          }
          data.stoReceiveOrderReq = data.Req
          delete data.Req
          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addOrder(data).then(res => {
                if (res.code === 200) {
                  this.review(res.data.id, true)
                }
              }).catch(err => {
                this.loading = false
                throw err
              })
            }).catch(() => {
              this.$message.info('已取消审核')
              this.loading = false
            })
            return
          }
          addOrder(data).then(res => {
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.receiveOrderNo = data.Req.receiveOrderNo
              if (data.Req.receiveType !== '1') {
                item.receivePrice = 0
                item.amount = 0
              }
              if (data.Req.receiveType === '1' && !data.Req.purOrderNo) { // 手动创建
                item.price = item.receivePrice
              }
            })
          }
          if (data.Req.receiveType !== '1') {
            data.Req.orderAmount = 0
          }
          data.stoReceiveOrderReq = data.Req
          delete data.Req
          updateOrder(data).then(res => {
            if (res.code === 200 && arg.review) {
              this.review()
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        default:
          console.log(arg, data)
      }
    },
    review(id, isSure = false) { // 审核
      if (!isSure) {
        this.$confirm(`确认审核吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.review(id, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          if (this.operateItem.prop === 'insert') {
            this.currentComponent = 'Order'
            setTimeout(() => {
              this.$refs.Comp.search()
            }, 0)
          }
          this.loading = false
        })
        return
      }
      review({ 'ids': [id || this.currentRow.id], 'auditStatus': '3' }).then(res => {
        if (res.code === 200) {
          this.message(res)
        }
      }).catch(() => {
        if (this.operateItem.prop === 'insert') {
          this.currentComponent = 'Order'
          setTimeout(() => {
            this.$refs.Comp.search()
          }, 0)
        }
        this.loading = false
      })
    },
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除单号「${item.receiveOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // this.operateItem.loading = true
          deleteDetails({ ids: [item.id] }).then(res => {
            if (res.code === 200) {
              this.$success('操作成功')
            } else {
              this.$error(res.data)
            }
            resolve(true)
          }).catch(err => {
            throw err
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
          resolve(false)
        })
      })
    }
  }
}
</script>
<style scoped>
</style>
