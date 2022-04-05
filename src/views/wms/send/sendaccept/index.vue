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
        :edit-detail-some-disable="true"
        @tabDateChange="Mixin_tabDate=$event"
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
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review } from '@/api/wms/sendaccept'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './sendaccept'
export default {
  name: 'SendAcceptIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      if (value < 0) {
        return callback(new Error('不能为负数'))
      }
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.Mixin_tabDate[index].whetherCount && this.Mixin_tabDate[index].acceptCount === '') {
        callback(new Error('个数必填'))
      } else {
        callback()
      }
    }
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { storeId: '', orgId: 0 }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:sendAccept:update:reviewAccept'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '验收单号', prop: 'acceptNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '调出单号', prop: 'callNo', show: true, type: 'text', editShow: false, detailShow: false, addFatherProp: 'other', readonly: true },
        { title: '验收日期', prop: 'acceptDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '收货门店', readonly: true, width: 200, prop: 'receiptStoreId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '收货仓库', readonly: false, width: 200, prop: 'receiptStockId', show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'receiptStoreId', fatherPropName: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '仓库不能为空', trigger: 'change' }] },
        { title: '发货门店', readonly: true, prop: 'shipStoreId', width: 200, show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '发货仓库', readonly: true, prop: 'shipStockId', width: 200, show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'shipStoreId', fatherPropName: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '品项', prop: 'count', width: 150, show: true, placeholder: '系统计算', type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_tab_length, float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '总金额', prop: 'amount', width: 150, show: true, tableHidden: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['acceptAmount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', selectData: 'audit_status', defaultValue: '1', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'maker', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'makeTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPerson', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'auditTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: false, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '验收单号', prop: 'acceptNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', readonly: true, prop: 'goodsCode', show: false, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { receiptStoreId: '', receiptStockId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', readonly: true, prop: 'goodsName', show: false, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { receiptStoreId: '', receiptStockId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, readonly: true, defaultValue: '-', type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单位', prop: 'weightType', defaultValue: '-', show: false, type: 'select', selectData: 'weight_type', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', readonly: true, tableHidden: true, defaultValue: '-', show: false, type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        { title: '调出数量', prop: 'callNumber', readonly: true, show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '调出个数', prop: 'callCount', readonly: true, show: false, type: 'number', float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '验收数量', prop: 'acceptNumber', show: false, type: 'weight_number', float: { decimal: 3, max: 'callNumber' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '验收个数', prop: 'acceptCount', show: false, type: 'number', placeholder: '计数品必填', disabledFn: (row) => !row.whetherCount, float: { decimal: 0, max: 'callCount' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: countCheck, trigger: 'change' }] },
        { title: '退货数量', prop: 'returnNumber', show: false, type: 'WEIGHT_AUTOMATIC', design: this.mixin_auto_pur_weight_diff, arg: ['callNumber', 'acceptNumber'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退货个数', prop: 'returnCount', show: false, type: 'NUMBER_AUTOMATIC', float: { decimal: 0 }, design: this.mixin_auto_pur_weight_diff, arg: ['callCount', 'acceptCount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', show: false, type: 'if_type', float: { decimal: 0 }, editShow: true, tableHidden: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '验收金额', prop: 'acceptAmount', show: false, tableHidden: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'acceptNumber'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '退货金额', prop: 'returnAmount', show: false, tableHidden: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'returnNumber'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
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
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'callNumber', 'editShow', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'returnNumber', 'editShow', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'callCount', 'editShow', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'returnCount', 'editShow', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'returnAmount', 'editShow', operateItem.prop !== 'insert')
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'acceptNo': this.currentRow.acceptNo }).then(res => {
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
        this.details = []
        getSendNumber({ sendType: 'PSYS' }).then(res => {
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
              item.acceptNo = data.Req.acceptNo
            })
          }
          data.sendAcceptReq = data.Req
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
              item.acceptNo = data.Req.acceptNo
              item.acceptAmount = this.DECIMAL(item.price).mul(item.acceptNumber).mul('0.001').toNumber()
              item.returnAmount = this.DECIMAL(item.price).mul(item.returnNumber).mul('0.001').toNumber()
            })
          }
          data.sendAcceptReq = data.Req
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
        this.$confirm(`此操作将永久删除单号「${item.acceptNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
