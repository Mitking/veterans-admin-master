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
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        :edit-detail-some-disable="table_add_disable"
        @tabDateChange="Mixin_tabDate=$event"
        @generateFunction="generateFunction"
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
const dayjs = require('dayjs')
import MixinGlobal from '@/components/MixinGlobal'
import {
  getDetails,
  addOrder,
  updateOrder,
  deleteDetails,
  getStoNumber,
  review
} from '@/api/wms/stockorder'
import { addOrder as generateAddOrder } from '@/api/wms/stockreport'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './stockorder'
export default {
  name: 'StockOrderIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      if (rule.field === 'count' && this.$refs.Comp.$refs.Comp.$refs.Form.form) {
        const form = this.$refs.Comp.$refs.Comp.$refs.Form.form

        if (form.whetherCount && !form.count) {
          return callback(new Error('个数必填'))
        } else {
          return callback()
        }
      }
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.Mixin_tabDate[index].whetherCount && this.Mixin_tabDate[index].count === '') {
        callback(new Error('个数必填'))
      } else {
        callback()
      }
    }
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { orgId: 0, storeId: '', stockId: '' }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:stoInvOrder:update:review'] }
      ],
      table_add_disable: true, // 是够可以新增删除详情品
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '盘点单号', prop: 'stoInvNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '盘点任务单号', prop: 'stoInvTaskOrder', width: 260, show: true, type: 'text', defaultValue: null, editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '盘点日期', prop: 'invTime', width: 150, show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, outTabHidden: true, detailShow: false, addFatherProp: 'Req' },
        { title: '盘点门店', prop: 'storeId', width: 200, readonly: [1].includes(this.$store.getters.accountType), show: true, type: 'select', selectData: 'stores', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : '', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '盘点仓库', prop: 'stockId', width: 200, show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '仓库不能为空', trigger: 'change' }] },
        { title: '盘点范围', formItemWidth: 120, prop: 'invRange', width: 150, show: true, defaultValue: '2', readonly: true, type: 'select', selectData: 'inv_range', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '盘点范围不能为空', trigger: 'change' }] },
        { title: '总金额', prop: 'amount', width: 100, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 100, defaultValue: '1', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '自动生成', prop: 'autoGenerate', width: 120, type: 'if_type', show: true, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '制单人', prop: 'creatorName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '制单时间', prop: 'createTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核人', prop: 'reviewer', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核时间', prop: 'reviewerTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '附加备注', prop: 'attachRemark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '盘点单号', prop: 'stoInvNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, click: 'addItems', windowName: 'StoreProductIndex', formProData: { orgId: 0, storeId: '', stockId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, click: 'addItems', windowName: 'StoreProductIndex', formProData: { orgId: 0, storeId: '', stockId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, type: 'text', placeholder: '-', editShow: true, detailShow: true, readonly: true, addFatherProp: 'detailReqs' },
        { title: '成本价(隐藏)', prop: 'costPrice', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', realProp: 'costPrice', type: 'COST_PRICE', show: false, placeholder: '不可修改', defaultValue: '-', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '数量', prop: 'number', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'number'], placeholder: '系统计算', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', tableHidden: true, show: false, type: 'if_type', editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '个数', prop: 'count', show: false, type: 'number', float: { decimal: 0 }, placeholder: '计数品必填', editShow: true, detailShow: true, addFatherProp: 'detailReqs', disabledFn: (row) => !row.whetherCount,
          rule: [{ validator: countCheck, trigger: 'change' }] },
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
  watch: {
    'Mixin_tabDate': {
      handler(n) {
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', n.some(item => item.goodsCode !== ''))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', (n.some(item => item.goodsCode !== '') || [1].includes(this.$store.getters.accountType)))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'stockId', 'readonly', (n.some(item => item.goodsCode !== '') || [1].includes(this.$store.getters.accountType)))
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
    async generateFunction(e, opItem) {
      opItem.loading = true
      const { code, data } = await getDetails({ 'stoInvNo': this.currentRow.stoInvNo })
      const { code: code0, data: data0 } = await getStoNumber({ stoType: 'CC_PDBG' })
      if (code === 200 && code0 === 200) {
        const invReportReq = {
          'id': null,
          'stoInvReportNo': data0,
          'stoInvNo': this.currentRow.stoInvNo,
          'storeId': this.currentRow.storeId,
          'stockId': this.currentRow.stockId,
          'invRange': this.currentRow.invRange,
          'amount': '',
          'invTime': dayjs().format('YYYY-MM-DD'),
          'remark': '',
          'attachRemark': '',
          'autoGenerate': true
        }

        data.map(item => { item.id = null; item.stoInvReportNo = data0 })
        const res = await generateAddOrder({ detailReqs: data, invReportReq: invReportReq })
        this.message(res)
        opItem.loading = false
      } else {
        this.$message.error('网络错误，请重试')
        opItem.loading = false
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      this.table_add_disable = !(operateItem.prop === 'insert' || (!this.currentRow.stoInvTaskOrder))
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'stoInvTaskOrder', 'editShow', operateItem.prop !== 'insert' && this.currentRow.autoGenerate)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', [1].includes(this.$store.getters.accountType))
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsCode', 'readonly', !!this.currentRow.stoInvTaskOrder)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsName', 'readonly', !!this.currentRow.stoInvTaskOrder)
        getDetails({ 'stoInvNo': this.currentRow.stoInvNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            // this.formShow = true
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsCode', 'readonly', false)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsName', 'readonly', false)
        this.details = []
        getStoNumber({ stoType: 'CC_PD' }).then(res => {
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
              item.stoInvNo = data.Req.stoInvNo
            })
          }
          data.invOrderReq = data.Req
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
              item.stoInvNo = data.Req.stoInvNo
            })
          }
          data.invOrderReq = data.Req
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
        this.$confirm(`此操作将永久删除单号「${item.stoInvNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
