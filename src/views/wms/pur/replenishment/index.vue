<template>
  <div>
    <keep-alive :max="2" exclude="WmsForm">
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
        :edit-detail-some-disable="true"
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
import { addOrSaveOrder, review, orderNo } from '@/api/wms/purreplenishment'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './replenishment'
import dayjs from 'dayjs'
export default {
  name: 'ReplenishmentIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      const index = Number(rule.field.replace(/[^0-9]/ig, ''))
      if (this.Mixin_tabDate[index].whetherCount && !Number(this.Mixin_tabDate[index].number)) {
        callback(new Error('个数必填'))
      } else {
        callback()
      }
    }
    return {
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:replenishment:order:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '补货单号', prop: 'replenishmentOrderNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '差异单号', prop: 'diffOrderNo', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '补货日期', prop: 'purReplenishDate', show: true, type: 'date', defaultValue: dayjs().format('YYYY-MM-DD'), width: 160, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '补货日期不能为空', trigger: 'change' }] },
        { title: '采购员', prop: 'purPerson', readonly: true, show: true, width: 160, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '总金额', prop: 'purReplenishMoney', show: true, type: 'PRICE', width: 160, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '总金额', prop: 'totalAmount', show: true, type: 'PRICE_AUTOMATIC', width: 160, design: this.mixin_auto_total_amount, arg: ['replenishMoney'], tabHidden: true, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '自动生成', prop: 'autoGenerate', show: true, type: 'if_type', width: 100, editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '审核状态', prop: 'auditStatu', show: true, type: 'selectState', width: 160, selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '是否失效', prop: 'orderInvalid', width: 100, show: true, type: 'if_type', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', show: true, type: 'date', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', show: true, type: 'date', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '修改人', prop: 'modifierName', show: true, type: 'text', width: 160, editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', show: true, type: 'text', width: 200, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '补货单号', prop: 'replenishmentOrderNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, autoForm: ['replenishNumQuantity'], type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        { title: '单价', prop: 'price', show: false, type: 'COST_PRICE', autoForm: ['replenishNumQuantity'], editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '供应商名', prop: 'supplierName', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },

        { title: '是否称重', prop: 'whetherWeight', show: false, readonly: true, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', show: false, readonly: true, type: 'if_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },

        { title: '应补数量', prop: 'preReplenishNum', show: false, type: 'weight_number', editShow: true, autoForm: ['replenishNumQuantity'], detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '补货毛重', prop: 'replenishWeight', placeholder: '手动录入', fn_disabled: (row) => !row.whetherWeight, tableHidden: true, autoForm: ['replenishNumQuantity'], show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单件皮重', autoFormTitleFn: (row) => row.whetherWeigh ? '单件皮重' : '单件数量', prop: 'replenishTareWeight', show: false, type: 'weight_number', placeholder: '手动录入', tableHidden: true, autoForm: ['replenishNumQuantity'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '补货件数', prop: 'replenishPiecesNum', show: false, type: 'Number', placeholder: '手动录入', tableHidden: true, autoForm: ['replenishNumQuantity'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '补货数量', prop: 'replenishNumQuantity', show: false, focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'replenishNumQuantity' }, autoForm: ['replenishNumQuantity'], type: 'WEIGHT_AUTOMATIC', design: this.mixin_auto_pur_num_weight, arg: ['replenishWeight', 'replenishTareWeight', 'replenishPiecesNum', 'whetherWeight'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: this.mixin_check_amount, message: '不能为空', trigger: 'change' }] },
        { title: '未补数量', prop: 'diffNumQuantity', show: false, type: 'WEIGHT_AUTOMATIC', autoForm: ['replenishNumQuantity'], tableHidden: true, design: this.mixin_auto_pur_weight_diff, arg: ['replenishNumQuantity', 'preReplenishNum'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '应补金额', prop: 'preReplenishMoney', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '补货金额', prop: 'replenishMoney', show: false, type: 'PRICE_AUTOMATIC', focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'replenishNumQuantity' }, autoForm: ['replenishNumQuantity'], design: this.mixin_auto_amount, arg: ['replenishNumQuantity', 'price'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '未补金额', prop: 'diffMoney', show: false, type: 'PRICE_AUTOMATIC', autoForm: ['replenishNumQuantity'], tableHidden: true, design: this.mixin_auto_pur_weight_diff, arg: ['replenishMoney', 'preReplenishMoney'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '补货个数', prop: 'replenishNum', disabledFn: (row) => !row.whetherCount, show: false, defaultValue: '0', type: 'Number', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ validator: countCheck, trigger: 'change' }] },
        { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      tabDate: [],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsForm')
      return this.currentComponent === 'WmsForm'
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
        case 'replenishNumQuantity': case 'replenishMoney' : case 'supplierName': case 'addNumWeight':case 'giveNumWeight':
          if (!row.goodsCode) {
            this.$message.info('请先选择商品')
          }
          this.$refs.Comp.$refs.Table.$refs.Form.clearValidate(`details[${index}][${item.prop}]`)
          return !!row.goodsCode
        default:
          return true
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        // getDetails({ 'replenishmentOrderNo': this.currentRow.replenishmentOrderNo }).then(res => {
        //   if (res.code === 200) {
        this.currentRow.details.map(item => { item.replenishNum = item.replenishNum || 0 })
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
        orderNo({ type: 'CGBH' }).then(res => {
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
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.replenishmentOrderNo = data.Req.replenishmentOrderNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteDetails = []

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
        case 'edit': // 修改
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.replenishmentOrderNo = data.Req.replenishmentOrderNo
            })
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('replenishmentOrderNo', this.table_data_arr)}「${item.replenishmentOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
