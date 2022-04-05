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
        :detail_show="detailFormShow"
        :details="details"
        :show="formShow"
        v-bind="$attrs"
        :form-bottons="form_bottons"
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
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review } from '@/api/oms/fin/franchiseesettle'
import OmsCompForm from '@/views/oms/components/OmsCompForm'
import OmsForm from '@/views/oms/components/OmsForm'

import Order from './franchiseesettle'
import dayjs from 'dayjs'
export default {
  name: 'FinFranchiseeSettleIndex',
  components: { OmsCompForm, Order, OmsForm },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detailFormShow: false,
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finFranchiseeSettle:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '结算单号', prop: 'franchiseeSettleNo', width: 260, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '结算日期', prop: 'settleDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '结算日期不能为空', trigger: 'change' }] },
        { title: '加盟商', prop: 'settleOrgId', width: 200, show: true, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '结算金额', prop: 'settleAmount', tipMsg: '结算金额(本次结算金额合计) + 折扣金额 = 费用金额 + 业务金额', width: 100, designSemi: (form) => { this.settleFormSemi(form, 'settleAmount', 'sumDiscountAmount') }, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '折扣金额', prop: 'sumDiscountAmount', tipMsg: '结算金额 + 折扣金额 = 费用金额 + 业务金额', width: 100, designSemi: (form) => { this.settleFormSemi(form, 'sumDiscountAmount', 'settleAmount') }, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ min: 0, type: 'number', transform: v => Number(v), message: '折扣总金额不能小于0', trigger: 'change' }] },
        { title: '费用金额', prop: 'sumFeeAmount', tipMsg: '费用单的本次结算金额合计', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount_by_condition, arg: ['settleAmount', { orderType: ['1'] }], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '业务金额', prop: 'sumSettleAmount', tipMsg: '配送单和门店退货单本次结算金额合计', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount_by_condition, arg: ['settleAmount', { orderType: ['2', '5'] }], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, readonly: true, defaultValue: '1', type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '已收款金额', prop: 'received', width: 120, show: true, type: 'PRICE_AUTOMATIC', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '未收款金额', prop: 'notPaid', width: 120, show: true, type: 'PRICE_AUTOMATIC', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '已开票金额', prop: 'invoicedAmount', width: 120, show: true, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '未开票金额', prop: 'uninvoicedAmount', width: 120, show: true, type: 'PRICE', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '付款方式', prop: 'payMode', width: 150, show: true, type: 'select', selectData: 'pay_mode', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '现金银行', prop: 'cashBank', width: 150, show: true, type: 'select', selectData: 'bank', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '开户银行', prop: 'openBank', width: 150, show: true, type: 'select', selectData: 'bank', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '银行账户', prop: 'bankAccount', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '加盟商结算单号', prop: 'franchiseeSettleNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '单据类型', prop: 'orderType', readonly: false, disabledBindValue: 'orderNo', show: false, type: 'select', selectData: 'order_type', selectDataFilter: ['1', '2', '5'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单据号', prop: 'orderNo', tableWidth: 300, show: false, click: 'addItems', windowName: { '1': 'FinFranchiseeFeeIndex', '2': 'SendDeliveryIndex', '5': 'SendRejectIndex' }, typeTitleName: '单据类型', typeName: 'orderType', formProData: { settleOrgId: '', auditStatus: '3', settleState: '0', reviewer: 0, creatorName: 0, goodsName: 0, driverName: 0, plateNumber: 0 }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '配送日期', prop: 'deliveryDate', defaultValue: '', readonly: true, show: false, type: 'date', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '应结金额', prop: 'receivable', show: false, defaultValue: '', readonly: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '已结金额', prop: 'received', show: false, defaultValue: '', readonly: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '未结金额', prop: 'notPaid', defaultValue: '', show: false, readonly: true, type: 'PRICE', design: this.mixin_auto_pur_weight_diff, arg: ['receivable', 'received'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '本次结算金额', prop: 'settleAmount', tableWidth: 160, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', float: { minus: true },
          rule: [{ validator: this.settleAmountCheck, trigger: 'change' }] },
        // { title: '折扣金额', prop: 'discountAmount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
        // rule: [{ validator: this.settleAmountCheck, trigger: 'change' }] },
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
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'settleOrgId', 'readonly', n.some(item => item.orderNo))
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
          this.$refs.Comp.$refs.Comp.$refs.Form.changeValue('settleAmount', 'sumDiscountAmount', this.Mixin_tabDate.map(item => item.settleAmount || '0').reduce((c, p) => this.DECIMAL.add(c, p).toNumber(), 0))
          this.$refs.Comp.$refs.Comp.$refs.Form.changeValue('sumDiscountAmount', 'settlementAmount', this.Mixin_tabDate.map(item => item.discountAmount || '0').reduce((c, p) => this.DECIMAL.add(c, p).toNumber(), 0))
        }
      })
    },
    settleAmountCheck(rule, value, callback) {
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      const thisPay = this.DECIMAL.add(this.Mixin_tabDate[index].settleAmount || '0', this.Mixin_tabDate[index].discountAmount || '0').toNumber()

      const pass = Number(this.Mixin_tabDate[index].notPaid)

      if (pass > 0 && pass < thisPay || pass < 0 && pass > thisPay) {
        callback(new Error('结算金额超出!'))
      } else {
        this.$refs.Comp.$refs.Comp.$refs.Table.$refs.Form.clearValidate(`details[${index}][settleAmount]`)
        this.$refs.Comp.$refs.Comp.$refs.Table.$refs.Form.clearValidate(`details[${index}][discountAmount]`)
        callback()
      }
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
    settleFormSemi(form, selfProp, prop) { // 金额变动半自动计算
      form[prop] = new this.DECIMAL(form.sumFeeAmount || '0').add(form.sumSettleAmount || '0').sub(form[selfProp] || '0').toNumber()
      form[prop + 'Show'] = this.fen2yuan(form[prop])
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'settleOrgId', 'readonly', operateItem.prop !== 'insert')
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'franchiseeSettleNo': this.currentRow.franchiseeSettleNo }).then(res => {
          if (res.code === 200) {
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
        getSendNumber({ type: 'CW_JM_JS' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'OmsCompForm'
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
              item.franchiseeSettleNo = data.Req.franchiseeSettleNo
            })
          }
          data.franchiseeSettleReq = data.Req
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
              item.franchiseeSettleNo = data.Req.franchiseeSettleNo
            })
          }
          data.franchiseeSettleReq = data.Req
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
