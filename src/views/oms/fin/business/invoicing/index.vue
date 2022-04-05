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
        @settleSelected="mixin_arr_edit_by_prop(table_data_arr, 'settleOrgId', 'readonly',$event)"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, getSendNumber, review } from '@/api/oms/fin/invoicing'
import OmsForm from '@/views/oms/components/OmsInvoiceCompForm'
import Order from './invoicing'
import dayjs from 'dayjs'
export default {
  name: 'FinInvoicingIndex',
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
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finInvoicing:update:review'] }
      ],
      tableSettleTotal: 0, // 结算单开票总额
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      // max
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '开票单号', prop: 'invoicingNo', width: 230, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '开票日期', prop: 'openDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '开票日期不能为空', trigger: 'change' }] },
        { title: '加盟商', prop: 'settleOrgId', show: true, type: 'select', defaultValue: '', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: false,
          rule: [{ required: true, message: '加盟商不能为空', trigger: 'change' }] },
        { title: '开票金额', prop: 'invoicingTotalAmount', width: 150, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['total'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: checkTotalAmount, trigger: 'change' }] },
        { title: '开票数量', prop: 'invoicingCount', show: false, type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_tab_length, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', defaultValue: '1', selectData: 'audit_status', editShow: true, readonly: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '单据类型', prop: 'orderType', readonly: false, disabledBindValue: 'orderNo', show: true, type: 'select', selectData: 'order_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        // 结算单
        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, tableHidden: true, detailShow: false, addFatherProp: 'settle' },
        { title: '加盟商结算单号', width: 300, tableWidth: 300, prop: 'franchiseeSettleNo', show: false, type: 'selectFromPage', click: 'addItems', windowName: 'InvioceSelectIndex', formProData: { settleOrgId: '' }, editShow: true, detailShow: true, addFatherProp: 'settle',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '应开票金额', summary: true, prop: 'settleAmount', show: false, type: 'PRICE', editShow: true, readonly: true, detailShow: true, addFatherProp: 'settle' },
        { title: '已开票金额(缓存)', summary: true, prop: 'invoicedAmountTemp', tableHidden: true, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'settle' },
        { title: '已开票金额', summary: true, prop: 'invoicedAmount', show: false, type: 'PRICE', readonly: true, design: (e1, e2) => e1 + e2, arg: ['thisInvoicedAmount', 'invoicedAmountTemp'], editShow: true, detailShow: true, addFatherProp: 'settle' },
        { title: '未开票金额', summary: true, prop: 'uninvoicedAmount', show: false, type: 'PRICE', readonly: true, editShow: true, design: autoUninvoiced, arg: ['settleAmount', 'invoicedAmountTemp', 'thisInvoicedAmount'], detailShow: true, addFatherProp: 'settle' },
        { title: '本次开票金额', summary: true, width: 200, prop: 'thisInvoicedAmount', show: false, placeholder: '请填写', readonly: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'settle',
          rule: [{ validator: thisInvoicedAmountCheck, trigger: 'change' }] },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '单据号', prop: 'invoicingNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '发票代码', prop: 'invoicingCode', show: false, placeholder: '请输入', type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '发票号', prop: 'invoiceNumber', show: false, placeholder: '请输入', type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '金额', summary: true, prop: 'amount', show: false, placeholder: '请输入', type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '税额', summary: true, prop: 'tax', show: false, placeholder: '请输入', type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '合计', summary: true, prop: 'total', show: false, placeholder: '系统计算', type: 'PRICE_AUTOMATIC', design: this.mixin_auto_add_amount, arg: ['amount', 'tax'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', tableWidth: 300, show: false, type: 'text', placeholder: '请输入', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      settleDetails: [], // 结算单数据
      details: [], // 详细数据
      delIds: [] // 详细数据
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
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'invoicingNo': this.currentRow.invoicingNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data.detailResList
            res.data.settleResList.map(item => { item.invoicedAmountTemp = item.thisInvoicedAmount })
            this.settleDetails = res.data.settleResList
            this.table_data_arr[2].readonly = true
            this.currentComponent = 'OmsForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.settleDetails = []
        this.details = []
        this.table_data_arr[2].readonly = false
        getSendNumber({ type: 'CW_KP' }).then(res => {
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
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.invoicingNo = data.Req.invoicingNo
            })
          }
          data.orgId = this.$store.getters.orgId
          data.invoicingReq = data.Req
          delete data.Req
          data.Settle.map(item => {
            item.invoicedAmount = item.invoicedAmount + item.thisInvoicedAmount
            item.uninvoicedAmount = item.settleAmount - item.invoicedAmount
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
              item.invoicingNo = data.Req.invoicingNo
            })
          }
          data.orgId = this.$store.getters.orgId
          data.invoicingReq = data.Req
          delete data.Req
          data.Settle.map(item => {
            item.invoicedAmount = item.invoicedAmount - item.invoicedAmountTemp + item.thisInvoicedAmount
            item.uninvoicedAmount = item.settleAmount - item.invoicedAmount
          })
          data.settleReqs = data.Settle
          delete data.Settle
          data.detailDeleteIds = deleteDetails
          data.franchiseeSettleDeleteNos = data.settleDeleteNos
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
