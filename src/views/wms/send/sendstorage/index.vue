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
        :form-bottons="form_bottons"
        :detail_table_buttons="detail_table_buttons"
        :edit-detail-disable="currentRow.autoGenerate && operateItem.prop === 'edit'"
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
// import { addOrder, deleteOrder, deleteDetails, , getPage, review, updateOrder, getStoNumber } from '@/api/wms/stockinvreport'
import { getDetails, addOrder, updateOrder, deleteDetails, getSendNumber, review } from '@/api/wms/sendstorage'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './sendstorage'
export default {
  name: 'SendStorageIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      if (value < 0) {
        return callback(new Error('不能为负数'))
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
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { storeId: '', orgId: 0 }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:sendStorage:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货单号', prop: 'storageNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '验收/退货单号', prop: 'linkedNo', show: true, type: 'text', editShow: false, detailShow: false, addFatherProp: 'Req', readonly: true },
        { title: '收货日期', prop: 'storageDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: [0, 3].includes(this.$store.getters.accountType), outTabHidden: true, tableHidden: true, detailShow: false, addFatherProp: 'Req' },
        { title: '收货门店', prop: 'storageStoreId', width: 200, readonly: [1].includes(this.$store.getters.accountType), defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '收货仓库', prop: 'storageStockId', width: 200, readonly: false, show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storageStoreId', fatherPropName: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '仓库不能为空', trigger: 'change' }] },
        // { title: '件数', prop: 'count', show: true, width: 100, type: 'number', float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '品项', prop: 'count', width: 150, tableHidden: true, show: true, placeholder: '系统计算', type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_tab_length, float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '总金额', prop: 'amount', show: true, tableHidden: true, width: 150, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req',
        // rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', defaultValue: '1', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '自动生成', prop: 'autoGenerate', width: 100, show: true, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'maker', show: true, width: 150, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'makeTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPerson', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'auditTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '收货单号', prop: 'storageNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { storageStoreId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { storageStoreId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, type: 'text', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '基本单位', prop: 'weightType', show: false, readonly: true, defaultValue: '-', type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '成本价(隐藏)', prop: 'costPrice', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        // { title: '单价', prop: 'price', realProp: 'costPrice', show: false, readonly: false, defaultValue: '-', type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '验收个数', prop: 'acceptCount', readonly: true, show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', rule: [{ required: true, message: '请输入申请个数', trigger: 'blur' }] },
        { title: '验收数量', prop: 'acceptNumber', readonly: true, show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '收货数量', prop: 'number', readonly: true, show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '收货金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'number'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', show: false, type: 'if_type', float: { decimal: 0 }, editShow: true, tableHidden: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '收货个数', prop: 'count', show: false, placeholder: '计数品必填', disabledFn: (row) => !row.whetherCount, type: 'number', float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
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
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'storageStoreId', 'readonly', n.some(item => item.goodsCode !== '') || [1].includes(this.$store.getters.accountType))
        // this.mixin_arr_edit_by_prop(this.table_data_arr, 'storageStockId', 'readonly', n.some(item => item.goodsCode !== ''))
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
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storageStoreId', 'readonly', [1].includes(this.$store.getters.accountType) || this.currentRow.autoGenerate)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'acceptCount', 'editShow', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'acceptNumber', 'editShow', operateItem.prop !== 'insert')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'linkedNo', 'editShow', !!this.currentRow.linkedNo)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'linkedNo', 'detailShow', !!this.currentRow.linkedNo)
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'storageNo': this.currentRow.storageNo }).then(res => {
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
        // this.mixin_arr_edit_by_prop(this.table_data_arr, 'linkedNo', 'editShow', false)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'storageStoreId', 'readonly', [1].includes(this.$store.getters.accountType))
        this.details = []
        getSendNumber({ sendType: 'PSRK' }).then(res => {
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
              item.storageNo = data.Req.storageNo
            })
          }
          data.sendStorageReq = data.Req
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
              item.storageNo = data.Req.storageNo
            })
          }
          data.sendStorageReq = data.Req
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
        this.$confirm(`此操作将永久删除单号「${item.storageNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
