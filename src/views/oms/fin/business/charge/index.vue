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
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review, getTotalFranchiseePrePaid } from '@/api/oms/fin/charge'
import OmsCompForm from '@/views/oms/components/OmsCompForm'
import Order from './charge'
import dayjs from 'dayjs'
export default {
  name: 'FinChargeIndex',
  components: { OmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const settlementCheck = (rule, value, callback) => { // 数量校验
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (!this.Mixin_tabDate[index].settlementAmount) {
        return callback(new Error('不能为空或0'))
      }
      if (Number(this.Mixin_tabDate[index].notPaid) < 0) {
        callback(new Error('不能大于应付金额'))
      } else {
        callback()
      }
    }

    const invalidchargeBank = (rule, value, callback) => { // 数量校验
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (form.chargeMode === '2' && !value) {
        return callback(new Error('不能为空'))
      } else {
        callback()
      }
    }
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'FinFranchiseeSettleIndex', formProData: { franchiseeId: '', auditStatus: '3' }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finChargeSlip:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收款单号', prop: 'finChargeNo', width: 230, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '收款日期', prop: 'chargeDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '收款日期不能为空', trigger: 'blur' }] },
        { title: '加盟商', prop: 'franchiseeId', tipMsg: '被收款组织', width: 200, show: true, readonly: false, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: false, addFatherProp: 'Req',
          rule: [{ required: true, message: '加盟商不能为空', trigger: 'change' }] },
        { title: '应收金额', prop: 'sumAmount', width: 150, show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['settlementAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '预收冲抵', prop: 'advance', width: 150, show: false, defaultValue: '0', type: 'PRICE_ADVANCE', float: { max: 0, decimal: 2 }, AdvanceShow: '', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收款金额', prop: 'chargeAmount', tipMsg: '应收金额 — 预收冲抵', width: 150, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_form_diff, arg: ['sumAmount', 'advance'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ min: 0, type: 'number', transform: v => Number(v), message: '收款金额不能小于0', trigger: 'change' }] },
        { title: '收款方式', prop: 'chargeMode', width: 150, show: true, type: 'select', selectData: 'charge_mode', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '收款方式不能为空', trigger: 'blur' }] },
        { title: '收款银行', prop: 'chargeBank', width: 200, show: true, type: 'select', selectData: 'bank', editShow: true, detailShow: true, addFatherProp: 'Req',
          fa_show: { chargeMode: '2' }, rule: [{ validator: invalidchargeBank, message: '收款银行不能为空', trigger: 'blur' }] },
        { title: '收款账户', prop: 'chargeAccount', width: 200, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req',
          fa_show: { chargeMode: '2' }, rule: [{ validator: invalidchargeBank, message: '收款银行不能为空', trigger: 'blur' }] },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', defaultValue: '1', readonly: true, selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '收款单号', prop: 'finChargeNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '加盟商结算单号', prop: 'franchiseeSettlementNo', show: false, tableWidth: 300, click: 'addItems', windowName: 'FinFranchiseeSettleIndex', formProData: { franchiseeId: '', auditStatus: '3', ifChargeSlip: true }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '应收金额', prop: 'receivable', show: false, type: 'PRICE', readonly: true, defaultValue: 0, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '已收金额(缓存)', prop: 'receivedTemp', readonly: true, defaultValue: 0, show: false, tableHidden: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '已收金额', prop: 'received', show: false, type: 'PRICE_AUTOMATIC', design: (arg1, arg2) => this.DECIMAL.add(arg1, arg2).toNumber(), arg: ['settlementAmount', 'receivedTemp'], readonly: true, defaultValue: 0, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '未收金额', prop: 'notPaid', show: false, type: 'PRICE_AUTOMATIC', readonly: true, design: (arg1, arg2) => this.DECIMAL.sub(arg1, arg2).toNumber(), arg: ['receivable', 'received'], defaultValue: 0, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '本次收款金额', prop: 'settlementAmount', defaultValue: 0, show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: settlementCheck, trigger: 'change' }] },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      temp_franchisee: '',
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'OmsCompForm')
      return this.currentComponent === 'OmsCompForm'
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
    formChange(e) {
      this.mixin_form = e
      console.log('表单数据变化触发！')
      if (this.operateItem.prop === 'insert' &&
        e.franchiseeId &&
        this.temp_franchisee !== this.$json_copy(e.franchiseeId) // 函数控制单个字段监听！！
      ) {
        getTotalFranchiseePrePaid({ prepaidOrgId: e.franchiseeId }).then(res => {
          this.mixin_arr_edit_by_prop(this.table_data_arr, 'advance', 'AdvanceShow', res.data)
        })
      } else if (!this.temp_franchisee) {
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'advance', 'AdvanceShow', 0)
      }
      this.temp_franchisee = this.$json_copy(e.franchiseeId || '')
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'franchiseeId', 'readonly', operateItem.prop !== 'insert')
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        Promise.all([getDetails({ 'finChargeNo': this.currentRow.finChargeNo }), getTotalFranchiseePrePaid({ prepaidOrgId: this.currentRow.franchiseeId })])
          .then(res => {
            if (res[0].code === 200 && res[1].code === 200) {
              res[0].data.map(item => {
                item.receivedTemp = item.receivable - item.notPaid - item.settlementAmount
              })
              this.details = res[0].data
              this.mixin_arr_edit_by_prop(this.table_data_arr, 'advance', 'AdvanceShow', res[1].data)
              this.currentComponent = 'OmsCompForm'
              operateItem.loading = false
            } else {
              this.$message.error('获取失败')
              operateItem.loading = false
            }
          })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'advance', 'AdvanceShow', 0)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'advance', 'float', { max: 0, decimal: 2 })
        getSendNumber({ type: 'CW_SK' })
          .then(res => {
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
              item.finChargeNo = data.Req.finChargeNo
            })
          }
          data.chargeSlipReq = data.Req
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
              item.finChargeNo = data.Req.finChargeNo
            })
          }
          data.chargeSlipReq = data.Req
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
        this.$confirm(`此操作将永久删除单号「${item.finChargeNo}」中的项目, 是否继续?`, '提示', {
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
