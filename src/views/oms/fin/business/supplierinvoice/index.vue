<template>
  <div>
    <keep-alive :max="2" exclude="OmsInvoiceCompForm">
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
        :settle-details="settleDetails"
        :show="formShow"
        :summary="true"
        :add_arr="[]"
        :form-bottons="form_bottons"
        :show_by_id="true"
        @totalChange="tableSettleTotal=$event"
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
        @settleSelected="mixin_arr_edit_by_prop(table_data_arr, 'supplier', 'disabled',$event)"
      />
    </keep-alive>
  </div>
</template>

<script>
// uninvoicedAmount
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, getSendNumber, review } from '@/api/oms/fin/supplierinvoice'
import OmsForm from '@/views/oms/components/OmsInvoiceCompForm'
import Order from './supplierinvoice'
import dayjs from 'dayjs'
export default {
  name: 'SupplierInvoiceIndex',
  components: { OmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const checkTotalAmount = async(rule, value, callback) => { // 总金额检验
      if (value !== this.tableSettleTotal) {
        return callback(new Error('结算单开票总金额与开票总额不符'))
      }
      if (!value) {
        return callback(new Error('开票总额不能为空或0'))
      }
      callback()
    }
    const autoUninvoiced = (arg1, arg2, arg3) => {
      return arg1 - arg2 - arg3
    }
    const thisInvoicedAmountCheck = (rule, value, callback) => { // 金额计算校验
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      const formArr = this.$refs.Comp.$refs.Comp.$refs.settleTable.form.details
      if (this.operateItem.prop === 'insert' && value > formArr[index].uninvoicedAmount) {
        callback(new Error('大于未开票金额'))
      } else if (this.operateItem.prop === 'edit' && value > (Number(formArr[index].uninvoicedAmount) + Number(formArr[index].invoicedAmountTemp))) {
        callback(new Error('未开票金额不能为负'))
      } else {
        callback()
      }
    }
    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finSupplierInvoice:update:review'] }
      ],
      tableSettleTotal: 0, // 结算开票总额
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收票单号', prop: 'invoiceNo', width: 230, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '收票日期', prop: 'invoiceDate', show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '开票日期不能为空', trigger: 'change' }] },
        { title: '供应商', prop: 'supplier', show: true, click: 'addItems', width: 200, windowName: 'SupplierIndex', disabled: true, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '供应商不能为空', trigger: 'change' }] },
        { title: '收票金额', width: 150, prop: 'invoiceTotalAmount', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['total'], editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true,
          rule: [{ validator: checkTotalAmount, trigger: 'change' }] },
        { title: '收票数量', prop: 'invoiceCount', show: false, type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_tab_length, editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '单据类型', prop: 'orderType', readonly: false, disabledBindValue: 'orderNo', show: false, type: 'select', selectData: 'order_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', width: 100, prop: 'auditStatus', show: true, type: 'selectState', selectData: 'audit_status', readonly: true, defaultValue: '1', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', width: 150, prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', width: 160, prop: 'createTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', width: 150, prop: 'reviewer', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', width: 160, prop: 'reviewerTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', width: 150, prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', width: 160, prop: 'updateTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        // 结算单
        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, tableHidden: true, detailShow: false, addFatherProp: 'settle' },
        { title: '供应商结算单号', prop: 'supplierSettlementNo', width: 300, tableWidth: 300, show: false, type: 'selectFromPage', windowName: 'SupplierInvioceSelectIndex', click: 'addItems', formProData: { supplier: '' }, editShow: true, detailShow: true, addFatherProp: 'settle',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '应开票金额', summary: true, prop: 'settlementAmount', show: false, type: 'PRICE', editShow: true, readonly: true, detailShow: true, addFatherProp: 'settle' },
        { title: '已开票金额(缓存)', summary: true, prop: 'invoicedAmountTemp', tableHidden: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'settle' },
        { title: '已开票金额', summary: true, prop: 'invoicedAmount', show: false, type: 'PRICE', readonly: true, design: (e1, e2) => e1 + e2, arg: ['thisInvoicedAmount', 'invoicedAmountTemp'], editShow: true, detailShow: true, addFatherProp: 'settle' },
        { title: '未开票金额', summary: true, prop: 'uninvoicedAmount', show: false, type: 'PRICE', readonly: true, editShow: true, design: autoUninvoiced, arg: ['settlementAmount', 'invoicedAmountTemp', 'thisInvoicedAmount'], detailShow: true, addFatherProp: 'settle' },
        { title: '本次发票金额', summary: true, width: 180, prop: 'thisInvoicedAmount', show: false, readonly: false, placeholder: '请填写', type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'settle',
          rule: [{ validator: thisInvoicedAmountCheck, trigger: 'change' }] },
        // { title: '备注', width: 180, prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'settle' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '单据号', prop: 'invoiceNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '发票代码', prop: 'invoiceCode', show: false, placeholder: '请输入', type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '发票号', prop: 'invoiceNumber', placeholder: '请输入', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '金额', summary: true, placeholder: '请输入', prop: 'amount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '税额', summary: true, placeholder: '请输入', prop: 'tax', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '合计', summary: true, placeholder: '系统计算', prop: 'total', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_add_amount, arg: ['amount', 'tax'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', placeholder: '请输入', tableWidth: 300, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      settleDetails: [], // 结算单数据
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'OmsForm')
      return this.currentComponent === 'OmsForm'
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
    comp_member_price_max(row) { // 最大值函数
      return row.uninvoicedAmount / 100
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'supplier', 'disabled', operateItem.prop !== 'insert')
      // [2].readonly = false
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'invoiceNo': this.currentRow.invoiceNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data.detailResList
            res.data.settlementResList.map(item => {
              item.invoicedAmountTemp = item.thisInvoicedAmount
            })
            this.settleDetails = res.data.settlementResList
            this.currentComponent = 'OmsForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        }).finally(() => {
          operateItem.loading = false
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.settleDetails = []
        this.details = []
        getSendNumber({ type: 'CW_SP' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'OmsForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }, deleteDetails = []) { // 提交回调处理
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
          // data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.invoiceNo = data.Req.invoiceNo
            })
          }
          data.orgId = this.$store.getters.orgId
          data.supplierInvoiceReq = data.Req
          delete data.Req
          data.Settle.map(item => {
            item.invoicedAmount = item.invoicedAmount + item.thisInvoicedAmount
            item.uninvoicedAmount = item.settlementAmount - item.invoicedAmount
          })
          data.settleReqs = data.Settle
          delete data.Settle
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
              item.invoiceNo = data.Req.invoiceNo
            })
          }
          data.orgId = this.$store.getters.orgId
          data.supplierInvoiceReq = data.Req
          delete data.Req
          data.Settle.map(item => {
            item.invoicedAmount = item.invoicedAmount - item.invoicedAmountTemp + item.thisInvoicedAmount
            item.uninvoicedAmount = item.settlementAmount - item.invoicedAmount
          })
          data.settleReqs = data.Settle
          delete data.Settle
          data.detailDeleteIds = deleteDetails
          data.supplierSettlementDeleteNos = data.settleDeleteNos
          delete data.settleDeleteNos
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
    deleteDetail(item) { // 删除细节
      return new Promise(resolve => {
        this.$confirm(`确认删除所选单据吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resolve(true)
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
