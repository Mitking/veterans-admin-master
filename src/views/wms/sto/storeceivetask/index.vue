<template>
  <!--  -->
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
import { addOrSaveOrder, review, orderNo, getPurOrderResourceOrderNo } from '@/api/wms/purorder'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './order'
import dayjs from 'dayjs'
export default {
  name: 'StockReceiveTaskIndex',
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
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1, autoGenerate: false }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:order:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '单号', prop: 'purOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '单据类型', prop: 'orderType', width: 160, show: true, type: 'select', selectData: 'receive_type', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '日期', prop: 'purDate', show: true, defaultValue: dayjs().format('YYYY-MM-DD'), type: 'date', width: 160, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '采购日期不能为空', trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', selectData: 'audit_status', width: 100, editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '自动生成', prop: 'autoGenerate', show: true, type: 'if_type', width: 100, editShow: false, detailShow: false, addFatherProp: 'Req', readonly: false },
        { title: '已成本核算', prop: 'costCalculation', show: true, type: 'if_type', width: 120, editShow: false, detailShow: false, addFatherProp: 'Req', readonly: false },
        { title: '生成收货单', prop: 'generateReceive', show: true, type: 'if_type', width: 120, editShow: false, detailShow: false, addFatherProp: 'Req', readonly: false },
        { title: '金额', prop: 'amount', show: true, type: 'PRICE_AUTOMATIC', width: 100, design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 100, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'date', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 100, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'date', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '采购员', prop: 'purPersonId', show: true, type: 'select', width: 100, selectData: 'personListCG', selectOption: { label: 'surname', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '采购员不能为空', trigger: 'change' }] },
        { title: '更新时间', prop: 'updateTime', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '', prop: 'orderFrom', show: false, type: 'orderFrom', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', width: 200, editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '采购订单号', prop: 'purOrderNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        // { title: '采购任务单号', prop: 'purTaskNo', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'detailReqs', tabWidth: 300, readonly: true },
        { title: '商品ID', prop: 'productId', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, placeholder: '请选择', click: 'addItems', windowName: 'ProductIndex', formProData: { stopBuy: 0 }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', show: false, autoForm: ['purNumWeight', 'addNumWeight', 'giveNumWeight'], tabWidth: 200, placeholder: '请选择', click: 'addItems', windowName: 'ProductIndex', formProData: { stopBuy: 0 }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, tabWidth: '100', addFatherProp: 'detailReqs' },
        { title: '单位', prop: 'purUnit', show: false, tabWidth: '50', type: 'select', selectData: 'weight_type', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否称重', prop: 'whetherWeigh', show: false, readonly: true, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', show: false, readonly: true, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '供应商ID', prop: 'supplierId', show: false, click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', editShow: true, tableHidden: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '供应商', prop: 'supplierName', show: false, placeholder: '', click: 'addItems', windowName: 'SupplierIndex', type: 'selectFromPage', focusFn: this.focusFn, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购单价', prop: 'price', tabWidth: '', autoForm: ['purNumWeight'], placeholder: '系统计算', show: false, type: 'COST_PRICE_AUTOMATIC', focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'purNumWeight' }, design: this.mixin_auto_price, arg: ['amount', 'purNumWeight'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空', trigger: 'change' }] },

        { title: '采购个数', prop: 'number', placeholder: '计数商品必填', defaultValue: '0', show: false, fn_disabled: (row) => !row.whetherCount, type: 'number', editShow: true, tableHidden: true, autoForm: ['purNumWeight'], detailShow: true, addFatherProp: 'detailReqs' },
        { title: '总毛重', prop: 'weight', placeholder: '手动录入', fn_disabled: (row) => !row.whetherWeigh, show: false, type: 'weight_number', editShow: true, tableHidden: true, autoForm: ['purNumWeight'], detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单件皮重(数量)', autoFormTitleFn: (row) => row.whetherWeigh ? '单件皮重' : '单件数量', prop: 'tareWeight', placeholder: '手动录入', show: false, type: 'weight_number', editShow: true, detailShow: true, tableHidden: true, autoForm: ['purNumWeight'], addFatherProp: 'detailReqs' },
        { title: '采购件数', prop: 'purPiecesNum', placeholder: '手动录入', show: false, type: 'Number', float: { decimal: 3 }, editShow: true, tableHidden: true, autoForm: ['purNumWeight'], detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空', trigger: 'change' }] },
        { title: '应采数量', prop: 'purPreNum', placeholder: '手动录入', defaultValue: 0, show: false, type: 'weight_number', tableHidden: true, autoForm: ['purNumWeight'], editShow: true, detailShow: true, readonly: true, addFatherProp: 'detailReqs' },
        { title: '采购净重', prop: 'purNumWeight', tabWidth: '', placeholder: '系统计算', design: this.mixin_auto_pur_num_weight, arg: ['weight', 'tareWeight', 'purPiecesNum', 'whetherWeigh'], show: false, type: 'WEIGHT_AUTOMATIC', focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'purNumWeight' }, autoForm: ['purNumWeight'], editShow: true, detailShow: true, addFatherProp: 'detailReqs'
        },
        { title: '差异数量', prop: 'differences', placeholder: '系统计算', show: false, type: 'WEIGHT_AUTOMATIC', tableHidden: true, autoForm: ['purNumWeight'], design: this.mixin_auto_pur_weight_diff, arg: ['purNumWeight', 'purPreNum'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '金额', prop: 'amount', placeholder: '请录入', show: false, type: 'PRICE', selectData: 'weight_type', autoForm: ['purNumWeight'], focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'purNumWeight' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        { title: '补损个数', prop: 'addNum', placeholder: '计数商品必填', autoForm: ['addNumWeight'], fn_disabled: (row) => !row.whetherCount, tableHidden: true, show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '补损毛重', prop: 'addWeight', placeholder: '手动录入', autoForm: ['addNumWeight'], tableHidden: true, show: false, fn_disabled: (row) => !row.whetherWeigh, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单件皮重(数量)', autoFormTitleFn: (row) => row.whetherWeigh ? '单件皮重' : '单件数量', prop: 'addTareWeight', placeholder: '手动录入', autoForm: ['addNumWeight'], tableHidden: true, show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '补损件数', prop: 'addPiecesNum', placeholder: '手动录入', autoForm: ['addNumWeight'], tableHidden: true, show: false, type: 'Number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '补损净重', prop: 'addNumWeight', placeholder: '系统计算', tabWidth: '', focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'addNumWeight' }, autoForm: ['addNumWeight'], design: this.mixin_auto_pur_num_weight, arg: ['addWeight', 'addTareWeight', 'addPiecesNum', 'whetherWeigh'], show: false, type: 'WEIGHT_AUTOMATIC', editShow: true, detailShow: true, addFatherProp: 'detailReqs'
        },

        { title: '赠送个数', prop: 'giveNum', placeholder: '计数商品必填', fn_disabled: (row) => !row.whetherCount, show: false, tableHidden: true, autoForm: ['giveNumWeight'], type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '赠送毛重', prop: 'giveWeight', placeholder: '手动录入', show: false, tableHidden: true, autoForm: ['giveNumWeight'], fn_disabled: (row) => !row.whetherWeigh, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单件皮重(数量)', autoFormTitleFn: (row) => row.whetherWeigh ? '单件皮重' : '单件数量', prop: 'giveTareWeight', placeholder: '手动录入', show: false, tableHidden: true, autoForm: ['giveNumWeight'], type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '赠送件数', prop: 'givePiecesNum', placeholder: '手动录入', show: false, tableHidden: true, autoForm: ['giveNumWeight'], type: 'Number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '赠送净重', prop: 'giveNumWeight', placeholder: '系统计算', tabWidth: '', focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'giveNumWeight' }, autoForm: ['giveNumWeight'], design: this.mixin_auto_pur_num_weight, arg: ['giveWeight', 'giveTareWeight', 'givePiecesNum', 'whetherWeigh'], show: false, type: 'WEIGHT_AUTOMATIC', editShow: true, detailShow: true, addFatherProp: 'detailReqs'
        },

        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      tabDate: [],
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
    focusFn(item, row, index) {
      switch (item.prop) {
        case 'purNumWeight': case 'price' : case 'supplierName': case 'addNumWeight':case 'giveNumWeight':
          if (!row.goodsCode) {
            this.$message.info('请先选择商品')
          }
          this.$refs.Comp.$refs.Comp.$refs.Table.$refs.Form.clearValidate(`details[${index}][${item.prop}]`)
          return !!row.goodsCode
        default:
          return true
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      const auto = (['edit', 'detail'].includes(operateItem.prop) && this.currentRow.autoGenerate)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'orderFrom', 'editShow', auto)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPreNum', 'editShow', auto)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'differences', 'editShow', auto)

      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'weight', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'tareWeight', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPiecesNum', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPreNum', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purNumWeight', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'differences', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'price', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'number', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'giveWeight', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'giveTareWeight', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'givePiecesNum', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'giveNumWeight', 'detailShow', this.currentRow.orderType === '1')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'giveNum', 'detailShow', this.currentRow.orderType === '1')

      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        this.details = this.currentRow.orderDetails
        if (auto) {
          getPurOrderResourceOrderNo({ 'purOrderNo': this.currentRow.purOrderNo }).then((res) => {
            const order_temp = res.data.taskNoList.join(',')
            this.mixin_arr_edit_by_prop(this.table_data_arr, 'orderFrom', 'defaultValue', order_temp)
            this.$set(this.currentRow, 'orderFrom', order_temp)

            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          }).finally(() => {
            operateItem.loading = false
          })
        } else {
          this.$set(this.currentRow, 'orderFrom', false)
          this.currentComponent = 'WmsCompForm'
          operateItem.loading = false
        }
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        orderNo({ type: 'CGDD' }).then(res => {
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
              item.purOrderNo = data.Req.purOrderNo
              item.purPersonId = data.Req.purPersonId
            })
          }
          data.orderDetails = this.deepClone(data.detailReqs)
          delete data.detailReqs
          data.orderDetails.map(item => {
            item.addNumWeight = item.addNumWeight || 0
            item.giveNumWeight = item.giveNumWeight || 0
          })
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
          addOrSaveOrder(data).then(res => {
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
              item.purOrderNo = data.Req.purOrderNo
              item.purPersonId = data.Req.purPersonId
            })
          }
          data.orderDetails = this.deepClone(data.detailReqs)
          delete data.detailReqs
          data.orderDetails.map(item => {
            item.addNumWeight = item.addNumWeight || 0
            item.giveNumWeight = item.giveNumWeight || 0
          })
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purOrderNo', this.table_data_arr)}「${item.purOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
