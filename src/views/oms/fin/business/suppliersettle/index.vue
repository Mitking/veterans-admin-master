<template>
  <div>
    <keep-alive :max="2" exclude="OmsCompForm">
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
        v-bind="$attrs"
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        :detail_show="detailFormShow"
        v-on="$listeners"
        @tabDateChange="Mixin_tabDate=$event;tabDateChange()"
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
        :is="'OmsForm'"
        :show="detailFormShow?'OmsForm':''"
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
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review } from '@/api/oms/fin/suppliersettle'
import OmsCompForm from '@/views/oms/components/OmsCompForm'
import OmsForm from '@/views/oms/components/OmsForm'
import Order from './suppliersettle'
import dayjs from 'dayjs'
export default {
  name: 'SupplierSettleIndex',
  components: { OmsCompForm, Order, OmsForm },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detailFormShow: false,
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finSupplierSettlement:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '结算单号', prop: 'supplierSettlementNo', width: 260, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '结算日期', width: 150, prop: 'settlementDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '结算日期不能为空', trigger: 'change' }] },
        { title: '供应商', prop: 'supplier', show: true, click: 'addItems', width: 200, windowName: 'SupplierIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'Req', disabled: false,
          rule: [{ required: true, message: '供应商不能为空', trigger: 'change' }] },
        { title: '结算金额', prop: 'settlementAmount', tipMsg: '结算金额(本次结算金额合计) + 折扣金额 = 费用金额 + 业务金额', width: 100, designSemi: (form) => { this.settleFormSemi(form, 'settlementAmount', 'sumDiscountAmount') }, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '折扣金额', prop: 'sumDiscountAmount', tipMsg: '结算金额 + 折扣金额 = 费用金额 + 业务金额', width: 100, designSemi: (form) => { this.settleFormSemi(form, 'sumDiscountAmount', 'settlementAmount') }, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ min: 0, type: 'number', transform: v => Number(v), message: '折扣总金额不能小于0', trigger: 'change' }] },
        { title: '费用金额', prop: 'sumFeeAmount', tipMsg: '费用单的本次结算金额合计', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount_by_condition_supplier, arg: ['settlementAmount', { orderType: '1' }], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '业务金额', prop: 'sumSettleAmount', tipMsg: '收货单和退货单本次结算金额合计', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount_by_condition, arg: ['settlementAmount', { orderType: ['3', '4'] }], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', width: 150, prop: 'auditStatus', show: true, type: 'select', selectData: 'audit_status', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '开户银行', prop: 'openBank', show: false, type: 'select', selectData: 'bank', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '银行账户', prop: 'bankAccount', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '付款方式', width: 150, prop: 'payMode', show: false, type: 'select', selectData: 'pay_mode', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '已付款金额', prop: 'paidAmount', width: 120, show: true, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '未付款金额', prop: 'notPaidAmount', width: 120, show: true, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '已开票金额', prop: 'invoicedAmount', width: 120, show: true, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '未开票金额', prop: 'uninvoicedAmount', width: 120, show: true, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', width: 150, prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', width: 160, prop: 'createTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '供应商结算单号', prop: 'supplierSettlementNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '单据类型', prop: 'orderType', show: false, type: 'select', disabledBindValue: 'orderNo', selectData: 'order_type', selectDataFilter: ['1', '3', '4'], editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false },
        { title: '单据号', prop: 'orderNo', tableWidth: 300, show: false, click: 'addItems', windowName: { '1': 'SupplierFeeIndex', '3': 'StockReceiveIndex', '4': 'StockRefundIndex' }, typeTitleName: '单据类型', typeName: 'orderType', formProData: { supplierId: '', auditStatus: '3', auditState: '3', creatorName: 0, settleState: '0' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '日期', prop: 'receiveDate', readonly: true, defaultValue: '', show: false, type: 'date', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // defaultValue: '', readonly: true,
        { title: '应结金额', prop: 'amountPayable', show: false, type: 'PRICE', defaultValue: '', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '已结金额', prop: 'amountPaid', show: false, type: 'PRICE', defaultValue: '', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '未结金额', prop: 'notPayAmount', show: false, type: 'PRICE', defaultValue: '', readonly: true, design: this.mixin_auto_pur_weight_diff, arg: ['amountPayable', 'amountPaid'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '本次结算金额', prop: 'settlementAmount', tableWidth: 140, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', float: { minus: true },
          rule: [{ validator: this.settleAmountCheck, trigger: 'change' }] },
        // { title: '折扣金额', prop: 'discountAmount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
        // rule: [{ validator: this.settleAmountCheck, trigger: 'change' }] },
        // maxValue: (row) => ((row.notPayAmount || 0) - (row.settlementAmount || 0)) / 100,
        // { title: '订单状态', prop: 'orderState', show: false, type: 'select', selectData: 'order_state', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'OmsCompForm')
      return this.currentComponent === 'OmsCompForm'
    }
  },
  watch: {
    'Mixin_tabDate': {
      handler(n) {
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'supplier', 'disabled', n.some(item => item.orderNo))
        // this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', n.some(item => item.orderNo))
      },
      deep: true,
      immediate: true
    }
  },
  created() {},
  methods: {
    tabDateChange() {
      this.$nextTick(() => {
        if (this.$refs.Comp.$refs.Comp.$refs.Form.changeValue) {
          this.$refs.Comp.$refs.Comp.$refs.Form.changeValue('settlementAmount', 'sumDiscountAmount', this.Mixin_tabDate.map(item => {
            // if (item.orderType === '1') {
            // return this.DECIMAL.sub('0', (item.settlementAmount || '0')).toNumber() || '0'
            // return item.settlementAmount || '0'
            // } else {
            return (item.settlementAmount || '0')
            // }
          }).reduce((c, p) => this.DECIMAL.add(c, p).toNumber(), 0))

          this.$refs.Comp.$refs.Comp.$refs.Form.changeValue('sumDiscountAmount', 'settlementAmount', this.Mixin_tabDate.map(item => item.discountAmount || '0').reduce((c, p) => this.DECIMAL.add(c, p).toNumber(), 0))
        }
      })
    },
    settleAmountCheck(rule, value, callback) {
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      const thisPay = this.DECIMAL.add(this.Mixin_tabDate[index].settlementAmount || '0', this.Mixin_tabDate[index].discountAmount || '0').toNumber()
      const pass = Number(this.Mixin_tabDate[index].notPayAmount)
      if (pass > 0 && pass < thisPay || pass < 0 && pass > thisPay) {
        callback(new Error('结算金额超出!'))
      } else {
        this.$refs.Comp.$refs.Comp.$refs.Table.$refs.Form.clearValidate(`details[${index}][settlementAmount]`)
        this.$refs.Comp.$refs.Comp.$refs.Table.$refs.Form.clearValidate(`details[${index}][discountAmount]`)
        callback()
      }
    },

    settleFormSemi(form, selfProp, prop) { // 金额变动半自动计算
      form[prop] = form.sumFeeAmount + form.sumSettleAmount - form[selfProp]
      form[prop + 'Show'] = this.fen2yuan(form[prop])
    },
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
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'supplierSettlementNo': this.currentRow.supplierSettlementNo }).then(res => {
          if (res.code === 200) {
            res.data.map(item => {
              if (['1'].includes(item.orderType)) {
                item.amountPayable = this.DECIMAL.sub('0', (item.amountPayable || '0')).toNumber()
                item.amountPaid = this.DECIMAL.sub('0', (item.amountPaid || '0')).toNumber()
                item.notPayAmount = this.DECIMAL.sub('0', (item.notPayAmount || '0')).toNumber()
                item.settlementAmount = this.DECIMAL.sub('0', (item.settlementAmount || '0')).toNumber()
              }
            })
            this.details = res.data
            if (this.$attrs.is_child) { // 选单时弹窗展示详情
              this.detailFormShow = true
            } else {
              this.currentComponent = 'OmsCompForm'
            }
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ type: 'CW_GY_JS' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'OmsCompForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data0 = { Req: {}, detailReqs: [] }) { // 提交回调处理
      const data = this.deepClone(data0)
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
              item.supplierSettlementNo = data.Req.supplierSettlementNo
              if (['1'].includes(item.orderType)) {
                item.amountPayable = this.DECIMAL.sub('0', (item.amountPayable || '0')).toNumber()
                item.amountPaid = this.DECIMAL.sub('0', (item.amountPaid || '0')).toNumber()
                item.notPayAmount = this.DECIMAL.sub('0', (item.notPayAmount || '0')).toNumber()
                item.settlementAmount = this.DECIMAL.sub('0', (item.settlementAmount || '0')).toNumber()
              }
            })
          }
          data.supplierSettlementReq = data.Req
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
              item.supplierSettlementNo = data.Req.supplierSettlementNo
              if (item.orderType === '1') {
                item.amountPayable = this.DECIMAL.sub('0', (item.amountPayable || '0')).toNumber()
                item.amountPaid = this.DECIMAL.sub('0', (item.amountPaid || '0')).toNumber()
                item.notPayAmount = this.DECIMAL.sub('0', (item.notPayAmount || '0')).toNumber()
                item.settlementAmount = this.DECIMAL.sub('0', (item.settlementAmount || '0')).toNumber()
              }
            })
          }
          data.supplierSettlementReq = data.Req
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
        this.$confirm(`此操作将永久删除选中的项目, 是否继续?`, '提示', {
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
