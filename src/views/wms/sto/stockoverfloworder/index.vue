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
        :edit-detail-some-disable="currentRow.autoGenerate"
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
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, deleteDetails, getStoNumber, review } from '@/api/wms/stockoverfloworder'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './overfloworder'
import dayjs from 'dayjs'
export default {
  name: 'StockOverflowOrderIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      if (rule.field === 'count' && this.$refs.Comp.$refs.Comp.$refs.Form.form) {
        const form = this.$refs.Comp.$refs.Comp.$refs.Form.form

        if (form.whetherCount && !form.count) {
          return callback(new Error('个数必填'))
        } else {
          return callback()
        }
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
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { orgId: 0, storeId: '', stockId: '' }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:stoOverflowOrder:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '报溢单号', prop: 'stoOverflowNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '报溢日期', prop: 'overflowDate', width: 160, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, outTabHidden: true, detailShow: false, addFatherProp: 'Req' },
        { title: '报溢门店', prop: 'storeId', width: 200, show: true, type: 'select', readonly: [1].includes(this.$store.getters.accountType), defaultValue: this.$store.getters.storeId, selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '报溢仓库', prop: 'stockId', width: 200, show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'storeId',
          rule: [{ required: true, message: '仓库不能为空', trigger: 'change' }] },
        { title: '报溢类型', formItemWidth: 140, prop: 'overOrderType', width: 150, show: true, type: 'select', selectData: 'over_order_type', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '报损类型不能为空', trigger: 'change' }] },
        { title: '总金额', prop: 'amount', width: 150, show: true, editShow: true, detailShow: true, addFatherProp: 'Req', type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'],
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatus', width: 100, defaultValue: '1', show: true, type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '自动生成', prop: 'autoGenerate', width: 100, show: true, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '制单人ID', prop: 'creator',width:200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', show: true, width: 150, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: true, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '报溢门店', prop: 'store', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '报溢仓库', prop: 'stock', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核人ID', prop: 'reviewerId', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '报溢单号', prop: 'stoOverflowNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, click: 'addItems', windowName: 'StoreProductIndex', formProData: { storeId: '', stockId: '', orgId: 0 }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, click: 'addItems', windowName: 'StoreProductIndex', formProData: { storeId: '', stockId: '', orgId: 0 }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true, defaultValue: '-' },
        { title: '单位', prop: 'weightType', defaultValue: '-', show: false, type: 'select', selectData: 'weight_type', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '仓储数量', prop: 'totalStockNum', defaultValue: '-', show: false, type: 'weight_number', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '报溢数量', prop: 'number', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '成本价(隐藏)', prop: 'costPrice', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', realProp: 'costPrice', show: false, type: 'COST_PRICE', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '报溢金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'number'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '仓储个数', prop: 'totalStockCount', show: false, type: 'number', float: { decimal: 0 }, readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', show: false, readonly: true, type: 'if_type', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '报溢个数', prop: 'count', show: false, type: 'number', placeholder: '计数品必填', float: { decimal: 0 }, disabledFn: (row) => !row.whetherCount, editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: countCheck, trigger: 'change' }] },
        { title: '原因', prop: 'overflowReason', show: false, type: 'select', selectData: 'overflow_reason', selectValueType: 'string', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '附件', prop: 'fileNames', show: false, tableWidth: 100, type: 'fileNames', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
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
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', (n.some(item => item.goodsCode !== '') || [1].includes(this.$store.getters.accountType)))
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'stockId', 'readonly', n.some(item => item.goodsCode !== ''))
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
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'overOrderType', 'readonly', (operateItem.prop === 'edit' && this.currentRow.autoGenerate))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsCode', 'readonly', (operateItem.prop === 'edit' && this.currentRow.autoGenerate))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'goodsName', 'readonly', (operateItem.prop === 'edit' && this.currentRow.autoGenerate))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'number', 'readonly', (operateItem.prop === 'edit' && this.currentRow.autoGenerate))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'count', 'readonly', (operateItem.prop === 'edit' && this.currentRow.autoGenerate))
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'overflowReason', 'readonly', (operateItem.prop === 'edit' && this.currentRow.autoGenerate))

      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', [1].includes(this.$store.getters.accountType))
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'stoOverflowNo': this.currentRow.stoOverflowNo }).then(res => {
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
        getStoNumber({ stoType: 'CC_BY' }).then(res => {
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
              item.stoOverflowNo = data.Req.stoOverflowNo
            })
          }
          data.overflowOrderReq = data.Req
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
              item.stoOverflowNo = data.Req.stoOverflowNo
            })
          }
          data.overflowOrderReq = data.Req
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
        this.$confirm(`此操作将永久删除单号「${item.stoOverflowNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
