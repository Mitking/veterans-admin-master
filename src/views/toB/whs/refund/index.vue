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
import { addOrSaveOrder, orderReviewer, orderNo, getDetails } from '@/api/tob/whsrefund'
import WmsForm from '@/views/toB/components/WmsCompForm'
import Order from './refund'
import dayjs from 'dayjs'
export default {
  name: 'WhsRefundIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.Mixin_tabDate[index].whetherCount && !this.Mixin_tabDate[index].whsRefundCnt) {
        callback(new Error('个数必填'))
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
        { title: '审核', prop: 'review', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:consignmentShipment:update:review'] }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '退款单号', prop: 'whsRefundOrderNo', show: true, type: 'text', editShow: true, detailShow: true, readonly: true, addFatherProp: 'Req' },
        { title: 'whsOrderId(隐藏)', prop: 'whsOrderId', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '退款日期', prop: 'whsRefundDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '组织', prop: 'whsOrgId', show: true, tabHidden: true, defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', readonly: false, editShow: true, tableHidden: true, addFatherProp: 'Req', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '退款门店', prop: 'whsRefundStoreId', propName: 'whsRefundStoreName', show: true, tableHidden: true, type: 'select', defaultValue: this.$store.getters.storeId, width: 200, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, readonly: this.$store.getters.accountType === 1, editShow: true, detailShow: true, addFatherProp: 'Req', fatherPropName: 'orgId', fatherProp: 'whsOrgId',
          rule: [{ required: true, message: '退款门店不能为空', trigger: 'change' }] },
        { title: '退款仓库', prop: 'whsRefundStorageId', propName: 'whsRefundStorageName', show: true, tableHidden: true, type: 'select', width: 200, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, readonly: false, editShow: true, detailShow: true, addFatherProp: 'Req', fatherPropName: 'storeId', fatherProp: 'whsRefundStoreId',
          rule: [{ required: true, message: '退款仓库不能为空', trigger: 'change' }] },
        { title: '批发商', width: 150, formWidth: '20%', prop: 'whsId', readonly: false, propFromPageName: 'whsName', show: true, click: 'addItems', windowName: 'Customer', type: 'selectFromPage', formProData: { typeName: '批发商' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '批发商不能为空', trigger: 'change' }] },
        { title: '批发单号', prop: 'whsOrderNo', readonly: false, formWidth: '30%', propFromPageName: 'whsOrderNo', show: true, tabHidden: true, click: 'addItems', windowName: 'WhsSaleIndex', formProData: { whsId: '', auditStatu: '3', settleState: false }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '出货单号不能为空', trigger: 'change' }] },
        { title: '退货金额', prop: 'totalAmount', width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['whsRefundAmount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', width: 160, selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品ID(隐藏)', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否称重(隐藏)', prop: 'whetherCount', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', show: false, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { whsOrderId: '', stopSale: 0, whsRefundStoreId: '', whsRefundStorageId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { whsOrderId: '', stopSale: 0, whsRefundStoreId: '', whsRefundStorageId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, tabWidth: 120, addFatherProp: 'detailReqs' },
        { title: '单位', prop: 'unitId', show: false, tabWidth: 100, type: 'select', selectData: 'weight_type', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退款单价', prop: 'whsRefundPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为0', trigger: 'change' }] },
        { title: '退款数量', prop: 'whsRefundNumber', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为0', trigger: 'change' }] },
        { title: '金额', prop: 'whsRefundAmount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['whsRefundPrice', 'whsRefundNumber'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '个数', prop: 'whsRefundCnt', show: false, placeholder: '计数商品必填', type: 'Number', fn_disabled: (row) => !row.whetherCount, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: countCheck, trigger: 'change' }] },
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
        // this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', n.some(item => item.goodsCode !== ''))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'whsId', 'readonly', n.some(item => item.goodsCode !== ''))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'whsOrderNo', 'readonly', n.some(item => item.goodsCode !== ''))
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
      if (typeof this.currentRow.relevantNo === 'string') {
        this.currentRow.relevantNo = this.currentRow.relevantNo ? this.currentRow.relevantNo.split(',') : []
      }

      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'id': this.currentRow.id }).then(res => {
          if (res.code === 200) {
            this.details = res.data.details
            delete res.data.details
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
            // let amountTemp = 0
            data.detailReqs.map(item => {
              item.id = null
              item.whsRefundOrderNo = data.Req.whsRefundOrderNo
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
              item.whsRefundOrderNo = data.Req.whsRefundOrderNo
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('whsRefundOrderNo', this.table_data_arr)}「${this.currentRow.whsRefundOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
