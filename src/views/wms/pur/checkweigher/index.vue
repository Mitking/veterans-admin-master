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
        :detail_table_buttons="detail_table_buttons"
        :form-bottons="form_bottons"
        :add_arr="[]"
        :edit-detail-some-disable="true"
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
import { addOrSaveOrder, review, orderNo } from '@/api/wms/purcheckweigher'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './checkweigher'
export default {
  name: 'CheckWeigherIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const countCheck = (rule, value, callback) => { // 数量校验
      if (value < 0) {
        return callback(new Error('不能为负数'))
      }
      let index = rule.field.replace(/[^0-9]/ig, '')
      if (index !== '') {
        index = Number(index)
        if (this.Mixin_tabDate[index].checkNumQuantity && this.Mixin_tabDate[index].whetherCount && !Number(this.Mixin_tabDate[index].checkNumber)) {
          callback(new Error('个数必填'))
        } else if (Number(this.Mixin_tabDate[index].checkNumber) && !this.Mixin_tabDate[index].checkNumQuantity) {
          callback(new Error('有个数时不能为空'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      tabDate: [],
      detail_table_buttons: [],
      form_bottons: [
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatu: 1 }, detailShowArgs: { auditStatu: 1 }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['wms:pur:checkweigher:order:reviewer'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '验秤单号', prop: 'purCheckWeighbeamNo', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '采购单号', prop: 'purOrderNo', show: true, type: 'text', readonly: true, editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '验秤日期', prop: 'checkWeighbeamDate', width: 160, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '验秤日期不能为空', trigger: 'change' }] },
        // { title: '总金额', prop: 'amount', width: 160, show: true, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_total_amount, arg: ['amount'], editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '审核状态', prop: 'auditStatu', width: 100, show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: false },
        { title: '制单人', prop: 'creatorName', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 200, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewerName', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 200, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '更新时间', prop: 'updateTime', width: 200, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // // { title: '修改人id', prop: 'modifier', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // // { title: '修改人', prop: 'modifierName', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        // { title: '供应商名', prop: 'supplierName', show: false, type: 'text', readonly: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品代码', prop: 'goodsCode', show: false, readonly: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, readonly: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '图片名(隐藏)', prop: 'img', show: false, type: 'text', tableHidden: true, editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '商品规格', prop: 'spec', show: false, readonly: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '是否称重', prop: 'whetherWeigh', show: false, readonly: true, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '是否计数', prop: 'whetherCount', show: false, readonly: true, type: 'if_type', selectData: 'weight_type', editShow: true, detailShow: true, tableHidden: true, addFatherProp: 'detailReqs' },
        { title: '采购单位', prop: 'purUnit', show: false, type: 'select', selectData: 'weight_type', editShow: true, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        { title: '采购数量', prop: 'purNumWeight', show: false, readonly: true, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        { title: '验秤个数', prop: 'checkNumber', placeholder: '计数商品必填', defaultValue: '0', tableHidden: true, fn_disabled: (row) => !row.whetherCount, autoForm: ['amount'], focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'amount' }, disabledFn: (row) => !row.whetherCount, show: false, type: 'Number', editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }] },
        { title: '总毛重', prop: 'weight', show: false, fn_disabled: (row) => !row.whetherWeigh, type: 'weight_number', tableHidden: true, autoForm: ['amount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '单件皮重(数量)', autoFormTitleFn: (row) => row.whetherWeigh ? '单件皮重' : '单件数量', prop: 'tareWeight', show: false, type: 'weight_number', tableHidden: true, autoForm: ['amount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '验称件数', prop: 'checkItemNum', show: false, type: 'number', tableHidden: true, autoForm: ['amount'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '验秤数量', prop: 'checkNumQuantity', show: false, type: 'WEIGHT_AUTOMATIC', autoForm: ['amount'], focusFn: this.focusFn, autoFormPropFilter: { autoForm: 'amount' }, placeholder: '系统计算', design: this.mixin_auto_pur_num_weight, arg: ['weight', 'tareWeight', 'checkItemNum', 'whetherWeigh'], editShow: true, detailShow: true, addFatherProp: 'detailReqs',
          rule: [{ required: true, message: '不能为空', trigger: 'change' }, { validator: countCheck, trigger: 'change' }] },
        // { title: '验秤金额', prop: 'amount', show: false, type: 'PRICE_AUTOMATIC', tableHidden: true, autoForm: ['amount'], design: this.mixin_auto_amount, arg: ['checkNumQuantity', 'price'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '差异数量', prop: 'diffNumQuantity', show: false, type: 'WEIGHT_AUTOMATIC', design: this.mixin_auto_pur_weight_diff, arg: ['purNumWeight', 'checkNumQuantity'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        // { title: '采购单价', prop: 'price', show: false, readonly: true, type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '差异金额', prop: 'diffMoney', show: false, type: 'PRICE_AUTOMATIC', design: this.mixin_auto_amount, arg: ['price', 'diffNumQuantity'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        { title: '采购个数', prop: 'purNum', readonly: true, show: false, type: 'Number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },

        { title: '差异个数', prop: 'diffNum', show: false, type: 'NUMBER_AUTOMATIC', design: this.mixin_auto_pur_weight_diff, arg: ['checkNumber', 'purNum'], editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        { title: '采购员', prop: 'purPersonName', show: false, readonly: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }

        // { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
        // { title: '采购单位名称', prop: 'purUnitName', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '图片名', prop: 'img', show: false, type: 'text', editShow: false, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '个数', prop: 'number', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '补货个数', prop: 'addNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '补货件数', prop: 'addPiecesNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '补货毛重', prop: 'addWeight', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '赠送个数', prop: 'giveNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '赠送件数', prop: 'givePiecesNum', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '赠送毛重', prop: 'giveWeight', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
        // { title: '皮重', prop: 'tareWeight', show: false, type: 'number', editShow: true, detailShow: true, addFatherProp: 'detailReqs' },
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
  watch: {},
  created() {},
  methods: {
    focusFn(item, row, index) {
      switch (item.prop) {
        case 'number': case 'price' : case 'supplier': case 'amount':
          if (!row.goodsCode) {
            this.$message.info('请先选择商品')
          }
          this.$refs.Comp.$refs.Comp.$refs.Table.$refs.Form.clearValidate(`details[${index}][${item.prop}]`)
          return !!row.goodsCode
        default:
          return true
      }
    },
    log(e) {

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
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        // getDetails({ 'purCheckWeighbeamNo': this.currentRow.purCheckWeighbeamNo }).then(res => {
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
        orderNo({ type: 'CGYC' }).then(res => {
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
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.purCheckWeighbeamNo = data.Req.purCheckWeighbeamNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data.Req, data)
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
              item.purCheckWeighbeamNo = data.Req.purCheckWeighbeamNo
            })
          }
          data.details = data.detailReqs
          delete data.detailReqs
          data = Object.assign(data.Req, data)
          delete data.Req
          // delete data.orderDetails
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('purCheckWeighbeamNo', this.table_data_arr)}「${item.purCheckWeighbeamNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
