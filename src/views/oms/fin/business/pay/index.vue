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
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @formChange="formChange"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review, getSupplierPrepay } from '@/api/oms/fin/pay'
import OmsCompForm from '@/views/oms/components/OmsCompForm'
import Order from './pay'
import dayjs from 'dayjs'
export default {
  name: 'FinPayIndex',
  components: { OmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const settlementCheck = (rule, value, callback) => { // 数量校验
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (!this.Mixin_tabDate[index].settlementAmount) {
        return callback(new Error('不能为空或0'))
      }
      if (Number(this.Mixin_tabDate[index].notPayAmount) < 0) {
        callback(new Error('不能大于应付金额'))
      } else {
        callback()
      }
    }
    const invalidchargeBank = (rule, value, callback) => { // 数量校验
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (form.payMode === '2' && !value) {
        return callback(new Error('不能为空'))
      } else {
        callback()
      }
    }
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'SupplierSettleIndex', formProData: { supplier: '', auditStatus: '3', ifPaid: true }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finPayOrder:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '付款单号', prop: 'orderNo', width: 230, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '付款日期', prop: 'payDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '付款日期不能为空', trigger: 'change' }] },
        // { title: '供应商', prop: 'supplier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '供应商', prop: 'supplier', disabled: false, show: true, click: 'addItems', width: 200, windowName: 'SupplierIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '供应商不能为空', trigger: 'change' }] },
        { title: '应付金额', prop: 'totalAmount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['settlementAmount'], width: 150, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '预付冲低', prop: 'prepayAmount', defaultValue: '0', width: 150, show: false, type: 'PRICE_ADVANCE', float: { max: 0, decimal: 2 }, AdvanceShow: '', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '付款金额', prop: 'payAmount', tipMsg: '应付金额 — 预付冲低', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_form_diff, arg: ['totalAmount', 'prepayAmount'], width: 150, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ min: 0, type: 'number', transform: v => Number(v), message: '收款金额不能小于0', trigger: 'change' }] },
        { title: '付款方式', prop: 'payMode', show: true, width: 150, type: 'select', selectData: 'charge_mode', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '付款方式不能为空', trigger: 'change' }] },
        { title: '付款银行', prop: 'payBank', width: 200, show: true, type: 'select', selectData: 'bank', editShow: true, detailShow: true, addFatherProp: 'Req',
          fa_show: { payMode: '2' }, rule: [{ validator: invalidchargeBank, message: '收款银行不能为空', trigger: 'blur' }] },
        { title: '付款账户', prop: 'payAccount', width: 200, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req',
          fa_show: { payMode: '2' }, rule: [{ validator: invalidchargeBank, message: '收款银行不能为空', trigger: 'blur' }] },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', defaultValue: '1', selectData: 'audit_status', editShow: true, readonly: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '付款单号', prop: 'orderNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '结算单号', prop: 'settlementOrderNo', show: false, tableWidth: 300, click: 'addItems', windowName: 'SupplierSettleIndex', formProData: { supplier: '', auditStatus: '3', ifPaid: true }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '应付金额', prop: 'payableAmount', readonly: true, defaultValue: 0, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '已付金额(缓存)', prop: 'paidAmountTemp', readonly: true, defaultValue: 0, show: false, tableHidden: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '已付金额', prop: 'paidAmount', readonly: true, defaultValue: 0, show: false, type: 'PRICE_AUTOMATIC', design: (arg1, arg2) => this.DECIMAL.add(arg1, arg2).toNumber(), arg: ['settlementAmount', 'paidAmountTemp'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '未付金额', prop: 'notPayAmount', readonly: true, defaultValue: 0, show: false, type: 'PRICE_AUTOMATIC', design: (arg1, arg2) => this.DECIMAL.sub(arg1, arg2).toNumber(), arg: ['payableAmount', 'paidAmount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '本次付款金额', prop: 'settlementAmount', defaultValue: 0, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: settlementCheck, trigger: 'change' }] },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: [], // 详细数据
      temp_franchisee: null
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
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'supplier', 'disabled', n.some(item => item.settlementOrderNo !== ''))
      },
      deep: true,
      immediate: true
    }
  },
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
    formChange(e) {
      this.mixin_form = e
      console.log('表单数据变化触发!')
      if (this.operateItem.prop === 'insert' &&
        e.supplierId &&
        this.temp_franchisee !== this.$json_copy(e.supplierId) // 函数控制单个字段监听！！
      ) {
        getSupplierPrepay({ supplierId: e.supplierId }).then(res => {
          this.mixin_arr_edit_by_prop(this.table_data_arr, 'prepayAmount', 'AdvanceShow', res.data)
        })
      }
      if (e.supplierId) {
        this.temp_franchisee = this.$json_copy(e.supplierId)
      } else {
        this.temp_franchisee = ''
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'prepayAmount', 'AdvanceShow', 0)
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'supplier', 'disabled', operateItem.prop !== 'insert')
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        Promise.all([getDetails({ 'orderNo': this.currentRow.orderNo }), getSupplierPrepay({ supplierId: this.currentRow.supplierId })])
          .then(res => {
            if (res[0].code === 200 && res[1].code === 200) {
              res[0].data.map(item => {
                item.paidAmountTemp = item.payableAmount - item.notPayAmount - item.settlementAmount
              })
              this.details = res[0].data
              // this.formShow = true
              this.mixin_arr_edit_by_prop(this.table_data_arr, 'prepayAmount', 'AdvanceShow', res[1].data)
              this.currentComponent = 'OmsCompForm'
              operateItem.loading = false
            } else {
              this.$message.error('获取失败')
              operateItem.loading = false
            }
          })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ type: 'CW_FK' }).then(res => {
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
              item.orderNo = data.Req.orderNo
            })
          }
          data.payOrderReq = data.Req
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
              item.orderNo = data.Req.orderNo
            })
          }
          data.payOrderReq = data.Req
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
