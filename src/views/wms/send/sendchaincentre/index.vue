<!-- ,-->
<template>
  <div>
    <keep-alive :max="2" exclude="WmsCompForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
        :chain-apply-table="chain_apply_table"
        :chain-call-table="chain_call_table"
        :chain-reject-table="chain_reject_table"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :current-row="currentRow"
        :details="details"
        :show="formShow"
        @currentRowSelected="currentRow=$event"
        @openModel="openModel"
        @formSave="formSave"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails } from '@/api/wms/sendapply'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './sendchaincentre'
import { getCallDetails } from '@/api/wms/sendcall'
import { getDetails as rejectGetDetails } from '@/api/wms/sendreject'

export default {
  name: 'SendChainCentreIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { storeId: '', orgId: 0 }}
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '详情', prop: 'detail' },
      table_data_arr: [],
      chain_apply_table: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: false, detailShow: false, addFatherProp: 'Req' },
        { title: '单据号', prop: 'applyNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '申请门店', prop: 'applyStoreId',width:200, show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '申请门店', prop: 'applyStoreName', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '申请仓库', prop: 'applyStockId', show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'applyStoreId', fatherPropName: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '申请仓库', prop: 'applyStockName', width: 200, show: true, type: 'text', editShow: false, detailShow: false, addFatherProp: 'Req' },
        // { title: '发货门店id', prop: 'sendStoreId', show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '发货门店', prop: 'sendStoreName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '申请日期', prop: 'applyDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '金额', prop: 'amount', width: 150, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'maker', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '制单人', prop: 'makerId', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPerson', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核人', prop: 'auditPersonId', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '创建时间', prop: 'createTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '调出单号', prop: 'applyNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { applyStoreId: '', orgId: 0 }, show: false, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { applyStoreId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '规格', prop: 'spec', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '库存单位', prop: 'weightType', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '申请数量', prop: 'number', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '金额', prop: 'amount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '个数', prop: 'count', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      chain_call_table: [
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: false, detailShow: false, addFatherProp: 'Req' },
        { title: '调出单号', prop: 'callNo', show: true, defaultValue: '', type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '自动生成', prop: 'autoGenerate', width: 100, show: true, type: 'if_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '已生成配送单', prop: 'isGenerateDelivery', show: true, type: 'if_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '已生成验收单', prop: 'isGenerateAccept', width: 100, show: true, type: 'if_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '已生成入库单', prop: 'isGenerateStorage', width: 100, show: true, type: 'if_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '发货门店', prop: 'shipStoreName', width: 200, show: true, type: 'text', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '发货仓库', prop: 'shipStockName', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '发货仓库id', prop: 'shipStockId', show: true, tabHidden: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'shipStoreId', fatherPropName: 'storeId', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货门店', prop: 'receiptStore', width: 200, show: true, type: 'text', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货仓库', prop: 'receiptStock', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '收货仓库id', prop: 'receiptStockId', show: true, tabHidden: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'receiptStoreId', fatherPropName: 'storeId', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '金额', prop: 'amount', width: 150, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', selectData: 'audit_status', defaultValue: '1', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '调出日期', prop: 'calloutDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核人', prop: 'auditPersonId', width: 150, show: true, type: 'text', editShow: false, detailShow: false, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '创建人', prop: 'creatorName', width: 150, show: false, type: 'text', editShow: false, defaultValue: '暂无制单人', detailShow: true, addFatherProp: 'Req' },
        { title: '创建时间', prop: 'createTime', width: 160, show: false, type: 'text', editShow: false, defaultValue: '暂无制单人', detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPerson', width: 150, show: true, type: 'text', editShow: false, detailShow: true, defaultValue: '暂无', addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewTime', width: 160, show: true, type: 'text', editShow: false, defaultValue: '暂无制单人', detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '调出单号', prop: 'callNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { shipStoreId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { shipStoreId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, readonly: true, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '库存单位', prop: 'weightType', readonly: true, show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '申请数量', prop: 'applyNumber', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', rule: [{ required: true, message: '请输入申请个数', trigger: 'blur' }] },
        { title: '调出数量', prop: 'number', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '金额', prop: 'amount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '申请个数', prop: 'applyCount', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', rule: [{ required: true, message: '请输入申请个数', trigger: 'blur' }] },
        { title: '调出个数', prop: 'count', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      chain_reject_table: [
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '退货单号', prop: 'rejectNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '验收单号', prop: 'acceptNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '退货门店', prop: 'rejectStore', width: 200, show: true, type: 'text', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '退货仓库', prop: 'rejectStock', width: 200, show: true, type: 'text', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'rejectStoreId', fatherPropName: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '发货门店', prop: 'deliveryStore', width: 200, show: true, type: 'text', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '发货仓库', prop: 'deliveryStock', width: 200, show: true, type: 'text', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'deliveryStoreId', fatherPropName: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '退货日期', prop: 'rejectDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '退货门店', prop: 'rejectStore', show: true, type: 'text', editShow: false, detailShow: false, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', selectData: 'audit_status', defaultValue: '1', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'maker', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '制单人id', prop: 'makerId', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPerson', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核人id', prop: 'auditPersonId', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'makeTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '金额', prop: 'amount', show: true, width: 100, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '件数', prop: 'count', show: true, width: 100, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '退货单号', prop: 'rejectNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', rule: [{ required: true, message: '请输入申请个数', trigger: 'blur' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '基本单位', prop: 'weightType', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '验收数量', prop: 'acceptNumber', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退货数量', prop: 'number', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退货个数', prop: 'count', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退货金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'number'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
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
    openModel(e) { // 详情
      e.loading = true

      switch (this.currentRow.orderType) {
        case 0: // 申请单
          this.table_data_arr = this.chain_apply_table
          getDetails({ 'applyNo': this.currentRow.applyNo }).then(res => {
            if (res.code === 200) {
              this.details = res.data
              this.currentComponent = 'WmsCompForm'
            } else {
              this.$message.error('获取失败')
            }
          }).finally(() => {
            e.loading = false
          })
          break
        case 1: // 调出单
          this.table_data_arr = this.chain_call_table
          getCallDetails({ 'callNo': this.currentRow.callNo }).then(res => {
            if (res.code === 200) {
              this.details = res.data
              this.currentComponent = 'WmsCompForm'
            } else {
              this.$message.error('获取失败')
            }
          }).finally(() => {
            e.loading = false
          })
          break
        case 2: // 退货单
          this.table_data_arr = this.chain_reject_table
          rejectGetDetails({ 'rejectNo': this.currentRow.rejectNo }).then(res => {
            if (res.code === 200) {
              this.details = res.data
              this.currentComponent = 'WmsCompForm'
            } else {
              this.$message.error('获取失败')
            }
          }).finally(() => {
            e.loading = false
          })
          break
      }
    },
    formSave() { // 提交回调处理
      this.currentComponent = 'Order'
      this.table_data_arr = []
      this.loading = false
    }
  }
}
</script>
<style scoped>
</style>

