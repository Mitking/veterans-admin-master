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
import { addOrSaveOrder, orderReviewer, orderNo, getDetails, saveOrder } from '@/api/tob/agencyreturn'
import WmsForm from '@/views/toB/components/WmsCompForm'
import Order from './return'
import dayjs from 'dayjs'
export default {
  name: 'AgencyReturnIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.Mixin_tabDate[index].whetherCount && !this.Mixin_tabDate[index].returnNumber) {
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
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:consignmentShipment:update:review'] }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '退货单号', prop: 'returnNo', show: true, type: 'text', editShow: true, detailShow: true, readonly: true, addFatherProp: 'Req' },
        { title: 'shipmentId(隐藏)', prop: 'shipmentId', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '退货日期', prop: 'returnDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '组织', prop: 'orgId', show: true, tabHidden: true, defaultValue: [0, 3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, width: '300px', type: 'select', readonly: false, editShow: true, tableHidden: true, addFatherProp: 'Req', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '退货门店', prop: 'storeId', propName: 'storeName', show: true, tableHidden: true, type: 'select', defaultValue: this.$store.getters.storeId, width: 200, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, readonly: this.$store.getters.accountType === 1, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '退货门店不能为空', trigger: 'change' }] },
        { title: '退货仓库', prop: 'stockId', propName: 'stockName', show: true, tableHidden: true, type: 'select', width: 200, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, readonly: false, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'storeId',
          rule: [{ required: true, message: '退货仓库不能为空', trigger: 'change' }] },
        { title: '代销商', width: 150, formWidth: '20%', prop: 'customerId', readonly: false, propFromPageName: 'customerName', show: true, click: 'addItems', windowName: 'Customer', type: 'selectFromPage', formProData: { typeName: '代销商' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '代销商不能为空', trigger: 'change' }] },
        { title: '出货单号', prop: 'shipmentNo', formWidth: '30%', readonly: false, propFromPageName: 'shipmentNo', show: true, tabHidden: true, click: 'addItems', windowName: 'AgencyShipmentIndex', formProData: { customerId: '', auditStatus: '3', isSettlement: 1 }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '出货单号不能为空', trigger: 'change' }] },
        { title: '总金额', prop: 'totalAmount', width: 120, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['totalAmount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatus', show: true, type: 'selectState', width: 160, selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'makerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPersonName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'auditTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品ID(隐藏)', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否称重(隐藏)', prop: 'whetherCount', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', show: false, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { shipmentId: '', stopSale: 0, storeId: '', stockId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { shipmentId: '', stopSale: 0, storeId: '', stockId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, tabWidth: 120, addFatherProp: 'detailReqs' },
        { title: '单位', prop: 'weightType', show: false, tabWidth: 100, type: 'select', selectData: 'weight_type', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退货单价', prop: 'returnPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为0', trigger: 'change' }] },
        { title: '退货数量', prop: 'returnQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为0', trigger: 'change' }] },
        { title: '金额', prop: 'totalAmount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['returnPrice', 'returnQuantity'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '个数', prop: 'returnNumber', show: false, placeholder: '计数商品必填', type: 'Number', fn_disabled: (row) => !row.whetherCount, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
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
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'customerId', 'readonly', n.some(item => item.goodsCode !== ''))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'shipmentNo', 'readonly', n.some(item => item.goodsCode !== ''))
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
            this.currentRow = res.data.pageRes
            this.details = res.data.detailsRes
            // this.formShow = true
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
        orderNo({ type: 'DXTH' }).then(res => {
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
          // data.Req.relevantNo = data.Req.relevantNo.length ? data.Req.relevantNo.toString() : ''
          if (data.detailReqs.length > 0) {
            // let amountTemp = 0
            data.detailReqs.map(item => {
              item.id = null
              item.returnNo = data.Req.returnNo
              item.shipmentNo = data.Req.shipmentNo
            })
          }
          data.returnReq = data.Req
          delete data.Req
          data.orgId = data.returnReq.orgId
          // data = Object.assign(data, data.Req)
          data.deleteIds = []

          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addOrSaveOrder(data).then(res => {
                this.review(res.data.id, true)
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
            // if (res.code === 200 && arg.review) {
            //   this.review()
            //   return
            // }
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
              item.returnNo = data.Req.returnNo
              item.shipmentNo = data.Req.shipmentNo
              item.returnId = data.Req.id
            })
          }
          data.returnReq = data.Req
          data.orgId = data.returnReq.orgId
          delete data.Req

          data.deleteIds = deleteDetails

          saveOrder(data).then(res => {
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
      orderReviewer({ 'ids': [id || this.currentRow.id], auditStatus: '3' }).then(res => {
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('returnNo', this.table_data_arr)}「${this.currentRow.returnNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
