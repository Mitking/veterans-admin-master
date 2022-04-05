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
        :edit-detail-some-disable="true"
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        :detail_show="detailFormShow"
        v-bind="$attrs"
        v-on="$listeners"
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
    <!-- 详情弹窗 -->
    <el-dialog
      class="my-class"
      title="单据详情"
      :visible.sync="detailFormShow"
      :modal-append-to-body="false"
      fullscreen
      :modal="false"
    >
      <component
        :is="'WmsForm'"
        :show="detailFormShow?'WmsForm':''"
        :current-row="currentRow"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :details="details"
        :is_child="$attrs.is_child"
        :add_arr="[]"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailFormShow = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, deleteDetails, review } from '@/api/wms/stockreceive'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './sendreject.vue'
import dayjs from 'dayjs'
export default {
  name: 'StockReceiveIndex',
  components: { WmsCompForm, Order, WmsForm },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    // const check_amount = (rule, value, callback) => { // 金额计算校验
    //   const index = Number(rule.field.replace(/[^0-9]/ig, ''))
    //   // if (value === '' || value === 0 || Number(value) === 0) {
    //   //   callback(new Error('金额不能为空'))
    //   // } else
    //   if (value !== this.Mixin_tabDate[index].price * this.g2kg(this.Mixin_tabDate[index].number)) {
    //     callback(new Error('金额计算异常'))
    //   } else {
    //     callback()
    //   }
    // }
    return {
      detailFormShow: false,
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'ProductIndex' }
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, insertShow: false, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:stoReceiveOrder:update:review'] }
      ],
      table_add_disable: true, // 是够可以新增删除详情品
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      tabDate: [],
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货单号', prop: 'receiveOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        // { title: '采购单号', prop: 'purOrderNo', show: true, type: 'text', editShow: true, detailShow: true, placeholder: '无关联单据', addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatus', width: 160, show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '返货类型', prop: 'receiveType', show: true, width: 160, type: 'select', readonly: true, selectData: 'receive_type', selectDataFilter: null, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '返货类型不能为空', trigger: 'change' }] },
        { title: '来源门店', prop: 'sourceStore', show: true, width: 200, type: 'text', selectData: 'stores', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '单据金额', prop: 'orderAmount', show: true, width: 160, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '收货门店', prop: 'receiveStoreId', readonly: true, show: true, width: 200, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '收货门店不能为空', trigger: 'change' }] },
        { title: '收货仓库', prop: 'receiveStockId', show: true, width: 200, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, editShow: true, detailShow: false, addFatherProp: 'Req', fatherPropName: 'storeId', fatherProp: 'receiveStoreId',
          rule: [{ required: true, message: '收货仓库不能为空', trigger: 'change' }] },
        { title: '收货日期', prop: 'receiveDate', width: 160, defaultValue: dayjs().format('YYYY-MM-DD'), show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '收货日期不能为空', trigger: 'change' }] },
        { title: '结算状态', prop: 'settleState', show: false, width: 160, type: 'select', selectData: 'settle_state', editShow: false, detailShow: false, addFatherProp: 'Req', defaultValue: '0' },
        { title: '返货来源', prop: 'receiveSource', show: true, width: 160, type: 'select', selectData: 'receive_source', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: '', readonly: true,
          rule: [{ required: true, message: '返货来源不能为空', trigger: 'change' }] },
        { title: '制单人', prop: 'creatorName', show: true, width: 160, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, width: 200, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', show: true, width: 160, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, width: 200, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, width: 160, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, width: 200, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '返货单号', prop: 'receiveOrderNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', readonly: true, show: false, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', readonly: true, show: false, tabWidth: 300, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, type: 'text', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '返货单位', prop: 'weightType', show: false, defaultValue: '-', readonly: true, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否称重', prop: 'whetherWeigh', show: false, readonly: true, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', show: false, type: 'COST_PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '返货数量', prop: 'number', show: false, type: 'WEIGHT_AUTOMATIC', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '金额', prop: 'amount', propSemiName: 'price', show: false, type: 'PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '返货个数', prop: 'count', show: false, type: 'text', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货人', prop: 'receiveUserId', show: false, type: 'select', selectData: 'personListSH', selectOption: { label: 'surname', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'blur' }] },
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
    disabled_fn(row) {
      return !row.whetherWeigh
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      // const autoOrder = operateItem.prop === 'edit' && !!this.currentRow.purOrderNo // 自动生成单据
      // // 根据单据类型修改金额计算方式
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'price', 'readonly', this.currentRow.receiveType !== '4')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'amount', 'readonly', autoOrder)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'amount', 'type', autoOrder ? 'PRICE' : 'PRICE_SEMI_AUTOMATIC')
      // // 根据单据类型修改单价计算方式
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'price', 'type', autoOrder ? 'PRICE_AUTOMATIC' : 'PRICE_SEMI_AUTOMATIC')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPersonId', 'editShow', autoOrder)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purQuantity', 'editShow', autoOrder)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purNum', 'editShow', autoOrder)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'purPiecesNum', 'editShow', autoOrder)

      // // this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveStoreId', 'readonly', [1].includes(this.$store.getters.accountType))
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveUserId', 'editShow', operateItem.prop !== 'insert')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveSource', 'defaultValue', operateItem.prop === 'insert' ? 2 : this.currentRow.receiveSource)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiveType', 'selectDataFilter',
      //   operateItem.prop === 'insert' ? ['1', '2', '3']
      //     : (Number(this.currentRow.receiveSource) === 1 && ['4', '5'] || Number(this.currentRow.receiveSource) === 2 && ['1', '2', '3']))
      // this.table_add_disable = !(operateItem.prop === 'insert' || (!this.currentRow.purOrderNo && Number(this.currentRow.receiveSource) === 2))
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'receiveOrderNo': this.currentRow.receiveOrderNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            if (this.$attrs.is_child) { // 选单时弹窗展示详情
              this.detailFormShow = true
            } else {
              this.currentComponent = 'WmsCompForm'
            }
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
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
              item.receiveOrderNo = data.Req.receiveOrderNo
            })
          }
          data.stoReceiveOrderReq = data.Req
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
              item.receiveOrderNo = data.Req.receiveOrderNo
            })
          }
          data.stoReceiveOrderReq = data.Req
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
        this.$confirm(`此操作将永久删除单号「${item.receiveOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
