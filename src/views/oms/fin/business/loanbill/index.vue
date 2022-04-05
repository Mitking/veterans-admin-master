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
        :add_arr="$attrs.add_arr || []"
        :detail_table_buttons="detail_table_buttons"
        :detail_table_detail_buttons="detail_table_detail_buttons"
        :form-bottons="form_bottons"
        @tabDateChange="Mixin_tabDate=$event"
        @formChange="mixin_form=$event"
        @openModel="openModel"
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
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review } from '@/api/oms/fin/loanbill'
import OmsCompForm from '@/views/oms/components/OmsCompForm'
import Order from './loanbill'
import dayjs from 'dayjs'
export default {
  name: 'LoanBillIndex',
  components: { OmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '附件', show: true, prop: null, click: 'affix' }
      ],
      detail_table_detail_buttons: [
        { title: '附件', show: true, prop: null, click: 'affix' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finLoanBill:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '借款单号', prop: 'loanBillNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '借款日期', width: 150, prop: 'loanDate', show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '借款日期不能为空', trigger: 'change' }] },
        { title: '借款人', prop: 'loanPerson', width: 150, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '借款人ID', prop: 'loanPerson', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '借款人', width: 150, prop: 'loanPerson', formItemWidth: 150, propFromPageName: 'loanPersonName', show: false, type: 'selectFromPage', click: 'addItems', windowName: 'User', editShow: true, detailShow: false, addFatherProp: 'Req',
        //   rule: [{ required: true, message: '借款人不能为空', trigger: 'change' }] },
        // { title: '借款人', width: 150, prop: 'loanPersonName', show: true, type: 'text', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'Req' },
        { title: '借款金额', width: 100, prop: 'loanAmount', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['loanAmount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '借款金额不能为空', trigger: 'change' }] },
        { title: '付款方式', width: 150, prop: 'payMode', show: false, formItemWidth: 150, type: 'select', selectData: 'charge_mode', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '附件数', width: 150, prop: 'fileNumber', formItemWidth: 100, show: false, type: 'number', float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '事由', width: 200, prop: 'reason', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '审核状态', width: 100, prop: 'auditStatus', show: true, defaultValue: '1', type: 'select', readonly: true, selectData: 'audit_status', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '已付金额', width: 100, prop: 'paidAmount', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '未付金额', width: 100, prop: 'notPayAmount', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_form_diff, arg: ['loanAmount', 'paidAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '结款金额', width: 100, prop: 'settlementAmount', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['loanAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '还款金额', width: 100, prop: 'repaymentAmount', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_form_diff, arg: ['paidAmount', 'settlementAmount'], editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '制单人', width: 150, prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', width: 160, prop: 'createTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', width: 150, prop: 'reviewer', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', width: 160, prop: 'reviewerTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '借款单号', prop: 'loanBillNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '业务类型', prop: 'businessType', show: false, type: 'select', selectData: 'business_cate', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true,
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '费用名称', prop: 'feeType', show: false, tableWidth: 300, lastValue: 'businessType', type: 'FeeList', selectData: 'feeSelectListLast', selectOption: { label: 'feeName', value: 'sujectCode' }, fatherProp: 'businessType', fatherPropName: 'assoProjectList', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '借款用途', prop: 'purpose', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '参与人', prop: 'participant', show: false, type: 'text', propFromPageName: 'participant', click: 'addItems', windowName: 'User', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        // { title: '参与人', width: 150, prop: 'participant', show: true, type: 'text', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'Req' },
        // { title: '参与人ID', prop: 'participantId', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '参与人', prop: 'participant', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '借款金额', prop: 'loanAmount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', tableWidth: 300, show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
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
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'loanBillNo': this.currentRow.loanBillNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            // this.formShow = true
            this.currentComponent = 'OmsCompForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        getSendNumber({ type: 'CW_JK' }).then(res => {
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
              item.loanBillNo = data.Req.loanBillNo
            })
          }
          data.loanBillReq = data.Req
          data.files = data.Req.files
          data.fileDeleteIds = data.Req.fileDeleteIds
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
              item.loanBillNo = data.Req.loanBillNo
            })
          }
          data.loanBillReq = data.Req
          data.files = data.Req.files
          data.fileDeleteIds = data.Req.fileDeleteIds
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
