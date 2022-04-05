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
        :add_arr="[]"
        :detail_table_buttons="[]"
        :form-bottons="form_bottons"
        :edit-detail-some-disable="true"
        @tabDateChange="Mixin_tabDate=$event"
        @deleteDetail="deleteDetail"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrSaveOrder, review, orderNo } from '@/api/wms/purrefund'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './refund'
import dayjs from 'dayjs'
export default {
  name: 'RefundIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'ProductIndex' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:refund:order:reviewer'] }
      ],
      selectForm: false,
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      tabDate: [],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '退款单号', prop: 'refundOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '差异单号', prop: 'diffOrderNo', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', tabWidth: 300, readonly: true },
        { title: '退款日期', prop: 'refundDate', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货门店', prop: 'storeId', width: 200, readonly: true, show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货仓库', prop: 'stockId', width: 200, readonly: true, show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '采购员', prop: 'purPersionName', width: 160, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '总金额', prop: 'money', width: 160, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['refundMoney'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '自动生成', prop: 'autoGenerate', width: 100, show: true, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatu', width: 100, show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        // { title: '应退总额', prop: 'money', width: 160, show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '采购员ID', prop: 'purPersonId', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '采购单号', prop: 'purOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '采购单位', prop: 'purUnit', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '采购单位名称', prop: 'purUnitName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req', readonly: true },
        // { title: '操作人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商名', prop: 'supplierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商ID', prop: 'supplierId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '退款单号', prop: 'refundOrderNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '差异单号', prop: 'diffOrderNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tabWidth: 300, readonly: true },
        { title: '商品代码', prop: 'goodsCode', show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        // { title: '采购数量', prop: 'purNumQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        // { title: '采购个数', prop: 'purNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        // { title: '采购件数', prop: 'purPiecesNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '差异单数量', prop: 'diffNumQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '单价', prop: 'price', show: false, type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '金额', prop: 'refundMoney', show: false, type: 'PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '已退金额', prop: 'refundedAmount', show: false, type: 'PRICE', placeholder: '手动录入', float: { decimal: 2 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '未退金额', prop: 'notRefundedAmount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_pur_weight_diff, arg: ['refundMoney', 'refundedAmount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '供应商', prop: 'supplierName', show: false, click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '供应商', prop: 'supplierId', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true, readonly: true },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
        // { title: '抽检码', prop: 'randomInspectionCode', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        // { title: '商品ID', prop: 'productId', show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
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
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        // getDetails({ 'refundOrderNo': this.currentRow.refundOrderNo }).then(res => {
        //   if (res.code === 200) {
        this.details = this.currentRow.details
        // this.formShow = true
        this.currentComponent = 'WmsCompForm'
        operateItem.loading = false
        // } else {
        //   this.$message.error('获取失败')
        //   operateItem.loading = false
        // }
        // })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        orderNo({ type: 'CGTK' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }, deleteDetails) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情关闭
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
              item.refundOrderNo = data.Req.refundOrderNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteDetails = []

          addOrSaveOrder(data).then(res => {
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
        case 'edit': // 修改
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.refundOrderNo = data.Req.refundOrderNo
            })
          }

          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data.Req, data)
          delete data.Req
          // delete data.detailReqs
          data.deleteDetails = deleteDetails

          addOrSaveOrder(data).then(res => {
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('refundOrderNo', this.table_data_arr)}「${item.refundOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
