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
        @formChange="formData=$event"
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
import { addOrSaveOrder, orderReviewer, orderNo, getDetails } from '@/api/tob/whssettlement'
import WmsForm from '@/views/toB/components/WmsCompForm'
import Order from './settlement'
import dayjs from 'dayjs'
export default {
  name: 'WhsSettlementIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const check_amount = (rule, value, callback) => { // 金额空值检验
      if (Number(value) < 0) {
        callback(new Error('结算金额不能为负数'))
      } else {
        callback()
      }
    }
    return {
      formData: { relevantNo: '' },
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:consignmentShipment:update:review'] }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '结算单号', prop: 'settleOrderNo', show: true, type: 'text', editShow: true, detailShow: true, readonly: true, addFatherProp: 'Req' },
        { title: '结算日期', prop: 'settleDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '组织', prop: 'settleOrgId', show: true, tabHidden: true, defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', readonly: false, editShow: true, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, addFatherProp: 'Req', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '门店', prop: 'settleStoreId', propName: 'settleStoreName', show: true, type: 'select', defaultValue: this.$store.getters.storeId, width: 200, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, readonly: this.$store.getters.accountType === 1, editShow: true, detailShow: true, addFatherProp: 'Req', fatherPropName: 'orgId', fatherProp: 'settleOrgId',
          rule: [{ required: true, message: '结算门店不能为空', trigger: 'change' }] },
        { title: '批发商', width: 150, prop: 'whsId', propFromPageName: 'whsName', formProData: { typeName: '批发商' }, show: true, click: 'addItems', windowName: 'Customer', type: 'selectFromPage', editShow: true, detailShow: true, readonly: false, addFatherProp: 'Req',
          rule: [{ required: true, message: '批发商不能为空', trigger: 'change' }] },
        { title: '结算金额', prop: 'settleAmount', width: 120, show: true, type: 'PRICE_FORM_AUTOMATIC', design: this.mixin_auto_whs_settle_amount, arg: ['saleAmount', 'refundTotalAmount', 'costAmount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: check_amount, trigger: 'change' }] },
        { title: '销售金额', prop: 'saleAmount', tabHidden: true, width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['whsSaleAmount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '退货金额', prop: 'refundTotalAmount', tabHidden: true, width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['refundTotalAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '折扣金额', prop: 'costAmount', tabHidden: true, show: true, type: 'PRICE', defaultValue: '0', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '支付方式', prop: 'settleType', tabHidden: true, show: true, type: 'select', selectData: 'whs_settle_type', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '支付方式不能为空', trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatu', width: 120, show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '销售单号Id(隐藏)', prop: 'whsSaleOrderId', show: false, type: 'text', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '销售单号', prop: 'whsSaleOrderNo', show: false, tabWidth: 300, placeholder: '请选择', click: 'addItems', windowName: 'WhsSaleIndex', formProData: { whsId: '', settleState: false, settleOrgId: '', settleStoreId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '销售单金额', prop: 'whsSaleAmount', show: false, type: 'PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退款总金额', prop: 'refundTotalAmount', show: false, type: 'PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsForm')
      return this.currentComponent === 'WmsForm'
    }
  },
  watch: {
    // 'formData': {
    //   handler(n) {
    //     this.mixin_arr_edit_by_prop(this.table_data_arr, 'personId', 'readonly', !!n.relevantNo.length)
    //   },
    //   deep: true,
    //   immediate: true
    // }
    'Mixin_tabDate': {
      handler(n) {
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'settleOrgId', 'readonly', n.some(item => item.whsSaleOrderNo !== ''))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'settleStoreId', 'readonly', n.some(item => item.whsSaleOrderNo !== '') || this.$store.getters.accountType === 1)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'whsId', 'readonly', n.some(item => item.whsSaleOrderNo !== ''))
      },
      deep: true,
      immediate: true
    }
  },
  created() {},
  methods: {
    transformvalFn(selected, n, un_select) {
      return this.MergeArray(selected, n.map(item => item.id)).filter(itemF => !un_select.map((u) => u.id).includes(itemF))
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
        getDetails({ 'id': this.currentRow.id }).then(res => {
          if (res.code === 200) {
            this.details = res.data.details
            delete res.data.details
            res.data.settleType = res.data.settleType.toString()
            this.currentRow = Object.assign(this.currentRow, res.data)
            this.currentComponent = 'WmsForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        }).finally(() => {
          operateItem.loading = false
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        orderNo().then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsForm'
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
        case 'review': // 审核
          this.review()
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.settleOrderNo = data.Req.settleOrderNo
            })
          }
          data = Object.assign(data, data.Req)
          delete data.Req
          data.details = data.detailReqs
          delete data.detailReqs
          data.deleteIds = []

          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addOrSaveOrder(data).then(res => {
                this.review(res.data, true)
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
          addOrSaveOrder(data).then(res => {
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          console.log(data)
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.settleOrderNo = data.Req.settleOrderNo
              item.settleOrderId = data.Req.id
            })
          }
          data = Object.assign(data, data.Req)
          delete data.Req
          data.details = data.detailReqs
          delete data.detailReqs
          data.deleteIds = deleteDetails
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
    changeComputed(row) {
      row.amount = this.DECIMAL(row.consignmentPrice || '0').mul(row.consignmentQuantity || '0').mul('0.001')
      row.amountShow = this.fen2yuan(row.amount)
    },
    changeDiffNumFcurs(row) {
      if (!row.goodsName) {
        return this.$message.info('请先选择商品')
      }
      if (!row.amount || !row.consignmentPrice) {
        return
      }
      row.consignmentQuantity = this.DECIMAL(row.amount).div(row.consignmentPrice).mul('1000').toNumber().toFixed(0)
      row.consignmentQuantityWeightShow = this.g2kg(row.consignmentQuantity)
    },
    review(id, isSure = false) { // 审核
      if (!isSure) {
        this.$confirm(`确认审核吗?`, '提示', {
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
      orderReviewer({ 'ids': [id || this.currentRow.id], auditStatu: '3' }).then(res => {
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('settleOrderNo', this.table_data_arr)}「${this.currentRow.settleOrderNo}」中的「${item.whsSaleOrderNo}」, 是否继续?`, '提示', {
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
