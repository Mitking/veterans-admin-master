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
import { addOrSaveOrder, financeReviewer, orderNo } from '@/api/wms/purdiff'
import WmsForm from '@/views/wms/components/WmsCompForm'
import Order from './diff'
import dayjs from 'dayjs'
export default {
  name: 'DiffIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const diffMountCheck = (rule, value, callback) => { // 数量校验
      if (rule.field === 'amount') {
        if (Number(value) === 0) {
          return callback(new Error('不能为空或0'))
        }
        return callback()
      }

      if (Number(value) === 0) {
        return callback(new Error('不能为空或0'))
      }
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.DECIMAL('0.001').mul(this.Mixin_tabDate[index].diffNumQuantity || '0').mul(this.Mixin_tabDate[index].price || '0').mul('0.0001').toNumber().toFixed(0) !== this.DECIMAL('0.0001').mul(this.Mixin_tabDate[index].amount).toNumber().toFixed(0)) {
        callback(new Error('计算有误'))
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
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { financialAudit: 1 }, detailShowArgs: { financialAudit: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:diff:order:financeReviewer'] }
      ],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '差异单号', prop: 'purDiffOrderNo', show: true, type: 'text', editShow: true, detailShow: true, readonly: true, addFatherProp: 'Req' },
        { title: '收货日期', prop: 'receiveDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货门店', prop: 'storeId', show: true, type: 'select', defaultValue: this.$store.getters.storeId, width: 200, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: false, addFatherProp: 'Req',
          rule: [{ required: true, message: '收货门店不能为空', trigger: 'change' }] },
        { title: '收货仓库', prop: 'stockId', show: true, type: 'select', width: 200, selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, editShow: true, detailShow: false, addFatherProp: 'Req', fatherProp: 'storeId',
          rule: [{ required: true, message: '收货仓库不能为空', trigger: 'change' }] },
        { title: '差异类型', prop: 'diffType', show: true, type: 'select', defaultValue: '1', selectDataFilter: ['1', '4'], readonly: false, valToStr: true, width: 200, selectData: 'diff_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '采购员', prop: 'personId', readonly: false, show: true, type: 'select', selectData: 'personListCG', selectOption: { value: 'id', label: 'surname' }, formItemWidth: 150, width: 160, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '采购员不能为空', trigger: 'change' }] },
        { title: '差异金额', prop: 'amount', show: true, type: 'PRICE_AUTOMATIC_SWITCH', design: this.mixin_auto_total_amount, arg: ['amount'], width: 160, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '处理方式', prop: 'treatmentMethod', width: 100, show: true, type: 'select', selectData: 'diff_deal_type', valToStr: true, selectValueType: 'string', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', width: 160, selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req' },
        { title: '是否失效', prop: 'orderInvalid', width: 100, show: true, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '相关单号', prop: 'relevantNo', show: true, transformvalFn: this.transformvalFn, tabHidden: true, formWidth: '50%', type: 'selectFromPageArr', formProData: { personId: '' }, windowName: 'DiffAutoSelect', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '采购单位', prop: 'purUnit', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '采购单位名称', prop: 'purUnitName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '收货仓库', prop: 'stockName', show: true, type: 'select', selectData: 'stores', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '供应商名', prop: 'supplierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '供应商ID', prop: 'supplierId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '差异单号', prop: 'purDiffOrderNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tabWidth: 300 },
        { title: '商品ID(隐藏)', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', show: false, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { stopBuy: 0, storeId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, placeholder: '请选择', click: 'addItems', windowName: 'StoreProductIndex', formProData: { stopBuy: 0, storeId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '供应商', prop: 'supplierName', show: false, placeholder: '请选择', click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', focusFn: this.focusFn, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '规格', prop: 'spec', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, tabWidth: 120, addFatherProp: 'detailReqs' },
        { title: '采购单位', prop: 'purUnit', show: false, tabWidth: 100, type: 'select', selectData: 'weight_type', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '采购数量', prop: 'purNumQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '收货数量', prop: 'receiveNumQuantity', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异数量', prop: 'diffNumQuantity', show: false, type: 'weight_number', float: { minus: true }, inputFn: (row) => this.changeComputed(row), focusFn: (row) => this.changeDiffNumFcurs(row), editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '上次采购单价(隐藏)', prop: 'lastPurPrice', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', realProp: 'lastPurPrice', show: false, inputFn: (row) => this.changeComputed(row), type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异金额', prop: 'amount', show: false, tipMsg: '正数为消除挂账,负数为增加采购员身上的挂账', float: { minus: true }, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: diffMountCheck, trigger: 'change' }] },
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
    'formData': {
      handler(n) {
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'personId', 'readonly', !!n.relevantNo.length)
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
        // getDetails({ 'purDiffOrderNo': this.currentRow.purDiffOrderNo }).then(res => {
        //   if (res.code === 200) {
        this.details = this.currentRow.details
        // this.formShow = true
        this.currentComponent = 'WmsForm'
        operateItem.loading = false
        // } else {
        //   this.$message.error('获取失败')
        //   operateItem.loading = false
        // }
        // })
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        orderNo({ type: 'CGCY' }).then(res => {
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
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'review': // 审核
          this.review()
          break
        case 'insert': // 新增
          data.Req.id = null
          data.Req.relevantNo = data.Req.relevantNo.length ? data.Req.relevantNo.toString() : ''
          if (data.detailReqs.length > 0) {
            // let amountTemp = 0
            data.detailReqs.map(item => {
              item.id = null
              item.purDiffOrderNo = data.Req.purDiffOrderNo
              // item.amount = item.amount.toFixed(0)
              // amountTemp = this.DECIMAL.add(amountTemp, item.amount).toNumber()
            })
            // data.Req.amount = amountTemp
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteDetails = []

          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗？`, '提示', {
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
          data.Req.relevantNo = data.Req.relevantNo.toString()
          if (data.detailReqs.length > 0) {
            // let amountTemp = 0
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.purDiffOrderNo = data.Req.purDiffOrderNo
              // amountTemp = this.DECIMAL.add(amountTemp, item.amount).toNumber()
            })
            // data.Req.amount = amountTemp
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
    changeComputed(row) {
      row.amount = this.DECIMAL(row.price || '0').mul(row.diffNumQuantity || '0').mul('0.001')
      row.amountShow = this.fen2yuan(row.amount)
    },
    changeDiffNumFcurs(row) {
      if (!row.goodsName) {
        return this.$message.info('请先选择商品')
      }
      if (!row.amount || !row.price) {
        return
      }
      row.diffNumQuantity = this.DECIMAL(row.amount).div(row.price).mul('1000').toNumber().toFixed(0)
      row.diffNumQuantityWeightShow = this.g2kg(row.diffNumQuantity)
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
      financeReviewer({ 'ids': [id || this.currentRow.id] }).then(res => {
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purDiffOrderNo', this.table_data_arr)}「${item.purDiffOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
