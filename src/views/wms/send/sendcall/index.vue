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
        :edit-detail-some-disable="currentRow.autoGenerate && operateItem.prop!=='insert'"
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
// addSendCall,deleteDetailById,getCallDetails,reviewSendCall,updateSendCall map
import { getCallDetails, addSendCall, updateSendCall, deleteDetailById, getSendNumber, reviewSendCall } from '@/api/wms/sendcall'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import SendCall from './sendcall'
export default {
  name: 'SendCallIndex',
  components: { WmsCompForm, SendCall },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      if (value < 0) {
        return callback(new Error('不能为负数'))
      }
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.Mixin_tabDate[index].whetherCount && !this.Mixin_tabDate[index].count) {
        callback(new Error('个数必填'))
      } else {
        callback()
      }
    }
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { shipStoreId: '', shipStockId: '', orgId: 0 }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:sendCall:update:review'] }
      ],
      loading: false,
      currentComponent: 'SendCall',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '调出单号', prop: 'callNo', show: true, defaultValue: '', type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '申请单号', prop: 'applyNo', show: true, defaultValue: '', type: 'text', editShow: false, detailShow: false, addFatherProp: 'Req', readonly: true },
        { title: '调出日期', prop: 'calloutDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, outTabHidden: true, detailShow: false, addFatherProp: 'Req' },
        { title: '发货门店', prop: 'shipStoreId', width: 200, readonly: [1].includes(this.$store.getters.accountType), show: true, type: 'select', defaultValue: this.$store.getters.storeId, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '发货门店不能为空', trigger: 'change' }, { validator: this.storeIdCheck, trigger: 'change' }] },
        { title: '发货仓库', prop: 'shipStockId', width: 200, readonly: false, show: true, tabHidden: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'shipStoreId', fatherPropName: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '发货仓库不能为空', trigger: 'change' }] },
        { title: '收货门店', prop: 'receiptStoreId', width: 200, readonly: false, show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '收货门店不能为空', trigger: 'change' }, { validator: this.storeIdCheck, trigger: 'change' }] },
        { title: '总金额', prop: 'amount', width: 150, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', selectData: 'audit_status', defaultValue: '1', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '自动生成', prop: 'autoGenerate', width: 100, show: true, type: 'if_type', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: false, detailShow: false, addFatherProp: 'Req' },
        { title: '已生成入库单', prop: 'isGenerateStorage', width: 140, show: true, type: 'if_type', editShow: false, detailShow: false, addFatherProp: 'Req' },
        { title: '已生成配送单', prop: 'isGenerateDelivery', width: 140, show: true, type: 'if_type', editShow: false, detailShow: false, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, defaultValue: '暂无制单人', detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, defaultValue: '暂无制单人', detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'auditPerson', width: 150, show: true, type: 'text', editShow: false, detailShow: true, defaultValue: '暂无', addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewTime', width: 160, show: true, type: 'text', editShow: false, defaultValue: '暂无制单人', detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: true, tabHidden: true, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'Req' },

        // { title: '审核人id', prop: 'auditPersonId', show: true, type: 'text', editShow: false, detailShow: false, addFatherProp: 'Req' },
        // { title: '附加备注', prop: 'attachRemark', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '发货仓库', prop: 'shipStockName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '收货仓库', prop: 'receiptStock', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '已生成配送单', prop: 'isGenerateDelivery', show: true, type: 'if_type', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '已生成验收单', prop: 'isGenerateAccept', show: true, type: 'if_type', editShow: true, detailShow: false, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '调出单号', prop: 'callNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', readonly: false, prop: 'goodsCode', show: false, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { shipStoreId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', readonly: false, prop: 'goodsName', tabWidth: 200, show: false, click: 'addItems', windowName: 'StoreProductIndex', type: 'selectFromPage', formProData: { shipStoreId: '', orgId: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, readonly: true, click: 'addItems', windowName: 'ProductIndex', type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '库存单位', prop: 'weightType', defaultValue: '-', readonly: true, show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '成本价(隐藏)', prop: 'costPrice', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '单价', realProp: 'costPrice', prop: 'price', show: false, defaultValue: '-', type: 'COST_PRICE', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '申请数量', prop: 'applyNumber', readonly: true, show: false, type: 'weight_number', defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '库存数量', prop: 'totalStockNum', show: false, type: 'weight_number', readonly: true, editShow: true, detailShow: false, addFatherProp: 'detailReqs', placeholder: '最大限制为库存数量' },
        { title: '调出数量', prop: 'number', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空', trigger: 'change' }] },
        { title: '金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'number'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '申请个数', prop: 'applyCount', show: false, type: 'number', float: { decimal: 0 }, readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', show: false, type: 'if_type', float: { decimal: 0 }, editShow: true, tableHidden: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '库存个数', prop: 'totalStockCount', show: false, type: 'number', float: { decimal: 0 }, editShow: true, readonly: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '调出个数', prop: 'count', placeholder: '', show: false, disabledFn: (row) => !row.whetherCount, type: 'number', float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
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
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'shipStoreId', 'readonly', n.some(item => item.goodsCode !== '') || [1].includes(this.$store.getters.accountType))
        // this.mixin_arr_edit_by_prop(this.table_data_arr, 'shipStockId', 'readonly', n.some(item => item.goodsCode !== '') && (!this.currentRow.autoGenerate || this.operateItem.prop === 'insert'))
      },
      deep: true,
      immediate: true
    }
  },
  created() {},
  methods: {
    storeIdCheck(rule, value, callback) {
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (form.shipStoreId === form.receiptStoreId) {
        return callback(new Error('收货门店与发货门店不能相同！'))
      }
      return callback()
    },
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'SendCall'
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
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'shipStoreId', 'readonly', [1].includes(this.$store.getters.accountType) || this.currentRow.autoGenerate)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiptStoreId', 'readonly', this.currentRow.autoGenerate)
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsCode', 'readonly', this.currentRow.autoGenerate && operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsName', 'readonly', this.currentRow.autoGenerate && operateItem.prop !== 'insert')
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'applyNo', 'editShow', this.currentRow.autoGenerate)
      // this.mixin_arr_edit_by_prop(this.table_data_arr, 'applyNo', 'detailShow', this.currentRow.autoGenerate)
      // 新增商品不显示申请信息，只有自动生成显示
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'applyNumber', 'editShow', this.currentRow.autoGenerate && operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'applyCount', 'editShow', this.currentRow.autoGenerate && operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'applyNumber', 'detailShow', this.currentRow.autoGenerate && operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'applyCount', 'detailShow', this.currentRow.autoGenerate && operateItem.prop !== 'insert')

      this.mixin_arr_edit_by_prop(this.table_data_arr, 'totalStockNum', 'editShow', operateItem.prop === 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'totalStockCount', 'editShow', operateItem.prop === 'insert')
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getCallDetails({ 'callNo': this.currentRow.callNo }).then(res => {
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
        // this.mixin_arr_edit_by_prop(this.table_data_arr, 'applyNo', 'editShow', false)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'shipStoreId', 'readonly', [1].includes(this.$store.getters.accountType))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'receiptStoreId', 'readonly', false)
        this.details = []
        getSendNumber({ sendType: 'PSDC' }).then(res => {
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
          this.currentComponent = 'SendCall'
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.callNo = data.Req.callNo
              item.applyCount = ''
              item.applyNumber = ''
            })
          }
          data.sendCallReq = data.Req
          delete data.Req
          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addSendCall(data).then(res => {
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
          addSendCall(data).then(res => {
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
              item.callNo = data.Req.callNo
              item.applyCount = item.applyCount === '-' ? '' : item.applyCount
              item.applyNumber = item.applyNumber === '-' ? '' : item.applyNumber
            })
          }
          data.sendCallReq = data.Req
          delete data.Req
          updateSendCall(data).then(res => {
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
    review(id = null, isSure = false) { // 审核
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
            this.currentComponent = 'SendCall'
            setTimeout(() => {
              this.$refs.Comp.search()
            }, 0)
          }
          this.loading = false
        })
        return
      }
      reviewSendCall({ 'ids': [id || this.currentRow.id], 'auditStatus': '3', isGenerateDelivery: true }).then(res => {
        if (res.code === 200) {
          this.message(res)
        }
      }).catch(err => {
        this.loading = false
        if (this.operateItem.prop === 'insert') {
          this.currentComponent = 'SendCall'
          setTimeout(() => {
            this.$refs.Comp.search()
          }, 0)
        }
        throw err
      })
    },
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除单号「${item.callNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // this.operateItem.loading = true
          deleteDetailById({ ids: [item.id] }).then(res => {
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
