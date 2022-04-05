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
        @tabDateChange="Mixin_tabDate=$event"
        @openModel="openModel"
        @indexPageFormChange="indexPageFormChange"
        @formSave="formSave"
        @deleteDetail="deleteDetail"
        @currentSelect="currentRow=$event"
        @review="review"
      />
    </keep-alive>
  </div>
</template>

<script>
// const dayjs = require('dayjs')
import MixinGlobal from '@/components/MixinGlobal'
import { getDetails, addOrder, updateOrder, deleteDetails, getStoNumber, review } from '@/api/wms/stockinvtask'
// import { addOrder as generateAddOrder, getStoNumber as generateGetStoNumber } from '@/api/wms/stockorder'
import WmsCompForm from '@/views/wms/components/WmsCompForm'
import Order from './stockinvtask'
import dayjs from 'dayjs'
export default {
  name: 'StockTaskIndex',
  components: { WmsCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      detail_table_buttons: [
        { title: '追加', show: true, prop: null, click: 'addItem' },
        { title: '批量添加', show: true, prop: null, click: 'addItems', windowName: 'StoreProductIndex', formProData: { orgId: 0, storeId: '', stockId: '' }}
      ],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:stoInvTask:update:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '盘点任务单号', prop: 'stoInvTaskNo', width: 250, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '盘点计划单号', prop: 'stoInvPlanNo', width: 250, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '盘点日期', prop: 'invTime', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req', defaultValue: dayjs().format('YYYY-MM-DD'),
          rule: [{ required: true, message: '日期不能为空', trigger: 'change' }] },
        { title: '组织', width: 200, prop: 'orgId', readonly: false, show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, tableHidden: [0, 3].includes(this.$store.getters.accountType) ? undefined : true, outTabHidden: true, detailShow: false, addFatherProp: 'Req' },
        { title: '门店', prop: 'storeId', show: true, width: 200, type: 'select', readonly: [1].includes(this.$store.getters.accountType), selectData: 'stores', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : '', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req', fatherProp: 'orgId',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '仓库', prop: 'stockId', width: 200, show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'storeId', editShow: true, detailShow: true, readonly: false, addFatherProp: 'Req' },
        { title: '盘点范围', prop: 'invRange', formItemWidth: 120, width: 150, defaultValue: '2', show: true, type: 'select', selectData: 'inv_range', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '盘点范围不能为空', trigger: 'change' }] },
        // { title: '盘点计划单号', prop: 'stoInvPlanNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '分类列表', prop: 'categoryIds', width: 180, show: true, selectData: 'categoryList', fa_show: { invRange: '1' }, outTabHidden: true, type: 'goodsCategory', editShow: true, detailShow: false, addFatherProp: 'Req',
          rule: [{ validator: this.categoryIdsCheck, trigger: 'change' }] },
        { title: '生成盘点单', prop: 'isGenerateInv', show: true, width: 120, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatus', defaultValue: '1', show: true, width: 100, type: 'selectState', selectData: 'audit_status', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '金额', prop: 'orderAmount', show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '制单人ID', prop: 'creator', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '审核人id', prop: 'reviewerId', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人id', prop: 'modifier', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '打印次数', prop: 'printCount', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '附加备注', prop: 'attachRemark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '盘点任务单号', prop: 'stoInvTaskNo', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '商品代码', prop: 'goodsCode', show: false, click: 'addItems', windowName: 'StoreProductIndex', formProData: { storeId: '', orgId: 0, stockId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, click: 'addItems', windowName: 'StoreProductIndex', formProData: { storeId: '', orgId: 0, stockId: '' }, type: 'selectFromPage', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '规格条码', prop: 'barcode', readonly: true, defaultValue: '-', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '规格', prop: 'spec', show: false, type: 'text', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单位', prop: 'weightType', show: false, type: 'select', selectData: 'weight_type', readonly: true, defaultValue: '-', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '成本价(隐藏)', prop: 'costPrice', readonly: true, show: false, type: 'PRICE', editShow: true, detailShow: false, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '单价', prop: 'price', realProp: 'costPrice', type: 'COST_PRICE', show: false, placeholder: '不可修改', defaultValue: '-', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
        // { title: '数量', prop: 'number', show: false, type: 'weight_number', placeholder: '手动录入', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
        //   rule: [{ validator: this.mixin_check_amount, message: '不能为空或0', trigger: 'change' }] },
        // { title: '个数', prop: 'count', show: false, placeholder: '选填', type: 'number', float: { decimal: 0 }, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'number'], placeholder: '系统计算', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
      ],
      table_data_arr_temp: [],
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
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'invRange', 'readonly', n.some(item => item.goodsCode !== ''))
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
    categoryIdsCheck(rule, value, callback) {
      const form = this.$refs.Comp.$refs.Comp.$refs.Form.form
      if (form.invRange === '1' && value.length === 0) {
        return callback(new Error('分类列表不能为空!'))
      }
      return callback()
    },
    indexPageFormChange(form) { // form变化回调
      if (this.ArrFilter(this.table_data_arr, { prop: 'invRange' })[0].readonly === false) { // invRange可编辑时可变
        this.details = form.invRange === '2' ? [] : null // 单品盘点
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      // this.table_data_arr_temp = this.deepClone(this.table_data_arr) // 原始数据

      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', [1].includes(this.$store.getters.accountType))
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'categoryIds', 'editShow', false)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'invRange', 'readonly', true)
        getDetails({ 'stoInvTaskNo': this.currentRow.stoInvTaskNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      } else if (operateItem.prop === 'insert') { // 新增
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'categoryIds', 'editShow', true)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'invRange', 'readonly', false)
        this.details = []
        getStoNumber({ stoType: 'CC_PDRW' }).then(res => {
          if (res.code === 200) {
            this.table_data_arr[1].defaultValue = res.data
            this.currentComponent = 'WmsCompForm'
            operateItem.loading = false
          }
        })
      }
    },
    formSave(arg, data0 = { Req: {}, detailReqs: [] }) { // 提交回调处理
      const data = this.deepClone(data0)
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
          if (data.detailReqs && data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.stoInvTaskNo = data.Req.stoInvTaskNo
            })
          }
          data.invTaskReq = data.Req
          if (data.invTaskReq.invRange === '1') { // 类别盘点
            data.categoryIds = data.invTaskReq.categoryIds
            data.invTaskReq.categoryName = this.enumGetproplist({ selectData: 'categoryList', selectOption: { value: 'id' }}, data.invTaskReq.categoryIds).map(it => it.name).toString()
          } else {
            data.categoryIds = null
          }
          delete data.invTaskReq.categoryIds
          // data.invTaskReq. = false
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
              item.stoInvTaskNo = data.Req.stoInvTaskNo
            })
          }
          data.invTaskReq = data.Req
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
      // this.table_data_arr = this.table_data_arr_temp
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
        this.$confirm(`此操作将永久删除单号「${item.stoInvTaskNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
